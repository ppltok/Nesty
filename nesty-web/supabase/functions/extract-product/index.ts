import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractRequest {
  url: string
}

// SSRF guard: true if the hostname points at a private/internal host, a
// reserved IP range, or uses a numeric-IP trick (decimal/octal/hex) instead
// of a plausible public DNS name or public IP.
function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')

  // Obvious internal names
  if (host === 'localhost' || host.endsWith('.localhost')) return true
  if (host.endsWith('.local') || host.endsWith('.internal')) return true

  // IPv6 (URL keeps the brackets, e.g. "[::1]")
  if (host.startsWith('[') || host.includes(':')) {
    const v6 = host.replace(/^\[|\]$/g, '')
    if (v6 === '::' || v6 === '::1') return true
    if (/^f[cd]/.test(v6)) return true // fc00::/7 (unique local)
    if (/^fe[89ab]/.test(v6)) return true // fe80::/10 (link-local)
    if (v6.startsWith('::ffff:')) return isPrivateHostname(v6.slice(7)) // v4-mapped
    return false
  }

  const labels = host.split('.')

  // Plain dotted-quad IPv4 - allow public ranges, reject private/reserved.
  // Leading zeros (octal ambiguity) are rejected below via the numeric check.
  if (labels.length === 4 && labels.every((l) => /^(0|[1-9]\d{0,2})$/.test(l))) {
    const octets = labels.map(Number)
    if (octets.some((o) => o > 255)) return true // malformed
    const [a, b] = octets
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    return false
  }

  // Numeric-IP tricks: every label is decimal/octal/hex (e.g. 2130706433,
  // 017700000001, 0x7f.0.0.1). No legitimate public site uses these.
  if (labels.every((l) => /^(0x[0-9a-f]+|\d+)$/.test(l))) return true

  // Plausible public DNS name: has a dot and an alphabetic-start TLD.
  if (!host.includes('.')) return true
  if (!/^[a-z]/.test(labels[labels.length - 1])) return true

  return false
}

// The check above is purely lexical, so "shop.example.com" passes even when
// its A record points at 127.0.0.1 or 169.254.169.254 (the cloud metadata
// endpoint). Resolve the name and judge the ADDRESS, not the string.
//
// Resolution goes through Deno.resolveDns when the runtime exposes it and
// falls back to DNS-over-HTTPS otherwise.
async function resolveHostIps(hostname: string): Promise<string[] | null> {
  const ips: string[] = []

  // deno-lint-ignore no-explicit-any
  const denoAny = Deno as any
  if (typeof denoAny.resolveDns === 'function') {
    for (const kind of ['A', 'AAAA'] as const) {
      try {
        const recs = await denoAny.resolveDns(hostname, kind)
        if (Array.isArray(recs)) ips.push(...recs)
      } catch {
        // NXDOMAIN for one record type is normal - keep going.
      }
    }
    if (ips.length > 0) return ips
  }

  // DNS-over-HTTPS fallback (Cloudflare). type 1 = A, 28 = AAAA.
  try {
    for (const type of ['A', 'AAAA']) {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`,
        { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(4000) },
      )
      if (!res.ok) continue
      const body = await res.json()
      for (const ans of body?.Answer ?? []) {
        if (ans?.type === 1 || ans?.type === 28) ips.push(String(ans.data))
      }
    }
  } catch {
    // fall through
  }

  return ips.length > 0 ? ips : null
}

/**
 * Reject when the hostname is lexically internal OR resolves to a
 * private/reserved address.
 *
 * If resolution yields nothing we fall back to the lexical verdict rather
 * than hard-failing: a name that genuinely does not resolve will fail the
 * fetch anyway, and a DoH outage would otherwise take the paste-URL feature
 * down for everyone.
 */
async function isBlockedTarget(hostname: string): Promise<boolean> {
  if (isPrivateHostname(hostname)) return true

  const ips = await resolveHostIps(hostname)
  if (!ips) {
    console.warn(`[extract-product] could not resolve ${hostname}; lexical check only`)
    return false
  }
  const bad = ips.find((ip) => isPrivateHostname(ip))
  if (bad) {
    console.warn(`[extract-product] ${hostname} resolves to non-public address ${bad}`)
    return true
  }
  return false
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url }: ExtractRequest = await req.json()

    // Validate URL
    if (!url) {
      throw new Error('URL is required')
    }

    // Parse and validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Whitelist protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed')
    }

    // Block private/internal hosts (SSRF) - lexically AND by resolved address
    if (await isBlockedTarget(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL points to a private or internal host' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Follow redirects by hand so EVERY hop is validated. Letting fetch
    // follow them and only checking the final URL leaves the intermediate
    // hops unchecked, and a redirect chain is the easiest way to reach an
    // internal address from an innocent-looking starting URL.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let currentUrl = parsedUrl.toString()
    let response: Response
    const MAX_REDIRECTS = 5

    try {
      for (let hop = 0; ; hop++) {
        response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        const location = response.headers.get('location')
        if (response.status < 300 || response.status >= 400 || !location) break

        if (hop >= MAX_REDIRECTS) {
          throw new Error('Too many redirects')
        }

        const next = new URL(location, currentUrl)
        if (!['http:', 'https:'].includes(next.protocol)) {
          throw new Error('Redirect to a non-HTTP protocol was blocked')
        }
        if (await isBlockedTarget(next.hostname)) {
          return new Response(
            JSON.stringify({ success: false, error: 'URL redirected to a private or internal host' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          )
        }
        currentUrl = next.toString()
      }
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    return new Response(
      JSON.stringify({ success: true, html, finalUrl: currentUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error fetching URL:', error)

    let errorMessage = 'Failed to fetch URL'
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out'
    } else if (error.message) {
      errorMessage = error.message
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

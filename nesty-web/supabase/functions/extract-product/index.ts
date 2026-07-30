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

    // Block private/internal hosts (SSRF)
    if (isPrivateHostname(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL points to a private or internal host' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Fetch external URL with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    clearTimeout(timeoutId)

    // fetch follows redirects by default - reject if the final URL landed on
    // a private/internal host (SSRF via redirect)
    if (isPrivateHostname(new URL(response.url).hostname)) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL redirected to a private or internal host' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    return new Response(
      JSON.stringify({ success: true, html, finalUrl: response.url }),
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

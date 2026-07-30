import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Public click-tracking redirect for every Nesty email.
//
//   /functions/v1/email-click?d=<destination>&t=<email_type>&u=<user_id>&l=<link>
//
// Logs one email_events row, then 302s to the destination with UTM params
// appended, so the click is visible both in SQL (exact, per user) and in
// GA/GTM (aggregate). Must be deployed with --no-verify-jwt - it is opened
// straight from a mail client with no Authorization header.
//
// SECURITY: `d` comes from the query string, so this is an open-redirect risk.
// Only hosts on ALLOWED_HOSTS are honoured; anything else falls back to the
// site root. Never relax this to a substring/startsWith check on the full URL -
// "https://nestyil.com.evil.tld" would pass. We compare parsed hostnames.

const FALLBACK_URL = 'https://nestyil.com'

const ALLOWED_HOSTS = new Set([
  'nestyil.com',
  'www.nestyil.com',
])

function safeDestination(raw: string | null): string {
  if (!raw) return FALLBACK_URL
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return FALLBACK_URL
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return FALLBACK_URL
  if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) return FALLBACK_URL
  return parsed.toString()
}

serve(async (req) => {
  const url = new URL(req.url)
  const emailType = url.searchParams.get('t') || 'unknown'
  const userId = url.searchParams.get('u') || null
  const link = url.searchParams.get('l') || 'cta'

  const destination = safeDestination(url.searchParams.get('d'))

  // Attach UTM so the same click is attributable in GA/GTM too. Don't clobber
  // UTM params the destination already carries.
  const final = new URL(destination)
  if (!final.searchParams.has('utm_source')) {
    final.searchParams.set('utm_source', 'email')
    final.searchParams.set('utm_medium', emailType)
    final.searchParams.set('utm_content', link)
  }

  // Best-effort logging - a tracking failure must never block the redirect.
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    await supabaseAdmin.from('email_events').insert({
      event_type: 'click',
      email_type: emailType,
      link,
      destination: final.toString(),
      user_id: userId,
      user_agent: req.headers.get('user-agent'),
    })
  } catch (err) {
    console.error('email-click log error:', err)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: final.toString(),
      'Cache-Control': 'no-store, max-age=0',
    },
  })
})

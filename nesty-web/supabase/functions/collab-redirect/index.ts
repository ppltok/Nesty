import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Public click-tracking redirect for partner-perk ("collab") emails.
//
// Email CTAs point here instead of straight at the partner link, so we can log
// a per-user click before forwarding. Logs one collab_events row, then 302s to
// the partner's redeem URL. Must be deployed with --no-verify-jwt (it's opened
// straight from an email client, with no Authorization header).
//
//   /functions/v1/collab-redirect?c=supherb&u=<user_id>&s=email&to=gifts
//
// `c`  (collab)      selects the partner redeem link from REDEEM_URLS below.
// `to` (destination) picks where we land after logging the click:
//        'gifts'  → the Nesty in-app gifts page (email funnels users here; the
//                   code + partner redirect live inside the popup/card)
//        default  → the partner redeem link (direct redemption)

// Each partner perk carries its own end date. Emails live in inboxes long
// after a campaign closes - roughly 1,900 Supherb emails are still out there -
// and forwarding those clicks to the partner would land people on a checkout
// page promising a discount whose code no longer works. Once `endsAt` passes we
// keep logging the click but send them to Nesty's gifts page instead.
const COLLABS: Record<string, { redeemUrl: string; endsAt: string }> = {
  supherb: { redeemUrl: 'https://bit.ly/4g1uf7v', endsAt: '2026-07-31T23:59:59+03:00' },
}

const GIFTS_PAGE_URL = 'https://nestyil.com/gifts'
const FALLBACK_URL = 'https://nestyil.com/gifts'

serve(async (req) => {
  const url = new URL(req.url)
  const collab = (url.searchParams.get('c') || '').toLowerCase()
  const userId = url.searchParams.get('u') || null
  const source = url.searchParams.get('s') || 'email'
  const to = url.searchParams.get('to') || ''

  const config = COLLABS[collab]
  const expired = config ? Date.now() >= new Date(config.endsAt).getTime() : true

  const destination = (to === 'gifts' || expired || !config)
    ? GIFTS_PAGE_URL
    : (config.redeemUrl || FALLBACK_URL)

  // Best-effort logging - a tracking failure must never block the redirect.
  try {
    if (collab) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      await supabaseAdmin.from('collab_events').insert({
        collab,
        event_type: 'email_link_click',
        source,
        user_id: userId,
        user_agent: req.headers.get('user-agent'),
        // Post-campaign clicks still tell us the emails are being read; flag
        // them so they don't get counted as redemptions in the funnel.
        meta: expired ? { expired: true } : null,
      })
    }
  } catch (err) {
    console.error('collab-redirect log error:', err)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      // Don't let proxies/browsers cache the redirect - every open is a click.
      'Cache-Control': 'no-store, max-age=0',
    },
  })
})

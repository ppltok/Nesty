import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Open-tracking pixel for partner-perk ("collab") emails. Resend's own open
// tracking is disabled account-wide, so we embed a 1x1 transparent GIF that
// points here; loading it logs an `email_open` event to collab_events, then we
// return the pixel. Must be deployed with --no-verify-jwt (loaded by mail
// clients with no Authorization header).
//
//   /functions/v1/collab-open?c=supherb&u=<user_id>
//
// Caveats (inherent to all pixel tracking): image-blocking clients undercount;
// Apple Mail Privacy Protection pre-fetches and inflates; Gmail proxies images.
// Treat opens as directional, not exact. Clicks (collab-redirect) are exact.

// 1x1 transparent GIF
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
])

serve(async (req) => {
  const url = new URL(req.url)
  const collab = (url.searchParams.get('c') || '').toLowerCase()
  const userId = url.searchParams.get('u') || null

  try {
    if (collab) {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
      await admin.from('collab_events').insert({
        collab,
        event_type: 'email_open',
        source: 'email',
        user_id: userId,
        user_agent: req.headers.get('user-agent'),
      })
    }
  } catch (err) {
    console.error('collab-open log error:', err)
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  })
})

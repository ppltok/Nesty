import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Public open-tracking pixel for every Nesty email.
//
//   /functions/v1/email-open?t=<email_type>&u=<user_id>
//
// Returns a 1x1 transparent GIF and logs one email_events row. Must be
// deployed with --no-verify-jwt (loaded by a mail client, no auth header).
//
// Caveat worth remembering when reading the numbers: image-blocking undercounts
// and Apple Mail Privacy Protection / Gmail proxy prefetching inflates. Opens
// are directional; clicks (email-click) are the exact signal.

// 1x1 transparent GIF
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
])

serve(async (req) => {
  const url = new URL(req.url)
  const emailType = url.searchParams.get('t') || 'unknown'
  const userId = url.searchParams.get('u') || null

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    await supabaseAdmin.from('email_events').insert({
      event_type: 'open',
      email_type: emailType,
      user_id: userId,
      user_agent: req.headers.get('user-agent'),
    })
  } catch (err) {
    console.error('email-open log error:', err)
  }

  return new Response(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildUnsubscribeUrl } from '../_shared/unsubscribe-url.ts'
import { renderLegalFooter } from '../_shared/legal-footer.ts'

// Nesty × Supherb partner-gift email ("we have a gift for you").
//
// First real partner perk. Two modes (POST body { mode }):
//   'test' (default) — send ONLY to TEST_EMAILS, ignore consent + dedup, so the
//                       team can re-send while verifying. The 3 internal accounts.
//   'all'            — send to consented users (marketing_emails +
//                       email_feature_announcements + onboarding_completed),
//                       dedup against email_logs, honour an optional { limit }
//                       so the rollout can be spread across batches/hours.
//
// Every CTA points at the collab-redirect function (NOT bit.ly directly) so each
// click is logged per-user in collab_events. We also log an `email_sent` row per
// successful send, and an email_logs row for dedup.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COLLAB = 'supherb'
const COLLAB_KEY = 'collab_supherb' // email_logs.email_type — dedup key
const SUBJECT = '15% הנחה נוספים בסופהרב 🌿 הטבה בלעדית למשתמשות Nesty'
const TEST_EMAILS = ['tomargov73@gmail.com', 'tom@ppltok.com', 'hello@nestyil.com']

// The email funnels users to the in-app gifts page (where the code + partner
// redirect live). The click is still tracked via collab-redirect.
function giftsUrl(userId: string): string {
  return `${SUPABASE_URL}/functions/v1/collab-redirect?c=${COLLAB}&u=${userId}&s=email&to=gifts`
}

function buildEmailHtml(firstName: string, gifts: string, unsubscribeUrl: string): string {
  const hi = firstName ? `${firstName}, ` : ''
  const footer = renderLegalFooter({
    unsubscribeLinkHtml: `<a href="${unsubscribeUrl}" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>`,
  })
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>${SUBJECT}</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#eef2ee;font-family:'Heebo',sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ee;direction:rtl;">
  <tr>
    <td align="center" style="padding:40px 16px 64px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;direction:rtl;">

        <!-- HEADER -->
        <tr>
          <td style="padding-bottom:28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="https://nestyil.com" style="text-decoration:none;">
                    <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:40px;width:auto;display:block;" />
                  </a>
                </td>
                <td align="left">
                  <span style="font-size:15px;color:#4e7a5a;font-weight:700;letter-spacing:0.04em;">הטבה בשבילך 🌿</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO — Supherb green -->
        <tr>
          <td style="background:linear-gradient(135deg,#25402c 0%,#4e7a5a 60%,#93bd9e 100%);border-radius:24px;padding:48px 40px 44px;text-align:center;">
            <!-- co-brand lockup: Supherb logo white pill × Nesty -->
            <div style="display:inline-block;background:#ffffff;border-radius:100px;padding:10px 22px;margin-bottom:24px;">
              <img src="https://nestyil.com/demo/supherb-logo.png" alt="Supherb" style="height:22px;width:auto;vertical-align:middle;" />
              <span style="font-size:16px;color:#4e7a5a;font-weight:700;vertical-align:middle;">&nbsp;&nbsp;×&nbsp;&nbsp;</span>
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:22px;width:auto;vertical-align:middle;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              15% הנחה נוספים בסופהרב 🌿
            </h1>
            <p style="margin:0;font-size:16px;color:#ffffffe6;line-height:1.8;font-weight:400;max-width:460px;margin-left:auto;margin-right:auto;">
              ${hi}כל אישה בהריון צריכה תוספי תזונה — אז חברנו ל-<strong style="color:#fff;">Supherb</strong>, יצרנית תוספי הבריאות הגדולה בישראל.
              עכשיו את יכולה ליהנות מ-15% הנחה נוספים על כל האתר, בנוסף על מבצעים קיימים באתר. 🌿
            </p>
          </td>
        </tr>

        <tr><td style="height:14px;"></td></tr>

        <!-- TEASER CARD: no code here — the benefit opens inside Nesty -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #dcebe0;text-align:center;">
            <div style="display:inline-block;background:#e8f1ea;border:1px solid #bcd6c2;border-radius:100px;padding:6px 16px;margin-bottom:20px;">
              <span style="font-size:12px;font-weight:700;color:#25402c;">✦ הטבה בלעדית למשתמשות Nesty</span>
            </div>

            <div style="margin:0 auto 18px;width:96px;height:96px;background:#ebe7e3;border:1px solid #dcebe0;border-radius:20px;line-height:96px;">
              <img src="https://nestyil.com/demo/supherb-tabingum.png" alt="Supherb טאבינגאם" style="width:84px;height:84px;object-fit:contain;vertical-align:middle;" />
            </div>

            <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1f3a26;">15% הנחה נוספים על כל האתר</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#4e7a5a;line-height:1.7;">ההטבה מחכה לך ב-Nesty — היכנסי לצפות בה ולקבל את הקוד שלך. 🌿</p>

            <a href="${gifts}" style="display:block;background:#35573D;color:#ffffff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 32px;border-radius:100px;text-align:center;">למימוש ההטבה</a>

            <p style="margin:18px 0 0;font-size:12px;color:#b3261e;font-weight:700;">⏳ בתוקף עד 31.7.2026 — אל תפספסי</p>
          </td>
        </tr>

        <tr><td style="height:14px;"></td></tr>

        <!-- REFERRAL -->
        <tr>
          <td style="background:#f4f9f5;border:1px dashed #93bd9e;border-radius:20px;padding:24px 32px;text-align:center;">
            <p style="margin:0;font-size:14px;line-height:1.8;color:#25402c;">
              מכירה עוד מישהי בהריון? שלחי לה את <strong style="color:#35573D;">Nesty</strong> 🌿 ותגלו יחד עוד הטבות וקופונים.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            ${footer}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

interface Recipient { id: string; email: string; first_name: string | null }

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')

    const body = await req.json().catch(() => ({}))
    const mode: 'test' | 'all' = body.mode === 'all' ? 'all' : 'test'
    const limit: number | null = typeof body.limit === 'number' ? body.limit : null

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    let recipients: Recipient[] = []

    if (mode === 'test') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, first_name')
        .in('email', TEST_EMAILS)
      if (error) throw error
      recipients = (data ?? []) as Recipient[]
    } else {
      // Warmest-first daily batch: the RPC returns consented users not yet sent
      // this campaign, ordered Champions → Super → Active → Started → User,
      // capped at the batch size (default 100/day).
      const { data, error } = await supabaseAdmin.rpc('get_collab_gift_recipients', {
        p_email_type: COLLAB_KEY,
        p_limit: limit && limit > 0 ? limit : 100,
      })
      if (error) throw error
      recipients = ((data ?? []) as Recipient[]).map((u) => ({
        id: u.id, email: u.email, first_name: u.first_name,
      }))
    }

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0, mode, message: 'No eligible recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`send-collab-gift mode=${mode} → ${recipients.length} recipients`)

    let sent = 0
    let errors = 0

    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10)
      const promises = batch.map(async (user) => {
        try {
          const unsubUrl = await buildUnsubscribeUrl(user.id, 'features')
          const html = buildEmailHtml(user.first_name ?? '', giftsUrl(user.id), unsubUrl)
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [user.email],
              subject: SUBJECT,
              html,
              headers: {
                'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }),
          })

          if (res.ok) {
            sent++
            // Funnel event for the Collabs dashboard.
            await supabaseAdmin.from('collab_events').insert({
              collab: COLLAB,
              event_type: 'email_sent',
              source: 'email',
              user_id: user.id,
              email: user.email.toLowerCase(),
              meta: { mode },
            })
            // Dedup log (only for the real rollout — test mode stays re-sendable).
            if (mode === 'all') {
              await supabaseAdmin.from('email_logs').insert({
                recipient_email: user.email.toLowerCase(),
                email_type: COLLAB_KEY,
                subject: SUBJECT,
                status: 'sent',
                sent_at: new Date().toISOString(),
                provider: 'resend',
              })
            }
            console.log(`Sent to ${user.email}`)
          } else {
            console.error(`Failed for ${user.email}:`, await res.json())
            errors++
          }
        } catch (err) {
          console.error(`Error sending to ${user.email}:`, err)
          errors++
        }
      })
      await Promise.all(promises)
      if (i + 10 < recipients.length) await new Promise((r) => setTimeout(r, 1000))
    }

    return new Response(JSON.stringify({ sent, errors, mode, total: recipients.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('send-collab-gift error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

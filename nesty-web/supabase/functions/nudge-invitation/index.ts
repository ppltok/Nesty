import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { trackedUrl, openPixelTag } from '../_shared/email-tracking.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const WEB_URL = Deno.env.get('WEB_URL') || 'https://nestyil.com'

// Co-parent invitees usually have no Nesty account, so the HMAC unsubscribe
// helper (which is keyed to a profiles row) can't be used here. Israeli law
// only requires *a* working opt-out channel, so we use mailto both as the
// visible link and as the List-Unsubscribe header (Gmail renders it natively).
const UNSUB_MAILTO = 'mailto:hello@nestyil.com?subject=הסרה%20מתזכורות'

const TEST_EMAILS = ['tomargov73@gmail.com', 'tom@ppltok.com', 'hello@nestyil.com']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatDate(d: Date): string {
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

interface NudgeTemplateOpts {
  ownerName: string
  itemCount: number
  inviteUrl: string
  expiryLabel: string
}

/**
 * Re-activation template for a pending co-parent invite.
 *
 * The headline leads with the live item count because that is the most
 * persuasive true fact available ("you are locked out of something already
 * moving"). Registries with no items yet fall back to a neutral headline —
 * "כבר יש 0 פריטים" would read as absurd.
 */
function buildNudgeHtml(opts: NudgeTemplateOpts): string {
  const { ownerName, itemCount, inviteUrl, expiryLabel } = opts
  const T = 'invite_reminder'
  const ctaUrl = trackedUrl(inviteUrl, { emailType: T, userId: null, link: 'cta' })
  const headline = itemCount > 0
    ? `כבר יש <span style="background:#ffd98a;color:#5c3d00;border-radius:10px;padding:2px 12px;">${itemCount} פריטים</span> ברשימה של ${ownerName}`
    : `הרשימה של ${ownerName} מחכה לכם`
  const subhead = itemCount > 0
    ? 'ואתם עדיין לא רואים אותם. ההזמנה שלכם לנהל את הרשימה ביחד עדיין פתוחה - חידשנו לכם את הקישור.'
    : 'ההזמנה שלכם לנהל את הרשימה ביחד עדיין פתוחה - חידשנו לכם את הקישור.'

  const benefit = (bg: string, color: string, icon: string, title: string, text: string, last = false) => `
              <tr>
                <td width="60" valign="top" style="padding:0 0 ${last ? '0' : '18px'};">
                  <div style="width:46px;height:46px;border-radius:14px;background:${bg};text-align:center;line-height:46px;font-size:22px;">${icon}</div>
                </td>
                <td valign="top" style="padding:4px 0 ${last ? '0' : '18px'};">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:${color};">${title}</p>
                  <p style="margin:0;font-size:14px;color:#7a6090;line-height:1.8;">${text}</p>
                </td>
              </tr>`

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#f5f0fa;font-family:'Heebo',sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0fa;direction:rtl;">
  <tr>
    <td align="center" style="padding:40px 16px 64px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;direction:rtl;">

        <tr>
          <td style="padding-bottom:28px;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:40px;width:auto;display:block;" />
            </a>
          </td>
        </tr>

        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:48px 40px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:20px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:56px;width:56px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.45;">
              ${headline}
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:#ffffffd9;line-height:1.8;max-width:400px;margin-left:auto;margin-right:auto;">
              ${subhead}
            </p>
            <a href="${ctaUrl}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:100px;">הצטרפו לרשימה</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <h2 style="margin:0 0 22px;font-size:18px;font-weight:700;color:#3b1f6b;text-align:center;">
              מה אתם מקבלים כשאתם מצטרפים
            </h2>

            <table width="100%" cellpadding="0" cellspacing="0" style="direction:rtl;">
${benefit('#ede2fb', '#6a35b0', '🪺', 'את הרשימה המלאה, בכל רגע', 'כל מה שכבר נוסף, מה עוד חסר, ומה הכי דחוף. בלי לשאול ובלי צילומי מסך.')}
${benefit('#fde4dc', '#c0563a', '🎁', 'התראה על כל מתנה שמגיעה', 'כשמישהו קונה משהו מהרשימה, שניכם יודעים. בלי כפילויות, ובלי לשכוח להגיד תודה.')}
${benefit('#d9f2ed', '#1f7d70', '✨', 'להוסיף מוצרים מכל אתר', 'מהמחשב, מהנייד או עם התוסף לכרום - מה שמצאתם נכנס לרשימה בלחיצה.')}
${benefit('#fce7f3', '#b03a6e', '💜', 'להחליט ביחד, לא לקבל דיווח', 'לערוך, לעדכן כמויות ולסמן מה חשוב - לשניכם יש בדיוק אותן הרשאות.', true)}
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="background:#f7f2fd;border-radius:14px;padding:14px 20px;text-align:center;">
                  <p style="margin:0;font-size:13px;color:#7a6090;line-height:1.8;">
                    ההצטרפות לוקחת פחות מדקה &nbsp;·&nbsp; הקישור פעיל עד
                    <strong style="color:#6a35b0;">${expiryLabel}</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 14px;font-size:13px;color:#a087c0;">בונים קן, לא מחסן 💜</p>

            <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">
              נשלח על ידי <strong style="color:#7c4dbd;">Babu Capital Ltd</strong>
              &nbsp;·&nbsp;
              <a href="mailto:hello@nestyil.com" style="color:#9070b8;text-decoration:underline;">hello@nestyil.com</a>
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:#bca8d4;">
              באבו קפיטל בע"מ (Babu Capital Ltd) · נסטי / Nesty
            </p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              <a href="${UNSUB_MAILTO}" style="color:#9070b8;text-decoration:underline;">לא מעוניינים לקבל תזכורות</a>
              &nbsp;·&nbsp;
              <a href="https://nestyil.com/privacy" style="color:#9070b8;text-decoration:underline;">מדיניות פרטיות</a>
              &nbsp;·&nbsp;
              <a href="https://nestyil.com" style="color:#9070b8;text-decoration:underline;">nestyil.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
${openPixelTag({ emailType: T, userId: null })}
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')

    const body = await req.json().catch(() => ({}))
    // 'daily'   — rolling 24-48h window, the ongoing cron behaviour
    // 'backlog' — every pending invite regardless of age; one-shot re-activation
    // 'test'    — renders the template with sample data to TEST_EMAILS, touches no real invite
    //
    // 'daily' MUST stay the default: .github/workflows/scheduled-emails.yml calls
    // this endpoint every day with no request body at all. Defaulting to 'test'
    // silently turned that existing job into a daily blast at TEST_EMAILS.
    // Test mode is opt-in only, never a fallback.
    const mode: 'test' | 'backlog' | 'daily' =
      body.mode === 'backlog' ? 'backlog'
      : body.mode === 'test' ? 'test'
      : 'daily'

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    // ---- test mode: sample render only, no production rows touched ----
    if (mode === 'test') {
      const expiryLabel = formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
      const itemCount = typeof body.itemCount === 'number' ? body.itemCount : 12
      let sent = 0
      for (const email of TEST_EMAILS) {
        const html = buildNudgeHtml({
          ownerName: 'נעמה',
          itemCount,
          inviteUrl: `${WEB_URL}/invite/SAMPLE-TOKEN`,
          expiryLabel,
        })
        const subject = itemCount > 0
          ? `כבר יש ${itemCount} פריטים ברשימה של נעמה 💜`
          : 'ההזמנה של נעמה לרשימה ב-Nesty עדיין פתוחה 💜'
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Nesty <hello@nestyil.com>',
            to: [email],
            subject,
            html,
            headers: { 'List-Unsubscribe': `<${UNSUB_MAILTO}>` },
          }),
        })
        if (res.ok) sent++
        else console.error('test send failed', email, await res.text())
      }
      return new Response(JSON.stringify({ mode, sent, total: TEST_EMAILS.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ---- real modes ----
    let query = supabaseAdmin
      .from('registry_invitations')
      .select('id, registry_id, invited_by, invited_email, invitation_token, created_at, expires_at')
      .eq('status', 'pending')

    if (mode === 'daily') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      query = query.lt('created_at', dayAgo).gt('created_at', twoDaysAgo)
    }

    const { data: invitations, error: queryError } = await query
    if (queryError) throw queryError

    if (!invitations || invitations.length === 0) {
      return new Response(JSON.stringify({ mode, nudged: 0, message: 'No pending invitations' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let nudged = 0
    let skippedExpired = 0

    for (const invitation of invitations) {
      try {
        // An invite whose token already lapsed would land the recipient on an
        // error page AND flip the row to 'expired', permanently killing it.
        // Never email one of those — refresh expires_at first.
        if (!invitation.expires_at || new Date(invitation.expires_at) <= new Date()) {
          console.log(`Skipping ${invitation.invited_email}: token expired`)
          skippedExpired++
          continue
        }

        const { data: ownerProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', invitation.invited_by)
          .single()

        const ownerName = ownerProfile
          ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || 'בן/בת הזוג שלכם'
          : 'בן/בת הזוג שלכם'

        const { count } = await supabaseAdmin
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('registry_id', invitation.registry_id)

        const items = count ?? 0
        const html = buildNudgeHtml({
          ownerName,
          itemCount: items,
          inviteUrl: `${WEB_URL}/invite/${invitation.invitation_token}`,
          expiryLabel: formatDate(new Date(invitation.expires_at)),
        })
        const subject = items > 0
          ? `כבר יש ${items} פריטים ברשימה של ${ownerName} 💜`
          : `ההזמנה של ${ownerName} לרשימה ב-Nesty עדיין פתוחה 💜`

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Nesty <hello@nestyil.com>',
            to: [invitation.invited_email],
            subject,
            html,
            headers: { 'List-Unsubscribe': `<${UNSUB_MAILTO}>` },
          }),
        })

        if (res.ok) {
          nudged++
          console.log(`Nudged ${invitation.invited_email} (${items} items)`)
        } else {
          console.error(`Resend failed for ${invitation.invited_email}:`, await res.text())
        }
      } catch (innerErr) {
        console.error(`Error nudging invitation ${invitation.id}:`, innerErr)
      }
    }

    return new Response(
      JSON.stringify({ mode, nudged, skipped_expired: skippedExpired, total: invitations.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: any) {
    console.error('nudge-invitation error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

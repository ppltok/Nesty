import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildUnsubscribeUrl } from '../_shared/unsubscribe-url.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildEmailHtml(unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>ביקשתן — קיבלתן! 💜</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    :root { color-scheme: light only; }
    @media (prefers-color-scheme: dark) {
      .hero-bg { background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%) !important; }
      .dark-bg { background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%) !important; }
      .white-card { background:#ffffff !important; }
      h1, h2, h3, p, span, a, td, div { color: inherit !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f0fa;font-family:'Heebo',sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0fa;direction:rtl;">
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
                  <span style="font-size:15px;color:#a087c0;font-weight:700;letter-spacing:0.04em;">עדכון חדש 🎉</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td class="hero-bg" style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:52px 40px 48px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:24px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:64px;width:64px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:36px;font-weight:800;color:#ffffff;line-height:1.2;">
              ביקשתן — קיבלתן! 💜
            </h1>
            <p style="margin:0 0 34px;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:440px;margin-left:auto;margin-right:auto;">
              אחת הבקשות שחזרה שוב ושוב: ״אפשר לנהל את הרשימה ביחד עם בן/בת הזוג?״
              <br/><br/>
              אז כן. עכשיו אפשר. 🥹
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WHAT'S NEW -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#2e7d32;">✨ מה חדש</span>
            </div>

            <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#3b1f6b;">ניהול משותף עם בן/בת הזוג</h2>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">רשימת ציוד משותפת</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">שניכם יכולים להוסיף, לערוך ולמחוק פריטים — מכל מקום, בכל זמן. בלי לשלוח סקרינשוטים בוואטסאפ.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">🛒</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">צ'קליסט הריון משותף</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">שניכם רואים את אותו צ'קליסט — מי שמסמן, שניכם מתעדכנים. ככה שניכם יודעים מה נשאר.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">✅</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">מעקב מתנות ביחד</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">שניכם רואים מי קנה מה, שולחים תודה ביחד, ועוקבים אחרי כל מה שהגיע.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">🎁</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">הזמנה בקליק אחד</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">נכנסים להגדרות, מזינים את המייל של בן/בת הזוג, ושולחים הזמנה. תוך שניות — שניכם בפנים.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">📩</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- HOW TO -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">📋 איך מתחילים</span>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">היכנסו להגדרות</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">בתפריט הצד, לחצו על ״הגדרות״.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">1</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">הזינו את המייל של בן/בת הזוג</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">בחלק ״שיתוף הורה נוסף״ — הזינו את המייל ולחצו ״שלח הזמנה״.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">2</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">בן/בת הזוג לוחצים על הקישור</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">הם מקבלים מייל, נרשמים תוך דקה, ומיד רואים את אותה רשימה, צ'קליסט ומתנות.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">3</div>
                </td>
              </tr>
            </table>

            <div style="margin-top:20px;padding:14px 18px;background:#fdf6ff;border-radius:12px;border:1px solid #f0e8ff;">
              <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">
                💡 <strong style="color:#3b1f6b;">טיפ:</strong> לא קיבלו את ההזמנה? בקשו מבן/בת הזוג לבדוק בתיקיית הספאם או הדואר הזבל. לפעמים ההזמנה מגיעה לשם.
              </p>
            </div>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- EMOTIONAL CTA -->
        <tr>
          <td class="dark-bg" style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:44px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">👫</p>
            <h3 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.4;">
              להיות הורים זה לא פרויקט של אחד.
            </h3>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:#ffffff;">
              ההכנה לתינוק היא אחד הרגעים הכי מרגשים, הכי מבלבלים, והכי יפים בחיים.
              Nesty פה כמו אחות גדולה — לא לשפוט, לא ללחוץ, פשוט לעזור לכם להרגיש מוכנים. ביחד.
            </p>
            <a href="https://nestyil.com/settings" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">הזמינו את בן/בת הזוג</a><!-- CTA to invite co-parent — intentionally points to /settings, not unsubscribe -->
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WE LISTEN -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#fce4ec;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#c62828;">💬 אנחנו שומעים אותך</span>
            </div>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#7a6090;max-width:420px;margin-left:auto;margin-right:auto;">
              הפיצ'ר הזה נבנה כי <strong>ביקשתן</strong>. אנחנו ממשיכים לשמוע, ממשיכים לבנות. יש לך רעיון? בקשה? משהו שחסר לך? ספרי לנו — אנחנו פה.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:10px;">
                  <a href="https://calendar.app.google/Cu8AZgor4zohXxqUA" style="display:block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;text-align:center;">📅 קבעי שיחה קצרה</a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="mailto:hello@nestyil.com" style="display:block;background:#f3edff;color:#7c4dbd;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;border:1.5px solid #e8daf5;text-align:center;">✉️ שלחי לנו מייל</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 6px;font-size:13px;color:#a087c0;">
              נשלח באהבה על ידי <strong style="color:#7c4dbd;">Nesty</strong> 💜
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:#a087c0;">
              באבו קפיטל בע"מ (Babu Capital Ltd) · יצירת קשר: <a href="mailto:hello@nestyil.com" style="color:#9070b8;">hello@nestyil.com</a>
            </p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              <a href="${unsubscribeUrl}" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>
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
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Per-campaign tag — change this for each new feature drop. Used as
    // the email_logs.email_type so we can dedupe (the SAME user must not
    // receive the SAME campaign twice, even if the function is invoked
    // multiple times by accident).
    const FEATURE_KEY = 'feature_drop_coparent'
    const SUBJECT = 'ביקשתן — קיבלתן! 💜 ניהול משותף עם בן/בת הזוג'

    // Respect both master opt-out and the per-category "feature announcements" toggle.
    // email_feature_announcements was added in 20260419_email_preferences.sql.
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name')
      .eq('marketing_emails', true)
      .eq('email_feature_announcements', true)
      .eq('onboarding_completed', true)

    if (usersError) throw usersError
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No eligible users' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Dedup: pull every recipient_email that has already received this
    // campaign and skip them. email_logs is the source of truth (populated
    // by sync-resend-emails AND by the per-recipient log we write below).
    const { data: alreadySent } = await supabaseAdmin
      .from('email_logs')
      .select('recipient_email')
      .eq('email_type', FEATURE_KEY)

    const alreadySentSet = new Set(
      (alreadySent ?? []).map((r) => (r.recipient_email || '').toLowerCase())
    )
    const eligibleUsers = users.filter(
      (u) => u.email && !alreadySentSet.has(u.email.toLowerCase())
    )
    const skipped = users.length - eligibleUsers.length

    if (eligibleUsers.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, skipped, total: users.length, message: 'All eligible users already received this campaign' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(`Sending feature drop email to ${eligibleUsers.length} users (skipping ${skipped} already sent)`)

    let sent = 0
    let errors = 0

    // Send in batches of 10 to respect Resend rate limits
    for (let i = 0; i < eligibleUsers.length; i += 10) {
      const batch = eligibleUsers.slice(i, i + 10)

      const promises = batch.map(async (user) => {
        try {
          const unsubUrl = await buildUnsubscribeUrl(user.id, 'features')
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
              html: buildEmailHtml(unsubUrl),
              headers: {
                'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }),
          })

          if (res.ok) {
            sent++
            // Per-recipient log so future invocations can skip this user.
            // Best-effort — failure here doesn't affect the send.
            await supabaseAdmin.from('email_logs').insert({
              recipient_email: user.email.toLowerCase(),
              email_type: FEATURE_KEY,
              subject: SUBJECT,
              status: 'sent',
              sent_at: new Date().toISOString(),
              provider: 'resend',
            })
            console.log(`Sent to ${user.email}`)
          } else {
            const err = await res.json()
            console.error(`Failed for ${user.email}:`, err)
            errors++
          }
        } catch (err) {
          console.error(`Error sending to ${user.email}:`, err)
          errors++
        }
      })

      await Promise.all(promises)

      // Small delay between batches
      if (i + 10 < eligibleUsers.length) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    // (Per-recipient logs are written above on each successful send so
    // future invocations dedup naturally. The previous "all_users" sentinel
    // log row was misleading — removed.)

    return new Response(JSON.stringify({ sent, errors, total: users.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('send-feature-drop error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Shared email wrapper ──────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    :root { color-scheme: light only; }
    @media (prefers-color-scheme: dark) {
      .hero-bg { background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%) !important; }
      .dark-bg { background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%) !important; }
      .white-card { background:#ffffff !important; }
      .light-card { background:#fdf6ff !important; }
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
              </tr>
            </table>
          </td>
        </tr>

${content}

        <!-- HELP SECTION -->
        <tr><td style="height:10px;"></td></tr>
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#fce4ec;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#c62828;">💬 צריכה עזרה?</span>
            </div>
            <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#3b1f6b;line-height:1.4;">אנחנו כאן בשבילך</h3>
            <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#7a6090;max-width:400px;margin-left:auto;margin-right:auto;">
              רוצה שנסביר לך איך הכל עובד? קבעי שיחת זום קצרה (5 דקות) ונעזור לך להתחיל בצורה הכי טובה.
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
            <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">
              נשלח באהבה על ידי <strong style="color:#7c4dbd;">Nesty</strong>
            </p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              <a href="https://nestyil.com/settings" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>
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

// ── Checklist nudge email (1 week after onboarding, no checklist activity) ──
function checklistNudgeHtml(firstName: string): string {
  const content = `
        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:52px 40px 48px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:24px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:64px;width:64px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              ${firstName}, הכל בסדר? 💜
            </h1>
            <p style="margin:0 0 34px;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              שמנו לב שעוד לא התחלת עם הצ'קליסט. אנחנו כאן לעזור לך לסדר הכל בקלות!
            </p>
            <a href="https://nestyil.com/checklist" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">✅ לצ'קליסט שלי</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WHAT IS THE CHECKLIST -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">✨ מה זה הצ'קליסט?</span>
            </div>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#7a6090;">
              הצ'קליסט של Nesty הוא כלי שמלווה אותך לאורך כל ההיריון — מבדיקות וקניות ועד הכנת הבית לתינוק. הכל מסודר לפי שלבים, עם המלצות מותאמות אישית.
            </p>

            <!-- Tip 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">סמני מה יש לך כבר</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">ראי בדיוק מה עוד חסר — בלי לשכוח כלום.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:12px;text-align:center;line-height:36px;font-size:18px;">📋</div>
                </td>
              </tr>
            </table>

            <!-- Tip 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">קבלי ציון נסטינג</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">ככל שתסמני יותר, הציון עולה — ותדעי כמה מוכנה את.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:12px;text-align:center;line-height:36px;font-size:18px;">🏆</div>
                </td>
              </tr>
            </table>

            <!-- Tip 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">הסתירי מה שלא רלוונטי</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">הצ'קליסט מותאם אליך — הסתירי פריטים שלא מתאימים לך.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:12px;text-align:center;line-height:36px;font-size:18px;">👁️</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CTA CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:40px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">✅</p>
            <h3 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f5eeff;line-height:1.5;">מתחילה בדקה<br/>ומרגיעה את הראש.</h3>
            <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              פשוט תפתחי את הצ'קליסט, תסמני מה שכבר יש לך,<br/>ותני ל-Nesty לדאוג לשאר.
            </p>
            <a href="https://nestyil.com/checklist" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">פתחי את הצ'קליסט</a>
          </td>
        </tr>`

  return emailWrapper(content)
}

// ── Share registry nudge email (3+ items, not shared yet) ──
function shareNudgeHtml(firstName: string, itemsCount: number): string {
  const content = `
        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:52px 40px 48px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:24px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:64px;width:64px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              הרשימה שלך מוכנה! 🎁
            </h1>
            <p style="margin:0 0 34px;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              ${firstName}, יש לך כבר ${itemsCount} פריטים ברשימה — הגיע הזמן לשתף עם משפחה וחברים כדי שידעו מה לקנות!
            </p>
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">📤 שתפי את הרשימה</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- HOW TO SHARE -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">📤 איך משתפים?</span>
            </div>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#7a6090;">
              שיתוף הרשימה הוא פשוט ומהיר. כך המשפחה והחברים יוכלו לראות בדיוק מה את צריכה ולבחור מתנה מתאימה:
            </p>

            <!-- Step 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">לחצי על "שתפי את הרשימה"</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">בדשבורד של Nesty יש כפתור שיתוף בולט — לחצי עליו.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">1</div>
                </td>
              </tr>
            </table>

            <!-- Step 2 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">בחרי איך לשתף</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">וואטסאפ, אימייל, העתקת לינק, או QR Code — מה שנוח לך.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">2</div>
                </td>
              </tr>
            </table>

            <!-- Step 3 -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">תהני מהמתנות</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">תקבלי התראה כשמישהו רוכש מתנה, ותוכלי לעקוב אחרי כל מה שהגיע.</p>
                </td>
                <td width="42" style="vertical-align:top;">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c4dbd,#9b62d4);border-radius:50%;text-align:center;line-height:36px;font-size:15px;color:#fff;font-weight:700;">3</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- PRO TIP: SHARE WITH PREGNANT FRIENDS -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#2e7d32;">💡 טיפ</span>
            </div>
            <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#3b1f6b;line-height:1.4;">יש לך חברה בהיריון?</h3>
            <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#7a6090;max-width:400px;margin-left:auto;margin-right:auto;">
              שתפי את הרשימה גם עם חברות בהיריון — ככה הן יוכלו לראות מה קנית, ללמוד ממך ולקבל השראה לרשימה שלהן. 🤰
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CTA CARD -->
        <tr>
          <td style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:40px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">🎁</p>
            <h3 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f5eeff;line-height:1.5;">${itemsCount} פריטים מחכים<br/>שמישהו יבחר אותם.</h3>
            <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              שתפי את הרשימה עכשיו כדי שהמשפחה<br/>והחברים ידעו בדיוק מה לקנות.
            </p>
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">שתפי את הרשימה</a>
          </td>
        </tr>`

  return emailWrapper(content)
}

// ── Main handler ──────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const results = {
      checklist_nudge: { sent: 0, errors: 0, skipped: 0 },
      share_nudge: { sent: 0, errors: 0, skipped: 0 },
    }

    // ── 1. Checklist nudge ──────────────────────────────────────────
    // Find users who:
    // - Completed onboarding 7+ days ago
    // - Have email_notifications = true
    // - Haven't received checklist nudge yet
    // - Have zero checklist activity (no rows in checklist_preferences)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: checklistCandidates, error: checklistError } = await adminClient
      .from('profiles')
      .select('id, email, first_name')
      .eq('onboarding_completed', true)
      .eq('marketing_emails', true)
      .is('checklist_nudge_sent_at', null)
      .lt('updated_at', sevenDaysAgo.toISOString())

    if (checklistError) {
      console.error('Error fetching checklist candidates:', checklistError)
    }

    if (checklistCandidates && checklistCandidates.length > 0) {
      for (const user of checklistCandidates) {
        // Check if user has any checklist activity
        const { count } = await adminClient
          .from('checklist_preferences')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (count && count > 0) {
          // User has checklist activity, skip but mark as sent so we don't check again
          await adminClient
            .from('profiles')
            .update({ checklist_nudge_sent_at: new Date().toISOString() })
            .eq('id', user.id)
          results.checklist_nudge.skipped++
          continue
        }

        // Send checklist nudge email
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [user.email],
              subject: `${user.first_name}, הצ'קליסט מחכה לך! ✅`,
              html: checklistNudgeHtml(user.first_name || 'את'),
            }),
          })

          if (res.ok) {
            await adminClient
              .from('profiles')
              .update({ checklist_nudge_sent_at: new Date().toISOString() })
              .eq('id', user.id)
            results.checklist_nudge.sent++
            console.log(`Checklist nudge sent to ${user.email}`)
          } else {
            const errData = await res.json()
            console.error(`Failed to send checklist nudge to ${user.email}:`, errData)
            results.checklist_nudge.errors++
          }
        } catch (err) {
          console.error(`Error sending checklist nudge to ${user.email}:`, err)
          results.checklist_nudge.errors++
        }
      }
    }

    // ── 2. Share registry nudge ──────────────────────────────────────
    // Find users who:
    // - Completed onboarding
    // - Have email_notifications = true
    // - Haven't received share nudge yet
    // - Haven't shared their registry (registry_shared_at is null)
    // - Have 3+ items in their registry
    // - Last item was added 2+ days ago (give them time to finish adding items)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const { data: shareCandidates, error: shareError } = await adminClient
      .from('profiles')
      .select('id, email, first_name')
      .eq('onboarding_completed', true)
      .eq('marketing_emails', true)
      .is('share_nudge_sent_at', null)
      .is('registry_shared_at', null)

    if (shareError) {
      console.error('Error fetching share candidates:', shareError)
    }

    if (shareCandidates && shareCandidates.length > 0) {
      for (const user of shareCandidates) {
        // Get user's registry
        const { data: registry } = await adminClient
          .from('registries')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (!registry) {
          results.share_nudge.skipped++
          continue
        }

        // Count items and check timing
        const { data: items } = await adminClient
          .from('items')
          .select('created_at')
          .eq('registry_id', registry.id)

        const itemsCount = items?.length || 0

        if (itemsCount < 3) {
          results.share_nudge.skipped++
          continue
        }

        // Check that the latest item was added 2+ days ago
        const latestItem = items!.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        if (new Date(latestItem.created_at) > twoDaysAgo) {
          // Too recent — user might still be adding items, wait
          results.share_nudge.skipped++
          continue
        }

        // Send share nudge email
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [user.email],
              subject: `${user.first_name}, הרשימה שלך מוכנה לשיתוף! 🎁`,
              html: shareNudgeHtml(user.first_name || 'את', itemsCount),
            }),
          })

          if (res.ok) {
            await adminClient
              .from('profiles')
              .update({ share_nudge_sent_at: new Date().toISOString() })
              .eq('id', user.id)
            results.share_nudge.sent++
            console.log(`Share nudge sent to ${user.email}`)
          } else {
            const errData = await res.json()
            console.error(`Failed to send share nudge to ${user.email}:`, errData)
            results.share_nudge.errors++
          }
        } catch (err) {
          console.error(`Error sending share nudge to ${user.email}:`, err)
          results.share_nudge.errors++
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error in send-nudge-emails:', message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { trackedUrl, openPixelTag } from '../_shared/email-tracking.ts'
import { calculatePregnancyWeek } from '../_shared/pregnancy.ts'
import { canSendNudge, logNudge, type NudgeVariant } from '../_shared/nudge-log.ts'
import { buildUnsubscribeUrl } from '../_shared/unsubscribe-url.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Shared email wrapper ──────────────────────────────────────────────
function emailWrapper(content: string, unsubscribeUrl: string = 'https://nestyil.com/settings/emails', pixel: string = ''): string {
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
            <p style="margin:0 0 6px;font-size:13px;color:#a087c0;">
              נשלח באהבה על ידי <strong style="color:#7c4dbd;">Nesty</strong>
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
${pixel}
</body>
</html>`
}

// ── Checklist nudge email (1 week after onboarding, no checklist activity) ──
function checklistNudgeHtml(firstName: string, unsubscribeUrl: string = 'https://nestyil.com/settings/emails', userId: string | null = null): string {
  const T = 'nudge_checklist'
  const ctaUrl = trackedUrl('https://nestyil.com/checklist', { emailType: T, userId, link: 'cta' })
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
            <a href="${ctaUrl}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">✅ לצ'קליסט שלי</a>
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
              הצ'קליסט של Nesty הוא כלי שמלווה אותך לאורך כל ההיריון - מבדיקות וקניות ועד הכנת הבית לתינוק. הכל מסודר לפי שלבים, עם המלצות מותאמות אישית.
            </p>

            <!-- Tip 1 -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="vertical-align:top;padding-left:14px;">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#3b1f6b;">סמני מה יש לך כבר</p>
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">ראי בדיוק מה עוד חסר - בלי לשכוח כלום.</p>
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
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">ככל שתסמני יותר, הציון עולה - ותדעי כמה מוכנה את.</p>
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
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">הצ'קליסט מותאם אליך - הסתירי פריטים שלא מתאימים לך.</p>
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
            <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">פתחי את הצ'קליסט</a>
          </td>
        </tr>`

  return emailWrapper(content, unsubscribeUrl, openPixelTag({ emailType: T, userId }))
}

// ── Share registry nudge email (3+ items, not shared yet) ──
function shareNudgeHtml(firstName: string, itemsCount: number, unsubscribeUrl: string = 'https://nestyil.com/settings/emails', userId: string | null = null): string {
  const T = 'nudge_share'
  const ctaUrl = trackedUrl('https://nestyil.com/dashboard', { emailType: T, userId, link: 'cta' })
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
              ${firstName}, יש לך כבר ${itemsCount} פריטים ברשימה - הגיע הזמן לשתף עם משפחה וחברים כדי שידעו מה לקנות!
            </p>
            <a href="${ctaUrl}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">📤 שתפי את הרשימה</a>
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
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">בדשבורד של Nesty יש כפתור שיתוף בולט - לחצי עליו.</p>
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
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7a6090;">וואטסאפ, אימייל, העתקת לינק, או QR Code - מה שנוח לך.</p>
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
              שתפי את הרשימה גם עם חברות בהיריון - ככה הן יוכלו לראות מה קנית, ללמוד ממך ולקבל השראה לרשימה שלהן. 🤰
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
            <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">שתפי את הרשימה</a>
          </td>
        </tr>`

  return emailWrapper(content, unsubscribeUrl, openPixelTag({ emailType: T, userId }))
}

// ── First Item Nudge (repeatable, pregnancy-week-aware) ───────────────
// Variants by week band:
//   12–20: gentle, 21–27: practical, 28–33: urgent, 34+: final.
// Max 3 total sends (including grandfather). Min 14 days between sends.

// ── Shared building blocks (match the welcome + invite-reminder house style) ──
// One 46px colored tile + title + body. Email-safe: nested tables, no flexbox.
function tileRow(bg: string, color: string, icon: string, title: string, text: string, last = false): string {
  const pad = last ? '0' : '18px'
  return `
              <tr>
                <td width="60" valign="top" style="padding:0 0 ${pad};">
                  <div style="width:46px;height:46px;border-radius:14px;background:${bg};text-align:center;line-height:46px;font-size:22px;">${icon}</div>
                </td>
                <td valign="top" style="padding:4px 0 ${pad};">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:${color};">${title}</p>
                  <p style="margin:0;font-size:14px;color:#7a6090;line-height:1.8;">${text}</p>
                </td>
              </tr>`
}

// Gradient hero + CTA. `headlineHtml` may contain an inline highlight chip.
function heroBlock(headlineHtml: string, body: string, cta: string, href: string): string {
  return `
        <tr>
          <td class="hero-bg" style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:44px 40px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:18px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:56px;width:56px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:26px;font-weight:800;color:#ffffff;line-height:1.45;">${headlineHtml}</h1>
            <p style="margin:0 0 26px;font-size:15px;color:#ffffffd9;line-height:1.8;max-width:400px;margin-left:auto;margin-right:auto;">${body}</p>
            <a href="${href}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:100px;">${cta}</a>
          </td>
        </tr>`
}

function cardBlock(title: string, rows: string): string {
  return `
        <tr><td style="height:10px;"></td></tr>
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <h2 style="margin:0 0 22px;font-size:18px;font-weight:700;color:#3b1f6b;text-align:center;">${title}</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="direction:rtl;">${rows}
            </table>
          </td>
        </tr>`
}

function pickFirstItemVariant(week: number): { variant: NudgeVariant; subject: (name: string) => string; headline: string; body: string; cta: string } {
  if (week <= 20) {
    return {
      variant: 'gentle',
      subject: (n) => `${n}, הצ'קליסט מחכה לך - בואי נציץ? 🌱`,
      headline: 'יש זמן, אבל שווה להציץ',
      body: `יש לך המון זמן, אבל זה רגע טוב להתחיל להכיר את הצ'קליסט - בלי לחץ, רק לעבור על הדברים שכדאי להבין מראש.`,
      cta: 'פתחי את הצ\'קליסט',
    }
  }
  if (week <= 27) {
    return {
      variant: 'practical',
      subject: (n) => `${n}, הגענו לשבוע ${week} ועדיין לא התחלנו - בואי נתחיל ביחד 🪺`,
      headline: `שבוע ${week} - זה הזמן להתחיל`,
      body: `רוב ההורים מתחילים להוסיף פריטים סביב השבוע הזה. העגלות, המיטות והסלקלים דורשים מחקר - כדאי להתחיל עכשיו.`,
      cta: 'התחילי עם פריט ראשון',
    }
  }
  if (week <= 33) {
    return {
      variant: 'urgent',
      subject: (n) => `${n}, שבוע ${week} - הגיע הזמן לבנות את הרשימה! 📦`,
      headline: `שבוע ${week} - והרשימה עוד ריקה`,
      body: `משלוחים לוקחים זמן, מחקר לוקח זמן, והבחירה של בני המשפחה לוקחת זמן. כדאי להתחיל עכשיו.`,
      cta: 'הוסיפי פריט עכשיו',
    }
  }
  return {
    variant: 'final',
    subject: (n) => `${n}, שבוע ${week} - לפחות את 5 הדברים הכי חשובים 🍼`,
    headline: `שבוע ${week} - לפחות את החיוניים`,
    body: `זה באמת הזמן. גם אם לא כל הרשימה מוכנה - לפחות כיסא בטיחות, מיטה, בקבוקים, אמבט וטטרות.`,
    cta: 'פתחי את הצ\'קליסט',
  }
}

function firstItemNudgeHtml(firstName: string, week: number, unsubscribeUrl: string = 'https://nestyil.com/settings/emails', userId: string | null = null): string {
  const T = 'nudge_first_item'
  const ctaUrl = trackedUrl('https://nestyil.com/checklist', { emailType: T, userId, link: 'cta' })
  const { headline, body, cta } = pickFirstItemVariant(week)
  const content =
    heroBlock(`${firstName}, ${headline}`, body, cta, ctaUrl) +
    cardBlock('שלוש דרכים להתחיל', [
      tileRow('#ede2fb', '#6a35b0', '🪺', 'מהצ\'קליסט המוכן', 'רשימה מסודרת לפי שלבי ההריון. סמני מה רלוונטי לך, והפריטים נכנסים לרשימה.'),
      tileRow('#d9f2ed', '#1f7d70', '✨', 'מכל חנות באינטרנט', 'עם התוסף לכרום כל מוצר נכנס לרשימה בלחיצה אחת, מכל אתר בארץ.'),
      tileRow('#fce7f3', '#b03a6e', '💜', 'ביחד עם בן/בת הזוג', 'רשימה משותפת מתמלאת מהר יותר - כל אחד מוסיף את מה שהוא מבין בו.', true),
    ].join(''))
  return emailWrapper(content, unsubscribeUrl, openPixelTag({ emailType: T, userId }))
}

// ── Registry Stalled Nudge (repeatable, pregnancy-week-aware) ─────────
// Variants by week band:
//   20–26: gentle, 27–32: practical, 33+: urgent.
// Max 3 total sends. Min 14 days between sends.

function pickStalledVariant(week: number, itemsCount: number): { variant: NudgeVariant; subject: (name: string) => string; body: string; cta: string } {
  if (week <= 26) {
    return {
      variant: 'gentle',
      subject: (n) => `${n}, חסרים לך עוד כמה דברים 🍼`,
      body: `זה התחלה יפה. בואי נראה מה עוד אמהות בשבוע ${week} אוהבות להוסיף.`,
      cta: 'מה עוד כדאי להוסיף?',
    }
  }
  if (week <= 32) {
    return {
      variant: 'practical',
      subject: (n) => `${n}, הרשימה שלך בשבוע ${week} - מה עוד חסר?`,
      body: `הממוצע ב-Nesty הוא 12 פריטים. יש כנראה כמה דברים חיוניים שעוד לא נכנסו לרשימה שלך.`,
      cta: 'פתחי את הצ\'קליסט',
    }
  }
  return {
    variant: 'urgent',
    subject: (n) => `${n}, שבוע ${week} - כדאי להזמין עכשיו, משלוחים לוקחים זמן 📦`,
    body: `זה פחות מהממוצע, ופריטים חיוניים כמו כיסא בטיחות, מיטה ובקבוקים לוקחים זמן להגיע. שווה להשלים היום.`,
    cta: 'השלימי את הרשימה',
  }
}

function stalledNudgeHtml(firstName: string, week: number, itemsCount: number, unsubscribeUrl: string = 'https://nestyil.com/settings/emails', userId: string | null = null): string {
  const T = 'nudge_stalled'
  const ctaUrl = trackedUrl('https://nestyil.com/checklist', { emailType: T, userId, link: 'cta' })
  const { body, cta } = pickStalledVariant(week, itemsCount)
  // Same amber count-chip device as the co-parent reminder: the real number is
  // the most concrete thing we can put in front of her.
  const headline = `${firstName}, יש לך <span style="background:#ffd98a;color:#5c3d00;border-radius:10px;padding:2px 12px;">${itemsCount} פריטים</span> ברשימה`
  const content =
    heroBlock(headline, body, cta, ctaUrl) +
    cardBlock('מה בדרך כלל עוד חסר', [
      tileRow('#ede2fb', '#6a35b0', '🪺', 'הציוד הגדול', 'עגלה, מיטה, כיסא בטיחות. אלה שדורשים הכי הרבה מחקר וזמן אספקה.'),
      tileRow('#fde4dc', '#c0563a', '🎁', 'היומיום', 'בקבוקים, חיתולים, מגבונים, טטרות. הדברים שנגמרים מהר ושוות לבקש מראש.'),
      tileRow('#fce7f3', '#b03a6e', '💜', 'ביחד עם בן/בת הזוג', 'שני זוגות עיניים מוצאים את מה שחסר. אפשר להוסיף אותו/ה לרשימה בדקה.', true),
    ].join(''))
  return emailWrapper(content, unsubscribeUrl, openPixelTag({ emailType: T, userId }))
}

// ── Concurrency helper ────────────────────────────────────────────────
// Process items in parallel batches. Each batch awaits Promise.all before
// the next one starts - keeps Resend/Supabase load bounded.
const BATCH_SIZE = 10

async function processInBatches<T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(batch.map((item) => fn(item).catch((err) => {
      console.error('batch item failed:', err)
    })))
  }
}

// ── Nudge results bookkeeping ─────────────────────────────────────────
type NudgeBucket = { sent: number; errors: number; skipped: number }
type NudgeResults = {
  checklist_nudge: NudgeBucket
  share_nudge: NudgeBucket
  first_item: NudgeBucket
  registry_stalled: NudgeBucket
}

// ── Main worker ───────────────────────────────────────────────────────
// Pulled out of the serve() handler so we can return 202 immediately
// via EdgeRuntime.waitUntil() and run this in the background. Avoids
// the caller (GitHub Actions / pg_cron) timing out as user count grows.
async function runAllNudges(): Promise<NudgeResults> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const adminClient = createClient(supabaseUrl, supabaseServiceKey)

  const results: NudgeResults = {
    checklist_nudge: { sent: 0, errors: 0, skipped: 0 },
    share_nudge: { sent: 0, errors: 0, skipped: 0 },
    first_item: { sent: 0, errors: 0, skipped: 0 },
    registry_stalled: { sent: 0, errors: 0, skipped: 0 },
  }

  // Users who already received another nudge today shouldn't get a second.
  // Populated as we send each nudge so cross-type dedup works. Safe to
  // mutate from parallel batches because JS is single-threaded - Set
  // reads/writes don't yield.
  const nudgedToday = new Set<string>()

  // Run the 4 nudge types sequentially so cross-type dedup (nudgedToday)
  // works deterministically. Within each type, candidates are processed
  // in parallel batches.

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
      .eq('email_engagement_reminders', true)
      .is('checklist_nudge_sent_at', null)
      .lt('updated_at', sevenDaysAgo.toISOString())

    if (checklistError) {
      console.error('Error fetching checklist candidates:', checklistError)
    }

    if (checklistCandidates && checklistCandidates.length > 0) {
      await processInBatches(checklistCandidates, BATCH_SIZE, async (user) => {
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
          return
        }

        // Send checklist nudge email
        try {
          const unsubUrl = await buildUnsubscribeUrl(user.id, 'reminders')
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [user.email],
              subject: `${user.first_name || 'את'}, הצ'קליסט מחכה לך! ✅`,
              html: checklistNudgeHtml(user.first_name || 'את', unsubUrl, user.id),
              headers: {
                'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }),
          })

          if (res.ok) {
            await adminClient
              .from('profiles')
              .update({ checklist_nudge_sent_at: new Date().toISOString() })
              .eq('id', user.id)
            nudgedToday.add(user.id)
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
      })
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
      .eq('email_engagement_reminders', true)
      .is('share_nudge_sent_at', null)
      .is('registry_shared_at', null)

    if (shareError) {
      console.error('Error fetching share candidates:', shareError)
    }

    if (shareCandidates && shareCandidates.length > 0) {
      await processInBatches(shareCandidates, BATCH_SIZE, async (user) => {
        // Get user's registry
        const { data: registry } = await adminClient
          .from('registries')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (!registry) {
          results.share_nudge.skipped++
          return
        }

        // Count items and check timing
        const { data: items } = await adminClient
          .from('items')
          .select('created_at')
          .eq('registry_id', registry.id)

        const itemsCount = items?.length || 0

        if (itemsCount < 3) {
          results.share_nudge.skipped++
          return
        }

        // Check that the latest item was added 2+ days ago
        const latestItem = items!.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        if (new Date(latestItem.created_at) > twoDaysAgo) {
          // Too recent - user might still be adding items, wait
          results.share_nudge.skipped++
          return
        }

        // Send share nudge email
        try {
          const unsubUrl = await buildUnsubscribeUrl(user.id, 'reminders')
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [user.email],
              subject: `${user.first_name || 'את'}, הרשימה שלך מוכנה לשיתוף! 🎁`,
              html: shareNudgeHtml(user.first_name || 'את', itemsCount, unsubUrl, user.id),
              headers: {
                'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            }),
          })

          if (res.ok) {
            await adminClient
              .from('profiles')
              .update({ share_nudge_sent_at: new Date().toISOString() })
              .eq('id', user.id)
            nudgedToday.add(user.id)
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
      })
    }

    // ── 3. First Item nudge (repeatable, pregnancy-week-aware) ─────
    // Eligibility:
    //   - onboarding_completed = true
    //   - marketing_emails = true
    //   - 0 items in any owned registry
    //   - ≥5 days since profile.updated_at (proxy for onboarding date)
    //   - pregnancy_week >= 12 (i.e. we can calculate it)
    //   - canSendNudge('first_item'): <3 sends total AND last send ≥14d ago
    //   - not already nudged today
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const { data: firstItemCandidates } = await adminClient
      .from('profiles')
      .select('id, email, first_name, due_date')
      .eq('onboarding_completed', true)
      .eq('marketing_emails', true)
      .eq('email_engagement_reminders', true)
      .not('due_date', 'is', null)
      .lt('updated_at', fiveDaysAgo.toISOString())

    await processInBatches(firstItemCandidates ?? [], BATCH_SIZE, async (user) => {
      if (nudgedToday.has(user.id)) {
        results.first_item.skipped++
        return
      }
      const dueDate = new Date(user.due_date as string)
      const week = calculatePregnancyWeek(dueDate)
      if (week < 12 || week > 40) {
        results.first_item.skipped++
        return
      }

      // 0 items check
      const { data: registry } = await adminClient
        .from('registries')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (registry) {
        const { count } = await adminClient
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('registry_id', (registry as { id: string }).id)
        if ((count ?? 0) > 0) {
          results.first_item.skipped++
          return
        }
      }

      // Spacing + max-sends guard
      if (!(await canSendNudge(adminClient, user.id, 'first_item', { minSpacingDays: 14, maxSends: 3 }))) {
        results.first_item.skipped++
        return
      }

      const { subject, variant } = pickFirstItemVariant(week)
      try {
        const unsubUrl = await buildUnsubscribeUrl(user.id, 'reminders')
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: 'Nesty <hello@nestyil.com>',
            to: [user.email],
            subject: subject(user.first_name || 'את'),
            html: firstItemNudgeHtml(user.first_name || 'את', week, unsubUrl, user.id),
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }),
        })
        if (res.ok) {
          await logNudge(adminClient, user.id, 'first_item', variant, week)
          nudgedToday.add(user.id)
          results.first_item.sent++
          console.log(`First item nudge (${variant}, week ${week}) sent to ${user.email}`)
        } else {
          const errData = await res.json()
          console.error(`Failed to send first_item nudge to ${user.email}:`, errData)
          results.first_item.errors++
        }
      } catch (err) {
        console.error(`Error sending first_item nudge to ${user.email}:`, err)
        results.first_item.errors++
      }
    })

    // ── 4. Registry Stalled nudge ──────────────────────────────────
    // Eligibility:
    //   - onboarding_completed + marketing_emails + due_date present
    //   - 1–4 items in owned registry
    //   - last item added ≥7 days ago
    //   - pregnancy_week >= 20
    //   - canSendNudge('registry_stalled'): <3 sends AND last ≥14d ago
    //   - not already nudged today
    const sevenDaysAgoForStalled = new Date()
    sevenDaysAgoForStalled.setDate(sevenDaysAgoForStalled.getDate() - 7)

    const { data: stalledCandidates } = await adminClient
      .from('profiles')
      .select('id, email, first_name, due_date')
      .eq('onboarding_completed', true)
      .eq('marketing_emails', true)
      .eq('email_engagement_reminders', true)
      .not('due_date', 'is', null)

    await processInBatches(stalledCandidates ?? [], BATCH_SIZE, async (user) => {
      if (nudgedToday.has(user.id)) {
        results.registry_stalled.skipped++
        return
      }
      const dueDate = new Date(user.due_date as string)
      const week = calculatePregnancyWeek(dueDate)
      if (week < 20 || week > 40) {
        results.registry_stalled.skipped++
        return
      }

      const { data: registry } = await adminClient
        .from('registries')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (!registry) {
        results.registry_stalled.skipped++
        return
      }
      const { data: items } = await adminClient
        .from('items')
        .select('created_at')
        .eq('registry_id', (registry as { id: string }).id)
        .order('created_at', { ascending: false })
      const itemsCount = items?.length ?? 0
      if (itemsCount < 1 || itemsCount > 4) {
        results.registry_stalled.skipped++
        return
      }
      const latestAt = items?.[0]?.created_at
      if (!latestAt || new Date(latestAt as string) > sevenDaysAgoForStalled) {
        results.registry_stalled.skipped++
        return
      }

      if (!(await canSendNudge(adminClient, user.id, 'registry_stalled', { minSpacingDays: 14, maxSends: 3 }))) {
        results.registry_stalled.skipped++
        return
      }

      const { subject, variant } = pickStalledVariant(week, itemsCount)
      try {
        const unsubUrl = await buildUnsubscribeUrl(user.id, 'reminders')
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: 'Nesty <hello@nestyil.com>',
            to: [user.email],
            subject: subject(user.first_name || 'את'),
            html: stalledNudgeHtml(user.first_name || 'את', week, itemsCount, unsubUrl, user.id),
            headers: {
              'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          }),
        })
        if (res.ok) {
          await logNudge(adminClient, user.id, 'registry_stalled', variant, week)
          nudgedToday.add(user.id)
          results.registry_stalled.sent++
          console.log(`Registry stalled nudge (${variant}, week ${week}, items ${itemsCount}) sent to ${user.email}`)
        } else {
          const errData = await res.json()
          console.error(`Failed to send registry_stalled nudge to ${user.email}:`, errData)
          results.registry_stalled.errors++
        }
      } catch (err) {
        console.error(`Error sending registry_stalled nudge to ${user.email}:`, err)
        results.registry_stalled.errors++
      }
    })

  console.log('send-nudge-emails complete:', JSON.stringify(results))
  return results
}

// ── HTTP entry point ──────────────────────────────────────────────────
// Returns 202 immediately and runs runAllNudges() in the background via
// EdgeRuntime.waitUntil(). Callers (GitHub Actions, pg_cron) get an
// instant response - no more curl timeouts as the candidate pool grows.
// Errors and the final results summary land in Supabase function logs.
serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'RESEND_API_KEY is not set' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const work = runAllNudges().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error('send-nudge-emails background run failed:', message)
  })

  // @ts-ignore - EdgeRuntime is provided by the Supabase Edge runtime
  EdgeRuntime.waitUntil(work)

  return new Response(
    JSON.stringify({ status: 'accepted' }),
    {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
})

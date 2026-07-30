import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { trackedUrl, openPixelTag } from '../_shared/email-tracking.ts'
import { buildUnsubscribeUrl } from '../_shared/unsubscribe-url.ts'
import type { EmailCategoryKey } from '../_shared/email-categories.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Plain management link - settings page, requires login. Used as a fallback
// only when we can't resolve the recipient to a userId for one-click
// unsubscribe (e.g. transactional emails to non-Nesty users).
const MANAGE_LINK = `<a href="https://nestyil.com/settings/emails" style="color:#9070b8;text-decoration:underline;">ניהול העדפות אימייל</a>`

// Look up a profile id by email (for emails where the caller didn't pass
// userId). Returns null if no match - caller should fall back to MANAGE_LINK.
async function lookupUserIdByEmail(email: string): Promise<string | null> {
  if (!email || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    return data?.id ?? null
  } catch (err) {
    console.warn('[send-email] lookupUserIdByEmail failed (non-critical):', err)
    return null
  }
}

// Build the inline "הסרה מרשימת התפוצה" link for a marketing email. Prefers
// the one-click signed URL; falls back to MANAGE_LINK if userId is unknown.
async function buildInlineUnsubLink(
  userId: string | null | undefined,
  category: EmailCategoryKey,
): Promise<string> {
  if (!userId) return MANAGE_LINK
  try {
    const url = await buildUnsubscribeUrl(userId, category)
    return `<a href="${url}" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>`
  } catch (err) {
    console.warn('[send-email] buildUnsubscribeUrl failed, falling back:', err)
    return MANAGE_LINK
  }
}

// RFC 8058 List-Unsubscribe headers. Gmail / Outlook / Apple Mail render a
// native unsubscribe button when these are present, which dramatically
// reduces spam complaints (users hit the native button instead of "report
// spam"). Pass the per-user signed URL - the unsubscribe edge function
// accepts both GET and POST.
function buildListUnsubHeaders(unsubUrl: string | null): Record<string, string> {
  if (!unsubUrl) return {}
  return {
    'List-Unsubscribe': `<${unsubUrl}>, <mailto:hello@nestyil.com?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

/**
 * Shared HTML shell for internal admin emails going to hello@nestyil.com.
 * Mirrors the welcome / price_drop design language (Heebo, purple gradient
 * hero, rounded cards, light purple footer) so the admin inbox reads
 * consistently. Caller passes the emoji/title/subtitle + a list of rows to
 * render in the details card, plus an accent color for the role chip.
 */
function buildAdminBrandedEmail(opts: {
  heroEmoji: string
  heroTitle: string
  heroSubtitle: string
  accentLabel: string
  accentColor: string
  accentBg: string
  rows: Array<{ label: string; value: string }>
}): string {
  const { heroEmoji, heroTitle, heroSubtitle, accentLabel, accentColor, accentBg, rows } = opts
  const rowsHtml = rows.map((r, i) => `
    <tr>
      <td style="padding:${i === 0 ? '0' : '12'}px 0 12px;border-top:${i === 0 ? '0' : '1px solid #f0e8ff'};">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#a087c0;text-transform:uppercase;">${r.label}</p>
        <p style="margin:0;font-size:15px;color:#3b1f6b;font-weight:500;line-height:1.5;word-break:break-word;">${r.value}</p>
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>${heroTitle} - Nesty</title>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>:root { color-scheme: light only; }</style>
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
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">Internal Ops</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:48px 40px 44px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:18px 22px;margin-bottom:20px;line-height:0;">
              <span style="font-size:34px;line-height:1;">${heroEmoji}</span>
            </div>
            <h1 style="margin:0 0 10px;font-size:30px;font-weight:800;color:#ffffff;line-height:1.25;">
              ${heroTitle}
            </h1>
            <p style="margin:0;font-size:15px;color:#ffffffd9;line-height:1.6;font-weight:400;">
              ${heroSubtitle}
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- ROLE CHIP + DETAILS CARD -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:28px 32px;border:1.5px solid #e8daf5;">
            <div style="margin:0 0 18px;">
              <span style="display:inline-block;background:${accentBg};color:${accentColor};border-radius:100px;padding:6px 14px;font-size:12px;font-weight:700;letter-spacing:0.02em;">
                ${accentLabel}
              </span>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${rowsHtml}
            </table>
          </td>
        </tr>

        <tr><td style="height:20px;"></td></tr>

        <!-- CTA -->
        <tr>
          <td align="center">
            <a href="https://dashboard.nestyil.com/people" style="display:inline-block;background:#7c4dbd;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:100px;">
              פתחי ב-Dashboard →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:24px;width:auto;margin-bottom:10px;" />
            </a>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
              התראה אוטומטית מ-<strong style="color:#9070b8;">Nesty</strong>
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type:
    | 'purchase_notification'
    | 'thank_you'
    | 'admin_new_user'
    | 'admin_co_parent_joined'
    | 'admin_onboarding_completed'
    | 'admin_onboarding_abandoned'
    | 'contact'
    | 'welcome'
    | 'price_drop'
  to?: string
  data?: {
    ownerName?: string
    ownerEmail?: string
    buyerName?: string
    buyerEmail?: string
    itemName?: string
    itemPrice?: number
    storeName?: string
    giftMessage?: string
    registryUrl?: string
    // For admin notifications
    userEmail?: string
    userName?: string
    signupDate?: string
    // For admin_co_parent_joined specifically
    coParentName?: string
    coParentEmail?: string
    primaryOwnerName?: string
    primaryOwnerEmail?: string
    registryTitle?: string
    joinedDate?: string
    // For welcome email
    firstName?: string
    currentWeek?: number
    fruitName?: string
    fruitEmoji?: string
    dueDate?: string
    // For admin_onboarding_completed / admin_onboarding_abandoned
    pregnancyWeek?: number
    feeling?: string
    isFirstTimeParent?: boolean | null
    referralSource?: string
    minutesToComplete?: number
    minutesSinceSignup?: number
    firstItem?: {
      name?: string
      price?: number | null
      store?: string
      category?: string
      url?: string
    } | null
    skippedSteps?: string[]
    // New-flow stage signals (Jul 2026 onboarding: WhatsApp phone step +
    // co-parent invite). Optional so pre-deploy senders stay compatible.
    whatsappOptIn?: boolean
    phoneNumber?: string
    coParentInvited?: boolean
    onboardingLastStep?: number | null
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    landingPage?: string
    landingReferrer?: string
    // For price drop email
    userId?: string  // needed to build the signed unsubscribe URL
    drops?: Array<{
      itemName: string
      imageUrl: string
      originalPrice: number
      currentPrice: string
      savingsPercent: number
      productUrl: string
      storeName: string
    }>
  }
  // For contact form
  name?: string
  email?: string
  subject?: string
  message?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const requestData: EmailRequest = await req.json()
    const { type, to, data, name, email, subject: contactSubject, message } = requestData

    let emailSubject: string
    let html: string
    let recipient: string = to || ''
    // Set per-branch when we have a per-user signed unsub URL. Used to
    // populate the RFC 8058 List-Unsubscribe / List-Unsubscribe-Post headers
    // sent to Resend.
    let listUnsubUrl: string | null = null

    if (type === 'welcome') {
      // Welcome email to new user after onboarding
      const firstName = data?.firstName || 'את'
      const currentWeek = data?.currentWeek || 12
      const fruitName = data?.fruitName || 'ליים'
      const fruitEmoji = data?.fruitEmoji || '🍈'
      recipient = to || data?.ownerEmail || ''
      emailSubject = `ברוכה הבאה ל-Nesty, ${firstName}! 💜`
      // One-click signed unsubscribe (category = 'all', master kill switch).
      // Prefer userId from caller; fall back to email-lookup so existing
      // callers without userId still get a working link.
      const userId = data?.userId || (await lookupUserIdByEmail(recipient))
      const unsubscribeLink = await buildInlineUnsubLink(userId, 'all')
      listUnsubUrl = userId ? await buildUnsubscribeUrl(userId, 'all') : null
      const T_W = 'welcome'
      const ctaW = trackedUrl('https://nestyil.com/dashboard', { emailType: T_W, userId, link: 'cta' })
      html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>ברוכה הבאה ל-Nesty</title>
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
                <td align="left">
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">ברוכה הבאה 🎉</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:52px 40px 48px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:24px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:64px;width:64px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:38px;font-weight:800;color:#ffffff;line-height:1.2;">
              ברוכה הבאה, ${firstName}! 💜<br/>
              <span style="font-size:28px;font-weight:400;color:#e4c8ff;">הקן שלך מוכן.</span>
            </h1>
            <p style="margin:0 0 34px;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              כל כך שמחים שהצטרפת! Nesty היא הפלטפורמה שתלווה אותך לאורך כל ההיריון - מרשימת קניות חכמה, דרך צ'קליסט מותאם אישית, ועד עדכונים שבועיים על ההתפתחות שלך ושל התינוק. 🌸
            </p>
            <a href="${ctaW}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">✨ בואי נתחיל</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CURRENT WEEK PREVIEW -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;color:#a087c0;text-transform:uppercase;">את נמצאת בשבוע</p>
                  <h2 style="margin:0 0 10px;font-size:34px;font-weight:800;color:#3b1f6b;">שבוע ${currentWeek} 🌱</h2>
                  <p style="margin:0;font-size:14px;line-height:1.8;color:#7a6090;">
                    התינוק שלך בגודל של <strong style="color:#7c4dbd;">${fruitName} ${fruitEmoji}</strong>. כל שבוע נשלח לך עדכון על הגדילה שלו, מה לצפות, ומה את עשויה להרגיש.
                  </p>
                </td>
                <td width="88" style="vertical-align:middle;text-align:center;padding-right:20px;">
                  <span style="font-size:68px;line-height:1;">${fruitEmoji}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- HOW NESTY HELPS YOU -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">✨ איך Nesty עוזרת לך</span>
            </div>

            <!-- Feature 1: Registry -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">רשימת קניות חכמה לתינוק</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">הוסיפי מוצרים מכל אתר עם התוסף לכרום, סמני מה הכי חשוב, שתפי עם משפחה וחברים - וקבלי מתנות בדיוק ממה שביקשת.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">🎁</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <!-- Feature 2: Checklist -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">צ'קליסט הריון מותאם אישית</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">בדיקות, קניות, הכנת הבית - הכל מסודר לפי שלבים ותזמון. סמני מה עשית ותראי כמה התקדמת.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">✅</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <!-- Feature 3: Weekly Updates -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">עדכונים שבועיים למייל</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">כל שבוע תקבלי מייל עם גודל התינוק, מה מתפתח אצלו, מה הגוף שלך עובר, וטיפים מעשיים לשבוע הקרוב.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">💌</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <!-- Feature 4: Gift Tracking -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">מעקב מתנות וברכות</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">תקבלי התראה כשמישהו קונה לך מתנה, תוכלי לשלוח תודה, ולעקוב אחרי כל מה שהגיע - בלי להפסיד כלום.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">💝</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CHROME EXTENSION CTA -->
        <tr>
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#2e7d32;">🧩 טיפ חשוב</span>
            </div>
            <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#3b1f6b;line-height:1.4;">התקיני את התוסף לכרום</h3>
            <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#7a6090;max-width:400px;margin-left:auto;margin-right:auto;">
              גלשי בכל אתר קניות, לחצי על כפתור Nesty - והמוצר מתווסף ישירות לרשימה שלך. זה ממש קסם! ✨
            </p>
            <a href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll" style="display:inline-block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:100px;">🧩 הוסיפי לכרום - חינם</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WEEKLY EMAILS PREVIEW -->
        <tr>
          <td style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:40px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">💌</p>
            <h3 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f5eeff;line-height:1.5;">העדכון השבועי הראשון שלך<br/>יגיע בשבוע הבא.</h3>
            <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              בינתיים, פתחי את האפליקציה, התקיני את התוסף לכרום,<br/>והתחילי לבנות את הרשימה שלך.
            </p>
            <a href="${ctaW}" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">פתחי את Nesty</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- SCHEDULE A CALL / CONTACT -->
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
              ${unsubscribeLink}
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

    } else if (type === 'contact') {
      recipient = 'hello@nestyil.com'
      emailSubject = `📩 פנייה חדשה מאתר Nesty: ${contactSubject}`
      html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #faf8fb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(to left, #86608e, #6d4e74); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📩 פנייה חדשה</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                התקבלה פנייה חדשה מטופס יצירת הקשר באתר:
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px 0; color: #1a1a1a;"><strong>שם:</strong> ${name}</p>
                <p style="margin: 0 0 12px 0; color: #1a1a1a;"><strong>אימייל:</strong> <a href="mailto:${email}" style="color: #86608e;">${email}</a></p>
                <p style="margin: 0; color: #1a1a1a;"><strong>נושא:</strong> ${contactSubject}</p>
              </div>
              <div style="background-color: #f4f4f4; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px;">תוכן ההודעה:</p>
                <p style="margin: 0; color: #1a1a1a; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              <div style="text-align: center; margin-top: 32px;">
                <a href="mailto:${email}?subject=Re: ${contactSubject}" style="display: inline-block; background: linear-gradient(to left, #86608e, #6d4e74); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  השב לפנייה
                </a>
              </div>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                נשלח מטופס יצירת הקשר ב-<a href="https://nestyil.com" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'purchase_notification') {
      const ownerName = data?.ownerName || ''
      const buyerName = data?.buyerName || 'מישהו'
      const buyerEmail = data?.buyerEmail || ''
      const itemName = data?.itemName || ''
      const itemPrice = data?.itemPrice
      const itemImage = data?.itemImage || ''
      const storeName = data?.storeName && data.storeName !== 'ידני' ? data.storeName : ''
      const giftMessage = data?.giftMessage || ''
      emailSubject = `🎁 ${buyerName} רכש/ה מתנה מהרשימה שלך!`
      // One-click signed unsubscribe for the registry owner.
      const ownerId = data?.userId || (await lookupUserIdByEmail(recipient))
      const purchaseUnsubLink = await buildInlineUnsubLink(ownerId, 'all')
      listUnsubUrl = ownerId ? await buildUnsubscribeUrl(ownerId, 'all') : null

      html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>קיבלת מתנה!</title>
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
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">קיבלת מתנה 🎁</span>
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
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              קיבלת מתנה! 🎁<br/>
              <span style="font-size:22px;font-weight:400;color:#e4c8ff;">מישהו חשב עלייך</span>
            </h1>
            <p style="margin:0;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              היי ${ownerName}, <strong style="color:#fff;">${buyerName}</strong> רכש/ה עבורך פריט מהרשימה. 💜
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- GIFT CARD -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:28px 32px;border:1.5px solid #e8daf5;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${itemImage ? `
                <td width="90" style="vertical-align:top;padding-left:20px;">
                  <img src="${itemImage}" alt="${itemName}" style="width:80px;height:80px;object-fit:cover;border-radius:14px;border:1px solid #f0e8ff;" />
                </td>
                ` : ''}
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#a087c0;text-transform:uppercase;">המתנה שלך</p>
                  <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:#3b1f6b;line-height:1.4;">${itemName}</p>
                  ${itemPrice ? `<p style="margin:0 0 10px;font-size:18px;font-weight:800;color:#7c4dbd;">₪${itemPrice}</p>` : ''}
                  ${storeName ? `<div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:4px 12px;"><span style="font-size:12px;font-weight:700;color:#7c4dbd;">🛒 נרכש ב-${storeName}</span></div>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${giftMessage ? `
        <tr><td style="height:10px;"></td></tr>
        <tr>
          <td style="background:#fff7fa;border-radius:20px;padding:28px 32px;border:1.5px solid #ffd1e0;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#c2185b;text-transform:uppercase;">💌 הודעה מ${buyerName}</p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#3b1f6b;font-style:italic;">"${giftMessage}"</p>
          </td>
        </tr>
        ` : ''}

        <tr><td style="height:10px;"></td></tr>

        <!-- BUYER CONTACT -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:28px 32px;border:1.5px solid #e8daf5;">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#a087c0;text-transform:uppercase;">פרטי הקונה</p>
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#3b1f6b;">${buyerName}</p>
            ${buyerEmail ? `<p style="margin:0;font-size:14px;color:#7a6090;"><a href="mailto:${buyerEmail}" style="color:#7c4dbd;text-decoration:none;">${buyerEmail}</a></p>` : ''}
            <p style="margin:12px 0 0;font-size:13px;line-height:1.7;color:#a087c0;">המשפחה תיצור איתך קשר בנוגע למשלוח. אל תשכחי לשלוח תודה 💜</p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- THANK YOU CTA -->
        <tr>
          <td class="dark-bg" style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:40px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">💝</p>
            <h3 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f5eeff;line-height:1.5;">צפי בכל המתנות שקיבלת</h3>
            <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              עקבי אחרי מי קנה מה, סמני מה הגיע,<br/>ושלחי תודה בלחיצה אחת.
            </p>
            <a href="https://nestyil.com/gifts" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">לדף המתנות</a>
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
              ${purchaseUnsubLink}
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
    } else if (type === 'admin_new_user') {
      // Internal ops email to hello@nestyil.com whenever a fresh user signs up
      // (no pending co-parent invite). Uses the same branded shell as welcome/
      // price_drop so admin mailbox reads consistently.
      const userName = data?.userName || ''
      const userEmail = data?.userEmail || ''
      const signupDate = data?.signupDate || new Date().toLocaleDateString('he-IL')
      emailSubject = `🆕 משתמש חדש נרשם ל-Nesty${userName ? `: ${userName}` : userEmail ? `: ${userEmail}` : ''}`
      recipient = 'hello@nestyil.com'
      html = buildAdminBrandedEmail({
        heroEmoji: '🆕',
        heroTitle: 'משתמש חדש נרשם',
        heroSubtitle: 'חשבון חדש נפתח זה עתה',
        accentLabel: 'Primary user',
        accentColor: '#7c4dbd',
        accentBg: '#f3edff',
        rows: [
          { label: 'שם', value: userName || '-' },
          { label: 'אימייל', value: userEmail || '-' },
          { label: 'תאריך הרשמה', value: signupDate },
          { label: 'סוג חשבון', value: 'הורה ראשי (Primary)' },
        ],
      })
    } else if (type === 'admin_co_parent_joined') {
      // Internal ops email fired from accept-invitation right after partner_id
      // is persisted. Replaces admin_new_user for users who signed up through
      // (or accepted) a co-parent invitation.
      const coParentName = data?.coParentName || data?.userName || ''
      const coParentEmail = data?.coParentEmail || data?.userEmail || ''
      const primaryOwnerName = data?.primaryOwnerName || ''
      const primaryOwnerEmail = data?.primaryOwnerEmail || ''
      const registryTitle = data?.registryTitle || ''
      const joinedDate = data?.joinedDate || new Date().toLocaleDateString('he-IL')
      emailSubject = `🤝 Co-parent חדש הצטרף${coParentName ? `: ${coParentName}` : coParentEmail ? `: ${coParentEmail}` : ''}`
      recipient = 'hello@nestyil.com'
      html = buildAdminBrandedEmail({
        heroEmoji: '🤝',
        heroTitle: 'Co-parent חדש הצטרף',
        heroSubtitle: 'הורה שותף קיבל הזמנה ומחובר לרשימה',
        accentLabel: 'Co-parent',
        accentColor: '#be185d',
        accentBg: '#fde6ef',
        rows: [
          { label: 'שם Co-parent', value: coParentName || '-' },
          { label: 'אימייל Co-parent', value: coParentEmail || '-' },
          { label: 'הורה ראשי', value: primaryOwnerName || primaryOwnerEmail || '-' },
          ...(primaryOwnerName && primaryOwnerEmail
            ? [{ label: 'אימייל הורה ראשי', value: primaryOwnerEmail }]
            : []),
          ...(registryTitle ? [{ label: 'רשימה', value: registryTitle }] : []),
          { label: 'תאריך הצטרפות', value: joinedDate },
        ],
      })
    } else if (type === 'admin_onboarding_completed') {
      // Internal ops email to hello@nestyil.com after a user finishes the
      // onboarding flow (replaces the old admin_new_user that fired before
      // any data was collected). Carries every actionable field they filled.
      const userEmail = data?.userEmail || ''
      const userName = data?.userName || ''
      const firstName = data?.firstName || userName.split(' ')[0] || ''
      const signupDate = data?.signupDate || new Date().toLocaleDateString('he-IL')
      const dueDate = data?.dueDate || ''
      const pregnancyWeek = data?.pregnancyWeek
      const feeling = data?.feeling || ''
      const isFirstTimeParent = data?.isFirstTimeParent
      const referralSource = data?.referralSource || ''
      const firstItem = data?.firstItem || null
      const skippedSteps = data?.skippedSteps || []
      const whatsappOptIn = data?.whatsappOptIn
      const phoneNumber = data?.phoneNumber || ''
      const coParentInvited = data?.coParentInvited
      const minutesToComplete = data?.minutesToComplete
      const utmSource = data?.utmSource || ''
      const utmMedium = data?.utmMedium || ''
      const utmCampaign = data?.utmCampaign || ''
      const landingPage = data?.landingPage || ''
      const landingReferrer = data?.landingReferrer || ''

      const feelingLabel: Record<string, string> = {
        excited: 'מתרגשת 💜',
        overwhelmed: 'קצת מוצפת 😅',
        exploring: 'בודקת לאט 🌱',
      }
      const referralLabel: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        google: 'Google',
        tiktok: 'TikTok',
        friend: 'חברה / משפחה',
        other: 'אחר',
      }
      // Per-stage ✅/❌ checklist for the new 7-step flow. `null` state renders
      // a neutral dash (unknown - e.g. emails sent by a pre-deploy client).
      const skipped = (key: string) => skippedSteps.includes(key)
      const stageLine = (ok: boolean | null, label: string, extra?: string) =>
        ok === null
          ? `<span style="color:#a087c0;">➖ ${label} <span style="font-weight:400;">(לא ידוע)</span></span>`
          : ok
            ? `<span style="color:#0a7c4a;font-weight:600;">✅ ${label}</span>${extra ? `<span style="color:#3d3d3d;"> - ${extra}</span>` : ''}`
            : `<span style="color:#c0392b;font-weight:600;">❌ ${label}</span>`

      const subjBits = [`שבוע ${pregnancyWeek ?? '?'}`]
      if (referralSource) subjBits.push(referralLabel[referralSource] || referralSource)
      emailSubject = `✅ Onboarding הושלם: ${firstName || userEmail} (${subjBits.join(' · ')})`
      recipient = to || 'hello@nestyil.com'

      const firstItemValue = firstItem
        ? [
            firstItem.name || '-',
            firstItem.price ? `₪${firstItem.price}` : null,
            firstItem.store ? `· ${firstItem.store}` : null,
            firstItem.category ? `· ${firstItem.category}` : null,
            firstItem.url ? `<br/><a href="${firstItem.url}" style="color:#7c4dbd;text-decoration:underline;">${firstItem.url}</a>` : null,
          ]
            .filter(Boolean)
            .join(' ')
        : '<em style="color:#a087c0;">לא הוסיפה פריט</em>'

      const utmBits = [
        utmSource && `source=${utmSource}`,
        utmMedium && `medium=${utmMedium}`,
        utmCampaign && `campaign=${utmCampaign}`,
      ].filter(Boolean).join(' · ') || '-'

      // WhatsApp: prefer the explicit boolean; fall back to skippedSteps from
      // newer clients; pre-deploy clients send neither → unknown (null).
      const waState: boolean | null =
        typeof whatsappOptIn === 'boolean'
          ? whatsappOptIn
          : skipped('whatsapp_phone')
            ? false
            : null
      const waPhoneLink = phoneNumber
        ? `<a href="https://wa.me/${phoneNumber.replace(/\D/g, '')}" style="color:#0a7c4a;text-decoration:underline;font-weight:600;">${phoneNumber}</a>`
        : ''
      const coParentState: boolean | null =
        typeof coParentInvited === 'boolean' ? coParentInvited : null

      const stagesValue = [
        stageLine(true, 'שם פרטי', firstName || undefined),
        stageLine(!skipped('last_name'), 'שם משפחה'),
        stageLine(!skipped('due_date'), 'תאריך לידה משוער', dueDate || undefined),
        stageLine(!skipped('feeling'), 'תחושה', feelingLabel[feeling] || feeling || undefined),
        stageLine(
          !skipped('is_first_time_parent'),
          'הורות ראשונה',
          isFirstTimeParent === true ? 'כן' : isFirstTimeParent === false ? 'לא' : undefined,
        ),
        stageLine(!skipped('referral_source'), 'מקור הגעה', referralLabel[referralSource] || referralSource || undefined),
        stageLine(waState, 'וואטסאפ 📱', waPhoneLink || undefined),
        stageLine(coParentState, 'הזמנת בן/בת זוג'),
        stageLine(!skipped('first_item'), 'פריט ראשון', firstItem?.name || undefined),
      ].join('<br/>')

      const completedCount = 1 + // first name is always completed
        ['last_name', 'due_date', 'feeling', 'is_first_time_parent', 'referral_source', 'first_item']
          .filter((s) => !skipped(s)).length +
        (waState === true ? 1 : 0) + (coParentState === true ? 1 : 0)

      html = buildAdminBrandedEmail({
        heroEmoji: '✅',
        heroTitle: 'משתמש סיים Onboarding',
        heroSubtitle: `${completedCount}/9 שלבים הושלמו${waState === true ? ' · מחוברת לוואטסאפ 📱' : ''}`,
        accentLabel: 'Onboarding completed',
        accentColor: '#0a7c4a',
        accentBg: '#e2f5ec',
        rows: [
          { label: 'שם', value: userName || firstName || '-' },
          { label: 'אימייל', value: userEmail || '-' },
          { label: 'תאריך הרשמה', value: signupDate },
          ...(typeof minutesToComplete === 'number'
            ? [{ label: 'זמן עד סיום Onboarding', value: `${minutesToComplete} דק'` }]
            : []),
          { label: 'שלבי התהליך', value: stagesValue },
          { label: 'שבוע הריון', value: typeof pregnancyWeek === 'number' ? String(pregnancyWeek) : '-' },
          { label: 'UTM', value: utmBits },
          ...(landingPage ? [{ label: 'דף נחיתה', value: landingPage }] : []),
          ...(landingReferrer ? [{ label: 'Referrer', value: landingReferrer }] : []),
          { label: 'פריט ראשון', value: firstItemValue },
        ],
      })
    } else if (type === 'admin_onboarding_abandoned') {
      // Internal ops email to hello@nestyil.com fired by the
      // notify-abandoned-signups cron job ~10 min after signup if the user
      // never finished onboarding. Most fields will be empty for abandons -
      // UTM/landing data is the most useful signal since it's set at landing
      // time, before signup.
      const userId = data?.userId || ''
      const userEmail = data?.userEmail || ''
      const userName = data?.userName || ''
      const firstName = data?.firstName || ''
      const signupDate = data?.signupDate || new Date().toLocaleDateString('he-IL')
      const minutesSinceSignup = data?.minutesSinceSignup
      const dueDate = data?.dueDate || ''
      const utmSource = data?.utmSource || ''
      const utmMedium = data?.utmMedium || ''
      const utmCampaign = data?.utmCampaign || ''
      const landingPage = data?.landingPage || ''
      const landingReferrer = data?.landingReferrer || ''
      const lastStep = typeof data?.onboardingLastStep === 'number' ? data.onboardingLastStep : null

      // How far she got before leaving. Nothing else is persisted mid-flow,
      // so this furthest-step marker is the real drop-off signal.
      const ABANDON_STEPS = [
        'שם', 'תאריך לידה', 'תחושה', 'מקור הגעה', 'וואטסאפ 📱', 'הזמנת בן/בת זוג', 'פריט ראשון',
      ]
      const stagesValue = lastStep === null
        ? '<span style="color:#a087c0;">➖ לא ידוע היכן נעצרה (נרשמה לפני שהמעקב נוסף)</span>'
        : ABANDON_STEPS.map((label, idx) => {
            const n = idx + 1
            if (n < lastStep) return `<span style="color:#0a7c4a;font-weight:600;">✅ ${label}</span>`
            if (n === lastStep) return `<span style="color:#c0392b;font-weight:700;">🛑 ${label} - נעצרה כאן</span>`
            return `<span style="color:#b8adc0;">⬜ ${label}</span>`
          }).join('<br/>')

      // Microsoft Clarity session footage. The web app tags every logged-in
      // session with a `user_id` custom tag (see tracking.ts clarityIdentify),
      // so the recording is found by filtering on that tag.
      const CLARITY_PROJECT = 'xi1xr7lx6t'
      const clarityRecordingsUrl = `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT}/impressions`

      emailSubject = `⚠️ משתמש לא סיים Onboarding: ${userEmail || firstName}`
      recipient = to || 'hello@nestyil.com'

      const utmBits = [
        utmSource && `source=${utmSource}`,
        utmMedium && `medium=${utmMedium}`,
        utmCampaign && `campaign=${utmCampaign}`,
      ].filter(Boolean).join(' · ') || '-'

      const abandonSubtitle = lastStep === null
        ? 'נפתח חשבון אך לא הושלם תהליך ההצטרפות'
        : `נעצרה בשלב ${lastStep}/7 - ${ABANDON_STEPS[lastStep - 1]}`

      html = buildAdminBrandedEmail({
        heroEmoji: '⚠️',
        heroTitle: 'משתמש לא סיים Onboarding',
        heroSubtitle: abandonSubtitle,
        accentLabel: 'Onboarding abandoned',
        accentColor: '#b35400',
        accentBg: '#fef0e0',
        rows: [
          { label: 'אימייל', value: userEmail || '-' },
          { label: 'שם (אם קיים)', value: userName || firstName || '-' },
          { label: 'תאריך הרשמה', value: signupDate },
          ...(typeof minutesSinceSignup === 'number'
            ? [{ label: 'זמן מאז הרשמה', value: `${minutesSinceSignup} דק'` }]
            : []),
          { label: 'עד היכן הגיעה', value: stagesValue },
          ...(dueDate ? [{ label: 'תאריך לידה משוער', value: dueDate }] : []),
          { label: 'UTM', value: utmBits },
          ...(landingPage ? [{ label: 'דף נחיתה', value: landingPage }] : []),
          ...(landingReferrer ? [{ label: 'Referrer', value: landingReferrer }] : []),
          ...(userId
            ? [{
                label: '🎥 הקלטת סשן (Clarity)',
                value: `<a href="${clarityRecordingsUrl}" style="color:#6a35b0;font-weight:700;">פתח הקלטות</a>` +
                  `<br/><span style="font-size:12px;color:#a087c0;">סנן לפי Custom tag → user_id = </span>` +
                  `<span style="font-size:12px;font-family:monospace;direction:ltr;unicode-bidi:embed;">${userId}</span>`,
              }]
            : []),
        ],
      })
    } else if (type === 'thank_you') {
      emailSubject = `תודה על המתנה ל${data?.ownerName || ''}! 💝`
      // Buyer is often a guest with no Nesty account - look up by email and
      // gracefully fall back to MANAGE_LINK if they're not in profiles.
      const buyerId = data?.userId || (await lookupUserIdByEmail(recipient))
      const thankYouUnsubLink = await buildInlineUnsubLink(buyerId, 'all')
      listUnsubUrl = buyerId ? await buildUnsubscribeUrl(buyerId, 'all') : null
      html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: Arial, sans-serif; background-color: #faf8fb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(to left, #86608e, #6d4e74); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">💝 תודה על המתנה!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                היי ${data?.buyerName || ''},
              </p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                תודה שרכשת מתנה ל${data?.ownerName || ''}!
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${data?.itemName || ''}</h3>
                ${data?.itemPrice ? `<p style="margin: 0; color: #86608e; font-weight: bold;">₪${data.itemPrice}</p>` : ''}
              </div>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                עדכנו את ${data?.ownerName || ''} על המתנה שלך. המשפחה תיצור איתך קשר בנוגע למשלוח.
              </p>
              <p style="font-size: 14px; color: #6b6b6b; margin-top: 24px;">מזל טוב! 🎉</p>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0 0 4px; color: #6b6b6b; font-size: 14px;">
                נשלח מ-<a href="https://nestyil.com" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
              <p style="margin: 0 0 8px; color: #9b9b9b; font-size: 11px;">
                באבו קפיטל בע"מ (Babu Capital Ltd) · <a href="mailto:hello@nestyil.com" style="color: #86608e;">hello@nestyil.com</a>
              </p>
              <p style="margin: 0; color: #9b9b9b; font-size: 12px;">
                ${thankYouUnsubLink}
                &nbsp;·&nbsp;
                <a href="https://nestyil.com/privacy" style="color: #86608e; text-decoration: underline;">מדיניות פרטיות</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'price_drop') {
      const T_PD = 'price_drop'
      const ctaPD = trackedUrl('https://nestyil.com/dashboard', { emailType: T_PD, userId: (data?.userId ?? null), link: 'cta' })
      const firstName = data?.firstName || 'את'
      const drops = data?.drops || []
      const userId = data?.userId || (await lookupUserIdByEmail(to || data?.ownerEmail || ''))
      recipient = to || data?.ownerEmail || ''
      listUnsubUrl = userId ? await buildUnsubscribeUrl(userId, 'prices') : null

      if (drops.length === 0) {
        throw new Error('No price drops provided')
      }

      // One-click token unsubscribe for the 'prices' category. If userId
      // isn't provided (legacy callers), fall back to the plain manage link.
      const unsubscribeLink = userId
        ? `<a href="${await buildUnsubscribeUrl(userId, 'prices')}" style="color:#9070b8;text-decoration:underline;">הסרה מרשימת התפוצה</a>`
        : MANAGE_LINK

      // Subject line
      if (drops.length === 1) {
        emailSubject = `💰 ירידת מחיר! ${drops[0].itemName.substring(0, 40)} ירד ב-${drops[0].savingsPercent}%`
      } else {
        emailSubject = `💰 ${drops.length} מוצרים ירדו במחיר ברשימה שלך!`
      }

      // Build product cards HTML
      const productCardsHtml = drops.map((drop, index) => {
        const savingsIls = (drop.originalPrice - parseFloat(drop.currentPrice)).toFixed(0)
        return `
            ${index > 0 ? '<tr><td style="height:10px;"></td></tr>' : ''}
            <tr>
              <td style="background:#fff;border-radius:20px;padding:28px 32px;border:1.5px solid #e8daf5;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    ${drop.imageUrl ? `
                    <td width="90" style="vertical-align:top;padding-left:20px;">
                      <img src="${drop.imageUrl}" alt="${drop.itemName}" style="width:80px;height:80px;object-fit:cover;border-radius:14px;border:1px solid #f0e8ff;" />
                    </td>
                    ` : ''}
                    <td style="vertical-align:top;">
                      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#a087c0;text-transform:uppercase;">${drop.storeName}</p>
                      <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:#3b1f6b;line-height:1.4;">${drop.itemName.substring(0, 60)}</p>

                      <!-- Price comparison -->
                      <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                        <tr>
                          <td style="padding-left:12px;">
                            <span style="font-size:13px;color:#a087c0;text-decoration:line-through;font-weight:500;">₪${drop.originalPrice.toFixed(0)}</span>
                          </td>
                          <td>
                            <span style="font-size:12px;color:#a087c0;padding:0 6px;">→</span>
                          </td>
                          <td>
                            <span style="font-size:20px;font-weight:800;color:#2e7d32;">₪${parseFloat(drop.currentPrice).toFixed(0)}</span>
                          </td>
                          <td style="padding-right:10px;">
                            <div style="display:inline-block;background:#e8f5e9;border-radius:100px;padding:4px 12px;margin-right:8px;">
                              <span style="font-size:12px;font-weight:700;color:#2e7d32;">📉 חיסכון ${drop.savingsPercent}% (₪${savingsIls})</span>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <a href="${drop.productUrl}" style="display:inline-block;background:linear-gradient(135deg,#2e7d32,#43a047);color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:100px;">🛒 צפי במוצר</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
      }).join('')

      html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>ירידת מחיר!</title>
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
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">התראת מחיר 💰</span>
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
            <h1 style="margin:0 0 14px;font-size:34px;font-weight:800;color:#ffffff;line-height:1.2;">
              ירידת מחיר! 💰<br/>
              <span style="font-size:22px;font-weight:400;color:#e4c8ff;">חיסכון ברשימה שלך</span>
            </h1>
            <p style="margin:0;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              היי ${firstName}, מצאנו ${drops.length === 1 ? 'ירידת מחיר במוצר' : `ירידות מחיר ב-${drops.length} מוצרים`} מהרשימה שלך! 🎉
            </p>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- PRODUCT CARDS -->
        ${productCardsHtml}

        <tr><td style="height:10px;"></td></tr>

        <!-- SHARE TIP -->
        <tr>
          <td class="dark-bg" style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:36px;">💡</p>
            <h3 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#f5eeff;line-height:1.5;">שתפי את הדיל!</h3>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#ffffffa6;">
              שלחי את הקישור לרשימה למשפחה ולחברים -<br/>אולי מישהו ירצה לנצל את ירידת המחיר ולקנות לך מתנה 🎁
            </p>
            <a href="${ctaPD}" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">צפי ברשימה שלך</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- HELP SECTION -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;text-align:center;">
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
              ${unsubscribeLink}
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

    } else {
      throw new Error(`Invalid email type: ${type}`)
    }

    // Send email via Resend API. Pass List-Unsubscribe + List-Unsubscribe-Post
    // headers (RFC 8058) when we have a per-user signed URL - Gmail / Outlook /
    // Apple Mail render their native unsubscribe button when these are set,
    // which is the most legally-defensible path for Israeli spam law.
    const listUnsubHeaders = buildListUnsubHeaders(listUnsubUrl)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Nesty <hello@nestyil.com>',
        to: [recipient],
        subject: emailSubject,
        html,
        ...(Object.keys(listUnsubHeaders).length > 0 && { headers: listUnsubHeaders }),
      }),
    })

    const responseData = await res.json()

    if (!res.ok) {
      console.error('Resend API error:', responseData)
      throw new Error(responseData.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error sending email:', message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

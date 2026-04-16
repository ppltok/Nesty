import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'purchase_notification' | 'thank_you' | 'admin_new_user' | 'contact' | 'welcome' | 'price_drop'
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
    // For welcome email
    firstName?: string
    currentWeek?: number
    fruitName?: string
    fruitEmoji?: string
    dueDate?: string
    // For price drop email
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

    if (type === 'welcome') {
      // Welcome email to new user after onboarding
      const firstName = data?.firstName || 'את'
      const currentWeek = data?.currentWeek || 12
      const fruitName = data?.fruitName || 'ליים'
      const fruitEmoji = data?.fruitEmoji || '🍈'
      recipient = to || data?.ownerEmail || ''
      emailSubject = `ברוכה הבאה ל-Nesty, ${firstName}! 💜`
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
              כל כך שמחים שהצטרפת! Nesty היא הפלטפורמה שתלווה אותך לאורך כל ההיריון — מרשימת קניות חכמה, דרך צ'קליסט מותאם אישית, ועד עדכונים שבועיים על ההתפתחות שלך ושל התינוק. 🌸
            </p>
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">✨ בואי נתחיל</a>
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
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">הוסיפי מוצרים מכל אתר עם התוסף לכרום, סמני מה הכי חשוב, שתפי עם משפחה וחברים — וקבלי מתנות בדיוק ממה שביקשת.</p>
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
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">בדיקות, קניות, הכנת הבית — הכל מסודר לפי שלבים ותזמון. סמני מה עשית ותראי כמה התקדמת.</p>
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
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">תקבלי התראה כשמישהו קונה לך מתנה, תוכלי לשלוח תודה, ולעקוב אחרי כל מה שהגיע — בלי להפסיד כלום.</p>
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
              גלשי בכל אתר קניות, לחצי על כפתור Nesty — והמוצר מתווסף ישירות לרשימה שלך. זה ממש קסם! ✨
            </p>
            <a href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll" style="display:inline-block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:100px;">🧩 הוסיפי לכרום — חינם</a>
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
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">פתחי את Nesty</a>
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
      emailSubject = `🎁 ${data?.buyerName || 'מישהו'} רכש/ה מתנה מהרשימה שלך!`
      html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: Arial, sans-serif; background-color: #faf8fb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(to left, #86608e, #6d4e74); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎁 קיבלת מתנה!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                היי ${data?.ownerName || ''},
              </p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                <strong style="color: #86608e;">${data?.buyerName || 'מישהו'}</strong> רכש/ה עבורך את הפריט:
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${data?.itemName || ''}</h3>
                ${data?.itemPrice ? `<p style="margin: 0; color: #86608e; font-weight: bold;">₪${data.itemPrice}</p>` : ''}
                ${data?.storeName && data.storeName !== 'ידני' ? `<p style="margin: 8px 0 0 0; color: #6b6b6b; font-size: 14px;">נרכש ב: ${data.storeName}</p>` : ''}
              </div>
              ${data?.giftMessage ? `
                <div style="background-color: rgba(244, 172, 183, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px;">הודעה מ${data.buyerName}:</p>
                  <p style="margin: 0; color: #1a1a1a; font-style: italic;">"${data.giftMessage}"</p>
                </div>
              ` : ''}
              <p style="font-size: 14px; color: #6b6b6b; margin-top: 24px;">
                פרטי הקונה ליצירת קשר:<br>
                <strong>${data?.buyerName || ''}</strong><br>
                ${data?.buyerEmail || ''}
              </p>
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://nestyil.com/gifts" style="display: inline-block; background: linear-gradient(to left, #86608e, #6d4e74); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  צפו בכל המתנות
                </a>
              </div>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                נשלח מ-<a href="https://nestyil.com" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'admin_new_user') {
      emailSubject = `🆕 משתמש חדש נרשם ל-Nesty: ${data?.userName || data?.userEmail || ''}`
      recipient = 'hello@nestyil.com'
      html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: Arial, sans-serif; background-color: #faf8fb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(to left, #86608e, #6d4e74); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🆕 משתמש חדש!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">היי Tom,</p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">משתמש חדש נרשם ל-Nesty!</p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px;">פרטי המשתמש:</p>
                ${data?.userName ? `<p style="margin: 0 0 4px 0; color: #1a1a1a;"><strong>שם:</strong> ${data.userName}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #1a1a1a;"><strong>אימייל:</strong> ${data?.userEmail || ''}</p>
                <p style="margin: 0; color: #1a1a1a;"><strong>תאריך הרשמה:</strong> ${data?.signupDate || new Date().toLocaleDateString('he-IL')}</p>
              </div>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                התראה מערכת מ-<a href="https://nestyil.com" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'thank_you') {
      emailSubject = `תודה על המתנה ל${data?.ownerName || ''}! 💝`
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
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                נשלח מ-<a href="https://nestyil.com" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'price_drop') {
      const firstName = data?.firstName || 'את'
      const drops = data?.drops || []
      recipient = to || data?.ownerEmail || ''

      if (drops.length === 0) {
        throw new Error('No price drops provided')
      }

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
              שלחי את הקישור לרשימה למשפחה ולחברים —<br/>אולי מישהו ירצה לנצל את ירידת המחיר ולקנות לך מתנה 🎁
            </p>
            <a href="https://nestyil.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">צפי ברשימה שלך</a>
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

    } else {
      throw new Error(`Invalid email type: ${type}`)
    }

    // Send email via Resend API
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

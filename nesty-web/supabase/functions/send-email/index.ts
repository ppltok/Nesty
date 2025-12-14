import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'purchase_notification' | 'thank_you' | 'admin_new_user'
  to: string
  data: {
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
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const { type, to, data }: EmailRequest = await req.json()

    let subject: string
    let html: string

    if (type === 'purchase_notification') {
      // Email to registry owner when someone buys a gift
      subject = `🎁 ${data.buyerName} רכש/ה מתנה מהרשימה שלך!`
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
              <h1 style="color: white; margin: 0; font-size: 24px;">🎁 קיבלת מתנה!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                היי ${data.ownerName},
              </p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                <strong style="color: #86608e;">${data.buyerName}</strong> רכש/ה עבורך את הפריט:
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${data.itemName}</h3>
                ${data.itemPrice ? `<p style="margin: 0; color: #86608e; font-weight: bold;">₪${data.itemPrice}</p>` : ''}
                ${data.storeName && data.storeName !== 'ידני' ? `<p style="margin: 8px 0 0 0; color: #6b6b6b; font-size: 14px;">נרכש ב: ${data.storeName}</p>` : ''}
              </div>
              ${data.giftMessage ? `
                <div style="background-color: #f4acb7; background-color: rgba(244, 172, 183, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px;">הודעה מ${data.buyerName}:</p>
                  <p style="margin: 0; color: #1a1a1a; font-style: italic;">"${data.giftMessage}"</p>
                </div>
              ` : ''}
              <p style="font-size: 14px; color: #6b6b6b; margin-top: 24px;">
                פרטי הקונה ליצירת קשר:<br>
                <strong>${data.buyerName}</strong><br>
                ${data.buyerEmail}
              </p>
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://nesty.co.il/gifts" style="display: inline-block; background: linear-gradient(to left, #86608e, #6d4e74); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  צפו בכל המתנות
                </a>
              </div>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                נשלח מ-<a href="https://nesty.co.il" style="color: #86608e; text-decoration: none;">Nesty</a> - לבנות את הקן שלכם, חכם יותר.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'admin_new_user') {
      // Admin notification for new user signup
      subject = `🆕 משתמש חדש נרשם ל-Nesty: ${data.userName || data.userEmail}`
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
              <h1 style="color: white; margin: 0; font-size: 24px;">🆕 משתמש חדש!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                היי Tom,
              </p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                משתמש חדש נרשם ל-Nesty!
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #6b6b6b; font-size: 14px;">פרטי המשתמש:</p>
                ${data.userName ? `<p style="margin: 0 0 4px 0; color: #1a1a1a;"><strong>שם:</strong> ${data.userName}</p>` : ''}
                <p style="margin: 0 0 4px 0; color: #1a1a1a;"><strong>אימייל:</strong> ${data.userEmail}</p>
                <p style="margin: 0; color: #1a1a1a;"><strong>תאריך הרשמה:</strong> ${data.signupDate || new Date().toLocaleDateString('he-IL')}</p>
              </div>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                התראה מערכת מ-<a href="https://nesty.co.il" style="color: #86608e; text-decoration: none;">Nesty</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'thank_you') {
      // Thank you email to gift buyer
      subject = `תודה על המתנה ל${data.ownerName}! 💝`
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
              <h1 style="color: white; margin: 0; font-size: 24px;">💝 תודה על המתנה!</h1>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 18px; color: #1a1a1a; margin-bottom: 24px;">
                היי ${data.buyerName},
              </p>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                תודה שרכשת מתנה ל${data.ownerName}!
              </p>
              <div style="background-color: #faf8fb; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1a1a1a;">${data.itemName}</h3>
                ${data.itemPrice ? `<p style="margin: 0; color: #86608e; font-weight: bold;">₪${data.itemPrice}</p>` : ''}
              </div>
              <p style="font-size: 16px; color: #6b6b6b; line-height: 1.6;">
                עדכנו את ${data.ownerName} על המתנה שלך. המשפחה תיצור איתך קשר בנוגע למשלוח.
              </p>
              <p style="font-size: 14px; color: #6b6b6b; margin-top: 24px;">
                מזל טוב! 🎉
              </p>
            </div>
            <div style="background-color: #faf8fb; padding: 24px; text-align: center; border-top: 1px solid #e8e4e9;">
              <p style="margin: 0; color: #6b6b6b; font-size: 14px;">
                נשלח מ-<a href="https://nesty.co.il" style="color: #86608e; text-decoration: none;">Nesty</a> - לבנות את הקן שלכם, חכם יותר.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    } else {
      throw new Error('Invalid email type')
    }

    // Send email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Nesty <onboarding@resend.dev>',
        to: [to],
        subject,
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
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

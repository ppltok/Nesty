import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const WEB_URL = Deno.env.get('WEB_URL') || 'https://nestyil.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // Find pending invitations older than 24 hours that haven't been nudged yet
    // We use a simple approach: add a nudged_at column check, or just track via
    // a convention: only nudge invitations created 24-48h ago (so we don't re-nudge)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: staleInvitations, error: queryError } = await supabaseAdmin
      .from('registry_invitations')
      .select('id, registry_id, invited_by, invited_email, invitation_token, created_at')
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo)
      .gt('created_at', fortyEightHoursAgo)

    if (queryError) {
      console.error('Query error:', queryError)
      throw new Error('Failed to query invitations')
    }

    if (!staleInvitations || staleInvitations.length === 0) {
      console.log('No invitations to nudge')
      return new Response(JSON.stringify({ nudged: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Found ${staleInvitations.length} invitations to nudge`)

    let nudgedCount = 0

    for (const invitation of staleInvitations) {
      try {
        // Get owner profile
        const { data: ownerProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', invitation.invited_by)
          .single()

        const ownerName = ownerProfile
          ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || ownerProfile.email
          : 'Someone'

        const inviteUrl = `${WEB_URL}/invite/${invitation.invitation_token}`

        // Send nudge to the invited person
        if (RESEND_API_KEY) {
          const nudgeHtml = `<!DOCTYPE html>
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
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="https://nestyil.com" style="text-decoration:none;">
                    <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:40px;width:auto;display:block;" />
                  </a>
                </td>
                <td align="left">
                  <span style="font-size:12px;color:#a087c0;font-weight:600;">תזכורת 💜</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:linear-gradient(145deg,#6a35b0 0%,#9b62d4 60%,#c4a0e8 100%);border-radius:24px;padding:48px 40px;text-align:center;">
            <div style="display:inline-block;background:#ffffff;border-radius:50%;padding:2px;margin-bottom:20px;line-height:0;">
              <img src="https://nestyil.com/Circle_logo.png" alt="Nesty" style="height:56px;width:56px;display:block;border-radius:50%;" />
            </div>
            <h1 style="margin:0 0 14px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.3;">
              ${ownerName} עדיין מחכה לך! 👋
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:#ffffffd9;line-height:1.8;max-width:400px;margin-left:auto;margin-right:auto;">
              קיבלת הזמנה לנהל ביחד את רשימת התינוק ב-Nesty. ההצטרפות לוקחת פחות מדקה!
            </p>
            <a href="${inviteUrl}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:100px;">💜 הצטרפו לרשימה</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <tr>
          <td style="background:#fff;border-radius:20px;padding:24px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <p style="margin:0;font-size:13px;color:#7a6090;line-height:1.8;">
              ⏳ ההזמנה תפוג בעוד מספר ימים. לחצו על הכפתור כדי להצטרף.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">הקן שלכם מתחיל כאן 💜</p>
            <p style="margin:0;font-size:12px;color:#bca8d4;">
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

          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Nesty <hello@nestyil.com>',
              to: [invitation.invited_email],
              subject: `תזכורת: ${ownerName} מחכה לך ב-Nesty! 👶`,
              html: nudgeHtml,
            }),
          })

          const resendResult = await resendResponse.json()
          console.log(`Nudge sent to ${invitation.invited_email}:`, resendResponse.status, JSON.stringify(resendResult))

          if (resendResponse.ok) {
            nudgedCount++
          }

          // Also notify the owner that their partner hasn't accepted yet
          if (ownerProfile?.email) {
            const ownerNotifyHtml = `<!DOCTYPE html>
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
          <td style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:18px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">📬 עדכון הזמנה</span>
            </div>
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#3b1f6b;">
              ההזמנה שלך עדיין ממתינה
            </h2>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#7a6090;">
              שלחנו תזכורת ל-<strong>${invitation.invited_email}</strong>, אבל הם עדיין לא הצטרפו לרשימה.
            </p>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:#7a6090;">
              💡 <strong>טיפ:</strong> בקשו מהם לבדוק בתיקיית הספאם או הדואר הזבל — לפעמים ההזמנה מגיעה לשם.
            </p>
            <p style="margin:0;font-size:14px;line-height:1.8;color:#7a6090;">
              אפשר גם לשלוח את הקישור ישירות בוואטסאפ או SMS.
            </p>
            <div style="text-align:center;margin-top:24px;">
              <a href="https://nestyil.com/settings" style="display:inline-block;background:linear-gradient(135deg,#7c4dbd,#9b62d4);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:100px;">שלח הזמנה מחדש</a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0;font-size:13px;color:#a087c0;">הקן שלכם מתחיל כאן 💜</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`

            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'Nesty <hello@nestyil.com>',
                to: [ownerProfile.email],
                subject: `ההזמנה ל-${invitation.invited_email} עדיין ממתינה`,
                html: ownerNotifyHtml,
              }),
            })

            console.log(`Owner notified: ${ownerProfile.email}`)
          }
        }
      } catch (innerErr) {
        console.error(`Error nudging invitation ${invitation.id}:`, innerErr)
      }
    }

    return new Response(JSON.stringify({ nudged: nudgedCount, total: staleInvitations.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('nudge-invitation error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

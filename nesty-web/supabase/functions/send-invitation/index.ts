import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const WEB_URL = Deno.env.get('WEB_URL') || 'https://nestyil.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildInvitationEmailHtml(ownerName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light only"/>
  <meta name="supported-color-modes" content="light"/>
  <title>הזמנה לניהול משותף — Nesty</title>
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
                  <span style="font-size:12px;color:#a087c0;font-weight:600;letter-spacing:0.04em;">הזמנה לניהול משותף 👫</span>
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
              ${ownerName} מזמין/ה אותך<br/>
              <span style="font-size:26px;font-weight:400;color:#e4c8ff;">לנהל יחד את רשימת התינוק! 👶</span>
            </h1>
            <p style="margin:0 0 34px;font-size:16px;color:#ffffffd9;line-height:1.8;font-weight:400;max-width:420px;margin-left:auto;margin-right:auto;">
              ב-Nesty תוכלו לנהל ביחד רשימת ציוד לתינוק — להוסיף מוצרים מכל אתר, לעקוב אחרי מתנות, ולהתארגן יחד בצורה חכמה.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;background:#fff;color:#7c4dbd;font-size:15px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:16px 44px;border-radius:100px;">💜 הצטרפו לרשימה</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- WHAT YOU CAN DO TOGETHER -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:32px 36px;border:1.5px solid #e8daf5;">
            <div style="display:inline-block;background:#f0e8ff;border-radius:100px;padding:6px 16px;margin-bottom:22px;">
              <span style="font-size:12px;font-weight:700;color:#7c4dbd;">👫 מה תוכלו לעשות ביחד</span>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">להוסיף מוצרים מכל אתר</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">שניכם יכולים להוסיף פריטים לרשימה — מהאתר, מהנייד, או עם התוסף לכרום.</p>
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
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">לערוך ולנהל פריטים</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">לעדכן כמויות, לסמן מה הכי חשוב, ולמחוק מה שלא צריך — ביחד.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">✏️</div>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:#f0e8ff;margin-bottom:20px;"></div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-left:16px;">
                  <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#3b1f6b;">לעקוב אחרי מתנות ביחד</p>
                  <p style="margin:0;font-size:13px;line-height:1.75;color:#7a6090;">שניכם מקבלים התראות כשמישהו קונה מתנה, ויכולים לשלוח תודה.</p>
                </td>
                <td width="48" style="vertical-align:top;">
                  <div style="width:42px;height:42px;background:linear-gradient(135deg,#f0e8ff,#dcc8f8);border-radius:14px;text-align:center;line-height:42px;font-size:22px;">🎁</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- CTA REMINDER -->
        <tr>
          <td class="dark-bg" style="background:linear-gradient(145deg,#3b1f6b 0%,#5c3490 100%);border-radius:20px;padding:40px 40px;text-align:center;">
            <p style="margin:0 0 12px;font-size:40px;">👶</p>
            <h3 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.5;">
              ${ownerName} כבר מחכה לך!
            </h3>
            <p style="margin:0 0 28px;font-size:14px;line-height:1.8;color:#ffffff;">
              לחצו על הכפתור, הירשמו תוך דקה,<br/>והתחילו לנהל את הרשימה ביחד.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#c4a0e8,#9b62d4);color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.03em;text-decoration:none;padding:15px 40px;border-radius:100px;">💜 הצטרפו לרשימה</a>
          </td>
        </tr>

        <tr><td style="height:10px;"></td></tr>

        <!-- EXPIRY NOTE -->
        <tr>
          <td class="white-card" style="background:#fff;border-radius:20px;padding:24px 36px;border:1.5px solid #e8daf5;text-align:center;">
            <p style="margin:0;font-size:13px;color:#7a6090;line-height:1.8;">
              ⏳ ההזמנה תקפה ל-7 ימים. אם פג התוקף, ${ownerName} יוכל/תוכל לשלוח הזמנה חדשה.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:30px 0 0;text-align:center;">
            <a href="https://nestyil.com" style="text-decoration:none;">
              <img src="https://nestyil.com/Nesty_logo.png" alt="Nesty" style="height:28px;width:auto;margin-bottom:12px;" />
            </a>
            <p style="margin:0 0 8px;font-size:13px;color:#a087c0;">
              הקן שלכם מתחיל כאן 💜
            </p>
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create user-scoped client to verify identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const { registry_id, invited_email, resend } = await req.json()

    if (!registry_id || !invited_email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const email = invited_email.trim().toLowerCase()

    // Verify the user owns this registry
    const { data: registry, error: regError } = await supabaseAdmin
      .from('registries')
      .select('id, owner_id, partner_id, title')
      .eq('id', registry_id)
      .single()

    if (regError || !registry) {
      console.error('Registry lookup failed:', regError)
      return new Response(JSON.stringify({ error: 'Registry not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (registry.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only the registry owner can send invitations' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (registry.partner_id) {
      return new Response(JSON.stringify({ error: 'Registry already has a partner' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get owner's profile for the email
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    const ownerName = ownerProfile
      ? `${ownerProfile.first_name || ''} ${ownerProfile.last_name || ''}`.trim() || ownerProfile.email
      : user.email || 'Someone'

    // Check for self-invitation
    if (email === (ownerProfile?.email || user.email)) {
      return new Response(JSON.stringify({ error: 'Cannot invite yourself' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let invitationToken: string

    if (resend) {
      // Resend: revoke old pending invitations and create new one
      await supabaseAdmin
        .from('registry_invitations')
        .update({ status: 'revoked' })
        .eq('registry_id', registry_id)
        .eq('status', 'pending')

      const { data: newInvite, error: insertError } = await supabaseAdmin
        .from('registry_invitations')
        .insert({
          registry_id,
          invited_by: user.id,
          invited_email: email,
        })
        .select('invitation_token')
        .single()

      if (insertError || !newInvite) {
        console.error('Insert error (resend):', insertError)
        throw new Error('Failed to create invitation')
      }
      invitationToken = newInvite.invitation_token
    } else {
      // Check for existing pending invitation to same email
      const { data: existing } = await supabaseAdmin
        .from('registry_invitations')
        .select('id')
        .eq('registry_id', registry_id)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .maybeSingle()

      if (existing) {
        return new Response(JSON.stringify({ error: 'Invitation already pending for this email' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Create new invitation
      const { data: newInvite, error: insertError } = await supabaseAdmin
        .from('registry_invitations')
        .insert({
          registry_id,
          invited_by: user.id,
          invited_email: email,
        })
        .select('invitation_token')
        .single()

      if (insertError || !newInvite) {
        console.error('Insert error:', insertError)
        throw new Error('Failed to create invitation')
      }
      invitationToken = newInvite.invitation_token
    }

    // Send the invitation email via Resend
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      // Still return success since the invitation was created in DB
      return new Response(JSON.stringify({ success: true, warning: 'Email not sent: no API key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const inviteUrl = `${WEB_URL}/invite/${invitationToken}`
    const emailHtml = buildInvitationEmailHtml(ownerName, inviteUrl)

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Nesty <hello@nestyil.com>',
        to: [email],
        subject: `${ownerName} הזמין/ה אותך לנהל יחד את רשימת התינוק ב-Nesty! 👶`,
        html: emailHtml,
      }),
    })

    const resendResult = await resendResponse.json()
    console.log('Resend response:', resendResponse.status, JSON.stringify(resendResult))

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendResult)
      // Invitation was created in DB but email failed — still return success
      // The user can resend from Settings
      return new Response(JSON.stringify({ success: true, warning: 'Email delivery failed, can resend from settings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('send-invitation error:', err)
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

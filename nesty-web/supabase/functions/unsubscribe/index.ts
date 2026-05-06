// Public unsubscribe endpoint.
//
// Called by email links of the form:
//   /functions/v1/unsubscribe?uid=<user_id>&cat=<category>&action=unsub&sig=<hmac>
//
// Flow:
//   1. Validate uid/cat/action/sig presence and category validity
//   2. Verify HMAC signature against UNSUBSCRIBE_SECRET
//   3. Flip the corresponding profiles column (false for unsub, true for resub)
//   4. 302 redirect to /unsubscribed?cat=<category>&action=<action> on the
//      web app so the user sees a friendly confirmation page
//
// On any validation error we return a small HTML page (not JSON) since the
// user is coming from an email client and will see the response in a browser.
//
// No auth required — the HMAC signature IS the auth. Anybody who has the
// URL can act on it, which is acceptable: the only thing a bad actor can
// do is opt someone out of their own marketing email. That's reversible
// with one click on the confirmation page.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { EMAIL_CATEGORIES, isValidCategory } from '../_shared/email-categories.ts'
import { verifyUnsubscribeSignature } from '../_shared/unsubscribe-url.ts'

const APP_URL = Deno.env.get('APP_URL') ?? 'https://nestyil.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function errorHtml(title: string, message: string): Response {
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — Nesty</title>
  <style>
    body { margin:0; padding:48px 16px; font-family: 'Assistant', 'Heebo', sans-serif; background:#f5f0fa; color:#3b1f6b; }
    .card { max-width: 480px; margin: 0 auto; background:#fff; padding:32px; border-radius:20px; border:1.5px solid #e8daf5; text-align:center; }
    h1 { margin:0 0 12px; font-size:22px; }
    p { margin:0 0 16px; font-size:15px; line-height:1.7; color:#5a4470; }
    a { color:#7c4dbd; text-decoration:underline; font-weight:600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <p><a href="${APP_URL}">חזרה ל-Nesty</a></p>
  </div>
</body>
</html>`
  return new Response(html, {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const uid = url.searchParams.get('uid')
    const cat = url.searchParams.get('cat')
    const action = url.searchParams.get('action') ?? 'unsub'
    const sig = url.searchParams.get('sig')

    if (!uid || !cat || !sig) {
      return errorHtml('קישור לא תקין', 'חסרים פרמטרים בקישור הביטול. נסי ללחוץ שוב על הקישור מהמייל, או פני לתמיכה.')
    }
    if (!isValidCategory(cat)) {
      return errorHtml('קטגוריה לא מוכרת', 'סוג האימייל שצוין אינו נתמך.')
    }
    if (action !== 'unsub' && action !== 'resub') {
      return errorHtml('פעולה לא מוכרת', 'הפעולה המבוקשת אינה חוקית.')
    }
    const valid = await verifyUnsubscribeSignature(uid, cat, action, sig)
    if (!valid) {
      return errorHtml('קישור לא תקף', 'חתימת האבטחה של הקישור לא תואמת. ייתכן שהקישור פג תוקף או שונה. פני אלינו לעזרה: hello@nestyil.com')
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const column = EMAIL_CATEGORIES[cat].column
    const newValue = action === 'unsub' ? false : true
    // Israeli spam-law audit trail. When the master switch (`all` →
    // marketing_emails column) flips, stamp the corresponding consent /
    // unsubscribe timestamp so we can prove WHEN the user took the
    // action, not just the boolean state.
    const updatePayload: Record<string, unknown> = { [column]: newValue }
    if (column === 'marketing_emails') {
      updatePayload[newValue ? 'marketing_emails_consented_at' : 'marketing_emails_unsubscribed_at'] =
        new Date().toISOString()
    }
    const { error } = await admin
      .from('profiles')
      .update(updatePayload)
      .eq('id', uid)

    if (error) {
      console.error(`[unsubscribe] DB update failed for user=${uid} cat=${cat}:`, error)
      return errorHtml('שגיאה בעדכון ההעדפות', 'לא הצלחנו לעדכן את ההעדפה כרגע. נסי שוב מאוחר יותר, או פני אלינו: hello@nestyil.com')
    }

    // Redirect to friendly confirmation page on the web app.
    const redirectUrl = `${APP_URL}/unsubscribed?cat=${encodeURIComponent(cat)}&action=${action}`
    return Response.redirect(redirectUrl, 302)
  } catch (err) {
    console.error('[unsubscribe] Unhandled error:', err)
    return errorHtml('שגיאה לא צפויה', 'משהו השתבש. פני אלינו: hello@nestyil.com')
  }
})

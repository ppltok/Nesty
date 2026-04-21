/**
 * Supabase auth error → Hebrew brand-voice string mapping.
 *
 * Used by SignIn, SignUp, ResetPasswordRequest, UpdatePassword. Matches the
 * Nesty voice guide: warm, reassuring, never blaming ("משהו השתבש, אבל
 * אנחנו על זה" style). Default messages Supabase returns are English and
 * user-hostile ("Invalid login credentials"), so we map the ones we see in
 * practice to friendly Hebrew.
 *
 * Design notes:
 *   - We inspect message text lowercased (Supabase doesn't expose stable
 *     codes for every error), plus `error.status` for rate-limit detection.
 *   - SignUp flows must NOT surface "email already exists" — that would
 *     enable account enumeration. Supabase already returns a fake-success
 *     for that case; we don't need to map it here.
 *   - Fallback is intentionally vague — when in doubt, don't guess.
 */

export interface AuthErrorShape {
  message?: string
  code?: string
  status?: number
  name?: string
}

export function translateAuthError(error: AuthErrorShape | null | undefined): string {
  if (!error) return 'אירעה שגיאה. נסו שוב.'

  const msg = (error.message ?? '').toLowerCase()
  const status = error.status

  // Rate limiting — Supabase returns HTTP 429 plus messages like
  // "Email rate limit exceeded" or "over_email_send_rate_limit"
  if (status === 429 || msg.includes('rate limit') || msg.includes('over_email_send')) {
    return 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.'
  }

  // Wrong password or unknown user on signin.
  // Supabase deliberately returns the same generic error for both cases
  // (anti-enumeration), so we phrase the message to cover both — the UI
  // can additionally surface a "sign up" CTA next to it.
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'האימייל או הסיסמה שגויים — או שעדיין אין לכם חשבון.'
  }

  // Tried to sign in before clicking the verification link
  if (msg.includes('email not confirmed') || msg.includes('not been confirmed')) {
    return 'יש לאשר את האימייל לפני ההתחברות. בדקו את תיבת הדואר שלכם.'
  }

  // Password rejected by server-side policy (Supabase dashboard is set to
  // require letters + digits + 8 chars minimum — keep message in sync).
  if (
    msg.includes('weak password') ||
    msg.includes('password should be') ||
    msg.includes('password is too short') ||
    msg.includes('password should contain') ||
    (msg.includes('characters') && msg.includes('password'))
  ) {
    return 'הסיסמה חלשה מדי. דרושים לפחות 8 תווים, אות וספרה.'
  }

  // Reset / confirmation link no longer valid
  if (msg.includes('expired') || msg.includes('invalid token') || msg.includes('otp_expired')) {
    return 'הקישור פג תוקף. בקשו קישור חדש.'
  }

  // Network / offline — rare but possible
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'אין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.'
  }

  // Last resort — keep it warm, don't blame
  return 'משהו השתבש, אבל אנחנו על זה. נסו שוב בעוד רגע.'
}

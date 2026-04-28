/**
 * Safe ?redirect= param handling for auth flows.
 *
 * InviteAccept.tsx passes `?redirect=/invite/{token}` into /auth/signup and
 * /auth/signin so that after sign-up the user returns to the invite page.
 * Both pages used to drop the param (the redirectTo URL was hardcoded); this
 * helper threads it through and AuthCallback honors it post-auth.
 *
 * We also validate the value against an allowlist to prevent open-redirect
 * attacks — someone could otherwise craft /auth/signup?redirect=https://evil
 * and trick a logged-in user into landing on a phishing page after signup.
 */

const ALLOWED_PREFIXES = ['/invite/', '/dashboard', '/onboarding']

export function isSafeRedirect(value: string | null | undefined): value is string {
  if (!value) return false
  // Only same-origin absolute paths. Block protocol-relative ("//evil.com")
  // and any non-slash prefix (full URLs, query-only, etc.).
  if (!value.startsWith('/')) return false
  if (value.startsWith('//')) return false
  return ALLOWED_PREFIXES.some((p) => value === p || value.startsWith(p))
}

/**
 * Build the full callback URL for Supabase auth redirects. Used by both the
 * Google OAuth `redirectTo` and the email-confirm `emailRedirectTo`.
 *
 * If `redirectParam` is a safe path, it's encoded into the callback URL as
 * `?redirect=...`; AuthCallback reads it back after session establishment.
 */
export function buildCallbackUrl(redirectParam: string | null | undefined): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`
  const url = new URL(base)
  if (isSafeRedirect(redirectParam)) {
    url.searchParams.set('redirect', redirectParam)
  }
  return url.toString()
}

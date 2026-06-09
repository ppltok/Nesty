import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isSafeRedirect } from '../../lib/authRedirect'
import { trackGoogleAdsSignupConversion, trackGoogleAdsPmaxSignupConversion } from '../../utils/tracking'

/**
 * Universal auth-callback landing page. Handles three flows on the same route:
 *
 *   1. Google OAuth     — tokens arrive in `window.location.hash` (#access_token=...).
 *                         Supabase client extracts them automatically via
 *                         `detectSessionInUrl: true`; we wait for getSession().
 *
 *   2. Email confirmation — `?code=...&type=signup` arrives in the query string.
 *                         We exchange the code for a session explicitly
 *                         (PKCE flow) before calling getSession().
 *
 *   3. Password recovery — `?type=recovery` (optionally `?code=...`). We don't
 *                         complete the flow here; we hand off to
 *                         /auth/update-password, which consumes the
 *                         PASSWORD_RECOVERY event from AuthContext.
 *
 * For flows 1 & 2 we then:
 *   - Look up the profile to decide onboarding vs dashboard.
 *   - Fire the Google Ads signup conversion (deduped per-user) for verified
 *     new signups. The admin notification to hello@nestyil.com is no longer
 *     fired here — it now fires from Onboarding.tsx (admin_onboarding_completed)
 *     and from a cron-driven edge function (admin_onboarding_abandoned).
 *   - Honor a safe `?redirect=` param (from invite links) over the default
 *     onboarding/dashboard destination.
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasHandled = useRef(false)
  const [status, setStatus] = useState('מאמת את ההתחברות...')

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution (React StrictMode, etc.)
      if (hasHandled.current) return
      hasHandled.current = true

      console.log('AuthCallback: Starting callback handling')
      console.log('AuthCallback: Current URL:', window.location.href)

      // ─── 1. Error handling ─────────────────────────────────
      const errorCode = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get('error')

      if (errorCode || hashError) {
        console.error('Auth error:', errorCode || hashError, errorDescription || hashParams.get('error_description'))
        // Clear any corrupted auth state so the next login attempt is clean
        const keysToRemove = Object.keys(localStorage).filter(
          (key) => key.startsWith('sb-') || key.includes('supabase')
        )
        keysToRemove.forEach((key) => localStorage.removeItem(key))
        navigate('/auth/signin', { replace: true })
        return
      }

      // ─── 2. Flow detection ─────────────────────────────────
      // Supabase appends ?type=... to email-based redirects. No `type` param
      // means OAuth (hash-based) or already-authenticated revisit.
      const type = searchParams.get('type')
      const code = searchParams.get('code')
      const redirectParam = searchParams.get('redirect')

      // Password recovery: punt to /auth/update-password. The session will
      // be established via PASSWORD_RECOVERY in AuthContext and the update
      // page owns the UX.
      if (type === 'recovery') {
        setStatus('מעבירים אותך לאיפוס הסיסמה...')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Recovery code exchange failed:', error)
            navigate('/auth/reset-password', { replace: true })
            return
          }
        }
        navigate('/auth/update-password', { replace: true })
        return
      }

      // ─── 3. Code exchange (PKCE: email-confirm / magiclink / invite) ──
      if (code) {
        setStatus('בונים את הקן...')
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Code exchange failed:', error)
          navigate('/auth/signin', { replace: true })
          return
        }
      }

      // ─── 4. OAuth hash tokens — wait for Supabase client to process ──
      if (window.location.hash.includes('access_token')) {
        console.log('AuthCallback: access_token in hash, waiting for Supabase to process')
        setStatus('בונים את הקן...')
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // ─── 5. Retry getSession (OAuth session can be slow to establish) ─
      let session = null
      let attempts = 0
      const maxAttempts = 5

      while (!session && attempts < maxAttempts) {
        attempts++
        setStatus(`מתחבר... (${attempts}/${maxAttempts})`)
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('getSession error:', error)
          if (attempts === maxAttempts) {
            navigate('/auth/signin', { replace: true })
            return
          }
        }
        session = data.session
        if (!session && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      if (!session) {
        console.log('AuthCallback: no session after retries')
        navigate('/auth/signin', { replace: true })
        return
      }

      // ─── 6. Profile lookup ─────────────────────────────────
      setStatus('מתחילים להתרגש!')

      // Use maybeSingle() — the handle_new_user trigger may not have run
      // yet on a brand-new signup, and we tolerate that case.
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, first_name, last_name')
        .eq('id', session.user.id)
        .maybeSingle()

      // ─── 7. Google Ads conversion only ─────────────────────────
      // The admin_new_user notification used to fire here, but it carried no
      // onboarding data (no name, due date, referral source, first item).
      // It now fires from Onboarding.tsx as `admin_onboarding_completed` once
      // the user actually finishes onboarding, and from a pg_cron-driven
      // edge function (`notify-abandoned-signups`) as
      // `admin_onboarding_abandoned` ~10 min after signup if they don't finish.
      if (
        !profile?.onboarding_completed &&
        session.user.email_confirmed_at &&
        session.user.email
      ) {
        trackGoogleAdsSignupConversion(session.user.id)
        trackGoogleAdsPmaxSignupConversion(session.user.id)
      }

      // ─── 8. Final navigation ──────────────────────────────
      // A safe ?redirect= wins over the default destination (invite flow
      // needs us to land on /invite/<token> so InviteAccept can finish).
      if (isSafeRedirect(redirectParam)) {
        setStatus('חוזרים לעמוד הקודם...')
        navigate(redirectParam, { replace: true })
        return
      }

      if (profile?.onboarding_completed) {
        setStatus('מעבר ללוח הבקרה...')
        navigate('/dashboard', { replace: true })
      } else {
        setStatus('מעבר להרשמה...')
        navigate('/onboarding', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}

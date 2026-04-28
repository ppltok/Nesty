import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { asset } from '../../lib/assets'
import { buildCallbackUrl, isSafeRedirect } from '../../lib/authRedirect'
import { translateAuthError } from '../../lib/authErrors'
import { Sparkles, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'

const RESEND_COOLDOWN_SECONDS = 60

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  // Email+password form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null) // null = form state, string = "check your email" state

  // Resend-confirmation cooldown
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const cooldownRemaining = useMemo(() => {
    if (!cooldownUntil) return 0
    return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
  }, [cooldownUntil])

  // Tick cooldown display once per second while active
  useEffect(() => {
    if (!cooldownUntil) return
    const interval = setInterval(() => {
      if (Date.now() >= cooldownUntil) {
        setCooldownUntil(null)
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  // Redirect away if already authenticated (honor invite redirect)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const target = isSafeRedirect(redirectParam) ? redirectParam : '/dashboard'
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, redirectParam])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]">
        <div className="animate-spin w-10 h-10 border-4 border-[#6750a4] border-t-transparent rounded-full" />
      </div>
    )
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildCallbackUrl(redirectParam),
      },
    })

    if (error) {
      setError('שגיאה בהרשמה. נסו שוב.')
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const normalizedEmail = email.trim().toLowerCase()
    const errs: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      errs.email = 'כתובת אימייל לא תקינה'
    }
    if (password.length < 8) {
      errs.password = 'הסיסמה חייבת להכיל לפחות 8 תווים'
    } else if (!/[a-zA-Z]/.test(password)) {
      errs.password = 'הסיסמה חייבת להכיל לפחות אות אחת'
    } else if (!/\d/.test(password)) {
      errs.password = 'הסיסמה חייבת להכיל לפחות ספרה אחת'
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'הסיסמאות אינן תואמות'
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    setIsLoading(true)
    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        // No first_name in options.data — the handle_new_user trigger
        // defaults to email prefix, and the user sets their real name in
        // onboarding (same step Google users go through).
        emailRedirectTo: buildCallbackUrl(redirectParam),
      },
    })
    setIsLoading(false)

    if (signUpError) {
      // Rate-limit and weak-password are still surfaced via the translator.
      // "User already registered" returns a fake-success with empty identities
      // (anti-enumeration), which we do NOT surface — we show the same
      // check-your-email screen regardless.
      setError(translateAuthError(signUpError))
      return
    }

    // Switch to "check your email" state. Start the resend cooldown so we
    // don't let users spam the send button.
    setSubmittedEmail(normalizedEmail)
    setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
  }

  const handleResend = async () => {
    if (!submittedEmail) return
    if (cooldownUntil && Date.now() < cooldownUntil) return

    setResendLoading(true)
    setResendMessage(null)

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: submittedEmail,
      options: {
        emailRedirectTo: buildCallbackUrl(redirectParam),
      },
    })

    setResendLoading(false)
    if (resendError) {
      setResendMessage(translateAuthError(resendError))
    } else {
      setResendMessage('שלחנו שוב — בדקו את תיבת הדואר.')
    }
    setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
  }

  // ─── Check-your-email success state ────────────────────────
  if (submittedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4" dir="rtl">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center mb-8">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
          </Link>

          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#f3edff] flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#6750a4]" />
            </div>
            <h1 className="text-2xl font-medium text-[#1d192b] mb-3">
              בדקו את תיבת הדואר
            </h1>
            <p className="text-[#49454f] mb-2">
              שלחנו קישור אימות לכתובת
            </p>
            <p className="text-[#1d192b] font-medium mb-6 break-all">
              {submittedEmail}
            </p>
            <p className="text-[#49454f] text-sm mb-6 leading-relaxed">
              לחצו על הקישור במייל כדי לאשר את ההרשמה. אם לא קיבלתם מייל תוך כמה דקות,
              בדקו את תיקיית הספאם.
            </p>

            {resendMessage && (
              <div className="bg-[#f3edff] text-[#21005d] px-4 py-3 rounded-[16px] mb-4 text-sm">
                {resendMessage}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resendLoading || cooldownRemaining > 0}
              className="w-full px-6 py-3 rounded-[24px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {resendLoading
                ? 'שולחים...'
                : cooldownRemaining > 0
                  ? `שלחו שוב בעוד ${cooldownRemaining} שניות`
                  : 'לא קיבלתי — שלחו שוב'}
            </button>

            <button
              onClick={() => {
                setSubmittedEmail(null)
                setResendMessage(null)
                setCooldownUntil(null)
              }}
              className="text-[#6750a4] text-sm hover:underline"
            >
              החלפת כתובת אימייל
            </button>
          </div>

          <p className="text-center text-[#49454f] mt-4">
            <Link to="/" className="hover:text-[#6750a4] transition-colors">
              חזרה לדף הבית
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ─── Signup form (default) ─────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4 py-8" dir="rtl">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
        </Link>

        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#ffd8e4] text-[#31111d] px-4 py-2 rounded-full font-medium">
              <Sparkles className="w-4 h-4" />
              <span>הרשמה חינם</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-medium text-[#1d192b] mb-3">
              הצטרפו ל-Nesty
            </h1>
            <p className="text-[#49454f] text-lg">
              צרו את רשימת התינוק שלכם בדקות
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Google signup */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[28px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium text-lg hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-[#6750a4] border-t-transparent rounded-full" />
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                הרשמה עם Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#e7e0ec]" />
            <span className="text-[#49454f] text-sm">או</span>
            <div className="flex-1 h-px bg-[#e7e0ec]" />
          </div>

          {/* Email signup form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-[#49454f] mb-1.5">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-[16px] bg-white border-2 ${fieldErrors.email ? 'border-red-300' : 'border-[#e7e0ec]'} text-[#1d192b] focus:border-[#6750a4] focus:outline-none transition-colors text-right`}
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#49454f] mb-1.5">
                סיסמה
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pe-12 rounded-[16px] bg-white border-2 ${fieldErrors.password ? 'border-red-300' : 'border-[#e7e0ec]'} text-[#1d192b] focus:border-[#6750a4] focus:outline-none transition-colors`}
                  placeholder="לפחות 8 תווים, אות וספרה"
                  disabled={isLoading}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 start-3 flex items-center text-[#49454f] hover:text-[#6750a4]"
                  aria-label={showPassword ? 'הסתירו סיסמה' : 'הציגו סיסמה'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-[#49454f] mb-1.5">
                אימות סיסמה
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-[16px] bg-white border-2 ${fieldErrors.confirmPassword ? 'border-red-300' : 'border-[#e7e0ec]'} text-[#1d192b] focus:border-[#6750a4] focus:outline-none transition-colors`}
                placeholder="הקלידו שוב את הסיסמה"
                disabled={isLoading}
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg hover:bg-[#5a4593] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  הרשמה עם אימייל
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="text-center text-sm text-[#49454f] mt-6">
            בהרשמה, אתם מסכימים{' '}
            <a href="#" className="text-[#6750a4] hover:underline">לתנאי השימוש</a>
            {' '}ו
            <a href="#" className="text-[#6750a4] hover:underline">למדיניות הפרטיות</a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#49454f]">
            כבר יש לכם חשבון?{' '}
            <Link
              to={`/auth/signin${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              className="text-[#6750a4] font-medium hover:underline"
            >
              התחברו כאן
            </Link>
          </p>
        </div>

        <p className="text-center text-[#49454f] mt-4">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}

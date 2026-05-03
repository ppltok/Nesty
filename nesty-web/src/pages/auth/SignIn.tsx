import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { asset } from '../../lib/assets'
import { buildCallbackUrl, isSafeRedirect } from '../../lib/authRedirect'
import { translateAuthError } from '../../lib/authErrors'
import { LogIn, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // ?redirect=/invite/<token> comes from InviteAccept.tsx when a logged-out
  // user clicks the "already have an account" CTA. Threaded through auth so
  // the user lands back on the invite page instead of the dashboard.
  const redirectParam = searchParams.get('redirect')

  // Email+password form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated — honor redirect param first.
  // Also triggers after a successful email/password signin, which fires
  // SIGNED_IN in AuthContext and flips isAuthenticated true.
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildCallbackUrl(redirectParam),
      },
    })

    if (error) {
      setError('שגיאה בהתחברות. נסו שוב.')
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    setIsLoading(false)
    if (signInError) {
      setError(translateAuthError(signInError))
      return
    }
    // On success, AuthContext fires SIGNED_IN → isAuthenticated flips → the
    // useEffect above navigates us to redirect param or /dashboard.
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4 py-8" dir="rtl">
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
            <div className="inline-flex items-center gap-2 bg-[#f3edff] text-[#21005d] px-4 py-2 rounded-full font-medium">
              <LogIn className="w-4 h-4" />
              <span>התחברות</span>
            </div>
          </div>

          <div className="text-center mb-5">
            <h1 className="text-3xl font-medium text-[#1d192b] mb-2">
              ברוכים הבאים!
            </h1>
            <p className="text-[#49454f] text-lg">
              התחברו לחשבון שלכם
            </p>
          </div>

          {/* Above-the-fold signup CTA — most visitors who hit the wrong
              page default to trying the form; this pill makes the
              correct path unmissable without scrolling. */}
          <Link
            to={`/auth/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-[20px] bg-[#ffd8e4] hover:bg-[#ffc6d4] text-[#31111d] mb-5 transition-colors group"
          >
            <span className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#6750a4]" />
              חדשים ב-Nesty?
            </span>
            <span className="flex items-center gap-1 text-[#6750a4] font-bold text-sm">
              הירשמו בחינם
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>
          </Link>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] mb-6 text-center border border-red-100">
              <p>{error}</p>
              {/* When the error is a credentials-mismatch we can't tell whether
                  the email simply has no account yet — nudge toward signup so
                  the user isn't stuck guessing. */}
              {error.includes('שגויים') && (
                <p className="mt-2 text-sm">
                  <Link
                    to={`/auth/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                    className="text-[#6750a4] font-medium hover:underline"
                  >
                    הירשמו כאן →
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
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
                התחברות עם Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#e7e0ec]" />
            <span className="text-[#49454f] text-sm">או</span>
            <div className="flex-1 h-px bg-[#e7e0ec]" />
          </div>

          {/* Email signin form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-[16px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] focus:border-[#6750a4] focus:outline-none transition-colors text-right"
                placeholder="you@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm text-[#49454f]">
                  סיסמה
                </label>
                <Link
                  to="/auth/reset-password"
                  className="text-xs text-[#6750a4] hover:underline"
                >
                  שכחתם סיסמה?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pe-12 rounded-[16px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] focus:border-[#6750a4] focus:outline-none transition-colors"
                  placeholder="הסיסמה שלכם"
                  disabled={isLoading}
                  required
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
                  התחברות עם אימייל
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="text-center text-sm text-[#49454f] mt-6">
            בהתחברות, אתם מסכימים{' '}
            <a href="#" className="text-[#6750a4] hover:underline">לתנאי השימוש</a>
            {' '}ו
            <a href="#" className="text-[#6750a4] hover:underline">למדיניות הפרטיות</a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#49454f]">
            אין לכם חשבון עדיין?{' '}
            <Link
              to={`/auth/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              className="text-[#6750a4] font-medium hover:underline"
            >
              הירשמו בחינם
            </Link>
          </p>
        </div>

        <p className="text-center text-[#49454f] mt-4">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </main>
  )
}

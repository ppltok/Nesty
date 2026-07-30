import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { asset } from '../../lib/assets'
import { translateAuthError } from '../../lib/authErrors'
import { Mail, KeyRound } from 'lucide-react'

/**
 * First step of password reset: user enters their email and we ask Supabase
 * to send them a recovery link. The recovery link lands on /auth/callback
 * with ?type=recovery&code=... which AuthCallback routes to
 * /auth/update-password for step two.
 *
 * Security note: we always show the same generic success message regardless
 * of whether the email exists. Supabase doesn't leak enumeration info here,
 * but we still keep the UX identical in both branches.
 */
export default function ResetPasswordRequest() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    // The recoveryRedirectTo URL goes to /auth/callback so AuthCallback can
    // handle the PKCE code exchange and then forward to /auth/update-password.
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback?type=recovery`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo }
    )
    setIsLoading(false)

    if (resetError) {
      // Only surface true errors (rate limit, network) - not "user not found"
      // which Supabase doesn't return here but we still guard against.
      setError(translateAuthError(resetError))
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
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
            <p className="text-[#49454f] text-sm mb-6 leading-relaxed">
              אם קיים חשבון עם הכתובת {email.trim().toLowerCase()}, שלחנו אליו קישור לאיפוס סיסמה.
              הקישור בתוקף למשך שעה.
            </p>
            <Link
              to="/auth/signin"
              className="inline-block px-6 py-3 rounded-[24px] bg-[#6750a4] text-white font-medium hover:bg-[#5a4593] transition-colors"
            >
              חזרה להתחברות
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
            <div className="inline-flex items-center gap-2 bg-[#f3edff] text-[#21005d] px-4 py-2 rounded-full font-medium">
              <KeyRound className="w-4 h-4" />
              <span>איפוס סיסמה</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-medium text-[#1d192b] mb-3">
              שכחתם את הסיסמה?
            </h1>
            <p className="text-[#49454f]">
              הזינו את כתובת האימייל ונשלח קישור לאיפוס
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg hover:bg-[#5a4593] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : 'שלחו לי קישור לאיפוס'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/auth/signin" className="text-[#6750a4] text-sm hover:underline">
              חזרה להתחברות
            </Link>
          </div>
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

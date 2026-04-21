import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { asset } from '../../lib/assets'
import { translateAuthError } from '../../lib/authErrors'
import { KeyRound, Eye, EyeOff, XCircle } from 'lucide-react'

/**
 * Second step of password reset. User arrives here from a recovery link
 * after AuthCallback exchanged the code and established a session. They
 * enter a new password; we call `auth.updateUser({ password })`.
 *
 * Guard: we require a session to be present. If the link was bad/expired,
 * AuthCallback would have bounced them back to /auth/reset-password, but
 * they can also land here directly if they keep a tab open past the
 * session's lifetime — show the "link expired" state then.
 */
export default function UpdatePassword() {
  const navigate = useNavigate()
  const { session, profile, isLoading: authLoading } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errs: Record<string, string> = {}
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
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsLoading(false)

    if (updateError) {
      setError(translateAuthError(updateError))
      return
    }

    // Password changed. Send them onward; if onboarding was never finished,
    // go to /onboarding like the normal post-signup flow.
    navigate(profile?.onboarding_completed ? '/dashboard' : '/onboarding', {
      replace: true,
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff]">
        <div className="animate-spin w-10 h-10 border-4 border-[#6750a4] border-t-transparent rounded-full" />
      </div>
    )
  }

  // No session means the recovery link never established one (bad/expired/
  // tampered link). Show a friendly dead-end with a way back.
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4" dir="rtl">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center mb-8">
            <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
          </Link>
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-medium text-[#1d192b] mb-3">
              הקישור פג תוקף
            </h1>
            <p className="text-[#49454f] text-sm mb-6 leading-relaxed">
              קישור איפוס הסיסמה כבר לא בתוקף. אפשר לבקש חדש.
            </p>
            <Link
              to="/auth/reset-password"
              className="inline-block px-6 py-3 rounded-[24px] bg-[#6750a4] text-white font-medium hover:bg-[#5a4593] transition-colors"
            >
              בקשו קישור חדש
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
              <span>בחירת סיסמה חדשה</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-medium text-[#1d192b] mb-3">
              סיסמה חדשה
            </h1>
            <p className="text-[#49454f]">
              בחרו סיסמה חדשה לחשבון
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-[#49454f] mb-1.5">
                סיסמה חדשה
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
              ) : 'עדכנו סיסמה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

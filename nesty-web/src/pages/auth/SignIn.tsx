import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { asset } from '../../lib/assets'
import { LogIn } from 'lucide-react'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Show loading while checking auth status
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
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
      },
    })

    if (error) {
      setError('שגיאה בהתחברות. נסו שוב.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-8">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-20 w-auto" />
        </Link>

        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#f3edff] text-[#21005d] px-4 py-2 rounded-full font-medium">
              <LogIn className="w-4 h-4" />
              <span>התחברות</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium text-[#1d192b] mb-3">
              ברוכים הבאים!
            </h1>
            <p className="text-[#49454f] text-lg">
              התחברו עם חשבון Google כדי להתחיל
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

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
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
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

          {/* Email login - future feature placeholder */}
          <div className="text-center text-[#49454f] text-sm mb-6">
            התחברות באמצעות אימייל תהיה זמינה בקרוב
          </div>

          {/* Terms */}
          <div className="text-center text-sm text-[#49454f]">
            בהתחברות, אתם מסכימים{' '}
            <a href="#" className="text-[#6750a4] hover:underline">לתנאי השימוש</a>
            {' '}ו
            <a href="#" className="text-[#6750a4] hover:underline">למדיניות הפרטיות</a>
          </div>
        </div>

        {/* Don't have account */}
        <div className="mt-8 text-center">
          <p className="text-[#49454f]">
            אין לכם חשבון עדיין?{' '}
            <Link to="/auth/signup" className="text-[#6750a4] font-medium hover:underline">
              הירשמו בחינם
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-[#49454f] mt-4">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}

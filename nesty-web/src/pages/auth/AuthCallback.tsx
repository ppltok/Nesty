import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'tom@ppltok.com'

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
      console.log('AuthCallback: Hash:', window.location.hash)

      // Check for error in URL params (OAuth errors come this way)
      const errorCode = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Also check hash for errors (some OAuth providers put errors in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get('error')

      if (errorCode || hashError) {
        console.error('OAuth error:', errorCode || hashError, errorDescription || hashParams.get('error_description'))
        // Clear any corrupted auth state
        const keysToRemove = Object.keys(localStorage).filter(key =>
          key.startsWith('sb-') || key.includes('supabase')
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))
        navigate('/auth/signin', { replace: true })
        return
      }

      // If there's a hash with access_token, Supabase needs to process it
      // The hash contains the OAuth tokens that Supabase client will extract
      if (window.location.hash.includes('access_token')) {
        console.log('AuthCallback: Found access_token in hash, letting Supabase process...')
        setStatus('מעבד את הטוקן...')

        // Give Supabase time to process the hash and establish the session
        // The onAuthStateChange listener in AuthContext will handle this
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Try to get session with retries (OAuth can be slow to establish)
      let session = null
      let attempts = 0
      const maxAttempts = 5

      while (!session && attempts < maxAttempts) {
        attempts++
        console.log(`AuthCallback: Attempt ${attempts} to get session`)
        setStatus(`מתחבר... (${attempts}/${maxAttempts})`)

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          if (attempts === maxAttempts) {
            navigate('/auth/signin', { replace: true })
            return
          }
        }

        session = data.session

        if (!session && attempts < maxAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log('AuthCallback: getSession result:', { hasSession: !!session, attempts })

      if (session) {
        console.log('AuthCallback: Session found, checking profile for user', session.user.id)
        setStatus('בודק פרופיל...')

        // Check if user has completed onboarding
        // Use maybeSingle() instead of single() to handle case where profile doesn't exist yet
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_name, last_name')
          .eq('id', session.user.id)
          .maybeSingle()

        console.log('AuthCallback: Profile result:', { profile, profileError })

        // If profile doesn't have onboarding_completed, this is a new user
        // Send admin notification
        if (!profile?.onboarding_completed) {
          // Send admin notification for new signup (don't await, let it run in background)
          // Silently fail if edge function doesn't exist - don't block login
          try {
            supabase.functions.invoke('send-email', {
              body: {
                type: 'admin_new_user',
                to: ADMIN_EMAIL,
                data: {
                  userEmail: session.user.email,
                  userName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  signupDate: new Date().toLocaleDateString('he-IL'),
                },
              },
            }).catch((err) => console.warn('Failed to send admin notification (non-critical):', err))
          } catch (err) {
            console.warn('Edge function not available (non-critical):', err)
          }
        }

        if (profile?.onboarding_completed) {
          console.log('AuthCallback: Navigating to dashboard')
          setStatus('מעבר ללוח הבקרה...')
          navigate('/dashboard', { replace: true })
        } else {
          console.log('AuthCallback: Navigating to onboarding')
          setStatus('מעבר להרשמה...')
          navigate('/onboarding', { replace: true })
        }
      } else {
        console.log('AuthCallback: No session after retries, navigating to signin')
        navigate('/auth/signin', { replace: true })
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

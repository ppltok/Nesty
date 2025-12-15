import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'tom@ppltok.com'

export default function AuthCallback() {
  const navigate = useNavigate()
  const hasHandled = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double execution (React StrictMode, etc.)
      if (hasHandled.current) return
      hasHandled.current = true

      console.log('AuthCallback: Starting callback handling')

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/signin', { replace: true })
        return
      }

      if (session) {
        console.log('AuthCallback: Session found, checking profile for user', session.user.id)

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
          }).catch((err) => console.error('Failed to send admin notification:', err))
        }

        if (profile?.onboarding_completed) {
          console.log('AuthCallback: Navigating to dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          console.log('AuthCallback: Navigating to onboarding')
          navigate('/onboarding', { replace: true })
        }
      } else {
        console.log('AuthCallback: No session, navigating to signin')
        navigate('/auth/signin', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">מאמת את ההתחברות...</p>
      </div>
    </div>
  )
}

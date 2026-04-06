import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Users, CheckCircle, XCircle, LogIn } from 'lucide-react'

type InviteState =
  | 'loading'
  | 'needs_auth'
  | 'valid'
  | 'accepting'
  | 'accepted'
  | 'expired'
  | 'already_used'
  | 'error'
  | 'has_own_registry'
  | 'wrong_account'

interface InviteInfo {
  ownerName: string
  registryTitle: string | null
  invitedEmail: string
}

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading, registry, refreshProfile } = useAuth()
  const [state, setState] = useState<InviteState>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Validate the invitation token
  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setState('error')
      setError('קישור הזמנה לא תקין')
      return
    }

    validateInvitation()
  }, [token, authLoading, isAuthenticated])

  const validateInvitation = async () => {
    if (!token) return

    try {
      // Use Edge Function to validate (it uses service_role to bypass RLS)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        // Always include auth — use session if available, else anon key
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      }

      // If authenticated, use the user's session instead of anon key
      if (isAuthenticated) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-invitation`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ token, action: 'validate' }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        if (result.code === 'EXPIRED') {
          setState('expired')
        } else if (result.code === 'ALREADY_USED') {
          setState('already_used')
        } else {
          setState('error')
          setError(result.error || 'שגיאה בבדיקת ההזמנה')
        }
        return
      }

      setInviteInfo({
        ownerName: result.owner_name,
        registryTitle: result.registry_title,
        invitedEmail: result.invited_email,
      })

      if (!isAuthenticated) {
        setState('needs_auth')
        return
      }

      // Check if the logged-in user is the one who SENT this invite
      if (user?.email && result.invited_email !== user.email) {
        // The logged-in user is NOT the invited person — likely the owner clicking their own link
        setState('wrong_account')
        return
      }

      // Check if user already has their own registry
      if (registry && registry.owner_id === user?.id) {
        setState('has_own_registry')
        return
      }

      setState('valid')
    } catch (err) {
      console.error('Error validating invitation:', err)
      setState('error')
      setError('שגיאה בבדיקת ההזמנה')
    }
  }

  const handleAccept = async () => {
    if (!token || !isAuthenticated) return

    setState('accepting')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ token, action: 'accept' }),
        }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to accept')

      setState('accepted')
      await refreshProfile()

      // Redirect to dashboard after short delay
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      console.error('Error accepting invitation:', err)
      setState('error')
      setError(err.message || 'שגיאה בקבלת ההזמנה')
    }
  }

  const handleAcceptWithArchive = async () => {
    if (!token || !isAuthenticated) return

    setState('accepting')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ token, action: 'accept_archive_own' }),
        }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to accept')

      setState('accepted')
      await refreshProfile()
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      console.error('Error accepting invitation:', err)
      setState('error')
      setError(err.message || 'שגיאה בקבלת ההזמנה')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          {/* Loading */}
          {(state === 'loading' || authLoading) && (
            <div>
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">בודק את ההזמנה...</p>
            </div>
          )}

          {/* Needs auth — redirect to sign up/in */}
          {state === 'needs_auth' && inviteInfo && (
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הוזמנת לנהל רשימה יחד!
              </h1>
              <p className="text-muted-foreground mb-6">
                {inviteInfo.ownerName} הזמין/ה אותך לנהל יחד את רשימת התינוק ב-Nesty.
              </p>
              <div className="space-y-3">
                <Link to={`/auth/signup?redirect=/invite/${token}`}>
                  <Button className="w-full">
                    <LogIn className="w-4 h-4 ml-2" />
                    הרשמה ל-Nesty
                  </Button>
                </Link>
                <Link to={`/auth/signin?redirect=/invite/${token}`}>
                  <Button variant="outline" className="w-full mt-2">
                    כבר יש לי חשבון — התחברות
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Valid — ready to accept */}
          {state === 'valid' && inviteInfo && (
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הצטרפות לרשימה
              </h1>
              <p className="text-muted-foreground mb-6">
                {inviteInfo.ownerName} הזמין/ה אותך לנהל יחד את רשימת התינוק.
                תוכלו להוסיף, לערוך ולנהל פריטים ביחד.
              </p>
              <Button onClick={handleAccept} className="w-full">
                <CheckCircle className="w-4 h-4 ml-2" />
                הצטרפו לרשימה
              </Button>
            </div>
          )}

          {/* User has their own registry */}
          {state === 'has_own_registry' && inviteInfo && (
            <div>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                כבר יש לך רשימה
              </h1>
              <p className="text-muted-foreground mb-6">
                {inviteInfo.ownerName} הזמין/ה אותך להצטרף לרשימה שלהם.
                מה תרצו לעשות עם הרשימה הנוכחית שלכם?
              </p>
              <div className="space-y-3">
                <Button onClick={handleAcceptWithArchive} className="w-full">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  הצטרפו לרשימה של {inviteInfo.ownerName}
                </Button>
                <p className="text-xs text-muted-foreground">
                  הרשימה הקיימת שלכם תישמר בארכיון
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                  השאר עם הרשימה שלי
                </Button>
              </div>
            </div>
          )}

          {/* Accepting */}
          {state === 'accepting' && (
            <div>
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">מצרף אותך לרשימה...</p>
            </div>
          )}

          {/* Accepted */}
          {state === 'accepted' && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הצטרפת בהצלחה!
              </h1>
              <p className="text-muted-foreground">
                עוברים לרשימה המשותפת...
              </p>
            </div>
          )}

          {/* Expired */}
          {state === 'expired' && (
            <div>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                ההזמנה פגה
              </h1>
              <p className="text-muted-foreground mb-6">
                תוקף ההזמנה פג. בקשו מבן/בת הזוג לשלוח הזמנה חדשה.
              </p>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  חזרה לדף הבית
                </Button>
              </Link>
            </div>
          )}

          {/* Already used */}
          {state === 'already_used' && (
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                ההזמנה כבר מומשה
              </h1>
              <p className="text-muted-foreground mb-6">
                הזמנה זו כבר נוצלה. אם כבר הצטרפתם, עברו לרשימה.
              </p>
              <Link to="/dashboard">
                <Button className="w-full">
                  עבור לרשימה
                </Button>
              </Link>
            </div>
          )}

          {/* Wrong account — owner clicking their own invite link */}
          {state === 'wrong_account' && inviteInfo && (
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                ההזמנה הזו לא בשבילך
              </h1>
              <p className="text-muted-foreground mb-4">
                ההזמנה נשלחה אל <strong dir="ltr">{inviteInfo.invitedEmail}</strong>.
                כדי לקבל את ההזמנה, בן/בת הזוג צריכים לפתוח את הקישור מהמייל שלהם.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                💡 מחוברים עם חשבון אחר? התנתקו והתחברו עם החשבון הנכון.
              </p>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  חזרה לרשימה שלי
                </Button>
              </Link>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                שגיאה
              </h1>
              <p className="text-muted-foreground mb-6">
                {error || 'משהו השתבש. נסו שוב.'}
              </p>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  חזרה לדף הבית
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

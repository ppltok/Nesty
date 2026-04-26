import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  Settings as SettingsIcon,
  MapPin,
  Eye,
  EyeOff,
  MessageSquare,
  Trash2,
  Save,
  AlertTriangle,
  User,
  LogOut,
  Calendar,
  Users,
  Mail,
  RefreshCw,
  XCircle,
  UserMinus,
  ChevronLeft,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { RegistryInvitation, Profile } from '../types'

export default function Settings() {
  const { registry, profile, refreshProfile, signOut, isRegistryOwner, user } = useAuth()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hash navigation: scroll-into-view + temporary highlight when arriving via
  // #co-parent (e.g. from PartnerInviteCard). Delay slightly so the section
  // is mounted before scrolling.
  useEffect(() => {
    if (location.hash !== '#co-parent') return
    const t = setTimeout(() => {
      const el = document.getElementById('co-parent-section')
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('highlight')
      setTimeout(() => el.classList.remove('highlight'), 2400)
    }, 200)
    return () => clearTimeout(t)
  }, [location.hash])

  // Profile name form
  const [nameForm, setNameForm] = useState({
    firstName: '',
    lastName: '',
  })

  // Address form
  const [addressForm, setAddressForm] = useState({
    city: '',
    street: '',
    apt: '',
    postal: '',
    phone: '',
  })

  // Visibility
  const [isPublic, setIsPublic] = useState(true)
  const [addressIsPrivate, setAddressIsPrivate] = useState(false)

  // Welcome message
  const [welcomeMessage, setWelcomeMessage] = useState('')

  // Due date
  const [dueDate, setDueDate] = useState('')
  const [showDueDateWarning, setShowDueDateWarning] = useState(false)

  // Co-parent invite
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [pendingInvitation, setPendingInvitation] = useState<RegistryInvitation | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null)
  const [showRemovePartnerConfirm, setShowRemovePartnerConfirm] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Load current profile data
  useEffect(() => {
    if (profile) {
      setNameForm({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
      })
      setDueDate(profile.due_date ? profile.due_date.split('T')[0] : '')
    }
  }, [profile])

  // Load current registry data
  useEffect(() => {
    if (registry) {
      setAddressForm({
        city: registry.address_city || '',
        street: registry.address_street || '',
        apt: registry.address_apt || '',
        postal: registry.address_postal || '',
        phone: registry.address_phone || '',
      })
      setIsPublic(registry.is_public ?? true)
      setAddressIsPrivate(registry.address_is_private ?? false)
      setWelcomeMessage(registry.welcome_message || '')
    }
  }, [registry])

  // Load pending invitation and partner profile
  const fetchCoParentData = useCallback(async () => {
    if (!registry) return

    // If partner is linked, fetch their profile
    if (registry.partner_id) {
      const { data: partner } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', registry.partner_id)
        .maybeSingle()
      setPartnerProfile(partner)
      setPendingInvitation(null)
    } else if (isRegistryOwner) {
      // Check for pending invitation
      const { data: invitation } = await supabase
        .from('registry_invitations')
        .select('*')
        .eq('registry_id', registry.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setPendingInvitation(invitation)
      setPartnerProfile(null)
    }
  }, [registry, isRegistryOwner])

  useEffect(() => {
    fetchCoParentData()
  }, [fetchCoParentData])

  // Send co-parent invitation
  const handleSendInvitation = async () => {
    if (!registry || !profile || !user) return
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      showError('נא להזין כתובת מייל תקינה')
      return
    }
    if (email === profile.email) {
      showError('לא ניתן להזמין את עצמך')
      return
    }

    setInviteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            registry_id: registry.id,
            invited_email: email,
          }),
        }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send invitation')

      setInviteEmail('')
      await fetchCoParentData()
      showSuccess('ההזמנה נשלחה בהצלחה!')
    } catch (err: any) {
      console.error('Error sending invitation:', err)
      showError(err.message || 'שגיאה בשליחת ההזמנה')
    } finally {
      setInviteLoading(false)
    }
  }

  // Resend invitation
  const handleResendInvitation = async () => {
    if (!pendingInvitation) return
    setInviteLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            registry_id: registry!.id,
            invited_email: pendingInvitation.invited_email,
            resend: true,
          }),
        }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to resend')

      await fetchCoParentData()
      showSuccess('ההזמנה נשלחה מחדש!')
    } catch (err: any) {
      console.error('Error resending invitation:', err)
      showError(err.message || 'שגיאה בשליחה מחדש')
    } finally {
      setInviteLoading(false)
    }
  }

  // Cancel pending invitation
  const handleCancelInvitation = async () => {
    if (!pendingInvitation) return
    setInviteLoading(true)
    try {
      const { error } = await supabase
        .from('registry_invitations')
        .update({ status: 'revoked' })
        .eq('id', pendingInvitation.id)

      if (error) throw error
      setPendingInvitation(null)
      showSuccess('ההזמנה בוטלה')
    } catch (err) {
      console.error('Error cancelling invitation:', err)
      showError('שגיאה בביטול ההזמנה')
    } finally {
      setInviteLoading(false)
    }
  }

  // Remove partner
  const handleRemovePartner = async () => {
    if (!registry) return
    setInviteLoading(true)
    try {
      const { error } = await supabase
        .from('registries')
        .update({ partner_id: null })
        .eq('id', registry.id)

      if (error) throw error
      setShowRemovePartnerConfirm(false)
      setPartnerProfile(null)
      await refreshProfile()
      showSuccess('השיתוף הוסר בהצלחה')
    } catch (err) {
      console.error('Error removing partner:', err)
      showError('שגיאה בהסרת השיתוף')
    } finally {
      setInviteLoading(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setError(null)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setSuccessMessage(null)
  }

  // Save profile name
  const handleSaveName = async () => {
    if (!profile) return
    if (!nameForm.firstName.trim()) {
      showError('נא להזין שם פרטי')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: nameForm.firstName.trim(),
          last_name: nameForm.lastName.trim(),
        })
        .eq('id', profile.id)

      if (error) throw error
      await refreshProfile()
      showSuccess('השם נשמר בהצלחה')
    } catch (err) {
      console.error('Error saving name:', err)
      showError('שגיאה בשמירת השם')
    } finally {
      setIsLoading(false)
    }
  }

  // Save due date
  const handleSaveDueDate = async () => {
    if (!profile) return
    if (!dueDate) {
      showError('נא לבחור תאריך לידה משוער')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          due_date: dueDate,
          last_weekly_email_week: null, // Reset so the correct week email is sent next
        })
        .eq('id', profile.id)

      if (error) throw error
      await refreshProfile()
      setShowDueDateWarning(false)
      showSuccess('תאריך הלידה המשוער עודכן בהצלחה')
    } catch (err) {
      console.error('Error saving due date:', err)
      showError('שגיאה בשמירת תאריך הלידה')
    } finally {
      setIsLoading(false)
    }
  }

  // Save address
  const handleSaveAddress = async () => {
    if (!registry) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('registries')
        .update({
          address_city: addressForm.city || null,
          address_street: addressForm.street || null,
          address_apt: addressForm.apt || null,
          address_postal: addressForm.postal || null,
          address_phone: addressForm.phone || null,
        })
        .eq('id', registry.id)

      if (error) throw error
      await refreshProfile()
      showSuccess('הכתובת נשמרה בהצלחה')
    } catch (err) {
      console.error('Error saving address:', err)
      showError('שגיאה בשמירת הכתובת')
    } finally {
      setIsLoading(false)
    }
  }

  // Save visibility
  const handleSaveVisibility = async () => {
    if (!registry) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('registries')
        .update({ is_public: isPublic })
        .eq('id', registry.id)

      if (error) throw error
      await refreshProfile()
      showSuccess(isPublic ? 'הרשימה גלויה לכולם' : 'הרשימה מוסתרת')
    } catch (err) {
      console.error('Error saving visibility:', err)
      showError('שגיאה בשמירת ההגדרות')
    } finally {
      setIsLoading(false)
    }
  }

  // Save welcome message
  const handleSaveWelcomeMessage = async () => {
    if (!registry) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('registries')
        .update({ welcome_message: welcomeMessage || null })
        .eq('id', registry.id)

      if (error) throw error
      await refreshProfile()
      showSuccess('ההודעה נשמרה בהצלחה')
    } catch (err) {
      console.error('Error saving message:', err)
      showError('שגיאה בשמירת ההודעה')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'מחק את החשבון') {
      showError('נא להקליד "מחק את החשבון" לאישור')
      return
    }

    setIsLoading(true)
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session')
      }

      // Call the delete-account Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete account')
      }

      // Sign out locally
      await supabase.auth.signOut()

      // Redirect to home
      window.location.href = '/'
    } catch (err) {
      console.error('Error deleting account:', err)
      showError('שגיאה במחיקת החשבון')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              הגדרות
            </h1>
            <p className="text-muted-foreground">
              ניהול החשבון והרשימה שלכם
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Email preferences quick-link — fixes the old email unsubscribe
              dead-end where "הסרה מרשימת התפוצה" landed here with no UI. */}
          <Link
            to="/settings/emails"
            className="flex items-center gap-4 bg-white rounded-2xl border border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold text-foreground mb-0.5">ניהול העדפות אימייל</p>
              <p className="text-sm text-muted-foreground">
                בחרי אילו אימיילים תרצי לקבל — עדכון שבועי, תזכורות, התראות מחיר ועוד
              </p>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </Link>

          {/* Profile Name Section */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">פרטים אישיים</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="שם פרטי"
                value={nameForm.firstName}
                onChange={(e) => setNameForm({ ...nameForm, firstName: e.target.value })}
                placeholder="ישראל"
              />
              <Input
                label="שם משפחה"
                value={nameForm.lastName}
                onChange={(e) => setNameForm({ ...nameForm, lastName: e.target.value })}
                placeholder="ישראלי"
              />
            </div>

            <Button onClick={handleSaveName} isLoading={isLoading} className="mt-4">
              <Save className="w-4 h-4 ml-2" />
              שמור שם
            </Button>
          </div>

          {/* Due Date Section */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">תאריך לידה משוער</h2>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              התאריך משפיע על העדכונים השבועיים, הצ'קליסט והתכנים שמותאמים לך
            </p>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value)
                setShowDueDateWarning(false)
              }}
              className="block w-full min-w-0 max-w-full box-border appearance-none rounded-xl border border-border bg-white px-4 py-3 text-foreground text-center focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors [&::-webkit-date-and-time-value]:text-center [&::-webkit-date-and-time-value]:min-h-[1.5em]"
              dir="ltr"
            />

            {!showDueDateWarning ? (
              <Button
                onClick={() => {
                  // Only show warning if the date actually changed
                  const currentDate = profile?.due_date ? profile.due_date.split('T')[0] : ''
                  if (dueDate === currentDate) {
                    showSuccess('התאריך לא השתנה')
                    return
                  }
                  setShowDueDateWarning(true)
                }}
                variant="outline"
                className="mt-4"
              >
                <Save className="w-4 h-4 ml-2" />
                עדכון תאריך
              </Button>
            ) : (
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      שינוי תאריך הלידה ישפיע על:
                    </p>
                    <ul className="text-sm text-amber-700 mt-1 space-y-1 list-disc list-inside">
                      <li>העדכונים השבועיים שתקבלי במייל</li>
                      <li>שבוע ההריון שמוצג באפליקציה</li>
                      <li>התכנים המותאמים בצ'קליסט</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDueDateWarning(false)
                      setDueDate(profile?.due_date ? profile.due_date.split('T')[0] : '')
                    }}
                  >
                    ביטול
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveDueDate}
                    isLoading={isLoading}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    אישור עדכון
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">כתובת למשלוח</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="עיר"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="תל אביב"
                />
                <Input
                  label="רחוב ומספר"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="הרצל 1"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="דירה"
                  value={addressForm.apt}
                  onChange={(e) => setAddressForm({ ...addressForm, apt: e.target.value })}
                  placeholder="5"
                />
                <Input
                  label="מיקוד"
                  value={addressForm.postal}
                  onChange={(e) => setAddressForm({ ...addressForm, postal: e.target.value })}
                  placeholder="1234567"
                />
                <Input
                  label="טלפון"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="050-1234567"
                />
              </div>

              <Button onClick={handleSaveAddress} isLoading={isLoading}>
                <Save className="w-4 h-4 ml-2" />
                שמור כתובת
              </Button>

              {/* Hide Address Toggle */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">הסתר כתובת מאורחים</h3>
                    <p className="text-sm text-muted-foreground">
                      {addressIsPrivate
                        ? 'הכתובת מוסתרת - רק אתם יכולים לראות אותה'
                        : 'הכתובת גלויה לכל מי שרוכש מתנה'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!registry) return
                      const newValue = !addressIsPrivate
                      setAddressIsPrivate(newValue)
                      setIsLoading(true)
                      try {
                        const { error } = await supabase
                          .from('registries')
                          .update({ address_is_private: newValue })
                          .eq('id', registry.id)
                        if (error) throw error
                        await refreshProfile()
                        showSuccess(newValue ? 'הכתובת מוסתרת' : 'הכתובת גלויה')
                      } catch (err) {
                        console.error('Error saving address privacy:', err)
                        setAddressIsPrivate(!newValue) // Revert on error
                        showError('שגיאה בשמירת ההגדרות')
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    className={`
                      relative w-14 h-8 rounded-full transition-colors
                      ${addressIsPrivate ? 'bg-primary' : 'bg-muted'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                        ${addressIsPrivate ? 'right-1' : 'left-1'}
                      `}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Section */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              {isPublic ? (
                <Eye className="w-5 h-5 text-primary" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <h2 className="text-lg font-bold text-foreground">גלויות הרשימה</h2>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              {isPublic
                ? 'הרשימה גלויה לכל מי שיש לו את הקישור'
                : 'הרשימה מוסתרת - אף אחד לא יכול לראות אותה'}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`
                  relative w-14 h-8 rounded-full transition-colors
                  ${isPublic ? 'bg-primary' : 'bg-muted'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform
                    ${isPublic ? 'right-1' : 'left-1'}
                  `}
                />
              </button>
              <span className="font-medium">
                {isPublic ? 'גלוי' : 'מוסתר'}
              </span>
            </div>

            <Button onClick={handleSaveVisibility} isLoading={isLoading} className="mt-4">
              <Save className="w-4 h-4 ml-2" />
              שמור
            </Button>
          </div>

          {/* Welcome Message Section */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">הודעה למבקרים</h2>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              הודעה שתופיע למבקרים ברשימה שלכם
            </p>

            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="תודה שבאתם לצפות ברשימה שלנו! אנחנו מעריכים כל תמיכה ועזרה..."
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
              rows={4}
            />

            <Button onClick={handleSaveWelcomeMessage} isLoading={isLoading} className="mt-4">
              <Save className="w-4 h-4 ml-2" />
              שמור הודעה
            </Button>
          </div>

          {/* Co-Parent Sharing Section */}
          <div id="co-parent-section" className="bg-white rounded-2xl border border-border p-6 scroll-mt-24 transition-shadow [&.highlight]:ring-4 [&.highlight]:ring-primary/40 [&.highlight]:shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">שיתוף הורה נוסף</h2>
            </div>

            {/* Partner is linked */}
            {registry?.partner_id && partnerProfile ? (
              <div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                    {partnerProfile.first_name?.[0] || partnerProfile.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {partnerProfile.first_name} {partnerProfile.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {partnerProfile.email}
                    </p>
                  </div>
                  <div className="text-xs text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
                    משותף
                  </div>
                </div>

                {isRegistryOwner && (
                  <div className="mt-4">
                    {!showRemovePartnerConfirm ? (
                      <button
                        onClick={() => setShowRemovePartnerConfirm(true)}
                        className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                      >
                        <UserMinus className="w-4 h-4" />
                        הסר שיתוף
                      </button>
                    ) : (
                      <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-destructive font-medium">
                            {partnerProfile.first_name} יאבד/תאבד גישה לרשימה. האם להמשיך?
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRemovePartnerConfirm(false)}
                          >
                            ביטול
                          </Button>
                          <Button
                            size="sm"
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={handleRemovePartner}
                            isLoading={inviteLoading}
                          >
                            <UserMinus className="w-4 h-4 ml-2" />
                            הסר שיתוף
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isRegistryOwner && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    הרשימה משותפת איתך. רק בעל/ת הרשימה יכול/ה לנהל את השיתוף.
                  </p>
                )}
              </div>
            ) : pendingInvitation ? (
              /* Pending invitation */
              <div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      הזמנה נשלחה אל
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {pendingInvitation.invited_email}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      תפוגה ב-{new Date(pendingInvitation.expires_at).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                  <div className="text-xs text-amber-700 font-medium bg-amber-100 px-3 py-1 rounded-full">
                    ממתין
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                  <span className="mt-0.5">💡</span>
                  <span>לא קיבלו? בקשו מבן/בת הזוג לבדוק בתיקיית הספאם או הדואר הזבל.</span>
                </p>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendInvitation}
                    isLoading={inviteLoading}
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    שלח מחדש
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelInvitation}
                    isLoading={inviteLoading}
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    בטל הזמנה
                  </Button>
                </div>
              </div>
            ) : isRegistryOwner ? (
              /* No partner, no pending — show invite form */
              <div>
                <p className="text-muted-foreground text-sm mb-4">
                  הזמינו את בן/בת הזוג לנהל יחד את רשימת התינוק. שניכם תוכלו להוסיף, לערוך ולנהל פריטים.
                </p>

                <div className="flex gap-3">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="כתובת המייל של בן/בת הזוג"
                    type="email"
                    dir="ltr"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendInvitation()
                    }}
                  />
                  <Button
                    onClick={handleSendInvitation}
                    isLoading={inviteLoading}
                    className="whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 ml-2" />
                    שלח הזמנה
                  </Button>
                </div>
              </div>
            ) : (
              /* Partner viewing — no invite capability */
              <p className="text-muted-foreground text-sm">
                רק בעל/ת הרשימה יכול/ה להזמין הורה נוסף.
              </p>
            )}
          </div>

          {/* Logout Section */}
          <div className="bg-[#f9f7fc] rounded-2xl border border-[#e7e0ec] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-[#e7e0ec]">
                  <LogOut className="w-5 h-5 text-[#6750a4]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">התנתקות</h2>
                  <p className="text-muted-foreground text-xs">תוכלו להתחבר מחדש בכל עת</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e7e0ec] bg-white text-[#49454f] font-medium hover:bg-[#f3edff] hover:text-[#6750a4] hover:border-[#d0bcff] transition-colors active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                התנתק
              </button>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-destructive/30 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#ffebee] rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-lg font-bold text-destructive">אזור מסוכן</h2>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים, הרשימה והמתנות יימחקו לצמיתות.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                מחק את החשבון שלי
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">
                    האם אתם בטוחים? הקלידו &quot;מחק את החשבון&quot; לאישור
                  </p>
                </div>

                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="מחק את החשבון"
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    ביטול
                  </Button>
                  <Button
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                    isLoading={isLoading}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    מחק לצמיתות
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

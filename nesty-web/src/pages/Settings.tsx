import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Settings() {
  const { registry, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  // Welcome message
  const [welcomeMessage, setWelcomeMessage] = useState('')

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Load current data
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
      setWelcomeMessage(registry.welcome_message || '')
    }
  }, [registry])

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setError(null)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setSuccessMessage(null)
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

          {/* Delete Account Section */}
          <div className="bg-white rounded-2xl border border-destructive/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-bold text-destructive">מחיקת חשבון</h2>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              פעולה זו תמחק את החשבון שלכם לצמיתות, כולל כל הנתונים, הרשימה והמתנות. לא ניתן לבטל פעולה זו.
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

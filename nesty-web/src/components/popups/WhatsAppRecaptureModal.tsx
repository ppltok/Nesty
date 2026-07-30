// WhatsApp re-capture - one-time modal for users who finished onboarding
// before the phone step existed (or skipped it). Captures the number inline
// with the same gift-alert pitch as onboarding step 5.
//
// Exposure policy (gentle by design - see the setup-completion plan):
//   1st "לא עכשיו" → snooze timestamp in dismissed_popups.whatsapp_recapture
//   after 7 days   → shows one final time (finalShow=true)
//   2nd "לא עכשיו" → permanent dismissal. Saving always dismisses permanently.

import { useState } from 'react'
import { X, Gift, Tag, Heart, Phone, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { dismissPopup } from '../../hooks/usePopups'
import { formatIlPhone, isIlMobileValid, ilToE164 } from '../../lib/phone'

interface Props {
  userId: string
  /** True when this is the post-snooze, last-ever exposure. */
  finalShow: boolean
  onClose: () => void
  /** Called after a successful save so the parent can refresh the profile. */
  onSaved: () => void
}

const BENEFITS = [
  { icon: Gift, text: 'עדכון ברגע שמישהו קונה לך מתנה', bg: 'bg-[#ffd8e4]/60', fg: 'text-[#ba1a5c]' },
  { icon: Tag, text: 'נגיד לך אם מחיר ברשימה יורד', bg: 'bg-[#e8f5e9]', fg: 'text-[#2e7d32]' },
  { icon: Heart, text: 'תזכורות עדינות, בקצב שלך', bg: 'bg-[#f3edff]', fg: 'text-[#6750a4]' },
]

export default function WhatsAppRecaptureModal({ userId, finalShow, onClose, onSaved }: Props) {
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const digits = phone.replace(/\D/g, '')
  const valid = isIlMobileValid(digits)

  const handleDismiss = async () => {
    onClose()
    await dismissPopup(userId, 'whatsapp_recapture', finalShow ? 'permanent' : 'snooze')
  }

  const handleSave = async () => {
    if (!valid || isSaving) return
    setIsSaving(true)
    setError(null)
    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        phone_number: ilToE164(phone),
        whatsapp_opt_in: true,
        whatsapp_consented_at: new Date().toISOString(),
      })
      .eq('id', userId)
    if (saveError) {
      console.error('[whatsapp_recapture] save failed:', saveError)
      setError('משהו השתבש בשמירה. נסי שוב עוד רגע.')
      setIsSaving(false)
      return
    }
    await dismissPopup(userId, 'whatsapp_recapture', 'permanent')
    setSaved(true)
    setIsSaving(false)
    onSaved()
    setTimeout(onClose, 2200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300"
        dir="rtl"
      >
        {!saved && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}

        {saved ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-[#2e7d32]" />
            </div>
            <h2 className="text-xl font-bold text-[#1d192b] mb-2">מעולה, את מחוברת!</h2>
            <p className="text-sm text-[#49454f]">
              נשלח לך וואטסאפ ברגע שנכנסת המתנה הראשונה. עד אז - שקט.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative w-14 h-14 mx-auto mb-3">
              <div className="w-14 h-14 bg-[#f3edff] rounded-[18px] flex items-center justify-center">
                <Gift className="w-7 h-7 text-[#6750a4]" />
              </div>
              <span className="absolute -bottom-1.5 -left-3 bg-[#25d366] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                וואטסאפ
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#1d192b] mb-1 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-[#6750a4] fill-current flex-shrink-0" />
              חדש: עדכונים בוואטסאפ
              <Heart className="w-4 h-4 text-[#6750a4] fill-current flex-shrink-0" />
            </h2>
            <p className="text-sm text-[#49454f] mb-4">
              הוסיפי מספר - ואל תפספסי כלום!
            </p>

            <div className="space-y-2 mb-4 text-right">
              {BENEFITS.map((benefit) => {
                const BenefitIcon = benefit.icon
                return (
                  <div
                    key={benefit.text}
                    className="flex items-center gap-3 p-2 rounded-[12px] border border-[#e7e0ec] bg-white"
                  >
                    <span className={`w-7 h-7 rounded-[9px] ${benefit.bg} flex items-center justify-center flex-shrink-0`}>
                      <BenefitIcon className={`w-3.5 h-3.5 ${benefit.fg}`} />
                    </span>
                    <p className="text-[13px] font-medium text-[#1d192b]">{benefit.text}</p>
                  </div>
                )
              })}
            </div>

            <div
              className={`flex items-center gap-2 px-3 rounded-[14px] border-2 bg-white transition-colors ${
                valid ? 'border-[#25d366]' : 'border-[#e7e0ec] focus-within:border-[#6750a4]'
              }`}
            >
              <Phone className="w-4 h-4 text-[#6750a4] flex-shrink-0" aria-hidden="true" />
              <input
                type="tel"
                inputMode="numeric"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(formatIlPhone(e.target.value))}
                placeholder="050-000-0000"
                aria-label="מספר נייד"
                className="flex-1 min-w-0 py-2.5 bg-transparent text-center text-base font-medium text-[#1d192b] tracking-wide placeholder:text-[#49454f]/50 focus:outline-none"
              />
              {valid ? (
                <CheckCircle className="w-4 h-4 text-[#25d366] flex-shrink-0" />
              ) : (
                <span className="w-4 flex-shrink-0" />
              )}
            </div>
            {digits.length > 0 && !valid && (
              <p className="text-xs text-red-600 mt-1.5">
                מספר נייד ישראלי - 10 ספרות שמתחילות ב-05
              </p>
            )}
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}

            <button
              onClick={handleSave}
              disabled={!valid || isSaving}
              className="w-full mt-4 bg-gradient-to-l from-[#7c4dbd] to-[#9b62d4] text-white font-bold py-3 px-6 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'שומרים…' : 'כן, עדכנו אותי בוואטסאפ'}
            </button>

            <button
              onClick={handleDismiss}
              className="w-full mt-2.5 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#e7e0ec] text-[#49454f] font-medium text-sm hover:border-[#6750a4] hover:text-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300"
            >
              לא עכשיו
            </button>

            <p className="text-[11px] text-[#49454f] mt-3 leading-relaxed">
              בלחיצה על "כן" את מאשרת קבלת הודעות וואטסאפ מ-Nesty (באבו קפיטל בע"מ).
              בלי ספאם <Lock className="inline w-2.5 h-2.5 align-[-1px]" /> מבטלים בכל רגע, בהודעה אחת.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

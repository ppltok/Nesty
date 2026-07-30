import { Sparkles, X } from 'lucide-react'
import { dismissPopup } from '../../hooks/usePopups'

interface Props {
  userId: string
  onClose: () => void
  onView: () => void
}

export default function CheckoutRegistryPromptModal({ userId, onClose, onView }: Props) {
  const handleView = async () => {
    // User actually viewed the registry - dismiss permanently.
    await dismissPopup(userId, 'checkout_registry_5', 'permanent')
    onClose()
    onView()
  }

  const handleDismiss = async () => {
    // "Not now" - snooze for a few days, then nudge again.
    await dismissPopup(userId, 'checkout_registry_5', 'snooze')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300" dir="rtl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          <p className="text-5xl mb-3">🪺</p>
          <h2 className="text-2xl font-bold text-[#1d192b] mb-2">הקן שלך מתחיל להיראות מדהים</h2>
          <p className="text-sm text-[#49454f] mb-6 leading-relaxed">
            כבר 5 פריטים ברשימה!<br />
            תראי איך היא תיראה למשפחה ולחברים שתשתפי איתם.
          </p>

          <button
            onClick={handleView}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-[#7c4dbd] to-[#9b62d4] text-white font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-opacity mb-3"
          >
            <Sparkles className="w-5 h-5" />
            תראי איך זה נראה לאורחים
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 text-sm text-[#49454f] hover:text-[#1d192b] transition-colors"
          >
            לא עכשיו
          </button>
        </div>
      </div>
    </div>
  )
}

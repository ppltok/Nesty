// Post-onboarding wizard: three choice-cards shown once after signup
// completes. Dismiss persists to profiles.dismissed_popups.post_onboarding.
// Re-shows on future visits until dismissed (no local cap - the user sees it
// until they click a card or "later", then never again).

import { useNavigate } from 'react-router-dom'
import { BookOpen, Chrome, Pencil, X } from 'lucide-react'
import { dismissPopup } from '../../hooks/usePopups'

interface Props {
  userId: string
  onClose: () => void
  onAddItem?: () => void
}

const CHROME_WEB_STORE_URL = 'https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll'

export default function PostOnboardingWizard({ userId, onClose, onAddItem }: Props) {
  const navigate = useNavigate()

  const handle = async (action: 'checklist' | 'extension' | 'add') => {
    // Persist dismiss first so the modal doesn't reappear on next navigation.
    await dismissPopup(userId, 'post_onboarding')
    onClose()
    if (action === 'checklist') navigate('/checklist')
    else if (action === 'extension') window.open(CHROME_WEB_STORE_URL, '_blank', 'noopener')
    else if (action === 'add') onAddItem?.()
  }

  const handleDismiss = async () => {
    await dismissPopup(userId, 'post_onboarding')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-4 duration-300" dir="rtl">
        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="סגור"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🎉</p>
          <h2 className="text-2xl font-bold text-[#1d192b] mb-2">מעולה, נרשמת!</h2>
          <p className="text-sm text-[#49454f]">איך תרצי להתחיל?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handle('checklist')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#e7e0ec] hover:border-[#7c4dbd] hover:bg-[#f9f5ff] transition-all text-right group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#f3edff] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e8daf5]">
              <BookOpen className="w-6 h-6 text-[#7c4dbd]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1d192b]">גלי את הצ'קליסט</p>
              <p className="text-xs text-[#49454f] mt-0.5">ראי מה כדאי לכלול ברשימה</p>
            </div>
          </button>

          <button
            onClick={() => handle('extension')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#e7e0ec] hover:border-[#7c4dbd] hover:bg-[#f9f5ff] transition-all text-right group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#f3edff] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e8daf5]">
              <Chrome className="w-6 h-6 text-[#7c4dbd]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1d192b]">התקיני את התוסף לכרום</p>
              <p className="text-xs text-[#49454f] mt-0.5">הוסיפי פריטים בקליק מכל אתר</p>
            </div>
          </button>

          {onAddItem && (
            <button
              onClick={() => handle('add')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#e7e0ec] hover:border-[#7c4dbd] hover:bg-[#f9f5ff] transition-all text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#f3edff] flex items-center justify-center flex-shrink-0 group-hover:bg-[#e8daf5]">
                <Pencil className="w-6 h-6 text-[#7c4dbd]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1d192b]">יש לי כבר לינק למוצר</p>
                <p className="text-xs text-[#49454f] mt-0.5">הוסיפי פריט ישירות מ-URL</p>
              </div>
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="w-full mt-4 py-3 text-sm text-[#49454f] hover:text-[#1d192b] transition-colors"
        >
          אתחיל מאוחר יותר
        </button>
      </div>
    </div>
  )
}

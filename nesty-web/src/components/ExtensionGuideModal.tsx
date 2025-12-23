/**
 * Extension Guide Modal
 * Shows users how to use the Chrome extension when they try to add items without it
 */

import { Chrome, X, ExternalLink, ShoppingBag, MousePointerClick, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface ExtensionGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExtensionGuideModal({ isOpen, onClose }: ExtensionGuideModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('nesty_extension_guide_dismissed', 'true')
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#6750a4] to-[#381e72] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 z-10 cursor-pointer"
            aria-label="סגור"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Chrome className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">יש דרך יותר קלה!</h2>
            <p className="text-[#eaddff] text-sm">הוסיפו מוצרים ישירות מכל אתר קניות - פשוט ומהיר</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#f3edff] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#6750a4] font-bold text-lg">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-5 h-5 text-[#6750a4]" />
                <h3 className="font-bold text-[#1d192b]">גלשו באתר הקניות המועדף</h3>
              </div>
              <p className="text-sm text-[#49454f] leading-relaxed">
                היכנסו לכל אתר קניות ומצאו את המוצר שאתם רוצים להוסיף לרשימה
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#f3edff] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#6750a4] font-bold text-lg">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="w-5 h-5 text-[#6750a4]" />
                <h3 className="font-bold text-[#1d192b]">לחצו על כפתור Nesty</h3>
              </div>
              <p className="text-sm text-[#49454f] leading-relaxed">
                כשמצאתם את המוצר, פשוט לחצו על אייקון התוסף בדפדפן
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#f3edff] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#6750a4] font-bold text-lg">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-[#6750a4]" />
                <h3 className="font-bold text-[#1d192b]">הוסיפו לרשימה!</h3>
              </div>
              <p className="text-sm text-[#49454f] leading-relaxed">
                הפרטים יתמלאו אוטומטית, פשוט לחצו "הוסף" - וזהו!
              </p>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-[#fef7ff] border border-[#e7e0ec] rounded-2xl p-4">
            <p className="text-sm font-semibold text-[#381e72] mb-2">לא רואים את הכפתור?</p>
            <p className="text-xs text-[#49454f] leading-relaxed">
              נסו ללחוץ על סמל הפאזל 🧩 בסרגל הדפדפן. אם זה לא עובד, נסו{' '}
              <a
                href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6750a4] font-semibold hover:underline inline-flex items-center gap-1"
              >
                להתקין את התוסף שוב
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Don't show again checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-[#e7e0ec] text-[#6750a4] focus:ring-2 focus:ring-[#6750a4]/20 cursor-pointer"
            />
            <span className="text-sm text-[#49454f]">אל תציג לי הודעה זו שוב</span>
          </label>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-full border border-[#e7e0ec] text-[#49454f] font-bold text-sm hover:bg-[#f3edff] hover:text-[#6750a4] hover:border-[#d0bcff] transition-all"
            >
              אמשיך בלי התוסף
            </button>
            <a
              href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#6750a4] text-white font-bold text-sm hover:bg-[#503e85] transition-all shadow-md active:scale-95"
            >
              <Chrome className="w-5 h-5" />
              התקן תוסף
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

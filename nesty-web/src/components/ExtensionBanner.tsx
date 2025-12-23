/**
 * Extension Banner Component
 * Shows a promotional banner when Chrome extension is not installed
 */

import { X, Chrome, Zap } from 'lucide-react'
import { useState } from 'react'
import { useExtensionDetection } from '../hooks/useExtensionDetection'

export default function ExtensionBanner() {
  const { isInstalled, isLoading } = useExtensionDetection()
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if user previously dismissed the banner
    return localStorage.getItem('nesty_extension_banner_dismissed') === 'true'
  })

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('nesty_extension_banner_dismissed', 'true')
  }

  // Don't show if:
  // - Still loading
  // - Extension is installed
  // - User dismissed the banner
  if (isLoading || isInstalled || isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-[#6750a4] to-[#381e72] rounded-[24px] p-6 mb-6 relative overflow-hidden shadow-lg">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 z-20 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer"
        aria-label="סגור"
        type="button"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
          <Chrome className="w-7 h-7 text-[#d0bcff]" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">הוסיפו מוצרים בקליק אחד!</h3>
            <Zap className="w-5 h-5 text-[#ffd600] fill-[#ffd600]" />
          </div>
          <p className="text-[#eaddff] text-sm leading-relaxed max-w-2xl">
            התקינו את התוסף לדפדפן כרום והוסיפו מוצרים לרשימה ישירות מכל אתר קניות - בלי להעתיק קישורים או לעבור בין חלונות
          </p>
        </div>

        {/* CTA Button */}
        <a
          href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-[#381e72] px-6 py-3 rounded-full font-bold hover:bg-[#eaddff] transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          <Chrome className="w-5 h-5" />
          התקן תוסף
        </a>
      </div>
    </div>
  )
}

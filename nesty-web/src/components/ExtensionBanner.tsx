import { X, Chrome, Zap, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useExtensionDetection } from '../hooks/useExtensionDetection'

export default function ExtensionBanner() {
  const { isInstalled, isLoading } = useExtensionDetection()
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('nesty_extension_banner_dismissed') === 'true'
  })
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('nesty_extension_banner_dismissed', 'true')
  }

  if (isLoading || isDismissed) {
    return null
  }

  if (!isMobile && isInstalled) {
    return null
  }

  if (isMobile) {
    return (
      <div className="bg-gradient-to-br from-[#6750a4] to-[#381e72] rounded-[24px] p-5 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 z-20 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer"
          aria-label="סגור"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
            <Monitor className="w-6 h-6 text-[#d0bcff]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1">חוויית ההוספה טובה יותר במחשב</h3>
            <p className="text-[#eaddff] text-xs leading-relaxed">
              היכנסו מהמחשב והתקינו את התוסף לכרום כדי להוסיף מוצרים בקליק אחד מכל אתר קניות
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-[#6750a4] to-[#381e72] rounded-[24px] p-6 pr-14 mb-6 relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <button
        onClick={handleDismiss}
        className="absolute top-3 left-3 z-20 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer"
        aria-label="סגור"
        type="button"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 md:pl-[25px]">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
          <Chrome className="w-7 h-7 text-[#d0bcff]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white">הוסיפו מוצרים בקליק אחד!</h3>
            <Zap className="w-5 h-5 text-[#ffd600] fill-[#ffd600]" />
          </div>
          <p className="text-[#eaddff] text-sm leading-relaxed max-w-2xl">
            התקינו את התוסף לדפדפן כרום והוסיפו מוצרים לרשימה ישירות מכל אתר קניות - בלי להעתיק קישורים או לעבור בין חלונות
          </p>
        </div>

        <a
          href="https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-[#381e72] px-6 py-3 rounded-full font-bold hover:bg-[#eaddff] transition-all shadow-md active:scale-95 whitespace-nowrap mr-[25px]"
        >
          <Chrome className="w-5 h-5" />
          התקן תוסף
        </a>
      </div>
    </div>
  )
}

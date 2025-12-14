import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { Sparkles, PartyPopper } from 'lucide-react'

interface OnboardingCelebrationProps {
  userName: string
  onComplete: () => void
}

export default function OnboardingCelebration({ userName, onComplete }: OnboardingCelebrationProps) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Fire confetti from both sides
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#6750a4', '#d0bcff', '#ffd8e4', '#ffb4ab', '#7dc4e4'],
      })

      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#6750a4', '#d0bcff', '#ffd8e4', '#ffb4ab', '#7dc4e4'],
      })
    }, 250)

    // Show button after confetti starts
    const buttonTimer = setTimeout(() => {
      setShowButton(true)
    }, 1500)

    return () => {
      clearInterval(interval)
      clearTimeout(buttonTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fffbff]" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d0bcff]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center px-6 max-w-lg">
        {/* Celebration Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#6750a4] to-[#9a82db] rounded-[40px] flex items-center justify-center shadow-2xl shadow-[#6750a4]/30 animate-bounce">
            <PartyPopper className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ffd8e4] rounded-full flex items-center justify-center animate-ping">
            <Sparkles className="w-4 h-4 text-[#ba1a5c]" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#d0bcff] rounded-full flex items-center justify-center animate-ping" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-4 h-4 text-[#6750a4]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#1d192b] mb-4">
          מזל טוב, {userName}! 🎉
        </h1>

        <p className="text-xl text-[#49454f] mb-2">
          הרשימה שלכם מוכנה!
        </p>

        <p className="text-[#49454f] mb-8">
          עכשיו נוסיף עוד כמה פרטים קטנים ואתם מוכנים להתחיל לבנות את הקן שלכם
        </p>

        {/* Continue Button */}
        <div className={`transition-all duration-500 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={onComplete}
            className="px-10 py-4 bg-[#6750a4] text-white text-lg font-medium rounded-full hover:bg-[#7c5fbd] transition-all shadow-lg shadow-[#6750a4]/30 hover:scale-105 active:scale-95"
          >
            בואו נתחיל! ✨
          </button>
        </div>
      </div>
    </div>
  )
}

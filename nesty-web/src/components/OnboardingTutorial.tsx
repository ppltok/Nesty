import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ArrowLeft, ArrowRight, Check, Home, ClipboardList, Gift, Settings, LayoutDashboard } from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  route: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  icon?: React.ComponentType<{ className?: string }>
  highlightNav?: boolean
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים ל-Nesty!',
    description: 'בואו נכיר את האפליקציה בקצרה. נראה לכם את כל העמודים והכלים שיעזרו לכם לנהל את רשימת התינוק.',
    route: '/dashboard',
    position: 'center',
    icon: Home,
  },
  {
    id: 'dashboard',
    title: 'לוח הבקרה',
    description: 'זה המקום הראשי שלכם! כאן תראו את כל הפריטים ברשימה, סטטיסטיקות, ותוכלו להוסיף פריטים חדשים.',
    targetSelector: '[data-tutorial="dashboard-stats"]',
    route: '/dashboard',
    position: 'bottom',
    icon: LayoutDashboard,
    highlightNav: true,
  },
  {
    id: 'add-item',
    title: 'הוספת פריטים',
    description: 'לחצו על "הוסף פריט" כדי להוסיף מוצרים לרשימה. אפשר להוסיף ידנית או להדביק לינק מחנות.',
    targetSelector: '[data-tutorial="add-item-button"]',
    route: '/dashboard',
    position: 'bottom',
  },
  {
    id: 'checklist',
    title: 'צ\'קליסט מומלץ',
    description: 'לא יודעים מה צריך? הצ\'קליסט שלנו מכיל את כל הפריטים המומלצים לתינוק, מסודרים לפי קטגוריות.',
    route: '/checklist',
    position: 'center',
    icon: ClipboardList,
    highlightNav: true,
  },
  {
    id: 'checklist-categories',
    title: 'קטגוריות וסימון',
    description: 'סמנו פריטים שכבר יש לכם, הוסיפו הערות אישיות, והחליטו מה הכי חשוב לכם.',
    targetSelector: '[data-tutorial="checklist-category"]',
    route: '/checklist',
    position: 'top',
  },
  {
    id: 'gifts',
    title: 'מתנות שהתקבלו',
    description: 'כאן תראו את כל המתנות שנרכשו עבורכם. תוכלו לראות מי קנה מה ולשלוח תודות.',
    route: '/gifts',
    position: 'center',
    icon: Gift,
    highlightNav: true,
  },
  {
    id: 'settings',
    title: 'הגדרות',
    description: 'כאן תוכלו לעדכן כתובת למשלוח, להגדיר פרטיות הרשימה, ולנהל את החשבון.',
    route: '/settings',
    position: 'center',
    icon: Settings,
    highlightNav: true,
  },
  {
    id: 'complete',
    title: 'סיימתם! 🎉',
    description: 'עכשיו אתם מוכנים להתחיל לבנות את הרשימה שלכם. בהצלחה!',
    route: '/dashboard',
    position: 'center',
  },
]

interface OnboardingTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  // Navigate to the correct route for the current step
  useEffect(() => {
    if (step.route && location.pathname !== step.route) {
      navigate(step.route)
    }
  }, [step.route, location.pathname, navigate])

  // Find and highlight the target element
  const updateTargetPosition = useCallback(() => {
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [step.targetSelector])

  useEffect(() => {
    // Wait for page to render
    const timer = setTimeout(updateTargetPosition, 300)

    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [updateTargetPosition, currentStep])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (step.position === 'center' || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const padding = 20
    const tooltipWidth = 360
    const tooltipHeight = 200

    switch (step.position) {
      case 'bottom':
        return {
          position: 'fixed',
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        }
      case 'top':
        return {
          position: 'fixed',
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        }
      case 'left':
        return {
          position: 'fixed',
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
        }
      case 'right':
        return {
          position: 'fixed',
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        }
      default:
        return {}
    }
  }

  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[9999]" dir="rtl">
      {/* Dark overlay with spotlight cutout */}
      <div className="absolute inset-0">
        {targetRect ? (
          <svg className="w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="16"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        ) : (
          <div className="w-full h-full bg-black/75" />
        )}
      </div>

      {/* Spotlight ring around target */}
      {targetRect && (
        <div
          className="absolute border-2 border-[#d0bcff] rounded-2xl pointer-events-none animate-pulse"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 4px rgba(208, 188, 255, 0.3), 0 0 30px rgba(103, 80, 164, 0.5)',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="bg-white rounded-[24px] shadow-2xl p-6 w-[360px] max-w-[calc(100vw-32px)]"
        style={getTooltipStyle()}
      >
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-[#f5f5f5] text-[#49454f] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        {Icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-[#6750a4] to-[#9a82db] rounded-[20px] flex items-center justify-center mb-4 mx-auto shadow-lg shadow-[#6750a4]/20">
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[#1d192b] mb-2">{step.title}</h3>
          <p className="text-[#49454f] leading-relaxed">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-[#6750a4]'
                  : index < currentStep
                  ? 'bg-[#6750a4]/50'
                  : 'bg-[#e7e0ec]'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 border-[#e7e0ec] text-[#1d192b] font-medium hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              הקודם
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#6750a4] text-white font-medium hover:bg-[#7c5fbd] transition-all ${currentStep === 0 ? 'flex-1' : 'flex-1'}`}
          >
            {isLastStep ? (
              <>
                סיום
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                הבא
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Skip link */}
        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-[#49454f] hover:text-[#6750a4] mt-4 transition-colors"
        >
          דלג על ההדרכה
        </button>
      </div>
    </div>
  )
}

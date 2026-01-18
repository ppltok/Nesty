import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ArrowLeft, ArrowRight, Check, Home, ClipboardList, Gift, Settings, LayoutDashboard, Sparkles, BarChart3 } from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  navItemId?: string // ID of the nav item to highlight (e.g., 'dashboard', 'checklist', 'gifts', 'settings')
  route: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  icon?: React.ComponentType<{ className?: string }>
  highlightNav?: boolean
}

// Check if we're on mobile
const isMobile = () => window.innerWidth < 1024

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים ל-Nesty!',
    description: 'בואו נכיר את האפליקציה בקצרה. נראה לך את כל העמודים והכלים שיעזרו לך לנהל את רשימת התינוק.',
    route: '/checklist',
    position: 'center',
    icon: Home,
  },
  {
    id: 'dashboard',
    title: 'הרשימה',
    description: 'זאת הרשימה שלך!\n תוכלי להוסיף פריטים חדשים, לנהל את הרשימה הקיימת ולשתף עם חברים ומשפחה.',
    navItemId: 'dashboard',
    route: '/dashboard',
    position: 'bottom',
    icon: LayoutDashboard,
    highlightNav: true,
  },
  {
    id: 'add-item',
    title: 'הוספת פריטים',
    description: 'לחצי על "הוסף פריט" כדי להוסיף מוצרים לרשימה. אפשר להוסיף ידנית או להדביק לינק מחנות.',
    targetSelector: '[data-tutorial="add-item-button"]',
    route: '/dashboard',
    position: 'bottom',
  },
  {
    id: 'checklist',
    title: 'מה את באמת צריכה?',
    description: 'תתחילי מפה!\nכאן תגלי מה את באמת צריכה לקנות לתינוק. עברי על הרשימה המומלצת, סמני מה כבר יש לך, והחליטי מה חשוב לך.',
    navItemId: 'checklist',
    route: '/checklist',
    position: 'top',
    icon: ClipboardList,
    highlightNav: true,
  },
  {
    id: 'checklist-categories',
    title: 'קטגוריות וסימון',
    description: 'ניתן להוסיף מוצרים או למחוק אם לא רלוונטי, הוסיפי הערות אישיות, והחליטי על כמות.',
    targetSelector: '[data-tutorial="checklist-category"]',
    route: '/checklist',
    position: 'top',
  },
  {
    id: 'recommended-products',
    title: 'המלצות מוצרים',
    description: 'לא יודעת מאיפה להתחיל? לכל פריט ברשימה יש המלצות מוצרים מבוססות על חוות דעת של הורים. לחצי על פריט כדי לראות המלצות ולהוסיף במהירות.',
    route: '/checklist',
    position: 'center',
    icon: Sparkles,
  },
  {
    id: 'statistics',
    title: 'מבט על',
    description: 'רוצה לראות תמונה מלאה? בדף הסטטיסטיקות תוכלי לראות כמה השלמתם, מה נשאר, וכמה חסכתם. מעקב קל אחרי כל ההתקדמות.',
    navItemId: 'statistics',
    route: '/statistics',
    position: 'center',
    icon: BarChart3,
    highlightNav: true,
  },
  {
    id: 'gifts',
    title: 'מתנות שהתקבלו',
    description: 'כאן תראי את כל המתנות שנרכשו עבורכם. תוכלי לראות מי קנה מה ולשלוח תודות.',
    navItemId: 'gifts',
    route: '/gifts',
    position: 'center',
    icon: Gift,
    highlightNav: true,
  },
  {
    id: 'settings',
    title: 'הגדרות',
    description: 'כאן תוכלי לעדכן כתובת למשלוח, להגדיר פרטיות הרשימה, ולנהל את החשבון. במובייל - לחצי על "עוד" כדי להגיע להגדרות.',
    navItemId: 'more', // On mobile, highlight the "more" button which contains settings
    route: '/settings',
    position: 'center',
    icon: Settings,
    highlightNav: true,
  },
  {
    id: 'complete',
    title: 'סיימתם! 🎉',
    description: 'עכשיו את מוכנה להתחיל לבנות את הרשימה שלך. בהצלחה!',
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
    let selector = step.targetSelector

    // If highlightNav is true and navItemId is specified, build the selector for the nav item
    if (step.highlightNav && step.navItemId) {
      // Use mobile or desktop nav selector based on screen size
      const suffix = isMobile() ? '-mobile' : ''
      selector = `[data-tutorial="nav-${step.navItemId}${suffix}"]`
    }

    if (selector) {
      const element = document.querySelector(selector)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [step.targetSelector, step.highlightNav, step.navItemId])

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
    const mobile = isMobile()
    const padding = 16
    const tooltipWidth = mobile ? Math.min(340, window.innerWidth - 32) : 360
    const tooltipHeight = 200

    // For mobile with nav items at bottom, always position tooltip above the nav
    if (mobile && step.highlightNav && targetRect) {
      return {
        position: 'fixed',
        bottom: `${window.innerHeight - targetRect.top + padding + 8}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: `calc(100vw - ${padding * 2}px)`,
      }
    }

    if (step.position === 'center' || !targetRect) {
      // On mobile, position slightly higher to avoid bottom nav overlap
      return {
        position: 'fixed',
        top: mobile ? '40%' : '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: mobile ? `calc(100vw - ${padding * 2}px)` : undefined,
      }
    }

    switch (step.position) {
      case 'bottom':
        return {
          position: 'fixed',
          top: `${targetRect.bottom + padding}px`,
          // On mobile, always center horizontally
          left: mobile ? '50%' : `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
          transform: mobile ? 'translateX(-50%)' : undefined,
          maxWidth: mobile ? `calc(100vw - ${padding * 2}px)` : undefined,
        }
      case 'top':
        return {
          position: 'fixed',
          top: `${Math.max(padding, targetRect.top - tooltipHeight - padding)}px`,
          // On mobile, always center horizontally
          left: mobile ? '50%' : `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
          transform: mobile ? 'translateX(-50%)' : undefined,
          maxWidth: mobile ? `calc(100vw - ${padding * 2}px)` : undefined,
        }
      case 'left':
        return {
          position: 'fixed',
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: mobile ? padding : `${targetRect.left - tooltipWidth - padding}px`,
          maxWidth: mobile ? `calc(100vw - ${padding * 2}px)` : undefined,
        }
      case 'right':
        return {
          position: 'fixed',
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: mobile ? padding : `${targetRect.right + padding}px`,
          maxWidth: mobile ? `calc(100vw - ${padding * 2}px)` : undefined,
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
        className="bg-white rounded-[24px] shadow-2xl p-5 sm:p-6 w-full sm:w-[360px] max-w-[calc(100vw-32px)]"
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
          <p className="text-[#49454f] leading-relaxed whitespace-pre-line">{step.description}</p>
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

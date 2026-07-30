import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ArrowLeft, ArrowRight, Check, ClipboardList, Gift, Settings, Heart, Sparkles, BarChart3, Plus, Star } from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  navItemId?: string // ID of the nav item to highlight (e.g., 'dashboard', 'checklist', 'gifts', 'settings')
  route: string
  icon?: React.ComponentType<{ className?: string }>
  highlightNav?: boolean
  special?: boolean
}

// Check if we're on mobile
const isMobile = () => window.innerWidth < 1024

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'ברוכה הבאה ל-Nesty! 🪺',
    description: 'אם הוספת כבר פריט ראשון - מעולה, הקן שלך כבר מתחיל!\nאת מוזמנת לסיור קצר על הכלים, או לדלג ולהמשיך לבד.',
    route: '/checklist',
    icon: Sparkles,
    special: true,
  },
  {
    id: 'checklist',
    title: 'הצ׳קליסט - תתחילי מפה',
    description: 'פה תוכלי למצוא על מה שצריך לקראת התינוק, מסודרת לפי קטגוריות.\nעברי על הפריטים, סמני מה כבר יש לך, ובחרי מה חשוב ומה פינוק.',
    navItemId: 'checklist',
    route: '/checklist',
    icon: ClipboardList,
    highlightNav: true,
  },
  {
    id: 'checklist-categories',
    title: 'קטגוריות וניהול',
    description: 'לחצי על קטגוריה כדי לפתוח אותה.\nאפשר להוסיף פריטים, למחוק מה שלא רלוונטי, ולהוסיף הערות.',
    targetSelector: '[data-tutorial="checklist-category"]',
    route: '/checklist',
  },
  {
    id: 'recommended-products',
    title: 'המלצות מוצרים',
    description: 'לא יודעת מאיפה להתחיל?\nלכל פריט יש המלצות מבוססות חוות דעת הורים. לחצי על פריט כדי לראות ולהוסיף.',
    targetSelector: '[data-tutorial="recommended-products"]',
    route: '/checklist',
    icon: Star,
  },
  {
    id: 'dashboard',
    title: 'הרשימה שלי',
    description: 'כאן נמצאים כל הפריטים שהוספת.\nשתפי את הרשימה עם חברים ומשפחה כדי שידעו מה לקנות.',
    navItemId: 'dashboard',
    route: '/dashboard',
    icon: Heart,
    highlightNav: true,
  },
  {
    id: 'add-item',
    title: 'הוספת פריטים',
    description: 'לחצי כאן כדי להוסיף מוצר לרשימה.\nאפשר להדביק לינק מכל חנות או להוסיף ידנית.',
    targetSelector: '[data-tutorial="add-item-button"]',
    route: '/dashboard',
    icon: Plus,
  },
  {
    id: 'gifts',
    title: 'מתנות',
    description: 'כשמישהו ירכוש פריט מהרשימה, תראי את זה כאן.\nתוכלי לראות מי קנה, מה הכמות, ולשלוח הודעת תודה אישית.',
    navItemId: 'gifts',
    route: '/gifts',
    icon: Gift,
    highlightNav: true,
  },
  {
    id: 'statistics',
    title: 'מבט על',
    description: 'תמונה מלאה של ההתקדמות שלך:\nכמה פריטים הושלמו, מה נשאר לרכישה, התקציב הכולל, והתפלגות לפי קטגוריות.',
    navItemId: 'statistics',
    route: '/statistics',
    icon: BarChart3,
    highlightNav: true,
  },
  {
    id: 'settings',
    title: 'הגדרות',
    description: 'כאן תוכלי להוסיף הורה שני לניהול הרשימה, להוסיף כתובת למשלוח, לערוך את שם הרשימה, לנהל פרטיות, ולהתנתק.',
    navItemId: 'settings',
    route: '/settings',
    icon: Settings,
    highlightNav: true,
  },
  {
    id: 'complete',
    title: 'הכל מוכן! 🎉',
    description: 'עכשיו את יודעת הכל!\nהתחילי מהצ׳קליסט, בחרי מוצרים, ושתפי את הרשימה.\nבהצלחה!',
    route: '/checklist',
    special: true,
  },
]

interface OnboardingTutorialProps {
  onComplete: () => void
  onSkip: () => void
  onStepChange?: (stepId: string) => void
}

export default function OnboardingTutorial({ onComplete, onSkip, onStepChange }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  // Notify parent about step changes so pages can react (e.g., auto-open a popover)
  useEffect(() => {
    onStepChange?.(step.id)
  }, [step.id, onStepChange])

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

  // When the step changes, scroll the spotlighted element into the visible zone
  // under the fixed tooltip. On mobile, the tooltip can occupy most of the upper
  // viewport, so we measure its actual bottom and place the spotlight beneath it.
  // On desktop, we just center the target vertically.
  useEffect(() => {
    let selector = step.targetSelector
    if (step.highlightNav && step.navItemId) {
      const suffix = isMobile() ? '-mobile' : ''
      selector = `[data-tutorial="nav-${step.navItemId}${suffix}"]`
    }
    if (!selector) return

    // Wait for route change + expand animations
    const timer = setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement | null
      if (!element) return
      const rect = element.getBoundingClientRect()
      const currentCenter = rect.top + rect.height / 2
      const mobile = isMobile()

      let desiredCenter: number
      if (mobile) {
        const tooltipEl = document.querySelector('[data-tutorial-tooltip]') as HTMLElement | null
        const tooltipTop = tooltipEl
          ? tooltipEl.getBoundingClientRect().top
          : window.innerHeight * 0.5
        const gap = 32
        // Tooltip lives at the bottom on mobile - place the spotlight ABOVE it,
        // but never so high that it gets cut off at the top of the viewport.
        desiredCenter = Math.max(
          40 + rect.height / 2,
          tooltipTop - gap - rect.height / 2
        )
      } else {
        desiredCenter = window.innerHeight * 0.5
      }

      const delta = currentCenter - desiredCenter
      if (Math.abs(delta) > 24) {
        window.scrollBy({ top: delta, behavior: 'smooth' })
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [step.id, step.targetSelector, step.highlightNav, step.navItemId])

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

  // Tooltip position is FIXED across all steps - only the spotlight moves.
  // - Desktop: centered on viewport.
  // - Mobile: pinned above the bottom nav (~96px from the bottom). This keeps
  //   the upper half of the viewport free for the spotlight, so targets near
  //   the top of the page (e.g. the first category row) stay visible.
  const getTooltipStyle = (): React.CSSProperties => {
    const mobile = isMobile()
    const padding = 16

    if (mobile) {
      return {
        position: 'fixed',
        bottom: '96px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: `calc(100vw - ${padding * 2}px)`,
      }
    }

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
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
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        ) : (
          <div className="w-full h-full bg-black/70" />
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
            boxShadow: '0 0 0 4px rgba(208, 188, 255, 0.4), 0 0 40px rgba(103, 80, 164, 0.4), 0 0 80px rgba(103, 80, 164, 0.15)',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        data-tutorial-tooltip
        className={`rounded-[24px] p-5 sm:p-6 w-full sm:w-[380px] max-w-[calc(100vw-32px)] border border-[#e7e0ec]/60 shadow-[0_20px_60px_-15px_rgba(103,80,164,0.15)] ${step.special ? 'bg-gradient-to-br from-white via-[#faf7ff] to-[#f3edff]' : 'bg-white'}`}
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
          דלגי על ההדרכה
        </button>
      </div>
    </div>
  )
}

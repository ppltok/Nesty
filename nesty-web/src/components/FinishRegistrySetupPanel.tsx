// "סיימי להקים את הקן" — Babylist-style activation checklist that lives on the
// Dashboard. Steps are tuned to push a registry past the Super-tier threshold
// (5 items is the hero step). Collapsible (state persisted in localStorage) and
// auto-dismisses once every step is satisfied. Dismissed/complete state is
// persisted in dismissed_popups so it doesn't reappear.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Users,
  Clock,
  Puzzle,
  Share2,
  CalendarHeart,
  MapPin,
} from 'lucide-react'
import { dismissPopup } from '../hooks/usePopups'
import { trackExtensionInstalled } from '../utils/tracking'
import { supabase } from '../lib/supabase'

interface FinishRegistrySetupPanelProps {
  userId: string | undefined
  registryId: string
  itemCount: number
  hasPartner: boolean
  hasShared: boolean
  hasAddress: boolean
  extensionInstalled: boolean
  extensionLoading: boolean
  extensionVersion: string | null
  onboardingDone: boolean
  onAddItem: () => void
  onShare: () => void
  onInvitePartner: () => void
  onInstallExtension: () => void
  onAddAddress: () => void
}

// Number of items that marks a "real" registry (Super tier in dashboard analytics).
const TARGET_ITEMS = 5

type StepState = 'done' | 'pending' | 'todo'

type Step = {
  key: string
  label: string
  hint: string
  icon: typeof Check
  state: StepState
  /** Sub-progress text shown on the hero step, e.g. "3/5". */
  progress?: string
  /** Label shown on a pending step instead of "בוצע". */
  pendingLabel?: string
  onClick?: () => void
}

export default function FinishRegistrySetupPanel({
  userId,
  registryId,
  itemCount,
  hasPartner,
  hasShared,
  hasAddress,
  extensionInstalled,
  extensionLoading,
  extensionVersion,
  onboardingDone,
  onAddItem,
  onShare,
  onInvitePartner,
  onInstallExtension,
  onAddAddress,
}: FinishRegistrySetupPanelProps) {
  const [hidden, setHidden] = useState(false)
  const [hasPendingInvite, setHasPendingInvite] = useState(false)
  // The Chrome extension is desktop-only, so the install step is hidden on
  // mobile (the dashboard already shows a "better on desktop" banner there).
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  )
  useEffect(() => {
    const handle = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])
  // Read persisted state once at mount (userId is defined by the time this
  // panel renders). Latch the extension across reloads: detection only fires on
  // pages where the extension injects its marker, so we remember it.
  const readFlag = (key: string) => {
    try {
      return localStorage.getItem(key) === '1'
    } catch {
      return false
    }
  }
  const [collapsed, setCollapsed] = useState(() =>
    userId ? readFlag(`nesty_finish_setup_collapsed_${userId}`) : false,
  )
  const extensionLatched = userId ? readFlag(`nesty_ext_installed_${userId}`) : false

  // When the extension is detected: persist the latch and fire the install pixel
  // once (side-effects only — no setState in this effect).
  useEffect(() => {
    if (!extensionInstalled || !userId) return
    try {
      localStorage.setItem(`nesty_ext_installed_${userId}`, '1')
    } catch { /* ignore storage errors */ }
    trackExtensionInstalled({ user_id: userId, version: extensionVersion })
  }, [extensionInstalled, userId, extensionVersion])

  // Detect a sent-but-not-accepted co-parent invitation so the step can show
  // a "pending" state rather than nagging the user who already invited.
  useEffect(() => {
    if (!registryId || hasPartner) return
    let cancelled = false
    void (async () => {
      const { data } = await supabase
        .from('registry_invitations')
        .select('id')
        .eq('registry_id', registryId)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle()
      if (!cancelled) setHasPendingInvite(!!data)
    })()
    return () => {
      cancelled = true
    }
  }, [registryId, hasPartner])

  const extensionDone = extensionInstalled || extensionLatched

  const partnerState: StepState = hasPartner ? 'done' : hasPendingInvite ? 'pending' : 'todo'

  const steps: Step[] = useMemo(() => {
    const all: Step[] = [
      {
        key: 'due_date',
        label: 'הוספת תאריך משוער',
        hint: 'כדי שנדע לאיזה שבוע להתאים לך טיפים',
        icon: CalendarHeart,
        state: onboardingDone ? 'done' : 'todo',
      },
      {
        key: 'extension',
        label: 'התקנת תוסף הכרום',
        hint: 'מוסיפים פריטים מכל אתר בלחיצה אחת',
        icon: Puzzle,
        state: extensionDone ? 'done' : 'todo',
        onClick: onInstallExtension,
      },
      {
        key: 'first_items',
        label: 'הוספת 5 הפריטים הראשונים',
        hint: 'מכאן הרשימה מתחילה להרגיש כמו שלך',
        icon: Plus,
        state: itemCount >= TARGET_ITEMS ? 'done' : 'todo',
        progress: `${Math.min(itemCount, TARGET_ITEMS)}/${TARGET_ITEMS}`,
        onClick: onAddItem,
      },
      {
        key: 'partner',
        label: 'הזמנת בן/בת זוג',
        hint: 'שיהיה מי שמתארגן איתך',
        icon: Users,
        state: partnerState,
        pendingLabel: 'ממתין לאישור',
        onClick: onInvitePartner,
      },
      {
        key: 'address',
        label: 'הוספת כתובת וטלפון למשלוח',
        hint: 'ככה קל לאחרים לדעת לאן לשלוח — ואפשר להשאיר פרטי',
        icon: MapPin,
        state: hasAddress ? 'done' : 'todo',
        onClick: onAddAddress,
      },
      {
        key: 'share',
        label: 'שיתוף הרשימה',
        hint: 'עם המשפחה והחברים שאוהבים אותך',
        icon: Share2,
        state: hasShared ? 'done' : 'todo',
        onClick: onShare,
      },
    ]
    // Hide the desktop-only Chrome extension step on mobile.
    return all.filter((s) => isDesktop || s.key !== 'extension')
  }, [
    isDesktop,
    itemCount,
    partnerState,
    hasShared,
    hasAddress,
    extensionDone,
    onboardingDone,
    onAddItem,
    onShare,
    onInvitePartner,
    onInstallExtension,
    onAddAddress,
  ])

  // A step counts toward completion if it's done OR pending (the user did their
  // part). Progress only settles once extension detection has finished loading.
  const satisfied = steps.filter((s) => s.state !== 'todo').length
  const total = steps.length
  const allSatisfied = satisfied === total
  const pct = Math.round((satisfied / total) * 100)

  // Auto-dismiss once everything is satisfied (and detection has settled).
  // `autoComplete` drives the render guard; the effect only persists the
  // dismissal (a side-effect — no setState here), guarded to fire once.
  const autoComplete = allSatisfied && !extensionLoading
  const autoDismissedRef = useRef(false)
  useEffect(() => {
    if (autoComplete && !autoDismissedRef.current) {
      autoDismissedRef.current = true
      if (userId) void dismissPopup(userId, 'finish_registry_setup', 'permanent')
    }
  }, [autoComplete, userId])

  if (hidden || autoComplete) return null

  const handleDismiss = () => {
    setHidden(true)
    if (userId) void dismissPopup(userId, 'finish_registry_setup', 'permanent')
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    if (userId) {
      try {
        localStorage.setItem(`nesty_finish_setup_collapsed_${userId}`, next ? '1' : '0')
      } catch { /* ignore storage errors */ }
    }
  }

  return (
    <div className="mb-8 bg-white rounded-[24px] border border-[#e7e0ec] shadow-[0_4px_20px_rgba(103,80,164,0.06)] overflow-hidden">
      {/* Header — clicking it (outside the buttons) toggles collapse */}
      <div
        onClick={toggleCollapsed}
        className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 cursor-pointer select-none"
      >
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1d192b]">סיימי להקים את הקן</h2>
          <p className="text-sm text-[#49454f] mt-1 max-w-md">
            עוד כמה צעדים קטנים, והרשימה שלך מוכנה לשתף.
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleCollapsed()
            }}
            aria-label={collapsed ? 'הרחבה' : 'כיווץ'}
            aria-expanded={!collapsed}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#79747e] hover:bg-[#f3edff] hover:text-[#6750a4] transition-colors"
          >
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
            aria-label="סגירה"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#79747e] hover:bg-[#f3edff] hover:text-[#6750a4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar — always visible, even when collapsed */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#6750a4]">
            {satisfied} מתוך {total} הושלמו
          </span>
          <span className="text-xs font-medium text-[#79747e]">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#ece6f0] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#6750a4] to-[#d0bcff] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps — hidden when collapsed */}
      {!collapsed && (
        <ul className="divide-y divide-[#f1edf6]">
          {steps.map((step) => {
            const Icon = step.icon
            const isDone = step.state === 'done'
            const isPending = step.state === 'pending'
            const clickable = step.state === 'todo' && !!step.onClick
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={clickable ? step.onClick : undefined}
                  disabled={!clickable}
                  className={`w-full flex items-center gap-4 px-6 py-4 text-right transition-colors ${
                    clickable ? 'hover:bg-[#faf7ff] cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* Status circle */}
                  <span
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isDone
                        ? 'bg-[#e7f7ee] text-[#2e9e6b]'
                        : isPending
                          ? 'bg-[#fdf4e3] text-[#c08a21]'
                          : 'bg-[#f3edff] text-[#6750a4]'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-5 h-5" />
                    ) : isPending ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </span>

                  {/* Label + hint */}
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-sm font-bold ${
                        isDone ? 'text-[#9a93a3]' : 'text-[#1d192b]'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="block text-xs text-[#79747e] mt-0.5">
                      {step.hint}
                    </span>
                  </span>

                  {/* Right side: done / pending / sub-progress / chevron */}
                  {isDone ? (
                    <span className="shrink-0 text-xs font-bold text-[#2e9e6b]">בוצע</span>
                  ) : isPending ? (
                    <span className="shrink-0 text-xs font-bold text-[#c08a21]">
                      {step.pendingLabel}
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-2">
                      {step.progress && (
                        <span className="text-xs font-bold text-[#6750a4] bg-[#f3edff] rounded-full px-2.5 py-1">
                          {step.progress}
                        </span>
                      )}
                      {clickable && <ChevronLeft className="w-5 h-5 text-[#c9c2cb]" />}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

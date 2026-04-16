// Bottom-right slide-in toast shown for exactly 5 seconds when the user
// crosses an item-count milestone (1, 5, 10). Persistence/spam control is
// handled by the parent — this component is a pure presentation layer.
//
// Tested scenarios:
//   - add item #5 → "💪 5 פריטים" appears
//   - add item #6 → nothing (handled by parent milestone comparison)
//   - user previously at 10 who goes back to 4 and re-adds → nothing
//     (parent enforces monotonic milestone via advanceMilestone)

import { useEffect } from 'react'

export type MilestoneKind =
  | { kind: 'items'; count: 1 | 5 | 10 }
  | { kind: 'partner_joined' }
  | { kind: 'first_gift' }

interface Props {
  milestone: MilestoneKind
  onClose: () => void
  duration?: number
}

function messageFor(milestone: MilestoneKind): { emoji: string; title: string; body?: string } {
  if (milestone.kind === 'items') {
    if (milestone.count === 1) return { emoji: '🎉', title: 'הפריט הראשון!', body: 'הרשימה שלך התחילה' }
    if (milestone.count === 5) return { emoji: '💪', title: '5 פריטים', body: 'הרשימה מתחילה להיראות!' }
    return { emoji: '🌟', title: '10 פריטים', body: 'את מקצוענית!' }
  }
  if (milestone.kind === 'partner_joined') {
    return { emoji: '💜', title: 'בן/בת הזוג הצטרפו', body: 'עכשיו מנהלים ביחד' }
  }
  return { emoji: '🎁', title: 'קיבלת מתנה!', body: 'מישהו קנה לך פריט מהרשימה' }
}

export default function MilestoneToast({ milestone, onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  const { emoji, title, body } = messageFor(milestone)

  return (
    <div
      className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
      dir="rtl"
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-[#e8daf5] px-5 py-4 max-w-xs sm:max-w-sm">
        <span className="text-3xl flex-shrink-0">{emoji}</span>
        <div className="text-right flex-1 min-w-0">
          <p className="font-bold text-[#1d192b] text-sm">{title}</p>
          {body && <p className="text-xs text-[#49454f] mt-0.5 truncate">{body}</p>}
        </div>
      </div>
    </div>
  )
}

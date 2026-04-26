// Centered celebratory toast shown when the user crosses a meaningful event
// (item-count milestone, partner joined, first gift received). The first_gift
// variant is interactive — clicking navigates to /gifts so the user can send
// a thank-you. Other kinds auto-dismiss.

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export type MilestoneKind =
  | { kind: 'items'; count: 1 | 5 | 10 }
  | { kind: 'partner_joined' }
  | { kind: 'first_gift' }

interface Props {
  milestone: MilestoneKind
  onClose: () => void
  duration?: number
}

function messageFor(milestone: MilestoneKind): { emoji: string; title: string; body?: string; cta?: string } {
  if (milestone.kind === 'items') {
    if (milestone.count === 1) return { emoji: '🎉', title: 'הפריט הראשון!', body: 'הרשימה שלך התחילה' }
    if (milestone.count === 5) return { emoji: '💪', title: '5 פריטים', body: 'הרשימה מתחילה להיראות!' }
    return { emoji: '🌟', title: '10 פריטים', body: 'את מקצוענית!' }
  }
  if (milestone.kind === 'partner_joined') {
    return { emoji: '💜', title: 'בן/בת הזוג הצטרפו', body: 'עכשיו מנהלים ביחד' }
  }
  return {
    emoji: '🎁',
    title: 'קיבלת מתנה!',
    body: 'אל תשכחי לשלוח תודה 💜',
    cta: 'לדף המתנות',
  }
}

export default function MilestoneToast({ milestone, onClose, duration = 5000 }: Props) {
  const navigate = useNavigate()
  const isInteractive = milestone.kind === 'first_gift'

  useEffect(() => {
    if (isInteractive) return // first_gift waits for explicit user action
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration, isInteractive])

  const { emoji, title, body, cta } = messageFor(milestone)

  const handleAction = () => {
    onClose()
    navigate('/gifts')
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200"
      dir="rtl"
      onClick={isInteractive ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-6xl sm:text-7xl mb-4">{emoji}</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1d192b] mb-2">{title}</h2>
        {body && <p className="text-base text-[#49454f] mb-6">{body}</p>}

        {isInteractive && cta && (
          <button
            onClick={handleAction}
            className="w-full bg-gradient-to-l from-[#7c4dbd] to-[#9b62d4] text-white font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-opacity"
          >
            {cta}
          </button>
        )}
      </div>
    </div>
  )
}

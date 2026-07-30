// /unsubscribed - public confirmation page users land on after the
// unsubscribe edge function flips their preference. The edge function
// sends them here with ?cat=weekly&action=unsub (or resub).
//
// No auth required - users may be logged out when clicking the email link.
// Logged-in users see an extra "Manage all preferences" button that links
// to /settings/emails for granular control.

import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Mail, Check, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { EMAIL_CATEGORIES, type EmailCategoryKey } from '../lib/emailCategories'

// Plus the 'all' category used when a master kill-switch link fires.
const ALL_LABEL = 'כל הדיוור השיווקי'

export default function Unsubscribed() {
  const { user } = useAuth()
  const [params] = useSearchParams()

  const cat = params.get('cat') ?? ''
  const action = (params.get('action') ?? 'unsub') as 'unsub' | 'resub'

  const label =
    cat === 'all'
      ? ALL_LABEL
      : EMAIL_CATEGORIES[cat as EmailCategoryKey]?.label_he ?? 'אימיילים'

  // For re-subscribe, users go through /settings/emails (requires login).
  // We don't expose a client-side re-subscribe token - only the server has
  // the signing secret. Keeping it one-sided is fine: unsub needs to work
  // without login; resub is a conscious action that benefits from auth.
  const isUnsub = action === 'unsub'

  // Scroll to top on mount (navigations from external redirect).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f9f5ff] via-[#f5f0fa] to-white px-4 py-12"
    >
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-[#e8daf5] p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#f3edff] flex items-center justify-center">
            {isUnsub ? (
              <Mail className="w-8 h-8 text-[#7c4dbd]" />
            ) : (
              <Check className="w-8 h-8 text-[#2e7d32]" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1d192b] mb-3">
            {isUnsub ? 'בוטל בהצלחה 💜' : 'חזרת אלינו! 🎉'}
          </h1>

          <p className="text-[#49454f] leading-relaxed mb-2">
            {isUnsub
              ? <>הסרנו אותך מהרשימה של <strong>{label}</strong>.</>
              : <>הרשמנו אותך מחדש לקבלת <strong>{label}</strong>.</>
            }
          </p>

          {isUnsub && (
            <p className="text-sm text-[#6e6b74] mb-6">
              לא נשלח לך יותר אימיילים מהסוג הזה. אפשר בכל זמן להפעיל מחדש בהגדרות החשבון.
            </p>
          )}

          {/* Primary action - manage all preferences (requires login) */}
          <div className="space-y-3 mt-6">
            <Link
              to="/settings/emails"
              className="block w-full bg-gradient-to-l from-[#7c4dbd] to-[#9b62d4] text-white font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 transition-opacity"
            >
              ניהול כל העדפות האימייל ←
            </Link>

            {!user && (
              <p className="text-xs text-[#6e6b74]">
                תצטרכי להתחבר כדי לנהל העדפות ספציפיות
              </p>
            )}

            <Link
              to="/"
              className="block w-full text-sm text-[#7c4dbd] hover:underline py-2"
            >
              חזרה ל-Nesty
            </Link>
          </div>
        </div>

        {/* Tiny legal / tone-setting footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#6e6b74]">
          <Heart className="w-3 h-3 text-[#9b62d4]" />
          <span>תודה שהיית איתנו. מחכים לראות אותך שוב.</span>
        </div>
      </div>
    </div>
  )
}


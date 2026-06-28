import { useState, useEffect } from 'react'
import { Copy, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { trackCollab } from '../../utils/trackCollab'

/**
 * Nesty × Supherb partner-perk surfaces — in-app popup + gifts-page card for the
 * "extra 15% sitewide" Supherb benefit (NESTY15). First real partner perk.
 *
 * Design per the Supherb brief: WHITE + SUPHERB GREEN only (NO purple — purple
 * reads as a competitor), 🌿 accent (never 🎁/💜), framed as a "הטבה" (benefit),
 * never a "מתנה". Featured product: Tab-in-gum. Valid until 31.7.2026.
 *
 * Audience rollout via AUDIENCE: 'test' (team accounts only) → 'all'.
 * Append ?supherb=1 to /gifts to force-preview regardless of audience.
 */

const COLLAB = 'supherb'
const CODE = 'NESTY15'
const REDEEM_URL = 'https://bit.ly/4g1uf7v'
// Fixed campaign end (Asia/Jerusalem) — "בתוקף עד 31.7.2026".
const OFFER_END = new Date('2026-07-31T23:59:59+03:00').getTime()

const AUDIENCE: 'test' | 'all' = 'all'
const TEST_EMAILS = ['tomargov73@gmail.com', 'tom@ppltok.com', 'hello@nestyil.com']

const POPUP_DISMISS_KEY = 'nesty_collab_supherb_popup_dismissed'
const COLLAPSED_KEY = 'nesty_collab_supherb_collapsed'
// Set once the user has actually landed on the gifts page and seen the perk.
// Drives the sidebar red-dot indicator (shown until the gift is "opened").
const OPENED_KEY = 'nesty_collab_supherb_opened'
const OPENED_EVENT = 'nesty:collab-opened'

function inCollabAudience(email?: string | null): boolean {
  const e = (email || '').toLowerCase()
  const audience = AUDIENCE === 'all' || TEST_EMAILS.includes(e)
  return Date.now() < OFFER_END && audience
}

const PRODUCT_IMG = '/demo/supherb-tabingum.png'
const LOGO_IMG = '/demo/supherb-logo.png'

const BODY_TEXT =
  'כל אישה בהריון צריכה תוספי תזונה — אז חברנו ל-Supherb, יצרנית תוספי הבריאות הגדולה בישראל. עכשיו את יכולה ליהנות מ-15% הנחה נוספים על כל האתר, בנוסף על מבצעים קיימים באתר. 🌿'

/** Inline coupon/ticket icon — brief requires an SVG, not an emoji or arrow. */
function CouponIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9z" />
      <path d="M15 7v2M15 15v2M15 11v2" />
    </svg>
  )
}

function useCopyCode(source: 'popup' | 'gifts_page') {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(CODE)
    setCopied(true)
    trackCollab(COLLAB, source === 'popup' ? 'popup_copy' : 'card_copy', source)
    setTimeout(() => setCopied(false), 2200)
  }
  return { copied, copy }
}

function CopyCodeChip({ source }: { source: 'popup' | 'gifts_page' }) {
  const { copied, copy } = useCopyCode(source)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center justify-between bg-[#e8f1ea] border-[1.5px] border-dashed border-[#4e7a5a] rounded-xl px-4 py-2.5">
        <span className="text-xs text-[#4e7a5a]">קוד הטבה</span>
        <span className="text-base font-extrabold tracking-wider text-[#25402c]">{CODE}</span>
      </div>
      <button
        onClick={copy}
        className={`h-[42px] px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all active:scale-95 ${
          copied ? 'bg-[#dcebe0] text-[#25402c]' : 'bg-[#35573D] text-white hover:bg-[#25402c] shadow-md shadow-[#35573D]/20'
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'הועתק!' : 'העתקת קוד'}
      </button>
    </div>
  )
}

function ExclusiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#e8f1ea] text-[#25402c] border border-[#bcd6c2] rounded-full px-3.5 py-1 text-xs font-bold">
      ✦ הטבה בלעדית למשתמשות Nesty
    </span>
  )
}

function ReferralNote() {
  return (
    <div className="mt-3.5 bg-[#f4f9f5] border border-dashed border-[#93bd9e] rounded-2xl px-4 py-3 text-center text-[13px] leading-relaxed text-[#25402c]">
      מכירה עוד מישהי בהריון? שלחי לה את <b className="text-[#35573D]">Nesty</b> 🌿 ותגלו יחד עוד הטבות וקופונים.
    </div>
  )
}

function RedeemButton({ source, size = 'md' }: { source: 'popup' | 'gifts_page'; size?: 'md' | 'lg' }) {
  return (
    <a
      href={REDEEM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCollab(COLLAB, source === 'popup' ? 'popup_cta_click' : 'card_cta_click', source)}
      className={`mt-4 w-full ${size === 'lg' ? 'h-12 text-[15px]' : 'h-11 text-sm'} rounded-2xl bg-[#35573D] text-white font-extrabold flex items-center justify-center gap-2 hover:bg-[#25402c] transition-all shadow-md shadow-[#35573D]/20`}
    >
      <CouponIcon className="w-[18px] h-[18px]" /> למימוש ההטבה
    </a>
  )
}

function Countdown() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, OFFER_END - Date.now())
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const pad = (n: number) => String(n).padStart(2, '0')
  // Urgency stays red/peach regardless of the green brand (per brief).
  const Box = ({ v, l }: { v: string | number; l: string }) => (
    <div className="bg-[#fbe5e1] border border-[#f4acb7] rounded-[10px] py-1.5 w-14 text-center">
      <div className="text-[21px] font-extrabold text-[#b3261e] leading-none">{v}</div>
      <div className="text-[10px] text-[#9a5560] mt-0.5">{l}</div>
    </div>
  )
  return (
    <div className="mt-3 text-center">
      <span className="block text-xs font-bold text-[#b3261e] mb-1.5">⏳ ההטבה נגמרת בעוד — בתוקף עד 31.7.2026</span>
      <div className="inline-flex gap-2" dir="ltr">
        <Box v={d} l="ימים" /><Box v={pad(h)} l="שעות" /><Box v={pad(m)} l="דקות" />
      </div>
    </div>
  )
}

/** Full green offer card (banner state) shown above the gifts list. */
export function SupherbGiftCard({ onClose }: { onClose: () => void }) {
  useEffect(() => { trackCollab(COLLAB, 'card_view', 'gifts_page') }, [])
  return (
    <div className="mb-8 rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] bg-white border-2 border-[#bcd6c2] overflow-hidden shadow-[0_14px_30px_-16px_rgba(53,87,61,0.5)]">
      {/* ribbon */}
      <div className="bg-gradient-to-l from-[#25402c] to-[#4e7a5a] text-white text-sm font-bold px-5 py-2.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2"><span className="text-base">🌿</span> הטבה בלעדית · <span className="font-extrabold">Supherb × Nesty</span></span>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors" aria-label="כיווץ">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex gap-4 items-center">
          <div className="w-[88px] h-[88px] rounded-2xl bg-[#ebe7e3] border border-[#dcebe0] flex items-center justify-center shrink-0 overflow-hidden">
            <img src={PRODUCT_IMG} alt="Supherb טאבינגאם" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1f3a26] leading-tight mb-1">
              15% הנחה נוספים בסופהרב 🌿
            </h3>
            <p className="text-[12.5px] text-[#4e7a5a] leading-snug mb-1">15% הנחה נוספים על כל האתר — בנוסף על המבצעים הקיימים.</p>
            <p className="text-sm text-[#25402c] flex items-center gap-1.5 flex-wrap">
              מאת: <span className="font-bold text-[#35573D]">Nesty</span> ×
              <img src={LOGO_IMG} alt="Supherb" className="h-[16px] w-auto inline-block align-middle" />
            </p>
            <div className="mt-2"><ExclusiveBadge /></div>
          </div>
        </div>

        <p className="mt-4 text-[13.5px] text-[#3a4f40] leading-relaxed">{BODY_TEXT}</p>

        <div className="mt-4"><CopyCodeChip source="gifts_page" /></div>
        <Countdown />
        <RedeemButton source="gifts_page" />
        <ReferralNote />
      </div>
    </div>
  )
}

/**
 * Collapsed state — looks like a normal gift in the list (as if someone sent it).
 * Tapping it reopens the full offer popup.
 */
export function SupherbGiftCollapsed({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-right bg-white rounded-2xl border border-[#e3e8e4] hover:border-[#93bd9e] shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-4 active:scale-[0.99]"
    >
      <div className="w-14 h-14 rounded-xl bg-[#ebe7e3] border border-[#dcebe0] flex items-center justify-center shrink-0 overflow-hidden">
        <img src={PRODUCT_IMG} alt="Supherb" className="w-full h-full object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="inline-flex items-center bg-[#e8f1ea] text-[#25402c] rounded-full px-2 py-0.5 text-[10px] font-bold">🌿 הטבה</span>
          <span className="text-[11px] text-[#7a8a7e]">Supherb × Nesty</span>
        </div>
        <p className="font-extrabold text-[#1f3a26] text-[15px] leading-tight truncate">15% הנחה נוספים בסופהרב</p>
        <p className="text-[12px] text-[#4e7a5a] truncate">מאת Nesty · להצגת הקוד וההטבה</p>
      </div>
      <CouponIcon className="w-5 h-5 text-[#35573D] shrink-0" />
    </button>
  )
}

/** The in-app popup announcing the benefit. */
export function SupherbGiftPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => { trackCollab(COLLAB, 'popup_view', 'popup') }, [])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
          aria-label="סגירה"
        >
          <X className="w-4 h-4" />
        </button>

        {/* hero — Supherb green gradient */}
        <div className="px-7 pt-8 pb-7 text-center" style={{ background: 'linear-gradient(135deg,#25402c,#4e7a5a 60%,#93bd9e)' }}>
          <div className="inline-flex items-center bg-white rounded-xl px-4 py-1.5 mb-3 shadow-md">
            <img src={LOGO_IMG} alt="Supherb" className="h-6 w-auto" />
          </div>
          <div className="w-[92px] h-[92px] mx-auto mb-4 bg-[#ebe7e3] rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src={PRODUCT_IMG} alt="Supherb טאבינגאם" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-[22px] font-extrabold text-white mb-1">15% הנחה נוספים בסופהרב 🌿</h2>
          <p className="text-[#e8f1ea] text-sm font-medium"><b className="text-white">Supherb × Nesty</b></p>
        </div>

        {/* body */}
        <div className="px-7 py-6">
          <div className="text-center mb-4"><ExclusiveBadge /></div>
          <p className="text-center text-[#25402c] text-[14.5px] leading-relaxed mb-5">{BODY_TEXT}</p>

          <CopyCodeChip source="popup" />
          <Countdown />
          <RedeemButton source="popup" size="lg" />

          <button
            onClick={onClose}
            className="mt-2 w-full h-10 text-[#4e7a5a] font-semibold text-sm hover:text-[#25402c] transition-colors"
          >
            אולי אחר כך
          </button>

          <ReferralNote />
        </div>
      </div>
    </div>
  )
}

/**
 * Orchestrator. Returns the popup (once per device), the full banner card (above
 * the gifts list), and the collapsed list card. The banner's X collapses it into
 * the list, where it reads like a regular gift; tapping the collapsed card opens
 * the popup again.
 */
export function useSupherbGift() {
  const { user } = useAuth()
  const [showPopup, setShowPopup] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
  const forced = params.get('supherb') === '1'
  const noPopup = params.get('nopopup') === '1'
  const email = (user?.email || '').toLowerCase()
  const inAudience = AUDIENCE === 'all' || TEST_EMAILS.includes(email)
  const live = Date.now() < OFFER_END
  const eligible = live && (forced || inAudience)

  useEffect(() => {
    if (!eligible) return
    // Landing on the gifts page = the perk has been seen → clear the sidebar dot.
    try {
      if (!localStorage.getItem(OPENED_KEY)) {
        localStorage.setItem(OPENED_KEY, '1')
        window.dispatchEvent(new Event(OPENED_EVENT))
      }
    } catch { /* ignore */ }
    try { setCollapsed(!!localStorage.getItem(COLLAPSED_KEY)) } catch { /* ignore */ }
    if (noPopup) return
    let dismissed = false
    try { dismissed = !!localStorage.getItem(POPUP_DISMISS_KEY) } catch { /* ignore */ }
    if (!dismissed) setShowPopup(true)
  }, [eligible, noPopup])

  const closePopup = () => {
    setShowPopup(false)
    try { localStorage.setItem(POPUP_DISMISS_KEY, '1') } catch { /* ignore */ }
  }
  const collapse = () => {
    setCollapsed(true)
    try { localStorage.setItem(COLLAPSED_KEY, '1') } catch { /* ignore */ }
  }
  const openFromCollapsed = () => setShowPopup(true)

  return {
    eligible,
    popup: eligible && showPopup ? <SupherbGiftPopup onClose={closePopup} /> : null,
    banner: eligible && !collapsed ? <SupherbGiftCard onClose={collapse} /> : null,
    listCard: eligible && collapsed ? <SupherbGiftCollapsed onOpen={openFromCollapsed} /> : null,
  }
}

/**
 * Sidebar red-dot indicator. True when the user has an unopened partner gift —
 * i.e. they're in-audience, the offer is live, and they haven't visited the
 * gifts page to see it yet. Clears as soon as they open /gifts (which fires
 * the OPENED_EVENT). Used by the gift nav icon.
 */
export function useCollabGiftBadge(): boolean {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const check = () => {
      let opened = false
      try { opened = !!localStorage.getItem(OPENED_KEY) } catch { /* ignore */ }
      setShow(inCollabAudience(user?.email) && !opened)
    }
    check()
    window.addEventListener(OPENED_EVENT, check)
    return () => window.removeEventListener(OPENED_EVENT, check)
  }, [user])
  return show
}

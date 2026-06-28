import { useState, useEffect } from 'react'
import { Copy, Check, X, ExternalLink, Gift } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { trackCollab } from '../../utils/trackCollab'

/**
 * Nesty × Supherb partner-gift surfaces — the in-app popup and the gifts-page
 * card for the 15% Supherb discount. First real partner perk.
 *
 * Audience rollout is controlled by AUDIENCE below: start as 'test' (only the
 * team's accounts see the gift), flip to 'all' once the test pass is signed off.
 * Append `?supherb=1` to /gifts to force-preview regardless of audience.
 */

const COLLAB = 'supherb'
const CODE = 'NESTY15'
// All redeem CTAs point at the tracking redirect link Supherb gave us.
const REDEEM_URL = 'https://bit.ly/4g1uf7v'
// Fixed campaign end (Asia/Jerusalem). 30-day validity from the 2026-06-28 launch.
const OFFER_END = new Date('2026-07-28T23:59:59+03:00').getTime()

// Rollout switch. 'test' → only TEST_EMAILS see the gift. 'all' → every user.
const AUDIENCE: 'test' | 'all' = 'test'
const TEST_EMAILS = ['tomargov73@gmail.com', 'tom@ppltok.com', 'hello@nestyil.com']

const POPUP_DISMISS_KEY = 'nesty_collab_supherb_popup_dismissed'

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
      <div className="flex-1 flex items-center justify-between bg-[#f3edff] border-[1.5px] border-dashed border-[#9b62d4] rounded-xl px-4 py-2.5">
        <span className="text-xs text-[#6a5e7a]">קוד מתנה</span>
        <span className="text-base font-extrabold tracking-wider text-[#6a35b0]">{CODE}</span>
      </div>
      <button
        onClick={copy}
        className={`h-[42px] px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all active:scale-95 ${
          copied ? 'bg-[#dcedc8] text-[#33691e]' : 'bg-[#6750a4] text-white hover:bg-[#503e85] shadow-md shadow-[#6750a4]/20'
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
    <span className="inline-flex items-center gap-1.5 bg-[#fff0f5] text-[#b3261e] border border-[#ffd8e4] rounded-full px-3.5 py-1 text-xs font-bold">
      ✦ דיל בלעדי לכל משתמשות Nesty
    </span>
  )
}

function ReferralNote() {
  return (
    <div className="mt-3.5 bg-[#f7f1f8] border border-dashed border-[#d0bcff] rounded-2xl px-4 py-3 text-center text-[13px] leading-relaxed text-[#3b1f6b]">
      מכירה עוד מישהי בהריון? שלחי לה את <b className="text-[#6a35b0]">Nesty</b> 💜 ותגלו יחד עוד הטבות וקופונים.
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
      className={`mt-4 w-full ${size === 'lg' ? 'h-12 text-[15px]' : 'h-11 text-sm'} rounded-2xl bg-[#6750a4] text-white font-extrabold flex items-center justify-center gap-2 hover:bg-[#503e85] transition-all shadow-md shadow-[#6750a4]/20`}
    >
      למימוש המתנה <ExternalLink className="w-4 h-4" />
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
  const Box = ({ v, l }: { v: string | number; l: string }) => (
    <div className="bg-[#fbe5e1] border border-[#f4acb7] rounded-[10px] py-1.5 w-14 text-center">
      <div className="text-[21px] font-extrabold text-[#b3261e] leading-none">{v}</div>
      <div className="text-[10px] text-[#9a5560] mt-0.5">{l}</div>
    </div>
  )
  return (
    <div className="mt-3 text-center">
      <span className="block text-xs font-bold text-[#b3261e] mb-1.5">⏳ ההטבה נגמרת בעוד — אל תפספסי</span>
      <div className="inline-flex gap-2" dir="ltr">
        <Box v={d} l="ימים" /><Box v={pad(h)} l="שעות" /><Box v={pad(m)} l="דקות" />
      </div>
    </div>
  )
}

/** Wrapped-gift teaser shown before the user taps "reveal". */
function RevealTeaser({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="text-center py-2">
      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#f3edff] to-[#e9ddff] flex items-center justify-center">
        <Gift className="w-8 h-8 text-[#6a35b0]" />
      </div>
      <p className="text-[15px] text-[#3b1f6b] font-semibold mb-4">חיכתה לך מתנה — רוצה לראות מה יש בפנים? 🎁</p>
      <button
        onClick={onReveal}
        className="w-full h-12 rounded-2xl bg-gradient-to-l from-[#6a35b0] to-[#9b62d4] text-white font-extrabold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#6750a4]/25 active:scale-[0.98]"
      >
        🎁 לחשיפת המתנה
      </button>
    </div>
  )
}

/** The special gift card shown at the top of the gifts list. */
export function SupherbGiftCard() {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { trackCollab(COLLAB, 'card_view', 'gifts_page') }, [])
  const reveal = () => { setRevealed(true); trackCollab(COLLAB, 'card_reveal', 'gifts_page') }
  return (
    <div className="mb-8 rounded-[40px] rounded-tr-[12px] rounded-bl-[12px] bg-white border-2 border-[#d0bcff] overflow-hidden shadow-[0_14px_30px_-16px_rgba(103,80,164,0.5)]">
      {/* ribbon */}
      <div className="bg-gradient-to-l from-[#6a35b0] to-[#9b62d4] text-white text-sm font-bold px-5 py-2.5 flex items-center gap-2">
        <span className="text-base">🎁</span> מתנה מיוחדת · <span className="font-extrabold">Supherb × Nesty</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex gap-4 items-center">
          <div className="w-[78px] h-[78px] rounded-2xl bg-[#faf6ff] border border-[#f0e8ff] flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/demo/supherb-pregently.webp" alt="Supherb" className="w-[70px] h-[70px] object-contain" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1d192b] leading-tight mb-1">
              15% הנחה על מוצרי Supherb
            </h3>
            <p className="text-[12.5px] text-[#6a5e7a] leading-snug mb-1">כל אמא צריכה ויטמינים — אז בחרנו ב-Supherb, הטובים ביותר 💜</p>
            <p className="text-sm text-[#49454f] flex items-center gap-1.5 flex-wrap">
              מאת: <span className="font-bold text-[#6750a4]">Nesty</span> ×
              <img src="/demo/supherb-logo.png" alt="Supherb" className="h-[17px] w-auto inline-block align-middle" /> 💜
            </p>
            <div className="mt-2"><ExclusiveBadge /></div>
          </div>
        </div>

        {revealed ? (
          <>
            <div className="mt-4"><CopyCodeChip source="gifts_page" /></div>
            <Countdown />
            <RedeemButton source="gifts_page" />
          </>
        ) : (
          <div className="mt-4"><RevealTeaser onReveal={reveal} /></div>
        )}

        <ReferralNote />
      </div>
    </div>
  )
}

/** The in-app popup ("push") announcing the gift. */
export function SupherbGiftPopup({ onClose }: { onClose: () => void }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { trackCollab(COLLAB, 'popup_view', 'popup') }, [])
  const reveal = () => { setRevealed(true); trackCollab(COLLAB, 'popup_reveal', 'popup') }
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

        {/* hero */}
        <div className="bg-gradient-to-br from-[#6a35b0] via-[#9b62d4] to-[#c4a0e8] px-7 pt-8 pb-7 text-center">
          <div className="inline-flex items-center bg-white rounded-xl px-4 py-1.5 mb-3 shadow-md">
            <img src="/demo/supherb-logo.png" alt="Supherb" className="h-6 w-auto" />
          </div>
          <div className="w-[88px] h-[88px] mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <img src="/demo/supherb-pregently.webp" alt="Supherb Pregently" className="w-[76px] h-[76px] object-contain" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">קיבלת מתנה! 🎁</h2>
          <p className="text-[#eaddff] text-sm font-medium"><b className="text-white">Supherb × Nesty</b> חשבו עלייך</p>
        </div>

        {/* body */}
        <div className="px-7 py-6">
          <div className="text-center mb-4"><ExclusiveBadge /></div>
          <p className="text-center text-[#3b1f6b] text-[15px] leading-relaxed mb-5">
            כל אמא בהריון צריכה ויטמינים — אז התחברנו ל-<span className="font-extrabold">Supherb</span>, הטובים ביותר.
            <span className="font-extrabold"> 15% הנחה</span> במתנה ממש בשבילך. 💜
          </p>

          {revealed ? (
            <>
              <CopyCodeChip source="popup" />
              <Countdown />
              <RedeemButton source="popup" size="lg" />
            </>
          ) : (
            <RevealTeaser onReveal={reveal} />
          )}

          <button
            onClick={onClose}
            className="mt-2 w-full h-10 text-[#6a5e7a] font-semibold text-sm hover:text-[#6750a4] transition-colors"
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
 * Orchestrator: decides whether the current user is in-audience and renders the
 * popup (once per device) + the gifts-page card. Drop a single <SupherbGift />
 * onto the gifts page. Returns the card via a render-prop-free split so the host
 * page controls where the card sits in its layout.
 */
export function useSupherbGift() {
  const { user } = useAuth()
  const [showPopup, setShowPopup] = useState(false)

  const forced = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('supherb') === '1'
  const noPopup = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nopopup') === '1'
  const email = (user?.email || '').toLowerCase()
  const inAudience = AUDIENCE === 'all' || TEST_EMAILS.includes(email)
  const live = Date.now() < OFFER_END
  const eligible = live && (forced || inAudience)

  useEffect(() => {
    if (!eligible || noPopup) return
    let dismissed = false
    try { dismissed = !!localStorage.getItem(POPUP_DISMISS_KEY) } catch { /* ignore */ }
    if (!dismissed) setShowPopup(true)
  }, [eligible, noPopup])

  const closePopup = () => {
    setShowPopup(false)
    try { localStorage.setItem(POPUP_DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  return {
    eligible,
    popup: eligible && showPopup ? <SupherbGiftPopup onClose={closePopup} /> : null,
    card: eligible ? <SupherbGiftCard /> : null,
  }
}

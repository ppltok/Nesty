import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { generateSlug } from '../../lib/utils'
import { asset } from '../../lib/assets'
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  Baby,
  Link2,
  ExternalLink,
  CheckCircle,
  Loader2,
  Plus,
} from 'lucide-react'
import OnboardingCelebration from '../../components/OnboardingCelebration'
import FadedIconsBackground from '../../components/animations/FadedIconsBackground'
import {
  trackOnboardingStep,
  trackOnboardingCompleted,
  trackRegistryCreated,
  trackItemAdded,
} from '../../utils/tracking'
import { getAttributionForProfile } from '../../utils/utmTracking'
import { extractProductFromUrl } from '../../lib/productExtraction'
import { ITEMS_DATA, CATEGORIES } from '../../data/categories'
import { categoryGradient } from '../../lib/categoryColors'

// ── Fruit mapping for welcome email (weeks 12-40) ──
const FRUIT_BY_WEEK: Record<number, { name: string; emoji: string }> = {
  12: { name: 'ליים', emoji: '🍈' },
  13: { name: 'לימון', emoji: '🍋' },
  14: { name: 'תפוז', emoji: '🍊' },
  15: { name: 'אגס', emoji: '🍐' },
  16: { name: 'אבוקדו', emoji: '🥑' },
  17: { name: 'בצל', emoji: '🧅' },
  18: { name: 'מלפפון', emoji: '🥒' },
  19: { name: 'מנגו', emoji: '🥭' },
  20: { name: 'בטטה', emoji: '🍠' },
  21: { name: 'בננה', emoji: '🍌' },
  22: { name: 'פלפל אדום', emoji: '🌶️' },
  23: { name: 'אשכולית', emoji: '🍊' },
  24: { name: 'רימון', emoji: '🍎' },
  25: { name: 'חציל', emoji: '🍆' },
  26: { name: 'זוקיני', emoji: '🥒' },
  27: { name: 'כרוב', emoji: '🥬' },
  28: { name: 'חסה', emoji: '🥬' },
  29: { name: 'כרובית', emoji: '🥦' },
  30: { name: 'ברוקולי', emoji: '🥦' },
  31: { name: 'קוקוס', emoji: '🥥' },
  32: { name: 'פומלה', emoji: '🍊' },
  33: { name: 'דלורית', emoji: '🎃' },
  34: { name: 'אננס', emoji: '🍍' },
  35: { name: 'פפאיה', emoji: '🍈' },
  36: { name: 'קייל', emoji: '🥬' },
  37: { name: 'מנגולד', emoji: '🥬' },
  38: { name: 'אבטיח קטן', emoji: '🍉' },
  39: { name: 'מלון', emoji: '🍈' },
  40: { name: 'דלעת', emoji: '🎃' },
}

function calculatePregnancyWeek(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr)
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const weeksRemaining = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, Math.min(40, 40 - weeksRemaining))
}

// ── First-item curated grid: real essentials from the live checklist ──
// Each row is a "must-have" item from ITEMS_DATA, with the same recommended
// products users will see later in /checklist. We pull image+url+price+store
// directly from the source data so onboarding always matches the rest of
// the app — no parallel hardcoded list to maintain.
interface CuratedItem {
  name: string         // product name
  price: number
  store: string
  url: string
  image: string
  category: string     // items.category enum value
  parentItem: string   // the essential ITEMS_DATA key (for grouping)
}

// 4 high-impact essentials → category enum value for items table.
// The icon comes from the live CATEGORIES table (same icon shown in /checklist
// and the home page category strip), not from a separate emoji mapping.
const ESSENTIAL_GROUPS: { key: string; categoryEnum: string }[] = [
  { key: 'עגלה לתינוק מגיל לידה', categoryEnum: 'strollers' },
  { key: 'כיסא בטיחות', categoryEnum: 'car_safety' },
  { key: 'תיק החתלה', categoryEnum: 'strollers' },
  { key: 'אמבטיות ומעמדים', categoryEnum: 'bath' },
]

// Map a category enum → its CATEGORIES record (for icon).
function categoryFor(enumValue: string) {
  return CATEGORIES.find((c) => c.id === enumValue)
}

function buildCuratedRows(): { group: typeof ESSENTIAL_GROUPS[number]; products: CuratedItem[] }[] {
  return ESSENTIAL_GROUPS.flatMap((group) => {
    const data = ITEMS_DATA[group.key]
    if (!data?.products?.length) return []
    return [{
      group,
      products: data.products.map((p) => ({
        name: p.name,
        price: p.price,
        store: p.store,
        url: p.url,
        image: p.image,
        category: group.categoryEnum,
        parentItem: group.key,
      })),
    }]
  })
}

type Step = 1 | 2 | 3 | 4 | 5 | 'celebration'

type ReferralSource = 'facebook' | 'instagram' | 'google' | 'tiktok' | 'friend' | 'other' | null

interface OnboardingData {
  firstName: string
  lastName: string
  dueDate: string
  feeling: 'excited' | 'overwhelmed' | 'exploring' | null
  isFirstTimeParent: boolean | null
  referralSource: ReferralSource
  marketingEmails: boolean
}

const referralSources = [
  { value: 'facebook' as const, emoji: '📘', title: 'פייסבוק' },
  { value: 'instagram' as const, emoji: '📸', title: 'אינסטגרם' },
  { value: 'google' as const, emoji: '🔍', title: 'חיפוש בגוגל' },
  { value: 'tiktok' as const, emoji: '🎵', title: 'טיקטוק' },
  { value: 'friend' as const, emoji: '💬', title: 'חבר/ה המליצ/ה' },
  { value: 'other' as const, emoji: '✨', title: 'אחר' },
]

const feelings = [
  { value: 'excited' as const, emoji: '🎉', title: 'מתרגשת!', description: 'אני כל כך שמחה' },
  { value: 'overwhelmed' as const, emoji: '❓', title: 'קצת המומה', description: 'יש כל כך הרבה לחשוב עליו' },
  { value: 'exploring' as const, emoji: '❤️', title: 'סתם בודקת', description: 'רוצה לראות מה יש פה' },
]

// Subtitle for the first-item step adapts to the user's emotional state —
// same grid for everyone, but the framing matches where she is.
function firstItemSubtitle(feeling: OnboardingData['feeling']) {
  if (feeling === 'overwhelmed') {
    return 'בלי לחשוב הרבה — נתחיל בקטן. בחרי פריט אחד שזה הוא בטח יהיה ברשימה שלך.'
  }
  if (feeling === 'excited') {
    return 'בואי נראה את הקסם — בחרי פריט שתאהבי בכיף לראות ברשימה שלך.'
  }
  if (feeling === 'exploring') {
    return 'הנה דוגמה לאיך זה עובד — בחרי משהו ותראי איך הרשימה מתחילה להיראות.'
  }
  return 'בחרי משהו אחד — או הדביקי קישור מכל חנות שאת אוהבת.'
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  // ?preview=1 → render the UI but skip every DB/network side-effect.
  // Used by __nesty.previewOnboarding() to preview the screens safely.
  const isPreview =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('preview') === '1'
  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    dueDate: '',
    feeling: null,
    isFirstTimeParent: null,
    referralSource: null,
    marketingEmails: true, // default ON, disclosure on the final button
  })

  // First-item-step state
  const [pickedItem, setPickedItem] = useState<CuratedItem | null>(null)
  const [pasteUrl, setPasteUrl] = useState('')
  const [extractStatus, setExtractStatus] = useState<
    | { state: 'idle' }
    | { state: 'loading' }
    | { state: 'success'; product: CuratedItem }
    | { state: 'error'; message: string }
  >({ state: 'idle' })

  const stepNames: Record<number, string> = {
    1: 'name',
    2: 'due_date',
    3: 'feeling_and_first_time_parent',
    4: 'referral_source',
    5: 'first_item',
  }

  const handleNext = () => {
    if (typeof step === 'number' && step < 5) {
      if (user) {
        trackOnboardingStep({
          user_id: user.id,
          step,
          step_name: stepNames[step],
          completed: true,
        })
      }
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (typeof step === 'number' && step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSkip = () => {
    if (typeof step === 'number' && step < 5) {
      setStep((step + 1) as Step)
    } else if (step === 5) {
      handleComplete()
    }
  }

  const handlePickItem = (item: CuratedItem) => {
    setPickedItem(item === pickedItem ? null : item)
    setPasteUrl('') // clear URL field when picking from grid
    setExtractStatus({ state: 'idle' })
  }

  const handleExtractUrl = async () => {
    const trimmed = pasteUrl.trim()
    if (!trimmed) return
    try {
      new URL(trimmed)
    } catch {
      setExtractStatus({ state: 'error', message: 'הקישור לא תקין. בדקי שהוא מתחיל ב־https://' })
      return
    }
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setExtractStatus({ state: 'error', message: 'נדרשת התחברות' })
      return
    }
    setExtractStatus({ state: 'loading' })
    try {
      const product = await extractProductFromUrl(trimmed, token)
      const extracted: CuratedItem = {
        name: product.name || 'פריט מהאתר',
        price: parseFloat(product.price) || 0,
        store: new URL(trimmed).hostname.replace(/^www\./, ''),
        url: trimmed,
        image: product.imageUrls[0] || '',
        category: 'general',
        parentItem: 'pasted',
      }
      setExtractStatus({ state: 'success', product: extracted })
      setPickedItem(extracted)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'לא הצלחנו לחלץ — אפשר להוסיף ידנית בהמשך'
      setExtractStatus({ state: 'error', message: msg })
    }
  }

  // "Skip without an item" — explicitly clears any picked item before completing
  const handleSkipFirstItem = () => {
    setPickedItem(null)
    handleComplete()
  }

  const handleComplete = async () => {
    // Preview mode: short-circuit to celebration without any DB writes
    if (isPreview) {
      console.log('[__nesty preview] would have saved:', { data, pickedItem })
      setStep('celebration')
      return
    }
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const profileData: Record<string, unknown> = {
        id: user.id,
        email: user.email || '',
        first_name: data.firstName || user.email?.split('@')[0] || 'משתמש',
        last_name: data.lastName || null,
        due_date: data.dueDate || null,
        onboarding_completed: false,
        marketing_emails: data.marketingEmails,
        // Israeli spam-law audit trail — proves WHEN the user opted in
        // (the moment they clicked "סיימי" with the disclosure visible).
        // Set only on opt-in; opt-out path owns the unsubscribed_at column.
        ...(data.marketingEmails
          ? { marketing_emails_consented_at: new Date().toISOString() }
          : { marketing_emails_unsubscribed_at: new Date().toISOString() }),
      }

      if (data.feeling) profileData.feeling = data.feeling
      if (data.isFirstTimeParent !== null) profileData.is_first_time_parent = data.isFirstTimeParent
      if (data.referralSource) profileData.referral_source = data.referralSource

      Object.assign(profileData, getAttributionForProfile())

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(`שגיאה בעדכון הפרופיל: ${profileError.message}`)
      }

      // Create registry
      const slug = generateSlug(data.firstName || 'user')
      const { data: registryData, error: registryError } = await supabase
        .from('registries')
        .insert({
          owner_id: user.id,
          slug,
          title: `הרשימה של ${data.firstName}`,
        })
        .select('id')
        .single()

      if (registryError) {
        console.error('Registry creation error:', registryError)
        throw new Error(`שגיאה ביצירת הרשימה: ${registryError.message}`)
      }

      // Phase 1: insert the first item if picked — the wow moment
      if (registryData && pickedItem) {
        const itemPayload = {
          registry_id: registryData.id,
          name: pickedItem.name,
          price: pickedItem.price,
          image_url: pickedItem.image || null,
          original_url: pickedItem.url || null,
          store_name: pickedItem.store || 'ידני',
          category: pickedItem.category,
          quantity: 1,
          is_most_wanted: true, // first item is "most-wanted" by default — shines on dashboard
          added_via: 'manual',
        }
        console.log('[onboarding] Inserting first item:', itemPayload)
        const { data: insertedItem, error: itemError } = await supabase
          .from('items')
          .insert(itemPayload)
          .select('id')
          .single()
        if (itemError) {
          console.error('[onboarding] First-item insert FAILED:', itemError)
          // Surface to the user so they know — registry still exists, retry-able later
          setError(`הרשימה נוצרה אבל הוספת הפריט נכשלה: ${itemError.message}. אפשר להוסיף ידנית מהרשימה.`)
        } else if (insertedItem) {
          console.log('[onboarding] ✅ First item added:', insertedItem.id, pickedItem.name)
          trackItemAdded({
            registry_id: registryData.id,
            item_id: insertedItem.id,
            item_name: pickedItem.name,
            item_category: pickedItem.category,
            item_price: pickedItem.price,
            source: extractStatus.state === 'success' ? 'paste' : 'manual',
            has_extension: false,
          })
        }
      }

      if (registryData) {
        trackRegistryCreated({
          registry_id: registryData.id,
          user_id: user.id,
          source: 'organic',
        })
        trackOnboardingCompleted({
          user_id: user.id,
          registry_id: registryData.id,
        })
      }

      // Welcome email — fire and forget
      try {
        const currentWeek = data.dueDate ? calculatePregnancyWeek(data.dueDate) : 12
        const clampedWeek = Math.max(12, Math.min(40, currentWeek))
        const fruitInfo = FRUIT_BY_WEEK[clampedWeek] || FRUIT_BY_WEEK[12]
        supabase.functions
          .invoke('send-email', {
            body: {
              type: 'welcome',
              to: user.email,
              data: {
                userId: user.id,
                firstName: data.firstName || user.email?.split('@')[0] || 'את',
                currentWeek: clampedWeek,
                fruitName: fruitInfo.name,
                fruitEmoji: fruitInfo.emoji,
              },
            },
          })
          .catch((err) => console.error('Welcome email error:', err))
      } catch (emailErr) {
        console.error('Welcome email setup error:', emailErr)
      }

      setStep('celebration')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא צפויה. נסי שוב.'
      setError(errorMessage)
      console.error('Error completing onboarding:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return data.firstName.trim().length > 0
    if (step === 2) return data.dueDate.trim().length > 0
    return true
  }

  const handleCelebrationComplete = async () => {
    // Preview mode: just bounce home, no DB writes, no flag flips
    if (isPreview) {
      navigate('/?onboarding-preview=done')
      return
    }
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
        if (error) console.error('Error marking onboarding complete:', error)

        // Admin notification: full onboarding-completed signal to
        // hello@nestyil.com. Replaces the old admin_new_user that fired from
        // AuthCallback before any data was collected. Deduped per-user via
        // profiles.admin_completed_notified_at — only invoke if still null.
        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select(
              'admin_completed_notified_at, first_name, last_name, due_date, feeling, is_first_time_parent, referral_source, utm_source, utm_medium, utm_campaign, landing_page, landing_referrer'
            )
            .eq('id', user.id)
            .maybeSingle()

          if (profileRow && !profileRow.admin_completed_notified_at) {
            const dueDateStr = profileRow.due_date || ''
            const pregnancyWeek = dueDateStr
              ? Math.max(1, Math.min(42, calculatePregnancyWeek(dueDateStr)))
              : null
            const skippedSteps: string[] = []
            if (!profileRow.last_name) skippedSteps.push('last_name')
            if (!profileRow.due_date) skippedSteps.push('due_date')
            if (!profileRow.feeling) skippedSteps.push('feeling')
            if (profileRow.is_first_time_parent === null || profileRow.is_first_time_parent === undefined)
              skippedSteps.push('is_first_time_parent')
            if (!profileRow.referral_source) skippedSteps.push('referral_source')
            if (!pickedItem) skippedSteps.push('first_item')

            // Minutes from auth signup → onboarding completion
            let minutesToComplete: number | undefined
            const createdAt = (user as { created_at?: string }).created_at
            if (createdAt) {
              const ms = Date.now() - new Date(createdAt).getTime()
              if (ms >= 0) minutesToComplete = Math.round(ms / 60000)
            }

            const fullName = [profileRow.first_name, profileRow.last_name].filter(Boolean).join(' ')

            supabase.functions
              .invoke('send-email', {
                body: {
                  type: 'admin_onboarding_completed',
                  to: 'hello@nestyil.com',
                  data: {
                    userEmail: user.email,
                    userName: fullName,
                    firstName: profileRow.first_name || '',
                    signupDate: new Date().toLocaleDateString('he-IL'),
                    minutesToComplete,
                    dueDate: dueDateStr,
                    pregnancyWeek: pregnancyWeek ?? undefined,
                    feeling: profileRow.feeling || '',
                    isFirstTimeParent: profileRow.is_first_time_parent,
                    referralSource: profileRow.referral_source || '',
                    firstItem: pickedItem
                      ? {
                          name: pickedItem.name,
                          price: pickedItem.price ?? null,
                          store: pickedItem.store,
                          category: pickedItem.category,
                          url: pickedItem.url,
                        }
                      : null,
                    skippedSteps,
                    utmSource: profileRow.utm_source || '',
                    utmMedium: profileRow.utm_medium || '',
                    utmCampaign: profileRow.utm_campaign || '',
                    landingPage: profileRow.landing_page || '',
                    landingReferrer: profileRow.landing_referrer || '',
                  },
                },
              })
              .then(async ({ error: invokeErr }) => {
                if (invokeErr) {
                  console.warn('admin_onboarding_completed invoke failed (non-critical):', invokeErr)
                  return
                }
                await supabase
                  .from('profiles')
                  .update({ admin_completed_notified_at: new Date().toISOString() })
                  .eq('id', user.id)
              })
              .catch((err) =>
                console.warn('admin_onboarding_completed error (non-critical):', err)
              )
          }
        } catch (notifyErr) {
          console.warn('admin_onboarding_completed setup error (non-critical):', notifyErr)
        }

        try {
          sessionStorage.setItem('nesty_from_onboarding', 'true')
        } catch {
          // ignore
        }

        navigate('/checklist', { state: { fromOnboarding: true } })
        setTimeout(() => refreshProfile(), 100)
        return
      } catch (err) {
        console.error('Error in handleCelebrationComplete:', err)
      }
    }
    try {
      sessionStorage.setItem('nesty_from_onboarding', 'true')
    } catch {
      // ignore
    }
    navigate('/checklist', { state: { fromOnboarding: true } })
  }

  if (step === 'celebration') {
    return (
      <OnboardingCelebration
        userName={data.firstName || 'משתמש'}
        onComplete={handleCelebrationComplete}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4 py-8 relative" dir="rtl">
      <FadedIconsBackground count={40} className="z-0 opacity-70" />
      {/* Soft corner blobs — sized & positioned to feel like a subtle accent
          at any viewport. On mobile we shrink them and push slightly off-edge
          so they don't overwhelm the small viewport (was: fixed 288/384 px
          blobs that took over the screen on phones). */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 md:top-20 -right-10 md:right-10 w-40 h-40 md:w-72 md:h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 md:bottom-20 -left-10 md:left-10 w-48 h-48 md:w-96 md:h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center mb-6">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-16 w-auto" />
        </Link>

        {/* Progress dots — 5 steps now */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s === step ? 'bg-[#6750a4]' : (typeof step === 'number' && s < step) ? 'bg-[#6750a4]/50' : 'bg-[#e7e0ec]'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">

          {/* ─────────── Step 1: Name ─────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">בואי נכיר!</h1>
                <p className="text-[#49454f]">עוד כמה פרטים ואת מוכנה להתחיל</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d192b] mb-2">שם פרטי</label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    placeholder="מה השם שלך?"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-[#e7e0ec] bg-white text-[#1d192b] placeholder:text-[#49454f]/60 focus:border-[#6750a4] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d192b] mb-2">שם משפחה (אופציונלי)</label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    placeholder="שם משפחה"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-[#e7e0ec] bg-white text-[#1d192b] placeholder:text-[#49454f]/60 focus:border-[#6750a4] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium text-lg hover:bg-[#7c5fbd] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                המשך
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─────────── Step 2: Due Date ─────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f3edff] rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[#6750a4]" />
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">מתי התאריך המשוער?</h1>
                <p className="text-[#49454f]">זה יעזור לנו להתאים את החוויה אלייך</p>
              </div>
              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-[16px] border-2 border-[#e7e0ec] bg-white text-[#1d192b] text-center focus:border-[#6750a4] focus:outline-none transition-colors"
              />
              <p className="text-sm text-[#49454f] text-center">אופציונלי - אפשר לדלג</p>
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                  חזור
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium hover:bg-[#7c5fbd] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  המשך
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleSkip} className="w-full text-[#49454f] hover:text-[#6750a4] text-sm transition-colors">
                דלג
              </button>
            </div>
          )}

          {/* ─────────── Step 3: Feeling + First-Time-Parent (combined, compact) ─────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#ffd8e4]/40 rounded-[16px] flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-[#ba1a5c]" />
                </div>
                <h1 className="text-xl font-medium text-[#1d192b] mb-1">איך את מרגישה?</h1>
                <p className="text-xs text-[#49454f]">אין תשובה נכונה או לא נכונה</p>
              </div>

              <div className="space-y-2">
                {feelings.map((feeling) => (
                  <button
                    key={feeling.value}
                    onClick={() => setData({ ...data, feeling: feeling.value })}
                    className={`w-full p-2.5 rounded-[14px] border-2 text-right transition-all ${
                      data.feeling === feeling.value
                        ? 'border-[#6750a4] bg-[#f3edff]/50'
                        : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feeling.emoji}</span>
                      <div>
                        <p className="font-medium text-[#1d192b] text-sm">{feeling.title}</p>
                        <p className="text-xs text-[#49454f]">{feeling.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Inline first-time-parent question — compact */}
              <div className="border-t border-[#e7e0ec] pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Baby className="w-4 h-4 text-[#6750a4]" />
                  <p className="text-xs font-medium text-[#1d192b]">זה הילד הראשון שלך?</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setData({ ...data, isFirstTimeParent: true })}
                    className={`flex-1 px-3 py-2 rounded-[12px] border-2 text-xs font-medium transition-all ${
                      data.isFirstTimeParent === true
                        ? 'border-[#6750a4] bg-[#f3edff]/50 text-[#6750a4]'
                        : 'border-[#e7e0ec] text-[#1d192b] hover:border-[#6750a4]/50'
                    }`}
                  >
                    👶 כן, הראשון!
                  </button>
                  <button
                    onClick={() => setData({ ...data, isFirstTimeParent: false })}
                    className={`flex-1 px-3 py-2 rounded-[12px] border-2 text-xs font-medium transition-all ${
                      data.isFirstTimeParent === false
                        ? 'border-[#6750a4] bg-[#f3edff]/50 text-[#6750a4]'
                        : 'border-[#e7e0ec] text-[#1d192b] hover:border-[#6750a4]/50'
                    }`}
                  >
                    👨‍👩‍👧 כבר עם ילדים
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-[24px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium text-sm hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזור
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-[24px] bg-[#6750a4] text-white font-medium text-sm hover:bg-[#7c5fbd] transition-all duration-300"
                >
                  המשך
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleSkip} className="w-full text-[#49454f] hover:text-[#6750a4] text-xs transition-colors">
                דלג
              </button>
            </div>
          )}

          {/* ─────────── Step 4: Referral source ─────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#d3e4fd]/40 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📣</span>
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">איך הגעת אלינו?</h1>
                <p className="text-[#49454f]">זה עוזר לנו למצוא עוד הורים כמוך</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {referralSources.map((source) => (
                  <button
                    key={source.value}
                    onClick={() => setData({ ...data, referralSource: source.value })}
                    className={`p-4 rounded-[20px] border-2 text-center transition-all ${
                      data.referralSource === source.value
                        ? 'border-[#6750a4] bg-[#f3edff]/50'
                        : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{source.emoji}</span>
                    <p className="font-medium text-[#1d192b] text-sm">{source.title}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                  חזור
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium hover:bg-[#7c5fbd] transition-all duration-300"
                >
                  המשך
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleSkip} className="w-full text-center text-sm text-[#49454f] hover:text-[#6750a4] transition-colors">
                דלג
              </button>
            </div>
          )}

          {/* ─────────── Step 5: First Item — the wow moment ─────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-[#f3edff] rounded-[18px] flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-7 h-7 text-[#6750a4]" />
                </div>
                <h1 className="text-xl font-medium text-[#1d192b] mb-1">הרגע הכי כיף 🪺</h1>
                <p className="text-sm text-[#49454f]">{firstItemSubtitle(data.feeling)}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-[14px] text-center text-xs border border-red-100">
                  {error}
                </div>
              )}

              {/* URL paste — compact */}
              <div className="bg-[#f9f7fc] border border-[#e7e0ec] rounded-[16px] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Link2 className="w-3.5 h-3.5 text-[#6750a4]" />
                  <p className="text-xs font-medium text-[#1d192b]">יש לך קישור מחנות?</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    placeholder="הדביקי קישור מכל אתר"
                    className="flex-1 min-w-0 px-3 py-2 rounded-[10px] border border-[#e7e0ec] bg-white text-sm text-[#1d192b] placeholder:text-[#49454f]/60 focus:border-[#6750a4] focus:outline-none"
                    disabled={extractStatus.state === 'loading'}
                  />
                  <button
                    onClick={handleExtractUrl}
                    disabled={!pasteUrl.trim() || extractStatus.state === 'loading'}
                    className="px-3 py-2 rounded-[10px] bg-[#6750a4] text-white text-xs font-medium hover:bg-[#5a4690] disabled:opacity-40 transition-colors flex-shrink-0"
                  >
                    {extractStatus.state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'הוסף'}
                  </button>
                </div>
                {extractStatus.state === 'success' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2e7d32] bg-[#e8f5e9] px-2.5 py-1.5 rounded-[8px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    מעולה! "{extractStatus.product.name}" נבחר
                  </div>
                )}
                {extractStatus.state === 'error' && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 px-2.5 py-1.5 rounded-[8px]">
                    {extractStatus.message}
                  </div>
                )}
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-2 text-[10px] text-[#9e9e9e]">
                <div className="flex-1 border-t border-[#e7e0ec]" />
                <span>או בחרי פריט פופולרי מהצ'קליסט</span>
                <div className="flex-1 border-t border-[#e7e0ec]" />
              </div>

              {/* Real essentials — same products users see in /checklist */}
              <div className="space-y-3 max-h-[320px] overflow-y-auto -mx-1 px-1">
                {buildCuratedRows().map(({ group, products }) => {
                  const cat = categoryFor(group.categoryEnum)
                  const CatIcon = cat?.icon
                  return (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                      {CatIcon && cat && (
                        <span
                          style={categoryGradient(group.categoryEnum)}
                          className="w-7 h-7 rounded-lg shadow-sm flex items-center justify-center text-white flex-shrink-0"
                        >
                          <CatIcon className="w-4 h-4" />
                        </span>
                      )}
                      <p className="text-xs font-bold text-[#1d192b]">{group.key}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {products.map((item) => {
                        const isPicked = pickedItem?.url === item.url
                        return (
                          <button
                            key={item.url}
                            onClick={() => handlePickItem(item)}
                            className={`relative text-right p-1.5 rounded-[12px] border-2 transition-all ${
                              isPicked
                                ? 'border-[#6750a4] bg-[#f3edff]/40 shadow-sm'
                                : 'border-[#e7e0ec] hover:border-[#6750a4]/50 bg-white'
                            }`}
                          >
                            {isPicked && (
                              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#6750a4] text-white flex items-center justify-center z-10">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <div className="aspect-square bg-[#f5f5f5] rounded-[8px] mb-1 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                            <p className="text-[10px] font-bold text-[#1d192b] leading-tight line-clamp-2">
                              {item.name}
                            </p>
                            <p className="text-[9px] text-[#49454f]">{item.store}</p>
                            <p className="text-[10px] font-bold text-[#6750a4]">₪{item.price.toLocaleString()}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Final CTAs */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-[24px] bg-white border-2 border-[#e7e0ec] text-[#1d192b] font-medium text-sm hover:border-[#6750a4] hover:bg-[#f3edff]/30 transition-all duration-300"
                >
                  <ArrowRight className="w-4 h-4" />
                  חזור
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-[24px] bg-[#6750a4] text-white font-medium text-sm hover:bg-[#7c5fbd] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pickedItem ? (
                    <>
                      <Plus className="w-4 h-4" />
                      הוסיפי וסיימי
                    </>
                  ) : (
                    <>
                      סיימי
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Marketing disclosure — Israeli spam-law requires the
                  consent text to be prominent, not buried at 10px gray. */}
              <p className="text-[12px] text-[#49454f] text-center leading-relaxed px-2">
                בלחיצה על "סיימי" את מאשרת קבלת אימיילים שיווקיים מ-Nesty
                (באבו קפיטל בע"מ). אפשר לבטל בכל רגע מ
                <Link to="/settings/emails" className="underline hover:text-[#6750a4] font-medium">
                  הגדרות
                </Link>{' '}
                או בלחיצה על "הסרה" בכל אימייל.
              </p>

              {/* Skip — explicitly clears the picked item */}
              <button
                onClick={handleSkipFirstItem}
                disabled={isLoading}
                className="w-full text-[#49454f] hover:text-[#6750a4] text-xs transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                דלגי וסיימי בלי פריט
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[#49454f] mt-6">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}

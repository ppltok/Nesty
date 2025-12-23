import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { generateSlug } from '../../lib/utils'
import { asset } from '../../lib/assets'
import { ArrowRight, ArrowLeft, Calendar, Sparkles, Baby, Mail } from 'lucide-react'
import OnboardingCelebration from '../../components/OnboardingCelebration'
import { trackOnboardingStep, trackOnboardingCompleted, trackRegistryCreated } from '../../utils/tracking'

type Step = 1 | 2 | 3 | 4 | 5 | 'celebration'

interface OnboardingData {
  firstName: string
  lastName: string
  dueDate: string
  feeling: 'excited' | 'overwhelmed' | 'exploring' | null
  isFirstTimeParent: boolean | null
  marketingEmails: boolean
}

const feelings = [
  { value: 'excited' as const, emoji: '🎉', title: 'מתרגשים!', description: 'אנחנו כל כך שמחים' },
  { value: 'overwhelmed' as const, emoji: '❓', title: 'קצת המומים', description: 'יש כל כך הרבה לחשוב עליו' },
  { value: 'exploring' as const, emoji: '❤️', title: 'סתם בודקים', description: 'רוצים לראות מה יש פה' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    dueDate: '',
    feeling: null,
    isFirstTimeParent: null,
    marketingEmails: false,
  })

  const stepNames: Record<number, string> = {
    1: 'name',
    2: 'due_date',
    3: 'feeling',
    4: 'first_time_parent',
    5: 'marketing_emails',
  }

  const handleNext = () => {
    if (typeof step === 'number' && step < 5) {
      // Track step completion
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
    if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    } else if (step === 4) {
      setStep(5)
    } else if (step === 5) {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      // Build profile object - use upsert to handle case where profile wasn't created by trigger
      // NOTE: We set onboarding_completed to FALSE here initially
      // It will be set to TRUE after the celebration screen
      const profileData: Record<string, unknown> = {
        id: user.id,
        email: user.email || '',
        first_name: data.firstName || user.email?.split('@')[0] || 'משתמש',
        last_name: data.lastName || null,
        due_date: data.dueDate || null,
        onboarding_completed: false, // Keep false until celebration is done
        marketing_emails: data.marketingEmails,
      }

      // Only include feeling if user selected one (database has CHECK constraint)
      if (data.feeling) {
        profileData.feeling = data.feeling
      }

      // Only include is_first_time_parent if user selected an option
      if (data.isFirstTimeParent !== null) {
        profileData.is_first_time_parent = data.isFirstTimeParent
      }

      // Upsert profile (insert if not exists, update if exists)
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

      // Track registry creation and onboarding completion
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

      // Don't refresh profile yet - it would trigger redirect
      // Show celebration screen first
      setStep('celebration')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה לא צפויה. נסו שוב.'
      setError(errorMessage)
      console.error('Error completing onboarding:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return data.firstName.trim().length > 0
    return true
  }

  // Handle celebration complete
  const handleCelebrationComplete = async () => {
    // Now mark onboarding as complete
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)

        if (error) {
          console.error('Error marking onboarding complete:', error)
        }

        // Set sessionStorage flag BEFORE navigation as backup for the tutorial trigger
        try {
          sessionStorage.setItem('nesty_from_onboarding', 'true')
        } catch {
          // Ignore sessionStorage errors
        }

        // Navigate FIRST with the state, then refresh profile
        // This ensures the navigation state is preserved before any re-renders
        navigate('/dashboard', { state: { fromOnboarding: true } })

        // Refresh profile after navigation to update context
        // Using setTimeout to ensure navigation completes first
        setTimeout(() => {
          refreshProfile()
        }, 100)
        return
      } catch (err) {
        console.error('Error in handleCelebrationComplete:', err)
      }
    }

    // Set sessionStorage flag BEFORE navigation as backup for the tutorial trigger
    try {
      sessionStorage.setItem('nesty_from_onboarding', 'true')
    } catch {
      // Ignore sessionStorage errors
    }

    // Fallback navigation if something went wrong
    navigate('/dashboard', { state: { fromOnboarding: true } })
  }

  // Show celebration screen
  if (step === 'celebration') {
    return (
      <OnboardingCelebration
        userName={data.firstName || 'משתמש'}
        onComplete={handleCelebrationComplete}
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbff] px-4 py-8" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#eaddff]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffd8e4]/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-6">
          <img src={asset('Nesty_logo.png')} alt="Nesty" className="h-16 w-auto" />
        </Link>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s === step ? 'bg-[#6750a4]' : s < step ? 'bg-[#6750a4]/50' : 'bg-[#e7e0ec]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#e7e0ec] p-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">בואו נכיר!</h1>
                <p className="text-[#49454f]">עוד כמה פרטים ואתם מוכנים להתחיל</p>
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

          {/* Step 2: Due Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f3edff] rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[#6750a4]" />
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">מתי התאריך המשוער?</h1>
                <p className="text-[#49454f]">זה יעזור לנו להתאים את החוויה עבורכם</p>
              </div>

              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-[16px] border-2 border-[#e7e0ec] bg-white text-[#1d192b] text-center focus:border-[#6750a4] focus:outline-none transition-colors"
              />

              <p className="text-sm text-[#49454f] text-center">
                אופציונלי - אפשר לדלג
              </p>

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

              <button
                onClick={handleSkip}
                className="w-full text-[#49454f] hover:text-[#6750a4] text-sm transition-colors"
              >
                דלג
              </button>
            </div>
          )}

          {/* Step 3: Feeling */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#ffd8e4]/40 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#ba1a5c]" />
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">איך אתם מרגישים?</h1>
                <p className="text-[#49454f]">אין תשובה נכונה או לא נכונה</p>
              </div>

              <div className="space-y-3">
                {feelings.map((feeling) => (
                  <button
                    key={feeling.value}
                    onClick={() => setData({ ...data, feeling: feeling.value })}
                    className={`w-full p-4 rounded-[20px] border-2 text-right transition-all ${
                      data.feeling === feeling.value
                        ? 'border-[#6750a4] bg-[#f3edff]/50'
                        : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{feeling.emoji}</span>
                      <div>
                        <p className="font-medium text-[#1d192b]">{feeling.title}</p>
                        <p className="text-sm text-[#49454f]">{feeling.description}</p>
                      </div>
                    </div>
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

              <button
                onClick={handleSkip}
                className="w-full text-[#49454f] hover:text-[#6750a4] text-sm transition-colors"
              >
                דלג
              </button>
            </div>
          )}

          {/* Step 4: First Time Parent */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f3edff] rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Baby className="w-8 h-8 text-[#6750a4]" />
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">זה הילד הראשון שלכם?</h1>
                <p className="text-[#49454f]">נתאים את החוויה בהתאם לניסיון שלכם</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setData({ ...data, isFirstTimeParent: true })}
                  className={`w-full p-4 rounded-[20px] border-2 text-right transition-all ${
                    data.isFirstTimeParent === true
                      ? 'border-[#6750a4] bg-[#f3edff]/50'
                      : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">👶</span>
                    <div>
                      <p className="font-medium text-[#1d192b]">כן, זה הראשון!</p>
                      <p className="text-sm text-[#49454f]">מתרגשים מאוד</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setData({ ...data, isFirstTimeParent: false })}
                  className={`w-full p-4 rounded-[20px] border-2 text-right transition-all ${
                    data.isFirstTimeParent === false
                      ? 'border-[#6750a4] bg-[#f3edff]/50'
                      : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">👨‍👩‍👧</span>
                    <div>
                      <p className="font-medium text-[#1d192b]">לא, כבר יש לנו ילדים</p>
                      <p className="text-sm text-[#49454f]">מוסיפים עוד אחד למשפחה</p>
                    </div>
                  </div>
                </button>
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

              <button
                onClick={handleSkip}
                className="w-full text-[#49454f] hover:text-[#6750a4] text-sm transition-colors"
              >
                דלג
              </button>
            </div>
          )}

          {/* Step 5: Marketing Emails */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#ffd8e4]/40 rounded-[20px] flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#ba1a5c]" />
                </div>
                <h1 className="text-2xl font-medium text-[#1d192b] mb-2">להישאר מעודכנים?</h1>
                <p className="text-[#49454f]">נשלח לכם טיפים, מבצעים והמלצות שימושיות</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[16px] text-center text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => setData({ ...data, marketingEmails: true })}
                  className={`w-full p-4 rounded-[20px] border-2 text-right transition-all ${
                    data.marketingEmails === true
                      ? 'border-[#6750a4] bg-[#f3edff]/50'
                      : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">💌</span>
                    <div>
                      <p className="font-medium text-[#1d192b]">כן, אשמח לקבל עדכונים</p>
                      <p className="text-sm text-[#49454f]">טיפים, מבצעים והמלצות</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setData({ ...data, marketingEmails: false })}
                  className={`w-full p-4 rounded-[20px] border-2 text-right transition-all ${
                    data.marketingEmails === false
                      ? 'border-[#6750a4] bg-[#f3edff]/50'
                      : 'border-[#e7e0ec] hover:border-[#6750a4]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🙅</span>
                    <div>
                      <p className="font-medium text-[#1d192b]">לא תודה</p>
                      <p className="text-sm text-[#49454f]">רק התראות חיוניות</p>
                    </div>
                  </div>
                </button>
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
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[28px] bg-[#6750a4] text-white font-medium hover:bg-[#7c5fbd] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      סיום
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="w-full text-[#49454f] hover:text-[#6750a4] text-sm transition-colors"
              >
                דלג
              </button>
            </div>
          )}
        </div>

        {/* Back to home */}
        <p className="text-center text-[#49454f] mt-6">
          <Link to="/" className="hover:text-[#6750a4] transition-colors">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    </div>
  )
}

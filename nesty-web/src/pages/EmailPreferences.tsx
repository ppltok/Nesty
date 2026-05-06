// /settings/emails — granular email preferences page.
//
// Layout mirrors the Settings page (max-w-2xl, bg-white rounded-2xl cards).
// Toggles auto-save on change (no Save button); matches the pattern used in
// other Nesty settings surfaces. When the master is off, category toggles
// are visually disabled but their underlying DB values aren't touched — so
// turning the master back on restores the user's prior category choices.

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ChevronRight, Gift, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { EMAIL_CATEGORIES, CATEGORY_ORDER } from '../lib/emailCategories'

interface PrefsState {
  marketing_emails: boolean
  email_weekly_pregnancy: boolean
  email_engagement_reminders: boolean
  email_feature_announcements: boolean
  email_price_alerts: boolean
}

const DEFAULT_PREFS: PrefsState = {
  marketing_emails: true,
  email_weekly_pregnancy: true,
  email_engagement_reminders: true,
  email_feature_announcements: true,
  email_price_alerts: true,
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative w-12 h-7 rounded-full transition-colors flex-shrink-0
        ${checked && !disabled ? 'bg-primary' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform
          ${checked ? 'translate-x-[-1px]' : 'translate-x-[-19px]'}
        `}
        style={{ right: 0 }}
      />
    </button>
  )
}

export default function EmailPreferences() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState<PrefsState>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<keyof PrefsState | null>(null)
  const [savedKey, setSavedKey] = useState<keyof PrefsState | null>(null)

  // Load current values from the profile (or fall back if columns don't exist yet).
  useEffect(() => {
    if (!user) return
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('marketing_emails, email_weekly_pregnancy, email_engagement_reminders, email_feature_announcements, email_price_alerts')
        .eq('id', user.id)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        // Migration not applied yet — treat as default (all true).
        setPrefs(DEFAULT_PREFS)
      } else {
        setPrefs({
          marketing_emails: data.marketing_emails ?? true,
          email_weekly_pregnancy: data.email_weekly_pregnancy ?? true,
          email_engagement_reminders: data.email_engagement_reminders ?? true,
          email_feature_announcements: data.email_feature_announcements ?? true,
          email_price_alerts: data.email_price_alerts ?? true,
        })
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [user])

  async function toggleColumn(column: keyof PrefsState) {
    if (!user) return
    const next = !prefs[column]
    setPrefs((p) => ({ ...p, [column]: next }))
    setSavingKey(column)
    // Israeli spam-law audit trail. When the master switch flips, stamp
    // either the consent or the unsubscribe timestamp so we can prove
    // when the user opted in or out. Per-category toggles don't legally
    // need a stamp (they're sub-preferences below the master).
    const updatePayload: Record<string, unknown> = { [column]: next }
    if (column === 'marketing_emails') {
      updatePayload[next ? 'marketing_emails_consented_at' : 'marketing_emails_unsubscribed_at'] =
        new Date().toISOString()
    }
    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
    setSavingKey(null)
    if (error) {
      // Roll back UI on failure.
      console.error(`[EmailPreferences] failed to update ${column}:`, error)
      setPrefs((p) => ({ ...p, [column]: !next }))
      return
    }
    setSavedKey(column)
    setTimeout(() => setSavedKey((k) => (k === column ? null : k)), 2000)
    // Profile in the auth context is stale now — refresh so other pages see new values.
    void refreshProfile?.()
  }

  const masterOff = !prefs.marketing_emails
  const firstName = profile?.first_name || ''

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back to Settings */}
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה להגדרות
        </Link>

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              העדפות אימייל
            </h1>
            <p className="text-muted-foreground">
              {firstName ? `${firstName}, בחרי ` : 'בחרי '}אילו אימיילים תרצי לקבל
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-border p-6 text-center text-muted-foreground">
            טוען את ההעדפות שלך…
          </div>
        ) : (
          <div className="space-y-6">
            {/* Master switch */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <h2 className="text-base sm:text-lg font-bold text-foreground mb-1">
                    🔕 כל הדיוור השיווקי
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    מבטל את כל סוגי האימיילים השיווקיים בבת אחת. ניתן להפעיל שוב בכל זמן.
                  </p>
                </div>
                <Toggle
                  checked={prefs.marketing_emails}
                  disabled={savingKey === 'marketing_emails'}
                  onChange={() => toggleColumn('marketing_emails')}
                  label="כל הדיוור השיווקי"
                />
              </div>
              {savedKey === 'marketing_emails' && (
                <p className="mt-3 text-xs text-green-600">נשמר ✓</p>
              )}
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-1">סוגי אימיילים</p>
                {masterOff ? (
                  <p className="text-xs text-amber-600">
                    המתג הראשי כבוי — כל הקטגוריות מושבתות. הפעילי אותו למעלה כדי לנהל העדפות ספציפיות.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    כל קטגוריה ניתנת לכיבוי בנפרד
                  </p>
                )}
              </div>

              <div className="divide-y divide-border">
                {CATEGORY_ORDER.map((key) => {
                  const cat = EMAIL_CATEGORIES[key]
                  const column = cat.column as keyof PrefsState
                  const checked = prefs[column]
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 ${masterOff ? 'opacity-50' : ''}`}
                    >
                      <div className="flex-1 text-right">
                        <p className="font-medium text-foreground mb-0.5">
                          {cat.emoji}&nbsp;&nbsp;{cat.label_he}
                        </p>
                        <p className="text-xs text-muted-foreground">{cat.description_he}</p>
                      </div>
                      <Toggle
                        checked={checked}
                        disabled={masterOff || savingKey === column}
                        onChange={() => toggleColumn(column)}
                        label={cat.label_he}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Transactional notice */}
            <div className="bg-[#fdf6ff] rounded-2xl border border-[#e8daf5] p-5">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-foreground mb-1">
                    הודעות על קבלת מתנות מחברים ומשפחה
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    גם הזמנות לנהל את הרשימה ביחד עם בן/בת הזוג — נשלחות תמיד ולא ניתן לבטל אותן.
                    הן חלק מהשירות שאת מצפה לו כשמישהו קונה לך מתנה או רוצה להצטרף לרשימה.
                  </p>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/settings')}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                חזרה להגדרות
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

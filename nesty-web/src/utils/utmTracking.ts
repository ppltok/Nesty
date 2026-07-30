// src/utils/utmTracking.ts
// Captures UTM parameters + referrer on the user's first landing
// and persists them in localStorage so they're available at signup
// (which may happen days later). Also pushes to GTM dataLayer for
// Google Analytics attribution.

const STORAGE_KEY = 'nesty_attribution'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export interface Attribution {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  landing_page: string | null
  landing_referrer: string | null
  captured_at: string
}

/**
 * Call once on app boot. If the current URL has UTM params, captures them
 * (first-touch - doesn't overwrite an existing record unless new UTMs present).
 */
export function captureAttributionOnLanding(): void {
  if (typeof window === 'undefined') return

  try {
    const params = new URLSearchParams(window.location.search)
    const hasUtm = UTM_KEYS.some(k => params.get(k))

    const existing = getStoredAttribution()

    // If the user already has attribution stored and this visit has no new UTMs,
    // keep the first-touch data untouched.
    if (existing && !hasUtm) return

    const attribution: Attribution = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
      landing_page: window.location.pathname + window.location.search,
      landing_referrer: document.referrer || null,
      captured_at: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))

    // Push to GTM dataLayer so Google Analytics / Tag Manager can use it
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'attribution_captured',
        ...attribution,
      })
    }
  } catch (err) {
    console.warn('Failed to capture attribution:', err)
  }
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch {
    return null
  }
}

/**
 * Returns only the non-null fields, ready to spread into a Supabase upsert
 * for the `profiles` table.
 */
export function getAttributionForProfile(): Partial<Record<keyof Attribution, string>> {
  const a = getStoredAttribution()
  if (!a) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(a)) {
    if (v && k !== 'captured_at') out[k] = v
  }
  return out
}

export function clearStoredAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // noop
  }
}

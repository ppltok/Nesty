import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { captureAttributionOnLanding } from './utils/utmTracking'
import { supabase } from './lib/supabase'

// Capture UTM params + referrer on first landing (before React renders)
captureAttributionOnLanding()

// ── DEV-ONLY: console helpers to reset onboarding/tutorial state ─────────
// In production this block is dropped via the `import.meta.env.DEV` guard.
// Usage in the browser console:
//    await __nesty.resetOnboarding()    → clears profile flag + registry + items + tutorial state, reloads
//    __nesty.replayTutorial()           → clears tutorial state only, navigates to /checklist
if (import.meta.env.DEV) {
  type NestyDevApi = {
    resetOnboarding: () => Promise<void>
    previewOnboarding: () => void
    replayTutorial: () => void
    me: () => Promise<unknown>
  }

  const clearOnboardingLocalState = () => {
    try {
      // Tutorial / popup / engagement flags. Drop everything that gates the
      // onboarding-then-tutorial path; auth session is left intact.
      const keep = (k: string) => k.startsWith('sb-') && k.endsWith('-auth-token')
      Object.keys(localStorage).forEach((k) => {
        if (!keep(k)) localStorage.removeItem(k)
      })
      sessionStorage.clear()
    } catch (e) {
      console.warn('local clear failed', e)
    }
  }

  const api: NestyDevApi = {
    async resetOnboarding() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[__nesty] not logged in')
        return
      }
      console.log('[__nesty] resetting onboarding for', user.id)

      // Clear registries (cascades to items via FK ON DELETE CASCADE)
      const { error: regErr } = await supabase
        .from('registries')
        .delete()
        .eq('owner_id', user.id)
      if (regErr) console.warn('registry delete:', regErr.message)
      else console.log('[__nesty] registries cleared')

      // Reset profile flag
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ onboarding_completed: false, marketing_emails: true })
        .eq('id', user.id)
      if (profErr) console.warn('profile reset:', profErr.message)
      else console.log('[__nesty] profile flag reset')

      // Clear local state + reload
      clearOnboardingLocalState()
      console.log('[__nesty] reloading → onboarding…')
      window.location.href = '/onboarding'
    },

    previewOnboarding() {
      // Renders the onboarding UI without any DB writes. Bypasses the
      // route guard via ?preview=1 - Onboarding.tsx detects the same
      // flag and stubs handleComplete/handleCelebrationComplete.
      window.location.href = '/onboarding?preview=1'
    },

    replayTutorial() {
      clearOnboardingLocalState()
      try {
        sessionStorage.setItem('nesty_from_onboarding', 'true')
      } catch {/* ignore */}
      window.location.href = '/checklist'
    },

    async me() {
      const { data } = await supabase.auth.getUser()
      return data.user
    },
  }

  ;(window as unknown as { __nesty: NestyDevApi }).__nesty = api
  console.log(
    '%c🪺 Nesty dev helpers loaded',
    'color: #86608e; font-weight: bold;',
    '\n  __nesty.previewOnboarding()       - preview the onboarding UI, no DB writes',
    '\n  await __nesty.resetOnboarding()   - full reset (deletes registry+items, flips flag)',
    '\n  __nesty.replayTutorial()          - tutorial only, no DB changes',
    '\n  await __nesty.me()                - current user',
  )
}

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error })

  // Check if it's a localStorage-related error
  if (
    String(message).includes('localStorage') ||
    String(message).includes('JSON') ||
    String(message).includes('parse')
  ) {
    console.warn('Detected storage-related error, clearing Nesty data (preserving auth)')
    try {
      // Loop guard: if clearing + reloading didn't fix it, stop after 2
      // attempts in this session instead of reloading forever.
      const reloads = parseInt(sessionStorage.getItem('nesty_error_reloads') || '0', 10)
      if (reloads >= 2) {
        console.warn('Storage-error reload limit reached, not reloading again')
        return
      }
      sessionStorage.setItem('nesty_error_reloads', String(reloads + 1))
      // Only clear Nesty keys, not Supabase auth session
      const nestyKeys = [
        'nesty-checked-suggestions',
        'nesty-hidden-suggestions',
        'nesty-suggestion-quantities',
        'nesty-revealed-surprises',
        'nesty-storage-version',
      ]
      nestyKeys.forEach(key => localStorage.removeItem(key))
      window.location.reload()
    } catch {
      // Can't do anything
    }
  }
}

// Global handler for unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason)
}

// NOTE: StrictMode removed to prevent double-execution issues with Supabase auth
// In production, Vite doesn't use StrictMode anyway, so this matches prod behavior
createRoot(document.getElementById('root')!).render(<App />)

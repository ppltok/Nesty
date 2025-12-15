import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom fetch wrapper with timeout to prevent indefinite hangs
const fetchWithTimeout = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  console.log('Supabase fetch starting:', typeof url === 'string' ? url : url.toString())

  const controller = new AbortController()
  const timeout = setTimeout(() => {
    console.warn('Supabase request timeout after 15 seconds:', url)
    controller.abort()
  }, 15000) // 15 second timeout

  // Merge signals if the original options had one
  const mergedOptions = { ...options, signal: controller.signal }

  return fetch(url, mergedOptions)
    .then(response => {
      console.log('Supabase fetch completed:', typeof url === 'string' ? url : url.toString(), response.status)
      return response
    })
    .catch(err => {
      console.error('Supabase fetch error:', err)
      throw err
    })
    .finally(() => clearTimeout(timeout))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow to prevent refresh token race conditions
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

// Helper to clear corrupted auth state and redirect to signin
export const forceSignOut = async () => {
  console.log('Force sign out: Clearing auth state')
  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Error during signOut:', e)
  }
  // Clear all Supabase auth data from localStorage
  const keysToRemove = Object.keys(localStorage).filter(key =>
    key.startsWith('sb-') || key.includes('supabase')
  )
  keysToRemove.forEach(key => localStorage.removeItem(key))
  // Hard redirect to signin
  window.location.href = `${import.meta.env.BASE_URL}auth/signin`
}

// Check if an error is an auth/token error
export const isAuthError = (error: unknown): boolean => {
  if (!error) return false
  const err = error as { message?: string; code?: string; status?: number }
  const message = err.message?.toLowerCase() || ''
  const code = err.code || ''
  const status = err.status

  return (
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('invalid_grant') ||
    message.includes('refresh_token') ||
    message.includes('not authenticated') ||
    message.includes('invalid claim') ||
    code === 'PGRST301' ||
    code === 'invalid_grant' ||
    status === 401 ||
    status === 403
  )
}

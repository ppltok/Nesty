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
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

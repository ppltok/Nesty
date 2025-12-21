/**
 * Page Script - Injected into the page context to access localStorage
 * Communicates with content script via window.postMessage
 */

(function() {
  console.log('🔐 Page script executing...')
  console.log('📦 localStorage keys:', Object.keys(localStorage))

  // Get Supabase session from localStorage
  function getSupabaseSession() {
    try {
      // Look for Supabase auth token in localStorage
      console.log('🔍 Searching for Supabase session in localStorage...')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        console.log('  Key:', key)
        if (key && key.includes('sb-') && key.includes('-auth-token')) {
          console.log('✅ Found Supabase auth key:', key)
          const data = localStorage.getItem(key)
          if (data) {
            const parsed = JSON.parse(data)
            console.log('✅ Session parsed successfully, user:', parsed.user?.email)
            return parsed
          }
        }
      }
      console.log('❌ No Supabase session found in localStorage')
      return null
    } catch (error) {
      console.error('❌ Error getting Supabase session:', error)
      return null
    }
  }

  // Send session to content script
  const session = getSupabaseSession()
  console.log('📤 Posting message to content script:', session ? 'Session found' : 'No session')
  window.postMessage({
    type: 'NESTY_SUPABASE_SESSION',
    session: session
  }, '*')
  console.log('✅ Message posted')
})()

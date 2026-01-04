/**
 * Page Script - Injected into the page context to access localStorage
 * Communicates with content script via window.postMessage
 */

(function() {
  console.log('🔐 Page script executing...')
  console.log('📦 Current origin:', window.location.origin)

  // Get all localStorage keys
  const allKeys = Object.keys(localStorage)
  console.log('📦 localStorage keys:', allKeys)
  console.log('📦 Total localStorage items:', allKeys.length)

  // Get Supabase session from localStorage
  function getSupabaseSession() {
    try {
      // Look for Supabase auth token in localStorage
      console.log('🔍 Searching for Supabase session in localStorage...')

      // Try multiple patterns
      const patterns = [
        { name: 'auth-token', test: (k) => k.includes('sb-') && k.includes('-auth-token') },
        { name: 'sb- prefix', test: (k) => k.startsWith('sb-') },
        { name: 'supabase.auth', test: (k) => k.includes('supabase.auth') },
        { name: 'auth.token', test: (k) => k.includes('auth') && k.includes('token') }
      ]

      for (const pattern of patterns) {
        console.log(`🔍 Trying pattern: ${pattern.name}`)

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)

          if (key && pattern.test(key)) {
            console.log(`✅ Found potential auth key with pattern "${pattern.name}":`, key)
            const data = localStorage.getItem(key)

            if (data) {
              try {
                const parsed = JSON.parse(data)
                console.log('📄 Data structure:', Object.keys(parsed))

                // Check if it looks like a Supabase session
                if (parsed.access_token || (parsed.user && parsed.user.id)) {
                  console.log('✅ Session parsed successfully, user:', parsed.user?.email || parsed.user?.id)
                  return parsed
                } else if (parsed.currentSession) {
                  // Some Supabase versions store it nested
                  console.log('✅ Found nested session')
                  return parsed.currentSession
                } else {
                  console.log('⚠️ Data found but doesn\'t look like a session:', Object.keys(parsed))
                }
              } catch (parseError) {
                console.log('⚠️ Could not parse as JSON:', key)
              }
            }
          }
        }
      }

      console.log('❌ No Supabase session found in localStorage')
      console.log('💡 Tip: Make sure you\'re logged in at http://localhost:5173')
      return null
    } catch (error) {
      console.error('❌ Error getting Supabase session:', error)
      return null
    }
  }

  // Send session to content script
  const session = getSupabaseSession()
  console.log('📤 Posting message to content script:', session ? 'Session found ✅' : 'No session ❌')
  window.postMessage({
    type: 'NESTY_SUPABASE_SESSION',
    session: session
  }, '*')
  console.log('✅ Message posted')
})()

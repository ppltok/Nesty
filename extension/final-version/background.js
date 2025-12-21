/**
 * Nesty Extension - Background Service Worker
 * Listens for clicks on the extension icon and handles session fetching
 */

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🎯 Nesty Extension - Icon clicked!');
  console.log('📍 Current tab URL:', tab.url);

  // Only work on http/https pages
  if (!tab.url.startsWith('http')) {
    console.warn('⚠️ Extension only works on web pages');
    return;
  }

  try {
    // Inject the content script into the current page
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    console.log('✅ Content script injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject content script:', error);
  }
});

/**
 * Handle messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message.type);

  if (message.type === 'GET_SESSION') {
    // Handle session fetching asynchronously
    getSupabaseSession().then(session => {
      console.log('📤 Sending session to content script:', session ? 'Found' : 'Not found');
      sendResponse({ session });
    }).catch(error => {
      console.error('❌ Error getting session:', error);
      sendResponse({ session: null });
    });

    // Return true to indicate async response
    return true;
  }
});

/**
 * Get Supabase session from chrome.storage or localhost:5173
 */
async function getSupabaseSession() {
  console.log('🔍 Checking chrome.storage for session...');

  // First, try to get session from chrome.storage
  try {
    const result = await chrome.storage.local.get(['nesty_session']);
    if (result.nesty_session) {
      console.log('✅ Found session in chrome.storage');

      // Check if session is still valid (not expired)
      const expiresAt = new Date(result.nesty_session.expires_at).getTime();
      const now = Date.now();

      if (expiresAt > now) {
        console.log('✅ Session is valid');
        return result.nesty_session;
      } else {
        console.log('⚠️ Session expired, clearing...');
        await chrome.storage.local.remove(['nesty_session']);
      }
    }
  } catch (error) {
    console.error('❌ Error reading chrome.storage:', error);
  }

  // If no valid session in storage, try to get it from localhost:5173
  console.log('🔍 Querying localhost:5173 for session...');

  try {
    // Query for localhost:5173 tabs
    const tabs = await chrome.tabs.query({ url: 'http://localhost:5173/*' });

    if (tabs.length > 0) {
      console.log('✅ Found localhost:5173 tab, getting session...');

      // Execute script in localhost:5173 to get session
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // This runs in the context of localhost:5173
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
              const data = localStorage.getItem(key);
              if (data) {
                return JSON.parse(data);
              }
            }
          }
          return null;
        }
      });

      if (results && results[0] && results[0].result) {
        const session = results[0].result;
        console.log('✅ Got session from localhost:5173');

        // Save to chrome.storage for future use
        await chrome.storage.local.set({ nesty_session: session });

        return session;
      }
    } else {
      console.log('⚠️ No localhost:5173 tab found');
    }
  } catch (error) {
    console.error('❌ Error querying localhost:5173:', error);
  }

  console.log('❌ No valid session found');
  return null;
}

/**
 * Nesty Extension - Background Service Worker
 * Listens for clicks on the extension icon and handles session fetching
 */

import { config } from './config.js';

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
    getSupabaseSession().then(session => {
      console.log('📤 Sending session to content script:', session ? 'Found' : 'Not found');
      sendResponse({ session });
    }).catch(error => {
      console.error('❌ Error getting session:', error);
      sendResponse({ session: null });
    });

    return true;
  }
});

/**
 * Returns true if the session's access token has more than 5 minutes left.
 * Supabase stores expires_at as Unix seconds (not milliseconds).
 */
function isSessionValid(session) {
  if (!session || !session.access_token) return false;
  const nowSeconds = Date.now() / 1000;
  const bufferSeconds = 300; // refresh 5 min before expiry
  return session.expires_at > nowSeconds + bufferSeconds;
}

/**
 * Refresh the access token using the refresh_token.
 */
async function refreshToken(session) {
  console.log('🔄 Refreshing expired token...');
  const response = await fetch(
    `${config.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        'apikey': config.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Token refresh failed ${response.status}: ${body}`);
  }

  const newSession = await response.json();
  console.log('✅ Token refreshed successfully');
  return newSession;
}

/**
 * Read the raw session object from the Nesty web app tab's localStorage.
 */
async function readSessionFromTab() {
  console.log(`🔍 Querying ${config.WEB_URL} for session...`);
  try {
    const tabs = await chrome.tabs.query({ url: `${config.WEB_URL}/*` });
    if (tabs.length === 0) {
      console.log(`⚠️ No ${config.WEB_URL} tab found`);
      return null;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
            const data = localStorage.getItem(key);
            if (data) return JSON.parse(data);
          }
        }
        return null;
      }
    });

    if (results && results[0] && results[0].result) {
      console.log(`✅ Got session from ${config.WEB_URL} tab`);
      return results[0].result;
    }
  } catch (error) {
    console.error(`❌ Error querying ${config.WEB_URL}:`, error);
  }
  return null;
}

/**
 * Get a valid Supabase session, refreshing if expired.
 */
async function getSupabaseSession() {
  // 1. Check cache
  let session = null;
  try {
    const result = await chrome.storage.local.get(['nesty_session']);
    if (result.nesty_session) {
      session = result.nesty_session;
      if (isSessionValid(session)) {
        console.log('✅ Using valid cached session');
        return session;
      }
      console.log('⚠️ Cached session expired or expiring soon');
    }
  } catch (error) {
    console.error('❌ Error reading chrome.storage:', error);
  }

  // 2. Try to get a fresh session from the Nesty tab
  const tabSession = await readSessionFromTab();
  if (tabSession) {
    session = tabSession;
  }

  if (!session) {
    console.log('❌ No session found anywhere');
    return null;
  }

  // 3. Refresh token if still expired/expiring
  if (!isSessionValid(session)) {
    if (!session.refresh_token) {
      console.log('❌ No refresh token available');
      await chrome.storage.local.remove(['nesty_session']);
      return null;
    }
    try {
      session = await refreshToken(session);
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await chrome.storage.local.remove(['nesty_session']);
      return null;
    }
  }

  // 4. Cache the valid session
  await chrome.storage.local.set({ nesty_session: session });
  return session;
}

/**
 * Nesty Extension - Background Service Worker
 * Listens for clicks on the extension icon and handles session fetching
 */

import { config } from './config.js';

const THANK_YOU_PAGE_URL = chrome.runtime.getURL('thank-you.html');
const PRODUCT_DEMO_URL = 'https://www.shilav.co.il/collections/new-born-carts/products/%D7%A2%D7%A8%D7%99%D7%A1%D7%94-%D7%90%D7%91%D7%9F-%D7%99%D7%95%D7%99%D7%95-2';

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'install') {
    return;
  }

  try {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('thank-you.html'),
      active: true
    });
    await chrome.tabs.create({
      url: 'https://nestyil.com/',
      active: false
    });
  } catch (error) {
    console.error('❌ Failed to open install tabs:', error);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log('🎯 Nesty Extension - Icon clicked!');
  console.log('📍 Current tab URL:', tab.url);

  if (tab.url === THANK_YOU_PAGE_URL) {
    console.log('✨ Thank-you page detected, opening demo product flow');
    await openExtensionOnDemoProductPage();
    return;
  }

  // Extension pages cannot receive injected content scripts.
  if (!tab.url.startsWith('http')) {
    console.warn('⚠️ Extension only works on web pages');
    return;
  }

  try {
    await injectContentScript(tab.id);
  } catch (error) {
    console.error('❌ Failed to inject content script:', error);
  }
});

async function injectContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  });

  console.log('✅ Content script injected successfully');
}

async function openExtensionOnDemoProductPage() {
  try {
    const existingTabs = await chrome.tabs.query({ url: PRODUCT_DEMO_URL });

    if (existingTabs.length > 0) {
      const demoTab = existingTabs[0];
      await chrome.tabs.update(demoTab.id, { active: true });
      await waitForTabComplete(demoTab.id);
      await injectContentScript(demoTab.id);
      return;
    }

    const createdTab = await chrome.tabs.create({
      url: PRODUCT_DEMO_URL,
      active: true
    });

    await waitForTabComplete(createdTab.id);
    await injectContentScript(createdTab.id);
  } catch (error) {
    console.error('❌ Failed demo product launch flow:', error);
  }
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        resolve();
        return;
      }

      if (tab.status === 'complete') {
        resolve();
        return;
      }

      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

/**
 * Handle messages from content script and button-injector
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

  // Triggered by the in-page floating/inline button
  if (message.type === 'OPEN_PRODUCT_FORM') {
    (async () => {
      const session = await getSupabaseSession().catch(() => null);
      if (!session) {
        sendResponse({ needsLogin: true });
        return;
      }
      try {
        await injectContentScript(sender.tab.id);
        sendResponse({ ok: true });
      } catch (error) {
        console.error('❌ Failed to inject content script from button:', error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  }

  if (message.type === 'OPEN_LOGIN_TAB') {
    chrome.tabs.create({ url: message.url, active: true });
    sendResponse({ ok: true });
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
 * Read the current auth state from the Nesty web app tab(s).
 *
 * The tab's localStorage is the source of truth for *who is signed in*, so we
 * must distinguish three states - "no tab" is not the same as "signed out":
 *   { tabPresent: false, session: null }  - no Nesty tab open; identity unknown
 *   { tabPresent: true,  session: null }  - Nesty tab open but signed out
 *   { tabPresent: true,  session: {...} } - Nesty tab open with an active session
 *
 * A user can have several Nesty tabs open, so we scan them and prefer a tab that
 * is logged in - that way a stray signed-out tab never masks an active session.
 */
async function readSessionFromTab() {
  console.log(`🔍 Querying ${config.WEB_URL} for session...`);
  try {
    const tabs = await chrome.tabs.query({ url: `${config.WEB_URL}/*` });
    if (tabs.length === 0) {
      console.log(`⚠️ No ${config.WEB_URL} tab found`);
      return { tabPresent: false, session: null };
    }

    let sawTab = false;
    for (const tab of tabs) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
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
        sawTab = true;
        const session = results && results[0] && results[0].result;
        if (session) {
          console.log(`✅ Got session from ${config.WEB_URL} tab`);
          return { tabPresent: true, session };
        }
      } catch (error) {
        // Tab may be mid-navigation or not scriptable - try the next one.
        console.warn('⚠️ Could not read a Nesty tab, trying next:', error?.message);
      }
    }

    // We saw at least one scriptable Nesty tab and none held a session → signed out.
    return { tabPresent: sawTab, session: null };
  } catch (error) {
    console.error(`❌ Error querying ${config.WEB_URL}:`, error);
    return { tabPresent: false, session: null };
  }
}

/**
 * Best-effort: write a refreshed session back into the Nesty tab's localStorage
 * (same sb-*-auth-token key) so the web app's Supabase client adopts the rotated
 * tokens instead of later retrying with the now-invalidated old refresh_token -
 * which would trip Supabase's refresh-token rotation reuse-detection. Merges into
 * the existing stored object and refuses to cross-write a different user's slot.
 */
async function writeSessionToTab(session) {
  if (!session || !session.access_token) return;
  const patch = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user
  };

  let tabs = [];
  try {
    tabs = await chrome.tabs.query({ url: `${config.WEB_URL}/*` });
  } catch {
    return;
  }

  for (const tab of tabs) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [patch],
        func: (patch) => {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
              let existing = {};
              try { existing = JSON.parse(localStorage.getItem(key)) || {}; } catch { existing = {}; }
              // Never overwrite a different account's session.
              if (existing.user?.id && patch.user?.id && existing.user.id !== patch.user.id) return;
              const merged = { ...existing };
              for (const k in patch) {
                if (patch[k] !== undefined) merged[k] = patch[k];
              }
              localStorage.setItem(key, JSON.stringify(merged));
              return;
            }
          }
        }
      });
    } catch {
      // best effort - ignore unscriptable tabs
    }
  }
}

/**
 * Get a valid Supabase session, refreshing if expired.
 *
 * The cache in chrome.storage.local is only a token optimization; the Nesty
 * tab's localStorage is authoritative for *who is signed in*. We reconcile the
 * cache against the tab on every call so a logout / account switch on the site
 * can't leak items into the previously cached account's registry.
 */
async function getSupabaseSession() {
  // 1. Read whatever we cached last time.
  let cached = null;
  try {
    const result = await chrome.storage.local.get(['nesty_session']);
    cached = result.nesty_session || null;
  } catch (error) {
    console.error('❌ Error reading chrome.storage:', error);
  }

  // 2. Reconcile against the live auth state in the Nesty tab.
  const tab = await readSessionFromTab();

  if (tab.tabPresent) {
    if (!tab.session) {
      // Signed out on the site - the cached session belongs to nobody now.
      if (cached) {
        console.log('🚪 Nesty tab is signed out - clearing cached session');
        await chrome.storage.local.remove(['nesty_session']);
      }
      return null;
    }

    const tabUserId = tab.session.user?.id;
    const cachedUserId = cached?.user?.id;

    if (cached && tabUserId && cachedUserId && tabUserId !== cachedUserId) {
      console.log('🔄 Nesty tab user changed - discarding cached session for previous account');
      cached = null;
    }

    // Prefer the tab's live (SDK-maintained) session when we have nothing valid
    // cached for this user. This also keeps us from calling the refresh endpoint
    // ourselves while a healthy tab is open - avoiding rotating the web app's
    // refresh_token out from under it (reuse-detection risk).
    if (!cached || (!isSessionValid(cached) && isSessionValid(tab.session))) {
      cached = tab.session;
    }
  }

  const session = cached;
  if (!session) {
    console.log('❌ No session found anywhere');
    return null;
  }

  // 3. Fast path - a session we already trust.
  if (isSessionValid(session)) {
    console.log('✅ Using valid session');
    await chrome.storage.local.set({ nesty_session: session });
    return session;
  }

  // 4. Nothing fresh available anywhere - refresh as a last resort.
  if (!session.refresh_token) {
    console.log('❌ No refresh token available');
    await chrome.storage.local.remove(['nesty_session']);
    return null;
  }

  let refreshed;
  try {
    refreshed = await refreshToken(session);
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    await chrome.storage.local.remove(['nesty_session']);
    return null;
  }

  // Preserve identity if the refresh response omitted the user object, so the
  // next call's account check still works.
  if (!refreshed.user && session.user) {
    refreshed.user = session.user;
  }

  await chrome.storage.local.set({ nesty_session: refreshed });

  // Keep the web app and extension on the same rotated refresh_token.
  if (tab.tabPresent && tab.session) {
    await writeSessionToTab(refreshed);
  }

  return refreshed;
}

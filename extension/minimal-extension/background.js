/**
 * Background Service Worker for Babylist API Tester Extension
 *
 * This script runs in the background and listens for clicks
 * on the extension icon in the Chrome toolbar
 */

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  console.log('🎯 Extension icon clicked!');
  console.log('📍 Current tab URL:', tab.url);

  // Only work on http/https pages (not chrome:// or extension pages)
  if (!tab.url.startsWith('http')) {
    console.warn('⚠️ Extension only works on web pages');
    return;
  }

  try {
    // Inject our content script into the current page
    // This script will run on the page and can access the DOM
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    console.log('✅ Content script injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject content script:', error);
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received in background:', request);

  // Handle API fetch requests
  if (request.action === 'fetchBabylistAPI') {
    const productUrl = request.url;
    const encodedUrl = encodeURIComponent(productUrl);
    const apiEndpoint = `https://www.babylist.com/api/v3/scraper_directives?url=${encodedUrl}`;

    console.log('🔗 Fetching API from background:', apiEndpoint);

    // Make the fetch request from the background script (bypasses CORS)
    fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('✅ API response received:', data);
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        console.error('❌ API fetch error:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

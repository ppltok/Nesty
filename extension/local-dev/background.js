/**
 * Background Service Worker for Nesty Local Dev Extension
 * Connects to local Vite dev server on localhost:5173
 */

const LOCAL_API_BASE = 'http://localhost:5173/api';

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  console.log('🎯 Nesty Extension clicked!');
  console.log('📍 Current tab URL:', tab.url);

  // Only work on http/https pages
  if (!tab.url.startsWith('http')) {
    console.warn('⚠️ Extension only works on web pages');
    return;
  }

  try {
    // Inject content script
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

  // Handle scrape request
  if (request.action === 'scrapeProduct') {
    const productUrl = request.url;
    const encodedUrl = encodeURIComponent(productUrl);
    const apiEndpoint = `${LOCAL_API_BASE}/scrape?url=${encodedUrl}`;

    console.log('🔗 Fetching from local API:', apiEndpoint);

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

  // Handle direct product extraction (no API call)
  if (request.action === 'extractProduct') {
    console.log('📦 Extracting product from page (no API call)');
    // Content script will handle extraction directly
    sendResponse({ success: true });
    return false;
  }
});

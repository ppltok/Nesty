/**
 * Nesty Extension - Background Service Worker
 * Listens for clicks on the extension icon and injects the content script
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

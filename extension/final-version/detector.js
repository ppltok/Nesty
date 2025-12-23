/**
 * Nesty Extension Detector
 * Lightweight script that runs automatically on nestyil.com to signal extension is installed
 */

// Set detection markers immediately
document.documentElement.setAttribute('data-nesty-extension-installed', 'true');
document.documentElement.setAttribute('data-nesty-extension-version', '1.3.0');

// Also dispatch a custom event for dynamic detection
window.dispatchEvent(new CustomEvent('nestyExtensionDetected', {
  detail: {
    version: '1.3.0',
    installed: true
  }
}));

console.log('✅ Nesty Extension detected and markers set');

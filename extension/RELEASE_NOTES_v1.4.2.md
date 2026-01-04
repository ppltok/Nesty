# Nesty Extension v1.4.2 - Release Notes

**Release Date:** December 31, 2024

## What's New

### Wix Platform Support
- ✅ Added full support for Wix e-commerce sites
- ✅ Fixed price extraction on Wix sites (e.g., baby-lee.co.il)
- ✅ Uses Wix-specific DOM selectors (`data-hook="formatted-primary-price"`)
- ✅ Priority-based extraction: DOM elements → Meta tags fallback

### UI Changes
- 🔧 Temporarily hidden "פתוח למשומש" (Open to secondhand) toggle
  - Feature not yet available on website
  - Logic preserved for future re-enablement
  - Just remove `display: none;` from line 1795 to restore

### Bug Fixes
- 🐛 Fixed incorrect price extraction from Wix sites
  - Previous: Extracted wrong price from dynamically-modified meta tags
  - Now: Extracts correct price from `data-wix-price` attribute
- 🐛 Updated version number display to 1.4.2

### Technical Improvements
- Platform detection now includes Wix sites
- More reliable extraction using platform-specific DOM selectors
- Better logging for debugging extraction issues
- Code cleanup: Moved old files to archive/ folder

## Files Included

**Production Configuration:**
- ✅ ENV set to 'production'
- ✅ WEB_URL: https://nestyil.com
- ✅ No localhost permissions (Chrome Store compliance)

**Package:**
- Location: `extension/nesty-extension-v1.4.2.zip`
- Size: 536 KB
- Ready for Chrome Web Store upload

## Upgrade Notes

**For Chrome Store Submission:**
1. Upload `extension/nesty-extension-v1.4.2.zip`
2. Update store listing with: "תמיכה משופרת לאתרי Wix" (Improved Wix site support)

**For Users:**
- Extension will auto-update through Chrome Web Store
- No action required from users
- Works with existing Nesty accounts

## Testing

**Verified on:**
- ✅ baby-lee.co.il (Wix platform)
- ✅ shilav.co.il (Shopify platform)
- ✅ AliExpress (all regions)
- ✅ Amazon (with USD→ILS conversion)

## Developer Notes

**Source Code:**
- Development version: `extension/final-version/` (includes localhost for debugging)
- Chrome Store version: `extension/chrome-store-v1.4.2/` (production config, no localhost)

**After Upload:**
- Restore localhost to `extension/final-version/manifest.json` if needed for continued development

# Nesty Extension v1.4.5 Release Notes

**Release Date:** January 4, 2026

## What's New

### 🔧 Bug Fixes & Improvements

#### Price Extraction Enhancement
- **Fixed price extraction on Elementor-based e-commerce sites** (mommyshop.co.il, etc.)
  - Added support for sites using `#tovel_initial_price` selector
  - Implemented fallback ASCII character filtering for Unicode currency symbols (₪, €, £, etc.)
  - Resolved regex matching issues when prices contain non-standard symbols

#### Generic DOM Extraction Fallback
- Added comprehensive DOM extraction fallback for sites without JSON-LD structured data
- Improved robustness when dealing with international currency symbols
- Extension and website now share synchronized extraction logic

### 🛡️ Quality Assurance

#### New Safeguards
- Added automated verification script to prevent production configuration errors
- Created mandatory release checklist for Chrome Store submissions
- Implemented multi-layer verification process

## Technical Details

### Changes Made

1. **extension/final-version/content.js**
   - Added `#tovel_initial_price` to DOM price selectors list
   - Implemented ASCII character filtering fallback when regex fails
   - Handles Unicode currency symbols (₪, €, £, ¥, etc.)

2. **nesty-web/src/lib/productExtraction.ts**
   - Added `extractFromGenericDOM()` function for sites without JSON-LD
   - Implemented same price extraction logic as extension
   - Maintained code synchronization between extension and website

3. **Release Process Improvements**
   - Created `verify-chrome-store-package.js` verification script
   - Created `CHROME_STORE_RELEASE_CHECKLIST.md` mandatory checklist
   - Prevents configuration errors in production releases

### How Price Extraction Works

When extracting product prices:
1. First attempts standard regex pattern matching
2. If regex fails (due to Unicode symbols), falls back to ASCII character filtering (codes 48-57)
3. Extracts all numeric characters and decimal separators
4. Returns clean price string (e.g., "39" from "₪39")

## Tested On

- mommyshop.co.il (Elementor-based, Hebrew Shekel symbol)
- motsesim.co.il (Shopify-based)
- Generic sites with various currency symbols

## Browser Compatibility

- Chrome/Chromium 90+
- Manifest V3

## Installation

### For Users
Upload to Chrome Web Store and users will receive automatic update

### For Developers/Testing
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-store-v1.4.5/` folder

## Changelog

### Version 1.4.5 (January 4, 2026)
- **Fixed:** Price extraction for Elementor-based sites
- **Fixed:** Unicode currency symbol handling (₪, €, £, etc.)
- **Added:** Generic DOM extraction fallback for sites without JSON-LD
- **Added:** Automated verification script for releases
- **Added:** Mandatory release checklist
- **Improved:** Extraction logic synchronization between extension and website

### Version 1.4.4
- Fixed production mode configuration
- Removed localhost from Chrome Store package

### Version 1.4.3
- Added Wix support
- Hidden secondhand toggle

### Version 1.4.2
- Internal testing

## Verification

This release has been verified using:
```bash
node extension/verify-chrome-store-package.js chrome-store-v1.4.5
```

All checks passed ✅

## Known Limitations

- JSON-LD extraction is still the primary method and preferred for accuracy
- DOM extraction is a fallback for sites without proper structured data
- Some sites with custom JavaScript rendering may require additional selectors

## Support

For issues or feature requests:
- GitHub Issues: https://github.com/ppltok/Nesty/issues
- Report extraction failures with the exact URL and product name

---

**Version:** 1.4.5
**Release Date:** January 4, 2026
**Status:** ✅ Verified & Ready for Chrome Web Store
**Verification:** Passed automated checks

# Nesty Extension v1.4.3 Release Notes

**Release Date:** January 4, 2026

## What's New

### 🔧 Bug Fixes

#### Price Extraction Improvements
- **Fixed price extraction on Elementor-based e-commerce sites** (mommyshop.co.il, etc.)
  - Added support for sites using `#tovel_initial_price` selector
  - Implemented fallback ASCII character filtering for Unicode currency symbols (₪, €, £, etc.)
  - Resolved regex matching issues when prices contain non-standard symbols

#### Extraction Logic Enhancements
- Added generic DOM extraction fallback for sites without JSON-LD structured data
- Improved robustness when dealing with international currency symbols
- Both extension and website now share synchronized extraction logic

## Technical Details

### Changes Made

1. **extension/final-version/content.js**
   - Added `#tovel_initial_price` to DOM price selectors list
   - Implemented ASCII character filtering as fallback when regex fails
   - Handles Unicode currency symbols (₪, €, £, ¥, etc.)

2. **nesty-web/src/lib/productExtraction.ts**
   - Added `extractFromGenericDOM()` function for sites without JSON-LD
   - Implemented same price extraction logic as extension
   - Maintained code synchronization between extension and website

### How It Works

When extracting product prices:
1. First attempts standard regex pattern matching
2. If regex fails (due to Unicode symbols), falls back to ASCII character filtering (codes 48-57)
3. Extracts all numeric characters and decimal separators
4. Returns clean price string (e.g., "39" from "₪39")

## Tested On

- mommyshop.co.il (Elementor-based, Hebrew Shekel symbol)
- Generic sites with various currency symbols

## Browser Compatibility

- Chrome/Chromium 90+
- Manifest V3

## Installation

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-store-v1.4.3/` folder

## Changelog

### Version 1.4.3
- **Fixed:** Price extraction for Elementor-based sites
- **Fixed:** Unicode currency symbol handling
- **Added:** Generic DOM extraction fallback
- **Improved:** Extraction logic synchronization between extension and website

### Version 1.4.2
- Added Wix support
- Hidden secondhand toggle

### Version 1.4.1
- Internal testing release

### Version 1.4.0
- Initial Wix support

## Known Limitations

- JSON-LD extraction is still the primary method and preferred for accuracy
- DOM extraction is a fallback for sites without proper structured data
- Some sites with custom JavaScript rendering may require additional selectors

## Support

For issues or feature requests:
- GitHub Issues: https://github.com/ppltok/Nesty/issues
- Report extraction failures with the exact URL and product name

---

**Version:** 1.4.3
**Release Date:** January 4, 2026
**Status:** Ready for Chrome Web Store

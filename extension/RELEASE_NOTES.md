# Release Notes

## Current Update

This release improves first-run onboarding and expands product extraction coverage.

### New

- Added a post-install thank-you page for the Chrome extension.
- On fresh install, the extension now opens:
  - the local thank-you page
  - `https://nestyil.com/` in a separate background tab
- Clicking the extension from the thank-you page now opens a demo product page on Shilav and launches the add-to-list flow automatically.

### Fixed

- Fixed H&M product extraction so the extension captures the product price correctly.
- Added support for `next.co.il` product pages.

### Extraction Improvements

- H&M:
  - Added dedicated platform detection.
  - Extracts product title from H&M product-page test hooks.
  - Extracts main price from H&M price test hooks.

- Next Israel:
  - Added dedicated platform detection.
  - Extracts title from `data-testid="product-title"`.
  - Extracts price from `data-testid="product-now-price"` and related price containers.
  - Supports price ranges by using the first displayed value.

### Files Added

- `extension/chrome-store/thank-you.html`
- `extension/chrome-store/how-to.png`

### Files Updated

- `extension/chrome-store/background.js`
- `extension/chrome-store/manifest.json`
- `extension/chrome-store/content.js`
- `nesty-web/src/lib/productExtraction.ts`

### Notes

- The thank-you page is only opened on fresh install, not on update.
- The website extraction logic was updated alongside the extension logic so both paths stay aligned.

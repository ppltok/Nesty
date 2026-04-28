# Release Notes — v1.5.1

This release expands in-page button coverage and polishes button label alignment.

### New

- **Inline "Add to Nesty" button on baby-star.co.il** — appears next to the
  "Add to cart" action on every product page (anchored to `.add_to_cart_holder`).
- baby-star.co.il is upgraded from floating-only to inline + floating pill.

### Improved

- **Button label vertical alignment.** The "הוסף לנסטי" label is now visually
  centered against the Nesty logo:
  - Inline button label nudged down 4px.
  - Floating pill label nudged down 3px.

### Files Updated

- `extension/chrome-store/button-injector.js`
- `extension/chrome-store/button-styles.css`
- `extension/chrome-store/manifest.json`
- `extension/chrome-store/content.js`

### Notes

- The previous version (v1.5.0) added inline support for agalease-baby.co.il.
  v1.5.1 continues the in-page-button rollout to baby-star.co.il.

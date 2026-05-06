# Rule: SPA Product Modals Require Container Scoping — Never Scan the Whole Page

## The Bug
On AliExpress bundle deals, clicking a product opens a modal (`.pdp-mini-wrap` /
`comet-v2-modal`). The extractor didn't recognise the modal's class names, so
`productContainer` fell back to `document` — the entire page. It then found
~35 price candidates from all visible product cards and picked the lowest one
(an unrelated item), not the one the user had open.

Separately, `priceCurrency` was hardcoded to `'USD'` as default. On pages that
show ILS, any price that didn't match a `$` or `₪` regex ended up labelled USD.
And `window.runParams` prices (returned as USD) were stored as-is with no
conversion, unlike Amazon which always converts.

## What Broke
- Wrong price extracted (lowest on page, not the open product)
- Price stored as USD even though the page displayed ILS

## The Fix

### 1. Always detect the visible product container before scanning prices

```js
const modalSelectors = [
  '.pdp-mini-wrap',            // AliExpress bundle deals modal
  '.comet-v2-modal-body',      // AliExpress comet modal
  '.cosmos-drawer-body',       // AliExpress cosmos drawer
  '[class*="modal"][class*="show"]',
  '[class*="dialog"][class*="open"]',
  // ... site-specific additions
];

let productContainer = doc; // fallback only
for (const sel of modalSelectors) {
  const el = doc.querySelector(sel);
  // Only accept containers that are VISIBLE and contain price data
  if (el && el.offsetParent !== null &&
      (el.querySelector('[class*="price"]') || el.innerText?.includes('₪') || el.innerText?.includes('$'))) {
    productContainer = el;
    break;
  }
}
```

The price-presence check is critical — it prevents accepting unrelated visible
drawers (login panels, trust sidebars) that happen to match a selector.

### 2. Detect the page's display currency from the DOM, not from JS variables

```js
const pageDisplaysILS = (doc.body?.innerText?.match(/₪/g) || []).length > 3;
```

Use this to:
- Set the default `priceCurrency` correctly from the start
- Give ILS prices higher priority (10) than USD (2) when page shows ILS
- After all extraction, if USD was somehow selected but page shows ILS, convert:

```js
if (productData.price && productData.priceCurrency === 'USD' && pageDisplaysILS) {
  productData.price = (parseFloat(productData.price) * USD_TO_ILS).toFixed(2);
  productData.priceCurrency = 'ILS';
}
```

## Rule
When writing an extractor for any SPA site (AliExpress, ASOS, Zara, etc.):

1. **Never default `productContainer` to `document`** without first trying to
   find the visible product modal/drawer.
2. **Validate the container** — check it's visible AND contains price data.
3. **Never hardcode a currency default** — detect it from what the page actually
   displays to the user (symbol counting).
4. **Always add a post-extraction currency safety net** — if price is USD and
   page shows ILS, convert before returning.
5. **When adding a new site**, open its product page, open DevTools, and find
   the actual modal/drawer class names. Add them to `modalSelectors` in
   `extractFromAliExpress` (or the relevant extractor) before shipping.

## Known AliExpress container selectors (as of May 2026)
| Context | Selector |
|---|---|
| Bundle deals product modal | `.pdp-mini-wrap` |
| Comet UI modal body | `.comet-v2-modal-body` |
| Cosmos drawer (older pages) | `.cosmos-drawer-body` |

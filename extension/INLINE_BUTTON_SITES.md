# Sites With Inline "Add to Nesty" Button

The Nesty extension injects two kinds of in-page buttons on whitelisted
e-commerce sites:

- **Floating pill** — bottom-corner pill, present on every whitelisted site.
- **Inline button** — full-width purple button rendered next to the site's
  "Add to cart" action. Only enabled on the sites listed below.

Source of truth: the `WHITELIST` array in
[`chrome-store/button-injector.js`](chrome-store/button-injector.js)
(entries with `hasInline: true`).

## Sites with inline + floating

| Site | Anchor selector(s) | Notes |
|---|---|---|
| shilav.co.il | `.shopify-payment-button`, `[name="add"]` | Shopify |
| motsesim.co.il | `.product-form__buttons`, `[name="add"]` | Shopify |
| baby-shark.co.il | `.elementor-add-to-cart` | Elementor renders late — only block-level parent works, never `form.cart` (flex) |
| agalease-baby.co.il | `form.cart` | Standard WooCommerce — `form.cart` is a block-level form |
| baby-star.co.il | `.add_to_cart_holder` | Block-level flex wrapper around add-to-cart |

All other whitelisted hosts (see `WHITELIST` in `button-injector.js`) get
the floating pill only.

## How the inline button is placed

`injectInlineButton(config)` iterates `config.anchorSelectors` in order,
takes the first match, and inserts the Nesty button as a sibling
immediately after it (`anchor.insertAdjacentElement('afterend', btn)`).

Because the button is `display: flex; width: 100%`, the anchor needs to
be a **block-level** element — not an inline-level wrapper, not a flex
row. Picking the wrong anchor makes the button render as a thin sliver
or get squashed by sibling flex children.

## Adding a new inline site

1. Identify a stable, block-level anchor on the product page (e.g. the
   wrapper around the "Add to cart" button).
2. Add an entry to the **inline** section of `WHITELIST` in
   `chrome-store/button-injector.js`:
   ```js
   { hostname: 'example.co.il', hasInline: true, anchorSelectors: ['.your-anchor'] }
   ```
3. Remove the matching `hasInline: false` entry if it existed.
4. Reload the extension and verify on a real product page.

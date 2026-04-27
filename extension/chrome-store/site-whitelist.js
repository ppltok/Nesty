/**
 * Nesty Extension - Site Whitelist
 * Defines which sites get the injected "Add to Nesty" button.
 * hasInline = true means we also inject next to the "Add to Cart" button.
 * anchorSelector = the element we insert AFTER (insertAdjacentElement afterend).
 */

export const WHITELIST = [
  {
    hostname: 'shilav.co.il',
    hasInline: true,
    anchorSelector: '[name="add"]',
  },
  {
    hostname: 'motsesim.co.il',
    hasInline: true,
    // WooCommerce standard selector
    anchorSelector: '.single_add_to_cart_button',
  },
  {
    hostname: 'baby-shark.co.il',
    hasInline: true,
    // Shopify-like
    anchorSelector: '[name="add"], .product-form__submit',
  },
  { hostname: 'next.co.il',        hasInline: false },
  { hostname: 'hm.com',            hasInline: false },
  { hostname: 'mothercare.co.il',  hasInline: false },
  { hostname: 'babysafe.co.il',    hasInline: false },
  { hostname: 'aliexpress.com',    hasInline: false },
  { hostname: 'zara.com',          hasInline: false },
  { hostname: 'babyshome.co.il',   hasInline: false },
];

/**
 * Returns the whitelist config for the given hostname, or null if not whitelisted.
 * Suffix-matches: 'www.shilav.co.il' matches 'shilav.co.il'.
 */
export function getSiteConfig(hostname) {
  return WHITELIST.find(entry =>
    hostname === entry.hostname || hostname.endsWith('.' + entry.hostname)
  ) || null;
}

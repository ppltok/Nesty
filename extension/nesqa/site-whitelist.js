/**
 * Nesty Extension - Site Whitelist
 * hasInline = true → also inject next to "Add to Cart" on product pages
 * anchorSelectors = tried in order, inserted afterend of first match
 */

const WHITELIST = [
  // ── Inline + floating (priority sites) ──────────────────────────
  { hostname: 'shilav.co.il',     hasInline: true, anchorSelectors: ['[name="add"]', 'button.add-to-cart'] },
  { hostname: 'motsesim.co.il',   hasInline: true, anchorSelectors: ['[name="add"]', '.product-form__submit', '.btn--eilat'] },
  { hostname: 'baby-shark.co.il', hasInline: true, anchorSelectors: ['.single_add_to_cart_button', 'button[name="add-to-cart"]'] },

  // ── Floating only ────────────────────────────────────────────────
  { hostname: 'next.co.il',             hasInline: false, anchorSelectors: [] },
  { hostname: 'cartersoshkosh.co.il',   hasInline: false, anchorSelectors: [] },
  { hostname: 'delta.co.il',            hasInline: false, anchorSelectors: [] },
  { hostname: 'golfkids.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'fox.co.il',              hasInline: false, anchorSelectors: [] },
  { hostname: 'terminalx.com',          hasInline: false, anchorSelectors: [] },
  { hostname: 'minene.net',             hasInline: false, anchorSelectors: [] },
  { hostname: 'lorens.co.il',           hasInline: false, anchorSelectors: [] },
  { hostname: 'amigo.co.il',            hasInline: false, anchorSelectors: [] },
  { hostname: 'keds.co.il',             hasInline: false, anchorSelectors: [] },
  { hostname: 'balaolam.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'milya-store.co.il',      hasInline: false, anchorSelectors: [] },
  { hostname: 'finelab.shop',           hasInline: false, anchorSelectors: [] },
  { hostname: 'mizandray.co.uk',        hasInline: false, anchorSelectors: [] },
  { hostname: 'giggleit.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'aya-baby.com',           hasInline: false, anchorSelectors: [] },
  { hostname: 'joiebaby.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'gracobaby.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'babysleep.shop',         hasInline: false, anchorSelectors: [] },
  { hostname: 'roly.co.il',             hasInline: false, anchorSelectors: [] },
  { hostname: 'maxbaby.co.il',          hasInline: false, anchorSelectors: [] },
  { hostname: 'mamo-israel.co.il',      hasInline: false, anchorSelectors: [] },
  { hostname: 'baby-star.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'mommyshop.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: '2mybaby.co.il',          hasInline: false, anchorSelectors: [] },
  { hostname: 'babysrus.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'kochavnolad.co.il',      hasInline: false, anchorSelectors: [] },
  { hostname: 'shop.super-pharm.co.il', hasInline: false, anchorSelectors: [] },
  { hostname: 'pitsponim.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'babystav.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'babyshome.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'hugs.co.il',             hasInline: false, anchorSelectors: [] },
  { hostname: 'ravkat.com',             hasInline: false, anchorSelectors: [] },
  { hostname: 'baby-be.co.il',          hasInline: false, anchorSelectors: [] },
  { hostname: 'mynewbaby.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'moradbaby.co.il',        hasInline: false, anchorSelectors: [] },
  { hostname: 'littlepenguin.co.il',    hasInline: false, anchorSelectors: [] },
  { hostname: 'babylino.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'zuzik.co.il',            hasInline: false, anchorSelectors: [] },
  { hostname: 'super-baby.co.il',       hasInline: false, anchorSelectors: [] },
  { hostname: 'tovli-latinok.co.il',    hasInline: false, anchorSelectors: [] },
  { hostname: 'monbebe.co.il',          hasInline: false, anchorSelectors: [] },
  { hostname: 'babymichel.com',         hasInline: false, anchorSelectors: [] },
  { hostname: 'rainbowbaby.co.il',      hasInline: false, anchorSelectors: [] },
  { hostname: 'hm.com',                 hasInline: false, anchorSelectors: [] },
  { hostname: 'mothercare.co.il',       hasInline: false, anchorSelectors: [] },
  { hostname: 'babysafe.co.il',         hasInline: false, anchorSelectors: [] },
  { hostname: 'aliexpress.com',         hasInline: false, anchorSelectors: [] },
  { hostname: 'zara.com',               hasInline: false, anchorSelectors: [] },
];

function getSiteConfig(hostname) {
  return WHITELIST.find(e =>
    hostname === e.hostname || hostname.endsWith('.' + e.hostname)
  ) || null;
}

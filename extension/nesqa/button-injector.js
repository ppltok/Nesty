/**
 * Nesty Extension - In-Page Button Injector (v1.5.0)
 * Self-contained content script (no ES module imports).
 * Injects a floating pill + optional inline button on whitelisted baby-product sites.
 */
(function () {
  'use strict';

  // Don't run inside iframes
  if (window !== window.top) return;

  const LOGO_SRC = 'data:image/png;base64,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';

  // ── Whitelist ───────────────────────────────────────────────────────────────

  const WHITELIST = [
    // ── Inline + floating ────────────────────────────────────────────
    { hostname: 'shilav.co.il',     hasInline: true, anchorSelectors: ['.shopify-payment-button', '[name="add"]'] },
    { hostname: 'motsesim.co.il',   hasInline: true, anchorSelectors: ['.product-form__buttons', '[name="add"]'] },
    // baby-shark: Elementor renders late — only use block-level parent, never form.cart (flex)
    { hostname: 'baby-shark.co.il', hasInline: true, anchorSelectors: ['.elementor-add-to-cart'] },
    // agalease-baby: standard WooCommerce — form.cart is a block-level form
    { hostname: 'agalease-baby.co.il', hasInline: true, anchorSelectors: ['form.cart'] },
    { hostname: 'baby-star.co.il', hasInline: true, anchorSelectors: ['.add_to_cart_holder'] },
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
    return WHITELIST.find(e => hostname === e.hostname || hostname.endsWith('.' + e.hostname)) || null;
  }

  const hostname = location.hostname;
  const siteConfig = getSiteConfig(hostname);
  if (!siteConfig) return;

  // ── Prefs / dismiss logic ───────────────────────────────────────────────────

  const PREFS_KEY = 'nesty_button_prefs';
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  async function getButtonPrefs() {
    const result = await chrome.storage.local.get([PREFS_KEY]);
    return result[PREFS_KEY] || { globalSilenced: false, sites: {} };
  }

  async function saveButtonPrefs(prefs) {
    await chrome.storage.local.set({ [PREFS_KEY]: prefs });
  }

  async function shouldShowButton() {
    const prefs = await getButtonPrefs();
    const site = prefs.sites[hostname];
    if (!site) return true;
    if (site.dismissCount >= 2) return false;          // permanently silenced on this site
    if (site.mutedUntil && Date.now() < site.mutedUntil) return false; // 30-day mute
    return true;
  }

  async function recordDismissal() {
    const prefs = await getButtonPrefs();
    const site = prefs.sites[hostname] || { dismissCount: 0, mutedUntil: null };
    site.dismissCount += 1;
    if (site.dismissCount === 1) {
      // First dismiss: hide for 30 days
      site.mutedUntil = Date.now() + THIRTY_DAYS_MS;
    } else {
      // Second dismiss: permanently silence on this site only
      site.mutedUntil = null; // null + dismissCount>=2 = permanent
    }
    prefs.sites[hostname] = site;
    await saveButtonPrefs(prefs);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const isHebrew = hostname.endsWith('.co.il') || hostname.endsWith('.il');
  const LABEL = isHebrew ? 'הוסף לנסטי' : 'Add to Nesty';

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'nesty-toast nesty-injected-root';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ── Trigger product form ────────────────────────────────────────────────────

  async function triggerProductForm(pill) {
    if (pill) pill.classList.add('loading');
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'OPEN_PRODUCT_FORM',
        url: location.href,
      });
      if (response && response.needsLogin) {
        const returnUrl = encodeURIComponent(location.href);
        chrome.runtime.sendMessage({
          type: 'OPEN_LOGIN_TAB',
          url: `https://nestyil.com/login?return=${returnUrl}`,
        });
        if (pill) {
          const lbl = pill.querySelector('.nesty-pill-label');
          if (lbl) lbl.textContent = isHebrew ? 'השלם התחברות בלשונית החדשה' : 'Finish login in new tab';
        }
      }
    } catch (err) {
      console.error('Nesty button: failed to trigger form', err);
      showToast(isHebrew ? 'שגיאה בפתיחת Nesty' : 'Nesty error — try clicking the extension icon');
    } finally {
      if (pill) pill.classList.remove('loading');
    }
  }

  // ── Floating pill ───────────────────────────────────────────────────────────

  let floatingPill = null;

  function injectFloatingPill() {
    if (document.querySelector('.nesty-floating-pill')) return;

    const pill = document.createElement('button');
    pill.className = 'nesty-floating-pill nesty-injected-root';
    pill.setAttribute('type', 'button');
    pill.setAttribute('aria-label', isHebrew ? 'הוסף לנסטי' : 'Add to Nesty');

    const label = document.createElement('span');
    label.className = 'nesty-pill-label';
    label.textContent = LABEL;

    const logo = document.createElement('img');
    logo.className = 'nesty-pill-logo';
    logo.src = LOGO_SRC;
    logo.alt = 'Nesty';

    const spinner = document.createElement('span');
    spinner.className = 'nesty-pill-spinner';

    const dismiss = document.createElement('button');
    dismiss.className = 'nesty-pill-dismiss';
    dismiss.setAttribute('type', 'button');
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.textContent = '×';

    pill.appendChild(label);
    pill.appendChild(logo);
    pill.appendChild(spinner);
    pill.appendChild(dismiss);
    document.body.appendChild(pill);
    floatingPill = pill;

    pill.addEventListener('click', function (e) {
      if (e.target === dismiss || dismiss.contains(e.target)) return;
      triggerProductForm(pill);
    });

    dismiss.addEventListener('click', async function (e) {
      e.stopPropagation();
      await recordDismissal();
      pill.style.opacity = '0';
      pill.style.transition = 'opacity 0.3s';
      setTimeout(() => pill.remove(), 350);
      floatingPill = null;
    });
  }

  // ── Inline button ───────────────────────────────────────────────────────────

  function injectInlineButton(config) {
    if (!config.hasInline || !config.anchorSelectors.length) return;

    let anchor = null;
    for (const sel of config.anchorSelectors) {
      anchor = document.querySelector(sel);
      if (anchor) break;
    }
    if (!anchor) return;

    // Remove existing button if it's not a sibling of this anchor (wrong placement)
    var existing = document.querySelector('.nesty-inline-btn');
    if (existing) {
      if (existing.parentElement === anchor.parentElement) return; // already correct
      existing.remove(); // wrong placement — re-inject at correct anchor
    }

    const btn = document.createElement('button');
    btn.className = 'nesty-inline-btn';
    btn.setAttribute('type', 'button');
    // Apply inline styles with !important via setProperty to defeat any site CSS overrides
    var inlineStyles = {
      'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
      'gap': '8px', 'direction': 'ltr',
      'width': '100%', 'box-sizing': 'border-box',
      'padding': '12px 20px', 'margin': '10px 0 0 0',
      'min-height': '44px', 'height': 'auto',
      'background': '#674FA1', 'background-image': 'none',
      'color': '#ffffff', 'border': 'none', 'outline': 'none',
      'border-radius': '6px', 'cursor': 'pointer',
      'font-size': '15px', 'font-weight': '600',
      'font-family': "'Assistant','Heebo',sans-serif",
      'white-space': 'nowrap',
      'text-decoration': 'none', 'text-transform': 'none',
      'line-height': '1.4', 'float': 'none', 'clear': 'both',
      'opacity': '1', 'visibility': 'visible', 'position': 'static',
    };
    Object.keys(inlineStyles).forEach(function(p) {
      btn.style.setProperty(p, inlineStyles[p], 'important');
    });

    // Label span (with -3px nudge to align with logo visual center)
    var labelEl = document.createElement('span');
    labelEl.textContent = LABEL;
    ['position:relative', 'top:1px', 'color:inherit', 'font-size:inherit',
     'font-weight:inherit', 'background:none', 'border:none', 'padding:0', 'margin:0'].forEach(function(s) {
      var parts = s.split(':'); btn; labelEl.style.setProperty(parts[0], parts[1], 'important');
    });

    // Logo image
    var logoImg = document.createElement('img');
    logoImg.src = LOGO_SRC;
    logoImg.alt = 'Nesty';
    ['height:20px', 'width:36px', 'object-fit:contain', 'object-position:center',
     'filter:brightness(0) invert(1)', 'flex-shrink:0', 'display:block',
     'border:none', 'padding:0', 'margin:0', 'background:none'].forEach(function(s) {
      var parts = s.split(':'); logoImg.style.setProperty(parts[0], parts.slice(1).join(':'), 'important');
    });

    btn.appendChild(labelEl);
    btn.appendChild(logoImg);

    btn.addEventListener('mouseover', function() { btn.style.setProperty('background', '#5a4490', 'important'); });
    btn.addEventListener('mouseout',  function() { btn.style.setProperty('background', '#674FA1', 'important'); });
    btn.addEventListener('click', function () {
      triggerProductForm(floatingPill);
    });

    anchor.insertAdjacentElement('afterend', btn);
  }

  // ── SPA resilience ──────────────────────────────────────────────────────────

  let reinjectThrottle = null;

  function scheduleReinject() {
    if (reinjectThrottle) return;
    reinjectThrottle = setTimeout(function () {
      reinjectThrottle = null;
      if (siteConfig.hasInline && !document.querySelector('.nesty-inline-btn')) {
        injectInlineButton(siteConfig);
      }
    }, 500);
  }

  const observer = new MutationObserver(function () {
    if (siteConfig.hasInline && !document.querySelector('.nesty-inline-btn')) {
      scheduleReinject();
    }
  });

  ['pushState', 'replaceState'].forEach(function (method) {
    const orig = history[method];
    history[method] = function () {
      const result = orig.apply(this, arguments);
      scheduleReinject();
      return result;
    };
  });
  window.addEventListener('popstate', scheduleReinject);

  // ── Entry point ─────────────────────────────────────────────────────────────

  async function init() {
    if (!await shouldShowButton()) return;
    injectFloatingPill();
    if (siteConfig.hasInline) {
      injectInlineButton(siteConfig);
      // Retry for JS-rendered pages (Elementor, Shopify) that finish after document_idle
      setTimeout(function() { injectInlineButton(siteConfig); }, 1500);
      setTimeout(function() { injectInlineButton(siteConfig); }, 3500);
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();

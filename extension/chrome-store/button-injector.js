/**
 * Nesty Extension - In-Page Button Injector (v1.5.0)
 * Self-contained content script (no ES module imports).
 * Injects a floating pill + optional inline button on whitelisted baby-product sites.
 */
(function () {
  'use strict';

  // Don't run inside iframes
  if (window !== window.top) return;

  // ── Whitelist ───────────────────────────────────────────────────────────────

  const WHITELIST = [
    // ── Inline + floating ────────────────────────────────────────────
    { hostname: 'shilav.co.il',     hasInline: true, anchorSelectors: ['.shopify-payment-button', '[name="add"]'] },
    { hostname: 'motsesim.co.il',   hasInline: true, anchorSelectors: ['.product-form__buttons', '[name="add"]'] },
    // baby-shark: Elementor renders late — only use block-level parent, never form.cart (flex)
    { hostname: 'baby-shark.co.il', hasInline: true, anchorSelectors: ['.elementor-add-to-cart'] },
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
    logo.src = 'https://nestyil.com/Nesty_logo.png';
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
    ['position:relative', 'top:-3px', 'color:inherit', 'font-size:inherit',
     'font-weight:inherit', 'background:none', 'border:none', 'padding:0', 'margin:0'].forEach(function(s) {
      var parts = s.split(':'); btn; labelEl.style.setProperty(parts[0], parts[1], 'important');
    });

    // Logo image
    var logoImg = document.createElement('img');
    logoImg.src = 'https://nestyil.com/Nesty_logo.png';
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

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
    { hostname: 'shilav.co.il',      hasInline: true,  anchorSelectors: ['[name="add"]', 'button.add-to-cart'] },
    { hostname: 'motsesim.co.il',    hasInline: true,  anchorSelectors: ['.single_add_to_cart_button', '.woocommerce-variation-add-to-cart button', 'button.add_to_cart_button'] },
    { hostname: 'baby-shark.co.il',  hasInline: true,  anchorSelectors: ['[name="add"]', '.product-form__submit'] },
    { hostname: 'next.co.il',        hasInline: false, anchorSelectors: [] },
    { hostname: 'hm.com',            hasInline: false, anchorSelectors: [] },
    { hostname: 'mothercare.co.il',  hasInline: false, anchorSelectors: [] },
    { hostname: 'babysafe.co.il',    hasInline: false, anchorSelectors: [] },
    { hostname: 'aliexpress.com',    hasInline: false, anchorSelectors: [] },
    { hostname: 'zara.com',          hasInline: false, anchorSelectors: [] },
    { hostname: 'babyshome.co.il',   hasInline: false, anchorSelectors: [] },
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
    if (prefs.globalSilenced) return false;
    const site = prefs.sites[hostname];
    if (!site) return true;
    if (site.dismissCount >= 2) return false;
    if (site.mutedUntil && Date.now() < site.mutedUntil) return false;
    return true;
  }

  async function recordDismissal() {
    const prefs = await getButtonPrefs();
    const site = prefs.sites[hostname] || { dismissCount: 0, mutedUntil: null };
    site.dismissCount += 1;
    if (site.dismissCount === 1) {
      site.mutedUntil = Date.now() + THIRTY_DAYS_MS;
    } else {
      site.mutedUntil = null;
    }
    prefs.sites[hostname] = site;
    const dismissedCount = Object.values(prefs.sites).filter(s => s.dismissCount >= 1).length;
    if (dismissedCount >= 3) {
      prefs.globalSilenced = true;
      showToast('כפתור Nesty הושתק. ניתן להפעיל מחדש מהגדרות התוסף.');
    }
    await saveButtonPrefs(prefs);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const isHebrew = hostname.endsWith('.co.il') || hostname.endsWith('.il');
  const LABEL = isHebrew ? 'הוסף לנסטי 💗' : 'Add to Nesty 💗';

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

    const spinner = document.createElement('span');
    spinner.className = 'nesty-pill-spinner';

    const dismiss = document.createElement('button');
    dismiss.className = 'nesty-pill-dismiss';
    dismiss.setAttribute('type', 'button');
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.textContent = '×';

    pill.appendChild(label);
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
    if (document.querySelector('.nesty-inline-btn')) return;

    let anchor = null;
    for (const sel of config.anchorSelectors) {
      anchor = document.querySelector(sel);
      if (anchor) break;
    }
    if (!anchor) return;

    const btn = document.createElement('button');
    btn.className = 'nesty-inline-btn nesty-injected-root';
    btn.setAttribute('type', 'button');
    btn.textContent = LABEL;
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
    }
    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();

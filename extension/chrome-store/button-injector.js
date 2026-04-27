/**
 * Nesty Extension - In-Page Button Injector
 * Runs on whitelisted baby-product sites. Injects a floating pill
 * (and optional inline button on priority sites) that triggers the
 * existing product-extraction + form flow via background.js.
 */

import { getSiteConfig } from './site-whitelist.js';

// ── Guards ───────────────────────────────────────────────────────────────────

// Don't run inside iframes
if (window !== window.top) {
  throw new Error('Nesty: skipping iframe');
}

const hostname = location.hostname;
const siteConfig = getSiteConfig(hostname);

if (!siteConfig) {
  throw new Error('Nesty: not a whitelisted site');
}

// ── Prefs / dismiss logic ─────────────────────────────────────────────────────

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
    // Second+ dismiss: permanent silence on this site
    site.mutedUntil = null;
  }

  prefs.sites[hostname] = site;

  // Check global opt-out: 3 distinct sites dismissed at least once
  const dismissedSiteCount = Object.values(prefs.sites).filter(s => s.dismissCount >= 1).length;
  if (dismissedSiteCount >= 3) {
    prefs.globalSilenced = true;
    showToast('כפתור Nesty הושתק. ניתן להפעיל מחדש מהגדרות התוסף.');
  }

  await saveButtonPrefs(prefs);
}

export async function resetAllDismissals() {
  await saveButtonPrefs({ globalSilenced: false, sites: {} });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const isHebrew = hostname.endsWith('.co.il') || hostname.endsWith('.il');
const LABEL = isHebrew ? 'הוסף לנסטי 💗' : 'Add to Nesty 💗';

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'nesty-toast nesty-injected-root';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Trigger product form ──────────────────────────────────────────────────────

async function triggerProductForm(pill) {
  if (pill) {
    pill.classList.add('loading');
  }

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
        pill.querySelector('.nesty-pill-label').textContent =
          isHebrew ? 'השלם התחברות בלשונית החדשה' : 'Finish login in new tab';
      }
    }
  } catch (err) {
    console.error('Nesty button: failed to trigger form', err);
    showToast(isHebrew ? 'שגיאה בפתיחת Nesty' : 'Nesty error — try clicking the extension icon');
  } finally {
    if (pill) {
      pill.classList.remove('loading');
    }
  }
}

// ── Floating pill ─────────────────────────────────────────────────────────────

function buildFloatingPill() {
  const root = document.createElement('div');
  root.className = 'nesty-injected-root';

  const pill = document.createElement('button');
  pill.className = 'nesty-floating-pill';
  pill.setAttribute('aria-label', isHebrew ? 'הוסף לנסטי' : 'Add to Nesty');

  const label = document.createElement('span');
  label.className = 'nesty-pill-label';
  label.textContent = LABEL;

  const spinner = document.createElement('span');
  spinner.className = 'nesty-pill-spinner';

  const dismiss = document.createElement('button');
  dismiss.className = 'nesty-pill-dismiss';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', 'Dismiss');

  pill.appendChild(label);
  pill.appendChild(spinner);
  pill.appendChild(dismiss);
  root.appendChild(pill);

  pill.addEventListener('click', (e) => {
    if (e.target === dismiss || dismiss.contains(e.target)) return;
    triggerProductForm(pill);
  });

  dismiss.addEventListener('click', async (e) => {
    e.stopPropagation();
    await recordDismissal();
    root.style.opacity = '0';
    root.style.transition = 'opacity 0.3s';
    setTimeout(() => root.remove(), 350);
  });

  return root;
}

let floatingPillEl = null;

function injectFloatingPill() {
  if (document.querySelector('.nesty-floating-pill')) return;

  floatingPillEl = buildFloatingPill();
  document.body.appendChild(floatingPillEl);
}

// ── Inline button ─────────────────────────────────────────────────────────────

function buildInlineButton() {
  const btn = document.createElement('button');
  btn.className = 'nesty-inline-btn nesty-injected-root';
  btn.textContent = LABEL;
  btn.setAttribute('type', 'button');
  btn.addEventListener('click', () => triggerProductForm(floatingPillEl?.querySelector('.nesty-floating-pill')));
  return btn;
}

function injectInlineButton(config) {
  if (!config.anchorSelector) return;
  if (document.querySelector('.nesty-inline-btn')) return;

  // Try each selector (comma-separated)
  const selectors = config.anchorSelector.split(',').map(s => s.trim());
  let anchor = null;
  for (const sel of selectors) {
    anchor = document.querySelector(sel);
    if (anchor) break;
  }
  if (!anchor) return;

  const btn = buildInlineButton();
  anchor.insertAdjacentElement('afterend', btn);
}

// ── SPA resilience ────────────────────────────────────────────────────────────

let reinjectThrottle = null;

function scheduleReinject() {
  if (reinjectThrottle) return;
  reinjectThrottle = setTimeout(() => {
    reinjectThrottle = null;
    if (siteConfig.hasInline) {
      injectInlineButton(siteConfig);
    }
  }, 500);
}

// Watch for DOM changes that might remove our inline button
const observer = new MutationObserver(() => {
  if (siteConfig.hasInline && !document.querySelector('.nesty-inline-btn')) {
    scheduleReinject();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// SPA navigation
['pushState', 'replaceState'].forEach(method => {
  const orig = history[method];
  history[method] = function(...args) {
    const result = orig.apply(this, args);
    scheduleReinject();
    return result;
  };
});
window.addEventListener('popstate', scheduleReinject);

// ── Entry point ───────────────────────────────────────────────────────────────

async function init() {
  if (!await shouldShowButton()) return;

  injectFloatingPill();
  if (siteConfig.hasInline) {
    injectInlineButton(siteConfig);
  }
}

init();

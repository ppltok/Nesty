# CLAUDE.md — Nesty Chrome Extension

This file is the authoritative guide for working inside the
`extension/` directory. It supplements (and in case of conflict,
overrides) the root-level `CLAUDE.md`.

---

## QA Runs Are Opt-In Only

**Never run multi-site QA (`nesty-qa-orchestrator`, `nesty-site-qa`, or any
sweep across the `baby-shopping-sites.md` list) unless the user explicitly
asks for it.** A full sweep takes ~5+ minutes and burns significant tokens.

Triggers that count as explicit requests:
- "run qa", "qa audit", "qa sweep", "smoke test", "test all sites",
  "full qa", "/nesty-qa", or naming a specific site list
- Direct mention of the orchestrator by name

Triggers that do **not** authorize a QA run:
- The user asks you to fix or add support for a single site
- The user asks "is this working?" about one feature or one site
- You think QA "would be a good idea" after a change — say so and let
  the user decide

When unsure: ask. One sentence ("Want me to run the QA sweep to verify?")
is the right move. Do not invoke the QA agents speculatively.

For verifying a single change on 1–3 sites, use `nesty-qa` (the focused
investigator) or test directly in the browser — not the orchestrator.

---

## Active Extension Folder

**`extension/chrome-store/`** — this is the only folder you should read or
edit. All other version folders (`archive/`, `*.zip`) are historical.

Do not edit files in `extension/archive/` or any versioned zip.
Do not confuse the path with the old name `final-version/` (deprecated).

---

## Key Files

| File | Purpose |
|---|---|
| `chrome-store/manifest.json` | Extension config (currently v1.4.7, MV3) |
| `chrome-store/background.js` | Service worker — session fetch + token refresh |
| `chrome-store/content.js` | Injected script — product extraction, form UI, Supabase writes |
| `chrome-store/config.js` | Switch between `development` / `production` environments |
| `chrome-store/popup-styles.css` | All extension UI styles |
| `chrome-store/detector.js` | Tiny content script that sets `data-nesty-extension-installed` |

---

## Release Workflow

1. Edit files in `chrome-store/`
2. Set `ENV = 'production'` in `config.js`
3. Remove `http://localhost:5173/*` from `manifest.json` host_permissions
4. Zip `chrome-store/` contents (not the folder itself)
5. Upload to Chrome Web Store
6. Restore localhost to `manifest.json` for continued dev

See `CHROME_STORE_RELEASE_CHECKLIST.md` for the full checklist.

---

## Architecture

```
User clicks extension icon
    ↓
background.js (service worker)
    → getSupabaseSession()       — cache → tab → refresh_token
    → injects content.js into active tab

content.js (injected)
    → extractProductData()       — JSON-LD → platform-specific → fallback
    → fetchUserRegistry()        — queries owner_id OR partner_id
    → showProductForm()          — renders UI overlay
    → submits item to Supabase
```

---

## Rules

Critical lessons learned from past bugs. Read before touching auth or
Supabase query code:

- [`.claude/rules/supabase-expires-at-seconds.md`](.claude/rules/supabase-expires-at-seconds.md)
  — `expires_at` is Unix **seconds**, compare with `Date.now() / 1000`

- [`.claude/rules/chrome-extension-session-refresh.md`](.claude/rules/chrome-extension-session-refresh.md)
  — expired sessions must use `refresh_token`, not just re-read from the tab

- [`.claude/rules/supabase-registry-partner-query.md`](.claude/rules/supabase-registry-partner-query.md)
  — always query `or=(owner_id.eq.X,partner_id.eq.X)`, never owner alone

- [`.claude/rules/supabase-api-error-logging.md`](.claude/rules/supabase-api-error-logging.md)
  — log actual HTTP status + response body on every Supabase failure

- [`.claude/rules/extension-image-assets-csp.md`](.claude/rules/extension-image-assets-csp.md)
  — never load images from external URLs; bundle assets and use `chrome.runtime.getURL()`

- [`.claude/rules/spa-product-container-scoping.md`](.claude/rules/spa-product-container-scoping.md)
  — on SPA sites (AliExpress, bundle deals, modals), always scope extraction to the **visible product container**, never `document`; detect display currency from `₪`/`$` symbol count, never hardcode

---

## Extraction Gotchas

When writing or debugging an extractor for a new site:

1. **Find the product container first.** On SPA pages, the product detail lives
   in a modal/drawer — not the page root. Open DevTools, find the element
   wrapping the price and title, and add its selector to `modalSelectors` in the
   extractor. Validate it's visible AND contains price data before using it.

2. **Detect display currency from the DOM.** Count `₪` symbols in
   `body.innerText` — don't assume USD. If the page shows ILS, ILS prices get
   higher priority and any USD result must be converted before returning.

3. **Check the GOTCHAS log.** `extension/nesqa/GOTCHAS.md` has a running
   incident log. If a new site shows symptoms similar to a past bug, the fix
   pattern is already there.

---

## Environment Config

```js
// config.js
const ENV = 'development' // or 'production'
```

- `development` → `WEB_URL: 'http://localhost:5173'`
- `production`  → `WEB_URL: 'https://nestyil.com'`

The manifest's `host_permissions` must match. Localhost should be present
during development and removed before Chrome Store uploads.

---

## Debugging

| What | Where |
|---|---|
| Background script logs | `chrome://extensions/` → Service Worker "Inspect" |
| Content script logs | DevTools on the product page |
| Session state | DevTools console: `chrome.storage.local.get(['nesty_session'], console.log)` |
| Clear stale session | DevTools console: `chrome.storage.local.clear()` |

# CLAUDE.md — Nesty Chrome Extension

This file is the authoritative guide for working inside the
`extension/` directory. It supplements (and in case of conflict,
overrides) the root-level `CLAUDE.md`.

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

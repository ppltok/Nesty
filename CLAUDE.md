# CLAUDE.md

Guidance for Claude Code working in this repository. Canonical product, brand, and architecture docs live in the **Nesty Obsidian vault** at `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Nesty-Obsidian/` — when this file and the vault disagree, the vault wins.

---

## Project Overview

Nesty is an Israeli baby registry platform with two pieces:
1. **Web app** (`nesty-web/`) — React 19 + TypeScript + Vite + TailwindCSS + Supabase. Deployed to GitHub Pages, served from `https://nestyil.com`.
2. **Chrome extension** (`extension/final-version/`) — JSON-LD product scraper for adding items from any e-commerce site.

> **⚠️ This repo is NOT the internal analytics dashboard.** `dashboard.nestyil.com` is a **separate** app in a **separate** repo — `ppltok/nesty-dashboard` (its own React/Vite/Supabase project, deployed manually to its `gh-pages` branch; no Actions workflow). Both apps share the same Supabase project (`wopsrjfdaovlyibivijl`). If a task is about internal metrics, pivot/report tooling, or anything served from `dashboard.nestyil.com`, **work in `ppltok/nesty-dashboard`, not here.** Pushing it to `nestyil.com` (this repo) means it never reaches the dashboard. (Push access to `nesty-dashboard` is granted to the `ppltok` owner account; the `yanivbarlev` collaborator account needs a write invite.)

---

## Brand & Voice — the day-to-day rules

Full brand kit, design system, and ad copy in `Nesty-Obsidian/Brand/` (`Brand-Voice-Guide.md`, `Brand-Kit.md`, `Design-System.md`, `Ad-Copy-Bank.md`). **Read those before writing UI code or user-facing copy** — the rules below are just the trigger list to catch obvious misses.

**Voice in one line:** Nesty sounds like *your cool older sister who already had a baby* — warm, dugri, Israeli, never salesy. Tagline: בונים קן, לא מחסן.

**The 4-question voice test — run before shipping any copy:**
1. Would a cool older sister say this? If not — rewrite.
2. Does it sound Israeli or translated from English? If translated — rewrite.
3. Is there real emotion behind it, or just functional? If functional — add warmth.
4. Would I be annoyed seeing this? If yes — dial it back.

**Forbidden words ❌:** רכישה / קנייה / הזמנה (we're not a store) · מבצע / הנחה (not our business) · חובה / דחוף (no pressure) · "האפליקציה שלנו" (just say "Nesty") · aggressive CTAs ("קני עכשיו!", "מוגבל בזמן!").

**Hebrew defaults:** feminine singular (`את`); short sentences (≤15 words); everyday Hebrew, not literary; "Nesty" stays English even in Hebrew text.

**Visual defaults:** brand tokens already wired in `nesty-web/tailwind.config.js` — use Tailwind classes, never hardcode hex. Primary `#86608e` (vintage lavender). Font is `Assistant` / `Heebo` (set as `font-sans`). Border radius `rounded-xl` minimum. RTL via `dir="rtl"` on root + logical properties (`ms-`, `me-`); directional icons must flip. Max 1–2 emoji per screen from the approved set (🪺 🎁 😉 ✨ 💜 🤍).

---

## Development Commands

### Web app

```bash
cd nesty-web
npm install
npm run dev     # http://localhost:5173 (extension expects this URL in dev)
npm run build   # outputs to dist/
npm run lint
npm run preview
```

### Chrome extension

Production code: `extension/final-version/`. Load via `chrome://extensions/` → Developer mode → Load unpacked. Chrome Web Store package: `extension/nesty-extension-v1.0.0.zip` (see `extension/chrome-store/STORE_LISTING.md` for submission).

### Deployment (web)

Automatic on push to `main` — `.github/workflows/deploy.yml` builds `nesty-web/` and publishes to GitHub Pages. Custom domain: `nestyil.com`. Vite config sets the production base path automatically. **Don't manually copy `dist/` anywhere — just push.**

### Deployment (Supabase edge functions)

See `Nesty-Obsidian/Tech-Notes/Supabase-Edge-Functions.md` for the deploy gotchas — short version: **start Docker first** and **always pass `--workdir "$(pwd)"`** from inside `nesty-web/`, otherwise the CLI silently no-ops.

---

## Architecture Summary

### Web app

**Tech:** React 19 + TS + Vite + Tailwind + Supabase Auth/Postgres. RLS enabled on all tables.

**Auth flow:** user signs in via Supabase → session in localStorage (`sb-{project-ref}-auth-token`) → extension reads it from the localhost:5173 / nestyil.com tab.

**Database hierarchy:** `auth.users` → `profiles` (1:1, auto-created) → `registries` (1:N) → `items` (1:N). Full schema in `NESTY_DATABASE_SCHEMA.md`.

### Chrome extension

**Manifest V3, JSON-LD-first.** Background script handles session fetching (only `chrome.tabs` context can read the Nesty tab's localStorage). Content script extracts product data from JSON-LD structured data, falling back to platform-specific extractors (AliExpress, Shopify) and finally to Open Graph meta tags.

**Two implementations exist** — `extension/final-version/` is the source of truth (JSON-LD). `extension/nesty-local/` is **deprecated DOM scraping**, do not touch.

**Full extension architecture:** `Nesty-Obsidian/Tech-Notes/Chrome-Extension-Architecture.md`. Permissions and store-submission detail: `extension/chrome-store/STORE_LISTING.md`.

### Mock API

`nesty-web/vite.config.ts` exposes `/api/scrape`, `/api/products` for local dev only. Production uses Supabase edge functions.

---

## Critical Files

**Configuration:**
- `nesty-web/vite.config.ts` — Vite config, mock API plugin, base path
- `extension/final-version/config.js` — `ENV = 'production'` vs `'development'` toggle
- `extension/final-version/manifest.json` — extension permissions, host_permissions

**Implementation:**
- `nesty-web/src/contexts/AuthContext.tsx` — auth state
- `nesty-web/src/lib/supabase.ts` — Supabase client
- `nesty-web/src/lib/productExtraction.ts` — **shared extraction logic, source of truth**
- `extension/final-version/content.js` — extension main logic (mirrors productExtraction.ts)
- `extension/final-version/background.js` — service worker, session fetching

**Reference docs (in repo):**
- `NESTY_DATABASE_SCHEMA.md` — full schema, RLS policies
- `project_status.md` — recent decisions, in-flight work
- `extension/final-version/DEVELOPMENT_LOG.md` — extension history

---

## Keeping Extraction Logic in Sync

Website's "paste URL" feature and the extension share extraction logic. **`nesty-web/src/lib/productExtraction.ts` is the source of truth** — add/update it first, then port to `extension/final-version/content.js` keeping function names identical. The extension may have *extra* methods (live JS variables like `window.runParams` for AliExpress) but the DOM-based extraction must match.

When adding a new platform: update `detectPlatform()` and add `extractFromX()` in `productExtraction.ts`, port to `content.js`, test both paths (paste-URL modal + extension click), then update `Tech-Notes/Product-Extraction-System.md` if the methodology changes.

Why DOM extraction must match: the website's edge function returns **static HTML** with no JavaScript execution, so anything relying on `window.*` variables won't work there.

Full methodology and platform notes: `Nesty-Obsidian/Tech-Notes/Product-Extraction-System.md` and `JSON-LD-Extraction.md`.

---

## Common Gotchas

### 1. Extension shows "login required" but user is logged in

- Confirm a Nesty tab is open at the URL matching extension's `ENV` (production: `https://nestyil.com`; dev: `http://localhost:5173`)
- Check `extension/final-version/config.js` — `ENV` must match
- Clear cache: `chrome.storage.local.clear()` in the extension's service worker console

### 2. Wrong price on Shopify products

Shopify uses the `ProductGroup` schema for variant products. Price lives at `data.hasVariant[0].offers.price`, **not** `data.offers.price`. `extractFromProductGroup()` handles this — make sure new platform extractors check both schema types.

### 3. Extension "Identifier already declared" error

Re-injection collision. Content script guards with `if (window.nestyExtensionLoaded) return; window.nestyExtensionLoaded = true;` — preserve this guard in any rewrite.

### 4. Assets fail to load on GitHub Pages

Vite handles the `/Nesty/` base path automatically in production mode. If routes break, check React Router uses the basename from env, not a hardcoded `/`.

### 5. Edge-function deploy "succeeds" but production keeps old code

Two silent failure modes — Docker not running, or CLI walking up to a stray `supabase/config.toml` outside the repo. Full fix in `Nesty-Obsidian/Tech-Notes/Supabase-Edge-Functions.md`. Quickest verification: `supabase functions download` + grep for a unique string from your edit.

---

## Database — quick orientation

```
profiles → registries → items
                     → registry_invitations
```

Quirks worth knowing without reading the full schema:
- `registries.partner_id` — co-parent UUID, `ON DELETE SET NULL`. Equal access **except** invite/delete (owner-only).
- `items.quantity_received` — required, NOT NULL, defaults to 0.
- `items.enable_chip_in` — group gifting toggle.
- `items.cheaper_alternative_url`, `items.price_alert_sent` — used by the price-monitoring flow.

RLS is enabled everywhere; full policy list in `NESTY_DATABASE_SCHEMA.md`.

---

## Testing the Extension

**Prereqs:** web app reachable at the configured URL, user logged in there, user has a registry.

**Flow:** load extension → open any e-commerce product page (e.g. `shilav.co.il`) → click extension icon → it should pre-fill product name/price/image from JSON-LD and submit to Supabase on "הוסף לרשימה".

**Debugging:**
- Background service worker console: `chrome://extensions/` → Service Worker
- Content script console: regular DevTools on the product page
- JSON-LD present? Search page source for `application/ld+json`
- Session cache: `chrome.storage.local.get(['nesty_session'])`

---

## Chrome Web Store releases

When uploading a new version:
1. Set `ENV = 'production'` in `config.js`
2. Verify `WEB_URL` is `https://nestyil.com`
3. **Remove `http://localhost:5173/*` from `manifest.json` host_permissions** before zipping (prevents permission warnings on review)
4. Bump version, zip, upload
5. **Restore localhost to manifest.json** for continued local development

Full submission guide: `extension/chrome-store/STORE_LISTING.md`.

---

## Important Links

- Production site: https://nestyil.com
- Repo: https://github.com/ppltok/Nesty
- Supabase project: `wopsrjfdaovlyibivijl.supabase.co`
- Chrome Web Store: https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll

---

## User Activation Analysis

A reusable analysis dashboard lives in `analysis/`. Run `node analysis/run.js` to fetch live Supabase data and regenerate `analysis/dashboard.html`. Findings and chart inventory documented in `project_status.md`.

---

## Branch Strategy

`main` is the deploy branch — push to main triggers the GitHub Pages deploy. Use feature branches and PRs for non-trivial work; verify which branch is current before assuming.

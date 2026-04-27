# Task List: In-Page "Add to Nesty" Button

Companion to `in-page-add-to-nesty-button-PRD.md`. Work through these in order. Each task is small enough to verify independently.

**Working directory:** `C:\Users\User\Desktop\Projects\Nesty\Nesty\extension\chrome-store\`

---

## Phase 0 — Setup & scaffolding

- [ ] **0.1** Read the PRD in full (`Features/in-page-add-to-nesty-button-PRD.md`)
- [ ] **0.2** Read existing files to understand current architecture: `manifest.json`, `background.js`, `content.js`, `detector.js`, `config.js`
- [ ] **0.3** Confirm current extension version in `manifest.json`; this feature ships as **v1.5.0**
- [ ] **0.4** Create a feature branch: `feat/in-page-add-button` (from current `adding-button-in-site` branch — verify with user first)

---

## Phase 1 — Site whitelist & manifest

- [ ] **1.1** Create `chrome-store/site-whitelist.js` exporting:
  - `WHITELIST` array of `{ hostname, hasInline, selectors? }` entries
  - `INLINE_SITES` constant: `['shilav.co.il', 'motsesim.co.il', 'baby-shark.co.il']`
  - Helper `getSiteConfig(hostname)` that does suffix-matching (so `www.shilav.co.il` matches `shilav.co.il`)
- [ ] **1.2** Update `manifest.json`:
  - Bump `version` to `1.5.0`
  - Add 9 new entries to `host_permissions` (see PRD §5.4)
  - Add new `content_scripts` entry registering `site-whitelist.js` + `button-injector.js` + `button-styles.css` with `matches` covering all 9 whitelisted sites, `run_at: document_idle`
- [ ] **1.3** Verify the manifest still loads cleanly: `chrome://extensions/` → Reload → check for errors

---

## Phase 2 — Dismiss/mute preference layer

- [ ] **2.1** In `button-injector.js`, implement `getButtonPrefs()` reading `chrome.storage.local.nesty_button_prefs` with the shape from PRD §4.4
- [ ] **2.2** Implement `shouldShowButton(hostname)`:
  - Returns `false` if `globalSilenced === true`
  - Returns `false` if site's `dismissCount >= 2`
  - Returns `false` if `mutedUntil` is in the future
  - Returns `true` otherwise
- [ ] **2.3** Implement `recordDismissal(hostname)`:
  - Increment `dismissCount` for that site
  - First dismiss: set `mutedUntil = Date.now() + 30 * 24 * 60 * 60 * 1000`
  - Second+ dismiss: clear `mutedUntil`, leave `dismissCount` ≥ 2 (permanent silence)
  - After write: count distinct sites with `dismissCount >= 1`; if ≥ 3, set `globalSilenced = true` and surface a one-time toast
- [ ] **2.4** Implement `resetAllDismissals()` for the popup toggle
- [ ] **2.5** Manual test by editing `chrome.storage.local` directly in DevTools and reloading a whitelisted site — verify button shows/hides correctly in each state

---

## Phase 3 — Floating pill

- [ ] **3.1** Create `chrome-store/button-styles.css` with:
  - `.nesty-injected-root` parent class (all selectors scoped under it)
  - `.nesty-floating-pill` styles per PRD §4.1
  - `.nesty-pill-dismiss` styles for the `×` icon
  - `.nesty-inline-btn` styles per PRD §4.2 (multiple variants for shilav/motsesim/baby-shark — start with one base look, refine per site)
- [ ] **3.2** In `button-injector.js`, implement `injectFloatingPill()`:
  - Skip if `window !== window.top` (iframe guard)
  - Skip if `!shouldShowButton(location.hostname)`
  - Skip if a `.nesty-floating-pill` already exists (double-injection guard)
  - Detect Hebrew vs English label based on hostname (Israeli .co.il sites → Hebrew)
  - Append to `document.body`
  - Wire click → call `triggerProductForm()`
  - Wire `×` click → call `recordDismissal()`, fade out, remove
- [ ] **3.3** Implement `triggerProductForm()`:
  - Send `chrome.runtime.sendMessage({ type: 'OPEN_PRODUCT_FORM', url: location.href })`
- [ ] **3.4** In `background.js`, add a listener for `OPEN_PRODUCT_FORM` that runs the same flow currently triggered by the toolbar icon click (inject `content.js` into the active tab)
- [ ] **3.5** Test floating pill on all 9 sites manually: appears, animates in, click triggers extraction form, dismiss works

---

## Phase 4 — Inline button (priority sites)

- [ ] **4.1** In `site-whitelist.js`, fill `selectors` for the 3 priority sites by inspecting live product pages. Each entry needs:
  - `anchorSelector` — the element NEXT TO which we insert the button
  - `insertPosition` — `'afterend'` typically
- [ ] **4.2** In `button-injector.js`, implement `injectInlineButton(siteConfig)`:
  - Find anchor via `document.querySelector(siteConfig.anchorSelector)`
  - If not found, return silently (floating pill is the fallback)
  - Build inline button DOM, attach click → `triggerProductForm()`
  - Insert via `anchor.insertAdjacentElement(siteConfig.insertPosition, btn)`
- [ ] **4.3** Wire main entry point in `button-injector.js`:
  - On `document_idle`, read prefs, then if `shouldShowButton`, call BOTH `injectFloatingPill()` AND `injectInlineButton()` on inline-enabled sites
- [ ] **4.4** Add SPA-resilience: observe `history.pushState` / `popstate` / `MutationObserver` on body to re-run injection if the inline anchor disappears (especially important for Shopify-style sites). Throttle to once per 500ms.
- [ ] **4.5** Test inline button on real product pages of shilav, motsesim, baby-shark. Verify it sits next to "Add to Cart" without breaking layout.

---

## Phase 5 — Logged-out flow

- [ ] **5.1** In `background.js` `OPEN_PRODUCT_FORM` handler: before injecting `content.js`, call `getSupabaseSession()`. If null/expired and refresh fails → respond `{ needsLogin: true }`.
- [ ] **5.2** In `button-injector.js`, after sending the message, handle `needsLogin: true` by opening `https://nestyil.com/login?return=<encodeURIComponent(location.href)>` in a new tab via another runtime message (`OPEN_LOGIN_TAB`)
- [ ] **5.3** While the new tab is open, update floating pill label to "השלם התחברות בלשונית החדשה" / "Finish login in new tab"
- [ ] **5.4** Verify the existing nestyil.com login page respects the `?return=` query param. If not, add to backlog (out of scope — note in OPEN_QUESTIONS).

---

## Phase 6 — Popup toggle

- [ ] **6.1** Locate or create the extension popup (check existing `popup.html`/`popup.js`)
- [ ] **6.2** Add a section "Show Add-to-Nesty button on shopping sites" with a toggle reflecting `!globalSilenced` and a "Reset dismissals" link
- [ ] **6.3** Wire toggle to `resetAllDismissals()` and re-flag `globalSilenced=false`
- [ ] **6.4** Verify: dismiss on 3 sites → use popup → reload a whitelisted site → button is back

---

## Phase 7 — Polish & QA

- [ ] **7.1** Run through the full PRD §8 acceptance checklist
- [ ] **7.2** DevTools Performance: confirm no Cumulative Layout Shift caused by injection
- [ ] **7.3** Check button-injector.js bundle size; minify if > 8KB
- [ ] **7.4** Test in Hebrew (RTL) sites and English sites
- [ ] **7.5** Test SPA navigation on AliExpress (modal product views)
- [ ] **7.6** Run extension on a non-whitelisted site (e.g. nytimes.com) → verify nothing injects
- [ ] **7.7** Check `chrome://extensions/` → Service Worker logs for errors during a full test session

---

## Phase 8 — Release

- [ ] **8.1** Update `RELEASE_NOTES.md` with v1.5.0 entry describing the in-page button
- [ ] **8.2** Set `ENV = 'production'` in `config.js`
- [ ] **8.3** Remove `http://localhost:5173/*` from `manifest.json` host_permissions (per release checklist)
- [ ] **8.4** Zip `chrome-store/` contents → `nesty-extension-v1.5.0.zip`
- [ ] **8.5** Upload to Chrome Web Store; in the review notes, justify each new host permission with the user benefit ("Add to Nesty button appears on baby-product retailer X")
- [ ] **8.6** Restore localhost to manifest for continued dev
- [ ] **8.7** Commit & push branch, open PR with PRD link in description

---

## Decisions locked (from product conversation 2026-04-27)

- Dismiss scope: **per-site, with global opt-out after 3 distinct-site dismissals**
- Priority sites: **inline + floating both** shown
- "Already saved" detection: **out of scope for v1**
- Logged-out: **show button, click opens login in new tab**

## Things to confirm before coding

- Whether to branch off `adding-button-in-site` (current) or `main`
- Whether the existing nestyil.com login supports `?return=` redirect
- Final brand colors / heart icon asset (check existing `popup-styles.css` for tokens)

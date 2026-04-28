# PRD: In-Page "Add to Nesty" Button

**Status:** Draft v1
**Owner:** Yaniv
**Created:** 2026-04-27
**Target version:** Extension v1.5.0

---

## 1. Problem & Goal

Today, a user with the Nesty extension installed must remember Nesty exists *while* they are shopping on a baby-products site, then click the toolbar icon to extract the product. This requires active recall and adds friction.

**Goal:** Reverse the discovery direction. Inject a visible "Add to Nesty" button directly into the page so Nesty reminds the user, not the other way around. Mirrors proven patterns from Honey, Rakuten, Amazon Wishlist.

**Success metric:** Increase in `items added per active user per week` after rollout, measured against the 2-week baseline before launch.

---

## 2. Scope

### In scope (v1)
- A **floating pill button** ("Add to Nesty" / "הוסף לנסטי") on a curated whitelist of baby-product sites
- An **inline button** placed near the site's native "Add to Cart" on three priority sites:
  - `shilav.co.il`
  - `motsesim.co.il`
  - `baby-shark.co.il`
- On those 3 priority sites: **both inline AND floating** are shown (per user decision — maximize visibility for v1; we will measure and revisit)
- **Dismiss/mute behavior** with progressive opt-out (see §5)
- Clicking the button reuses the existing `content.js` extraction + form flow

### Out of scope (v1)
- "Already saved" / duplicate detection — deferred to a later phase
- Inline placement on sites beyond the 3 priority sites
- A/B testing framework
- Analytics dashboards (we'll log events but not build UI)

---

## 3. Target Sites (Whitelist v1)

The button is **only injected** on these hostnames. We do NOT use `<all_urls>`. Each site is added explicitly to `host_permissions` in `manifest.json`.

**Inline + floating (priority sites):**
1. `shilav.co.il`
2. `motsesim.co.il`
3. `baby-shark.co.il`

**Floating only:**
4. `next.co.il`
5. `www2.hm.com` (H&M baby)
6. `mothercare.co.il`
7. `babysafe.co.il`
8. `aliexpress.com` (limit to baby/kids categories via URL pattern if feasible; otherwise floating-only on all aliexpress)
9. `zara.com` (kids/baby paths)

The whitelist lives in a single config file (`site-whitelist.js`) so adding a site = adding one entry + one host permission.

---

## 4. UX Specification

### 4.1 Floating pill
- **Position:** fixed, bottom-right, 20px margin from edges, `z-index: 2147483600` (just below max to coexist with chat widgets)
- **Size:** ~180px wide, 44px tall, pill-shaped (border-radius 22px)
- **Color:** Nesty brand pink/magenta with white text and small heart icon
- **Label states:**
  - Default: `הוסף לנסטי 💗` (Hebrew on Hebrew sites) / `Add to Nesty 💗` (otherwise)
  - Loading (after click): spinner
  - Error: brief toast, button returns to default
- **Close affordance:** small `×` icon at top-right of the pill (16px tap target — but visible)
- **Animation:** fades in 800ms after page load (avoid competing with the site's own load animations)
- **Mobile/narrow viewports:** if `window.innerWidth < 480`, shrink to icon-only

### 4.2 Inline button (priority sites)
- **Placement:** sibling node directly after the site's "Add to Cart" button
- **Style:** matches the site's button shape/size as closely as feasible (rounded rect, similar height) but uses Nesty brand colors so it's recognizable, not deceptive
- **Selectors (initial, will be tuned during implementation):**
  - shilav.co.il: `.product-form__buttons` or `[name="add"]` parent
  - motsesim.co.il: `.product-add-to-cart` / `.single_add_to_cart_button` parent (WooCommerce)
  - baby-shark.co.il: `.product-form__buttons` (Shopify-like)
- **Resilience:** if the selector misses, the inline button silently does NOT inject — the floating pill still appears, so the user is never left without an entry point

### 4.3 Click behavior (both buttons)
1. Logged in → run existing extraction + open existing product form overlay
2. **Logged out** → open `https://nestyil.com/login?return=<product-url>` in a new tab; the floating button updates label to "השלם התחברות בלשונית החדשה" / "Finish login in new tab" until the user returns

### 4.4 Dismiss / mute logic
**Per-site, with global escape hatch after 3 separate-site dismissals.**

- Click `×` once on `siteA.com` → button hidden on `siteA.com` for **30 days** (stored in `chrome.storage.local`)
- After 30 days: button reappears
- If user clicks `×` **again** on the same site → permanent silence on that site
- If user has dismissed (any depth) on **3 different sites**, treat as global opt-out: stop showing the button anywhere. Show a one-time toast: "Nesty button silenced. You can re-enable from the extension popup."
- Re-enable path: extension popup gets a small "Show Add-to-Nesty button on shopping sites" toggle that resets all dismissals.

**Storage shape (`chrome.storage.local`):**
```json
{
  "nesty_button_prefs": {
    "globalSilenced": false,
    "sites": {
      "shilav.co.il":   { "dismissCount": 1, "mutedUntil": 1735689600000 },
      "motsesim.co.il": { "dismissCount": 2, "mutedUntil": null }
    }
  }
}
```
- `dismissCount=1, mutedUntil=<future>` → temporarily muted
- `dismissCount>=2` → permanently muted on this site
- Counting distinct sites with `dismissCount>=1` ≥ 3 triggers `globalSilenced=true`

### 4.5 Performance & non-intrusion
- Button injection runs in a lightweight script that does **NOT** parse JSON-LD on page load
- Heavy extraction is deferred to button click
- Total injected JS for the button injector: target < 8KB minified
- No layout shift on the host page (use `position: fixed` + `position: absolute` placement that doesn't enter normal flow for the floating pill; for inline, append AFTER existing button so we never push existing layout)

---

## 5. Architecture

### 5.1 New files (under `extension/chrome-store/`)
| File | Purpose |
|---|---|
| `button-injector.js` | New content script. Runs on whitelisted sites. Reads prefs, decides inline vs floating, injects DOM, wires click → triggers existing flow |
| `site-whitelist.js` | Exports the whitelist + per-site selector config |
| `button-styles.css` | Styles for the floating pill and inline button |

### 5.2 Modified files
| File | Change |
|---|---|
| `manifest.json` | Add the 9 host_permissions; register `button-injector.js` as a content_script with matches limited to whitelist; bump version to 1.5.0 |
| `background.js` | Add a message handler `OPEN_PRODUCT_FORM` that the button injector calls; this triggers the same flow as clicking the toolbar icon |
| `content.js` | Expose a function that `button-injector.js` can trigger directly when both run on the same page (alternative: button-injector sends a runtime message → background → re-injects content.js) |
| `popup.html` / `popup.js` (if exists) | Add toggle to reset dismissals |

### 5.3 Click flow
```
User clicks injected button
    ↓
button-injector.js → chrome.runtime.sendMessage({type: 'OPEN_PRODUCT_FORM'})
    ↓
background.js → injects content.js into active tab (existing logic)
    ↓
content.js → existing extraction + form flow runs
```
**Why route through background:** keeps button-injector tiny and avoids loading the heavy `content.js` on every page view; only loads when the user actually clicks.

### 5.4 Manifest content_scripts entry (sketch)
```json
{
  "matches": [
    "https://*.shilav.co.il/*",
    "https://*.motsesim.co.il/*",
    "https://*.baby-shark.co.il/*"
  ],
  "js": ["site-whitelist.js", "button-injector.js"],
  "css": ["button-styles.css"],
  "run_at": "document_idle"
}
```

---

## 6. Edge Cases

- **Page is not a product page** (e.g., homepage, category): button still appears (floating). On click, extraction may fail — existing error toast handles this.
- **Site uses heavy SPA navigation** (e.g., AliExpress modal product views): listen for `popstate` / `history.pushState` to re-evaluate inline placement. Floating pill stays put across SPA navigations.
- **Site has its own floating chat widget bottom-right:** brand color + small offset (we accept slight overlap; users tolerate this on shopping sites)
- **Iframes:** do not inject inside iframes (`window !== window.top` guard)
- **RTL sites:** Hebrew sites are RTL — pill should remain bottom-right visually (which is left in RTL terms — handle with `direction: ltr` on the pill itself)
- **User has just dismissed on this site, then reloads:** must NOT re-show — `chrome.storage.local` read happens before injection
- **`detector.js` already running:** keep it; `button-injector.js` is separate and additive

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Chrome Web Store flags broad host permissions | Use specific hostnames only — already planned |
| Inline selector breaks when a site redesigns | Floating pill is always present as fallback; inline failures are silent |
| Users find the button intrusive → 1-star reviews | Progressive dismiss with per-site mute + global opt-out after 3 dismissals + popup toggle |
| Conflict with site's own scripts (e.g. our z-index getting overridden) | Use very high z-index, scope all CSS via a unique parent class `.nesty-injected-root` |
| Performance complaint on shopping sites | Defer extraction to click; injector script kept under 8KB |

---

## 8. Acceptance Criteria

- [ ] Floating pill appears on all 9 whitelisted sites within 1s of page load
- [ ] Inline button appears next to "Add to Cart" on shilav, motsesim, baby-shark on actual product pages
- [ ] Clicking either button triggers the existing extraction + form flow successfully on all 3 priority sites
- [ ] When logged out, click opens nestyil.com login in a new tab
- [ ] First `×` click hides the button on that site for exactly 30 days (verifiable by manipulating `chrome.storage.local`)
- [ ] Second `×` click on same site permanently silences that site
- [ ] After 3 distinct sites have ≥1 dismissal, button no longer appears anywhere
- [ ] Popup toggle resets dismissals and button reappears on next page load
- [ ] No layout shift on whitelisted sites (verified via DevTools Performance > Layout Shift)
- [ ] Extension passes Chrome Web Store review (no `<all_urls>`, all permissions justified)

---

## 9. Open Questions / Future
- Should the popup show a per-site list of muted sites with individual unmute? (defer)
- Should we show a one-time onboarding tooltip the first time the pill appears? (defer to v1.5.1)
- Add "already saved" check (deferred from v1)
- Inline placement on more sites once selector-resilience patterns are proven

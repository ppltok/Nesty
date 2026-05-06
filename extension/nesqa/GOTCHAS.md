# Nesqa Extension — Gotchas & Incident Log

Running log of real bugs found in production or testing. Check here first when
diagnosing a new extraction failure — the pattern may already be documented.

---

## 2026-05-06 — AliExpress bundle deals: wrong price + USD label instead of ILS

**Symptoms:** Extension showed a random low price in USD on AliExpress bundle
deal pages. The product the user had open showed ₪7.60, but Nesty received a
different amount labeled USD.

**Root cause (3 compounding bugs):**

1. **Wrong container.** The product detail opens in a `.pdp-mini-wrap` /
   `comet-v2-modal` — class names the modal selector list didn't know about.
   `productContainer` fell back to `document` (entire page), scanning all
   product cards and picking the lowest price found (~₪0.79 from an unrelated
   item).

2. **Hardcoded USD default.** `priceCurrency` was initialised as `'USD'`
   regardless of what the page displayed. Any price extracted without an
   explicit `$` or `₪` symbol inherited this wrong label.

3. **USD scored higher than ILS.** Priority 10 for USD, priority 5 for ILS.
   On pages where both symbols appear, USD always won — even when the user
   clearly sees ILS prices.

**Fix:** See `.claude/rules/spa-product-container-scoping.md` for the full
pattern. Short version: detect the visible modal container first (with a
price-presence validation), detect display currency from `₪` symbol count,
and flip priorities so ILS wins when the page shows ILS.

**Files changed:** `content.js` — `extractFromAliExpress()`, `modalSelectors`,
`pageDisplaysILS` detection, price priority logic, post-extraction conversion.

---

## 2025-12 — Images missing from thank-you page after install

**Symptoms:** `thank-you.html` showed broken images after store install. Layout
appeared distorted because the grid was designed around images being present.

**Root cause:** The zip was built with an explicit inclusion list that only
named JS/CSS files. The tutorial images (`how-to.png`, `tutorial.png`, etc.)
existed in the folder but were never added to the list, so they were silently
excluded from the package.

**Fix:** Switched to manifest-driven packaging with an HTML asset scan step
that verifies every `src=`/`href=` reference in HTML files exists in the zip
before it's finalised. See the `cws-release` skill for the verification steps.

**Files changed:** `manifest.json` (v1.0.4 bump), `thank-you.html` (image
renames), `step-popup.png` / `step-form.png` added to repo.

---

## 2025-12 — Wix sites (baby-lee.co.il): images not extracted

**Symptoms:** Extension found no image on Wix product pages despite the
JSON-LD containing three image URLs.

**Root cause:** Wix uses `ImageObject` with a `contentUrl` field (correct
schema.org spec). `normalizeImageUrls()` only checked `item.url` and
`item['@id']` — it never looked at `item.contentUrl`, so all images were
silently dropped.

Secondary: Wix JSON-LD encodes product names with HTML entities (`&quot;`).
No decoding was applied, so names appeared with literal `&quot;` characters.

**Fix:** Added `contentUrl` branch to `normalizeImageUrls()`. Added
`decodeHtmlEntities()` helper applied to product name in `extractFromProduct()`.

**Files changed:** `content.js` — `normalizeImageUrls()`, new
`decodeHtmlEntities()`, `extractFromProduct()`.

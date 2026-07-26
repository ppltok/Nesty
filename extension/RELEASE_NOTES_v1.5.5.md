# Release Notes - Version 1.5.5

**Release Date:** July 26, 2026
**Package:** `nesty-extension-v1.5.5.zip`
**Location:** `extension/nesty-extension-v1.5.5.zip`

---

## 🛠 What's New in v1.5.5

### 0. **Add-item form redesigned to match the Nesty web app**
The in-page form now uses the same design system, fields, and structure as
the site's add-item modal: purple palette, pill tabs, rounded buttons, and
the full field set — including new **color**, **store**, and **editable
product link** fields, required name/category validation, and the full
category list (incl. הכנה ללידה ולאמא, תוספות לאחים/תאומים). Birth-prep
items auto-mark as private, and the image report is a compact 🐞 button.
Items added from the extension are now tagged `added_via='extension'` for
analytics.

### 1. **"Login required" while actually logged in (critical)**
The extension used to read the login session from only the *first* nestyil.com
tab Chrome returned. Users with several Nesty tabs open — especially old tabs
Chrome's Memory Saver had put to sleep — got a "login required" prompt or a
stuck spinner even though they were signed in.

- Now scans **all** open Nesty tabs and uses the first one that is live and
  signed in
- Expired tokens are silently refreshed via the `refresh_token` instead of
  failing
- Cached session identity is reconciled against the site on every use, so
  switching accounts on nestyil.com can no longer add items to the previous
  account's registry

### 2. **Product images stored as protocol-relative URLs**
Items added from Shopify stores saved image links like
`//cdn.shopify.com/...` (no `https:`). These are now always stored as full
absolute URLs.

### 3. **Price fallback from Open Graph meta tags**
When a store's structured data (JSON-LD) is missing, the extension now also
reads the price from `og:price:amount` / `product:price:amount` meta tags —
kept in sync with the website's paste-URL extraction.

### 4. **Package hygiene**
v1.5.4 was accidentally packaged from a stale development folder (its
detector reported version 1.3.0). v1.5.5 is built from the maintained
`current-build/` source with a verified manifest (no localhost permissions,
production config) and no stray files.

---

## Chrome Web Store "What's new" text (paste this)

> The add-item form got a full redesign to match the Nesty web app - same
> look, plus new color, store, and product-link fields. Also fixed a bug
> where the extension asked you to log in even though you were already
> signed in to nestyil.com (happened when several Nesty tabs were open),
> product images from Shopify stores are now always saved with full URLs,
> and price detection got an extra fallback for stores with broken
> structured data.

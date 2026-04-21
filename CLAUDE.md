# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Nesty is a baby registry platform with two main components:
1. **Web Application** - React-based registry management (deployed at https://ppltok.github.io/Nesty)
2. **Chrome Extension** - Product scraper using JSON-LD extraction to add items from any e-commerce site

---

## Brand, Voice & Design System

**Read this before writing any UI code or user-facing copy.** Canonical brand docs live in Obsidian at `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Nesty-Obsidian/Brand/` (Brand-Kit, Brand-Voice-Guide, Design-System, Ad-Copy-Bank). This section mirrors them for in-repo reference — **if they drift, the Obsidian files win**.

### Brand in One Line

Nesty sounds and feels like **your cool older sister who already had a baby** — warm, funny, Israeli to the core, knows what actually matters, and would never try to sell you something you don't need.

- **Tagline:** בונים קן, לא מחסן (Building a nest, not a warehouse)
- **Promise:** The trusted, smart companion for Israeli expecting parents — freedom of choice, honest guidance, zero pressure.

### Voice & Tone

**Four voice attributes — every string should pass all four:**

1. **Warm (חמה)** — Like a WhatsApp message from a friend, not corporate copy.
2. **Relatable (קרובה)** — Reference real Israeli life: WhatsApp chaos, דודה בלה, duplicate onesies.
3. **Empowering (מעצימה)** — "You choose, we organize." Never "we recommend."
4. **Slightly funny (עם קריצה)** — Humor that acknowledges the chaos. Never tries too hard, never self-deprecating about the product.

**Tone by surface:**

| Surface | Tone | Example |
|---|---|---|
| Onboarding | Supportive, exciting | "בואי נבנה את הקן המושלם" |
| Empty states | Gentle, inviting | "הרשימה שלך מחכה לפריט הראשון" |
| Success / confirmations | Warm, a little celebratory | "הרשימה שלך מתחילה להיראות מדהים 🪺" |
| Error messages | Reassuring, never blaming | "משהו השתבש, אבל אנחנו על זה" |
| Push / in-app nudges | Brief, exciting | "מישהו קנה מהרשימה שלך! 🎁" |
| Destructive confirmations | Clear, calm, no drama | Plain question + clear action verbs |
| Support / legal | Warm, helpful, direct | Human first, formal second |

**Hebrew copy rules:**
1. **Default to feminine singular (את)** — primary audience is expecting mothers. Switch to plural (אתם) only when explicitly addressing couples.
2. **"Nesty" is always English**, even inside Hebrew sentences.
3. **Short sentences** — max ~15 words per UI string.
4. **Everyday Hebrew, not literary.** No corporate register.
5. **RTL always** — `dir="rtl"` on the root. Use logical properties (`ms-`, `me-`) not `ml-`/`mr-`.

**Words we use ✅:** רשימה · קן · חינם · בקליק · פשוט · שלחי · שתפי · מתנות שתאהבי
**Words we avoid ❌:** רכישה / קנייה / הזמנה (we're not a store) · מבצע / הנחה (not our business) · חובה / דחוף (no pressure) · "האפליקציה שלנו" (just say "Nesty") · aggressive CTAs ("קני עכשיו!", "מוגבל בזמן!")

**Emoji rules:**
- Max 1–2 per screen.
- **Preferred:** 🪺 🎁 😉 ✨ 💜 🤍
- **Never:** 🔥 💰 ⚡ 🚨 (too salesy / aggressive)
- An emoji can replace the period at the end of a headline.

**The voice test — run before shipping any copy:**
1. Would a cool older sister say this? If not — rewrite.
2. Does it sound Israeli or translated from English? If translated — rewrite.
3. Is there a real emotion behind it, or just functional? If functional — add warmth.
4. Would I be annoyed seeing this? If yes — dial it back.

### Color System

**All colors are already wired into `nesty-web/tailwind.config.js`.** Use Tailwind tokens — never hardcode hex in components.

**Primary — Vintage Lavender 🟣**
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#86608e` | Main brand color. Buttons, CTAs, headers, links, logo |
| `primary-dark` | `#6d4e74` | Hover/active states, emphasis |
| `primary-light` | `#a891ad` | Subtle accents |
| `primary-foreground` | `#ffffff` | Text on primary backgrounds |

**Secondary — Lilac Ash**
| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#a891ad` | Supporting color |
| `secondary-dark` | `#917a96` | Hover |
| `secondary-light` | `#b9a4bd` | Soft backgrounds |

**Accents — Soft Rose & Peach**
| Token | Hex | Usage |
|---|---|---|
| `accent-pink` | `#f4acb7` | Highlights, badges, celebrations, warmth |
| `accent-pink-light` | `#ffcad4` | Soft backgrounds, cards, gentle emphasis |
| `accent-peach` | `#ffd8d7` | Warm accents, friendly alerts |

**Neutrals**
| Token | Hex | Usage |
|---|---|---|
| `background` | `#faf8fb` | Page background |
| `card` | `#ffffff` | Cards, modals, content surfaces |
| `border` | `#e8e4e9` | Borders, dividers |
| `muted` | `#c9c2cb` | Disabled states, placeholders |
| `muted-foreground` | `#6b6b6b` | Secondary text, captions, metadata |
| `foreground` | `#1a1a1a` | Primary text, headings |

**Status**
| Token | Hex | Usage |
|---|---|---|
| `success` | `#22c55e` | Confirmations, positive actions |
| `destructive` | `#ef4444` | Errors, warnings, destructive actions |

**Color combinations:**

| Combo | Background | Text | Accent | Use for |
|---|---|---|---|---|
| Classic | `background` | `foreground` | `primary` | Default surfaces, trust-building |
| Warm | `accent-pink-light` | `foreground` | `primary` | Emotional / gift-giving moments |
| Bold | `primary` | `white` | `accent-pink` | Primary CTAs, hero sections |
| Soft | `white` | `primary-dark` | `accent-peach` | Testimonials, gentle messaging |

**Color rules ❌:**
- **No baby blue or baby pink as primary** — we're not a gender-reveal brand.
- **No cold/blue tones** — they break the warm palette and feel clinical.
- **Don't invent colors** — add to `tailwind.config.js` and this file if truly needed.

### Typography

- **Primary font:** `Assistant` (Google Fonts, Hebrew-optimized sans-serif)
- **Fallback:** `Heebo` → system sans-serif
- Already set as `font-sans` in `tailwind.config.js`. Just use `font-sans` (or nothing — it's default).

| Element | Weight | Size |
|---|---|---|
| Headline (H1/hero) | Bold (700) | `text-3xl` to `text-5xl`, line-height 1.2 |
| Subheadline (H2) | SemiBold (600) | `text-2xl` to `text-3xl` |
| Section heading (H3) | SemiBold (600) | `text-xl` to `text-2xl` |
| Body | Regular (400) | `text-base` (16px), line-height 1.5–1.6 |
| Small / caption | Regular (400) | `text-sm` (14px), `muted-foreground` |
| Button label | Bold (700) | `text-base` to `text-lg` |

**Typography rules:**
- Never more than 2 font weights in one view.
- Headlines tight line-height (1.2), body loose (1.5).
- "Nesty" is always English, same casing, even inside Hebrew paragraphs.

### Spacing, Radius, Shadow

- **Border radius:** generous and soft — `rounded-xl` (1rem) for cards, `rounded-2xl` (1.5rem) for modals, `rounded-3xl` (2rem) for hero elements. Buttons/inputs: `rounded-xl` minimum.
- **Spacing:** Tailwind 4px base. Cards and modals get generous padding — `p-6` minimum, `p-8` for modals.
- **Shadows:** subtle, never heavy. Use `shadow-sm` or `shadow-md`. Avoid dramatic drop shadows.

### Component Patterns

Visual defaults — deviate only with reason.

- **Cards** — `bg-card`, `border border-border`, `rounded-xl`, `shadow-sm`, `p-6`.
- **Primary buttons** — `bg-primary text-primary-foreground hover:bg-primary-dark rounded-xl px-6 py-3 font-bold`.
- **Secondary buttons** — outline variant, `border-primary text-primary hover:bg-primary/5`.
- **Destructive buttons** — `bg-destructive text-destructive-foreground`, confirm before any irreversible action.
- **Modals** — centered overlay, `bg-card rounded-2xl p-8`, dim backdrop, close on Esc + click-outside.
- **Forms** — full-width inputs, Hebrew labels **above** the field, error message below in `text-destructive text-sm`.
- **Empty states** — soft illustration or emoji + warm Hebrew line + clear CTA. Never a bare "No data."
- **Inputs** — `rounded-xl`, `border-border`, `focus:border-primary focus:ring-primary/20`.

### RTL Rules (non-negotiable)

1. Root container: `<div dir="rtl" className="font-sans">`.
2. Use **logical properties**: `ms-*` over `ml-*`, `pe-*` over `pr-*`.
3. Flex layouts mirror automatically — don't manually reverse unless there's a reason.
4. **Directional icons** (arrows, chevrons, back buttons) **must flip** in RTL. Use `rtl:scale-x-[-1]` or RTL icon variants.
5. Numbers and Latin text inside Hebrew remain LTR — browsers handle this, don't override.

### Imagery

- **Warm, real, Israeli.** Natural light, soft focus, genuine moments.
- **Reflect Israeli society** — Ashkenazi, Mizrahi, Ethiopian, Arab, Russian families.
- **Never:** generic Western stock photos, clinical hospital settings, blue/pink gender stereotypes, competitor screenshots.
- **Illustrations:** minimal, line-based, soft curves, brand colors only.

### Brand Do's and Don'ts (quick reference)

**Do ✅**
- Hebrew first, every surface.
- Warm, slightly humorous, relatable tone.
- Reference real Israeli parenting life.
- One clear CTA per screen.
- Visual consistency — same radius, shadows, palette everywhere.

**Don't ❌**
- Aggressive sales language ("BUY NOW!", "LIMITED TIME!").
- Baby blue / baby pink as primary colors.
- Frame Nesty as a store — we're a guide, not a retailer.
- Formal / corporate Hebrew.
- Compromise trust for conversion.

### Before Shipping a Feature — UI checklist

- [ ] All copy passes the **4-question voice test**.
- [ ] Colors use Tailwind tokens — no hardcoded hex.
- [ ] Fonts use `font-sans` (Assistant/Heebo), no custom font imports.
- [ ] `dir="rtl"` respected; directional icons flipped; logical spacing props used.
- [ ] Border radius is `rounded-xl` or softer.
- [ ] Empty states have a warm Hebrew message + CTA.
- [ ] Error messages are reassuring, not blaming.
- [ ] Max 1–2 emoji per screen, from the approved list.
- [ ] Feminine-singular Hebrew by default.
- [ ] No forbidden words (רכישה, מבצע, חובה, etc.).

---

## Development Commands

### Web Application

```bash
cd nesty-web
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**Important:** The web app must run on `localhost:5173` for the extension to detect the authentication session.

### Chrome Extension

**Production Extension** (use this):
```bash
# Located in: extension/final-version/
# To load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/final-version/
```

**Chrome Web Store Package:**
```bash
# Located in: extension/chrome-store/
# Ready-to-upload package: extension/nesty-extension-v1.0.0.zip
# See extension/chrome-store/STORE_LISTING.md for submission guide
```

### Deployment

```bash
# Deploy web app to GitHub Pages
cd nesty-web
npm run build
# Copy dist/ contents to docs/ or push to gh-pages branch
```

**Deployment URLs:**
- Production: https://ppltok.github.io/Nesty
- Base path configured in `vite.config.ts` (production: `/Nesty/`, dev: `/`)

---

## Architecture & Critical Patterns

### Web Application Architecture

**Tech Stack:** React 19 + TypeScript + Vite + TailwindCSS + Supabase

**Key Directories:**
- `nesty-web/src/components/` - Reusable React components
- `nesty-web/src/pages/` - Page-level components
- `nesty-web/src/contexts/AuthContext.tsx` - Authentication state management
- `nesty-web/src/lib/supabase.ts` - Supabase client configuration

**Authentication Flow:**
1. User signs in via Supabase Auth
2. Session stored in localStorage (key: `sb-{project-ref}-auth-token`)
3. Extension reads this session from the localhost:5173 tab
4. Protected routes check auth state from AuthContext

**Database Schema:**
```
auth.users (Supabase managed)
  ↓ 1:1
profiles (auto-created via trigger)
  ↓ 1:1
registries
  ↓ 1:N
items
```

See `NESTY_DATABASE_SCHEMA.md` for complete schema details.

### Chrome Extension Architecture

**CRITICAL: Use JSON-LD Extraction, Not DOM Scraping**

The extension has two implementations in the codebase:
- ✅ **`extension/final-version/`** - JSON-LD extraction (USE THIS)
- ❌ **`extension/nesty-local/`** - DOM scraping (DEPRECATED - wrong prices, too many images)

**Why JSON-LD is Superior:**
- Extracts exact price and correct image from structured data
- Works across all e-commerce platforms (Shopify, WooCommerce, etc.)
- Simple, maintainable code (150 lines vs 122KB obfuscated)
- Industry standard (schema.org Product/ProductGroup schemas)

**Extension Architecture (Manifest V3):**

```
Product Page (e.g., shilav.co.il)
    ↓ User clicks extension icon
Background Script (background.js)
    ↓ Injects content.js into page
Content Script (content.js)
    ↓ Extracts JSON-LD data
    ↓ chrome.runtime.sendMessage({ type: 'GET_SESSION' })
Background Script
    ↓ chrome.tabs.query({ url: 'https://ppltok.github.io/Nesty/*' })
    ↓ chrome.scripting.executeScript(Nesty tab)
Nesty Tab (ppltok.github.io/Nesty)
    ↓ Read localStorage for Supabase session
    ↓ Return session
Background Script
    ↓ Cache in chrome.storage.local
    ↓ sendResponse({ session })
Content Script
    ↓ Use session to fetch registry from Supabase
    ✓ Show product form with extracted data
```

**Key Extension Files:**
- `manifest.json` - Extension configuration (Manifest V3, ES6 modules)
- `background.js` - Service worker (session fetching via chrome.tabs API)
- `content.js` - Main logic (JSON-LD extraction, form UI, Supabase integration)
- `config.js` - Environment configuration (production vs development)

**Product Extraction (content.js):**
```javascript
// Searches for JSON-LD structured data
const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

// Handles Product schema
if (data['@type'] === 'Product') {
  return extractFromProduct(data);
}

// Handles ProductGroup schema (variants)
if (data['@type'] === 'ProductGroup') {
  return extractFromProductGroup(data);
}
```

**Supported Platforms:**

The extension uses a **multi-method extraction strategy** that works across different e-commerce platforms:

1. **JSON-LD (Primary Method)**
   - Works on: Most e-commerce sites (Shopify, WooCommerce, Magento, etc.)
   - Extracts: Product/ProductGroup schemas from `<script type="application/ld+json">`
   - Reliability: 95%+ accuracy

2. **AliExpress (Specialized Extractor)**
   - Platform: AliExpress.com (all regions)
   - Handles: Product pages, bundle deals, modals/overlays
   - Methods (in order):
     - `window.runParams.data` (primary data source)
     - `window._d_c_.DCData` (images)
     - `window.__INITIAL_STATE__` / `window.__APP_STATE__`
     - DOM extraction (title, price, image selectors)
     - Open Graph meta tags (fallback)
   - Note: Works with dynamic modals where URL doesn't change

3. **Shopify Fallback**
   - Shopify JSON API (`/products/{handle}.json`)
   - ShopifyAnalytics.meta.product
   - DOM extraction with platform-specific selectors

**Extraction Flow:**
```
1. Try JSON-LD structured data (all platforms)
   ↓ If not found
2. Detect platform (AliExpress, Shopify, WooCommerce, etc.)
   ↓
3. Use platform-specific extractor
   ↓ If fails
4. Generic fallback (meta tags + DOM)
```

**Authentication Strategy:**
- Extension cannot access cross-origin localStorage directly
- Background script uses `chrome.tabs.query()` to find Nesty tab
- Executes script in Nesty tab context to read session
- Caches session in `chrome.storage.local` for performance
- Session is validated before each item submission

**Environment Configuration (config.js):**
```javascript
const ENV = 'production' // or 'development'

const CONFIG = {
  development: {
    WEB_URL: 'http://localhost:5173'
  },
  production: {
    WEB_URL: 'https://ppltok.github.io/Nesty'
  }
}
```

**Chrome Extension Permissions:**
- `activeTab` - Extract product data when user clicks icon (temporary access)
- `scripting` - Inject content script and execute in Nesty tab
- `storage` - Cache authentication session
- `tabs` - Query for Nesty tab to read session
- Host permissions: `ppltok.github.io/*`, `*.supabase.co/*`, `localhost:5173/*`

### Mock API (Development Only)

**Location:** `nesty-web/vite.config.ts`

The Vite dev server includes mock API endpoints for testing:
```
GET  /api/scrape?url={url}  - Mock scraping endpoint
POST /api/products          - Save product data (in-memory)
GET  /api/products          - Get all saved products
```

These are **development only** and replaced by Supabase in production.

---

## Critical Files & Their Purposes

### Configuration Files

- **`nesty-web/vite.config.ts`** - Vite config, mock API plugin, GitHub Pages base path
- **`extension/final-version/config.js`** - Extension environment configuration
- **`extension/final-version/manifest.json`** - Chrome extension configuration (V3)

### Documentation Files

- **`project_status.md`** - Current project status, major discoveries, architecture decisions
- **`extension/final-version/DEVELOPMENT_LOG.md`** - Extension development history, problems solved
- **`extension/chrome-store/STORE_LISTING.md`** - Complete Chrome Web Store submission guide
- **`NESTY_DATABASE_SCHEMA.md`** - Complete database schema and data flow

### Key Implementation Files

- **`nesty-web/src/contexts/AuthContext.tsx`** - Authentication state management
- **`nesty-web/src/lib/supabase.ts`** - Supabase client configuration
- **`extension/final-version/content.js`** - Extension main logic (JSON-LD extraction, UI, Supabase)
- **`extension/final-version/background.js`** - Extension background service worker
- **`nesty-web/src/lib/productExtraction.ts`** - **SHARED** extraction logic for website's "Paste URL" feature

---

## CRITICAL: Keeping Extraction Logic Synced

**Problem:** The extension and website both extract product data, but use separate code. When improvements are made to the extension, the website doesn't benefit automatically.

**Solution:** Both now share the same core extraction logic in `nesty-web/src/lib/productExtraction.ts`.

### Extraction Logic Locations

1. **Website URL Extraction** (`nesty-web/src/lib/productExtraction.ts`)
   - Used when user pastes a URL in "Add Item" modal
   - Calls Supabase Edge Function to fetch HTML
   - Uses `extractProductDataFromDocument(doc)` to extract data
   - **THIS IS THE SOURCE OF TRUTH** ✅

2. **Extension Extraction** (`extension/final-version/content.js`)
   - Used when user clicks extension icon on a product page
   - Has access to live page DOM
   - Uses same extraction functions (ported from productExtraction.ts)

### When Adding New Platform Support or Extraction Improvements

**CRITICAL: Follow this order to keep both in sync:**

1. ✅ **Add/Update extraction logic in `productExtraction.ts` FIRST**
   - This is the TypeScript source of truth
   - Add platform detection to `detectPlatform()`
   - Add extraction function (e.g., `extractFromAliExpress()`)
   - Update `extractProductDataFromDocument()` to call it

2. ✅ **Port changes to `extension/final-version/content.js`**
   - Convert TypeScript to JavaScript
   - Keep function names and logic identical
   - Extension may have additional methods (e.g., `window.runParams` for live JavaScript variables)
   - But core DOM extraction should be identical

3. ✅ **Test both paths**
   - Test website: Paste URL in "Add Item" modal
   - Test extension: Click extension icon on product page
   - Verify both extract the same data

### Example: AliExpress Support

**In `productExtraction.ts` (lines 103-283):**
```typescript
function detectPlatform(doc: Document): string | null {
  const hostname = new URL(doc.URL || 'about:blank').hostname
  if (hostname.includes('aliexpress.com')) {
    return 'aliexpress'
  }
  return null
}

function extractFromAliExpress(doc: Document): ExtractedProductData | null {
  // Platform-specific DOM extraction
  // Priority-based price selection (discount indicators = higher priority)
  // Multiple title/image selectors
}
```

**In `content.js` (lines 525-778):**
```javascript
function detectPlatform(doc = document) {
  if (window.location.hostname.includes('aliexpress.com')) {
    return 'aliexpress';
  }
  return null;
}

async function extractFromAliExpress(doc = document) {
  // SAME logic as productExtraction.ts
  // Plus additional methods:
  // - window.runParams (live JavaScript variables)
  // - window._d_c_ (AliExpress data container)
}
```

### Key Differences Between Extension and Website

**Extension advantages:**
- Access to live JavaScript (`window.runParams`, `window._d_c_`, etc.)
- Real-time page state
- Can use multiple extraction attempts

**Website limitations:**
- Only receives static HTML from Edge Function
- No JavaScript execution
- Relies purely on DOM extraction

**Therefore:**
- DOM extraction logic MUST be identical in both
- Extension can have additional JavaScript variable extraction
- Website relies on DOM extraction working correctly

### Checklist for New Platform Support

When adding support for a new e-commerce platform:

- [ ] Add platform detection to `productExtraction.ts` → `detectPlatform()`
- [ ] Create extraction function in `productExtraction.ts` (e.g., `extractFromEbay()`)
- [ ] Update `extractProductDataFromDocument()` to call it
- [ ] Test website URL paste functionality
- [ ] Port logic to `content.js` with same function structure
- [ ] Add any extension-specific enhancements (JavaScript variables)
- [ ] Test extension on live product pages
- [ ] Document platform-specific patterns in this file
- [ ] Update any extraction methodology docs in `Documents/`

---

## Common Gotchas & Solutions

### 1. Extension Session Detection

**Problem:** Extension shows "login required" even though user is logged in.

**Solution:**
- Ensure Nesty web app tab is open at the correct URL
- Production: `https://ppltok.github.io/Nesty`
- Development: `http://localhost:5173`
- Check `config.js` has correct `ENV` value
- Clear chrome.storage: `chrome.storage.local.clear()`

### 2. Wrong Environment Configuration

**Problem:** Extension configured for localhost but trying to use production site (or vice versa).

**Solution:**
Check `extension/final-version/config.js`:
```javascript
const ENV = 'production' // Must match deployment environment
```

### 3. ProductGroup vs Product Schema

**Problem:** Wrong price extracted from Shopify products.

**Solution:**
Shopify uses `ProductGroup` for variant products. Price is in:
```javascript
data.hasVariant[0].offers.price  // Not data.offers.price
```

The `extractFromProductGroup()` function handles this correctly.

### 4. Double Injection Error

**Problem:** "Identifier already declared" error when clicking extension multiple times.

**Solution:**
Content script includes double-injection prevention:
```javascript
if (window.nestyExtensionLoaded) {
  return;
}
window.nestyExtensionLoaded = true;
```

### 5. GitHub Pages Base Path

**Problem:** Assets fail to load on GitHub Pages deployment.

**Solution:**
Vite config automatically handles this:
```javascript
base: process.env.NODE_ENV === 'production' ? '/Nesty/' : '/'
```

Routes in React Router must use basename from environment.

---

## Database Schema Quick Reference

**Key Tables:**
```sql
profiles (id, email, first_name, last_name, due_date)
  ↓
registries (id, owner_id, partner_id, slug, title, address_*)
  ↓                        ↓
  |                registry_invitations (id, registry_id, invited_by, invited_email, status, token)
  ↓
items (id, registry_id, name, price, quantity, quantity_received,
       is_most_wanted, is_private, image_url, original_url, category, ...)
```

**Important Fields:**
- `registries.partner_id` - Co-parent UUID, ON DELETE SET NULL. Equal access except invite/delete.
- `items.quantity_received` - Required, not nullable (defaults to 0)
- `items.enable_chip_in` - Boolean for group gifting
- `items.cheaper_alternative_url` - For suggesting alternatives
- `items.price_alert_sent` - Track price drop notifications

**Row Level Security (RLS):**
- All tables have RLS enabled
- Profiles: Users can only read/update their own profile
- Registries: Public read, owner OR partner can read/update, only owner can delete
- Items: Owner OR partner full access, public sees non-private items
- Purchases: Anyone can create, owner OR partner can view/update

See `NESTY_DATABASE_SCHEMA.md` for complete schema and policies.

---

## Testing the Extension

### Prerequisites
1. Web app running on correct URL (localhost:5173 or ppltok.github.io/Nesty)
2. User logged in to Nesty in that tab
3. User has created a registry

### Test Flow
1. Load extension in Chrome (chrome://extensions/)
2. Navigate to any e-commerce product page (e.g., shilav.co.il)
3. Click extension icon
4. Extension should:
   - Extract product name, price, image from JSON-LD
   - Show form with Hebrew UI
   - Pre-fill extracted data
   - Submit to Supabase when user clicks "הוסף לרשימה"

### Debugging
- Check Background Service Worker console: chrome://extensions/ → Service Worker
- Check content script console: Browser DevTools on product page
- Verify JSON-LD exists: Search page source for `application/ld+json`
- Check session cache: `chrome.storage.local.get(['nesty_session'])`

---

## Chrome Web Store Submission

**Package Location:** `extension/nesty-extension-v1.0.0.zip`

**Key Documents:**
- `extension/chrome-store/STORE_LISTING.md` - Complete submission guide
- `extension/chrome-store/privacy-policy.html` - Privacy policy (host on GitHub Pages)
- `extension/chrome-store/README.md` - Quick start checklist

**Critical Points:**
- No broad host permissions (`http://*/*`, `https://*/*`) to avoid delayed review
- Uses `activeTab` for product extraction
- Specific host permissions only for Nesty app and Supabase
- Comprehensive permission justifications in STORE_LISTING.md
- English + Hebrew descriptions for reviewers and users

---

## Production Deployment Checklist

### Web Application
- [ ] `npm run build` in nesty-web/
- [ ] Verify base path is `/Nesty/` in production
- [ ] Copy dist/ to deployment location
- [ ] Test authentication on production URL
- [ ] Verify all routes work with base path

### Chrome Extension (Chrome Store Upload)
- [ ] **CRITICAL: Remove localhost from manifest.json host_permissions** (users don't need it, causes warnings)
- [ ] Set `ENV = 'production'` in config.js
- [ ] Verify `WEB_URL` matches production site (https://nestyil.com)
- [ ] Test session detection from production tab
- [ ] Test product extraction and submission
- [ ] Update version number for new releases
- [ ] Create new zip for Chrome Store (without localhost)
- [ ] **After upload: Restore localhost to manifest.json** for continued development

**Note:** Keep two versions of manifest.json:
- **Development:** includes `http://localhost:5173/*` for debugging
- **Chrome Store:** excludes localhost to avoid permission warnings for users

---

## Key Architectural Decisions

### Why JSON-LD Over DOM Scraping?
- **Accuracy:** 95%+ correct extraction vs frequent errors
- **Reliability:** Works across all platforms vs site-specific
- **Maintainability:** 150 lines vs 122KB obfuscated code
- **Industry Standard:** Used by Google, major extensions

Documented in `project_status.md` with real-world comparison (59.90 ILS correct vs 159.90 ILS wrong).

### Why Background Script for Session Fetching?
- Content scripts cannot access `chrome.tabs` API
- Need to execute script in Nesty tab context to read localStorage
- Browser security prevents cross-origin localStorage access
- Only background scripts have required permissions

### Why Supabase?
- Built-in authentication
- Real-time subscriptions
- Row Level Security for privacy
- PostgreSQL for complex queries
- Storage for images (future)

---

## Important Links

- **Production Site:** https://ppltok.github.io/Nesty
- **Repository:** https://github.com/ppltok/Nesty
- **Supabase Project:** wopsrjfdaovlyibivijl.supabase.co
- **Chrome Web Store:** https://chromewebstore.google.com/detail/add-to-nesty-button/mkkadfpabelceniomobeaejhlfcihkll

---

## Branch Strategy

**Main Branches:**
- `main` - Stable production code
- `integrate-extension` - Extension integration work (current active branch)

**Note:** README mentions `bugfix/local-fixes` as stable - verify current branch status before major changes.

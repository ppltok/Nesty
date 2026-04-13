# Lessons Learned

> Mistakes, surprises, and discoveries that should never be repeated or forgotten. Every agent should check this before starting work.

---

## L-001: Structured Data Beats Guesswork

**When:** December 2024 (Extension development)
**What happened:** The original extension used DOM scraping — CSS selectors to guess which HTML elements contained product data. It returned wrong prices and dozens of irrelevant images.
**Lesson:** Always use structured data when available. JSON-LD is industry standard and present on most modern e-commerce sites. Don't reinvent the wheel by scraping what the page already declares in structured form.
**See:** [[Architecture Decision Log|ADR-001]], [[JSON-LD Extraction]]

---

## L-002: Chrome Web Store Permissions Matter

**When:** December 2024 (Extension submission)
**What happened:** Broad host permissions (`http://*/*`, `https://*/*`) would have triggered delayed Chrome Web Store review.
**Lesson:** Use `activeTab` instead of broad permissions whenever possible. Be intentional about every permission, and justify each one in the store listing. The Chrome Web Store reviewers look carefully at permissions.
**See:** [[Extension Manifest Standards]]

---

## L-003: ProductGroup vs Product Schema

**When:** December 2024 (Shopify extraction)
**What happened:** Products with variants on Shopify use `ProductGroup` schema instead of `Product`. The price lives in `hasVariant[0].offers.price`, not in the top-level offers.
**Lesson:** Always handle both Product and ProductGroup schemas. Test with variant products (different sizes, colors) not just simple products.
**See:** [[JSON-LD Extraction]]

---

## L-004: Extension Double-Injection

**When:** December 2024
**What happened:** Clicking the extension icon multiple times caused "Identifier already declared" errors because content.js was injected repeatedly.
**Lesson:** Always include a guard at the top of content scripts:
```javascript
if (window.nestyExtensionLoaded) return;
window.nestyExtensionLoaded = true;
```

---

## L-005: GitHub Pages Base Path

**When:** Early development
**What happened:** Assets and routes failed on GitHub Pages because the app assumed it was at root (`/`) instead of `/Nesty/`.
**Lesson:** Always configure the base path correctly for deployment. Vite's `base` option and React Router's `basename` must both be set. Test with `npm run preview` before deploying.
**See:** [[GitHub Pages]], [[Deployment Flow]]

---

## L-006: Cross-Origin Session Access

**When:** December 2024 (Extension auth)
**What happened:** Content scripts can't access localStorage from other origins (the Nesty tab). Tried multiple approaches before landing on the background script pattern.
**Lesson:** Only background/service worker scripts have access to `chrome.tabs` and `chrome.scripting` APIs needed for cross-tab communication. Design the auth flow around this from the start.
**See:** [[Chrome Extension Architecture]], [[Architecture Decision Log|ADR-004]]

---

## L-007: Keep Extraction Logic in Sync

**When:** 2025 (AliExpress support)
**What happened:** Improvements to AliExpress extraction in the extension weren't reflected in the website's paste-URL feature, causing inconsistent behavior.
**Lesson:** Always follow the [[Extraction Sync Protocol]]. Update `productExtraction.ts` first, then port to `content.js`. Test both paths.
**See:** [[Extraction Sync Protocol]], [[Architecture Decision Log|ADR-005]]

---

## L-008: PostgREST Schema Cache After DDL

**When:** April 6, 2026 (Co-parent migration)
**What happened:** After running `ALTER TABLE registries ADD COLUMN partner_id`, the Edge Functions kept returning "column registries.partner_id does not exist". The column existed in PostgreSQL but PostgREST (Supabase's REST API layer) had a stale schema cache.
**Lesson:** After any DDL change (ALTER TABLE, CREATE TABLE), the PostgREST schema cache must be reloaded. In Supabase Dashboard: Settings → API → "Reload schema cache". Or use the Management API. Edge Functions using the Supabase JS client go through PostgREST, so they're affected too.
**See:** [[Database Change Flow]], [[Feature Ship Log|April 2026]]

---

## L-009: Resend API Requires Array for Recipients

**When:** April 6, 2026 (Invitation emails)
**What happened:** The send-invitation Edge Function called Resend with `to: email` (a string). Resend silently rejected it — no error in the function response, but no email delivered. Changed to `to: [email]` (array) and it worked immediately.
**Lesson:** Always pass recipients as an array to the Resend API: `to: [email]`, not `to: email`. Check the Resend response body for errors even on 200 status codes. Log the full response during development.
**See:** [[Feature Ship Log|April 2026]]

---

## L-010: Supabase `.or()` with `.maybeSingle()` and Public RLS

**When:** April 6, 2026 (AuthContext registry query)
**What happened:** Changed the registry query from `.eq('owner_id', userId)` to `.or('owner_id.eq.${userId},partner_id.eq.${userId}')` with `.maybeSingle()`. Combined with a public SELECT RLS policy ("Anyone can view registries"), this could return multiple rows and cause `maybeSingle()` to fail silently.
**Lesson:** When permissive public RLS policies exist, `.or()` + `.maybeSingle()` is dangerous because the query sees ALL public rows plus the filtered ones. Solution: use a two-step query — first check `.eq('owner_id')`, then fallback to `.eq('partner_id')`. Each returns at most one row.
**See:** [[Feature Ship Log|April 2026]], `nesty-web/src/contexts/AuthContext.tsx`

---

## L-011: Test on localhost Before Production Deploy

**When:** April 6, 2026 (Co-parent feature)
**What happened:** The invite email links pointed to production (`nestyil.com/invite/:token`) but the frontend code with the `/invite/:token` route was only on the local worktree. Invited users hit a 404. Had to deploy the frontend before invite links would work.
**Lesson:** When building features with email links or external redirects, the links go to production immediately (Edge Functions are deployed separately from the frontend). Either: (a) deploy frontend first, or (b) use localhost URLs during testing. Be aware of the gap between "Edge Function deployed" and "frontend deployed".
**See:** [[Deployment Flow]], [[Feature Ship Log|April 2026]]

---

## L-012: Recharts Axes Must Be Direct Children (No Fragments)

**When:** April 13, 2026 (Dashboard bar chart audit)
**What happened:** All bar charts across the entire dashboard were missing their X-axis and Y-axis tick labels. The `BarChartComponent.tsx` used a ternary to switch between horizontal and vertical layouts, wrapping `<XAxis>` and `<YAxis>` in React Fragments (`<>...</>`). Recharts uses `React.Children` to scan for axis components — Fragments hide children from this scan, so the axes were silently dropped from the SVG output. Zero errors in console.
**Lesson:** Never wrap Recharts child components (XAxis, YAxis, Legend, Tooltip, etc.) in React Fragments or other wrapper elements. They MUST be direct children of the chart component. Use spread props on a single element for conditional configuration:
```tsx
// ❌ WRONG — Fragment hides axes from Recharts
{isVertical ? (
  <><XAxis type="number" /><YAxis type="category" dataKey="name" /></>
) : (
  <><XAxis dataKey={xKey} /><YAxis /></>
)}

// ✅ CORRECT — Single direct child with spread props
<XAxis {...(isVertical ? { type: 'number' } : { dataKey: xKey })} />
<YAxis {...(isVertical ? { type: 'category', dataKey: 'name' } : {})} />
```
Also: Recharts' `label` prop on XAxis/YAxis renders text inside the SVG, which gets clipped by the container. Use HTML-based axis titles (positioned `<div>` elements outside the SVG) for reliable rendering.
**See:** [[Feature Ship Log|April 2026]], [[Nesty Dashboard]]

---

## Template

```markdown
## L-XXX: [Short Title]

**When:** [Date/period]
**What happened:** [Factual description of what went wrong or was surprising]
**Lesson:** [What to do differently going forward]
**See:** [Links to related vault notes]
```

See also: [[Architecture Decision Log]], [[Feature Ship Log]]

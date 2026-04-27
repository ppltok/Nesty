---
name: extraction-sync
description: Keep the Nesty extension's product extraction logic in lockstep with the website's. Triggers when the user says "sync extraction", "port to website", "port to extension", or after editing extraction code in either content.js or productExtraction.ts. Compares the two files, ports changes between them, and flags anything that can't be cleanly ported.
---

# Extraction Sync

The Nesty project extracts product data (name, price, image) in **two
places**, and they drift apart whenever one is edited without the other:

| File | Used by | Runtime |
|---|---|---|
| `extension/chrome-store/content.js` | Chrome extension — when user clicks "Add to Nesty" on a live product page | Has DOM **and** live JS variables (`window.runParams`, `window._d_c_`, etc.) |
| `nesty-web/src/lib/productExtraction.ts` | Website — when user pastes a URL into "Add Item" | Only static HTML (no JS execution, no live variables) |

The root `CLAUDE.md` calls `productExtraction.ts` the **source of truth** for
DOM extraction. The extension may add JavaScript-variable extractions on top,
but the DOM logic must match.

---

## When to run this skill

- Right after editing extraction logic in either file
- When the user says "sync extraction", "port this to the website", "port
  this to the extension", or "are these two files still aligned?"
- Before a release where extraction changes are part of the diff

---

## Steps

### 1. Identify what changed

If we just edited one of the files in this conversation, you already know
what changed — use that. Otherwise:

```bash
git diff HEAD -- extension/chrome-store/content.js nesty-web/src/lib/productExtraction.ts
```

If both files have uncommitted changes, ask the user which is the source of
truth for this sync (the recently-edited one usually).

### 2. Read both files in the relevant region

Don't read entire files unless necessary. Focus on the function(s) touched
by the change:

- Platform detection (`detectPlatform`)
- Per-platform extractor (`extractFromAliExpress`, `extractFromShopify`, etc.)
- JSON-LD parsing
- Generic DOM fallback

### 3. Diff them in plain language

State, in 2-4 bullets, what differs between the two for the changed area.
Example:
- Extension picks `.product-price__discount` first; website picks `.price`
  first.
- Extension trims leading currency symbol; website does not.

### 4. Port the change

Edit the **other** file to match. Translate as needed:

| TypeScript (productExtraction.ts) | JavaScript (content.js) |
|---|---|
| `function foo(doc: Document): string \| null` | `function foo(doc = document)` |
| `doc.querySelector(...)` | same |
| Type annotations | strip them |
| `import` statements | inline or use existing globals |

Keep function names and structure identical so future diffs stay readable.

### 5. Flag what can't be ported

The extension can use things the website cannot:

- `window.runParams`, `window._d_c_`, `window.__INITIAL_STATE__` — live JS
- `window.ShopifyAnalytics` — live JS
- Any `chrome.*` API
- Anything that depends on user interaction having happened

If the extension change relies on these, **do not** copy that part into the
website file. Just note it in the report.

The website can use things the extension typically doesn't:

- Server-rendered SEO meta that the extension might overwrite

If a website change uses these, port the *intent* (e.g., "fall back to
`og:price:amount`") to the extension as a fallback, not a primary path.

### 6. Sanity-check both files

After editing, re-read the changed function in both files and confirm:
- Same selector priority order (where applicable)
- Same null/empty handling
- Same return shape

### 7. Report

Short summary, this format:

```
## Extraction sync

**Source of change:** <file>
**Synced to:** <file>
**Function(s) touched:** <names>

**Ported:**
- <bullet>
- <bullet>

**Skipped (can't port):**
- <bullet — and why>

**Differences that remain (intentional):**
- <bullet — e.g. "extension uses window.runParams as primary, website skips that path">
```

---

## Rules

- **Never edit the source-of-change file.** This skill ports *from* it, not
  back into it.
- **Don't introduce new functions** during the sync — port what exists. If
  the change requires restructuring, stop and tell the user; that's a
  design decision, not a sync.
- **Keep function names identical across files** so the next sync is easy.
- **One platform / function per sync.** If multiple unrelated areas
  changed, do them one at a time and report each.
- **Don't run tests or commit.** Sync, report, hand back to the user.

# Guides Section — Implementation Plan (throwaway)

## Routing
- `/guides` → `GuideHubPage` (renders `index.md`)
- `/guides/:slug` → `GuidePage` (renders `[slug].md`)
- Both public, mounted at top of `Routes` in `App.tsx`. Production base is `/` (custom domain `nestyil.com`), dev is `/` — confirmed in `vite.config.ts`. No special base-path handling needed beyond the existing `BrowserRouter basename={import.meta.env.BASE_URL}`.
- Add to `isPublicRoute` check so AuthLoading doesn't gate guide pages.

## Markdown pipeline
- Use Vite's `import.meta.glob('../content/guides/*.md', { query: '?raw', import: 'default', eager: true })` to load raw markdown strings at build time. No async fetch needed → simpler and SSR-safe.
- Parse frontmatter with `gray-matter` (browser-friendly via `buffer` polyfill or `front-matter` lib). gray-matter has node deps; prefer `front-matter` (zero-deps, browser-safe) — fallback to `gray-matter` with the `buffer` polyfill if needed.
- Render markdown with `react-markdown` + `remark-gfm` (tables, strikethrough). Both work fine with React 19.

## SEO injection
- React 19 has built-in support for `<title>`, `<meta>`, `<link>` rendered inside any component — they hoist to `<head>` automatically (per React 19 metadata docs). No `react-helmet-async` needed.
- Render `<script type="application/ld+json">` inline for each entry in `frontmatter.jsonLd[]`, JSON-stringified.

## Internal-link rewriting
- Custom `a` renderer in `react-markdown`: detect `./<slug>.md`, rewrite to `/guides/<slug>`, render as React Router `<Link>` so navigation stays SPA.

## Editorial-note stripping
- Pre-process the markdown body string before passing to `react-markdown`:
  - Strip blockquote blocks containing `הערה ל־Tom` (handle `־` and `-`).
  - Strip blockquote blocks containing `הערות פנימיות`.
- Regex on multiline blockquotes: match `^> .*\n(> .*\n)*` where the block contains either marker, drop entire block.

## Layout sketch

### Hub (`/guides`)
- Top nav: Nesty logo + back-to-home + CTA "התחילי רשימה".
- Hero: H1 from `index.md` title, description as subhead, soft `bg-accent-pink-light/40` band.
- Categorized grid: 4 sections matching `index.md` structure (יסודות / כמויות / תזמון / תרחישים). Within each, cards for each guide with title, description, reading time. `bg-card rounded-xl shadow-sm border p-6 hover:shadow-md`.
- "למה Nesty שונה" callout card.
- FAQ accordion (`<details>`).
- Final CTA band.

### Guide (`/guides/:slug`)
- Same top nav.
- Breadcrumb: בית › מדריכים › <title>.
- Article header: H1, meta line (זמן קריאה · עודכן ב־<date> · מאת <author>).
- TL;DR card: matched on first heading containing "תשובה קצרה". Style: `bg-accent-pink-light/60 rounded-2xl p-6 border-r-4 border-primary`.
- Prose body via MarkdownRenderer.
- FAQ section: detect H2 "שאלות שכולן שואלות (FAQ)" — render H3 children as `<details>` accordion.
- Prev/next nav at bottom (sorted by `order`).
- CTA: "התחילי רשימה ב־Nesty".

## MarkdownRenderer
Custom renderers:
- `h1`: `text-3xl md:text-4xl font-bold text-foreground mt-12 mb-4`
- `h2`: `text-2xl md:text-3xl font-bold text-foreground mt-10 mb-3`
- `h3`: `text-xl font-semibold mt-6 mb-2`
- `p`: `text-base leading-relaxed text-foreground mb-4`
- `ul`/`ol`: `mb-4 pe-6 space-y-2`
- `blockquote`: `bg-accent-peach/40 border-r-4 border-primary rounded-xl p-4 my-6 text-foreground` (after editorial filter)
- `table`: wrapper `overflow-x-auto`; `table` `w-full text-sm border-collapse`; `th` `bg-muted-light text-foreground text-start p-3 font-semibold`; `td` `border-t border-border p-3`.
- `a`: rewrite `./*.md` → `/guides/<slug>`, use `<Link>`; external links open in new tab with `rel="noopener"`.
- `code`: `bg-muted-light px-1.5 py-0.5 rounded font-mono text-sm`.
- `hr`: `border-border my-8`.

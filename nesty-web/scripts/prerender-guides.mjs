// Prerender guide pages to static HTML for SEO.
//
// Why: the site is a client-side SPA on GitHub Pages. Deep links to guide
// routes have no static file, so GitHub Pages returns a hard HTTP 404 (the
// 404.html SPA fallback paints the page for humans, but Googlebot sees the
// 404 status and refuses to index it). Result: only the homepage was indexed.
//
// This script runs AFTER `vite build`. For each guide markdown file it emits a
// flat static HTML file (`dist/guides/<slug>.html`, and `dist/guides.html` for
// the hub) that returns a clean 200 at the no-slash URL on GitHub Pages. The
// file carries the real <title>, meta, canonical, Open Graph and JSON-LD in the
// head plus the rendered article body inside #root — everything a crawler needs.
//
// The built SPA <script>/<link> tags are preserved, so when a human lands on the
// page React boots via createRoot() and replaces #root with the live interactive
// app. GuideSEO dedupes the head tags at runtime, so there are no duplicates.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import fm from 'front-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distDir = join(root, 'dist')
const guidesContentDir = join(root, 'src', 'content', 'guides')

marked.setOptions({ gfm: true, breaks: false })

// ── helpers ──────────────────────────────────────────────────────────────

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Mirror of stripEditorialNotes() in src/lib/guides.ts — drop author-only
// blockquote notes so they never reach the rendered page.
const EDITORIAL_MARKERS = ['ל־Tom', 'ל-Tom', 'הערות פנימיות']
function stripEditorialNotes(markdown) {
  const isQuoteLine = (line) => /^\s*>/.test(line)
  const lines = markdown.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    if (isQuoteLine(lines[i])) {
      let j = i
      const block = []
      while (j < lines.length && isQuoteLine(lines[j])) {
        block.push(lines[j])
        j++
      }
      const blockText = block.join('\n')
      const isEditorial = EDITORIAL_MARKERS.some((m) => blockText.includes(m))
      if (!isEditorial) out.push(...block)
      else if (out.length && out[out.length - 1] === '') out.pop()
      i = j
    } else {
      out.push(lines[i])
      i++
    }
  }
  return out.join('\n')
}

// Match MarkdownRenderer.rewriteHref: ./slug.md → /guides/slug
function rewriteInternalLinks(markdown) {
  return markdown.replace(/\]\(\.\/([a-z0-9-]+)\.md\)/gi, '](/guides/$1)')
}

function renderBody(rawBody) {
  let md = stripEditorialNotes(rawBody)
  // Strip the leading H1 — we render frontmatter.title as the page <h1>.
  md = md.replace(/^# [^\n]+\n+/, '')
  // Strip the trailing italic byline already shown in the page footer.
  md = md.replace(/\n*\*המדריך נכתב על ידי[^\n]*\*\s*$/, '')
  md = rewriteInternalLinks(md)
  return marked.parse(md)
}

function buildHead(f, fallbackCanonical) {
  const title = escapeHtml(f.metaTitle || f.title || 'Nesty')
  const description = escapeHtml(f.metaDescription || f.description || '')
  const canonical = escapeHtml(f.canonical || fallbackCanonical)
  const image = f.ogImage
    ? f.ogImage.startsWith('http')
      ? f.ogImage
      : `https://nestyil.com${f.ogImage}`
    : 'https://nestyil.com/Nesty_logo.png'
  const imageEsc = escapeHtml(image)

  const tags = [
    `<link rel="canonical" href="${canonical}" />`,
    f.keywords?.length
      ? `<meta name="keywords" content="${escapeHtml(f.keywords.join(', '))}" />`
      : '',
    `<meta property="og:title" content="${title}" />`,
    description ? `<meta property="og:description" content="${description}" />` : '',
    `<meta property="og:type" content="article" />`,
    `<meta property="og:locale" content="he_IL" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${imageEsc}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    description ? `<meta name="twitter:description" content="${description}" />` : '',
    `<meta name="twitter:image" content="${imageEsc}" />`,
  ]

  for (const block of f.jsonLd || []) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(block)}</script>`
    )
  }

  return { title, description, tagsHtml: tags.filter(Boolean).join('\n    ') }
}

function buildPage(template, f, fallbackCanonical) {
  const { title, description, tagsHtml } = buildHead(f, fallbackCanonical)
  const bodyHtml = renderBody(f.__body)

  let html = template

  // Swap the default <title> for the guide title.
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)

  // Swap the default meta description.
  if (description) {
    html = html.replace(
      /<meta name="description" content="[\s\S]*?">/,
      `<meta name="description" content="${description}">`
    )
  }

  // Inject canonical / OG / twitter / JSON-LD just before </head>.
  html = html.replace('</head>', `    ${tagsHtml}\n  </head>`)

  // Inject the rendered article into #root so crawlers see real content.
  // React's createRoot() replaces this for humans on mount.
  const article =
    `<main>\n<h1>${escapeHtml(f.title)}</h1>\n` +
    (f.description ? `<p>${escapeHtml(f.description)}</p>\n` : '') +
    `<article>${bodyHtml}</article>\n</main>`
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${article}</div>`
  )

  return html
}

// ── main ───────────────────────────────────────────────────────────────

const templatePath = join(distDir, 'index.html')
let template
try {
  template = readFileSync(templatePath, 'utf8')
} catch {
  console.error(
    `[prerender-guides] ${templatePath} not found — run \`vite build\` first.`
  )
  process.exit(1)
}

const files = readdirSync(guidesContentDir).filter((n) => n.endsWith('.md'))
let count = 0

for (const file of files) {
  const raw = readFileSync(join(guidesContentDir, file), 'utf8')
  const { attributes: f, body } = fm(raw)
  f.__body = body

  const isHub = f.type === 'hub'
  const slug = f.slug
  const fallbackCanonical = isHub
    ? 'https://nestyil.com/guides'
    : `https://nestyil.com/guides/${slug}`

  const outPath = isHub
    ? join(distDir, 'guides.html')
    : join(distDir, 'guides', `${slug}.html`)

  const page = buildPage(template, f, fallbackCanonical)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, page, 'utf8')
  count++
  console.log(
    `[prerender-guides] ${isHub ? '/guides' : `/guides/${slug}`} → ${outPath.replace(root + '/', '')}`
  )
}

console.log(`[prerender-guides] wrote ${count} static guide page(s).`)

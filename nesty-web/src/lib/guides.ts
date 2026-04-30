import fm from 'front-matter'

export interface GuideAuthor {
  name: string
  url?: string
}

export interface GuideFrontmatter {
  slug: string
  title: string
  metaTitle?: string
  metaDescription?: string
  description?: string
  keywords?: string[]
  order: number
  type?: string
  category?: string
  readingTime?: string
  language?: string
  canonical?: string
  ogImage?: string
  author?: GuideAuthor
  datePublished?: string
  dateModified?: string
  lastReviewed?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonLd?: Record<string, any>[]
}

export interface Guide {
  frontmatter: GuideFrontmatter
  body: string
}

const rawFiles = import.meta.glob('../content/guides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseGuide(raw: string): Guide {
  const parsed = fm<GuideFrontmatter>(raw)
  return {
    frontmatter: parsed.attributes,
    body: parsed.body,
  }
}

const allGuides: Guide[] = Object.values(rawFiles).map(parseGuide)

export const indexGuide: Guide | undefined = allGuides.find(
  (g) => g.frontmatter.type === 'hub'
)

export const guides: Guide[] = allGuides
  .filter((g) => g.frontmatter.type !== 'hub')
  .sort((a, b) => a.frontmatter.order - b.frontmatter.order)

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.frontmatter.slug === slug)
}

export function getAdjacentGuides(slug: string): {
  prev: Guide | undefined
  next: Guide | undefined
} {
  const idx = guides.findIndex((g) => g.frontmatter.slug === slug)
  if (idx === -1) return { prev: undefined, next: undefined }
  return {
    prev: idx > 0 ? guides[idx - 1] : undefined,
    next: idx < guides.length - 1 ? guides[idx + 1] : undefined,
  }
}

const EDITORIAL_MARKERS = ['ל־Tom', 'ל-Tom', 'הערות פנימיות']

/**
 * Strip blockquote blocks that contain editorial notes meant for the author,
 * not the public reader. Operates on the raw markdown string before render.
 * Handles both top-level (`> ...`) and indented (`  > ...`) blockquotes.
 *
 * Belt-and-suspenders: even if a stray editorial note slips into a future
 * markdown file, it never reaches the rendered page.
 */
export function stripEditorialNotes(markdown: string): string {
  const isQuoteLine = (line: string) => /^\s*>/.test(line)
  const lines = markdown.split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (isQuoteLine(line)) {
      let j = i
      const block: string[] = []
      while (j < lines.length && isQuoteLine(lines[j])) {
        block.push(lines[j])
        j++
      }
      const blockText = block.join('\n')
      const isEditorial = EDITORIAL_MARKERS.some((m) => blockText.includes(m))
      if (!isEditorial) {
        out.push(...block)
      } else if (out.length && out[out.length - 1] === '') {
        out.pop()
      }
      i = j
    } else {
      out.push(line)
      i++
    }
  }
  return out.join('\n')
}

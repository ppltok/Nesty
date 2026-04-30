import { useEffect } from 'react'
import type { GuideFrontmatter } from '../../lib/guides'

interface GuideSEOProps {
  frontmatter: GuideFrontmatter
  fallbackUrl: string
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  )
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Updates head metadata for a guide page. Uses imperative DOM updates so we
 * dedupe the static <meta>/<link> tags shipped in index.html instead of
 * appending duplicates. JSON-LD blocks are rendered inline since multiple
 * blocks are fine and React cleans them up between routes.
 */
export default function GuideSEO({ frontmatter, fallbackUrl }: GuideSEOProps) {
  const {
    metaTitle,
    title,
    metaDescription,
    description,
    keywords,
    canonical,
    ogImage,
    jsonLd,
  } = frontmatter

  const finalTitle = metaTitle || title
  const finalDescription = metaDescription || description || ''
  const finalCanonical = canonical || fallbackUrl
  const finalImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `https://nestyil.com${ogImage}`
    : undefined

  useEffect(() => {
    document.title = finalTitle
    if (finalDescription) setMeta('name', 'description', finalDescription)
    if (keywords?.length) setMeta('name', 'keywords', keywords.join(', '))
    setLink('canonical', finalCanonical)

    setMeta('property', 'og:title', finalTitle)
    if (finalDescription) setMeta('property', 'og:description', finalDescription)
    setMeta('property', 'og:type', 'article')
    setMeta('property', 'og:locale', 'he_IL')
    setMeta('property', 'og:url', finalCanonical)
    if (finalImage) setMeta('property', 'og:image', finalImage)

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', finalTitle)
    if (finalDescription) setMeta('name', 'twitter:description', finalDescription)
    if (finalImage) setMeta('name', 'twitter:image', finalImage)
  }, [
    finalTitle,
    finalDescription,
    finalCanonical,
    finalImage,
    keywords,
  ])

  return (
    <>
      {jsonLd?.map((block, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}

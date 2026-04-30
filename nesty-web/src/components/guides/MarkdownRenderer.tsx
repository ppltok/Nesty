import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { stripEditorialNotes } from '../../lib/guides'

interface MarkdownRendererProps {
  content: string
}

function rewriteHref(href: string | undefined): { to: string; external: boolean } {
  if (!href) return { to: '#', external: false }
  // ./slug.md → /guides/slug
  const match = href.match(/^\.\/([a-z0-9-]+)\.md$/i)
  if (match) {
    return { to: `/guides/${match[1]}`, external: false }
  }
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return { to: href, external: true }
  }
  return { to: href, external: false }
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const cleaned = stripEditorialNotes(content)

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-12 mb-4 leading-tight">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-bold text-foreground mt-14 mb-4 leading-snug relative ps-5 before:content-[''] before:absolute before:start-0 before:top-2 before:bottom-2 before:w-1.5 before:rounded-full before:bg-gradient-to-b before:from-primary before:via-accent-pink before:to-accent-pink-light">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl lg:text-2xl font-semibold text-foreground mt-8 mb-3 inline-flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-primary before:flex-shrink-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-base lg:text-lg leading-relaxed lg:leading-[1.75] text-foreground mb-4">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pe-6 mb-4 space-y-2 text-foreground lg:text-lg marker:text-primary">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pe-6 mb-4 space-y-2 text-foreground lg:text-lg marker:text-primary">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed lg:leading-[1.75]">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="bg-accent-peach/40 border-r-4 border-primary rounded-xl p-5 my-6 text-foreground">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => {
          const { to, external } = rewriteHref(href)
          if (external) {
            return (
              <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark underline underline-offset-2 font-medium"
              >
                {children}
              </a>
            )
          }
          return (
            <Link
              to={to}
              className="text-primary hover:text-primary-dark underline underline-offset-2 font-medium"
            >
              {children}
            </Link>
          )
        },
        code: ({ children }) => (
          <code className="bg-muted-light px-1.5 py-0.5 rounded font-mono text-sm">
            {children}
          </code>
        ),
        hr: () => (
          <div className="my-12 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
            <span className="text-2xl">🪺</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-border">
            <table className="w-full text-sm lg:text-base border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-accent-pink-light/40">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-start p-3 font-semibold text-foreground border-b border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="p-3 border-t border-border align-top text-foreground">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-foreground">{children}</strong>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt ?? ''}
            className="rounded-xl my-6 max-w-full"
          />
        ),
      }}
    >
      {cleaned}
    </ReactMarkdown>
  )
}

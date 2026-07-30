import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Calendar, Sparkles } from 'lucide-react'
import { asset } from '../lib/assets'
import { getGuideBySlug, getAdjacentGuides } from '../lib/guides'
import MarkdownRenderer from '../components/guides/MarkdownRenderer'
import GuideSEO from '../components/guides/GuideSEO'
import { getGuideTheme } from '../components/guides/guideTheme'

interface ParsedSections {
  tldr: string | null
  faq: { question: string; answer: string }[]
  bodyWithoutTldrAndFaq: string
}

/**
 * Pull out the "תשובה קצרה" TL;DR card and the FAQ accordion from the body
 * so we can render them in distinct visual containers. The remainder gets
 * piped through the prose renderer.
 */
function parseGuideBody(body: string): ParsedSections {
  let working = body

  // Extract TL;DR - H2 starting with "תשובה קצרה" up to next H2 or hr
  const tldrMatch = working.match(
    /## תשובה קצרה[^\n]*\n([\s\S]*?)(?=\n##\s|\n---\s*\n)/
  )
  let tldr: string | null = null
  if (tldrMatch) {
    tldr = tldrMatch[1].trim()
    working = working.replace(tldrMatch[0], '').trim()
  }

  // Extract FAQ - H2 containing "שאלות שכולן שואלות" up to next H2 or hr
  const faqMatch = working.match(
    /## שאלות שכולן שואלות[^\n]*\n([\s\S]*?)(?=\n##\s|\n---\s*\n)/
  )
  const faq: { question: string; answer: string }[] = []
  if (faqMatch) {
    const faqBody = faqMatch[1]
    const qaPattern = /### ([^\n]+)\n+([\s\S]*?)(?=\n### |\n*$)/g
    let m
    while ((m = qaPattern.exec(faqBody)) !== null) {
      faq.push({ question: m[1].trim(), answer: m[2].trim() })
    }
    working = working.replace(faqMatch[0], '').trim()
  }

  return { tldr, faq, bodyWithoutTldrAndFaq: working }
}

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/guides" replace />

  const guide = getGuideBySlug(slug)
  if (!guide) return <Navigate to="/guides" replace />

  const { frontmatter, body } = guide
  const { prev, next } = getAdjacentGuides(slug)
  const { tldr, faq, bodyWithoutTldrAndFaq } = parseGuideBody(body)

  // Strip the leading H1 from the body - we render the title in our own header
  const bodyWithoutTitle = bodyWithoutTldrAndFaq.replace(
    /^# [^\n]+\n+/,
    ''
  )

  // Strip the trailing italic "המדריך נכתב על ידי" line - already in our footer
  const bodyClean = bodyWithoutTitle.replace(
    /\n*\*המדריך נכתב על ידי[^\n]*\*\s*$/,
    ''
  )

  const formattedDate = frontmatter.lastReviewed || frontmatter.dateModified
  const theme = getGuideTheme(slug)

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <GuideSEO
        frontmatter={frontmatter}
        fallbackUrl={`https://nestyil.com/guides/${slug}`}
      />

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={asset('Nesty_logo.png')}
              alt="Nesty"
              className="h-10 w-auto"
            />
          </Link>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-dark transition-colors rounded-xl px-4 py-2 font-bold text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">התחילי רשימה</span>
          </Link>
        </div>
      </header>

      {/* Themed hero band */}
      <section
        className={`bg-gradient-to-bl ${theme.heroGradient} pt-6 pb-12 md:pb-16 relative overflow-hidden`}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute -top-20 -start-20 w-64 h-64 rounded-full bg-card/40 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -end-16 w-72 h-72 rounded-full bg-accent-pink/20 blur-3xl pointer-events-none"
        />

        <div className="max-w-4xl mx-auto px-6 relative">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-sm text-muted-foreground mb-8 flex items-center gap-2 flex-wrap"
          >
            <Link to="/" className="hover:text-primary">
              בית
            </Link>
            <span>›</span>
            <Link to="/guides" className="hover:text-primary">
              מדריכים
            </Link>
            <span>›</span>
            <span className="text-foreground line-clamp-1">
              {frontmatter.title}
            </span>
          </nav>

          <header>
            <span className="inline-block bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-xs font-semibold text-primary-dark mb-4">
              {theme.topicLabel}
            </span>

            {/* Hero photo - Hebrew headline is burned into the image */}
            <img
              src={asset(`guides/${slug}.png`)}
              alt={frontmatter.title}
              className="w-full h-auto rounded-3xl shadow-lg shadow-primary/10 mb-6"
              loading="eager"
              fetchPriority="high"
            />

            {/* H1 kept for SEO + accessibility (visible because we still want a real heading on the page) */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {frontmatter.title}
            </h1>
            {frontmatter.description && (
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-5">
                {frontmatter.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {frontmatter.readingTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {frontmatter.readingTime}
                </span>
              )}
              {formattedDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  עודכן {formattedDate}
                </span>
              )}
              {frontmatter.author?.name && (
                <span>מאת {frontmatter.author.name}</span>
              )}
            </div>
          </header>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-20 pt-8">

        {/* TL;DR card */}
        {tldr && (
          <aside className="bg-accent-pink-light/60 rounded-2xl p-6 lg:p-8 border-r-4 border-primary mb-10">
            <div className="text-sm font-bold text-primary-dark mb-2">
              תשובה קצרה ⏱️
            </div>
            <div className="text-foreground leading-relaxed lg:text-lg">
              <MarkdownRenderer content={tldr} />
            </div>
          </aside>
        )}

        {/* Prose body */}
        <article className="prose-nesty">
          <MarkdownRenderer content={bodyClean} />
        </article>

        {/* FAQ accordion */}
        {faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              שאלות שכולן שואלות
            </h2>
            <div className="space-y-3">
              {faq.map((qa, idx) => (
                <details
                  key={idx}
                  className="group bg-card border border-border rounded-xl overflow-hidden"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4 font-semibold text-foreground hover:bg-accent-pink-light/30">
                    <span>{qa.question}</span>
                    <span className="flex-shrink-0 text-primary text-xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-foreground border-t border-border">
                    <MarkdownRenderer content={qa.answer} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CTA band */}
        <section className="mt-14 bg-primary rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            רוצה ליישם את זה ברשימה שלך?
          </h2>
          <p className="text-primary-foreground/85 mb-6 max-w-xl mx-auto leading-relaxed">
            פתחי רשימה אחת לכל החנויות, חינם. שלוש דקות וזה למעלה.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 bg-card text-primary hover:bg-accent-pink-light transition-colors rounded-xl px-6 py-3 font-bold"
          >
            <Sparkles className="w-5 h-5" />
            פתחי רשימה ב־Nesty
          </Link>
        </section>

        {/* Prev/Next nav */}
        {(prev || next) && (
          <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            {prev ? (
              <Link
                to={`/guides/${prev.frontmatter.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-3"
              >
                <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    הקודם
                  </div>
                  <div className="font-bold text-foreground group-hover:text-primary">
                    {prev.frontmatter.title}
                  </div>
                </div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/guides/${next.frontmatter.slug}`}
                className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-3 md:text-end md:flex-row-reverse"
              >
                <ArrowLeft className="w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    הבא בתור
                  </div>
                  <div className="font-bold text-foreground group-hover:text-primary">
                    {next.frontmatter.title}
                  </div>
                </div>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        {/* Back to hub */}
        <div className="mt-10 text-center">
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לכל המדריכים
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
          <span>© Nesty · בונים קן, לא מחסן 🪺</span>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-primary">
              דף הבית
            </Link>
            <Link to="/privacy" className="hover:text-primary">
              פרטיות
            </Link>
            <Link to="/accessibility" className="hover:text-primary">
              נגישות
            </Link>
            <Link to="/terms" className="hover:text-primary">
              תנאי שימוש
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

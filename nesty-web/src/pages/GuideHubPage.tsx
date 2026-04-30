import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { asset } from '../lib/assets'
import { guides, indexGuide } from '../lib/guides'
import MarkdownRenderer from '../components/guides/MarkdownRenderer'
import GuideSEO from '../components/guides/GuideSEO'

interface CategoryGroup {
  id: string
  title: string
  slugs: string[]
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'basics',
    title: 'יסודות',
    slugs: ['how-to-build-a-registry', 'registry-must-haves'],
  },
  {
    id: 'essentials',
    title: 'כמויות וצרכים מעשיים',
    slugs: ['how-many-baby-clothes', 'how-many-diapers'],
  },
  {
    id: 'timing',
    title: 'תזמון ותכנון',
    slugs: ['when-to-start-registry', 'registry-by-trimester'],
  },
  {
    id: 'scenarios',
    title: 'תרחישים מיוחדים',
    slugs: ['second-baby-registry', 'multi-store-registry'],
  },
]

/**
 * Slice the index.md body to render only the editorial sections we want
 * (we render the categorized cards ourselves above).
 * Keeps from "## למה Nesty שונה" through end of FAQ, drops the duplicate
 * "## רשימת מדריכים מלאה" table at the bottom.
 */
function extractEditorialBody(body: string): string {
  const startMarker = '## למה Nesty שונה'
  const endMarker = '## רשימת מדריכים מלאה'
  const start = body.indexOf(startMarker)
  if (start === -1) return body
  const end = body.indexOf(endMarker, start)
  return end === -1 ? body.slice(start) : body.slice(start, end)
}

export default function GuideHubPage() {
  if (!indexGuide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">לא נמצאו מדריכים</p>
      </div>
    )
  }

  const { frontmatter, body } = indexGuide
  const editorialBody = extractEditorialBody(body)

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <GuideSEO
        frontmatter={frontmatter}
        fallbackUrl="https://nestyil.com/guides"
      />

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={asset('Nesty_logo.png')}
              alt="Nesty"
              className="h-10 w-auto"
            />
          </Link>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary-dark transition-colors rounded-xl px-5 py-2.5 font-bold text-sm md:text-base"
          >
            <Sparkles className="w-4 h-4" />
            <span>התחילי רשימה — חינם</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-accent-pink-light/60 via-accent-peach/30 to-background pt-12 pb-20 md:pt-20 md:pb-28">
        <div
          aria-hidden
          className="absolute -top-32 -end-20 w-96 h-96 rounded-full bg-card/40 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -start-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />

        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-[1fr,auto] items-center gap-10 relative">
          <div className="text-center md:text-start">
            <span className="inline-block bg-card border border-border rounded-full px-4 py-1.5 text-sm font-semibold text-primary-dark mb-5">
              🪺 מדריכי Nesty
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-5">
              {frontmatter.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {frontmatter.description}
            </p>
          </div>
          <div className="hidden md:block">
            <img
              src={asset('hero_illustraion.png')}
              alt=""
              className="w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-xl"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Categorized guide cards */}
      <section className="max-w-5xl mx-auto px-6 -mt-6 md:-mt-10">
        <div className="space-y-12">
          {CATEGORY_GROUPS.map((group) => {
            const groupGuides = group.slugs
              .map((slug) => guides.find((g) => g.frontmatter.slug === slug))
              .filter((g): g is NonNullable<typeof g> => Boolean(g))
            if (groupGuides.length === 0) return null
            return (
              <div key={group.id}>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {group.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupGuides.map((guide) => (
                    <Link
                      key={guide.frontmatter.slug}
                      to={`/guides/${guide.frontmatter.slug}`}
                      className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={asset(`guides/${guide.frontmatter.slug}.png`)}
                          alt={guide.frontmatter.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {guide.frontmatter.title}
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 flex-1">
                          {guide.frontmatter.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          {guide.frontmatter.readingTime && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {guide.frontmatter.readingTime}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                            קראי
                            <ArrowLeft className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA band */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            מוכנה להתחיל את הרשימה שלך?
          </h2>
          <p className="text-primary-foreground/85 text-base md:text-lg mb-6 max-w-xl mx-auto leading-relaxed">
            רשימה אחת מכל החנויות בעולם, חינם. בלי לחץ ובלי הפתעות.
          </p>
          <Link
            to="/auth/signup"
            className="inline-flex items-center gap-2 bg-card text-primary hover:bg-accent-pink-light transition-colors rounded-xl px-6 py-3 font-bold"
          >
            <Sparkles className="w-5 h-5" />
            פתחי רשימה ב־Nesty
          </Link>
        </div>
      </section>

      {/* Editorial body — "למה Nesty שונה" + FAQ */}
      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <article className="prose-nesty">
          <MarkdownRenderer content={editorialBody} />
        </article>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
          <span>© Nesty · בונים קן, לא מחסן 🪺</span>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-primary">
              דף הבית
            </Link>
            <Link to="/privacy" className="hover:text-primary">
              פרטיות
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

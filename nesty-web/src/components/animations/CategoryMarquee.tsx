import { CATEGORIES } from '../../data/categories'
import { categoryGradient } from '../../lib/categoryColors'

/**
 * Narrow horizontal divider that scrolls every checklist category (icon + name)
 * across the page. Pure CSS animation - no JS, no observer overhead.
 *
 * Placed between sections to act as a soft, on-brand visual break that also
 * communicates the breadth of the checklist at a glance.
 */
// Repeat the categories twice within a single half so each half is well
// wider than any common viewport (~2400px → ~4800px per half). Without this,
// translating -50% can briefly reveal a gap between halves on wide screens.
const CATS_PER_HALF = (() => {
  const filtered = CATEGORIES.filter((c) => c.id !== 'general')
  return [...filtered, ...filtered]
})()

function CategoryRow({ aria }: { aria?: 'hide' }) {
  return (
    <div
      aria-hidden={aria === 'hide' ? 'true' : undefined}
      className="flex shrink-0 gap-10 md:gap-14 pe-10 md:pe-14"
    >
      {CATS_PER_HALF.map((cat, i) => {
        const Icon = cat.icon
        return (
          <div key={`${cat.id}-${i}`} className="flex items-center gap-3 flex-shrink-0">
            <div
              style={categoryGradient(cat.id)}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl shadow-sm flex items-center justify-center text-white"
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-base md:text-lg font-medium text-[#1d192b]">
              {cat.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function CategoryMarquee() {
  return (
    <div
      dir="ltr"
      aria-hidden="true"
      className="relative bg-gradient-to-l from-[#f3edff] via-[#fffbff] to-[#ffd8e4]/40 border-y border-[#eaddff]/60 overflow-hidden py-5"
    >
      {/* Edge fades so the strip dissolves at the sides */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[#fffbff] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[#fffbff] to-transparent z-10" />

      {/*
        Two identical halves with trailing padding equal to the gap, so total
        width is exactly 2× one half. Translating -50% lands precisely on the
        duplicate's first item - no visible seam.
      */}
      {/* dir="ltr" so flex lays children left→right; translateX(-50%) then
          scrolls them leftward (which still matches Hebrew reading direction
          visually). Without this override, RTL flex puts the rows on the
          left side of the wide container and translateX moves them off-screen. */}
      <div dir="ltr" className="flex nesty-marquee whitespace-nowrap w-max">
        <CategoryRow />
        <CategoryRow aria="hide" />
      </div>
    </div>
  )
}

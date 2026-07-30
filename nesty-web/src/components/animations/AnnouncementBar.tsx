import { Clock, PiggyBank, Heart, Sparkles } from 'lucide-react'

const items = [
  { icon: Clock, text: 'חוסכת זמן' },
  { icon: PiggyBank, text: 'חוסכת כסף' },
  { icon: Heart, text: 'חוסכת מבוכה' },
  { icon: Sparkles, text: 'בחינם' },
]

/**
 * Sticky lavender announcement bar with endlessly-scrolling value props.
 * Pure CSS marquee - duplicates the list once and translates -50% in a loop
 * so the seam is invisible.
 */
// Repeat the small set of items enough times that one "half" is comfortably
// wider than even an ultra-wide viewport (2560px). Without this, when the
// strip translates -50% there's blank space between halves.
const ITEMS_PER_HALF = Array.from({ length: 8 }).flatMap(() => items)

function ItemRow({ aria }: { aria?: 'hide' }) {
  return (
    <div
      aria-hidden={aria === 'hide' ? 'true' : undefined}
      className="flex shrink-0 gap-6 sm:gap-10 pe-6 sm:pe-10"
    >
      {ITEMS_PER_HALF.map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{text}</span>
          <span className="opacity-40">·</span>
        </div>
      ))}
    </div>
  )
}

export default function AnnouncementBar() {
  return (
    <div
      dir="ltr"
      role="region"
      aria-label="הצעת ערך"
      className="bg-gradient-to-l from-[#6750a4] via-[#5a4690] to-[#6750a4] text-white text-xs sm:text-sm font-medium overflow-hidden"
    >
      <div className="relative py-1.5 sm:py-2">
        {/* Edge fades - sides dissolve into the lavender so the loop seam never shows */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#6750a4] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#6750a4] to-transparent z-10" />

        {/*
          Two identical halves with trailing padding equal to the gap, so total
          width is exactly 2× one half. Translating -50% on the outer wrapper
          lands precisely on the duplicate's first item - no visible seam.
        */}
        {/* dir="ltr" forces left→right flex layout so the strip starts at
            x=0; translateX(-50%) then scrolls it leftward, matching Hebrew
            reading flow visually. */}
        <div dir="ltr" className="flex nesty-marquee nesty-marquee--fast whitespace-nowrap w-max">
          <ItemRow />
          <ItemRow aria="hide" />
        </div>
      </div>
    </div>
  )
}

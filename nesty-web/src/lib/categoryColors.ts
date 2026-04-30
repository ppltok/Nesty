/**
 * Curated on-brand color palette per checklist category.
 *
 * The raw `color` field on each CATEGORIES entry is mostly variations of
 * lavender (#86608e) and renders as one tone in small UI elements. This
 * map distributes the brand spectrum (lavender / dusty rose / peach / sage
 * / amber / safety green) so categories scan as variety wherever we render
 * them — the home-page marquee, the onboarding first-item step, and any
 * future surface that needs distinct category colors.
 *
 * All values stay inside the brand kit's allowed colors.
 */
const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  strollers:  ['#86608e', '#6d4e74'], // primary lavender
  car_safety: ['#5a4690', '#4a3675'], // deep lavender
  furniture:  ['#a891ad', '#917a96'], // soft lavender
  safety:     ['#22c55e', '#16a34a'], // success green (safety vibe)
  feeding:    ['#f4acb7', '#e89aa6'], // dusty rose
  nursing:    ['#ffcad4', '#f4acb7'], // soft rose
  bath:       ['#7dd3c0', '#5fb8a3'], // sage / mint
  clothing:   ['#ffd8d7', '#f4b5b3'], // peach
  bedding:    ['#c9c2cb', '#a891ad'], // muted lavender
  toys:       ['#fbbf24', '#f59e0b'], // warm amber
  birth_prep: ['#86608e', '#5a4690'], // primary
  siblings:   ['#a891ad', '#7a5582'], // dual-tone
}

const FALLBACK: [string, string] = ['#a891ad', '#86608e']

/**
 * Return an inline `style` object with a 135° linear gradient for the given
 * category id. Tailwind JIT can't see dynamic class names, so we render
 * gradients via inline style.
 */
export function categoryGradient(catId: string): React.CSSProperties {
  const [from, to] = CATEGORY_GRADIENT[catId] ?? FALLBACK
  return { backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }
}

/**
 * Return the hex color pair for a category, useful when you need to drive
 * other styling (text color, ring, etc) off the same palette.
 */
export function categoryColors(catId: string): [string, string] {
  return CATEGORY_GRADIENT[catId] ?? FALLBACK
}

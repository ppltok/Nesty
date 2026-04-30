import {
  ListChecks,
  Package,
  Shirt,
  Baby,
  Calendar,
  CalendarDays,
  Heart,
  Store,
  type LucideIcon,
} from 'lucide-react'

export interface GuideTheme {
  Icon: LucideIcon
  /** Tailwind background gradient classes for the hero band */
  heroGradient: string
  /** Tailwind classes for the icon medallion (bg + text) */
  medallion: string
  /** Soft accent label for the topic strip */
  topicLabel: string
}

const DEFAULT_THEME: GuideTheme = {
  Icon: Baby,
  heroGradient: 'from-accent-pink-light/60 via-accent-peach/30 to-background',
  medallion: 'bg-primary text-primary-foreground',
  topicLabel: 'מדריך',
}

const THEMES: Record<string, GuideTheme> = {
  'how-to-build-a-registry': {
    Icon: ListChecks,
    heroGradient: 'from-accent-pink-light/60 via-accent-peach/30 to-background',
    medallion: 'bg-primary text-primary-foreground',
    topicLabel: 'יסודות',
  },
  'registry-must-haves': {
    Icon: Package,
    heroGradient: 'from-accent-peach/60 via-accent-pink-light/30 to-background',
    medallion: 'bg-primary text-primary-foreground',
    topicLabel: 'יסודות',
  },
  'how-many-baby-clothes': {
    Icon: Shirt,
    heroGradient: 'from-secondary-light/40 via-accent-pink-light/30 to-background',
    medallion: 'bg-secondary text-foreground',
    topicLabel: 'כמויות',
  },
  'how-many-diapers': {
    Icon: Baby,
    heroGradient: 'from-accent-pink-light/60 via-accent-peach/40 to-background',
    medallion: 'bg-accent-pink text-foreground',
    topicLabel: 'כמויות',
  },
  'when-to-start-registry': {
    Icon: Calendar,
    heroGradient: 'from-secondary-light/50 via-accent-pink-light/30 to-background',
    medallion: 'bg-primary text-primary-foreground',
    topicLabel: 'תזמון',
  },
  'registry-by-trimester': {
    Icon: CalendarDays,
    heroGradient: 'from-accent-peach/50 via-secondary-light/30 to-background',
    medallion: 'bg-primary-dark text-primary-foreground',
    topicLabel: 'תזמון',
  },
  'second-baby-registry': {
    Icon: Heart,
    heroGradient: 'from-accent-pink-light/70 via-accent-peach/30 to-background',
    medallion: 'bg-accent-pink text-foreground',
    topicLabel: 'תרחישים',
  },
  'multi-store-registry': {
    Icon: Store,
    heroGradient: 'from-secondary-light/50 via-accent-peach/30 to-background',
    medallion: 'bg-primary text-primary-foreground',
    topicLabel: 'תרחישים',
  },
}

export function getGuideTheme(slug: string): GuideTheme {
  return THEMES[slug] ?? DEFAULT_THEME
}

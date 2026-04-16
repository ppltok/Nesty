// Shared pregnancy-week math used by email cron functions.
// Previously duplicated in send-weekly-emails/index.ts and send-welcome-batch/index.ts.

/**
 * Calculate the user's current pregnancy week from a due date.
 *
 * Returns weeks 1-40 during pregnancy. Returns > 40 if the due date has passed
 * (interpret as postpartum weeks: 41 = 1 week postpartum, 42 = 2, etc).
 *
 * The math: pregnancy is conventionally 40 weeks from LMP; due date is week 40.
 * So current week = 40 - (weeks remaining until due date).
 */
export function calculatePregnancyWeek(dueDate: Date): number {
  const now = new Date()
  const diffMs = dueDate.getTime() - now.getTime()
  const weeksRemaining = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))
  return 40 - weeksRemaining
}

/**
 * Classify a pregnancy week into a nudge-variant tone band.
 * Different nudge types use different bands; callers pass their own map.
 */
export function weekBand<T>(
  week: number,
  bands: Array<{ min: number; max: number; variant: T }>,
  fallback: T,
): T {
  for (const b of bands) {
    if (week >= b.min && week <= b.max) return b.variant
  }
  return fallback
}

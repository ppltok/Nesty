// Helpers for the nudge_log table.
// Enforces the anti-spam rules documented in the Engagement-Retention plan:
//   - minimum spacing between repeats of the same nudge type
//   - maximum total sends of the same nudge type
//   - treats 'grandfather' entries like real sends (so rollout doesn't spam)
//
// Callers are edge functions using the Supabase service-role client; they
// bypass RLS so we do not filter on auth.uid().
//
// We type the client as `any` to stay compatible with whichever major
// version each edge function imports of @supabase/supabase-js — the calls
// here only use the public surface (.from / .select / .insert / .eq).

// deno-lint-ignore no-explicit-any
type SupabaseClient = any

export type NudgeVariant = 'gentle' | 'practical' | 'urgent' | 'final' | 'grandfather'

export interface NudgeGuardOptions {
  /** Minimum days since last send of this nudge_type. Default: 14. */
  minSpacingDays?: number
  /** Maximum total sends of this nudge_type per user (including grandfather rows). Default: 3. */
  maxSends?: number
}

/**
 * Check whether a nudge of a given type can be sent to a user.
 * Returns true only if BOTH the spacing and max-sends rules pass.
 */
export async function canSendNudge(
  client: SupabaseClient,
  userId: string,
  nudgeType: string,
  options: NudgeGuardOptions = {},
): Promise<boolean> {
  const minSpacingDays = options.minSpacingDays ?? 14
  const maxSends = options.maxSends ?? 3

  const { data, error } = await client
    .from('nudge_log')
    .select('sent_at, variant')
    .eq('user_id', userId)
    .eq('nudge_type', nudgeType)
    .order('sent_at', { ascending: false })

  if (error) {
    console.error(`[nudge-log] Query error for user=${userId} type=${nudgeType}:`, error)
    // Fail closed: if we can't verify, don't send. Better to miss one nudge
    // than to spam someone.
    return false
  }

  const rows = data ?? []
  if (rows.length >= maxSends) return false

  if (rows.length > 0) {
    const lastSentAt = new Date(rows[0].sent_at as string).getTime()
    const spacingMs = minSpacingDays * 24 * 60 * 60 * 1000
    if (Date.now() - lastSentAt < spacingMs) return false
  }

  return true
}

/**
 * Record that a nudge was just sent. Idempotency is not enforced here —
 * callers must check canSendNudge() first. We insert a fresh row each time
 * so repeats can be analyzed (e.g. which week+variant converts).
 */
export async function logNudge(
  client: SupabaseClient,
  userId: string,
  nudgeType: string,
  variant: NudgeVariant,
  pregnancyWeek: number | null,
): Promise<void> {
  const { error } = await client.from('nudge_log').insert({
    user_id: userId,
    nudge_type: nudgeType,
    variant,
    pregnancy_week: pregnancyWeek,
  })
  if (error) {
    // Log but don't throw — the email was already sent. Missing the log row
    // will occasionally allow a duplicate within spacing window, which is
    // acceptable; throwing here would break the send loop for other users.
    console.error(`[nudge-log] Failed to log send for user=${userId} type=${nudgeType}:`, error)
  }
}

/**
 * Count prior sends of a nudge type (useful for picking the next variant).
 * Counts grandfather rows too — a grandfathered user who qualifies for a
 * real send will see their first real send treated as "send #2" which is
 * fine; the variant escalation is driven by pregnancy week, not count.
 */
export async function nudgeSendCount(
  client: SupabaseClient,
  userId: string,
  nudgeType: string,
): Promise<number> {
  const { count, error } = await client
    .from('nudge_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('nudge_type', nudgeType)

  if (error) {
    console.error(`[nudge-log] Count error for user=${userId} type=${nudgeType}:`, error)
    return Number.MAX_SAFE_INTEGER // fail closed: treat as "lots of sends"
  }
  return count ?? 0
}

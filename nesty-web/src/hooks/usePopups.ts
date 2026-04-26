// Unified popup/toast state — sourced from profiles (dismissed_popups JSONB
// + last_milestone_shown INT) so a user logging in on a new device doesn't
// re-see notifications. No localStorage for dedup.
//
// Exports three helpers used by the popup components and Dashboard:
//   - usePopupState: reads current dismissed flags + milestone counter
//   - dismissPopup(key): persists `{ [key]: true }` into dismissed_popups
//   - advanceMilestone(n): monotonically updates last_milestone_shown

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type PopupKey =
  | 'post_onboarding'
  | 'share_prompt_5'
  | 'partner_invite_card'
  | 'extension_banner'
  | 'checkout_registry_5'
  | 'share_prompt_checklist_60'

export interface PopupState {
  dismissed: Record<string, boolean>
  lastMilestoneShown: number
  loaded: boolean
}

const EMPTY: PopupState = { dismissed: {}, lastMilestoneShown: 0, loaded: false }

export function usePopupState(userId: string | undefined): PopupState {
  const [state, setState] = useState<PopupState>(EMPTY)

  useEffect(() => {
    if (!userId) {
      setState(EMPTY)
      return
    }
    let cancelled = false
    void (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('dismissed_popups, last_milestone_shown')
        .eq('id', userId)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        // Columns may not exist yet in local dev without the migration.
        // Treat as empty state — nothing dismissed, milestone 0.
        setState({ dismissed: {}, lastMilestoneShown: 0, loaded: true })
        return
      }
      setState({
        dismissed: (data.dismissed_popups as Record<string, boolean> | null) ?? {},
        lastMilestoneShown: (data.last_milestone_shown as number | null) ?? 0,
        loaded: true,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  return state
}

export async function dismissPopup(userId: string, key: PopupKey): Promise<void> {
  // Read-modify-write the JSONB so we don't clobber other keys. This is a
  // single-user flow so the race window is negligible.
  const { data } = await supabase
    .from('profiles')
    .select('dismissed_popups')
    .eq('id', userId)
    .maybeSingle()
  const current = (data?.dismissed_popups as Record<string, boolean> | null) ?? {}
  const next = { ...current, [key]: true }
  const { error } = await supabase
    .from('profiles')
    .update({ dismissed_popups: next })
    .eq('id', userId)
  if (error) {
    // If the column doesn't exist yet (migration not applied), swallow the
    // error — the popup has already been hidden in-memory for this session.
    console.warn(`[usePopups] dismissPopup(${key}) failed:`, error.message)
  }
}

export async function advanceMilestone(userId: string, milestone: number): Promise<void> {
  // Fetch current value and only update if strictly greater. Monotonic
  // guarantee matters: a user at milestone 10 who deletes items back to 4
  // must not see the "5" toast again when they re-add.
  const { data } = await supabase
    .from('profiles')
    .select('last_milestone_shown')
    .eq('id', userId)
    .maybeSingle()
  const current = (data?.last_milestone_shown as number | null) ?? 0
  if (milestone <= current) return
  const { error } = await supabase
    .from('profiles')
    .update({ last_milestone_shown: milestone })
    .eq('id', userId)
  if (error) {
    console.warn(`[usePopups] advanceMilestone(${milestone}) failed:`, error.message)
  }
}

/** Map an item-count change to the highest milestone crossed (0, 1, 5, or 10). */
export function milestoneForCount(count: number): number {
  if (count >= 10) return 10
  if (count >= 5) return 5
  if (count >= 1) return 1
  return 0
}

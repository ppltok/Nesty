-- Engagement & Retention Round 1
--
-- Adds:
--   1. nudge_log table — flexible per-send log for repeatable nudges
--      (replaces the single-timestamp model of *_nudge_sent_at columns
--      for new nudge types: first_item, registry_stalled).
--   2. profiles.dismissed_popups JSONB — stores which in-app popups a
--      user has seen/dismissed (post_onboarding wizard, share_prompt_5).
--   3. profiles.last_milestone_shown INT — monotonic counter for item-count
--      milestone toasts (1, 5, 10). Guarantees no user sees an older
--      milestone than one they already passed.
--
-- Grandfathering (critical for user-first anti-spam):
--   - Existing users past a milestone never see retroactive toasts.
--   - Existing users with items don't see the post-onboarding wizard.
--   - Existing users with 5+ items don't see the share prompt.
--   - Synthetic "already sent" nudge_log rows prevent retroactive nudge
--     emails (new nudges naturally fire 14+ days after rollout IF the
--     user still qualifies — existing active users won't qualify).
--
-- The item-count aggregation walks items → registries → owner_id.
-- Co-parent (partner) registries are attributed to the OWNER only —
-- the partner's own profile is counted separately (they have no
-- owner-registry unless they also created one).

BEGIN;

-- ─── 1. nudge_log table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nudge_type TEXT NOT NULL,
  variant TEXT,
  pregnancy_week INT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nudge_log_user_type_sent
  ON nudge_log(user_id, nudge_type, sent_at DESC);

ALTER TABLE nudge_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own nudge log" ON nudge_log;
CREATE POLICY "Users read own nudge log"
  ON nudge_log FOR SELECT
  USING (auth.uid() = user_id);

-- Edge functions use the service role which bypasses RLS; no INSERT
-- policy needed for clients because only the server writes here.

COMMENT ON TABLE nudge_log IS 'Per-send log of nudge emails. Replaces single-timestamp *_nudge_sent_at columns for repeatable nudges.';

-- ─── 2. profiles columns ─────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS dismissed_popups JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_milestone_shown INTEGER DEFAULT 0;

COMMENT ON COLUMN profiles.dismissed_popups IS 'Map of popup_key → true for popups the user has seen/dismissed. Keys: post_onboarding, share_prompt_5, partner_invite_card, extension_banner.';
COMMENT ON COLUMN profiles.last_milestone_shown IS 'Highest milestone (1, 5, 10) for which an in-app toast has been shown. Monotonic — only ever increases.';

-- ─── 3. Grandfathering ───────────────────────────────────────

-- 3a. Backfill last_milestone_shown from each user's current highest milestone.
-- Owner's item count across all their registries.
UPDATE profiles p
SET last_milestone_shown = sub.milestone
FROM (
  SELECT
    r.owner_id AS user_id,
    CASE
      WHEN COUNT(i.id) >= 10 THEN 10
      WHEN COUNT(i.id) >= 5 THEN 5
      WHEN COUNT(i.id) >= 1 THEN 1
      ELSE 0
    END AS milestone
  FROM registries r
  LEFT JOIN items i ON i.registry_id = r.id
  GROUP BY r.owner_id
) sub
WHERE p.id = sub.user_id
  AND p.last_milestone_shown = 0;

-- 3b. Backfill dismissed_popups.share_prompt_5 for users with 5+ items.
UPDATE profiles p
SET dismissed_popups = COALESCE(dismissed_popups, '{}'::jsonb)
                       || jsonb_build_object('share_prompt_5', true)
WHERE EXISTS (
  SELECT 1
  FROM registries r
  JOIN items i ON i.registry_id = r.id
  WHERE r.owner_id = p.id
  GROUP BY r.id
  HAVING COUNT(i.id) >= 5
);

-- 3c. Backfill dismissed_popups.post_onboarding for any user who already
-- has items — they've clearly moved past the wizard stage.
UPDATE profiles p
SET dismissed_popups = COALESCE(dismissed_popups, '{}'::jsonb)
                       || jsonb_build_object('post_onboarding', true)
WHERE EXISTS (
  SELECT 1
  FROM registries r
  JOIN items i ON i.registry_id = r.id
  WHERE r.owner_id = p.id
);

-- 3d. Synthetic "already sent" nudge_log entries for new nudge types.
-- The send-nudge-emails function checks "last send of this type >= 14
-- days ago" — these stamps prevent retroactive sends on day one for
-- anyone who already completed onboarding. Users who genuinely qualify
-- (0 items, still in week range) will naturally re-qualify after 14 days.
INSERT INTO nudge_log (user_id, nudge_type, variant, sent_at)
SELECT id, 'first_item', 'grandfather', NOW()
FROM profiles
WHERE onboarding_completed = true;

INSERT INTO nudge_log (user_id, nudge_type, variant, sent_at)
SELECT id, 'registry_stalled', 'grandfather', NOW()
FROM profiles
WHERE onboarding_completed = true;

COMMIT;


-- ─── Post-migration sanity checks (run manually) ─────────────
--
-- Should list both new columns:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'profiles'
--     AND column_name IN ('dismissed_popups', 'last_milestone_shown');
--
-- Grandfather nudge_log distribution:
-- SELECT nudge_type, variant, COUNT(*) FROM nudge_log GROUP BY 1, 2;
--
-- Milestone distribution:
-- SELECT last_milestone_shown, COUNT(*) FROM profiles GROUP BY 1 ORDER BY 1;

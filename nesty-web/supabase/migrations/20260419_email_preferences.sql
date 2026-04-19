-- Email preferences — granular per-category toggles
--
-- Adds four new BOOLEAN columns to `profiles` so users can control which
-- kinds of marketing emails they receive. All default to TRUE so existing
-- users keep getting everything they were already receiving (no rollout
-- spam, no retroactive opt-outs).
--
-- The existing `marketing_emails` column stays as a master kill-switch:
-- each email-sending function now filters on BOTH the master AND the
-- category-specific column. Flipping `marketing_emails=false` disables
-- everything in one click without touching the per-category state, so
-- turning it back on restores the user's previous category preferences.
--
-- Category columns and the edge functions they govern:
--   email_weekly_pregnancy      → send-weekly-emails
--   email_engagement_reminders  → send-nudge-emails (all 4 nudge types)
--   email_feature_announcements → send-feature-drop
--   email_price_alerts          → send-email (type='price_drop')
--
-- Purchase confirmations, thank-you notes, and co-parent invitations are
-- transactional (user-initiated) and not governed by these columns.

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_weekly_pregnancy      BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_engagement_reminders  BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_feature_announcements BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_price_alerts          BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.email_weekly_pregnancy IS
  'Receive the weekly pregnancy content email (weeks 12-40 + postpartum). Subordinate to marketing_emails.';
COMMENT ON COLUMN profiles.email_engagement_reminders IS
  'Receive engagement nudges (checklist, share, first_item, registry_stalled). Subordinate to marketing_emails.';
COMMENT ON COLUMN profiles.email_feature_announcements IS
  'Receive feature drops and promotional content. Subordinate to marketing_emails.';
COMMENT ON COLUMN profiles.email_price_alerts IS
  'Receive per-item price drop alerts for items in the users registry. Subordinate to marketing_emails.';

COMMIT;


-- ─── Post-migration sanity checks (run manually) ──────
--
-- Columns exist:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'profiles'
--     AND column_name IN ('email_weekly_pregnancy', 'email_engagement_reminders',
--                         'email_feature_announcements', 'email_price_alerts');
--
-- All defaults applied:
-- SELECT
--   SUM(CASE WHEN email_weekly_pregnancy      THEN 1 ELSE 0 END) AS weekly_on,
--   SUM(CASE WHEN email_engagement_reminders  THEN 1 ELSE 0 END) AS reminders_on,
--   SUM(CASE WHEN email_feature_announcements THEN 1 ELSE 0 END) AS features_on,
--   SUM(CASE WHEN email_price_alerts          THEN 1 ELSE 0 END) AS prices_on,
--   COUNT(*) AS total
-- FROM profiles;
-- Expect all four on-counts to equal total.

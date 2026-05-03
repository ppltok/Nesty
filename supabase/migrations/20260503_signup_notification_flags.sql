-- 20260503: Dedupe flags for the new admin signup-notification flow.
--
-- Replaces the AuthCallback-fired admin_new_user (which fired before any
-- onboarding data was collected) with two richer signals:
--   * admin_onboarding_completed — fired from onboarding completion, with
--     name / due date / week / referral source / first item / skipped steps.
--   * admin_onboarding_abandoned — fired by a pg_cron-driven edge function
--     ~10 min after signup if the user never finished onboarding.
--
-- Both signals can fire for the same user (abandon at 10min, completed
-- later if they return).  These columns prevent duplicate sends.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS admin_abandon_notified_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_completed_notified_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.admin_abandon_notified_at IS
  'Timestamp the admin_onboarding_abandoned email was sent to hello@nestyil.com. NULL = not yet sent.';
COMMENT ON COLUMN profiles.admin_completed_notified_at IS
  'Timestamp the admin_onboarding_completed email was sent to hello@nestyil.com. NULL = not yet sent.';

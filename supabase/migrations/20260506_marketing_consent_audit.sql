-- 20260506: Marketing-consent audit trail.
--
-- Israeli spam law (חוק התקשורת תיקון 40, סעיף 30א) requires we be able to
-- prove WHEN a user gave affirmative consent to receive פרסומת. Today we
-- only store the boolean — if a user disputes the opt-in, we have no
-- timestamp to defend against. Adding two columns:
--   * marketing_emails_consented_at — set whenever marketing_emails flips
--     true (initial onboarding accept, or re-enable from /settings/emails)
--   * marketing_emails_unsubscribed_at — set whenever marketing_emails
--     flips false (one-click unsub, settings toggle, or admin opt-out)
-- Either column being non-null is the proof for legal disputes; both being
-- present means the user has opted in and out at different times (the more
-- recent timestamp wins).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS marketing_emails_consented_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_emails_unsubscribed_at TIMESTAMPTZ;

-- Backfill: existing users with marketing_emails=true must have consented at
-- some point — best proxy is profiles.created_at (the moment they finished
-- onboarding, which is when the consent disclosure was shown). For users
-- already opted out, stamp updated_at as the unsub time.
UPDATE profiles
   SET marketing_emails_consented_at = COALESCE(marketing_emails_consented_at, created_at)
 WHERE marketing_emails = true
   AND marketing_emails_consented_at IS NULL;

UPDATE profiles
   SET marketing_emails_unsubscribed_at = COALESCE(marketing_emails_unsubscribed_at, updated_at)
 WHERE marketing_emails = false
   AND marketing_emails_unsubscribed_at IS NULL;

COMMENT ON COLUMN profiles.marketing_emails_consented_at IS
  'When the user last affirmatively opted in to marketing email. Required as legal proof under Israeli spam law (חוק התקשורת תיקון 40).';
COMMENT ON COLUMN profiles.marketing_emails_unsubscribed_at IS
  'When the user last opted out of marketing email. Updated whenever marketing_emails flips false (one-click unsub, /settings/emails, admin override).';

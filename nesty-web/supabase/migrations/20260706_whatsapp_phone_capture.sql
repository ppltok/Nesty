-- WhatsApp phone capture (Phase 0 of the phone→WhatsApp plan).
-- Collected in onboarding step 5 ("gift alerts on WhatsApp") and later via
-- re-capture modal / share flow / Settings. All columns additive + nullable
-- so existing rows and code paths are untouched.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp_consented_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.phone_number IS
  'User phone in E.164 (+9725XXXXXXXX). Collected only with explicit WhatsApp opt-in.';
COMMENT ON COLUMN profiles.whatsapp_opt_in IS
  'True only when the user actively opted in to WhatsApp updates (gift alerts etc.).';
COMMENT ON COLUMN profiles.whatsapp_consented_at IS
  'Israeli spam-law audit trail — WHEN the user opted in. Mirrors marketing_emails_consented_at.';

-- Fast lookup of the opt-in cohort for sends and dashboards.
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_opt_in
  ON profiles (whatsapp_opt_in) WHERE whatsapp_opt_in;

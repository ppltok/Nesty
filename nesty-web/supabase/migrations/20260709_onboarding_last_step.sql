-- Furthest onboarding step a user reached (1..7). Written incrementally as
-- they advance, so the abandoned-signup admin email can show where they
-- dropped, and drop-off can be queried directly from the DB. Nullable:
-- users who signed up before this existed stay NULL (= unknown).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_last_step SMALLINT;

COMMENT ON COLUMN profiles.onboarding_last_step IS
  'Furthest onboarding step reached (1=name … 5=whatsapp … 7=first_item). NULL = unknown / pre-feature.';

-- Add nudge email tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checklist_nudge_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_nudge_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registry_shared_at TIMESTAMPTZ;

-- SPAM PREVENTION: Pre-populate nudge columns for ALL existing users
-- so they don't retroactively receive nudge emails.
-- Only users who sign up AFTER this migration will have NULL values
-- and be eligible for nudge emails.
UPDATE profiles SET checklist_nudge_sent_at = now() WHERE checklist_nudge_sent_at IS NULL;
UPDATE profiles SET share_nudge_sent_at = now() WHERE share_nudge_sent_at IS NULL;

-- Add last_weekly_email_week column to profiles table
-- Used by send-weekly-emails edge function to track which week's email was last sent
-- Prevents duplicate weekly emails being sent to the same user

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_weekly_email_week INTEGER;

COMMENT ON COLUMN profiles.last_weekly_email_week IS 'Tracks the last pregnancy week number for which a weekly email was sent (12-40)';

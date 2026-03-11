-- Add nudge email tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checklist_nudge_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_nudge_sent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registry_shared_at TIMESTAMPTZ;

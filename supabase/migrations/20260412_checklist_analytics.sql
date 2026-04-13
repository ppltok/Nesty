-- Add checked_at timestamp to track WHEN items are checked (not just IF)
ALTER TABLE checklist_preferences
ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ DEFAULT NULL;

-- Backfill: set checked_at = updated_at for already-checked items
UPDATE checklist_preferences
SET checked_at = updated_at
WHERE is_checked = true AND checked_at IS NULL;

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_checklist_preferences_user_id
ON checklist_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_checklist_preferences_checked_at
ON checklist_preferences(checked_at)
WHERE checked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_checklist_preferences_category
ON checklist_preferences(category_id);

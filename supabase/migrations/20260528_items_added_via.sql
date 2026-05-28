-- Track which surface added each item: extension | paste_url | manual.
-- Nullable on purpose — pre-existing rows have no source info.

ALTER TABLE items ADD COLUMN IF NOT EXISTS added_via text;

ALTER TABLE items DROP CONSTRAINT IF EXISTS items_added_via_check;
ALTER TABLE items ADD CONSTRAINT items_added_via_check
  CHECK (added_via IS NULL OR added_via IN ('extension', 'paste_url', 'manual'));

COMMENT ON COLUMN items.added_via IS 'Source of this item: extension | paste_url | manual | NULL (pre-tracking)';

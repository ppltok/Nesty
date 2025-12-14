-- ============================================
-- NESTY DATABASE MIGRATIONS
-- Run these in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD NEW COLUMNS TO REGISTRIES TABLE
-- ============================================

-- Add is_public column (default true = visible to everyone)
ALTER TABLE registries
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add welcome_message column for visitor greeting
ALTER TABLE registries
ADD COLUMN IF NOT EXISTS welcome_message TEXT;

-- Comments
COMMENT ON COLUMN registries.is_public IS 'If false, registry is hidden from public view';
COMMENT ON COLUMN registries.welcome_message IS 'Custom message shown to visitors on public registry';

-- ============================================
-- 2. ADD is_seen COLUMN TO PURCHASES TABLE
-- ============================================

-- Add is_seen column (track if owner has seen this purchase)
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS is_seen BOOLEAN DEFAULT false;

COMMENT ON COLUMN purchases.is_seen IS 'True after registry owner has viewed this purchase notification';

-- ============================================
-- 3. CREATE CHECKLIST_PREFERENCES TABLE
-- ============================================
-- Stores user's checklist choices (what they want, quantities, hidden items)

CREATE TABLE IF NOT EXISTS checklist_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User who owns these preferences
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Category and item identifier
  category_id TEXT NOT NULL,
  item_name TEXT NOT NULL,

  -- User preferences
  quantity INTEGER DEFAULT 1,
  is_checked BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per user+category+item
  UNIQUE(user_id, category_id, item_name)
);

-- Comments
COMMENT ON TABLE checklist_preferences IS 'User checklist preferences - what items they need and quantities';
COMMENT ON COLUMN checklist_preferences.category_id IS 'Category ID from the CATEGORIES constant';
COMMENT ON COLUMN checklist_preferences.item_name IS 'Item name from the category suggestions';
COMMENT ON COLUMN checklist_preferences.quantity IS 'How many of this item the user wants';
COMMENT ON COLUMN checklist_preferences.is_checked IS 'True if user marked this item as done/acquired';
COMMENT ON COLUMN checklist_preferences.is_hidden IS 'True if user does not want this suggestion';

-- Enable RLS
ALTER TABLE checklist_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own checklist preferences"
  ON checklist_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checklist_preferences_user ON checklist_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_preferences_category ON checklist_preferences(category_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_checklist_preferences_timestamp
  BEFORE UPDATE ON checklist_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. UPDATE ITEMS RLS FOR is_public CHECK
-- ============================================

-- Update the public view policy to check registry is_public
DROP POLICY IF EXISTS "Public can view non-private items" ON items;

CREATE POLICY "Public can view non-private items from public registries"
  ON items FOR SELECT
  USING (
    is_private = false
    AND registry_id IN (
      SELECT id FROM registries WHERE is_public = true
    )
  );

-- ============================================
-- 5. ADD purchased_at COLUMN TO PURCHASES TABLE
-- ============================================
-- Store where the gift was purchased (store name)

ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS purchased_at TEXT;

COMMENT ON COLUMN purchases.purchased_at IS 'Store name where the gift was purchased';

-- ============================================
-- DONE!
-- ============================================
-- After running this, your database will support:
-- 1. Registry visibility toggle (is_public)
-- 2. Welcome message for visitors (welcome_message)
-- 3. Gift "seen" tracking (is_seen on purchases)
-- 4. Checklist preferences stored per user (checklist_preferences table)
-- 5. Store name tracking for purchases (purchased_at)

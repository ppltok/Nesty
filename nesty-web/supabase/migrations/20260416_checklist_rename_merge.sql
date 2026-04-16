-- Checklist data migration: rename "חיתולי בד לתינוקות" → "טטרות"
-- and merge "כיסאות בטיחות" + "כיסאות בטיחות מסתובבים" → "כיסא בטיחות".
--
-- Why: the item names in categories.ts were changed, and checklist_preferences
-- stores item_name as free text. Without this migration, users who had checked
-- the old names would see their check state orphaned.
--
-- Safety: the checklist_preferences table has UNIQUE(user_id, category_id, item_name),
-- so the merge must de-duplicate users who have BOTH old car-seat rows before
-- we rename, otherwise the UPDATE would violate the constraint.

BEGIN;

-- ─── 1. Rename: חיתולי בד לתינוקות → טטרות ──────────────────
-- Simple rename, no collision risk (the new name didn't exist before).

UPDATE checklist_preferences
SET item_name = 'טטרות',
    updated_at = NOW()
WHERE item_name = 'חיתולי בד לתינוקות';


-- ─── 2. Merge: כיסאות בטיחות + מסתובבים → כיסא בטיחות ──────
-- Step 2a: for users with BOTH old rows in the same category, keep the
-- "winning" row and delete the loser. Winner selection:
--   1. prefer is_checked=true (user actually marked it acquired)
--   2. prefer is_hidden=false (user didn't dismiss it)
--   3. prefer most recently updated
-- This preserves the strongest user signal.

DELETE FROM checklist_preferences
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, category_id
        ORDER BY is_checked DESC, is_hidden ASC, updated_at DESC
      ) AS rn
    FROM checklist_preferences
    WHERE item_name IN ('כיסאות בטיחות', 'כיסאות בטיחות מסתובבים')
  ) ranked
  WHERE rn > 1
);

-- Step 2b: rename all survivors to the merged name.
UPDATE checklist_preferences
SET item_name = 'כיסא בטיחות',
    updated_at = NOW()
WHERE item_name IN ('כיסאות בטיחות', 'כיסאות בטיחות מסתובבים');

COMMIT;


-- ─── Post-migration sanity checks (run these manually) ──────
-- SELECT count(*) FROM checklist_preferences
--   WHERE item_name IN ('חיתולי בד לתינוקות', 'כיסאות בטיחות', 'כיסאות בטיחות מסתובבים');
-- -- Should return 0.
--
-- SELECT count(*) FROM checklist_preferences WHERE item_name = 'טטרות';
-- SELECT count(*) FROM checklist_preferences WHERE item_name = 'כיסא בטיחות';
-- -- Should match the combined historical counts (minus de-duplicated merge collisions).

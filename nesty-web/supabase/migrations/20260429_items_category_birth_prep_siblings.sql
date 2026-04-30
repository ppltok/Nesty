-- Allow `birth_prep` and `siblings` as valid item categories.
--
-- The original items.category CHECK constraint only listed 10 categories
-- (strollers, car_safety, furniture, safety, feeding, nursing, bath, clothing,
-- bedding, toys), but the app's CATEGORIES list now includes:
--   - birth_prep  (הכנה ללידה ולאמא)
--   - siblings    (תוספות לאחים / תאומים)
--   - general     (כללי — fallback for custom items without a category)
--
-- Without this migration, inserts with these category values fail with a
-- check_constraint violation, and users can't add items to those sections.

ALTER TABLE items DROP CONSTRAINT IF EXISTS items_category_check;

ALTER TABLE items
  ADD CONSTRAINT items_category_check
  CHECK (category IN (
    'general',
    'strollers',
    'car_safety',
    'furniture',
    'safety',
    'feeding',
    'nursing',
    'bath',
    'clothing',
    'bedding',
    'toys',
    'birth_prep',
    'siblings'
  ));

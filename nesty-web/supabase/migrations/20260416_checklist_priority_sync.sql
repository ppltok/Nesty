-- Reset stale priority='essential' stamps on treat items.
--
-- Why: Checklist.tsx used to hardcode priority='essential' when inserting a
-- preference row, regardless of the item's ITEMS_DATA.type. That meant any
-- user who interacted with a treat item (checked, hidden, changed quantity,
-- added a note) ended up with priority='essential' persisted — and the UI
-- badge was driven off that column, so those items displayed as "חובה"
-- forever even after we retagged them as treat in code.
--
-- The code fix (getDefaultPriority helper) prevents this going forward.
-- This migration is a one-time cleanup of historical bad data.
--
-- The item list below is the complete set of type='treat' entries from
-- nesty-web/src/data/categories.ts at the time of this migration.
-- It includes items newly retagged as treat (מוצרים משלימים לרכב,
-- תרמוסים ומחלק מנות, סינרים לתינוק, מברשות וסט מניקור, טרמפולינות,
-- אוניברסיטה לתינוק) and all long-standing treat items.
--
-- Trade-off (see plan): we cannot distinguish rows where the user explicitly
-- toggled a treat item to 'essential' from rows where the old default stamped
-- it. Both are reset. Users who had explicit overrides will need to re-toggle.

BEGIN;

UPDATE checklist_preferences
SET priority = 'nice_to_have',
    updated_at = NOW()
WHERE priority = 'essential'
  AND item_name IN (
    'טיולון',
    'צעצועים לעגלה',
    'סלקלים בטיחותיים',
    'בסיסים לרכב',
    'מוצרים משלימים לרכב',
    'עריסה לתינוק',
    'לול וקמפינג',
    'אביזרים לעיצוב חדר ילדים',
    'מוניטור ואינטרקום',
    'שערים ואביזרי בטיחות',
    'מייבש בקבוקים',
    'סטריליזטורים',
    'מחמם בקבוקים',
    'תרמוסים ומחלק מנות',
    'כיסא אוכל',
    'סינרים לתינוק',
    'בוסטר האכלה',
    'משאבות הנקה ואביזריהן',
    'כריות הנקה',
    'סינרי הנקה',
    'כורסאות הנקה',
    'מברשות וסט מניקור',
    'צעצועים לאמבטיה',
    'טבעות אמבטיה',
    'סטים לתינוקות',
    'כפפות לתינוק',
    'גרביים לתינוקות',
    'Nest (קן לתינוק)',
    'מגן ראש לתינוק',
    'נחשושים',
    'כריות לתינוק',
    'מובייל לתינוק',
    'טרמפולינות',
    'נדנדות',
    'אוניברסיטה לתינוק',
    'שמיכות פעילות',
    'נשכנים ורעשנים',
    'שמיכי לתינוק',
    'שמן שקדים (עיסוי פרינאום)',
    'פדים מגנזיום / קרים',
    'כרית ישיבה (דונאט)',
    'מכשיר TENS (שיכוך צירים)',
    'כדור פיזיו',
    'עגלות תאומים/אחים',
    'טרמפיסט לעגלה',
    'בוסטרים לרכב'
  );

COMMIT;


-- ─── Post-migration sanity checks (run manually) ──────
--
-- Should return 0:
-- SELECT count(*) FROM checklist_preferences
-- WHERE priority = 'essential'
--   AND item_name IN (/* 46 treat names above */);
--
-- Confirm rows moved (not deleted):
-- SELECT item_name, count(*)
-- FROM checklist_preferences
-- WHERE priority = 'nice_to_have'
--   AND item_name IN (/* 46 treat names above */)
-- GROUP BY item_name ORDER BY 2 DESC;

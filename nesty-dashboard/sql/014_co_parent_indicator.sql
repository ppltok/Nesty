-- 014: Co-parent indicator
--   1) Add `co_parents_count` + `prev_co_parents_count` to get_dashboard_overview so the
--      Overview page can surface how many registries have a linked partner.
--   2) Rework get_people_list so a co-parent shows up *inside* the primary owner's row
--      (nested object) instead of as a standalone row. Users who are co-parent-only
--      (no owned registry) are excluded from the top-level list — they're visible via
--      their primary's expanded panel.
--
-- Run against the Supabase project: `psql < 014_co_parent_indicator.sql`

-- ============================================
-- 1. DASHBOARD OVERVIEW — add co-parent count
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_overview(
  period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  period_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  test_ids UUID[];
  period_length INTERVAL;
  prev_start TIMESTAMPTZ;
  prev_end TIMESTAMPTZ;
BEGIN
  SELECT array_agg(id) INTO test_ids FROM profiles
    WHERE email IN ('tom@ppltok.com', 'ortalgoldi@gmail.com', 'kehalim.michael@gmail.com', 'michael.kehalim@gmail.com');
  IF test_ids IS NULL THEN test_ids := '{}'; END IF;

  period_length := period_end - period_start;
  prev_end := period_start;
  prev_start := period_start - period_length;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE created_at <= period_end AND id != ALL(test_ids)),
    'new_users', (SELECT COUNT(*) FROM profiles WHERE created_at BETWEEN period_start AND period_end AND id != ALL(test_ids)),
    'onboarded_users', (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true AND created_at <= period_end AND id != ALL(test_ids)),
    'total_registries', (SELECT COUNT(*) FROM registries WHERE created_at <= period_end AND owner_id != ALL(test_ids)),
    'active_registries', (
      SELECT COUNT(DISTINCT r.id)
      FROM registries r JOIN items i ON i.registry_id = r.id
      WHERE i.created_at BETWEEN period_start AND period_end
      AND r.owner_id != ALL(test_ids)
    ),
    'total_items', (
      SELECT COUNT(*) FROM items i JOIN registries r ON i.registry_id = r.id
      WHERE i.created_at <= period_end AND r.owner_id != ALL(test_ids)
    ),
    'new_items', (
      SELECT COUNT(*) FROM items i JOIN registries r ON i.registry_id = r.id
      WHERE i.created_at BETWEEN period_start AND period_end AND r.owner_id != ALL(test_ids)
    ),
    'total_gifts', (
      SELECT COUNT(*) FROM purchases p JOIN items i ON p.item_id = i.id JOIN registries r ON i.registry_id = r.id
      WHERE p.status = 'confirmed' AND p.confirmed_at <= period_end AND r.owner_id != ALL(test_ids)
    ),
    'new_gifts', (
      SELECT COUNT(*) FROM purchases p JOIN items i ON p.item_id = i.id JOIN registries r ON i.registry_id = r.id
      WHERE p.status = 'confirmed' AND p.confirmed_at BETWEEN period_start AND period_end AND r.owner_id != ALL(test_ids)
    ),
    'platform_gmv', (
      SELECT COALESCE(SUM(i.price * i.quantity), 0)
      FROM items i JOIN registries r ON i.registry_id = r.id
      WHERE r.owner_id != ALL(test_ids)
    ),
    'period_gmv', (
      SELECT COALESCE(SUM(i.price * p.quantity_purchased), 0)
      FROM items i JOIN purchases p ON p.item_id = i.id JOIN registries r ON i.registry_id = r.id
      WHERE p.status = 'confirmed' AND p.confirmed_at BETWEEN period_start AND period_end AND r.owner_id != ALL(test_ids)
    ),
    'avg_registry_value', (
      SELECT ROUND(AVG(reg_total)::numeric, 2)
      FROM (
        SELECT SUM(i.price * i.quantity) AS reg_total
        FROM items i JOIN registries r ON i.registry_id = r.id
        WHERE r.owner_id != ALL(test_ids)
        GROUP BY i.registry_id HAVING COUNT(*) >= 1
      ) sub
    ),
    'avg_items_per_registry', (
      SELECT ROUND(AVG(item_count)::numeric, 1)
      FROM (
        SELECT COUNT(*) AS item_count FROM items i JOIN registries r ON i.registry_id = r.id
        WHERE r.owner_id != ALL(test_ids) GROUP BY i.registry_id
      ) sub
    ),
    'completion_rate', (
      SELECT CASE WHEN SUM(quantity) > 0
        THEN ROUND((SUM(quantity_received)::numeric / SUM(quantity)::numeric) * 100, 1)
        ELSE 0 END
      FROM items i JOIN registries r ON i.registry_id = r.id WHERE r.owner_id != ALL(test_ids)
    ),
    'north_star_30d', (
      SELECT COUNT(DISTINCT r.id)
      FROM registries r JOIN items i ON i.registry_id = r.id JOIN purchases p ON p.item_id = i.id
      WHERE p.status = 'confirmed' AND p.confirmed_at >= NOW() - INTERVAL '30 days'
      AND r.owner_id != ALL(test_ids)
    ),
    'extension_users', (
      SELECT COUNT(DISTINCT r.owner_id)
      FROM registries r JOIN items i ON i.registry_id = r.id
      WHERE i.original_url IS NOT NULL AND i.store_name != 'ידני'
      AND r.owner_id != ALL(test_ids)
    ),
    'total_users_with_items', (
      SELECT COUNT(DISTINCT r.owner_id)
      FROM registries r
      WHERE EXISTS (SELECT 1 FROM items WHERE registry_id = r.id)
      AND r.owner_id != ALL(test_ids)
    ),
    -- NEW: Co-parents — registries where a partner has accepted the invitation.
    -- Counts distinct registries (not profiles) because a profile can only be
    -- partner_id on one registry at a time (unique constraint in app logic).
    'co_parents_count', (
      SELECT COUNT(*) FROM registries r
      WHERE r.partner_id IS NOT NULL
      AND r.owner_id != ALL(test_ids)
      AND r.partner_id != ALL(test_ids)
    ),
    'prev_total_users', (SELECT COUNT(*) FROM profiles WHERE created_at <= prev_end AND id != ALL(test_ids)),
    'prev_new_users', (SELECT COUNT(*) FROM profiles WHERE created_at BETWEEN prev_start AND prev_end AND id != ALL(test_ids)),
    'prev_active_registries', (
      SELECT COUNT(DISTINCT r.id)
      FROM registries r JOIN items i ON i.registry_id = r.id
      WHERE i.created_at BETWEEN prev_start AND prev_end
      AND r.owner_id != ALL(test_ids)
    ),
    'prev_new_items', (
      SELECT COUNT(*) FROM items i JOIN registries r ON i.registry_id = r.id
      WHERE i.created_at BETWEEN prev_start AND prev_end AND r.owner_id != ALL(test_ids)
    ),
    'prev_new_gifts', (
      SELECT COUNT(*) FROM purchases p JOIN items i ON p.item_id = i.id JOIN registries r ON i.registry_id = r.id
      WHERE p.status = 'confirmed' AND p.confirmed_at BETWEEN prev_start AND prev_end AND r.owner_id != ALL(test_ids)
    ),
    'prev_platform_gmv', (
      SELECT COALESCE(SUM(i.price * i.quantity), 0)
      FROM items i JOIN registries r ON i.registry_id = r.id
      WHERE i.created_at <= prev_end AND r.owner_id != ALL(test_ids)
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 2. PEOPLE LIST — nest co-parent inside owner's row
-- ============================================
-- Only profiles that *own* a registry (or that have neither owner nor partner
-- role, i.e. solo signups) get a top-level row. Co-parent-only profiles are
-- excluded from the list; their info appears inside the primary owner's row
-- via the `co_parent` JSON object.

CREATE OR REPLACE FUNCTION get_people_list()
RETURNS JSON AS $$
DECLARE
  result JSON;
  test_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO test_ids FROM profiles
    WHERE email IN ('tom@ppltok.com', 'ortalgoldi@gmail.com', 'kehalim.michael@gmail.com', 'michael.kehalim@gmail.com');
  IF test_ids IS NULL THEN test_ids := '{}'; END IF;

  WITH
  -- A profile is "co-parent-only" iff it is partner_id somewhere AND does NOT
  -- own any registry itself. We suppress these from the top-level list.
  co_parent_only AS (
    SELECT p.id
    FROM profiles p
    JOIN registries r_partner ON r_partner.partner_id = p.id
    LEFT JOIN registries r_own ON r_own.owner_id = p.id
    WHERE r_own.id IS NULL
  ),
  user_data AS (
    SELECT
      p.id,
      p.email,
      COALESCE(NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''), p.email) AS display_name,
      p.first_name,
      p.last_name,
      p.due_date,
      p.is_first_time_parent,
      p.feeling,
      p.onboarding_completed,
      p.email_notifications,
      p.marketing_emails,
      p.created_at AS signed_up_at,
      r.id AS registry_id,
      r.slug AS registry_slug,
      r.title AS registry_title,
      -- Nested co-parent — NULL if no partner linked
      (
        SELECT CASE
          WHEN r.partner_id IS NULL THEN NULL
          ELSE json_build_object(
            'id', cp.id,
            'email', cp.email,
            'first_name', cp.first_name,
            'last_name', cp.last_name,
            'display_name', COALESCE(
              NULLIF(TRIM(COALESCE(cp.first_name, '') || ' ' || COALESCE(cp.last_name, '')), ''),
              cp.email
            ),
            'signed_up_at', cp.created_at,
            'onboarding_completed', cp.onboarding_completed
          )
        END
        FROM profiles cp
        WHERE cp.id = r.partner_id
      ) AS co_parent,
      COALESCE(item_agg.item_count, 0) AS item_count,
      COALESCE(item_agg.registry_value, 0) AS registry_value,
      COALESCE(item_agg.gifts_received, 0) AS gifts_received,
      COALESCE(item_agg.gift_value, 0) AS gift_value,
      COALESCE(item_agg.total_wanted, 0) AS total_wanted,
      COALESCE(item_agg.total_received, 0) AS total_received,
      COALESCE(purchase_agg.unique_givers, 0) AS unique_givers,
      CASE
        WHEN p.due_date IS NOT NULL AND p.due_date > CURRENT_DATE
        THEN 40 - FLOOR(EXTRACT(EPOCH FROM (p.due_date::timestamp - CURRENT_DATE::timestamp)) / (7 * 86400))::int
        WHEN p.due_date IS NOT NULL AND p.due_date <= CURRENT_DATE
        THEN 40 + FLOOR(EXTRACT(EPOCH FROM (CURRENT_DATE::timestamp - p.due_date::timestamp)) / (7 * 86400))::int
        ELSE NULL
      END AS pregnancy_week,
      CASE
        WHEN COALESCE(item_agg.total_wanted, 0) > 0
        THEN ROUND((COALESCE(item_agg.total_received, 0)::numeric / item_agg.total_wanted::numeric) * 100, 1)
        ELSE 0
      END AS completion_pct,
      item_agg.top_items,
      item_agg.last_item_at
    FROM profiles p
    LEFT JOIN registries r ON r.owner_id = p.id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) AS item_count,
        COALESCE(SUM(i.price * i.quantity), 0) AS registry_value,
        COALESCE(SUM(i.quantity_received), 0) AS gifts_received,
        COALESCE(SUM(i.price * i.quantity_received), 0) AS gift_value,
        SUM(i.quantity) AS total_wanted,
        SUM(i.quantity_received) AS total_received,
        MAX(i.created_at) AS last_item_at,
        (
          SELECT json_agg(row_to_json(t))
          FROM (
            SELECT i2.name, i2.price, i2.category, i2.store_name,
                   i2.quantity, i2.quantity_received, i2.image_url, i2.original_url
            FROM items i2
            WHERE i2.registry_id = r.id
            ORDER BY i2.price DESC
            LIMIT 5
          ) t
        ) AS top_items
      FROM items i
      WHERE i.registry_id = r.id
    ) item_agg ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(DISTINCT pu.buyer_email) AS unique_givers
      FROM purchases pu
      JOIN items i ON pu.item_id = i.id
      WHERE i.registry_id = r.id AND pu.status = 'confirmed'
    ) purchase_agg ON true
    WHERE p.id != ALL(test_ids)
      AND p.id NOT IN (SELECT id FROM co_parent_only)
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'total_users', (SELECT COUNT(*) FROM user_data),
      'users_with_items', (SELECT COUNT(*) FROM user_data WHERE item_count > 0),
      'users_with_gifts', (SELECT COUNT(*) FROM user_data WHERE gifts_received > 0),
      'co_parent_count', (SELECT COUNT(*) FROM user_data WHERE co_parent IS NOT NULL),
      'avg_registry_value', (SELECT COALESCE(ROUND(AVG(registry_value)::numeric, 0), 0) FROM user_data WHERE item_count > 0),
      'avg_items', (SELECT COALESCE(ROUND(AVG(item_count)::numeric, 1), 0) FROM user_data WHERE item_count > 0),
      'avg_completion', (SELECT COALESCE(ROUND(AVG(completion_pct)::numeric, 1), 0) FROM user_data WHERE item_count > 0)
    ),
    'users', (SELECT COALESCE(json_agg(row_to_json(u) ORDER BY u.signed_up_at DESC), '[]'::json) FROM user_data u)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

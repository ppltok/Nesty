---
name: nesty-analytics
description: Query the Nesty production Supabase database (read-only) for reports and analytics. Use when the user asks for Nesty metrics, reports, user counts, signups, registries, items, gifts/purchases, store breakdowns, funnel or growth numbers, or any "how many / show me / pull from the database" question about Nesty data.
---

# Nesty Analytics — Read-Only Database Queries

Query Nesty's production Supabase Postgres database for reports and analytics.

## Hard rules

1. **READ-ONLY. SELECT statements only.** Never run INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, TRUNCATE, or GRANT. If the user asks for a data change, stop and tell them this skill is read-only.
2. **Always exclude test accounts** (see "Test accounts" below) unless the user explicitly asks to include them.
3. This is the live production database. If a query might be slow (no LIMIT, big joins), add a LIMIT or aggregate instead of dumping raw rows.

## How to connect

Project ref: `wopsrjfdaovlyibivijl` (https://wopsrjfdaovlyibivijl.supabase.co)

Queries run through the Supabase Management API. The personal access token lives in the project root `.env` file as `SUPABASE_ACCESS_TOKEN` (gitignored — never print the token).

Run queries with the Bash tool like this (heredoc avoids quoting problems with SQL):

```bash
cd "C:\Users\User\Desktop\cursor projects\nesty\Nesty"
TOKEN=$(grep '^SUPABASE_ACCESS_TOKEN=' .env | cut -d= -f2)
curl -s -X POST "https://api.supabase.com/v1/projects/wopsrjfdaovlyibivijl/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{"query": "SELECT COUNT(*) AS users FROM profiles"}
EOF
```

The response is a JSON array of row objects. If you get `401`/`Unauthorized`, the token is missing or expired — tell the user to create one at https://supabase.com/dashboard/account/tokens and put it in `.env` as `SUPABASE_ACCESS_TOKEN=sbp_...`.

Note: the SQL goes inside a JSON string, so use single quotes in SQL freely, but escape any double quotes as `\"` and keep the query on one line (or use `\n`).

## Schema cheat sheet

Hierarchy: `auth.users` → `profiles` (1:1) → `registries` (1:N, via `owner_id`) → `items` (1:N, via `registry_id`) → `purchases` (via `item_id`).

- **profiles** — `id`, `email`, `first_name`, `last_name`, `due_date`, `onboarding_completed`, `is_first_time_parent`, `is_surprise`, `feeling`, `marketing_emails`, `email_notifications`, `utm_source`, `created_at`
- **registries** — `id`, `owner_id` → profiles, `partner_id` (co-parent, nullable), `title`, `slug`, `created_at`
- **items** — `id`, `registry_id` → registries, `category`, `store_name`, `original_url`, `price`, `quantity`, `quantity_received`, `created_at`
- **purchases** — `id`, `item_id` → items, `buyer_email`, `status`, `quantity_purchased`, `gift_message`, `confirmed_at`, `created_at` (a purchase counts when `status = 'confirmed'` / `confirmed_at IS NOT NULL`)
- **checklist_preferences** — `user_id` → profiles, `category_id`, `item_name`, `quantity`, `is_checked`, `is_hidden`, `created_at`
- **email_logs** — outbound email tracking
- Materialized views built for the dashboard (may be stale until refreshed): `mv_daily_signups`, `mv_daily_items`, `mv_daily_gifts`, `mv_funnel_snapshot`, `mv_store_breakdown`, `mv_category_breakdown`. Prefer querying base tables for fresh numbers.

If you need a column not listed here, discover it instead of guessing:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'items' ORDER BY ordinal_position
```

## Test accounts — exclude from every report

```sql
WITH test_users AS (
  SELECT id FROM profiles WHERE email IN
  ('tom@ppltok.com', 'ortalgoldi@gmail.com', 'kehalim.michael@gmail.com', 'michael.kehalim@gmail.com')
)
```

Then filter with `p.id NOT IN (SELECT id FROM test_users)` or `r.owner_id NOT IN (SELECT id FROM test_users)`. (The canonical list lives in `nesty-dashboard/sql/012_add_test_accounts.sql` — check it if results look off.)

## Canned queries

All assume the `test_users` CTE above is prepended.

**Signups per week (last 8 weeks):**
```sql
SELECT date_trunc('week', created_at)::date AS week, COUNT(*) AS signups
FROM profiles WHERE id NOT IN (SELECT id FROM test_users)
GROUP BY 1 ORDER BY 1 DESC LIMIT 8
```

**Funnel snapshot (signup → onboarded → registry → has items → received a gift):**
```sql
SELECT
  (SELECT COUNT(*) FROM profiles WHERE id NOT IN (SELECT id FROM test_users)) AS signed_up,
  (SELECT COUNT(*) FROM profiles WHERE onboarding_completed AND id NOT IN (SELECT id FROM test_users)) AS onboarded,
  (SELECT COUNT(DISTINCT owner_id) FROM registries WHERE owner_id NOT IN (SELECT id FROM test_users)) AS has_registry,
  (SELECT COUNT(DISTINCT r.owner_id) FROM registries r JOIN items i ON i.registry_id = r.id
     WHERE r.owner_id NOT IN (SELECT id FROM test_users)) AS has_items,
  (SELECT COUNT(DISTINCT r.owner_id) FROM registries r JOIN items i ON i.registry_id = r.id
     WHERE i.quantity_received > 0 AND r.owner_id NOT IN (SELECT id FROM test_users)) AS received_gift
```

**Items added per week:**
```sql
SELECT date_trunc('week', i.created_at)::date AS week, COUNT(*) AS items
FROM items i JOIN registries r ON i.registry_id = r.id
WHERE r.owner_id NOT IN (SELECT id FROM test_users)
GROUP BY 1 ORDER BY 1 DESC LIMIT 8
```

**Top stores:**
```sql
SELECT COALESCE(NULLIF(i.store_name, 'ידני'), 'Manual Entry') AS store,
  COUNT(*) AS items, COUNT(DISTINCT i.registry_id) AS registries,
  ROUND(AVG(i.price)::numeric, 0) AS avg_price
FROM items i JOIN registries r ON i.registry_id = r.id
WHERE r.owner_id NOT IN (SELECT id FROM test_users)
GROUP BY 1 ORDER BY items DESC LIMIT 15
```

**Gifts (confirmed purchases) per week:**
```sql
SELECT date_trunc('week', pu.confirmed_at)::date AS week,
  COUNT(*) AS gifts, SUM(i.price * pu.quantity_purchased) AS gmv
FROM purchases pu JOIN items i ON pu.item_id = i.id
JOIN registries r ON i.registry_id = r.id
WHERE pu.confirmed_at IS NOT NULL AND r.owner_id NOT IN (SELECT id FROM test_users)
GROUP BY 1 ORDER BY 1 DESC LIMIT 8
```

**Signups by UTM source:**
```sql
SELECT COALESCE(utm_source, '(direct/unknown)') AS source, COUNT(*) AS signups
FROM profiles WHERE id NOT IN (SELECT id FROM test_users)
GROUP BY 1 ORDER BY signups DESC
```

## Output format

Present results as a small markdown table plus a one-line takeaway (e.g. "signups are up 30% vs the prior week"). Dates in the data are UTC; the business is in Israel — mention this only if it matters for the question.

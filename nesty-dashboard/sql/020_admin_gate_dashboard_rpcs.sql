-- 020_admin_gate_dashboard_rpcs.sql
-- Applied to production 2026-08-29.
--
-- PROBLEM
-- Every get_*() analytics function here is SECURITY DEFINER (it must be - it
-- reads across all users' rows) and had EXECUTE granted to `authenticated`
-- with no further check. The dashboard signs in as plain `authenticated`,
-- exactly like a Nesty customer, so ANY user who signed up on nestyil.com
-- could call /rest/v1/rpc/get_people_list and receive every user's email,
-- name, due date and feeling. Same for every other analytics RPC.
--
-- WHY A WRAPPER AND NOT AN EDIT
-- These function bodies are long analytics queries. Rewriting 20 of them by
-- hand to insert a guard risks changing the numbers. Instead each original is
-- renamed to <name>__inner with its body untouched and locked away from anon
-- and authenticated, and a thin gated wrapper takes over the public name.
--
-- IMPORTANT: re-running any earlier file in this directory recreates the
-- UNGATED function and silently undoes this. Always re-run this file after
-- applying 003/006/009/013/016/017/018 etc. Verify with the query at the end.

-- ---------------------------------------------------------------------------
-- 1. One place that decides who may run dashboard analytics.
-- ---------------------------------------------------------------------------
create or replace function public.assert_dashboard_admin() returns void
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if public.is_dashboard_admin() then return; end if;
  -- cron / edge functions calling with the service-role key.
  -- NOTE: inside a SECURITY DEFINER function `current_user` is the function
  -- OWNER, not the caller, so the role must come from the JWT claims.
  if coalesce(current_setting('request.jwt.claims', true)::json->>'role','') = 'service_role' then
    return;
  end if;
  raise exception 'Not authorized: dashboard admin only' using errcode = '42501';
end $$;

revoke all on function public.assert_dashboard_admin() from public, anon;
grant execute on function public.assert_dashboard_admin() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Wrap every ungated SECURITY DEFINER analytics function.
--    Idempotent: already-wrapped functions are skipped.
-- ---------------------------------------------------------------------------
DO $do$
DECLARE r record; inner_name text; call_args text; body text; n int := 0;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname,
           pg_get_function_identity_arguments(p.oid) AS ident,
           pg_get_function_arguments(p.oid)          AS fullargs,
           pg_get_function_result(p.oid)             AS ret,
           p.pronargs
    FROM pg_proc p JOIN pg_namespace n2 ON n2.oid = p.pronamespace
    WHERE n2.nspname = 'public'
      -- prokind='f' excludes aggregates: pg_get_functiondef() ERRORS on them
      -- and the planner may evaluate that before any other predicate.
      AND p.prokind = 'f'
      AND p.prosecdef
      AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
      AND (p.proname LIKE 'get\_%' OR p.proname = 'refresh_dashboard_views')
      AND p.proname NOT LIKE '%\_\_inner'
      AND position('assert_dashboard_admin' in p.prosrc) = 0
      -- Deliberately-public RPCs must NOT be admin-gated. get_public_registry
      -- serves the anonymous gift-giver page; wrapping it breaks every shared
      -- registry link. Rule: anything granted to `anon` is public by intent.
      AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')
      AND p.proname <> 'get_public_registry'
  LOOP
    inner_name := r.proname || '__inner';
    call_args  := coalesce((SELECT string_agg('$'||g, ', ' ORDER BY g)
                            FROM generate_series(1, r.pronargs) g), '');

    EXECUTE format('ALTER FUNCTION public.%I(%s) RENAME TO %I', r.proname, r.ident, inner_name);
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated', inner_name, r.ident);

    IF r.ret = 'void' THEN
      body := format('BEGIN PERFORM public.assert_dashboard_admin(); PERFORM public.%I(%s); END', inner_name, call_args);
    ELSIF r.ret LIKE 'TABLE(%' OR r.ret LIKE 'SETOF %' THEN
      body := format('BEGIN PERFORM public.assert_dashboard_admin(); RETURN QUERY SELECT * FROM public.%I(%s); END', inner_name, call_args);
    ELSE
      body := format('BEGIN PERFORM public.assert_dashboard_admin(); RETURN public.%I(%s); END', inner_name, call_args);
    END IF;

    EXECUTE format(
      'CREATE OR REPLACE FUNCTION public.%I(%s) RETURNS %s LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $fn$%s$fn$',
      r.proname, r.fullargs, r.ret, body);
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(%s) FROM PUBLIC, anon', r.proname, r.ident);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role', r.proname, r.ident);

    n := n + 1;
  END LOOP;
  RAISE NOTICE 'gated % function(s)', n;
END $do$;

-- ---------------------------------------------------------------------------
-- 3. Verification. Expect ungated_remaining = 0 and inner_exposed = 0.
-- ---------------------------------------------------------------------------
select
  count(*) filter (
    where p.prosecdef
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and (p.proname like 'get\_%' or p.proname = 'refresh_dashboard_views')
      and p.proname not like '%\_\_inner'
      and position('assert_dashboard_admin' in p.prosrc) = 0
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
      and p.proname <> 'get_public_registry'
  ) as ungated_remaining,
  count(*) filter (
    where p.proname like '%\_\_inner'
      and (has_function_privilege('authenticated', p.oid, 'EXECUTE')
        or has_function_privilege('anon', p.oid, 'EXECUTE'))
  ) as inner_exposed
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f';

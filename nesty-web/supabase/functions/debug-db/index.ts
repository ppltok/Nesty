import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL')
    if (!dbUrl) {
      return new Response(
        JSON.stringify({ error: 'No SUPABASE_DB_URL found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { Pool } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts')
    const pool = new Pool(dbUrl, 1)
    const conn = await pool.connect()

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'inspect'

    if (action === 'deep-inspect') {
      // 1. Check trigger function properties (SECURITY DEFINER vs INVOKER)
      const fnProps = await conn.queryObject(`
        SELECT
          proname,
          proowner::regrole::text as owner,
          prosecdef as is_security_definer,
          provolatile,
          prolang
        FROM pg_proc
        WHERE proname IN ('handle_new_user', 'create_default_subscription')
      `)

      // 2. Check ALL tables that have foreign keys to auth.users
      const allFKs = await conn.queryObject(`
        SELECT
          conrelid::regclass::text as table_name,
          conname as constraint_name,
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE confrelid = 'auth.users'::regclass AND contype = 'f'
        ORDER BY conrelid::regclass::text
      `)

      // 3. Check recent schema changes (object modifications in pg_stat)
      const recentTables = await conn.queryObject(`
        SELECT schemaname, relname, n_live_tup, n_dead_tup, last_vacuum, last_analyze
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY relname
      `)

      // 4. Check if there are any OTHER triggers on auth.users that are user-defined
      const userTriggers = await conn.queryObject(`
        SELECT
          t.tgname,
          t.tgenabled::text,
          p.proname,
          p.prosrc,
          p.prosecdef as security_definer,
          p.proowner::regrole::text as owner
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE t.tgrelid = 'auth.users'::regclass
          AND t.tgname NOT LIKE 'RI_%'
      `)

      // 5. Check GoTrue role
      const gotrueRole = await conn.queryObject(`
        SELECT rolname, rolsuper, rolcreaterole, rolbypassrls
        FROM pg_roles
        WHERE rolname IN ('supabase_auth_admin', 'authenticator', 'anon', 'service_role', 'postgres')
      `)

      // 6. Check if there are any event triggers that could interfere
      const eventTriggers = await conn.queryObject(`
        SELECT evtname, evtevent, evtowner::regrole::text as owner, evtenabled::text
        FROM pg_event_trigger
      `)

      // 7. Check profiles table constraints
      const profileConstraints = await conn.queryObject(`
        SELECT conname, contype, pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
      `)

      // 8. Check profiles table RLS
      const profileRLS = await conn.queryObject(`
        SELECT relrowsecurity, relforcerowsecurity
        FROM pg_class
        WHERE oid = 'public.profiles'::regclass
      `)

      // 9. Try simulating the EXACT trigger sequence that happens on user creation
      let triggerTest = null
      try {
        await conn.queryObject('BEGIN')
        // Check if handle_new_user can insert into profiles (with a fake UUID)
        await conn.queryObject(`
          INSERT INTO public.profiles (id, email, first_name)
          VALUES ('11111111-1111-1111-1111-111111111111', 'test@test.com', 'Test')
        `)
        triggerTest = 'profiles INSERT: SUCCESS'
        await conn.queryObject('ROLLBACK')
      } catch (e) {
        await conn.queryObject('ROLLBACK').catch(() => {})
        triggerTest = 'profiles INSERT FAILED: ' + (e instanceof Error ? e.message : String(e))
      }

      conn.release()
      await pool.end()

      const result = {
        trigger_functions: fnProps.rows,
        all_fk_to_auth_users: allFKs.rows,
        public_tables_stats: recentTables.rows,
        user_defined_triggers: userTriggers.rows,
        roles: gotrueRole.rows,
        event_triggers: eventTriggers.rows,
        profile_constraints: profileConstraints.rows,
        profile_rls: profileRLS.rows,
        trigger_simulation: triggerTest,
      }

      return new Response(
        JSON.stringify(result, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'disable-subscription-trigger') {
      // Need to find who owns auth.users and set role to that
      const ownerResult = await conn.queryObject(`
        SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
      `)
      const owner = (ownerResult.rows[0] as any)?.tableowner || 'supabase_auth_admin'

      await conn.queryObject(`SET ROLE ${owner}`)
      await conn.queryObject(`
        ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created_subscription
      `)
      await conn.queryObject(`RESET ROLE`)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: `Disabled on_auth_user_created_subscription trigger (as ${owner})` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'enable-subscription-trigger') {
      const ownerResult = await conn.queryObject(`
        SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
      `)
      const owner = (ownerResult.rows[0] as any)?.tableowner || 'supabase_auth_admin'

      await conn.queryObject(`SET ROLE ${owner}`)
      await conn.queryObject(`
        ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created_subscription
      `)
      await conn.queryObject(`RESET ROLE`)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: `Enabled on_auth_user_created_subscription trigger (as ${owner})` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'disable-profile-trigger') {
      const ownerResult = await conn.queryObject(`
        SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
      `)
      const owner = (ownerResult.rows[0] as any)?.tableowner || 'supabase_auth_admin'

      await conn.queryObject(`SET ROLE ${owner}`)
      await conn.queryObject(`
        ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created
      `)
      await conn.queryObject(`RESET ROLE`)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: `Disabled on_auth_user_created trigger (as ${owner})` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'enable-profile-trigger') {
      const ownerResult = await conn.queryObject(`
        SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
      `)
      const owner = (ownerResult.rows[0] as any)?.tableowner || 'supabase_auth_admin'

      await conn.queryObject(`SET ROLE ${owner}`)
      await conn.queryObject(`
        ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created
      `)
      await conn.queryObject(`RESET ROLE`)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: `Enabled on_auth_user_created trigger (as ${owner})` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'noop-subscription-fn') {
      // Replace subscription trigger function with a no-op to test
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.create_default_subscription()
        RETURNS trigger AS $$
        BEGIN
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Replaced create_default_subscription with no-op' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'debug-subscription-fn') {
      // Replace subscription trigger function with a logging version that catches the error
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.create_default_subscription()
        RETURNS trigger AS $$
        BEGIN
          BEGIN
            INSERT INTO subscriptions (user_id, tier, status)
            VALUES (NEW.id, 'free', 'active')
            ON CONFLICT (user_id) DO NOTHING;
          EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'create_default_subscription FAILED: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            -- Don't re-raise - let the user creation succeed
          END;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Replaced create_default_subscription with error-catching version' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'test-subscription-insert') {
      // Test the exact INSERT that the trigger does, using a known user ID
      const userResult = await conn.queryObject(`
        SELECT id FROM auth.users LIMIT 1
      `)
      const testUserId = (userResult.rows[0] as any)?.id

      let testResult = 'No users found'
      if (testUserId) {
        try {
          await conn.queryObject('BEGIN')
          // Delete existing subscription for this user first (in rollback)
          await conn.queryObject(`DELETE FROM subscriptions WHERE user_id = $1`, [testUserId])
          // Now try the INSERT
          await conn.queryObject(`
            INSERT INTO subscriptions (user_id, tier, status)
            VALUES ($1, 'free', 'active')
            ON CONFLICT (user_id) DO NOTHING
          `, [testUserId])
          testResult = 'INSERT succeeded'
          await conn.queryObject('ROLLBACK')
        } catch (e) {
          await conn.queryObject('ROLLBACK').catch(() => {})
          testResult = 'INSERT FAILED: ' + (e instanceof Error ? e.message : String(e))
        }
      }

      // Also try without the ON CONFLICT
      let testResult2 = 'No users found'
      if (testUserId) {
        // Check if subscription exists for this user
        const subCheck = await conn.queryObject(`
          SELECT id, user_id, tier, status FROM subscriptions WHERE user_id = $1
        `, [testUserId])

        // Try insert with a NEW UUID (simulating new user)
        const newUserResult = await conn.queryObject(`
          SELECT id FROM auth.users WHERE id NOT IN (SELECT user_id FROM subscriptions) LIMIT 1
        `)
        const newUserId = (newUserResult.rows[0] as any)?.id

        if (newUserId) {
          try {
            await conn.queryObject('BEGIN')
            await conn.queryObject(`
              INSERT INTO subscriptions (user_id, tier, status)
              VALUES ($1, 'free', 'active')
            `, [newUserId])
            testResult2 = `INSERT for user without subscription succeeded (user: ${newUserId})`
            await conn.queryObject('ROLLBACK')
          } catch (e) {
            await conn.queryObject('ROLLBACK').catch(() => {})
            testResult2 = `INSERT for user without subscription FAILED: ` + (e instanceof Error ? e.message : String(e))
          }
        } else {
          testResult2 = 'All users already have subscriptions'
        }
      }

      // Check the test user we just created (from the noop test)
      const testUserSub = await conn.queryObject(`
        SELECT u.id, u.email, s.id as sub_id
        FROM auth.users u
        LEFT JOIN subscriptions s ON s.user_id = u.id
        WHERE u.email LIKE 'testuser_debug_%'
        ORDER BY u.created_at DESC
        LIMIT 5
      `)

      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({
          test_with_existing_user: testResult,
          test_with_user_without_sub: testResult2,
          test_debug_users: testUserSub.rows,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'restore-subscription-fn') {
      // Restore the original subscription trigger function
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.create_default_subscription()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO subscriptions (user_id, tier, status)
          VALUES (NEW.id, 'free', 'active')
          ON CONFLICT (user_id) DO NOTHING;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Restored original create_default_subscription function' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'noop-profile-fn') {
      // Replace profile trigger function with a no-op to test
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Replaced handle_new_user with no-op' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'fix-profile-fn') {
      // Fix the profile trigger function with explicit search_path
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, email, first_name)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(
              NEW.raw_user_meta_data->>'first_name',
              split_part(NEW.email, '@', 1)
            )
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Restored original handle_new_user function' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check-search-path') {
      // Check function SET configurations
      const fnConfig = await conn.queryObject(`
        SELECT proname, proconfig, pronamespace::regnamespace::text as schema
        FROM pg_proc
        WHERE proname IN ('handle_new_user', 'create_default_subscription')
      `)

      // Check default search_path for relevant roles
      const searchPaths = await conn.queryObject(`
        SELECT
          r.rolname,
          (SELECT setting FROM pg_catalog.pg_db_role_setting s
           JOIN pg_catalog.pg_database d ON s.setdatabase = d.oid
           WHERE s.setrole = r.oid
           LIMIT 1) as role_settings
        FROM pg_roles r
        WHERE r.rolname IN ('postgres', 'supabase_auth_admin', 'authenticator')
      `)

      // Check current search_path
      const currentSP = await conn.queryObject(`SHOW search_path`)

      // Check if 'subscriptions' is resolvable
      const resolveTest = await conn.queryObject(`
        SELECT 'public.subscriptions'::regclass::text as resolved
      `)

      // Check the auth admin's search path config
      const authAdminConfig = await conn.queryObject(`
        SELECT setconfig
        FROM pg_db_role_setting s
        JOIN pg_roles r ON s.setrole = r.oid
        WHERE r.rolname = 'supabase_auth_admin'
      `)

      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({
          function_configs: fnConfig.rows,
          role_search_paths: searchPaths.rows,
          current_search_path: currentSP.rows,
          subscriptions_resolved: resolveTest.rows,
          auth_admin_config: authAdminConfig.rows,
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'fix-subscription-fn') {
      // Fix the subscription trigger function:
      // 1. Use schema-qualified table name
      // 2. Set search_path explicitly
      // 3. Add error handling so it never blocks user creation
      await conn.queryObject(`
        CREATE OR REPLACE FUNCTION public.create_default_subscription()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.subscriptions (user_id, tier, status)
          VALUES (NEW.id, 'free', 'active')
          ON CONFLICT (user_id) DO NOTHING;
          RETURN NEW;
        EXCEPTION WHEN OTHERS THEN
          -- Log the error but don't prevent user creation
          RAISE WARNING 'create_default_subscription failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ success: true, message: 'Fixed create_default_subscription with schema-qualified name, explicit search_path, and error handling' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check-auth-users-owner') {
      const ownerResult = await conn.queryObject(`
        SELECT tableowner FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users'
      `)
      const currentRole = await conn.queryObject(`SELECT current_user, session_user`)
      const canSetRole = await conn.queryObject(`
        SELECT rolname FROM pg_roles WHERE pg_has_role(current_user, rolname, 'USAGE')
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({
          auth_users_owner: ownerResult.rows,
          current_role: currentRole.rows,
          available_roles: canSetRole.rows
        }, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'check-trigger-status') {
      const status = await conn.queryObject(`
        SELECT tgname, tgenabled::text
        FROM pg_trigger t
        WHERE t.tgrelid = 'auth.users'::regclass
          AND t.tgname NOT LIKE 'RI_%'
      `)
      conn.release()
      await pool.end()
      return new Response(
        JSON.stringify({ triggers: status.rows }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    conn.release()
    await pool.end()
    return new Response(
      JSON.stringify({ error: 'Use ?action=deep-inspect, disable-subscription-trigger, enable-subscription-trigger, or check-trigger-status' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message + '\n' + (error as any).stack : String(error)
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 500 }
    )
  }
})

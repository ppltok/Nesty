-- FIX: create_default_subscription trigger was causing "Database error saving new user"
--
-- ROOT CAUSE: The trigger function used unqualified table name `subscriptions`
-- instead of `public.subscriptions`. When GoTrue (supabase_auth_admin) inserts
-- into auth.users, the trigger fires but the search_path doesn't include `public`,
-- causing the INSERT INTO subscriptions to fail with a "relation not found" error.
-- This blocked ALL new user signups since approximately March 11, 2026.
--
-- FIX:
-- 1. Schema-qualify the table name: subscriptions → public.subscriptions
-- 2. Add EXCEPTION handler so subscription errors never block user creation
-- 3. Add SET search_path = public as defense-in-depth
--
-- APPLIED DIRECTLY via edge function on 2026-03-13 (already in production)

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

-- Also harden handle_new_user with explicit search_path (it already used public.profiles)
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

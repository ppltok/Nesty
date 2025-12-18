# Supabase Migrations

This folder contains SQL migration files for the Nesty project.

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wopsrjfdaovlyibivijl/sql
2. Click "New Query"
3. Copy and paste the contents of each migration file (in order)
4. Click "Run" to execute

## Migration Files

### 001_fix_profiles_rls.sql
**Status:** ⚠️ REQUIRED - Run this NOW to fix login issues

**What it does:**
- Fixes Row Level Security (RLS) policies on the `profiles` table
- Allows users to view, create, and update their own profiles
- Prevents the infinite loading issue on dashboard/checklist pages

**Why it's needed:**
- Without proper RLS policies, Supabase blocks all queries to the profiles table
- This causes the app to hang when trying to load user data after login

### 002_fix_registries_rls.sql
**Status:** ⚠️ REQUIRED - Run this NOW to fix registry access

**What it does:**
- Fixes Row Level Security (RLS) policies on the `registries` table
- Allows users to view, create, update, and delete their own registries
- Ensures registry data loads correctly

**Why it's needed:**
- Ensures users can access their registry data
- Prevents authorization errors when managing registries

## Quick Start

Copy and paste this into Supabase SQL Editor to run both migrations at once:

```sql
-- Migration 001: Fix profiles RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Migration 002: Fix registries RLS
DROP POLICY IF EXISTS "Owners can manage their registry" ON registries;
DROP POLICY IF EXISTS "Users can view own registry" ON registries;
DROP POLICY IF EXISTS "Users can insert own registry" ON registries;
DROP POLICY IF EXISTS "Users can update own registry" ON registries;

CREATE POLICY "Users can view own registry"
  ON registries FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own registry"
  ON registries FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own registry"
  ON registries FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own registry"
  ON registries FOR DELETE
  USING (owner_id = auth.uid());

ALTER TABLE registries ENABLE ROW LEVEL SECURITY;
```

## After Running Migrations

1. Refresh your browser at http://localhost:5173/dashboard
2. The app should now load without hanging
3. You should see your profile and registry data

## Troubleshooting

If the app still hangs after running migrations:
1. Check browser console for errors (F12 → Console)
2. Check Supabase logs: https://supabase.com/dashboard/project/wopsrjfdaovlyibivijl/logs/explorer
3. Verify policies were created: Run `SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'registries');`

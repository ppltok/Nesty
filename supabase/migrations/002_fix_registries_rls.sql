-- Fix RLS policies for registries table
-- This ensures users can read and manage their own registries
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wopsrjfdaovlyibivijl/sql

-- Drop existing policies
DROP POLICY IF EXISTS "Owners can manage their registry" ON registries;
DROP POLICY IF EXISTS "Users can view own registry" ON registries;
DROP POLICY IF EXISTS "Users can insert own registry" ON registries;
DROP POLICY IF EXISTS "Users can update own registry" ON registries;

-- Create correct RLS policies
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

-- Ensure RLS is enabled
ALTER TABLE registries ENABLE ROW LEVEL SECURITY;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'registries';

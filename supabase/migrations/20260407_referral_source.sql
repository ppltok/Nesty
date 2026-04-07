-- ============================================================
-- Migration: Add referral_source to profiles for "How did you hear about us?"
-- Date: 2026-04-07
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_source TEXT;

COMMENT ON COLUMN profiles.referral_source IS
  'How the user heard about Nesty. Collected during onboarding. Values: facebook, instagram, google, tiktok, friend, other';

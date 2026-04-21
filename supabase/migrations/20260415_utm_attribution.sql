-- ============================================================
-- Migration: Add UTM attribution columns to profiles
-- Date: 2026-04-15
-- Purpose: Capture which link/campaign brought the user to Nesty
--          so we can attribute signups back to Facebook ads,
--          Google Ads, Instagram posts, email campaigns, etc.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS landing_referrer TEXT;

COMMENT ON COLUMN profiles.utm_source IS 'UTM source param (e.g. facebook, google, instagram, newsletter)';
COMMENT ON COLUMN profiles.utm_medium IS 'UTM medium param (e.g. cpc, social, email, organic)';
COMMENT ON COLUMN profiles.utm_campaign IS 'UTM campaign name (e.g. spring_launch_2026)';
COMMENT ON COLUMN profiles.utm_content IS 'UTM content variant (e.g. video_ad_v2)';
COMMENT ON COLUMN profiles.utm_term IS 'UTM term / paid keyword';
COMMENT ON COLUMN profiles.landing_page IS 'First page path the user landed on';
COMMENT ON COLUMN profiles.landing_referrer IS 'document.referrer when user first arrived';

-- Helpful index for dashboard queries grouping by campaign / source
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON profiles(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_utm_campaign ON profiles(utm_campaign) WHERE utm_campaign IS NOT NULL;

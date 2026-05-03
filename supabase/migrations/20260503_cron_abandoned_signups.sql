-- 20260503: Schedule notify-abandoned-signups every 5 minutes via pg_cron.
--
-- Companion to 20260503_signup_notification_flags.sql. The edge function at
-- /functions/v1/notify-abandoned-signups picks up signups that are 10+ min
-- old, never finished onboarding, and haven't been notified yet — and emails
-- hello@nestyil.com.
--
-- Prereqs (one-time, set up in Supabase Dashboard before applying this
-- migration):
--   1. Enable pg_cron and pg_net extensions
--      (Database > Extensions in the Supabase dashboard).
--   2. Store the project's service-role key in Vault under the name
--      `service_role_key` (Database > Vault > New secret). The cron job
--      reads it from vault.decrypted_secrets so the key never lives in
--      plaintext SQL.
--   3. (Optional) update `app.functions_base_url` if running on a non-prod
--      project. Defaults to the production functions URL.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent: drop any prior schedule with the same name before re-creating.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notify-abandoned-signups') THEN
    PERFORM cron.unschedule('notify-abandoned-signups');
  END IF;
END $$;

SELECT cron.schedule(
  'notify-abandoned-signups',
  '*/5 * * * *',  -- every 5 minutes
  $$
  SELECT net.http_post(
    url     := 'https://wopsrjfdaovlyibivijl.supabase.co/functions/v1/notify-abandoned-signups',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'service_role_key'
        LIMIT 1
      )
    ),
    body    := '{}'::jsonb
  );
  $$
);

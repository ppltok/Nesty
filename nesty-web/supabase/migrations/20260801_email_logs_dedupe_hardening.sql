-- Root cause of the Supherb new_users duplicate-send incident (89 people got
-- the same promo 5-10 times):
--
--   1. email_logs.email_type had an allowlist CHECK that did not include
--      'collab_supherb'. The dedup INSERT was rejected.
--   2. The caller never checked the returned error, so the rejection was silent.
--   3. The dedup READ then never found the row, so a daily cron re-sent forever.
--
-- The allowlist is the wrong shape: every campaign invents a new key, so it
-- turns "new campaign" into "silent duplicate sends". 'feature_drop_coparent'
-- was rejected by it too, which is why send-feature-drop had zero log rows
-- despite having run.

alter table public.email_logs drop constraint if exists email_logs_email_type_check;
alter table public.email_logs
  add constraint email_logs_email_type_sane
  check (email_type is not null and length(email_type) between 1 and 64);

-- Opt-in structural guarantee. A send path that must reach a person only once
-- sets dedupe_key (e.g. 'collab_supherb:someone@example.com'). The unique index
-- then makes a second send impossible at the database level, regardless of
-- whether the application logic is correct.
alter table public.email_logs add column if not exists dedupe_key text;

create unique index if not exists email_logs_dedupe_key_uniq
  on public.email_logs (dedupe_key)
  where dedupe_key is not null;

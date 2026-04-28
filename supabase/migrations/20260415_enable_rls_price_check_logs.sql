-- ============================================
-- SECURITY FIX: Enable RLS on price_check_logs
-- ============================================
-- The price_check_logs table was created without Row-Level Security,
-- making it publicly readable/writable by anyone with the project's
-- anon key. This audit log is only written/read by the price monitor
-- Edge Function (which uses the service_role key and bypasses RLS),
-- so we enable RLS with no policies to deny all access from anon and
-- authenticated roles.

ALTER TABLE public.price_check_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well, so even superuser-equivalent
-- roles must go through policies (defense in depth).
ALTER TABLE public.price_check_logs FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE public.price_check_logs IS
  'Audit log for daily price monitoring agent runs. RLS enabled with no policies — only accessible via service_role (Edge Functions).';

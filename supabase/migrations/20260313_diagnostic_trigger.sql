-- Temporary diagnostic function to inspect triggers
CREATE OR REPLACE FUNCTION public.get_trigger_info()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'triggers', (
      SELECT json_agg(json_build_object(
        'trigger_name', tgname,
        'enabled', tgenabled::text,
        'function_name', proname,
        'function_source', prosrc
      ))
      FROM pg_trigger t
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE t.tgrelid = 'auth.users'::regclass
    ),
    'profiles_columns', (
      SELECT json_agg(json_build_object(
        'column_name', column_name,
        'data_type', data_type,
        'is_nullable', is_nullable,
        'column_default', column_default
      ) ORDER BY ordinal_position)
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

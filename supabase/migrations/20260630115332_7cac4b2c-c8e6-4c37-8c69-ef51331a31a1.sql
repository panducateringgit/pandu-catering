REVOKE EXECUTE ON FUNCTION public.is_admin(check_email text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(check_email text) TO service_role;
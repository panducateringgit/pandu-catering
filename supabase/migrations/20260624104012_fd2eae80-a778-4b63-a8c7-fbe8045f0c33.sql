
-- Lock admin_allowlist down (no direct access; SECURITY DEFINER fns still read it)
REVOKE ALL ON public.admin_allowlist FROM anon, authenticated;

-- Restrict SECURITY DEFINER fns; policies still evaluate them server-side
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;

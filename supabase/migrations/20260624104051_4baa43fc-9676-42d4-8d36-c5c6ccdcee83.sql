
-- Public read (via signed URLs the app generates; anon can also SELECT for createSignedUrl)
CREATE POLICY "Public reads gallery files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('gallery','menu'));

CREATE POLICY "Admins upload gallery files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('gallery','menu') AND public.is_admin());

CREATE POLICY "Admins update gallery files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('gallery','menu') AND public.is_admin())
  WITH CHECK (bucket_id IN ('gallery','menu') AND public.is_admin());

CREATE POLICY "Admins delete gallery files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('gallery','menu') AND public.is_admin());

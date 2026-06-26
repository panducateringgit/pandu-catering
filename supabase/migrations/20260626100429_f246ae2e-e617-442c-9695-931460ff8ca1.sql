
-- 1) Seed gallery_media with the 8 owner-supplied photos (idempotent)
INSERT INTO public.gallery_media (media_type, url, caption, sort_order, featured)
VALUES
  ('image', '/__l5e/assets-v1/ac561e9a-6907-4cb5-85be-562350a2a5fc/pandu-gallery-1.jpg'::text, 'Andhra-style gutti vankaya curry', 1, true),
  ('image', '/__l5e/assets-v1/a0dc2103-9a96-4376-9e1e-805dd69efd93/pandu-gallery-2.jpg', 'Rich paneer butter masala', 2, true),
  ('image', '/__l5e/assets-v1/a68d4a61-8a20-4281-9a3b-f3547c8849ed/pandu-gallery-3.jpg', 'Mushroom matar curry', 3, false),
  ('image', '/__l5e/assets-v1/32ff54a8-09a1-4119-b6d5-10c1c1d5abad/pandu-gallery-4.jpg', 'Homemade dry-fruit energy laddoos', 4, false),
  ('image', '/__l5e/assets-v1/8229d0ee-4152-4224-9127-327faa07a9b1/pandu-gallery-5.jpg', 'Sunnundalu (urad dal laddoos)', 5, false),
  ('image', '/__l5e/assets-v1/4842fb31-9430-4b7d-b40a-7f47715cb5ce/pandu-gallery-6.jpg', 'Fresh stuffed bobbatlu / puran poli', 6, false),
  ('image', '/__l5e/assets-v1/dcc331d3-7878-4f53-bed7-72e5de1d16f6/pandu-gallery-7.jpg', 'Boondi laddoos with cashews', 7, false),
  ('image', '/__l5e/assets-v1/4ec6bb98-f16a-4f9b-b477-78b352af8a2d/pandu-gallery-8.jpg', 'Crispy karjikayalu / gujiya', 8, false)
ON CONFLICT DO NOTHING;

-- 2) Overloaded is_admin(check_email text): pure allowlist check, no row exposure
CREATE OR REPLACE FUNCTION public.is_admin(check_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_allowlist
    WHERE lower(email) = lower(coalesce(check_email, ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(text) TO authenticated;

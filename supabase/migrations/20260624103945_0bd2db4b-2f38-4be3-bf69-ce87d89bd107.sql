
-- 1. Admin allowlist
CREATE TABLE public.admin_allowlist (
  email TEXT PRIMARY KEY,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_allowlist TO authenticated;
GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
-- No public policies; only service_role and SECURITY DEFINER fns read it.

INSERT INTO public.admin_allowlist(email, note) VALUES ('pandudoddi71@gmail.com', 'Owner');

-- 2. is_admin() helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.admin_allowlist a
        WHERE lower(a.email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
      )
      OR EXISTS (
        SELECT 1 FROM public.user_roles r
        WHERE r.user_id = auth.uid() AND r.role = 'admin'
      )
    )
$$;

-- 3. pricing_plans
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price_label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('veg','non-veg')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pricing_plans TO authenticated;
GRANT ALL ON public.pricing_plans TO service_role;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active pricing" ON public.pricing_plans
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage pricing" ON public.pricing_plans
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER pricing_plans_touch BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. gallery_images (new, replaces gallery_media for UI)
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads gallery" ON public.gallery_images
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER gallery_images_touch BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Migrate existing gallery_media rows (image type only) into gallery_images
INSERT INTO public.gallery_images (image_url, alt_text, caption, sort_order, created_at)
SELECT url, COALESCE(caption, 'Pandu Catering gallery image'), caption, sort_order, created_at
FROM public.gallery_media
WHERE media_type = 'image';

-- 5. menu_items: add storage_path for uploaded images
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 6. Replace has_role-based admin policies with is_admin() across content tables
DROP POLICY IF EXISTS "Admins manage menu" ON public.menu_items;
CREATE POLICY "Admins manage menu" ON public.menu_items
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read active menu" ON public.menu_items;
CREATE POLICY "Public reads active menu" ON public.menu_items
  FOR SELECT TO anon, authenticated USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage gallery" ON public.gallery_media;
CREATE POLICY "Admins manage gallery" ON public.gallery_media
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage event types" ON public.event_types;
CREATE POLICY "Admins manage event types" ON public.event_types
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- bookings + booking_slots: keep public insert for bookings, admin manages
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('bookings','booking_slots')
      AND policyname ILIKE 'Admin%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',
      pol.policyname,
      (SELECT tablename FROM pg_policies WHERE policyname = pol.policyname LIMIT 1));
  END LOOP;
END $$;

CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage booking slots" ON public.booking_slots
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- user_roles: admins manage
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Seed pricing_plans with three starter cards
INSERT INTO public.pricing_plans (title, price_label, category, features, is_popular, sort_order) VALUES
('Veg Basic', '₹120/plate', 'veg',
  '["Welcome drink","2 starters","Main course (3 curries)","Rice, roti, dal","1 dessert","Service staff included"]'::jsonb, false, 1),
('Veg Premium', '₹180/plate', 'veg',
  '["Welcome drink + mocktail","4 starters (2 paneer)","Main course (5 curries)","Biryani, rice, naan, roti","2 desserts","Live counters","Premium service staff"]'::jsonb, true, 2),
('Non-Veg Premium', '₹250/plate', 'non-veg',
  '["Welcome drink + mocktail","3 veg + 3 non-veg starters","Chicken, mutton & fish curries","Hyderabadi biryani, naan, roti","Dal, rice, salad","3 desserts incl. ice cream","Live counters + premium staff"]'::jsonb, false, 3);

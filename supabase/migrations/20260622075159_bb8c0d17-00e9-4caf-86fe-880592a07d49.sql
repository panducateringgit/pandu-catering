
-- ============================================
-- ROLES (admin gate)
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============================================
-- Shared updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============================================
-- SITE SETTINGS (key/value)
-- ============================================
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_touch BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (key, value) VALUES
  ('hero_title', 'Delicious, Authentic & Affordable Catering in Hyderabad'),
  ('hero_subtitle', 'South Indian specialty catering with doorstep delivery, hygienic preparation & top-rated taste.'),
  ('hero_video_url', ''),
  ('phone', '+919959630445'),
  ('whatsapp', '919959630445'),
  ('email', 'hello@panducatering.in'),
  ('address', 'Hyderabad, Telangana, India'),
  ('map_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.31893694247!2d78.24323148671873!3d17.412281100000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sHyderabad!5e0!3m2!1sen!2sin!4v1700000000000'),
  ('play_store_url', '#'),
  ('about_story', 'Pandu Catering was born in the bylanes of Hyderabad with one promise — to serve authentic South Indian flavours at every celebration. From cozy house parties to grand weddings, we bring the warmth of home-cooked taste, the discipline of a professional kitchen, and the soul of Telugu hospitality to every plate we serve.'),
  ('about_mission', 'High-quality ingredients, hygienic preparation, fair pricing, and on-time doorstep delivery — every single time.'),
  ('social_instagram', '#'),
  ('social_facebook', '#'),
  ('social_youtube', '#');

-- ============================================
-- MENU ITEMS
-- ============================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'South Indian','North Indian','Chinese','Snacks','Desserts','Beverages'
  is_veg BOOLEAN NOT NULL DEFAULT true,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active menu" ON public.menu_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage menu" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER menu_items_touch BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed menu items
INSERT INTO public.menu_items (name, description, category, is_veg, price, sort_order) VALUES
  ('Hyderabadi Chicken Biryani', 'Long-grain basmati, slow-dum cooked with marinated chicken and aromatic spices.', 'South Indian', false, 320, 1),
  ('Veg Dum Biryani', 'Fragrant biryani with mixed vegetables, mint and saffron.', 'South Indian', true, 250, 2),
  ('Andhra Mutton Curry', 'Spicy Andhra-style mutton curry with curry leaves and red chilli.', 'South Indian', false, 380, 3),
  ('Masala Dosa', 'Crispy rice & lentil crepe with spiced potato filling, chutney and sambar.', 'South Indian', true, 90, 4),
  ('Idli Sambar (4 pcs)', 'Soft steamed rice cakes with hot sambar and coconut chutney.', 'South Indian', true, 80, 5),
  ('Paneer Butter Masala', 'Cottage cheese in a creamy tomato-cashew gravy.', 'North Indian', true, 240, 10),
  ('Dal Makhani', 'Slow-cooked black lentils with cream and butter.', 'North Indian', true, 200, 11),
  ('Butter Naan', 'Soft tandoor naan brushed with butter.', 'North Indian', true, 40, 12),
  ('Chicken Tikka Masala', 'Charred chicken tikka in a rich tomato gravy.', 'North Indian', false, 290, 13),
  ('Veg Manchurian', 'Indo-Chinese veg balls in tangy soy-garlic gravy.', 'Chinese', true, 180, 20),
  ('Chilli Chicken', 'Crispy chicken tossed in spicy chilli sauce.', 'Chinese', false, 240, 21),
  ('Hakka Noodles', 'Wok-tossed noodles with seasonal veg.', 'Chinese', true, 160, 22),
  ('Onion Pakora', 'Crispy gram-flour onion fritters.', 'Snacks', true, 80, 30),
  ('Chicken 65', 'Spicy deep-fried chicken bites, Hyderabadi style.', 'Snacks', false, 220, 31),
  ('Mirchi Bajji', 'Stuffed green chilli fritters.', 'Snacks', true, 60, 32),
  ('Double Ka Meetha', 'Classic Hyderabadi bread pudding with saffron & nuts.', 'Desserts', true, 120, 40),
  ('Gulab Jamun (2 pcs)', 'Soft milk dumplings soaked in cardamom syrup.', 'Desserts', true, 60, 41),
  ('Mango Lassi', 'Chilled yogurt drink with sweet mango pulp.', 'Beverages', true, 80, 50),
  ('Masala Chai', 'Spiced Indian milk tea.', 'Beverages', true, 30, 51),
  ('Filter Coffee', 'Authentic South Indian filter coffee.', 'Beverages', true, 40, 52);

-- ============================================
-- EVENT TYPES (cards on home)
-- ============================================
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_types TO anon, authenticated;
GRANT ALL ON public.event_types TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.event_types TO authenticated;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read event types" ON public.event_types
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage event types" ON public.event_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER event_types_touch BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.event_types (name, description, sort_order) VALUES
  ('Weddings & Engagements', 'Grand multi-cuisine spreads with live counters for your big day.', 1),
  ('Corporate Events', 'Reliable, on-time corporate catering with hygienic packaging.', 2),
  ('Birthday Parties', 'Customisable kid-friendly and adult menus with snacks & desserts.', 3),
  ('House Parties', 'Compact, authentic Hyderabadi spreads at your doorstep.', 4),
  ('Family Functions', 'Naming ceremonies, housewarmings, traditional pujas and more.', 5),
  ('Other Events', 'Tell us your occasion — we will craft the right menu.', 6);

-- ============================================
-- GALLERY MEDIA
-- ============================================
CREATE TABLE public.gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' or 'video'
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_media TO anon, authenticated;
GRANT ALL ON public.gallery_media TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.gallery_media TO authenticated;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery" ON public.gallery_media
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- BOOKING SLOTS
-- ============================================
CREATE TABLE public.booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL, -- e.g. 'Lunch','Dinner','12:00','19:00'
  available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_date, slot_time)
);
GRANT SELECT ON public.booking_slots TO anon, authenticated;
GRANT ALL ON public.booking_slots TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.booking_slots TO authenticated;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view slots" ON public.booking_slots
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage slots" ON public.booking_slots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed: next 30 days, lunch + dinner
INSERT INTO public.booking_slots (slot_date, slot_time, available)
SELECT d::date, t, true
FROM generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', INTERVAL '1 day') d
CROSS JOIN (VALUES ('Lunch'),('Dinner')) AS s(t);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  veg_pref TEXT NOT NULL, -- 'Veg','Non-Veg','Both'
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  with_servers BOOLEAN NOT NULL DEFAULT false,
  guest_count INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_address TEXT NOT NULL,
  notes TEXT,
  selected_items JSONB,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending/Confirmed/Cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a booking" ON public.bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_touch BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

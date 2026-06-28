
INSERT INTO public.gallery_media (media_type, url, caption, sort_order, featured) VALUES
  ('image', '/__l5e/assets-v1/ed3e4429-507e-4075-8e72-1b876b4f89be/pandu-gallery-9.png', 'Festive spread — sweets, rotis & curries', 9, true);

UPDATE public.gallery_media SET caption = 'Andhra-style brinjal curry' WHERE caption ILIKE '%gutti vankaya%';

DELETE FROM public.menu_items WHERE name ILIKE '%gutti vankaya%' OR name ILIKE '%vankaya%';

INSERT INTO public.menu_items (name, description, category, is_veg, price, active, sort_order) VALUES
  ('Idli (4 pcs)', 'Soft steamed rice cakes with sambar & coconut chutney', 'Morning Tiffins', true, 70, true, 1),
  ('Masala Dosa', 'Crispy dosa stuffed with spiced potato masala', 'Morning Tiffins', true, 90, true, 2),
  ('Plain Dosa', 'Golden crisp dosa with chutney & sambar', 'Morning Tiffins', true, 70, true, 3),
  ('Medu Vada (2 pcs)', 'Crisp lentil donuts with sambar', 'Morning Tiffins', true, 60, true, 4),
  ('Ven Pongal', 'Creamy rice-and-lentil porridge tempered with ghee, cumin & pepper', 'Morning Tiffins', true, 80, true, 5),
  ('Rava Upma', 'Semolina cooked with veggies, curry leaves & mustard', 'Morning Tiffins', true, 70, true, 6),
  ('Onion Uttapam', 'Thick dosa topped with onions, chilli & coriander', 'Morning Tiffins', true, 90, true, 7),
  ('Poori with Aloo Curry', 'Fluffy fried bread with masala potato curry', 'Morning Tiffins', true, 90, true, 8),
  ('Mysore Bonda', 'Soft deep-fried bonda with coconut chutney', 'Morning Tiffins', true, 60, true, 9),
  ('Egg Dosa', 'Plain dosa topped with seasoned egg', 'Morning Tiffins', false, 110, true, 10),

  ('South Indian Veg Thali', 'Rice, sambar, rasam, 2 curries, curd, papad, pickle & sweet', 'Afternoon Lunch', true, 180, true, 1),
  ('Andhra Meals (Veg)', 'Rice, pappu, sambar, rasam, 2 curries, gongura pickle, papad', 'Afternoon Lunch', true, 200, true, 2),
  ('Andhra Meals (Non-Veg)', 'Veg thali + chicken curry / fish fry', 'Afternoon Lunch', false, 280, true, 3),
  ('Veg Dum Biryani', 'Fragrant basmati biryani with mixed veggies & raita', 'Afternoon Lunch', true, 220, true, 4),
  ('Hyderabadi Chicken Biryani (Lunch)', 'Slow-cooked dum biryani with marinated chicken', 'Afternoon Lunch', false, 290, true, 5),
  ('Mutton Biryani', 'Aromatic dum biryani with tender mutton', 'Afternoon Lunch', false, 360, true, 6),
  ('Fish Curry', 'Coastal-style tangy fish curry with rice', 'Afternoon Lunch', false, 280, true, 7),
  ('Chicken Curry', 'Country-style chicken in onion-tomato gravy', 'Afternoon Lunch', false, 260, true, 8),
  ('Mutton Curry', 'Slow-cooked mutton in spicy Andhra gravy', 'Afternoon Lunch', false, 340, true, 9),
  ('Bagara Rice + Mirchi Ka Salan', 'Hyderabadi staple combo', 'Afternoon Lunch', true, 180, true, 10),
  ('Curd Rice', 'Cooling tempered curd rice with pickle', 'Afternoon Lunch', true, 80, true, 11),

  ('Onion Pakora', 'Crispy spiced onion fritters', 'Evening Snacks', true, 70, true, 1),
  ('Mirchi Bajji (Evening)', 'Stuffed chilli fritters — Hyderabadi favourite', 'Evening Snacks', true, 60, true, 2),
  ('Punugulu', 'Crisp Andhra batter fritters with chutney', 'Evening Snacks', true, 70, true, 3),
  ('Samosa (2 pcs)', 'Flaky samosas with potato-pea filling', 'Evening Snacks', true, 50, true, 4),
  ('Masala Vada', 'Crunchy chana-dal vadas with chutney', 'Evening Snacks', true, 60, true, 5),
  ('Cut Mirchi', 'Hyderabadi street-style chopped chilli bajji', 'Evening Snacks', true, 70, true, 6),
  ('Bajji Platter', 'Onion, potato & chilli bajjis assortment', 'Evening Snacks', true, 120, true, 7),
  ('Chicken 65 (Evening)', 'Spicy fried chicken with curry leaves', 'Evening Snacks', false, 220, true, 8),
  ('Chicken Lollipop (4 pcs)', 'Marinated drumettes deep-fried', 'Evening Snacks', false, 240, true, 9),
  ('Egg Bonda', 'Boiled egg dipped in spiced batter & fried', 'Evening Snacks', false, 90, true, 10),
  ('Evening Masala Chai', 'Cardamom-ginger chai', 'Evening Snacks', true, 30, true, 11),
  ('Evening Filter Coffee', 'Strong South-Indian filter coffee', 'Evening Snacks', true, 40, true, 12),

  ('Chapati + Veg Curry', '3 chapatis with choice of veg curry', 'Night Dinners', true, 140, true, 1),
  ('Butter Naan + Paneer Butter Masala', 'Soft naans with creamy paneer gravy', 'Night Dinners', true, 220, true, 2),
  ('Dal Tadka + Jeera Rice', 'Yellow dal tempered with ghee & cumin rice', 'Night Dinners', true, 160, true, 3),
  ('Veg Fried Rice + Manchurian', 'Indo-Chinese combo with gravy manchurian', 'Night Dinners', true, 180, true, 4),
  ('Chicken Biryani (Dinner)', 'Hyderabadi dum biryani — dinner portion', 'Night Dinners', false, 290, true, 5),
  ('Mutton Curry + Rice', 'Spicy mutton gravy with steamed rice', 'Night Dinners', false, 320, true, 6),
  ('Chicken Tandoori (Half)', 'Charcoal-grilled marinated half chicken', 'Night Dinners', false, 280, true, 7),
  ('Tawa Roti + Mixed Veg', '3 tawa rotis with mixed-veg sabzi', 'Night Dinners', true, 150, true, 8),
  ('Pulao + Raita', 'Light vegetable pulao with cooling raita', 'Night Dinners', true, 160, true, 9),
  ('Fish Fry + Rice', 'Andhra masala fish fry with steamed rice', 'Night Dinners', false, 280, true, 10);

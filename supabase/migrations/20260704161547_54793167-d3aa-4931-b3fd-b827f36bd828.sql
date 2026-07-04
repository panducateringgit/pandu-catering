
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;

CREATE POLICY "Public can submit valid bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  guest_count IS NOT NULL
  AND guest_count BETWEEN 1 AND 5000
  AND length(trim(customer_name)) BETWEEN 2 AND 100
  AND length(trim(phone)) BETWEEN 7 AND 20
  AND length(trim(event_address)) BETWEEN 5 AND 500
  AND slot_date IS NOT NULL
  AND slot_date >= (current_date - INTERVAL '1 day')
);

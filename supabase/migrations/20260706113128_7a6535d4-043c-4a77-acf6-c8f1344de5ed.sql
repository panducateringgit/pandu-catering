UPDATE public.gallery_media
SET url = '/assets/gallery/' || split_part(url, '/', 5)
WHERE url LIKE '/__l5e/assets-v1/%';
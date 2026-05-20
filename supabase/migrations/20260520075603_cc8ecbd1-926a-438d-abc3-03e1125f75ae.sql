
-- 1. Add photo_url to testimonials
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Default new testimonials to unpublished (pending moderation)
ALTER TABLE public.testimonials ALTER COLUMN published SET DEFAULT false;

-- 3. Allow anyone to submit a testimonial, but only as pending (published = false)
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON public.testimonials;
CREATE POLICY "Anyone can submit testimonials"
ON public.testimonials
FOR INSERT
TO anon, authenticated
WITH CHECK (published = false);

-- 4. Storage bucket for testimonial photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-photos', 'testimonial-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Testimonial photos public read" ON storage.objects;
CREATE POLICY "Testimonial photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonial-photos');

DROP POLICY IF EXISTS "Anyone can upload testimonial photos" ON storage.objects;
CREATE POLICY "Anyone can upload testimonial photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'testimonial-photos');

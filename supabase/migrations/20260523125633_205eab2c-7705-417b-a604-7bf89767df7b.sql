-- 1. Revoke EXECUTE on has_role from public roles (it still works inside RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;

-- 2. Tighten "always true" INSERT policies with basic input validation

-- messages
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Anyone can insert messages"
  ON public.messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND char_length(message) BETWEEN 1 AND 5000
    AND (subject IS NULL OR char_length(subject) <= 300)
  );

-- orders
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders"
  ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(customer_name) BETWEEN 1 AND 200
    AND char_length(customer_phone) BETWEEN 3 AND 50
    AND char_length(customer_address) BETWEEN 1 AND 1000
    AND total >= 0
    AND jsonb_typeof(items) = 'array'
  );

-- 3. Restrict testimonial-photos uploads (type, size, folder)
DROP POLICY IF EXISTS "Anyone can upload testimonial photos" ON storage.objects;
CREATE POLICY "Anyone can upload testimonial photos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'testimonial-photos'
    AND (storage.foldername(name))[1] = 'submissions'
    AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
    AND COALESCE((metadata->>'size')::bigint, 0) <= 5242880
    AND COALESCE(metadata->>'mimetype','') IN ('image/jpeg','image/png','image/webp','image/gif')
  );

-- 4. Admin update/delete policies for testimonial-photos bucket
DROP POLICY IF EXISTS "Admins can update testimonial photos" ON storage.objects;
CREATE POLICY "Admins can update testimonial photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'testimonial-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete testimonial photos" ON storage.objects;
CREATE POLICY "Admins can delete testimonial photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'testimonial-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

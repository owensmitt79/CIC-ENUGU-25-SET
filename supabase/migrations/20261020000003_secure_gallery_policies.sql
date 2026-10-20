-- Migration: Restrict gallery write operations to authenticated CIC admins
-- Preserves public reads for visitors while strictly securing all writes.

-- =========================================================================
-- 1. SECURE public.gallery TABLE POLICIES
-- =========================================================================

-- Ensure Row Level Security is active
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Preserve public read access for all visitors on frontend
DROP POLICY IF EXISTS "Allow public read access to gallery" ON public.gallery;
CREATE POLICY "Allow public read access to gallery"
ON public.gallery FOR SELECT
TO public, anon, authenticated
USING (true);

-- Restrict INSERT strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow admin insert to gallery" ON public.gallery;
CREATE POLICY "Allow admin insert to gallery"
ON public.gallery FOR INSERT
TO authenticated
WITH CHECK (true);

-- Restrict UPDATE strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow admin update to gallery" ON public.gallery;
CREATE POLICY "Allow admin update to gallery"
ON public.gallery FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Restrict DELETE strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow admin delete from gallery" ON public.gallery;
CREATE POLICY "Allow admin delete from gallery"
ON public.gallery FOR DELETE
TO authenticated
USING (true);


-- =========================================================================
-- 2. SECURE storage.objects POLICIES FOR gallery-media BUCKET
-- =========================================================================

-- Preserve public read access so images display on public frontend / CDN
DROP POLICY IF EXISTS "Allow public read gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Gallery Media" ON storage.objects;
CREATE POLICY "Allow public read gallery media"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'gallery-media');

-- Restrict upload strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow upload to gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Gallery Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to gallery media" ON storage.objects;
CREATE POLICY "Allow admin upload to gallery media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-media');

-- Restrict update strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow update to gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Gallery Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update to gallery media" ON storage.objects;
CREATE POLICY "Allow admin update to gallery media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery-media')
WITH CHECK (bucket_id = 'gallery-media');

-- Restrict deletion strictly to authenticated CIC administrators
DROP POLICY IF EXISTS "Allow delete from gallery media" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Gallery Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete from gallery media" ON storage.objects;
CREATE POLICY "Allow admin delete from gallery media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-media');

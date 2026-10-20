-- Migration: Create public gallery-media bucket and configure Storage RLS policies

-- 1. Insert or update the public gallery-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'gallery-media',
    'gallery-media',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Policy: Public view/read for gallery-media objects
DROP POLICY IF EXISTS "Allow public read gallery media" ON storage.objects;
CREATE POLICY "Allow public read gallery media"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'gallery-media');

-- 3. Policy: Public/admin upload to gallery-media
DROP POLICY IF EXISTS "Allow upload to gallery media" ON storage.objects;
CREATE POLICY "Allow upload to gallery media"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'gallery-media');

-- 4. Policy: Public/admin update to gallery-media
DROP POLICY IF EXISTS "Allow update to gallery media" ON storage.objects;
CREATE POLICY "Allow update to gallery media"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'gallery-media');

-- 5. Policy: Public/admin delete from gallery-media
DROP POLICY IF EXISTS "Allow delete from gallery media" ON storage.objects;
CREATE POLICY "Allow delete from gallery media"
ON storage.objects FOR DELETE
TO public, anon, authenticated
USING (bucket_id = 'gallery-media');

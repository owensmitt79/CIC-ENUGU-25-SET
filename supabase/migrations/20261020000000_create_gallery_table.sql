-- Migration: Create gallery table for Alumni Photo Gallery
-- Run this in Supabase SQL Editor if not automatically applied

CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY DEFAULT ('gal-' || substr(md5(random()::text), 1, 12)),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Reunions',
    image TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- 1. Allow public read access to all published gallery photos
CREATE POLICY "Allow public read access to gallery"
ON public.gallery FOR SELECT
TO public, anon, authenticated
USING (true);

-- 2. Allow administrative insertions into gallery
CREATE POLICY "Allow admin insert to gallery"
ON public.gallery FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- 3. Allow administrative updates to gallery
CREATE POLICY "Allow admin update to gallery"
ON public.gallery FOR UPDATE
TO public, anon, authenticated
USING (true);

-- 4. Allow administrative deletions from gallery
CREATE POLICY "Allow admin delete from gallery"
ON public.gallery FOR DELETE
TO public, anon, authenticated
USING (true);

-- Grant permissions to anon and authenticated roles
GRANT ALL ON TABLE public.gallery TO anon, authenticated, service_role;

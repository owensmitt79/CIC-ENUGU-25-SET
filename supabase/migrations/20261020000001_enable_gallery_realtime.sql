-- Enable Realtime publication for gallery table so updates reflect immediately
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'gallery'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
    END IF;
END $$;

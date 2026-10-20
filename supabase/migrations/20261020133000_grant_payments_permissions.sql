-- Migration: Setup and secure public.payments table for Contributions Ledger
-- Enables transparent public zero-login reads and remittance insertions,
-- while reserving administrative modifications for authenticated users.

-- 1. Ensure public.payments table exists
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(100) UNIQUE NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  member_id VARCHAR(50),
  project_id VARCHAR(60),
  payer_name VARCHAR(200) NOT NULL,
  payer_email VARCHAR(150),
  payer_phone VARCHAR(50),
  payer_class_year VARCHAR(50) DEFAULT 'Class of 1995',
  category_id VARCHAR(50),
  payment_type VARCHAR(100) NOT NULL,
  selected_months TEXT[] DEFAULT '{}',
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  gateway VARCHAR(50) NOT NULL DEFAULT 'Paystack',
  channel VARCHAR(100) NOT NULL DEFAULT 'Debit Card',
  status VARCHAR(50) NOT NULL DEFAULT 'Successful',
  item_description TEXT,
  paid_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Grant table and sequence permissions to anon, authenticated, and service_role
GRANT ALL ON TABLE public.payments TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Public read access for the transparent Contributions Ledger
DROP POLICY IF EXISTS "Public can view verified payments in ledger" ON public.payments;
DROP POLICY IF EXISTS "Public can verify payment by reference or receipt" ON public.payments;
CREATE POLICY "Public can view verified payments in ledger"
ON public.payments FOR SELECT
TO anon, authenticated
USING (true);

-- 5. RLS Policy: Zero-login payment submission from public checkout
DROP POLICY IF EXISTS "Public zero-login checkout can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Public can insert payments" ON public.payments;
CREATE POLICY "Public can insert payments"
ON public.payments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. RLS Policies: Administrative controls for updates and deletions
DROP POLICY IF EXISTS "Admins have full payment access" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE
TO authenticated
USING (true);

-- 7. Add public.payments to Realtime publication for instant live ledger streaming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;

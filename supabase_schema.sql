-- ============================================================================
-- CIC ENUGU CLASS OF 1995 ALUMNI PORTAL (CIC-ENUGU-25-SET)
-- Production Supabase Database Schema, Security (RLS), Triggers & Seed Data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. SCHEMAS & TABLES
-- ============================================================================

-- 1.1 Projects Table (Development & Capital Campaigns)
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(60) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
  target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount >= 0),
  raised_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
  donor_count INTEGER NOT NULL DEFAULT 0 CHECK (donor_count >= 0),
  image TEXT NOT NULL DEFAULT 'campus.jpg',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.2 Project Milestones (Execution Phases)
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(60) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_name VARCHAR(150) NOT NULL,
  target_budget NUMERIC(14, 2) NOT NULL CHECK (target_budget >= 0),
  is_completed BOOLEAN DEFAULT FALSE,
  order_rank INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.3 Payment Categories
CREATE TABLE IF NOT EXISTS payment_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'monthly', 'fixed', 'custom'
  base_amount NUMERIC(12, 2) NOT NULL DEFAULT 5000.00 CHECK (base_amount >= 0),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.4 Alumni Members Directory
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  class_year VARCHAR(50) DEFAULT 'Class of 1995',
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(50),
  chapter VARCHAR(100) DEFAULT 'Enugu Central',
  profession VARCHAR(150),
  dues_status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Pending', 'Defaulted'
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.5 Unified Payments Ledger (Zero-Login Transactions)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(100) UNIQUE NOT NULL,
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  member_id VARCHAR(50) REFERENCES members(id) ON DELETE SET NULL,
  project_id VARCHAR(60) REFERENCES projects(id) ON DELETE SET NULL,
  payer_name VARCHAR(200) NOT NULL,
  payer_email VARCHAR(150) NOT NULL,
  payer_phone VARCHAR(50) NOT NULL,
  payer_class_year VARCHAR(50) DEFAULT 'Class of 1995',
  category_id VARCHAR(50) REFERENCES payment_categories(id) ON DELETE SET NULL,
  payment_type VARCHAR(100) NOT NULL,
  selected_months TEXT[] DEFAULT '{}',
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  gateway VARCHAR(50) NOT NULL DEFAULT 'Paystack',
  channel VARCHAR(100) NOT NULL DEFAULT 'Debit Card',
  status VARCHAR(50) NOT NULL DEFAULT 'Successful', -- 'Pending', 'Successful', 'Failed'
  item_description TEXT,
  paid_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.6 Project Donations Ledger
CREATE TABLE IF NOT EXISTS project_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(60) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  donor_name VARCHAR(200) NOT NULL DEFAULT 'Generous Alumnus',
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  notes TEXT,
  donated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 1.7 System Configuration (Singleton Row)
CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  association_name VARCHAR(200) DEFAULT 'CIC ALUMNI 1995 SET',
  slogan VARCHAR(255) DEFAULT 'Connecting the Past. Building the Future.',
  monthly_dues_rate NUMERIC(10, 2) DEFAULT 5000.00,
  annual_dues_rate NUMERIC(10, 2) DEFAULT 25000.00,
  active_gateway VARCHAR(50) DEFAULT 'Paystack',
  gateway_mode VARCHAR(50) DEFAULT 'Live',
  bank_name VARCHAR(100) DEFAULT 'First Heritage Bank',
  account_number VARCHAR(50) DEFAULT '1029384756',
  account_name VARCHAR(150) DEFAULT 'CIC Alumni 1995 Set National',
  ussd_prefix VARCHAR(50) DEFAULT '*737*50*5000#',
  admin_pin_hash TEXT DEFAULT 'admin123',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 2. STORED PROCEDURES & TRIGGERS
-- ============================================================================

-- Function 1: Self-generating Project ID and Slug
CREATE OR REPLACE FUNCTION trg_fn_set_project_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'prj-1995-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');
  END IF;
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_before_insert ON projects;
CREATE TRIGGER trg_projects_before_insert
BEFORE INSERT ON projects
FOR EACH ROW EXECUTE FUNCTION trg_fn_set_project_defaults();

-- Function 2: Autonomous Project Creation Procedure
CREATE OR REPLACE FUNCTION create_autonomous_project(
  p_title TEXT,
  p_category TEXT,
  p_target NUMERIC,
  p_description TEXT,
  p_image TEXT DEFAULT 'campus.jpg',
  p_initial_seed NUMERIC DEFAULT 0,
  p_seed_donor TEXT DEFAULT NULL
) RETURNS json AS $$
DECLARE
  v_proj_id VARCHAR(60);
  v_phase1_budget NUMERIC;
  v_phase2_budget NUMERIC;
  v_phase3_budget NUMERIC;
  v_payment_id UUID;
  v_tx_ref VARCHAR(100);
  v_rec_no VARCHAR(100);
  v_result JSON;
BEGIN
  v_proj_id := 'prj-1995-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

  INSERT INTO projects (id, title, category, target_amount, raised_amount, donor_count, image, description)
  VALUES (
    v_proj_id, p_title, p_category, p_target, 
    CASE WHEN p_initial_seed > 0 THEN p_initial_seed ELSE 0.00 END,
    CASE WHEN p_initial_seed > 0 THEN 1 ELSE 0 END,
    p_image, p_description
  );

  v_phase1_budget := ROUND(p_target * 0.40, 2);
  v_phase2_budget := ROUND(p_target * 0.40, 2);
  v_phase3_budget := p_target - (v_phase1_budget + v_phase2_budget);

  INSERT INTO project_milestones (project_id, phase_name, target_budget, order_rank)
  VALUES 
    (v_proj_id, 'Phase 1: Project Mobilization, Survey & Procurement', v_phase1_budget, 1),
    (v_proj_id, 'Phase 2: Core Execution & Engineering Fittings', v_phase2_budget, 2),
    (v_proj_id, 'Phase 3: Commissioning, Quality Audit & Handover', v_phase3_budget, 3);

  IF p_initial_seed > 0 THEN
    v_tx_ref := 'HAA-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::text, 5, '0');
    v_rec_no := 'REC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

    INSERT INTO payments (
      reference, receipt_number, project_id, payer_name, payer_email, payer_phone,
      category_id, payment_type, amount, gateway, channel, status, item_description
    ) VALUES (
      v_tx_ref, v_rec_no, v_proj_id, COALESCE(p_seed_donor, 'Executive Council Seed Allocation'),
      'secretariat@cicalumni1995.org', '08000000000', 'project_contribution',
      'Project Contribution', p_initial_seed, 'Direct Bank Transfer', 'Treasury Allocation',
      'Successful', p_title || ' Seed Financing (' || COALESCE(p_seed_donor, 'Council') || ')'
    ) RETURNING id INTO v_payment_id;

    INSERT INTO project_donations (project_id, payment_id, donor_name, amount, notes)
    VALUES (v_proj_id, v_payment_id, COALESCE(p_seed_donor, 'Executive Council Seed Allocation'), p_initial_seed, 'Project Kickoff Seed');
  END IF;

  SELECT row_to_json(p) INTO v_result FROM (SELECT * FROM projects WHERE id = v_proj_id) p;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Auto-reconcile project donations & member dues upon successful payment
CREATE OR REPLACE FUNCTION trg_fn_reconcile_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Successful' AND NEW.project_id IS NOT NULL THEN
    UPDATE projects 
    SET 
      raised_amount = raised_amount + NEW.amount,
      donor_count = donor_count + 1,
      status = CASE 
        WHEN (raised_amount + NEW.amount) >= target_amount THEN 'completed'
        ELSE status
      END,
      updated_at = TIMEZONE('utc', NOW())
    WHERE id = NEW.project_id;

    IF NOT EXISTS (SELECT 1 FROM project_donations WHERE payment_id = NEW.id) THEN
      INSERT INTO project_donations (project_id, payment_id, donor_name, amount)
      VALUES (NEW.project_id, NEW.id, NEW.payer_name, NEW.amount);
    END IF;
  END IF;

  IF NEW.status = 'Successful' AND NEW.payment_type IN ('Monthly Dues', 'Annual Dues') THEN
    UPDATE members 
    SET dues_status = 'Active', updated_at = TIMEZONE('utc', NOW())
    WHERE email = NEW.payer_email OR phone = NEW.payer_phone;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payments_after_insert_update ON payments;
CREATE TRIGGER trg_payments_after_insert_update
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION trg_fn_reconcile_payment();

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Projects RLS
DROP POLICY IF EXISTS "Public can view active and completed projects" ON projects;
CREATE POLICY "Public can view active and completed projects"
ON projects FOR SELECT USING (status != 'archived');

DROP POLICY IF EXISTS "Admins have full access to projects" ON projects;
CREATE POLICY "Admins have full access to projects"
ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Milestones RLS
DROP POLICY IF EXISTS "Public can view project milestones" ON project_milestones;
CREATE POLICY "Public can view project milestones"
ON project_milestones FOR SELECT USING (true);

-- Payments RLS
DROP POLICY IF EXISTS "Public zero-login checkout can insert payments" ON payments;
CREATE POLICY "Public zero-login checkout can insert payments"
ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can verify payment by reference or receipt" ON payments;
CREATE POLICY "Public can verify payment by reference or receipt"
ON payments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins have full payment access" ON payments;
CREATE POLICY "Admins have full payment access"
ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Members RLS
DROP POLICY IF EXISTS "Public can view members directory" ON members;
CREATE POLICY "Public can view members directory"
ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full members access" ON members;
CREATE POLICY "Admins have full members access"
ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories & Config RLS
DROP POLICY IF EXISTS "Public can view payment categories" ON payment_categories;
CREATE POLICY "Public can view payment categories"
ON payment_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view config" ON system_config;
CREATE POLICY "Public can view config"
ON system_config FOR SELECT USING (true);

-- ============================================================================
-- 4. INITIAL SEED DATA
-- ============================================================================
INSERT INTO system_config (id, association_name, slogan, monthly_dues_rate, annual_dues_rate)
VALUES (1, 'CIC ALUMNI 1995 SET', 'Connecting the Past. Building the Future.', 5000.00, 25000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_categories (id, name, type, base_amount, description) VALUES
('monthly_dues', 'Monthly Dues', 'monthly', 5000.00, 'Mandatory monthly welfare and operations dues.'),
('annual_dues', 'Annual Dues', 'fixed', 25000.00, 'One-time annual alumni registration and membership dues.'),
('development_levy', 'Development Levy', 'fixed', 10000.00, 'Special contribution towards school infrastructure and grounds.'),
('welfare_contribution', 'Welfare Contribution', 'custom', 5000.00, 'Voluntary support fund for alumni welfare and emergency assistance.'),
('donation', 'Donation', 'custom', 10000.00, 'General philanthropy and endowment donations for the association.'),
('project_contribution', 'Project Contribution', 'custom', 20000.00, 'Direct financing of ongoing alumni school rehabilitation projects.'),
('event_registration', 'Event Registration', 'fixed', 5000.00, 'Participation and registration tickets for alumni gatherings.'),
('reunion_fee', 'Reunion Fee', 'fixed', 15000.00, 'Registration and package for the Grand Alumni Reunion.')
ON CONFLICT (id) DO NOTHING;

-- Seed the 4 Core Projects via the Autonomous Function
SELECT create_autonomous_project(
  'Modern Ultra-Modern Science & STEM Laboratories',
  'Infrastructure',
  25000000,
  'Refurbishment of Physics, Chemistry, and Biology laboratories with state-of-the-art digital sensors, robotics kits, and safety fixtures.',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  18750000,
  'Class of 1995 Executive Council & Donors'
);

SELECT create_autonomous_project(
  'Alumni Endowment & Indigent Scholarship Fund',
  'Scholarship',
  15000000,
  'Providing tuition, book allowances, and campus stipends for 50 brilliant but economically challenged undergraduate students annually.',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  12200000,
  'Endowment Fund Trustees'
);

SELECT create_autonomous_project(
  'High-Speed Campus ICT Hub & Solar Power Array',
  'Technology',
  35000000,
  'Installation of a 30kW solar inverter system and 100-workstation digital research hub with fiber optic internet for students.',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  29400000,
  'ICT & Infrastructure Committee'
);

SELECT create_autonomous_project(
  'Alumni Healthcare & Elderly Welfare Shield',
  'Welfare',
  10000000,
  'Subsidized health insurance pool and emergency distress support fund for elderly and disabled alumni members.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  6800000,
  'Welfare Directorate'
);

-- Enable Realtime for live UI synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

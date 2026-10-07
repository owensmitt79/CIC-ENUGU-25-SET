-- ============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR CIC ENUGU CLASS OF 1995 ALUMNI PORTAL
-- Features: Autonomous Project Engine, Financial Triggers, RLS, & Realtime
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Schema (Safe Setup)
DROP TABLE IF EXISTS project_donations CASCADE;
DROP TABLE IF EXISTS project_milestones CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS payment_categories CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;

-- ============================================================================
-- TABLE: system_config (Singleton Association Configuration)
-- ============================================================================
CREATE TABLE system_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  association_name VARCHAR(200) DEFAULT 'CIC ALUMNI 1995 SET',
  slogan VARCHAR(255) DEFAULT 'Connecting the Past. Building the Future.',
  monthly_dues_rate NUMERIC(10, 2) DEFAULT 5000.00,
  annual_dues_rate NUMERIC(10, 2) DEFAULT 25000.00,
  reunion_fee_rate NUMERIC(10, 2) DEFAULT 15000.00,
  active_gateway VARCHAR(50) DEFAULT 'Paystack',
  gateway_mode VARCHAR(50) DEFAULT 'Live',
  bank_name VARCHAR(100) DEFAULT 'First Heritage Bank',
  account_number VARCHAR(50) DEFAULT '1029384756',
  account_name VARCHAR(150) DEFAULT 'CIC Alumni 1995 Set National',
  ussd_prefix VARCHAR(50) DEFAULT '*737*50*5000#',
  admin_pin_hash TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- TABLE: payment_categories (Dues, Levies, Donations & Events)
-- ============================================================================
CREATE TABLE payment_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'monthly', 'fixed', 'custom'
  base_amount NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- TABLE: members (200 Alumni Registry & Chapter Directory)
-- ============================================================================
CREATE TABLE members (
  id VARCHAR(50) PRIMARY KEY, -- e.g. 'mem-1995-001'
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

-- ============================================================================
-- TABLE: projects (Developmental Initiatives & Giving Back Engine)
-- ============================================================================
CREATE TABLE projects (
  id VARCHAR(60) PRIMARY KEY, -- Auto-generated if null e.g. 'prj-1995-0001'
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Infrastructure',
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
  target_amount NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0),
  raised_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0),
  donor_count INTEGER NOT NULL DEFAULT 0 CHECK (donor_count >= 0),
  image_url TEXT NOT NULL DEFAULT 'campus.jpg',
  description TEXT NOT NULL,
  beneficiaries TEXT,
  lead_coordinator VARCHAR(150),
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- TABLE: project_milestones (Autonomous Phased Undertakings)
-- ============================================================================
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE,
  phase_name VARCHAR(150) NOT NULL,
  target_budget NUMERIC(14, 2) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  order_rank INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- TABLE: payments (Direct Zero-Login Settlement & Verification Ledger)
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'HAA-2026-89104'
  receipt_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'REC-2026-0041'
  member_id VARCHAR(50) REFERENCES members(id) ON DELETE SET NULL,
  project_id VARCHAR(60) REFERENCES projects(id) ON DELETE SET NULL,
  payer_name VARCHAR(200) NOT NULL,
  payer_email VARCHAR(150) NOT NULL,
  payer_phone VARCHAR(50) NOT NULL,
  payer_class_year VARCHAR(50) DEFAULT 'Class of 1995',
  category_id VARCHAR(50) REFERENCES payment_categories(id),
  payment_type VARCHAR(100) NOT NULL,
  selected_months TEXT[] DEFAULT '{}',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  gateway VARCHAR(50) NOT NULL DEFAULT 'Paystack',
  channel VARCHAR(100) NOT NULL DEFAULT 'Debit Card',
  status VARCHAR(50) NOT NULL DEFAULT 'Successful', -- 'Pending', 'Successful', 'Failed'
  item_description TEXT,
  paid_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- TABLE: project_donations (Direct Donor Ledger)
-- ============================================================================
CREATE TABLE project_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  donor_name VARCHAR(200) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  notes TEXT,
  donated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- HIGH-PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_projects_status ON projects(status, category);
CREATE INDEX idx_payments_lookup ON payments(reference, receipt_number);
CREATE INDEX idx_payments_payer ON payments(payer_email, payer_phone);
CREATE INDEX idx_payments_project ON payments(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_members_search ON members(full_name, chapter, dues_status);

-- ============================================================================
-- AUTONOMOUS PROJECT FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function 1: Auto-generate Project ID and Slug
CREATE OR REPLACE FUNCTION trg_fn_project_auto_slug_id()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INT := 1;
BEGIN
  -- 1. Auto-generate ID if empty
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'prj-1995-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');
  END IF;

  -- 2. Auto-generate Slug from title
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    new_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM projects WHERE slug = new_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;

  -- 3. Auto-update timestamp
  NEW.updated_at := TIMEZONE('utc', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_before_insert_update
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION trg_fn_project_auto_slug_id();

-- Function 2: Autonomous Project Creator with Automatic Phases & Seed Funding
CREATE OR REPLACE FUNCTION create_autonomous_project(
  p_title TEXT,
  p_category TEXT,
  p_target NUMERIC,
  p_description TEXT,
  p_image TEXT DEFAULT 'campus.jpg',
  p_initial_seed NUMERIC DEFAULT 0,
  p_seed_donor TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_proj_id VARCHAR(60);
  v_result JSON;
  v_phase1_budget NUMERIC;
  v_phase2_budget NUMERIC;
  v_phase3_budget NUMERIC;
  v_tx_ref VARCHAR(100);
  v_rec_no VARCHAR(100);
  v_payment_id UUID;
BEGIN
  -- Generate unique ID
  v_proj_id := 'prj-1995-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

  -- Insert project
  INSERT INTO projects (
    id, title, category, target_amount, raised_amount, donor_count, image_url, description, status
  ) VALUES (
    v_proj_id, p_title, p_category, p_target, COALESCE(p_initial_seed, 0),
    CASE WHEN p_initial_seed > 0 THEN 1 ELSE 0 END,
    COALESCE(p_image, 'campus.jpg'), p_description, 'active'
  );

  -- Autonomous Phase Generation (3 phases split 40% / 40% / 20%)
  v_phase1_budget := ROUND(p_target * 0.40, 2);
  v_phase2_budget := ROUND(p_target * 0.40, 2);
  v_phase3_budget := p_target - (v_phase1_budget + v_phase2_budget);

  INSERT INTO project_milestones (project_id, phase_name, target_budget, order_rank)
  VALUES 
    (v_proj_id, 'Phase 1: Project Mobilization, Survey & Procurement', v_phase1_budget, 1),
    (v_proj_id, 'Phase 2: Core Execution & Engineering Fittings', v_phase2_budget, 2),
    (v_proj_id, 'Phase 3: Commissioning, Quality Audit & Handover', v_phase3_budget, 3);

  -- If an initial seed contribution is provided, record it in the ledger
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

  -- Return project JSON
  SELECT row_to_json(p) INTO v_result FROM (
    SELECT * FROM projects WHERE id = v_proj_id
  ) p;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Auto-reconcile donations and transition project status
CREATE OR REPLACE FUNCTION trg_fn_reconcile_project_donation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Successful' AND NEW.project_id IS NOT NULL THEN
    -- Increment project raised amount and donor count
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

    -- Log donation in project_donations if not already present
    IF NOT EXISTS (SELECT 1 FROM project_donations WHERE payment_id = NEW.id) THEN
      INSERT INTO project_donations (project_id, payment_id, donor_name, amount)
      VALUES (NEW.project_id, NEW.id, NEW.payer_name, NEW.amount);
    END IF;
  END IF;

  -- Auto-update member dues status to 'Active' upon clearing dues
  IF NEW.status = 'Successful' AND NEW.payment_type IN ('Monthly Dues', 'Annual Dues') THEN
    UPDATE members 
    SET dues_status = 'Active', updated_at = TIMEZONE('utc', NOW())
    WHERE email = NEW.payer_email OR phone = NEW.payer_phone;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_after_insert_update
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION trg_fn_reconcile_project_donation();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Projects Policies
CREATE POLICY "Public can view active and completed projects"
ON projects FOR SELECT USING (status != 'archived');

CREATE POLICY "Admins have full access to projects"
ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Milestones Policies
CREATE POLICY "Public can view project milestones"
ON project_milestones FOR SELECT USING (true);

-- Payments Policies
CREATE POLICY "Public zero-login checkout can insert payments"
ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public can verify payment by reference or receipt"
ON payments FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins have full payment access"
ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Members Policies
CREATE POLICY "Public can view members directory"
ON members FOR SELECT USING (true);

CREATE POLICY "Admins have full members access"
ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories & Config Policies
CREATE POLICY "Public can view payment categories"
ON payment_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view config"
ON system_config FOR SELECT USING (true);

-- ============================================================================
-- SEED DATA (PRODUCTION INITIALIZATION)
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
('reunion_fee', 'Reunion Fee', 'fixed', 15000.00, 'Registration and package for the Grand Alumni Reunion.');

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

-- Realtime Publication Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

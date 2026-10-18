# Autonomous Supabase Database Setup Prompt
## Project: CIC Enugu Class of 1995 Alumni Association Portal (`CIC-ENUGU-25-SET`)
### Target Project: `kyyoahufvlahubrkxgyo` (https://kyyoahufvlahubrkxgyo.supabase.co)

---

### PROMPT TO COPY & PASTE (FOR AI / SUPABASE ASSISTANT):

```text
You are an expert PostgreSQL and Supabase Database Architect.
I need you to provision the production database schema for the College of the Immaculate Conception (CIC) Enugu 1995 Alumni Association Portal (Project: CIC-ENUGU-25-SET).

Please execute the following schema, triggers, and Row Level Security (RLS) policies:

1. TABLES & CONSTRAINTS:
- `projects` (Development initiatives & capital campaigns):
  id (VARCHAR(60) PRIMARY KEY), title (VARCHAR(255) NOT NULL), slug (VARCHAR(255) UNIQUE),
  category (VARCHAR(100) NOT NULL), status (VARCHAR(50) DEFAULT 'active'),
  target_amount (NUMERIC(14,2) NOT NULL CHECK >= 0), raised_amount (NUMERIC(14,2) DEFAULT 0 CHECK >= 0),
  donor_count (INTEGER DEFAULT 0 CHECK >= 0), image (TEXT NOT NULL), description (TEXT),
  created_at (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())), updated_at (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

- `project_milestones` (Phased execution stages):
  id (UUID PRIMARY KEY DEFAULT gen_random_uuid()), project_id (VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE),
  phase_name (VARCHAR(150) NOT NULL), target_budget (NUMERIC(14,2) NOT NULL CHECK >= 0),
  is_completed (BOOLEAN DEFAULT FALSE), order_rank (INTEGER DEFAULT 1), created_at (TIMESTAMPTZ)

- `payment_categories`:
  id (VARCHAR(50) PRIMARY KEY), name (VARCHAR(150) NOT NULL), type (VARCHAR(50) NOT NULL),
  base_amount (NUMERIC(12,2) DEFAULT 5000.00), description (TEXT), is_active (BOOLEAN DEFAULT TRUE), created_at (TIMESTAMPTZ)

- `members` (Alumni Directory):
  id (VARCHAR(50) PRIMARY KEY), full_name (VARCHAR(200) NOT NULL), class_year (VARCHAR(50) DEFAULT 'Class of 1995'),
  email (VARCHAR(150) UNIQUE), phone (VARCHAR(50)), chapter (VARCHAR(100) DEFAULT 'Enugu Central'),
  profession (VARCHAR(150)), dues_status (VARCHAR(50) DEFAULT 'Active'), avatar_url (TEXT),
  created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)

- `payments` (Unified Zero-Login Financial Ledger):
  id (UUID PRIMARY KEY DEFAULT gen_random_uuid()), reference (VARCHAR(100) UNIQUE NOT NULL),
  receipt_number (VARCHAR(100) UNIQUE NOT NULL), member_id (VARCHAR(50) REFERENCES members(id) ON DELETE SET NULL),
  project_id (VARCHAR(60) REFERENCES projects(id) ON DELETE SET NULL), payer_name (VARCHAR(200) NOT NULL),
  payer_email (VARCHAR(150) NOT NULL), payer_phone (VARCHAR(50) NOT NULL), payer_class_year (VARCHAR(50) DEFAULT 'Class of 1995'),
  category_id (VARCHAR(50) REFERENCES payment_categories(id)), payment_type (VARCHAR(100) NOT NULL),
  selected_months (TEXT[] DEFAULT '{}'), amount (NUMERIC(14,2) NOT NULL CHECK > 0), gateway (VARCHAR(50) DEFAULT 'Paystack'),
  channel (VARCHAR(100) DEFAULT 'Debit Card'), status (VARCHAR(50) DEFAULT 'Successful'), item_description (TEXT),
  paid_at (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())), created_at (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

- `project_donations`:
  id (UUID PRIMARY KEY DEFAULT gen_random_uuid()), project_id (VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE),
  payment_id (UUID REFERENCES payments(id) ON DELETE CASCADE), donor_name (VARCHAR(200) DEFAULT 'Generous Alumnus'),
  amount (NUMERIC(14,2) NOT NULL CHECK > 0), is_anonymous (BOOLEAN DEFAULT FALSE), notes (TEXT), donated_at (TIMESTAMPTZ)

- `system_config`:
  id (INTEGER PRIMARY KEY DEFAULT 1 CHECK id = 1), association_name (VARCHAR(200) DEFAULT 'CIC ALUMNI 1995 SET'),
  slogan (VARCHAR(255)), monthly_dues_rate (NUMERIC(10,2) DEFAULT 5000), annual_dues_rate (NUMERIC(10,2) DEFAULT 25000),
  active_gateway (VARCHAR(50) DEFAULT 'Paystack'), gateway_mode (VARCHAR(50) DEFAULT 'Live'),
  bank_name (VARCHAR(100) DEFAULT 'First Heritage Bank'), account_number (VARCHAR(50) DEFAULT '1029384756'),
  account_name (VARCHAR(150)), ussd_prefix (VARCHAR(50)), admin_pin_hash (TEXT), updated_at (TIMESTAMPTZ)

2. BUSINESS LOGIC & TRIGGERS:
- Trigger before insert on `projects`: Auto-generate 'prj-1995-YY-XXXX' identifier and slug if null.
- Stored procedure `create_autonomous_project`: Automates creating project records with 3 default milestone phases (40%/40%/20% budget split) and initial seed ledger entries.
- Trigger after insert/update on `payments`: When status='Successful' and project_id is provided, automatically increment `projects.raised_amount` and `donor_count`, auto-mark project 'completed' if target is met, and log a row in `project_donations`. If payment_type is 'Monthly Dues' or 'Annual Dues', automatically set member's `dues_status = 'Active'`.

3. ROW LEVEL SECURITY (RLS):
- Enable RLS on all tables.
- Public (`anon` & `authenticated`): Read-only access to projects (status != 'archived'), payment_categories, milestones, and members.
- Public zero-login checkout: Allowed to `INSERT` new rows into `payments` without authentication.
- Public verification engine: Allowed to `SELECT` payments by reference or receipt number.
- Admin (`authenticated`): Full write access to all tables.

4. REALTIME:
- Add `projects` and `payments` to `supabase_realtime` publication.
```

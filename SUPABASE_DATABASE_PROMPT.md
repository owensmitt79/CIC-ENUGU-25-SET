# SUPABASE MASTER DATABASE SETUP PROMPT
## Autonomous Project Creation, Financial Ledger & Real-Time Sync
### CIC Enugu Class of 1995 Alumni Association Portal

> **How to use this prompt:**  
> Copy the entire markdown block below and paste it into ChatGPT, Claude, Cursor, or DeepSeek, or run the generated SQL directly inside your **[Supabase SQL Editor](https://app.supabase.com)**. It will configure the complete PostgreSQL schema, automated triggers, autonomous project generators, Row Level Security (RLS) policies, and Realtime listeners.

***

```markdown
You are a Principal Database Architect and Supabase / PostgreSQL Specialist.

Your objective is to design and produce a complete, production-ready Supabase database configuration for the "College of the Immaculate Conception (CIC) Enugu - Class of 1995 Alumni Association Portal".

The database must be fully self-managing ("autonomous"): it must automatically handle project ID and slug generation, update financial balances and donor counts on incoming payments, auto-transition project statuses upon reaching funding goals, enforce Row Level Security (RLS), and broadcast real-time state changes to the frontend.

---

### 1. APPLICATION ARCHITECTURE & SUPABASE REQUIREMENTS
- **Platform:** CIC Enugu Class of 1995 Alumni Portal.
- **Frontend Admin Portal:** Executive Dashboard with Project Studio, Payments Ledger, Monthly Dues Tracker, News Studio, and Leadership Directory.
- **Engine:** PostgreSQL 15+ hosted on Supabase.
- **Special Capabilities Required:**
  1. **Autonomous Project Engine:** When a project is inserted or created through stored procedures, the database auto-generates sequential IDs (`prj-1995-XXXX`), computes slugs, initializes milestone phases, and calculates funding percentages.
  2. **Automated Financial Reconciliation:** When a payment record is inserted or verified, triggers must automatically increment the project's `raised_amount` and `donor_count`, check if target goals are reached (transitioning status from `'active'` to `'completed'`), and update member dues clearance status.
  3. **Row-Level Security (RLS):** Public read-only access for published projects, public zero-login dues checkout, and strict authenticated access (`auth.uid()`) for the admin portal.
  4. **Supabase Realtime:** Enable replication on `projects` and `payments` so all admin and public browsers update live without page refreshes.
  5. **Supabase Storage:** Storage bucket definitions for `project-banners`, `receipts`, and `gallery-media`.

---

### 2. CORE DATABASE TABLES DDL (POSTGRESQL / SUPABASE)

Please generate the complete SQL migration script with appropriate types, foreign keys, defaults, and constraints:

#### A. Table `projects` (Developmental Initiatives)
- `id` (VARCHAR(60) PRIMARY KEY) -- Auto-generated if null (e.g. `'prj-1995-' || LPAD(nextval('project_seq')::text, 4, '0')`)
- `title` (VARCHAR(255) NOT NULL)
- `slug` (VARCHAR(255) UNIQUE NOT NULL) -- Auto-generated from title
- `category` (VARCHAR(100) NOT NULL DEFAULT 'Infrastructure') -- Check: 'Infrastructure', 'Scholarship', 'Technology', 'Welfare', 'Academic', 'Sports'
- `status` (VARCHAR(50) NOT NULL DEFAULT 'active') -- Check: 'active', 'completed', 'paused', 'archived'
- `target_amount` (NUMERIC(14, 2) NOT NULL CHECK (target_amount > 0))
- `raised_amount` (NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (raised_amount >= 0))
- `donor_count` (INTEGER NOT NULL DEFAULT 0 CHECK (donor_count >= 0))
- `image_url` (TEXT NOT NULL DEFAULT 'campus.jpg')
- `description` (TEXT NOT NULL)
- `beneficiaries` (TEXT)
- `lead_coordinator` (VARCHAR(150))
- `start_date` (DATE DEFAULT CURRENT_DATE)
- `target_date` (DATE)
- `created_by` (UUID REFERENCES auth.users(id) ON DELETE SET NULL)
- `created_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))
- `updated_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

#### B. Table `project_milestones` (Phased Undertakings)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `project_id` (VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE)
- `phase_name` (VARCHAR(150) NOT NULL) -- e.g. "Phase 1: Civil Works & Foundation", "Phase 2: Equipment & Digital Sensors"
- `target_budget` (NUMERIC(14, 2) NOT NULL)
- `is_completed` (BOOLEAN DEFAULT FALSE)
- `order_rank` (INTEGER DEFAULT 1)
- `created_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

#### C. Table `project_donations` (Ledger of Individual Backers)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `project_id` (VARCHAR(60) REFERENCES projects(id) ON DELETE CASCADE)
- `payment_id` (UUID REFERENCES payments(id) ON DELETE CASCADE)
- `donor_name` (VARCHAR(200) NOT NULL DEFAULT 'Generous Alumnus')
- `amount` (NUMERIC(14, 2) NOT NULL CHECK (amount > 0))
- `is_anonymous` (BOOLEAN DEFAULT FALSE)
- `notes` (TEXT)
- `donated_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

#### D. Table `payment_categories`
- `id` (VARCHAR(50) PRIMARY KEY) -- 'monthly_dues', 'annual_dues', 'development_levy', 'project_contribution', etc.
- `name` (VARCHAR(150) NOT NULL)
- `type` (VARCHAR(50) NOT NULL) -- 'monthly', 'fixed', 'custom'
- `base_amount` (NUMERIC(12, 2) NOT NULL DEFAULT 5000.00)
- `description` (TEXT)
- `is_active` (BOOLEAN DEFAULT TRUE)

#### E. Table `payments` (Unified Financial Ledger)
- `id` (UUID PRIMARY KEY DEFAULT gen_random_uuid())
- `reference` (VARCHAR(100) UNIQUE NOT NULL) -- e.g. 'HAA-2026-89104'
- `receipt_number` (VARCHAR(100) UNIQUE NOT NULL) -- e.g. 'REC-2026-0041'
- `member_id` (VARCHAR(50) REFERENCES members(id) ON DELETE SET NULL)
- `project_id` (VARCHAR(60) REFERENCES projects(id) ON DELETE SET NULL)
- `payer_name` (VARCHAR(200) NOT NULL)
- `payer_email` (VARCHAR(150) NOT NULL)
- `payer_phone` (VARCHAR(50) NOT NULL)
- `payer_class_year` (VARCHAR(50) DEFAULT 'Class of 1995')
- `category_id` (VARCHAR(50) REFERENCES payment_categories(id))
- `payment_type` (VARCHAR(100) NOT NULL)
- `selected_months` (TEXT[] DEFAULT '{}')
- `amount` (NUMERIC(12, 2) NOT NULL CHECK (amount > 0))
- `gateway` (VARCHAR(50) NOT NULL DEFAULT 'Paystack')
- `channel` (VARCHAR(100) NOT NULL DEFAULT 'Debit Card')
- `status` (VARCHAR(50) NOT NULL DEFAULT 'Successful') -- 'Pending', 'Successful', 'Failed'
- `item_description` (TEXT)
- `paid_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))
- `created_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

#### F. Table `members` (Alumni Directory)
- `id` (VARCHAR(50) PRIMARY KEY) -- e.g. 'mem-1995-001'
- `full_name` (VARCHAR(200) NOT NULL)
- `class_year` (VARCHAR(50) DEFAULT 'Class of 1995')
- `email` (VARCHAR(150) UNIQUE)
- `phone` (VARCHAR(50))
- `chapter` (VARCHAR(100) DEFAULT 'Enugu Central')
- `profession` (VARCHAR(150))
- `dues_status` (VARCHAR(50) DEFAULT 'Active') -- 'Active', 'Pending', 'Defaulted'
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

#### G. Table `system_config` (Singleton Configuration)
- `id` (INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1))
- `association_name` (VARCHAR(200) DEFAULT 'CIC ALUMNI 1995 SET')
- `slogan` (VARCHAR(255) DEFAULT 'Connecting the Past. Building the Future.')
- `monthly_dues_rate` (NUMERIC(10, 2) DEFAULT 5000.00)
- `annual_dues_rate` (NUMERIC(10, 2) DEFAULT 25000.00)
- `active_gateway` (VARCHAR(50) DEFAULT 'Paystack')
- `gateway_mode` (VARCHAR(50) DEFAULT 'Live')
- `bank_name` (VARCHAR(100) DEFAULT 'First Heritage Bank')
- `account_number` (VARCHAR(50) DEFAULT '1029384756')
- `account_name` (VARCHAR(150) DEFAULT 'CIC Alumni 1995 Set National')
- `ussd_prefix` (VARCHAR(50) DEFAULT '*737*50*5000#')
- `admin_pin_hash` (TEXT DEFAULT 'admin123')
- `updated_at` (TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()))

---

### 3. AUTONOMOUS BUSINESS LOGIC & STORED PROCEDURES (SQL)

Write PostgreSQL functions and triggers for:

#### 1. Self-Generating Project Identifier & URL Slug:
- Before insert on `projects`:
  - If `NEW.id` is NULL or empty, generate: `'prj-1995-' || TO_CHAR(CURRENT_DATE, 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0')`.
  - If `NEW.slug` is NULL or empty, slugify `NEW.title` (lowercase, replace spaces and special characters with hyphens).

#### 2. Stored Procedure: `create_autonomous_project`:
Allow the system to launch a complete project with automatic phase templates in one call:
```sql
CREATE OR REPLACE FUNCTION create_autonomous_project(
  p_title TEXT,
  p_category TEXT,
  p_target NUMERIC,
  p_description TEXT,
  p_image TEXT DEFAULT 'campus.jpg',
  p_initial_seed NUMERIC DEFAULT 0,
  p_seed_donor TEXT DEFAULT NULL
) RETURNS json ...
```
- Creates the project record.
- If `p_initial_seed > 0`, immediately logs the seed donation in `payments` and `project_donations` so the ledger starts balanced.
- Automatically generates 3 default milestone phases (Phase 1: Mobilization & Equipment, Phase 2: Implementation, Phase 3: Inspection & Handover) with split budget allocations.
- Returns the created project object with its generated ID and phases.

#### 3. Automatic Donation Reconciliation & Progress Trigger:
- After insert or update on `payments`:
  - If `NEW.status = 'Successful'` and `NEW.project_id IS NOT NULL`:
    - Increment `projects.raised_amount = projects.raised_amount + NEW.amount`.
    - Increment `projects.donor_count = projects.donor_count + 1`.
    - If `projects.raised_amount >= projects.target_amount`, automatically set `projects.status = 'completed'`.
    - Automatically create a row in `project_donations`.

#### 4. Automatic Dues Clearance Status:
- After successful payment with `payment_type IN ('Monthly Dues', 'Annual Dues')`:
  - Find matching member by email or phone and set `members.dues_status = 'Active'`.

---

### 4. SUPABASE SECURITY & ROW LEVEL SECURITY (RLS) POLICIES

Enable RLS on all tables and supply the exact SQL policies:
1. `ALTER TABLE projects ENABLE ROW LEVEL SECURITY;`
   - Public (`anon` and `authenticated`): Can `SELECT` any project where `status != 'archived'`.
   - Admin (`authenticated`): Can `INSERT`, `UPDATE`, `DELETE` all projects.
2. `ALTER TABLE payments ENABLE ROW LEVEL SECURITY;`
   - Public (`anon`): Can `INSERT` new payments (zero-login dues checkout).
   - Public (`anon`): Can `SELECT` payments by exact `reference` or `receipt_number` (verification lookup tool).
   - Admin (`authenticated`): Can `SELECT`, `UPDATE` all payments.
3. `ALTER TABLE members ENABLE ROW LEVEL SECURITY;`
   - Public (`anon`): Can `SELECT` members directory.
   - Admin (`authenticated`): Full write access.

---

### 5. SUPABASE STORAGE BUCKETS
Provide the SQL statements to initialize public storage buckets:
- `INSERT INTO storage.buckets (id, name, public) VALUES ('project-banners', 'project-banners', true);`
- `INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);`
- Storage RLS policies allowing authenticated admin uploads and public read access.

---

### 6. SEED DATA
Provide SQL `INSERT` statements to populate the initial 4 projects:
1. `Ultra-Modern Science & STEM Laboratories` (Target: ₦25,000,000, Raised: ₦18,750,000, Category: Infrastructure)
2. `Alumni Endowment & Indigent Scholarship Fund` (Target: ₦15,000,000, Raised: ₦12,200,000, Category: Scholarship)
3. `High-Speed Campus ICT Hub & Solar Power Array` (Target: ₦35,000,000, Raised: ₦29,400,000, Category: Technology)
4. `Alumni Healthcare & Elderly Welfare Shield` (Target: ₦10,000,000, Raised: ₦6,800,000, Category: Welfare)
Include categories, config singleton, and initial members.

---

### 7. CLIENT-SIDE SUPABASE JAVASCRIPT INTEGRATION CODE
Provide copy-pasteable JavaScript code to connect `admin.html` and `js/admin.js` to Supabase:
1. `supabaseClient.js` initialization.
2. Direct replacement function for project creation:
   `async function createProjectInSupabase(projectData)`
3. Real-time subscription snippet:
   Listen to live changes on the `projects` table using `supabase.channel('public:projects').on('postgres_changes', ...)` to update the admin and public UI in real-time.
```

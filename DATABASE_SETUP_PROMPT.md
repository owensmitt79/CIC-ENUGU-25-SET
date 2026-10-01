# MASTER PROMPT: CIC ENUGU CLASS OF 1995 ALUMNI PORTAL DATABASE SETUP

> **How to use this prompt:**  
> Copy and paste the entire prompt below into your AI assistant, Claude, ChatGPT, Cursor, DeepSeek, or hand it to your Backend / Database Engineer. It instructs the AI to generate the complete production-ready database schema, SQL migrations, Prisma/Drizzle schema, seeds, triggers, and REST API endpoints tailored specifically for this project.

***

```markdown
You are a Principal Database Architect and Senior Backend Engineer. 

Your objective is to design and generate a complete, production-ready, relational database architecture, SQL migration scripts, seed data, and API contracts for the "College of the Immaculate Conception (CIC) Enugu - Class of 1995 Alumni Association Portal".

### 1. APPLICATION CONTEXT & ARCHITECTURAL REQUIREMENTS
The platform serves the CIC Enugu Class of 1995 global alumni body.
Key characteristics of the application:
1. **Zero-Login Dues Checkout & Direct Payment:** Alumni can pay monthly dues, annual registration, development levies, reunion fees, or make donations without prior account registration. Payments integrate with Nigerian payment gateways (Paystack, Flutterwave, Monnify, Remita) and direct bank transfers.
2. **Instant Receipt Verification Tool:** Public verification endpoint (`/verify.html`) where any member or auditor can enter a Transaction Reference (e.g., `HAA-2026-89104`) or Receipt Number (e.g., `REC-2026-0041`) to validate authentic settlement and download an official digital receipt with QR codes.
3. **Members Directory & Dues Reconciliation:** An alumni directory (initially ~200 members across global chapters like Enugu Central, Lagos Main, Abuja FCT, Port Harcourt, UK/London, USA/Houston, etc.) with dues clearance statuses ('Active', 'Pending', 'Defaulted').
4. **Giving Back & Infrastructure Projects Tracker:** Real-time campaign tracking showing target funding, amount raised, donor counts, and progress percentages.
5. **Events & Gallery Archive:** Reunions, AGMs, mentorship summits, and high-resolution photo archives.
6. **Administrator Portal:** Executive financial dashboard, rate configurator, receipt issuance studio, and ledger export.

Target Database Engine: **PostgreSQL 15+** (or Supabase). Ensure syntax is also easily portable to MySQL 8.0+.

---

### 2. REQUIRED ENTITY RELATIONSHIP MODEL & TABLES

Please provide the exact SQL DDL scripts (`CREATE TABLE`, constraints, keys, defaults, and enums) for the following 14 tables:

#### 1. `admins` & `roles`
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `full_name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(150), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `role` (ENUM: `'superadmin'`, `'financial_secretary'`, `'general_secretary'`, `'auditor'`)
- `pin_hash` (VARCHAR(255), for emergency 2FA or fast terminal unlock)
- `is_active` (BOOLEAN, default TRUE)
- `last_login_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 2. `members` (Alumni Registry)
- `id` (VARCHAR(50), Primary Key, e.g., `'mem-1995-001'`)
- `full_name` (VARCHAR(200), NOT NULL)
- `class_year` (VARCHAR(50), default `'Class of 1995'`)
- `email` (VARCHAR(150), UNIQUE, NULLABLE)
- `phone` (VARCHAR(50), NULLABLE)
- `chapter` (VARCHAR(100), default `'Enugu Central'`)
- `profession` (VARCHAR(150))
- `dues_status` (ENUM: `'Active'`, `'Pending'`, `'Defaulted'`, `'Exempt'`, default `'Active'`)
- `avatar_url` (TEXT, NULLABLE)
- `date_joined` (DATE, default CURRENT_DATE)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 3. `leadership` (Executive Council)
- `id` (VARCHAR(50), Primary Key)
- `member_id` (VARCHAR(50), REFERENCES `members(id)` ON DELETE SET NULL, NULLABLE)
- `full_name` (VARCHAR(200), NOT NULL)
- `office_title` (VARCHAR(150), NOT NULL, e.g. `'National President'`, `'Financial Secretary'`)
- `portfolio_type` (ENUM: `'executive'`, `'committee_chair'`, `'chapter_chair'`)
- `bio` (TEXT)
- `photo_url` (TEXT)
- `order_rank` (INTEGER, default 0 for UI sorting)
- `term_start` (DATE)
- `term_end` (DATE, NULLABLE)
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 4. `payment_categories` (Dues & Levy Types)
- `id` (VARCHAR(50), Primary Key, e.g., `'monthly_dues'`, `'annual_dues'`, `'development_levy'`)
- `name` (VARCHAR(150), NOT NULL)
- `type` (ENUM: `'monthly'`, `'fixed'`, `'custom'`)
- `base_amount` (DECIMAL(12, 2), NOT NULL, in Nigerian Naira NGN)
- `description` (TEXT)
- `is_active` (BOOLEAN, default TRUE)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 5. `payments` (Financial Ledger & Receipts)
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `reference` (VARCHAR(100), UNIQUE, NOT NULL) -- e.g. `'HAA-2026-89104'`
- `receipt_number` (VARCHAR(100), UNIQUE, NOT NULL) -- e.g. `'REC-2026-0041'`
- `member_id` (VARCHAR(50), REFERENCES `members(id)` ON DELETE SET NULL, NULLABLE)
- `payer_name` (VARCHAR(200), NOT NULL)
- `payer_email` (VARCHAR(150), NOT NULL)
- `payer_phone` (VARCHAR(50), NOT NULL)
- `payer_class_year` (VARCHAR(50), default `'Class of 1995'`)
- `category_id` (VARCHAR(50), REFERENCES `payment_categories(id)` ON DELETE RESTRICT)
- `payment_type` (VARCHAR(100), NOT NULL)
- `amount` (DECIMAL(12, 2), NOT NULL, CHECK (amount > 0))
- `gateway` (ENUM: `'Paystack'`, `'Flutterwave'`, `'Monnify'`, `'Remita'`, `'Bank Transfer'`, `'Manual'`)
- `channel` (VARCHAR(50)) -- e.g., `'Debit Card'`, `'Bank Transfer'`, `'USSD'`, `'QR Code'`
- `status` (ENUM: `'Pending'`, `'Successful'`, `'Failed'`, `'Refunded'`, default `'Pending'`)
- `selected_months` (JSONB or TEXT[], e.g., `["January", "February", "March"]`)
- `item_description` (TEXT)
- `gateway_reference` (VARCHAR(150), NULLABLE)
- `gateway_metadata` (JSONB, NULLABLE)
- `paid_at` (TIMESTAMPTZ)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 6. `dues_ledger` (Month-by-Month Dues Audit)
- `id` (BIGSERIAL, Primary Key)
- `payment_id` (UUID, REFERENCES `payments(id)` ON DELETE CASCADE)
- `member_id` (VARCHAR(50), REFERENCES `members(id)` ON DELETE CASCADE, NULLABLE)
- `dues_year` (INTEGER NOT NULL) -- e.g., 2026
- `dues_month` (INTEGER NOT NULL, CHECK (dues_month BETWEEN 1 AND 12)) -- 1 for Jan, 2 for Feb, etc.
- `amount` (DECIMAL(12, 2) NOT NULL)
- `created_at` (TIMESTAMPTZ, default NOW())
- UNIQUE (`member_id`, `dues_year`, `dues_month`)

#### 7. `projects` (Giving Back & Initiatives)
- `id` (VARCHAR(50), Primary Key, e.g., `'prj-01'`)
- `title` (VARCHAR(250), NOT NULL)
- `slug` (VARCHAR(250), UNIQUE, NOT NULL)
- `category` (VARCHAR(100), default `'Infrastructure'`)
- `description` (TEXT NOT NULL)
- `target_amount` (DECIMAL(14, 2), NOT NULL, CHECK (target_amount >= 0))
- `raised_amount` (DECIMAL(14, 2), default 0.00, CHECK (raised_amount >= 0))
- `donor_count` (INTEGER, default 0, CHECK (donor_count >= 0))
- `status` (ENUM: `'active'`, `'completed'`, `'paused'`, default `'active'`)
- `image_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 8. `project_donations` (Project-specific Donor Ledger)
- `id` (BIGSERIAL, Primary Key)
- `project_id` (VARCHAR(50), REFERENCES `projects(id)` ON DELETE CASCADE)
- `payment_id` (UUID, REFERENCES `payments(id)` ON DELETE CASCADE)
- `donor_name` (VARCHAR(200) NOT NULL)
- `amount` (DECIMAL(12, 2) NOT NULL)
- `is_anonymous` (BOOLEAN, default FALSE)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ, default NOW())

#### 9. `events`
- `id` (VARCHAR(50), Primary Key, e.g., `'evt-2026-01'`)
- `title` (VARCHAR(250), NOT NULL)
- `description` (TEXT)
- `event_date` (DATE NOT NULL)
- `display_date` (VARCHAR(100))
- `event_time` (VARCHAR(100))
- `location` (TEXT)
- `fee` (DECIMAL(10, 2), default 0.00)
- `status` (ENUM: `'upcoming'`, `'past'`, `'cancelled'`, default `'upcoming'`)
- `image_url` (TEXT)
- `featured` (BOOLEAN, default FALSE)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 10. `event_attendees` (Event Ticket Registrations)
- `id` (BIGSERIAL, Primary Key)
- `event_id` (VARCHAR(50), REFERENCES `events(id)` ON DELETE CASCADE)
- `payment_id` (UUID, REFERENCES `payments(id)` ON DELETE SET NULL, NULLABLE)
- `attendee_name` (VARCHAR(200) NOT NULL)
- `attendee_email` (VARCHAR(150) NOT NULL)
- `attendee_phone` (VARCHAR(50) NOT NULL)
- `ticket_code` (VARCHAR(100), UNIQUE NOT NULL)
- `checked_in` (BOOLEAN, default FALSE)
- `created_at` (TIMESTAMPTZ, default NOW())

#### 11. `news` (Announcements & Press Releases)
- `id` (VARCHAR(50), Primary Key, e.g., `'news-01'`)
- `title` (VARCHAR(250), NOT NULL)
- `category` (VARCHAR(100), default `'Alumni News'`)
- `published_date` (DATE default CURRENT_DATE)
- `summary` (TEXT)
- `content` (TEXT NOT NULL)
- `image_url` (TEXT)
- `featured` (BOOLEAN, default FALSE)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 12. `gallery` (Media & Photo Archive)
- `id` (VARCHAR(50), Primary Key, e.g., `'gal-01'`)
- `title` (VARCHAR(200) NOT NULL)
- `category` (VARCHAR(100) NOT NULL) -- `'Reunions'`, `'Community Projects'`, `'Annual General Meetings'`, `'Award Ceremonies'`, `'Networking Events'`
- `image_url` (TEXT NOT NULL)
- `caption` (TEXT)
- `order_rank` (INTEGER, default 0)
- `created_at` (TIMESTAMPTZ, default NOW())

#### 13. `contact_messages` (Inquiries from contact.html)
- `id` (BIGSERIAL, Primary Key)
- `full_name` (VARCHAR(200) NOT NULL)
- `email` (VARCHAR(150) NOT NULL)
- `phone` (VARCHAR(50))
- `subject` (VARCHAR(200))
- `message` (TEXT NOT NULL)
- `status` (ENUM: `'new'`, `'read'`, `'replied'`, `'archived'`, default `'new'`)
- `created_at` (TIMESTAMPTZ, default NOW())

#### 14. `system_config` (Association Settings & Payment Gateways)
- `id` (INTEGER, Primary Key, default 1, CHECK (id = 1)) -- Singleton row
- `association_name` (VARCHAR(200), default `'CIC ALUMNI 1995 SET'`)
- `slogan` (VARCHAR(255), default `'Connecting the Past. Building the Future.'`)
- `monthly_dues_rate` (DECIMAL(10, 2), default 5000.00)
- `annual_dues_rate` (DECIMAL(10, 2), default 25000.00)
- `reunion_fee_rate` (DECIMAL(10, 2), default 15000.00)
- `active_gateway` (VARCHAR(50), default `'Paystack'`)
- `gateway_mode` (VARCHAR(50), default `'Live'`)
- `bank_name` (VARCHAR(100), default `'First Heritage Bank'`)
- `account_number` (VARCHAR(50), default `'1029384756'`)
- `account_name` (VARCHAR(150), default `'CIC Alumni 1995 Set National'`)
- `ussd_prefix` (VARCHAR(50), default `'*737*50*5000#'`)
- `updated_at` (TIMESTAMPTZ, default NOW())

---

### 3. INDEXES FOR HIGH-THROUGHPUT & ZERO-LOGIN VERIFICATION
Create indexes to ensure instant response times (<10ms) under concurrent alumni queries:
1. `CREATE INDEX idx_payments_lookup ON payments (reference, receipt_number);`
2. `CREATE INDEX idx_payments_payer ON payments (payer_email, payer_phone);`
3. `CREATE INDEX idx_payments_status_date ON payments (status, created_at DESC);`
4. `CREATE INDEX idx_members_search ON members (full_name, chapter, dues_status);`
5. `CREATE INDEX idx_dues_ledger_member ON dues_ledger (member_id, dues_year);`
6. `CREATE INDEX idx_gallery_cat ON gallery (category, order_rank);`

---

### 4. AUTOMATED DATABASE TRIGGERS & PROCEDURES
Please provide the stored functions and triggers for:
1. **Auto-Generate Receipt Numbers:** When a payment row is inserted or updated to `'Successful'`, automatically generate a formatted sequential receipt number: `REC-YYYY-XXXX` (e.g., `REC-2026-0042`).
2. **Auto-Update Project Raised Amount & Donor Count:** When a payment linked to a project is marked `'Successful'`, automatically increment `projects.raised_amount = raised_amount + NEW.amount` and `donor_count = donor_count + 1`.
3. **Auto-Update Member Dues Status:** When a payment for `'monthly_dues'` or `'annual_dues'` is marked `'Successful'`, if a matching member exists by email or phone, automatically update `members.dues_status = 'Active'`.

---

### 5. SEED DATA GENERATION
Generate SQL `INSERT` statements to populate the database with the initial production defaults currently used in `js/data.js`:
- The default system configuration singleton (`system_config`).
- All 10 payment categories (`monthly_dues`, `annual_dues`, `development_levy`, `welfare_contribution`, `donation`, `project_contribution`, `event_registration`, `reunion_fee`, `special_levy`, `other_payments`).
- The 4 core projects (`Modern Ultra-Modern Science & STEM Laboratories`, `Alumni Endowment & Indigent Scholarship Fund`, `High-Speed Campus ICT Hub & Solar Power Array`, `Alumni Healthcare & Elderly Welfare Shield`).
- The initial 12 alumni members (`mem-1995-001` through `mem-1995-012`).
- The 4 events (`Grand Annual Alumni Reunion & Gala Night 2026`, etc.).
- The 4 news articles.
- The 6 gallery photo archives.
- The sample payments (`HAA-2026-89104`, `HAA-2026-77312`, etc.) with their receipts for instant verification testing.

---

### 6. DELIVERABLES REQUIRED IN YOUR RESPONSE
1. Complete, copy-pasteable PostgreSQL DDL migration script (`schema.sql`).
2. Complete triggers and stored procedures (`triggers.sql`).
3. Complete seed data script (`seeds.sql`).
4. (Optional) Prisma ORM schema (`schema.prisma`) and TypeScript types for Node.js / Next.js / Express backend.
5. Standard REST API Endpoints specification (JSON Request / Response samples for `/api/v1/payments/initialize`, `/api/v1/payments/verify/:reference`, `/api/v1/members`, `/api/v1/projects`).
```

# FIREBASE MASTER DATABASE SETUP PROMPT
## Cloud Firestore, Firebase Authentication, Cloud Functions & Real-Time Sync
### CIC Enugu Class of 1995 Alumni Association Portal

> **How to use this prompt:**  
> Copy the entire markdown block below and paste it into ChatGPT, Claude, Cursor, or DeepSeek, or hand it to your Firebase / Fullstack engineer. It instructs the AI to design and generate the complete production-ready Firebase configuration: Cloud Firestore schema & collections structure, Firestore Security Rules (`firestore.rules`), Storage Rules (`storage.rules`), Cloud Functions (v2) for automated financial ledger reconciliation & project milestone triggers, composite indexes (`firestore.indexes.json`), seed data script, and vanilla JavaScript client integration (`firebaseClient.js`).

***

```markdown
You are a Principal Firebase Architect, Cloud Firestore Specialist, and Senior Full-Stack Engineer.

Your objective is to design and produce a complete, production-ready Firebase backend configuration for the "College of the Immaculate Conception (CIC) Enugu - Class of 1995 Alumni Association Portal" (https://github.com/owensmitt79/CIC-ENUGU-25-SET).

The Firebase architecture must be fully self-managing ("autonomous"): it must automatically handle project ID and URL slug generation, update financial balances and donor counts on incoming payments, auto-transition developmental project statuses upon reaching funding goals, enforce strict Firestore and Storage Security Rules, automate member dues clearance, and broadcast real-time state updates to public and admin interfaces without page refreshes.

---

### 1. APPLICATION ARCHITECTURE & FIREBASE PLATFORM REQUIREMENTS
- **Platform:** CIC Enugu Class of 1995 Alumni Portal.
- **Frontend Architecture:** Vanilla HTML5, CSS3, and JavaScript (Modular / ES6).
- **Frontend Admin Portal:** Executive Dashboard with Project Studio, Payments Ledger, Monthly Dues Tracker, News Studio, and Leadership Directory.
- **Backend Stack:** 
  - **Database:** Google Cloud Firestore (Document Database).
  - **Authentication:** Firebase Authentication (Email/Password with Custom Claims: `admin: true`, `role: 'superadmin' | 'financial_secretary' | 'auditor'`).
  - **Serverless Automation:** Firebase Cloud Functions (Node.js 18+ / 20 with Firebase Functions v2).
  - **File Storage:** Cloud Storage for Firebase (`project-banners`, `receipts`, `gallery-media`, `avatars`).
  - **Real-Time Data Layer:** Firestore `onSnapshot` listeners on client applications for zero-latency project progress bars, donor counters, and transaction feeds.
- **Special Capabilities Required:**
  1. **Autonomous Project Engine:** When a project is created via Admin Studio or Cloud Functions, it automatically generates standardized IDs (`prj-1995-XXXX`), computes URL slugs, initializes milestone phase templates, and maintains funding percentages.
  2. **Automated Financial Reconciliation (Atomic Triggers):** When a payment document is created or updated to `status: 'Successful'`, a Cloud Function trigger (`onDocumentCreated` / `onDocumentUpdated`) atomically increments the project's `raisedAmount` and `donorCount` using `FieldValue.increment()`, transitions status to `'completed'` if `raisedAmount >= targetAmount`, creates an individual donation document in `projects/{projectId}/donations`, and clears member dues if applicable.
  3. **Zero-Login Dues Checkout Security:** Public non-authenticated guests can submit verified payments, but strict validation prevents tampering with payment amounts, references, or unauthorized access to sensitive financial ledgers.
  4. **Instant Receipt Verification:** Public lookup (`/verify.html`) by `reference` (e.g. `HAA-2026-89104`) or `receiptNumber` (e.g. `REC-2026-0041`).

---

### 2. CLOUD FIRESTORE DATA MODEL & SCHEMA SPECIFICATION

Design the document structure, data types, field names (camelCase), and subcollections for the following collections:

#### A. Collection `projects` (Developmental Initiatives)
- **Document ID:** String (e.g. `prj-1995-0012` or auto-generated)
- **Fields:**
  - `id` (string): Standardized ID (e.g. `'prj-1995-1042'`)
  - `title` (string): Project name (e.g. `'Ultra-Modern Science & STEM Laboratories'`)
  - `slug` (string): URL-friendly slug (e.g. `'ultra-modern-science-stem-laboratories'`)
  - `category` (string): `'Infrastructure'` | `'Scholarship'` | `'Technology'` | `'Welfare'` | `'Academic'` | `'Sports'`
  - `status` (string): `'active'` | `'completed'` | `'paused'` | `'archived'`
  - `targetAmount` (number): Total budget needed (e.g. `25000000.00`)
  - `raisedAmount` (number): Current funds gathered (e.g. `18750000.00`)
  - `donorCount` (number): Total contributors count (e.g. `142`)
  - `imageUrl` (string): Storage download URL or fallback asset path (e.g. `'images/campus.jpg'`)
  - `description` (string): Detailed campaign overview
  - `beneficiaries` (string): Target community or students
  - `leadCoordinator` (string): Responsible executive alumnus
  - `startDate` (timestamp): Launch date
  - `targetDate` (timestamp): Target completion date
  - `createdBy` (string): UID of admin user
  - `createdAt` (timestamp): Server timestamp (`FieldValue.serverTimestamp()`)
  - `updatedAt` (timestamp): Server timestamp

#### B. Subcollection `projects/{projectId}/milestones` (Phased Undertakings)
- **Document ID:** Auto-generated
- **Fields:**
  - `phaseName` (string): e.g. `'Phase 1: Civil Works & Foundation'`
  - `targetBudget` (number): Phase allocation (e.g. `7500000.00`)
  - `isCompleted` (boolean): `true` | `false`
  - `orderRank` (number): Order index `1`, `2`, `3`
  - `completedAt` (timestamp, nullable)

#### C. Subcollection `projects/{projectId}/donations` (Ledger of Individual Backers)
- **Document ID:** Auto-generated
- **Fields:**
  - `paymentId` (string): Reference to payments document
  - `paymentReference` (string): e.g. `'HAA-2026-89104'`
  - `donorName` (string): Name or `'Generous Alumnus'`
  - `amount` (number): Contribution in Naira
  - `isAnonymous` (boolean): `true` | `false`
  - `notes` (string, nullable)
  - `donatedAt` (timestamp): Server timestamp

#### D. Collection `payments` (Unified Financial Ledger)
- **Document ID:** Auto-generated or Payment Reference
- **Fields:**
  - `reference` (string, indexed, unique): Transaction reference (e.g. `'HAA-2026-89104'`)
  - `receiptNumber` (string, indexed, unique): Official receipt identifier (e.g. `'REC-2026-0041'`)
  - `memberId` (string, nullable, indexed): e.g. `'mem-1995-001'`
  - `projectId` (string, nullable, indexed): Target project ID if project donation
  - `payerName` (string): Full name of contributor
  - `payerEmail` (string): Contact email
  - `payerPhone` (string): Contact phone
  - `payerClassYear` (string): e.g. `'Class of 1995'`
  - `categoryId` (string): `'monthly_dues'` | `'annual_dues'` | `'development_levy'` | `'project_contribution'`
  - `paymentType` (string): e.g. `'Monthly Dues (July - September)'`
  - `selectedMonths` (array of strings): e.g. `['July 2026', 'August 2026', 'September 2026']`
  - `amount` (number): Total amount paid in Naira
  - `gateway` (string): `'Paystack'` | `'Flutterwave'` | `'Monnify'` | `'Direct Transfer'`
  - `channel` (string): `'Debit Card'` | `'USSD'` | `'Bank Transfer'`
  - `status` (string, indexed): `'Successful'` | `'Pending'` | `'Failed'`
  - `itemDescription` (string): Line item description
  - `paidAt` (timestamp): Date payment was finalized
  - `createdAt` (timestamp): Record creation timestamp

#### E. Collection `members` (Alumni Directory)
- **Document ID:** Standardized Member ID (e.g. `mem-1995-001`)
- **Fields:**
  - `id` (string): Member ID
  - `fullName` (string): Full name
  - `classYear` (string): `'Class of 1995'`
  - `email` (string, indexed): Email address
  - `phone` (string): Phone number
  - `chapter` (string, indexed): e.g. `'Enugu Central'`, `'Lagos Main'`, `'Abuja FCT'`, `'UK Diaspora'`
  - `profession` (string): e.g. `'Civil Engineering'`, `'Medicine'`, `'Software'`
  - `duesStatus` (string, indexed): `'Active'` | `'Pending'` | `'Defaulted'`
  - `avatarUrl` (string, nullable): Photo URL
  - `totalContributed` (number): Cumulative contributions in Naira
  - `lastPaymentDate` (timestamp, nullable)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

#### F. Collection `paymentCategories`
- **Document ID:** Category key (e.g. `monthly_dues`, `annual_dues`, `development_levy`)
- **Fields:**
  - `name` (string): Display name
  - `type` (string): `'monthly'` | `'fixed'` | `'custom'`
  - `baseAmount` (number): Default amount (e.g. `5000.00`)
  - `description` (string)
  - `isActive` (boolean): `true`

#### G. Collection `systemConfig` (Singleton Configuration)
- **Document ID:** `'global'`
- **Fields:**
  - `associationName` (string): `'CIC ALUMNI 1995 SET'`
  - `slogan` (string): `'Connecting the Past. Building the Future.'`
  - `monthlyDuesRate` (number): `5000.00`
  - `annualDuesRate` (number): `25000.00`
  - `activeGateway` (string): `'Paystack'`
  - `gatewayMode` (string): `'Live'` | `'Test'`
  - `bankName` (string): `'First Heritage Bank'`
  - `accountNumber` (string): `'1029384756'`
  - `accountName` (string): `'CIC Alumni 1995 Set National'`
  - `ussdPrefix` (string): `'*737*50*5000#'`
  - `updatedAt` (timestamp)

#### H. Collection `auditLogs` (Immutable Ledger Audit Trail)
- **Document ID:** Auto-generated
- **Fields:**
  - `action` (string): e.g. `'PAYMENT_SETTLED'`, `'PROJECT_CREATED'`, `'STATUS_AUTO_COMPLETED'`
  - `actor` (string): `'system_trigger'` | user UID
  - `resourceId` (string): Target doc ID
  - `details` (map): State diff and financial audit metadata
  - `timestamp` (timestamp)

---

### 3. CLOUD FUNCTIONS FOR FIREBASE (v2 - NODE.JS / TYPESCRIPT)

Write production-grade Cloud Functions handling autonomous operations:

#### 1. Function `onPaymentCreated` / `onPaymentUpdated`
- **Trigger:** `onDocumentWritten('payments/{paymentId}')` (or `onDocumentCreated` / `onDocumentUpdated`).
- **Logic:**
  1. Detect transition to `status === 'Successful'`.
  2. If `projectId` is present:
     - Use Firestore transaction or atomic batch:
     - Increment `projects/{projectId}.raisedAmount` by `payment.amount` using `FieldValue.increment(payment.amount)`.
     - Increment `projects/{projectId}.donorCount` by 1 using `FieldValue.increment(1)`.
     - Check if updated `raisedAmount >= targetAmount`: automatically set `projects/{projectId}.status = 'completed'`.
     - Append document to `projects/{projectId}/donations` with donor details.
  3. If `paymentType` is dues-related (`'Monthly Dues'`, `'Annual Dues'`):
     - Query `members` matching `payerEmail` or `payerPhone`.
     - Update matched member's `duesStatus` to `'Active'`, update `lastPaymentDate`, and increment `totalContributed`.
  4. Write an immutable entry to `auditLogs`.

#### 2. Callable Function `createAutonomousProject`
- **Trigger:** `onCall` (Firebase Functions v2).
- **Authentication:** Must verify `request.auth` has `admin === true` custom claim.
- **Input Parameters:**
  - `title` (string), `category` (string), `targetAmount` (number), `description` (string), `imageUrl` (optional), `initialSeed` (optional), `seedDonor` (optional).
- **Logic:**
  1. Generate sequential/unique project ID: `prj-1995-` + random 4-digit token or timestamp sequence.
  2. Generate sanitized slug from `title` (lowercase, alphanumeric with hyphens).
  3. Create document in `projects/{generatedId}`.
  4. Automatically create 3 standard milestone phases in subcollection `milestones`:
     - Phase 1: Mobilization & Site Setup (30% of target)
     - Phase 2: Technical Execution & Construction (50% of target)
     - Phase 3: Quality Audit & Official Handover (20% of target)
  5. If `initialSeed > 0`: log seed payment in `payments` and record seed backer in `projects/{generatedId}/donations`.
  6. Return the full project document and milestone details.

#### 3. Callable / HTTP Function `verifyPaymentRef`
- Public query endpoint allowing verification by reference or receipt number without exposing full financial records to unauthorized users.

---

### 4. FIRESTORE SECURITY RULES (`firestore.rules`)

Provide the complete `firestore.rules` file:
- **Rules Version 2** with helper functions: `isAuthenticated()`, `isAdmin()`, `isValidPayment()`.
- **`projects`**:
  - `allow read`: If `resource.data.status != 'archived'` or `isAdmin()`.
  - `allow create, update, delete`: Only `isAdmin()`.
- **`projects/{projectId}/milestones`**:
  - `allow read`: Public.
  - `allow write`: Only `isAdmin()`.
- **`projects/{projectId}/donations`**:
  - `allow read`: Public (ensure anonymous donations hide donor name).
  - `allow write`: Internal Cloud Functions or Admin only.
- **`payments`**:
  - `allow create`: Allowed for public checkouts IF data is structurally valid (`amount > 0`, `status == 'Pending' || status == 'Successful'`, required fields present).
  - `allow read`: Admin can list and view all. Public can read ONLY single document matching exact reference lookup (`request.query` or single doc access).
  - `allow update, delete`: Only `isAdmin()`.
- **`members`**:
  - `allow read`: Public (for Alumni Directory view).
  - `allow write`: Only `isAdmin()`.
- **`paymentCategories` & `systemConfig`**:
  - `allow read`: Public.
  - `allow write`: Only `isAdmin()`.
- **`auditLogs`**:
  - `allow read`: Only `isAdmin()`.
  - `allow write`: Denied (written exclusively via Cloud Functions Admin SDK).

---

### 5. CLOUD STORAGE FOR FIREBASE RULES (`storage.rules`)

Provide the complete `storage.rules` file:
- Buckets / directories:
  - `project-banners/{fileName}`: Public read, Admin write (images only, max 5MB).
  - `receipts/{fileName}`: Public read, Admin or Function write.
  - `gallery-media/{fileName}`: Public read, Admin write.
  - `avatars/{fileName}`: Public read, Authenticated write for own avatar.

---

### 6. FIRESTORE COMPOSITE INDEXES (`firestore.indexes.json`)

Provide the exact JSON definitions for required indexes:
1. `projects`: `category` (ASC) + `status` (ASC) + `raisedAmount` (DESC)
2. `projects`: `status` (ASC) + `createdAt` (DESC)
3. `payments`: `status` (ASC) + `paidAt` (DESC)
4. `payments`: `projectId` (ASC) + `status` (ASC) + `paidAt` (DESC)
5. `payments`: `memberId` (ASC) + `paidAt` (DESC)
6. `members`: `chapter` (ASC) + `duesStatus` (ASC) + `fullName` (ASC)

---

### 7. SEED DATA SCRIPT (`seedFirestore.js`)

Provide a standalone Node.js script using `firebase-admin` to populate the initial database state:
1. **Initial 4 Projects:**
   - `Ultra-Modern Science & STEM Laboratories` (Target: ₦25,000,000, Raised: ₦18,750,000, Category: Infrastructure)
   - `Alumni Endowment & Indigent Scholarship Fund` (Target: ₦15,000,000, Raised: ₦12,200,000, Category: Scholarship)
   - `High-Speed Campus ICT Hub & Solar Power Array` (Target: ₦35,000,000, Raised: ₦29,400,000, Category: Technology)
   - `Alumni Healthcare & Elderly Welfare Shield` (Target: ₦10,000,000, Raised: ₦6,800,000, Category: Welfare)
2. **Default Payment Categories:** Monthly Dues (₦5,000), Annual Registration (₦25,000), Development Levy (₦50,000), Project Contribution (Custom).
3. **Singleton Configuration:** `systemConfig/global` document.
4. **Initial Members:** Representative alumni records across Enugu, Lagos, Abuja, and Diaspora chapters.

---

### 8. CLIENT-SIDE VANILLA JAVASCRIPT INTEGRATION CODE

Provide production-ready client integration code for the existing frontend:
1. **`firebaseConfig.js`:**
   - Initialize Firebase App using CDN/ESM modular SDK:
   - `initializeApp`, `getFirestore`, `getAuth`, `getStorage`, `getFunctions`.
2. **Real-time Live Projects Listener (`listenToProjects`):**
   - Use `onSnapshot(collection(db, 'projects'), (snapshot) => { ... })` to dynamically update public campaign progress bars, percentage badges, and donor counters in real-time without reloading the page.
3. **Real-time Payments Ledger Listener (`listenToPayments`):**
   - Live stream of verified payments for the Admin Executive Dashboard table.
4. **Autonomous Project Submission Function:**
   - `async function submitProjectToFirebase(formData)` calling the `createAutonomousProject` cloud function or writing to Firestore directly.
```

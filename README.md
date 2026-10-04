# CIC Alumni 1995 Set — Next.js Digital Portal & Payment Platform

Official Next.js (App Router, React 19) digital portal and zero-login dues payment platform for **CIC Alumni 1995 Set** (*College of the Immaculate Conception, Enugu*).

> **Motto:** *"Semper Fidelis"* (Always Faithful)  
> **Slogan:** *"Connecting the Past. Building the Future."*  
> **Framework:** Next.js (App Router) + React + Vanilla CSS Design System

---

## ⚡ Quick Start (Next.js)

```bash
# Run local development server
npm run dev

# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 🌟 Key Highlights & Core Innovation

### 💳 Zero-Login Payment Architecture
Unlike traditional alumni platforms that force members to undergo tedious account registrations, remember passwords, or navigate complex dashboards, this platform enables **immediate, frictionless payments**:
* **No user registration required**
* **No username or password needed**
* **No login credentials to remember**

A member simply:
1. Enters their **Full Name, Phone Number, and Email Address**.
2. Selects the payment category (e.g., Monthly Dues with an interactive 12-month selector, Annual Dues, Development Levy, Welfare, or Project Donation).
3. Chooses a payment gateway (**Paystack**, **Flutterwave**, **Monnify**, or **Remita**) and payment method (Card, Bank Transfer, or USSD).
4. Completes payment and instantly receives an **official digital receipt** complete with:
   * Verifiable Transaction Reference (`HAA-2026-XXXXX`)
   * Receipt Number (`REC-2026-XXXX`)
   * Scannable SVG Verification QR code
   * One-click **Print Receipt** and **Download Receipt** options.

---

## 🚀 Portal Features & Components

### 🏛️ Public Association Portal
* **Header & Brand**: Official College of the Immaculate Conception (CIC) crest (`logo.png`) and sticky navigation with automated 85px scroll offset.
* **Hero Page**:
  * Authentic CIC campus collage background (`hero-bg.jpg`) themed in official royal blue.
  * Showcase photo card of the iconic **Semper Fidelis** student monument (`cic-statue.jpg`).
  * Instant action buttons: **PAY DUES** and **ABOUT US**.
  * Set statistical milestones (200 Class of 1995 Members, 100% Instant Receipts).
* **About the Association**:
  * Narrative of brotherhood, history, vision, and mission.
  * 7 core commitments to alma mater growth, scholarship funding, and member welfare.
* **Executive Leadership Directory**:
  * Profile cards for President, Vice President, Secretary, Financial Secretary, Treasurer, PRO, and Welfare Officer.
  * Interactive biographical reader modal for every executive.
* **Development Projects & Initiatives**:
  * Live project funding progress bars (Target vs. Raised amounts, donor counters, funding percentage).
  * 1-click **"SUPPORT THIS PROJECT"** button that pre-fills project details into the payment checkout.
* **News & Bulletins**:
  * Categorized news articles (*Alumni News*, *Meeting Notices*, *Event Announcements*, *Project Updates*).
  * Live category filtering and full-article modal reader.
* **Alumni Photo Gallery**:
  * Visual albums (*Reunions*, *Projects*, *Campus Life*) with an interactive responsive lightbox reader.
* **Public Payment Verification Engine & Receipt Generator ([verify.html](file:///c:/Users/user_pc/Desktop/Eng%20ilo/verify.html))**:
  * Public lookup tool where any member or auditor can verify any transaction reference or receipt number.
  * Instant **"View & Print Official Receipt"** button opening an official printable receipt modal with QR code, CIC Crest, and PDF download.
* **Secretariat Contact Desk ([contact.html](file:///c:/Users/user_pc/Desktop/Eng%20ilo/contact.html))**:
  * Direct contact form, official address at CIC Enugu, and verified email correspondences.

### 🔒 Executive Admin Dashboard
Accessible via the discreet **"Executive Admin Login"** link in the footer:
* **PIN Protected**: Default PIN is `admin123`.
* **Issue Member Dues Receipt Studio**: Dedicated "+ Issue Dues Receipt" tool allowing executive admins to record payments made via direct bank wire, cash, or POS, select cleared months (Jan-Dec), and instantly generate an official verifiable digital receipt.
* **Financial KPI Overview**: Real-time revenue totals, today's collections, total transaction counts, and category breakdowns.
* **Payments Ledger**: Searchable by name, email, phone, reference, or receipt number, with category filtering and instant 1-click receipt modal viewer.
* **Monthly Dues Tracker**: Real-time tracking of cleared months per alumnus, cumulative dues revenue, and receipt generation.
* **1-Click Export**: Export entire payments ledger to **CSV / Excel** for executive reporting and audits.
* **Project Creation & Management**: Dedicated "+ Create Project" bar allowing executive admins to define and publish new developmental initiatives (title, category, target funding, seed funding, banner image presets, and scope) with real-time public synchronization.
* **News & Announcements Publishing Studio**: Executive admin control over portal notices and bulletins with full create, edit, pin as featured headline, preview modal, instant multi-field search, category filtering, and delete actions with zero-reload real-time public synchronization.
* **Monthly Dues Rate Configurator**: Adjust statutory monthly dues rate (e.g., ₦5,000) with instant site-wide recalculation.
* **Gateway Settings**: Toggle active gateway (**Paystack**, **Flutterwave**, **Monnify**, **Remita**) and switch between Test Mode and Live Mode.

---

## 📁 Project Structure

```text
Eng ilo/
├── .gitignore              # Git ignore rules for OS, editor, and build artifacts
├── README.md               # Project documentation and developer guide
├── PROJECT_DOCUMENTATION.md# Comprehensive technical & operational specifications
├── index.html              # Homepage portal (Hero, projects preview, dispatches)
├── about.html              # Dedicated About the Association & Alma Mater history
├── leadership.html         # Dedicated Executive Council directory
├── members.html            # Dedicated Class of 1995 Members Directory with search & filters
├── projects.html           # Dedicated Development Projects, funding progress & filters
├── gallery.html            # Dedicated Alumni Photo & Media Gallery with interactive lightbox
├── verify.html             # Dedicated official transaction & receipt verification portal
├── payment.html            # Dedicated zero-login dues & donation checkout platform
├── contact.html            # Dedicated National Secretariat desk & inquiry forms
├── login.html              # Dedicated Executive Administrator Login portal
├── admin.html              # Dedicated Executive Administrator Dashboard & project publishing
├── images/                 # All Brand & Media Assets
│   ├── logo.png            # Official CIC Crest high-resolution logo
│   ├── hero-bg.jpg         # Official CIC campus collage widescreen hero background
│   ├── cic-statue.jpg      # Iconic CIC Semper Fidelis student monument photo
│   └── campus.jpg          # Historic CIC campus quadrangle & assembly photograph
├── css/
│   └── style.css           # Modern design system (CIC Royal Blue & White, responsive)
└── js/
    ├── data.js             # LocalStorage data store, defaults, and transaction persistence
    ├── app.js              # Payment stepper engine, QR generator, modal readers, smooth scroll
    ├── admin.js            # Executive dashboard logic, ledger search, PIN auth, CSV exporter
    └── receipt.js          # Printable and downloadable verified receipt generator
```

---

## 🎨 Design System & Aesthetics

* **Color Palette**:
  * **Refined Primary Navy**: `#2B5797` (subdued, elegant collegiate blue)
  * **Deep Charcoal Slate Navy**: `#17253D` to `#0B1320` (prestigious contrast for titles & hero overlay)
  * **Crisp Pure White**: `#FFFFFF`
  * **Soft Mist & Slate Accents**: `#F4F7FA` to `#96B5D8`
* **Typography**:
  * Headings: **Cinzel** / **Playfair Display** (prestigious serif)
  * Body & UI: **Outfit** / **Inter** (modern geometric sans-serif)
* **Zero External Build Step**: Pure Vanilla HTML5, CSS3, and ES6 JavaScript. No Node.js build dependencies required to preview or run.

---

## 💻 How to Run Locally

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   ```
2. Open `index.html` directly in any modern web browser:
   * **Windows**: Double-click `index.html` or drag it into Chrome, Edge, Firefox, or Brave.
   * **URL format**: `file:///C:/path/to/project/index.html`
3. Alternatively, serve using any lightweight HTTP server:
   ```bash
   # Using Python 3:
   python -m http.server 8080

   # Using Node.js (npx):
   npx serve .
   ```
4. Access the site in your browser at `http://localhost:8080`.

---

## 🔐 Admin Credentials

* **Default Admin PIN**: `admin123`
* **Location**: Click **"Executive Admin Login"** in the footer of the page.

---

## 📜 License

&copy; 2026 **CIC Alumni 1995 Set** (*College of the Immaculate Conception, Enugu, Nigeria*). All rights reserved.

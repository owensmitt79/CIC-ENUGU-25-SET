/**
 * Next.js Data Layer for CIC Alumni 1995 Set
 * Client-safe with SSR hydration fallback and localStorage persistence.
 */

export const DEFAULT_CONFIG = {
  associationName: 'CIC ALUMNI 1995 SET',
  slogan: 'Connecting the Past. Building the Future.',
  monthlyDuesRate: 5000,
  annualDuesRate: 25000,
  reunionFeeRate: 15000,
  activeGateway: 'Paystack',
  gatewayMode: 'Test Mode',
  bankAccount: {
    bankName: 'First Heritage Bank',
    accountNumber: '1029384756',
    accountName: 'CIC Alumni 1995 Set National'
  },
  ussdPrefix: '*737*50*5000#'
};

export const DEFAULT_CATEGORIES = [
  { id: 'monthly_dues', name: 'Monthly Dues', type: 'monthly', baseAmount: 5000, active: true, description: 'Mandatory monthly welfare and operations dues.' },
  { id: 'annual_dues', name: 'Annual Dues', type: 'fixed', baseAmount: 25000, active: true, description: 'One-time annual alumni registration and membership dues.' },
  { id: 'development_levy', name: 'Development Levy', type: 'fixed', baseAmount: 10000, active: true, description: 'Special contribution towards school infrastructure and grounds.' },
  { id: 'welfare_contribution', name: 'Welfare Contribution', type: 'custom', baseAmount: 5000, active: true, description: 'Voluntary support fund for alumni welfare and emergency assistance.' },
  { id: 'donation', name: 'Donation', type: 'custom', baseAmount: 10000, active: true, description: 'General philanthropy and endowment donations for the association.' },
  { id: 'project_contribution', name: 'Project Contribution', type: 'custom', baseAmount: 20000, active: true, description: 'Direct financing of ongoing alumni school rehabilitation projects.' },
  { id: 'event_registration', name: 'Event Registration', type: 'fixed', baseAmount: 5000, active: true, description: 'Participation and registration tickets for alumni gatherings.' },
  { id: 'reunion_fee', name: 'Reunion Fee', type: 'fixed', baseAmount: 15000, active: true, description: 'Comprehensive registration and package for the Grand Alumni Reunion.' },
  { id: 'special_levy', name: 'Special Levy', type: 'custom', baseAmount: 5000, active: true, description: 'Executive council authorized special project assessment.' },
  { id: 'other_payments', name: 'Other Payments', type: 'custom', baseAmount: 5000, active: true, description: 'Miscellaneous alumni association fees and contributions.' }
];

export const DEFAULT_LEADERSHIP = [
  {
    id: 'lead-01',
    name: 'Engr. Kenneth Ugwu',
    role: 'Global President',
    phone: '+234 803 123 4567',
    email: 'president@cic1995.org',
    city: 'Enugu / Lagos',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Founding class chair spearheading the Digital Empowerment & Infrastructure Decade.',
    profession: 'Civil & Structural Engineer'
  },
  {
    id: 'lead-02',
    name: 'Barrister Chinedu Eneh',
    role: 'Vice President',
    phone: '+234 802 987 6543',
    email: 'vp@cic1995.org',
    city: 'Abuja, FCT',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Lead legal counselor coordinating constitutional governance and chapter development.',
    profession: 'Senior Advocate & Solicitor'
  },
  {
    id: 'lead-03',
    name: 'Dr. Emeka Ozoemena',
    role: 'General Secretary',
    phone: '+234 803 555 1212',
    email: 'secretary@cic1995.org',
    city: 'Enugu',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'Oversees the Secretariat, alumni records repository, and official executive communications.',
    profession: 'Consultant Neurosurgeon'
  },
  {
    id: 'lead-04',
    name: 'Chief Obinna Mbah',
    role: 'Financial Secretary',
    phone: '+234 809 333 4455',
    email: 'finance@cic1995.org',
    city: 'Port Harcourt',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    bio: 'Architect of the zero-login transparent dues ledger and automated receipting framework.',
    profession: 'Chartered Financial Analyst'
  },
  {
    id: 'lead-05',
    name: 'Mr. Jude Anyanwu',
    role: 'Treasurer',
    phone: '+234 814 777 8899',
    email: 'treasurer@cic1995.org',
    city: 'Enugu',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Manages treasury allocations, disbursements, capital projects banking, and annual audits.',
    profession: 'Principal Banking Executive'
  },
  {
    id: 'lead-06',
    name: 'Arc. Nonso Okeke',
    role: 'Projects Director',
    phone: '+234 805 111 2233',
    email: 'projects@cic1995.org',
    city: 'Lagos',
    status: 'Active',
    joined: '1995',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    bio: 'Directs the STEM lab renovation, solar power grid installation, and campus sports fields.',
    profession: 'Architectural Consultant'
  }
];

export const DEFAULT_MEMBERS = [
  { id: 'mem-01', name: 'Engr. Kenneth Ugwu', phone: '08031234567', email: 'president@cic1995.org', city: 'Enugu / Lagos', profession: 'Civil Engineer', status: 'Good Standing' },
  { id: 'mem-02', name: 'Barrister Chinedu Eneh', phone: '08029876543', email: 'vp@cic1995.org', city: 'Abuja, FCT', profession: 'Legal Practitioner', status: 'Good Standing' },
  { id: 'mem-03', name: 'Dr. Emeka Ozoemena', phone: '08035551212', email: 'secretary@cic1995.org', city: 'Enugu', profession: 'Medical Doctor', status: 'Good Standing' },
  { id: 'mem-04', name: 'Chief Obinna Mbah', phone: '08093334455', email: 'finance@cic1995.org', city: 'Port Harcourt', profession: 'Financial Analyst', status: 'Good Standing' },
  { id: 'mem-05', name: 'Mr. Jude Anyanwu', phone: '08147778899', email: 'treasurer@cic1995.org', city: 'Enugu', profession: 'Banker', status: 'Good Standing' },
  { id: 'mem-06', name: 'Arc. Nonso Okeke', phone: '08051112233', email: 'projects@cic1995.org', city: 'Lagos', profession: 'Architect', status: 'Good Standing' },
  { id: 'mem-07', name: 'Dr. Obinna Eze', phone: '08034567890', email: 'obinna.eze@example.com', city: 'Enugu', profession: 'Cardiologist', status: 'Good Standing' },
  { id: 'mem-08', name: 'Mrs. Funmilayo Adeleke', phone: '08123456789', email: 'funmi.adeleke@gmail.com', city: 'Ibadan', profession: 'Educationist', status: 'Good Standing' },
  { id: 'mem-09', name: 'Arc. Babatunde Lawal', phone: '09012345678', email: 'blawal@archpartners.ng', city: 'Lagos', profession: 'Urban Planner', status: 'Good Standing' },
  { id: 'mem-10', name: 'Engr. Nnamdi Okoli', phone: '08098765432', email: 'nnamdi.okoli@energysolutions.com', city: 'Abuja', profession: 'Power Engineer', status: 'Good Standing' },
  { id: 'mem-11', name: 'Ms. Grace Danladi', phone: '08155543210', email: 'grace.danladi@yahoo.co.uk', city: 'Kaduna', profession: 'Economist', status: 'Good Standing' },
  { id: 'mem-12', name: 'Chief Victor Uwazurike', phone: '07033445566', email: 'chief.uwazurike@holdings.ng', city: 'Owerri', profession: 'Industrialist', status: 'Good Standing' }
];

export const DEFAULT_EVENTS = [
  {
    id: 'evt-01',
    title: 'Grand Annual Alumni Reunion & Gala Night 2026',
    category: 'Reunions & Homecomings',
    date: '2026-12-18',
    displayDate: 'Dec 18, 2026',
    time: '6:00 PM Prompt',
    location: 'Enugu Sports Club, Independence Layout, Enugu',
    fee: 15000,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    featured: true,
    description: 'The flagship annual gathering of the 1995 cohort featuring red carpet, anniversary toasts, executive address, award conferments, and banquet dinner.',
    status: 'Upcoming'
  },
  {
    id: 'evt-02',
    title: 'Fourth Quarter Hybrid Assembly & National Congress',
    category: 'Annual General Meetings (AGM)',
    date: '2026-10-24',
    displayDate: 'Oct 24, 2026',
    time: '11:00 AM Prompt',
    location: 'Main College Hall, CIC Enugu & Zoom Live',
    fee: 0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    featured: false,
    description: 'Constitutional general assembly reviewing audited accounts, ongoing projects, membership welfare resolutions, and 2027 strategic roadmap.',
    status: 'Upcoming'
  },
  {
    id: 'evt-03',
    title: 'Alumni Tech & Business Mentorship Summit',
    category: 'Professional Summit',
    date: '2026-11-14',
    displayDate: 'Nov 14, 2026',
    time: '10:00 AM Prompt',
    location: 'Golden Royale Banquet Hall, Enugu',
    fee: 5000,
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    featured: false,
    description: 'Empowering younger graduating classes with career pathways, capital financing, technological innovations, and business networking.',
    status: 'Upcoming'
  }
];

export const DEFAULT_PROJECTS = [];

export const DEFAULT_NEWS = [
  {
    id: 'news-01',
    title: 'Executive Council Rolls Out Digital Zero-Login Dues Platform',
    category: 'Alumni News',
    date: '2026-09-10',
    summary: 'Members can now pay monthly dues, contributions, and event fees in under 60 seconds with instant digital receipts and no passwords needed.',
    content: 'The National Executive Council of CIC Alumni 1995 Set is delighted to unveil our new seamless payment portal. Designed to completely eliminate registration friction, alumni worldwide can now verify dues, select one or multiple months, and receive instant downloadable verifiable receipts with embedded QR codes. Payment channels include Paystack, Flutterwave, Monnify, and Remita.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'news-02',
    title: 'STEM Laboratory Project Reaches 75% Funding Milestone',
    category: 'Project Updates',
    date: '2026-09-02',
    summary: 'Thanks to generous contributions from the 1995 set and partner cohorts, Phase 1 instrumentation has arrived on campus.',
    content: 'The Project Committee reports significant progress on the Modern Science Laboratory rehabilitation at CIC Enugu. Structural fittings, fume hoods, and backup solar inverters are being installed this month. We encourage all members to step forward and complete the remaining funding target.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'news-03',
    title: 'Important Notice: Third Quarter General Meeting & Dues Reconciliation',
    category: 'Meeting Notices',
    date: '2026-08-25',
    summary: 'All chapter executives and class members are invited to the Q3 hybrid virtual assembly on October 1st.',
    content: 'Notice is hereby given that the Q3 General Meeting will review regional chapter reports, welfare audits, and the upcoming Grand Alumni Reunion itinerary. Members are reminded to clear their Q1-Q3 monthly dues using our online portal prior to the meeting.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'news-04',
    title: 'Call for Nominations: CIC Distinguished Merit Awards 2026',
    category: 'Alumni News',
    date: '2026-08-14',
    summary: 'Submit nominations for exemplary alumni who have distinguished themselves in public service, industry, and academia.',
    content: 'The Honors and Awards Committee invites submissions from the global CIC alumni community. Categories include Lifetime Leadership, Entrepreneurial Innovation, Humanitarian Service, and Semper Fidelis Excellence. Awardees will be celebrated at the Annual Gala.',
    image: 'https://images.unsplash.com/photo-1569420077902-6019a5840620?auto=format&fit=crop&w=800&q=80',
    featured: false
  }
];

export const DEFAULT_GALLERY = [
  {
    id: 'gal-01',
    title: 'Grand Silver Jubilee Reunion Gala',
    category: 'Reunions',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    caption: 'Alumni from five decades reuniting during the ceremonial banquet.'
  },
  {
    id: 'gal-02',
    title: 'Commencement of ICT Center Solar Array',
    category: 'Community Projects',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
    caption: 'Executive team inspecting the new solar power backup project on campus.'
  },
  {
    id: 'gal-03',
    title: 'Annual General Meeting Delegates',
    category: 'Annual General Meetings',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    caption: 'Chapter chairs in parliamentary session during the 2025 National Congress.'
  },
  {
    id: 'gal-04',
    title: 'Distinguished Fellowships & Awards Night',
    category: 'Award Ceremonies',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80',
    caption: 'Conferment of Alumni Merit Medals to notable trailblazers.'
  },
  {
    id: 'gal-05',
    title: 'Class of 2004 20-Year Anniversary Banquet',
    category: 'Reunions',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    caption: 'Nostalgic toasts and celebration of memories among classmates.'
  },
  {
    id: 'gal-06',
    title: 'Alumni Tech & Career Networking Mixer',
    category: 'Networking Events',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
    caption: 'Cross-generational mentorship and business collaboration session.'
  }
];

export const DEFAULT_PAYMENTS = [
  {
    reference: 'HAA-2026-89204',
    receiptNumber: 'REC-2026-0041',
    name: 'Dr. Obinna Eze',
    phone: '08034567890',
    email: 'obinna.eze@example.com',
    paymentType: 'Monthly Dues',
    selectedMonths: ['January', 'February', 'March'],
    amount: 15000,
    gateway: 'Paystack',
    channel: 'Debit Card',
    status: 'Successful',
    date: '2026-09-14 14:22:10',
    timestamp: 1789395730000,
    itemDescription: 'Monthly Dues (3 Months: Jan, Feb, Mar)'
  },
  {
    reference: 'HAA-2026-77312',
    receiptNumber: 'REC-2026-0040',
    name: 'Mrs. Funmilayo Adeleke',
    phone: '08123456789',
    email: 'funmi.adeleke@gmail.com',
    paymentType: 'Annual Dues',
    selectedMonths: [],
    amount: 25000,
    gateway: 'Flutterwave',
    channel: 'Bank Transfer',
    status: 'Successful',
    date: '2026-09-13 11:05:45',
    timestamp: 1789309545000,
    itemDescription: 'Annual Dues (2026 Session)'
  },
  {
    reference: 'HAA-2026-65481',
    receiptNumber: 'REC-2026-0039',
    name: 'Arc. Babatunde Lawal',
    phone: '09012345678',
    email: 'blawal@archpartners.ng',
    paymentType: 'Project Contribution',
    selectedMonths: [],
    amount: 100000,
    gateway: 'Paystack',
    channel: 'Debit Card',
    status: 'Successful',
    date: '2026-09-12 16:40:02',
    timestamp: 1789243202000,
    itemDescription: 'Modern Ultra-Modern Science & STEM Laboratories Contribution'
  },
  {
    reference: 'HAA-2026-54129',
    receiptNumber: 'REC-2026-0038',
    name: 'Engr. Nnamdi Okoli',
    phone: '08098765432',
    email: 'nnamdi.okoli@energysolutions.com',
    paymentType: 'Monthly Dues',
    selectedMonths: ['January', 'February', 'March', 'April', 'May', 'June'],
    amount: 30000,
    gateway: 'Monnify',
    channel: 'Bank Transfer',
    status: 'Successful',
    date: '2026-09-10 09:18:33',
    timestamp: 1789043913000,
    itemDescription: 'Monthly Dues (6 Months: Jan, Feb, Mar, Apr, May, Jun)'
  },
  {
    reference: 'HAA-2026-43901',
    receiptNumber: 'REC-2026-0037',
    name: 'Ms. Grace Danladi',
    phone: '08155543210',
    email: 'grace.danladi@yahoo.co.uk',
    paymentType: 'Event Registration',
    selectedMonths: [],
    amount: 15000,
    gateway: 'Remita',
    channel: 'USSD',
    status: 'Successful',
    date: '2026-09-08 19:35:12',
    timestamp: 1788898512000,
    itemDescription: 'Grand Annual Alumni Reunion & Gala Night 2026 Ticket'
  },
  {
    reference: 'HAA-2026-32098',
    receiptNumber: 'REC-2026-0036',
    name: 'Chief Victor Uwazurike',
    phone: '07033445566',
    email: 'chief.uwazurike@holdings.ng',
    paymentType: 'Donation',
    selectedMonths: [],
    amount: 250000,
    gateway: 'Paystack',
    channel: 'Bank Transfer',
    status: 'Successful',
    date: '2026-09-05 13:12:00',
    timestamp: 1788613920000,
    itemDescription: 'Alumni Endowment & Indigent Scholarship Donation'
  }
];

export const STORAGE_KEYS = {
  PAYMENTS: 'haa_payments_v1',
  CONFIG: 'haa_config_v1',
  CATEGORIES: 'haa_categories_v1',
  EVENTS: 'haa_events_v1',
  PROJECTS: 'haa_projects_v1',
  NEWS: 'haa_news_v1',
  GALLERY: 'haa_gallery_v1',
  LEADERSHIP: 'haa_leadership_v2',
  MEMBERS: 'haa_members_v1',
  MESSAGES: 'haa_messages_v1',
  ADMIN_PIN: 'haa_admin_pin_v1',
  ADMIN_EMAIL: 'haa_admin_email_v1'
};

const isClient = typeof window !== 'undefined';

function getItem(key, fallback) {
  if (!isClient) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function setItem(key, val) {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (_) {}
}

export const DataStore = {
  getConfig() {
    return getItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  },
  saveConfig(cfg) {
    setItem(STORAGE_KEYS.CONFIG, cfg);
  },
  getCategories() {
    return getItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },
  saveCategories(cats) {
    setItem(STORAGE_KEYS.CATEGORIES, cats);
    if (isClient) {
      try { localStorage.setItem('haa_categories_pulse', Date.now().toString()); } catch (_) {}
    }
  },
  getLeadership() {
    return getItem(STORAGE_KEYS.LEADERSHIP, DEFAULT_LEADERSHIP);
  },
  getMembers() {
    return getItem(STORAGE_KEYS.MEMBERS, DEFAULT_MEMBERS);
  },
  getEvents() {
    return getItem(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
  },
  saveEvents(evts) {
    setItem(STORAGE_KEYS.EVENTS, evts);
  },
  addEvent(event) {
    const list = this.getEvents();
    if (!event.id) event.id = 'evt-' + Date.now();
    if (!event.displayDate && event.date) {
      try {
        const parts = event.date.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          event.displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      } catch (_) {}
    }
    list.unshift(event);
    this.saveEvents(list);
    return event;
  },
  updateEvent(event) {
    let list = this.getEvents();
    const idx = list.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...event };
      this.saveEvents(list);
      return list[idx];
    }
    return null;
  },
  deleteEventById(id) {
    let list = this.getEvents();
    list = list.filter(e => e.id !== id);
    this.saveEvents(list);
    return true;
  },
  findEventById(id) {
    return this.getEvents().find(e => e.id === id) || null;
  },
  getProjects() {
    const raw = getItem(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    const legacyIds = ['prj-01', 'prj-02', 'prj-03', 'prj-04'];
    return (raw || []).filter(p => p && !legacyIds.includes(p.id));
  },
  saveProjects(prjs) {
    setItem(STORAGE_KEYS.PROJECTS, prjs);
  },
  addProject(project) {
    const projects = this.getProjects();
    const newProj = {
      ...project,
      id: 'prj-' + Date.now(),
      raised: 0,
      donorsCount: 0,
      createdAt: new Date().toISOString()
    };
    projects.unshift(newProj);
    this.saveProjects(projects);
    return newProj;
  },
  deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== id);
    this.saveProjects(projects);
    return true;
  },
  findProjectById(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },
  getNews() {
    return getItem(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
  },
  saveNews(newsList) {
    setItem(STORAGE_KEYS.NEWS, newsList);
    if (isClient) {
      try { localStorage.setItem('haa_news_pulse', Date.now().toString()); } catch (_) {}
    }
  },
  addNews(item) {
    const list = this.getNews();
    if (!item.id) item.id = 'news-' + Date.now();
    list.unshift(item);
    this.saveNews(list);
    return item;
  },
  updateNews(item) {
    let list = this.getNews();
    const idx = list.findIndex(n => n.id === item.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      this.saveNews(list);
      return list[idx];
    }
    return null;
  },
  deleteNews(newsId) {
    let list = this.getNews();
    list = list.filter(n => n.id !== newsId);
    this.saveNews(list);
    return list;
  },
  findNewsById(newsId) {
    return this.getNews().find(n => n.id === newsId) || null;
  },
  getGallery() {
    return getItem(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
  },
  saveGallery(gal) {
    setItem(STORAGE_KEYS.GALLERY, gal);
    if (isClient) {
      try { localStorage.setItem('haa_gallery_pulse', Date.now().toString()); } catch (_) {}
    }
  },
  addGalleryItem(item) {
    const list = this.getGallery();
    if (!item.id) item.id = 'gal-' + Date.now();
    list.unshift(item);
    this.saveGallery(list);
    return item;
  },
  updateGalleryItem(item) {
    let list = this.getGallery();
    const idx = list.findIndex(g => g.id === item.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...item };
      this.saveGallery(list);
      return list[idx];
    }
    return null;
  },
  deleteGalleryItem(id) {
    let list = this.getGallery();
    list = list.filter(g => g.id !== id);
    this.saveGallery(list);
    return true;
  },
  findGalleryItemById(id) {
    return this.getGallery().find(g => g.id === id) || null;
  },
  getPayments() {
    return getItem(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  },
  savePayments(payments) {
    setItem(STORAGE_KEYS.PAYMENTS, payments);
    if (isClient) {
      try { localStorage.setItem('haa_payment_pulse', Date.now().toString()); } catch (_) {}
    }
  },
  recordPayment(payment) {
    const payments = this.getPayments();
    const newPayment = {
      ...payment,
      timestamp: Date.now(),
      status: 'Successful'
    };
    if (!newPayment.receiptNumber) {
      const year = new Date().getFullYear();
      const count = payments.length + 1;
      newPayment.receiptNumber = `REC-${year}-${count.toString().padStart(4, '0')}`;
    }
    payments.unshift(newPayment);
    this.savePayments(payments);
    return newPayment;
  },
  verifyPayment(refOrReceipt) {
    const query = (refOrReceipt || '').trim().toUpperCase();
    if (!query) return null;
    const payments = this.getPayments();
    return payments.find(p =>
      (p.reference && p.reference.toUpperCase() === query) ||
      (p.receiptNumber && p.receiptNumber.toUpperCase() === query)
    ) || null;
  },
  getAdminPin() {
    if (!isClient) return 'admin123';
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || 'admin123';
  }
};

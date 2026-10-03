/**
 * High Alumni Association - Seed Data and Store Management
 * Handles local storage persistence for dues rates, categories, payments,
 * events, projects, news, leadership, and gallery items.
 */

// Intercept and resolve noisy third-party extension/webview listener exceptions (e.g. tabs:outgoing.message.ready)
(function initMessageListeners() {
  if (typeof window === 'undefined') return;

  // 1. Proactively respond to tabs:outgoing handshake messages if sent by webview/extension bridges
  window.addEventListener('message', function(event) {
    try {
      if (!event || !event.data) return;
      const data = event.data;
      const isTarget = 
        (typeof data === 'string' && (data.includes('tabs:outgoing') || data.includes('message.ready'))) ||
        (typeof data === 'object' && (data.type === 'tabs:outgoing.message.ready' || (data.action && String(data.action).includes('tabs:outgoing'))));

      if (isTarget && event.source && typeof event.source.postMessage === 'function') {
        event.source.postMessage({ type: 'tabs:outgoing.message.ready:ack', status: 'ready' }, '*');
      }
    } catch (_) {}
  }, false);

  // 2. Intercept unhandled promise rejections specifically matching tabs:outgoing
  window.addEventListener('unhandledrejection', function(event) {
    try {
      const reason = event && event.reason ? (event.reason.message || String(event.reason)) : '';
      if (reason.includes('No Listener: tabs:outgoing') || reason.includes('tabs:outgoing.message.ready')) {
        event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      }
    } catch (_) {}
  });

  // 3. Intercept general window errors specifically matching tabs:outgoing
  window.addEventListener('error', function(event) {
    try {
      const msg = event && event.message ? String(event.message) : '';
      if (msg.includes('No Listener: tabs:outgoing') || msg.includes('tabs:outgoing.message.ready')) {
        event.preventDefault();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      }
    } catch (_) {}
  });
})();

const STORAGE_KEYS = {
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

const DEFAULT_CONFIG = {
  associationName: 'CIC ALUMNI 1995 SET',
  slogan: 'Connecting the Past. Building the Future.',
  monthlyDuesRate: 5000,
  annualDuesRate: 25000,
  reunionFeeRate: 15000,
  activeGateway: 'Paystack', // 'Paystack' | 'Flutterwave' | 'Monnify' | 'Remita'
  gatewayMode: 'Test Mode',
  bankAccount: {
    bankName: 'First Heritage Bank',
    accountNumber: '1029384756',
    accountName: 'CIC Alumni 1995 Set National'
  },
  ussdPrefix: '*737*50*5000#'
};

const DEFAULT_CATEGORIES = [
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

const DEFAULT_LEADERSHIP = [];

const DEFAULT_MEMBERS = [
  {
    id: 'mem-1995-001',
    name: 'Engr. Michael C. Adebayo, FNSE',
    classYear: 'Class of 1995',
    email: 'm.adebayo@cic1995.org',
    phone: '0803 452 1109',
    chapter: 'Lagos Main',
    profession: 'Civil / Structural Engineering',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-002',
    name: 'Dr. (Mrs.) Chinwe E. Okonkwo',
    classYear: 'Class of 1995',
    email: 'c.okonkwo@cic1995.org',
    phone: '0802 981 4452',
    chapter: 'Enugu Central',
    profession: 'Consultant Pediatrician',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-003',
    name: 'Barr. Tunde O. Balogun',
    classYear: 'Class of 1995',
    email: 'tunde.balogun@legalpartners.ng',
    phone: '0818 776 2210',
    chapter: 'Abuja FCT',
    profession: 'Senior Corporate Counsel',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-004',
    name: 'Mr. Franklyn I. Chukwuma, FCA',
    classYear: 'Class of 1995',
    email: 'f.chukwuma@fincapital.com',
    phone: '0703 118 9033',
    chapter: 'Lagos Main',
    profession: 'Chartered Accountant / Auditor',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-005',
    name: 'Dr. Kenneth S. Nwachukwu',
    classYear: 'Class of 1995',
    email: 'k.nwachukwu@healthnet.org',
    phone: '0805 667 8901',
    chapter: 'Enugu Central',
    profession: 'Chief Medical Officer',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-006',
    name: 'Comrade David K. Mensah',
    classYear: 'Class of 1995',
    email: 'd.mensah@mediagroup.ng',
    phone: '0812 345 6789',
    chapter: 'Port Harcourt',
    profession: 'Public Relations Consultant',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-007',
    name: 'Arc. Emeka J. Nnamani',
    classYear: 'Class of 1995',
    email: 'e.nnamani@archstudio.com',
    phone: '0803 992 3411',
    chapter: 'Enugu Central',
    profession: 'Principal Architect',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-008',
    name: 'Mr. Obinna Patrick Ezeh',
    classYear: 'Class of 1995',
    email: 'obinna.ezeh@techventures.io',
    phone: '0806 771 8844',
    chapter: 'UK / London',
    profession: 'Software Solutions Architect',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-009',
    name: 'Dr. Ifeanyi K. Onyeka',
    classYear: 'Class of 1995',
    email: 'ifeanyi.onyeka@medspecialists.org',
    phone: '0813 552 9012',
    chapter: 'USA / Houston',
    profession: 'Orthopedic Surgeon',
    duesStatus: 'Pending',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-010',
    name: 'Engr. Nnamdi Collins Umeh',
    classYear: 'Class of 1995',
    email: 'nnamdi.umeh@petroinfra.ng',
    phone: '0802 443 1920',
    chapter: 'Port Harcourt',
    profession: 'Petroleum Engineer',
    duesStatus: 'Pending',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-011',
    name: 'Mr. Kelechi B. Agbo',
    classYear: 'Class of 1995',
    email: 'k.agbo@investcorp.ng',
    phone: '0706 889 2241',
    chapter: 'Abuja FCT',
    profession: 'Fintech Product Manager',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  },
  {
    id: 'mem-1995-012',
    name: 'Prof. Uzoma G. Ibe',
    classYear: 'Class of 1995',
    email: 'uzoma.ibe@uniedu.org',
    phone: '0803 774 5510',
    chapter: 'USA / Atlanta',
    profession: 'Professor of Economics',
    duesStatus: 'Active',
    dateJoined: '1995-07-15'
  }
];

const DEFAULT_EVENTS = [
  {
    id: 'evt-2026-01',
    title: 'Grand Annual Alumni Reunion & Gala Night 2026',
    description: 'An unforgettable evening of celebration, nostalgic reconnection, live orchestral music, award recognitions, and keynote addresses.',
    date: '2026-11-28',
    displayDate: 'November 28, 2026',
    time: '5:00 PM Prompt',
    location: 'Grand Continental Ballroom, Victoria Island / Live Stream',
    fee: 15000,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'evt-2026-02',
    title: 'Alumni Professional Mentorship Summit & Career Fair',
    description: 'Connecting young alumni with industry captains across technology, medicine, finance, law, and renewable energy.',
    date: '2026-10-15',
    displayDate: 'October 15, 2026',
    time: '10:00 AM - 3:00 PM',
    location: 'High Institution Conference Hall & Zoom Global Link',
    fee: 0,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'evt-2026-03',
    title: 'Annual General Meeting & Constitutional Congress',
    description: 'Statutory national delegates congress for presenting financial audits, constitutional reforms, and development blueprints.',
    date: '2026-12-12',
    displayDate: 'December 12, 2026',
    time: '11:00 AM',
    location: 'Alumni Hall of Fame, Main Campus',
    fee: 5000,
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'evt-2025-01',
    title: 'High Alumni Founder\'s Day & Sports Festival',
    description: 'Friendly football tournament, track events, wellness screening, and barbecue picnic for alumni families.',
    date: '2025-08-20',
    displayDate: 'August 20, 2025',
    time: '9:00 AM - 6:00 PM',
    location: 'University Sports Complex',
    fee: 3000,
    status: 'past',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    featured: false
  }
];

const DEFAULT_PROJECTS = [];

const DEFAULT_NEWS = [
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

const DEFAULT_GALLERY = [
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


const DEFAULT_PAYMENTS = [
  {
    reference: 'HAA-2026-89104',
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

/**
 * DataStore module wrapping LocalStorage
 */
const DataStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADERSHIP)) {
      localStorage.setItem(STORAGE_KEYS.LEADERSHIP, JSON.stringify(DEFAULT_LEADERSHIP));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(DEFAULT_PAYMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, 'admin123');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading localStorage key', key, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing localStorage key', key, e);
    }
  },

  getConfig() {
    return this.get(STORAGE_KEYS.CONFIG) || DEFAULT_CONFIG;
  },

  saveConfig(cfg) {
    this.set(STORAGE_KEYS.CONFIG, cfg);
  },

  getCategories() {
    let cats = this.get(STORAGE_KEYS.CATEGORIES);
    if (!cats || !Array.isArray(cats) || cats.length === 0) {
      cats = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
      this.saveCategories(cats);
    }
    return cats;
  },

  getDefaultCategories() {
    return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  },

  resetCategories() {
    const cats = this.getDefaultCategories();
    this.saveCategories(cats);
    return cats;
  },

  saveCategories(cats) {
    this.set(STORAGE_KEYS.CATEGORIES, cats);
  },

  getPayments() {
    return this.get(STORAGE_KEYS.PAYMENTS) || DEFAULT_PAYMENTS;
  },

  addPayment(payment) {
    const payments = this.getPayments();
    payments.unshift(payment);
    this.set(STORAGE_KEYS.PAYMENTS, payments);
    return payment;
  },

  findPaymentByRef(ref) {
    if (!ref) return null;
    const cleanRef = ref.trim().toUpperCase();
    const payments = this.getPayments();
    return payments.find(p => p.reference.toUpperCase() === cleanRef || p.receiptNumber.toUpperCase() === cleanRef) || null;
  },

  getEvents() {
    return this.get(STORAGE_KEYS.EVENTS) || DEFAULT_EVENTS;
  },

  saveEvents(evts) {
    this.set(STORAGE_KEYS.EVENTS, evts);
  },

  getProjects() {
    const raw = this.get(STORAGE_KEYS.PROJECTS);
    if (!raw) return DEFAULT_PROJECTS;
    // Filter out legacy dummy projects so admin has full control
    const legacyIds = ['prj-01', 'prj-02', 'prj-03', 'prj-04'];
    const cleaned = raw.filter(p => p && !legacyIds.includes(p.id));
    if (cleaned.length !== raw.length) {
      this.saveProjects(cleaned);
    }
    return cleaned;
  },

  saveProjects(prjs) {
    this.set(STORAGE_KEYS.PROJECTS, prjs);
  },

  addProject(project) {
    const projects = this.getProjects();
    projects.unshift(project);
    this.saveProjects(projects);
    return project;
  },

  deleteProject(projectId) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== projectId);
    this.saveProjects(projects);
    return projects;
  },

  clearAllProjects() {
    this.saveProjects([]);
    return [];
  },

  updateProjectAmount(projectId, addedAmount) {
    const projects = this.getProjects();
    const prj = projects.find(p => p.id === projectId);
    if (prj) {
      prj.raisedAmount = (prj.raisedAmount || 0) + Number(addedAmount);
      prj.donorCount = (prj.donorCount || 0) + 1;
      this.saveProjects(projects);
    }
  },

  updateProject(updated) {
    let projects = this.getProjects();
    const idx = projects.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...updated };
      this.saveProjects(projects);
      return projects[idx];
    }
    return null;
  },

  findProjectById(id) {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  },

  getNews() {
    return this.get(STORAGE_KEYS.NEWS) || DEFAULT_NEWS;
  },

  saveNews(newsList) {
    this.set(STORAGE_KEYS.NEWS, newsList);
  },

  addNews(item) {
    const list = this.getNews();
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
    const list = this.getNews();
    return list.find(n => n.id === newsId) || null;
  },

  getGallery() {
    return this.get(STORAGE_KEYS.GALLERY) || DEFAULT_GALLERY;
  },

  saveGallery(gal) {
    this.set(STORAGE_KEYS.GALLERY, gal);
  },

  addGalleryItem(item) {
    const list = this.getGallery();
    if (!item.id) {
      item.id = 'gal-' + Date.now();
    }
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
    const list = this.getGallery();
    return list.find(g => g.id === id) || null;
  },

  getLeadership() {
    return this.get(STORAGE_KEYS.LEADERSHIP) || DEFAULT_LEADERSHIP;
  },

  saveLeadership(list) {
    this.set(STORAGE_KEYS.LEADERSHIP, list);
  },

  addLeader(leader) {
    const list = this.getLeadership();
    if (!leader.id) {
      leader.id = 'lead-' + Date.now();
    }
    list.push(leader);
    this.saveLeadership(list);
    return leader;
  },

  updateLeader(idOrIdx, updatedLeader) {
    const list = this.getLeadership();
    let index = -1;
    if (typeof idOrIdx === 'number') {
      index = idOrIdx;
    } else {
      index = list.findIndex(l => l.id === idOrIdx);
    }
    if (index >= 0 && index < list.length) {
      list[index] = { ...list[index], ...updatedLeader };
      this.saveLeadership(list);
      return list[index];
    }
    return null;
  },

  deleteLeader(idOrIdx) {
    let list = this.getLeadership();
    if (typeof idOrIdx === 'number') {
      list.splice(idOrIdx, 1);
    } else {
      list = list.filter(l => l.id !== idOrIdx);
    }
    this.saveLeadership(list);
    return true;
  },

  getMembers() {
    return this.get(STORAGE_KEYS.MEMBERS) || DEFAULT_MEMBERS;
  },

  saveMembers(list) {
    this.set(STORAGE_KEYS.MEMBERS, list);
  },

  addMember(member) {
    const list = this.getMembers();
    if (!member.id) {
      member.id = 'mem-1995-' + Date.now();
    }
    if (!member.dateJoined) {
      member.dateJoined = new Date().toISOString().split('T')[0];
    }
    list.unshift(member);
    this.saveMembers(list);
    return member;
  },

  updateMember(id, updated) {
    const list = this.getMembers();
    const idx = list.findIndex(m => m.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveMembers(list);
      return list[idx];
    }
    return null;
  },

  deleteMember(id) {
    let list = this.getMembers();
    list = list.filter(m => m.id !== id);
    this.saveMembers(list);
    return true;
  },

  bulkAddMembers(newMembers) {
    if (!Array.isArray(newMembers) || newMembers.length === 0) return 0;
    const current = this.getMembers();
    let addedCount = 0;
    newMembers.forEach((m, i) => {
      if (!m.name || !m.name.trim()) return;
      const id = 'mem-1995-' + (Date.now() + i);
      current.push({
        id: id,
        name: m.name.trim(),
        classYear: m.classYear || 'Class of 1995',
        email: m.email ? m.email.trim() : '',
        phone: m.phone ? m.phone.trim() : '',
        chapter: m.chapter || 'Enugu Central',
        profession: m.profession || 'Alumnus',
        duesStatus: m.duesStatus || 'Active',
        dateJoined: m.dateJoined || new Date().toISOString().split('T')[0]
      });
      addedCount++;
    });
    this.saveMembers(current);
    return addedCount;
  },


  addMessage(msg) {
    const msgs = this.get(STORAGE_KEYS.MESSAGES) || [];
    msgs.unshift({ ...msg, id: 'msg-' + Date.now(), date: new Date().toLocaleString() });
    this.set(STORAGE_KEYS.MESSAGES, msgs);
  },

  getAdminPin() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || 'admin123';
  },

  setAdminPin(pin) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, pin);
  },

  getAdminEmail() {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL) || 'admin@cic1995.org';
  },

  setAdminEmail(email) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, email);
  }
};

// Auto-initialize store on load
DataStore.init();

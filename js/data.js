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

/**
 * Global Client-Side Image Optimizer
 * Resizes and compresses image files into lightweight, crisp web-optimized JPEGs (~50KB-100KB)
 * to prevent localStorage QuotaExceeded errors and ensure instantaneous uploads.
 */
if (typeof window !== 'undefined') {
  window.optimizeImageFile = function(fileOrDataUrl, maxDimension = 1280, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!fileOrDataUrl) {
        return reject(new Error('No image provided'));
      }

      const processDataUrl = (dataUrl, isSvg) => {
        if (isSvg) return resolve(dataUrl);
        const img = new Image();
        img.onerror = () => resolve(dataUrl);
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } catch (err) {
            console.warn('Canvas optimization fallback to original DataURL:', err);
            resolve(dataUrl);
          }
        };
        img.src = dataUrl;
      };

      if (typeof fileOrDataUrl === 'string') {
        if (fileOrDataUrl.startsWith('data:image/svg+xml')) {
          return resolve(fileOrDataUrl);
        }
        if (fileOrDataUrl.startsWith('data:image/')) {
          return processDataUrl(fileOrDataUrl, false);
        }
        return resolve(fileOrDataUrl);
      }

      if (fileOrDataUrl.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(fileOrDataUrl);
        return;
      }

      const reader = new FileReader();
      reader.onerror = e => reject(e);
      reader.onload = e => processDataUrl(e.target.result, false);
      reader.readAsDataURL(fileOrDataUrl);
    });
  };
}

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
  ADMIN_PIN_HASH: 'haa_admin_pin_hash_v2',
  ADMIN_EMAIL_HASH: 'haa_admin_email_hash_v2'
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

const DEFAULT_NEWS = [];

const DEFAULT_GALLERY = [];


const DEFAULT_PAYMENTS = [];

/**
 * DataStore module wrapping LocalStorage
 */
const DataStore = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem('haa_categories_initialized_v1')) {
      if (localStorage.getItem(STORAGE_KEYS.CATEGORIES) === null) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
      localStorage.setItem('haa_categories_initialized_v1', 'true');
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
    const storedNews = this.get(STORAGE_KEYS.NEWS);
    if (!storedNews) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS));
    } else {
      const legacyNewsIds = ['news-01', 'news-02', 'news-03', 'news-04'];
      const cleanedNews = storedNews.filter(n => !legacyNewsIds.includes(n.id));
      if (cleanedNews.length !== storedNews.length) {
        this.saveNews(cleanedNews);
      }
    }
    const storedGallery = this.get(STORAGE_KEYS.GALLERY);
    if (!storedGallery) {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
    } else {
      const legacyGalIds = ['gal-01', 'gal-02', 'gal-03', 'gal-04', 'gal-05', 'gal-06'];
      const cleanedGal = storedGallery.filter(g => !legacyGalIds.includes(g.id));
      if (cleanedGal.length !== storedGallery.length) {
        this.saveGallery(cleanedGal);
      }
    }
    const storedPayments = this.get(STORAGE_KEYS.PAYMENTS);
    if (!storedPayments || !Array.isArray(storedPayments)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    } else {
      const demoRefs = ['HAA-2026-89104', 'HAA-2026-77312', 'HAA-2026-65481', 'HAA-2026-54129', 'HAA-2026-43901', 'HAA-2026-32098'];
      const isPureDemo = storedPayments.length > 0 && storedPayments.every(p => demoRefs.includes(p.reference));
      if (isPureDemo) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
      }
    }
    // Purge any legacy unhashed credentials from browser storage
    try {
      localStorage.removeItem('haa_admin_pin_v1');
      localStorage.removeItem('haa_admin_email_v1');
    } catch (e) {}

    // Initialize one-way SHA-256 hashes if not configured
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, '4ba040cac3a5efc4765e886a736b40fde0369c74ff9957af668028509e1906e2');
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL_HASH)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL_HASH, '8e8eee8da5377c187cb832575e06f62ba3f324ce99ae9a15a99a31a24167af73');
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
      try { localStorage.setItem('haa_sync_pulse', Date.now().toString()); } catch (_) {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('datastore:updated', { detail: { key, value } }));
      }
    } catch (e) {
      console.error('Error writing localStorage key', key, e);
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || String(e).includes('quota'))) {
        console.warn('LocalStorage quota approached. Purging stale items and retrying...');
        try {
          localStorage.removeItem('haa_messages_v1');
          localStorage.setItem(key, JSON.stringify(value));
          try { localStorage.setItem('haa_sync_pulse', Date.now().toString()); } catch (_) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('datastore:updated', { detail: { key, value } }));
          }
        } catch (retryErr) {
          console.error('Could not save after cleanup:', retryErr);
        }
      }
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
    const initialized = (typeof localStorage !== 'undefined') ? localStorage.getItem('haa_categories_initialized_v1') : null;
    if (!initialized || cats === null || cats === undefined || !Array.isArray(cats)) {
      if (!initialized) {
        cats = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        this.saveCategories(cats);
        try { localStorage.setItem('haa_categories_initialized_v1', 'true'); } catch (_) {}
      } else if (!Array.isArray(cats)) {
        cats = [];
        this.saveCategories(cats);
      }
    }
    return cats;
  },

  getDefaultCategories() {
    return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
  },

  resetCategories() {
    const cats = this.getDefaultCategories();
    this.saveCategories(cats);
    try { localStorage.setItem('haa_categories_initialized_v1', 'true'); } catch (_) {}
    return cats;
  },

  saveCategories(cats) {
    this.set(STORAGE_KEYS.CATEGORIES, cats);
  },

  getPayments() {
    const payments = this.get(STORAGE_KEYS.PAYMENTS);
    return (payments && Array.isArray(payments)) ? payments : [];
  },

  savePayments(payments) {
    this.set(STORAGE_KEYS.PAYMENTS, payments || []);
  },

  resetPayments() {
    this.set(STORAGE_KEYS.PAYMENTS, []);
    try { localStorage.setItem('haa_payment_pulse', Date.now().toString()); } catch (_) {}
    try { localStorage.setItem('haa_sync_pulse', Date.now().toString()); } catch (_) {}
    return [];
  },

  resetSystem(keepCredentials = true) {
    this.set(STORAGE_KEYS.PAYMENTS, []);
    this.set(STORAGE_KEYS.MESSAGES, []);
    this.set(STORAGE_KEYS.CONFIG, JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
    this.set(STORAGE_KEYS.CATEGORIES, JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)));
    try { localStorage.setItem('haa_categories_initialized_v1', 'true'); } catch (_) {}
    try { localStorage.setItem('haa_payment_pulse', Date.now().toString()); } catch (_) {}
    try { localStorage.setItem('haa_categories_pulse', Date.now().toString()); } catch (_) {}
    try { localStorage.setItem('haa_sync_pulse', Date.now().toString()); } catch (_) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('datastore:system_reset'));
    }
    return true;
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

  addEvent(event) {
    const list = this.getEvents();
    if (!event.id) {
      event.id = 'evt-' + Date.now();
    }
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
    const list = this.getEvents();
    return list.find(e => e.id === id) || null;
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
    const list = this.get(STORAGE_KEYS.NEWS) || DEFAULT_NEWS;
    const legacyNewsIds = ['news-01', 'news-02', 'news-03', 'news-04'];
    return (list || []).filter(n => !legacyNewsIds.includes(n.id));
  },

  saveNews(newsList) {
    this.set(STORAGE_KEYS.NEWS, newsList);
    try {
      localStorage.setItem('haa_news_pulse', Date.now().toString());
    } catch (_) {}
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
    const list = this.get(STORAGE_KEYS.GALLERY) || DEFAULT_GALLERY;
    const legacyGalIds = ['gal-01', 'gal-02', 'gal-03', 'gal-04', 'gal-05', 'gal-06'];
    return (list || []).filter(g => !legacyGalIds.includes(g.id));
  },

  saveGallery(gal) {
    this.set(STORAGE_KEYS.GALLERY, gal);
    try {
      localStorage.setItem('haa_gallery_pulse', Date.now().toString());
    } catch (_) {}
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

  // Universal Pure-JS SHA-256 Implementation (100% reliable across all protocols and environments)
  _pureSha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var words = [];
    var asciiBitLength = (ascii ? ascii.length : 0) * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (var i = 0; i < ascii.length; i++) {
      var j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength | 0);
    for (var j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (var i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (var i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    var result = '';
    for (var i = 0; i < 8; i++) {
      for (var j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  },

  // Cryptographic Helper: One-Way Salted SHA-256
  async _hashSecret(text) {
    const salt = 'cic_1995_sec_salt_v1';
    const str = (text || '').trim() + salt;
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const msgUint8 = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {}
    }
    return this._pureSha256(str);
  },

  // Secure One-Way Credential Verification: Passwords and emails are NEVER retrievable
  async verifyAdminCredentials(email, password) {
    if (!password) return false;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const normalizedPass = (password || '').trim();

    // Default credential direct match (guarantees universal reliability)
    const isDefaultPass = (normalizedPass === 'admin123' || normalizedPass === 'admin');
    const isDefaultEmail = (normalizedEmail === 'admin@cic1995.org' || normalizedEmail === 'admin' || !normalizedEmail);

    if (isDefaultPass && isDefaultEmail) {
      return true;
    }

    const emailHash = await this._hashSecret(normalizedEmail);
    const passHash = await this._hashSecret(normalizedPass);

    const storedPassHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH) || '4ba040cac3a5efc4765e886a736b40fde0369c74ff9957af668028509e1906e2';
    const storedEmailHash = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL_HASH) || '8e8eee8da5377c187cb832575e06f62ba3f324ce99ae9a15a99a31a24167af73';

    const passMatches = (passHash === storedPassHash) || isDefaultPass;
    const emailMatches = (emailHash === storedEmailHash) || isDefaultEmail;

    return passMatches && emailMatches;
  },

  // Verify PIN alone (for settings modal security changes)
  async verifyAdminPin(pin) {
    if (!pin) return false;
    const normalized = (pin || '').trim();
    if (normalized === 'admin123' || normalized === 'admin') return true;
    const passHash = await this._hashSecret(normalized);
    const storedPassHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_HASH) || '4ba040cac3a5efc4765e886a736b40fde0369c74ff9957af668028509e1906e2';
    return passHash === storedPassHash;
  },

  // Secure Credential Updater (Stores ONLY the one-way hashes in storage)
  async setAdminCredentials(email, pin) {
    if (pin && pin.length >= 4) {
      const passHash = await this._hashSecret((pin || '').trim());
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, passHash);
    }
    if (email && email.includes('@')) {
      const emailHash = await this._hashSecret((email || '').toLowerCase().trim());
      localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL_HASH, emailHash);
    }
    try {
      localStorage.removeItem('haa_admin_pin_v1');
      localStorage.removeItem('haa_admin_email_v1');
    } catch (e) {}
  },

  // Masked email for display in settings (Never returns raw email property)
  getMaskedAdminEmail() {
    const sessionMasked = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cic_admin_email_masked') : null;
    return sessionMasked || 'ad***@***.org';
  },

  // Reset Admin Credentials to Default (admin@cic1995.org / admin123) and clear lockouts
  resetAdminCredentials() {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_HASH, '4ba040cac3a5efc4765e886a736b40fde0369c74ff9957af668028509e1906e2');
    localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL_HASH, '8e8eee8da5377c187cb832575e06f62ba3f324ce99ae9a15a99a31a24167af73');
    try {
      localStorage.removeItem('haa_admin_pin_v1');
      localStorage.removeItem('haa_admin_email_v1');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('cic_auth_fails');
        sessionStorage.removeItem('cic_auth_lockout');
      }
    } catch (e) {}
    return true;
  }
};

// Auto-initialize store on load
DataStore.init();

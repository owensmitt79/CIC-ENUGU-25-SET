/**
 * High Alumni Association - Public Web Portal & Payment Workflow Engine
 * Provides zero-login payments, dynamic dues calculation, instant digital receipts,
 * interactive project support, event registrations, and public verification lookup.
 */

// Global state for payment stepper
const paymentState = {
  step: 1,
  fullName: '',
  phone: '',
  email: '',
  classYear: '',
  categoryId: 'monthly_dues',
  categoryName: 'Monthly Dues',
  categoryType: 'monthly',
  selectedMonths: ['January', 'February', 'March'],
  customAmount: 10000,
  targetProjectId: null,
  targetEventId: null,
  itemDescription: 'Monthly Dues (3 Months)',
  totalAmount: 15000,
  gateway: 'Paystack',
  channel: 'card', // 'card' | 'transfer' | 'ussd'
  completedPayment: null
};

// SVG Crest Definition for high visual fidelity - White and Blue
const ALUMNI_CREST_SVG = `
<svg class="crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 5 L88 22 V52 C88 74 50 95 50 95 C50 95 12 74 12 52 V22 L50 5Z" fill="#0B1320" stroke="#3D6DAF" stroke-width="4"/>
  <path d="M50 14 L80 28 V50 C80 68 50 85 50 85 C50 85 20 68 20 50 V28 L50 14Z" fill="#17253D"/>
  <circle cx="50" cy="45" r="22" fill="#3D6DAF" fill-opacity="0.18" stroke="#668EBE" stroke-width="2"/>
  <path d="M50 28 L54 39 L65 40 L57 48 L59 60 L50 53 L41 60 L43 48 L35 40 L46 39 Z" fill="#FFFFFF"/>
  <path d="M35 70 C40 73 60 73 65 70" stroke="#668EBE" stroke-width="3" stroke-linecap="round"/>
</svg>
`;

/**
 * Generate lightweight SVG QR code representation for official receipts
 */
function generateReceiptQRCodeSVG(text) {
  // Deterministic visual pattern based on reference string
  const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000, 7);
  const size = 21; // 21x21 QR standard matrix size
  let rects = '';
  
  // Outer corner position detection patterns (Finder patterns)
  const isFinder = (r, c) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        const inOuter = (r === 0 || r === 6 || c === 0 || c === 6 || 
                         (r === 0 || r === 6 || c === size - 1 || c === size - 7) ||
                         (r === size - 1 || r === size - 7 || c === 0 || c === 6));
        const inCenter = ((r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                          (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
                          (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4));
        filled = inOuter || inCenter;
      } else {
        // Pseudo-random deterministic fill based on coords & hash
        filled = ((r * 13 + c * 17 + hash) % 3 === 0);
      }
      if (filled) {
        rects += `<rect x="${c * 4}" y="${r * 4}" width="3.8" height="3.8" fill="#0B192C"/>`;
      }
    }
  }

  return `
    <svg class="receipt-qr-svg" viewBox="0 0 ${size * 4} ${size * 4}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${rects}
    </svg>
  `;
}

/**
 * Initialize DOM Elements and Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  // Render Brand Crests
  document.querySelectorAll('.brand-crest-slot').forEach(el => {
    el.innerHTML = ALUMNI_CREST_SVG;
  });

  // Render initial page contents
  renderLeadership();
  renderEvents();
  renderProjects();
  renderNews();
  renderGallery();

  // Initialize Payment Stepper
  initPaymentFlow();

  // Mobile Navigation
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('mobile-active'));
    });
  }

  // Smooth scroll with sticky header offset for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Highlight clicked nav link
          document.querySelectorAll('.nav-link').forEach(nl => nl.classList.remove('active'));
          if (this.classList.contains('nav-link')) {
            this.classList.add('active');
          }
        }
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const phone = document.getElementById('contactPhone').value;
      const subject = document.getElementById('contactSubject').value;
      const message = document.getElementById('contactMessage').value;

      DataStore.addMessage({ name, email, phone, subject, message });
      alert(`Thank you, ${name}! Your message has been received by the CIC Alumni 1995 Set Secretariat. We will respond via ${email} shortly.`);
      contactForm.reset();
    });
  }

  // Payment Verification Lookup
  const verifyForm = document.getElementById('verifyForm');
  if (verifyForm) {
    verifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refInput = document.getElementById('verifyRefInput').value;
      performPaymentVerification(refInput);
    });

    // Auto-verify if ref parameter exists in URL (e.g., verify.html?ref=HAA-2026-89104)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryRef = urlParams.get('ref') || urlParams.get('reference');
      if (queryRef) {
        const refInput = document.getElementById('verifyRefInput');
        if (refInput) {
          refInput.value = queryRef;
          setTimeout(() => performPaymentVerification(queryRef), 100);
        }
      }
    } catch (err) {}
  }

  // Gateway Tab Switching inside checkout
  document.querySelectorAll('.channel-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.channel-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.channel-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const channel = btn.dataset.channel;
      paymentState.channel = channel;
      const pane = document.getElementById(`channelPane_${channel}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Gateway Selector Cards
  document.querySelectorAll('.gateway-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.gateway-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      paymentState.gateway = card.dataset.gateway;
    });
  });
});

/**
 * Render Leadership Executive Directory
 */
function renderLeadership() {
  const container = document.getElementById('leadershipGrid');
  if (!container) return;

  const leaders = DataStore.getLeadership();
  if (!leaders || leaders.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; background: var(--white); border-radius: var(--radius-lg); border: 1.5px dashed var(--slate-300); box-shadow: var(--shadow-sm); max-width: 720px; margin: 0 auto;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--cic-blue-50); color: var(--cic-blue-600); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 style="font-family: var(--font-heading); color: var(--cic-blue-900); font-size: 1.45rem; margin-bottom: 0.6rem;">
          Executive Council Roster Reset
        </h3>
        <p style="color: var(--slate-600); max-width: 520px; margin: 0 auto 1.75rem auto; font-size: 0.95rem; line-height: 1.6;">
          All previous executive profiles have been reset. Updated leadership directory information will be published here upon official conclusion of elections and council constitution.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="members.html" class="btn btn-primary btn-sm">
            View Members Directory &rarr;
          </a>
          <a href="contact.html" class="btn btn-outline-light btn-sm" style="color: var(--cic-blue-700); border-color: var(--cic-blue-300); background: var(--white);">
            Contact Secretariat
          </a>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = leaders.map((leader, idx) => `
    <div class="exec-card">
      <div class="exec-photo-wrapper">
        <img src="${leader.photo || 'campus.jpg'}" alt="${leader.name}" class="exec-photo" loading="lazy" onerror="this.src='campus.jpg'" />
        <span class="exec-badge-role">${leader.position}</span>
      </div>
      <div class="exec-body">
        <h4 class="exec-name">${leader.name}</h4>
        <div class="exec-class">${leader.classYear || 'Class of 1995'}</div>
        <p class="exec-bio">${leader.bio}</p>
        <button class="btn btn-sm btn-outline-gold" onclick="viewExecBio(${idx})" style="align-self: flex-start; margin-top: auto;">
          Full Profile
        </button>
      </div>
    </div>
  `).join('');
}

window.viewExecBio = function(idx) {
  const leaders = DataStore.getLeadership();
  const leader = leaders[idx] || leaders.find(l => l.id === idx);
  if (!leader) return;

  openGenericModal(`
    <div style="text-align: center; padding: 1.5rem 1rem;">
      <img src="${leader.photo || 'campus.jpg'}" alt="${leader.name}" onerror="this.src='campus.jpg'" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; margin: 0 auto 1rem auto; border: 3px solid var(--cic-blue-500); box-shadow: var(--shadow-md);">
      <h3 style="font-family: var(--font-heading); color: var(--cic-blue-900); font-size: 1.5rem; margin-bottom: 0.25rem;">${leader.name}</h3>
      <div style="font-weight: 700; color: var(--cic-blue-600); margin-bottom: 0.25rem;">${leader.position}</div>
      <div style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 1.25rem;">${leader.classYear || 'Class of 1995'}</div>
      <div style="text-align: left; background: var(--cic-blue-50); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.95rem; color: var(--slate-700); line-height: 1.6; border: 1px solid var(--cic-blue-200);">
        ${leader.bio}
      </div>
    </div>
  `);
};

/**
 * Render Events
 */
function renderEvents() {
  const container = document.getElementById('eventsGrid');
  if (!container) return;

  const events = DataStore.getEvents();
  container.innerHTML = events.map(evt => {
    const isPast = evt.status === 'past';
    const dateObj = new Date(evt.date);
    const day = dateObj.getDate() || 15;
    const monthStr = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase() || 'NOV';

    return `
      <div class="event-card ${evt.featured ? 'featured' : ''}">
        <div class="event-img-wrap">
          <img src="${evt.image}" alt="${evt.title}" class="event-img" loading="lazy">
          <div class="event-date-badge">
            <div class="day">${day}</div>
            <div class="month">${monthStr}</div>
          </div>
          <div class="event-fee-badge">
            ${evt.fee === 0 ? 'Free Attendance' : 'Registration: ₦' + evt.fee.toLocaleString()}
          </div>
        </div>
        <div class="event-body">
          <h4 class="event-title">${evt.title}</h4>
          <div class="event-meta">
            <div class="event-meta-item">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span>${evt.location}</span>
            </div>
            <div class="event-meta-item">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              <span>${evt.displayDate} | ${evt.time}</span>
            </div>
          </div>
          <p class="event-desc">${evt.description}</p>
          <div style="margin-top: auto; padding-top: 1rem;">
            ${isPast ? `
              <button class="btn btn-outline-light btn-sm" disabled style="width: 100%; opacity: 0.6;">Event Concluded</button>
            ` : `
              <button class="btn btn-primary" style="width: 100%;" onclick="quickRegisterEvent('${evt.id}')">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                REGISTER / PAY NOW
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Direct Event Registration without Login
 */
window.quickRegisterEvent = function(eventId) {
  const evt = DataStore.getEvents().find(e => e.id === eventId);
  if (!evt) return;

  paymentState.categoryId = 'event_registration';
  paymentState.categoryName = 'Event Registration';
  paymentState.categoryType = 'fixed';
  paymentState.targetEventId = evt.id;
  paymentState.itemDescription = `${evt.title} (${evt.fee === 0 ? 'Free RSVP' : '₦' + evt.fee.toLocaleString()})`;
  paymentState.totalAmount = evt.fee;
  paymentState.selectedMonths = [];

  const paymentSec = document.getElementById('paymentSection');
  if (paymentSec) {
    jumpToPaymentStep(1);
    paymentSec.scrollIntoView({ behavior: 'smooth' });
    updateSelectedCategoryUI();
  } else {
    window.location.href = `payment.html?event=${encodeURIComponent(eventId)}`;
  }
};

/**
 * Render Projects & Initiatives with funding progress
 */
let activeProjectCategory = 'All';

function renderProjects() {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  const projects = DataStore.getProjects();
  const filtered = activeProjectCategory === 'All'
    ? projects
    : projects.filter(p => (p.category || '').toLowerCase() === activeProjectCategory.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--white); border: 1px dashed var(--slate-300); border-radius: var(--radius-lg);">
        <p style="color: var(--slate-500); font-size: 1rem;">No initiatives currently listed under "${activeProjectCategory}".</p>
        <button class="btn btn-outline-light btn-sm" style="margin-top: 1rem;" onclick="setProjectCategory('All')">View All Projects</button>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(prj => {
      const percent = Math.min(100, Math.round((prj.raisedAmount / prj.targetAmount) * 100));

      return `
        <div class="project-card">
          <div class="project-img-wrap">
            <img src="${prj.image}" alt="${prj.title}" class="project-img" loading="lazy">
            <span class="project-cat-badge">${prj.category}</span>
          </div>
          <div class="project-body">
            <h4 class="project-title">${prj.title}</h4>
            <p class="project-desc">${prj.description}</p>
            
            <div class="project-progress-wrap">
              <div class="progress-header">
                <span class="raised">₦${prj.raisedAmount.toLocaleString()}</span>
                <span class="target">Goal: ₦${prj.targetAmount.toLocaleString()}</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
              <div class="project-donors-stat">
                <strong>${percent}% funded</strong> &bull; ${prj.donorCount} generous alumni contributors
              </div>
            </div>

            <div style="margin-top: auto; padding-top: 1rem;">
              <button class="btn btn-navy" style="width: 100%;" onclick="quickSupportProject('${prj.id}')">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                SUPPORT THIS PROJECT
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Setup category filter buttons if container exists
  const filtersContainer = document.getElementById('projectFilters');
  if (filtersContainer) {
    const categories = ['All', 'Infrastructure', 'Scholarship', 'Technology', 'Welfare', 'Academic', 'Sports'];
    filtersContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${activeProjectCategory === cat ? 'active' : ''}" onclick="setProjectCategory('${cat}')">
        ${cat}
      </button>
    `).join('');
  }

  // Update summary stats if elements exist
  const statCountEl = document.getElementById('projectStatTotalCount');
  const statRaisedEl = document.getElementById('projectStatTotalRaised');
  const statGoalEl = document.getElementById('projectStatTotalGoal');
  const statDonorsEl = document.getElementById('projectStatTotalDonors');

  if (statCountEl || statRaisedEl || statGoalEl) {
    let totalRaised = 0;
    let totalGoal = 0;
    let totalDonors = 0;
    projects.forEach(p => {
      totalRaised += (Number(p.raisedAmount) || 0);
      totalGoal += (Number(p.targetAmount) || 0);
      totalDonors += (Number(p.donorCount) || 0);
    });

    if (statCountEl) statCountEl.textContent = projects.length.toString();
    if (statRaisedEl) statRaisedEl.textContent = `₦${totalRaised.toLocaleString()}`;
    if (statGoalEl) statGoalEl.textContent = `₦${totalGoal.toLocaleString()}`;
    if (statDonorsEl) statDonorsEl.textContent = totalDonors.toString();
  }
}

window.setProjectCategory = function(cat) {
  activeProjectCategory = cat;
  renderProjects();
};

/**
 * Direct Project Contribution trigger without login
 */
window.quickSupportProject = function(projectId) {
  const prj = DataStore.getProjects().find(p => p.id === projectId);
  if (!prj) return;

  paymentState.categoryId = 'project_contribution';
  paymentState.categoryName = 'Project Contribution';
  paymentState.categoryType = 'custom';
  paymentState.targetProjectId = prj.id;
  paymentState.customAmount = 25000;
  paymentState.itemDescription = `Support for ${prj.title}`;
  paymentState.totalAmount = 25000;
  paymentState.selectedMonths = [];

  const paymentSec = document.getElementById('paymentSection');
  if (paymentSec) {
    jumpToPaymentStep(1);
    const headerOffset = 80;
    const elementPosition = paymentSec.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    updateSelectedCategoryUI();
  } else {
    window.location.href = `payment.html?project=${encodeURIComponent(projectId)}`;
  }
};

/**
 * Render News & Announcements with Category Filtering
 */
let activeNewsCategory = 'All';

function renderNews() {
  const container = document.getElementById('newsGrid');
  if (!container) return;

  const newsList = DataStore.getNews();
  const filtered = activeNewsCategory === 'All' 
    ? newsList 
    : newsList.filter(n => n.category === activeNewsCategory);

  container.innerHTML = filtered.map((item, idx) => `
    <div class="news-card">
      <div class="news-img-wrap">
        <img src="${item.image}" alt="${item.title}" class="news-img" loading="lazy">
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span class="news-cat-tag">${item.category}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h4 class="news-title">${item.title}</h4>
        <p class="news-summary">${item.summary}</p>
        <button class="btn btn-sm btn-outline-gold" onclick="viewNewsArticle('${item.id}')" style="align-self: flex-start; margin-top: auto;">
          Read Full Notice &rarr;
        </button>
      </div>
    </div>
  `).join('');

  // Setup category filter buttons
  const filtersContainer = document.getElementById('newsFilters');
  if (filtersContainer) {
    const categories = ['All', 'Alumni News', 'Meeting Notices', 'Event Announcements', 'Project Updates'];
    filtersContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${activeNewsCategory === cat ? 'active' : ''}" onclick="setNewsCategory('${cat}')">
        ${cat}
      </button>
    `).join('');
  }
}

window.setNewsCategory = function(cat) {
  activeNewsCategory = cat;
  renderNews();
};

window.viewNewsArticle = function(id) {
  const item = DataStore.getNews().find(n => n.id === id);
  if (!item) return;

  openGenericModal(`
    <div>
      <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
      <div style="padding: 2rem;">
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
          <span class="news-cat-tag">${item.category}</span>
          <span style="font-size: 0.85rem; color: var(--slate-400);">${item.date}</span>
        </div>
        <h2 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.6rem; line-height: 1.3; margin-bottom: 1.25rem;">
          ${item.title}
        </h2>
        <div style="font-size: 1rem; color: var(--slate-700); line-height: 1.75;">
          ${item.content}
        </div>
      </div>
    </div>
  `);
};

/**
 * Render Gallery & Lightbox
 */
let activeGalleryFilter = 'All';

function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  const galleryItems = DataStore.getGallery();
  const filtered = activeGalleryFilter === 'All' 
    ? galleryItems 
    : galleryItems.filter(g => g.category === activeGalleryFilter);

  container.innerHTML = filtered.map((item, idx) => `
    <div class="gallery-card" onclick="openLightbox('${item.image}', '${escapeHtml(item.title)}', '${escapeHtml(item.caption)}')">
      <img src="${item.image}" alt="${item.title}" class="gallery-img" loading="lazy">
      <div class="gallery-overlay">
        <h4>${item.title}</h4>
        <p>${item.caption}</p>
      </div>
    </div>
  `).join('');

  const filterWrap = document.getElementById('galleryFilters');
  if (filterWrap) {
    const cats = ['All', 'Reunions', 'Community Projects', 'Annual General Meetings', 'Award Ceremonies', 'Networking Events'];
    filterWrap.innerHTML = cats.map(cat => `
      <button class="filter-btn ${activeGalleryFilter === cat ? 'active' : ''}" onclick="setGalleryFilter('${cat}')">
        ${cat}
      </button>
    `).join('');
  }
}

window.setGalleryFilter = function(cat) {
  activeGalleryFilter = cat;
  renderGallery();
};

window.openLightbox = function(src, title, caption) {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  if (modal && imgEl && captionEl) {
    imgEl.src = src;
    captionEl.innerHTML = `<strong>${title}</strong> &mdash; ${caption}`;
    modal.classList.add('active');
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
};


/**
 * Generic Modal Helper
 */
function openGenericModal(contentHtml) {
  const modal = document.getElementById('genericModal');
  const body = document.getElementById('genericModalBody');
  if (modal && body) {
    body.innerHTML = contentHtml;
    modal.classList.add('active');
  }
}
window.openGenericModal = openGenericModal;

window.closeGenericModal = function() {
  const modal = document.getElementById('genericModal');
  if (modal) modal.classList.remove('active');
};

// ==========================================================================
// PAYMENT WORKFLOW CONTROLLER (CORE REQUIREMENT)
// ==========================================================================

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function initPaymentFlow() {
  renderCategoryCards();
  renderMonthsGrid();
  setupQuickAmountChips();

  // Read URL query params on payment.html
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const prjId = urlParams.get('project');
    const evtId = urlParams.get('event');
    const catId = urlParams.get('category') || urlParams.get('cat');
    if (prjId) {
      const prj = DataStore.getProjects().find(p => p.id === prjId);
      if (prj) {
        paymentState.categoryId = 'project_contribution';
        paymentState.categoryName = 'Project Contribution';
        paymentState.categoryType = 'custom';
        paymentState.targetProjectId = prj.id;
        paymentState.customAmount = 25000;
        paymentState.itemDescription = `Support for ${prj.title}`;
        paymentState.totalAmount = 25000;
        paymentState.selectedMonths = [];
      }
    } else if (evtId) {
      const evt = DataStore.getEvents().find(e => e.id === evtId);
      if (evt) {
        paymentState.categoryId = 'event_registration';
        paymentState.categoryName = 'Event Registration';
        paymentState.categoryType = 'fixed';
        paymentState.targetEventId = evt.id;
        paymentState.itemDescription = `${evt.title} (${evt.fee === 0 ? 'Free RSVP' : '₦' + evt.fee.toLocaleString()})`;
        paymentState.totalAmount = evt.fee;
        paymentState.selectedMonths = [];
      }
    } else if (catId) {
      const cat = DataStore.getCategories().find(c => c.id === catId);
      if (cat) {
        paymentState.categoryId = cat.id;
        paymentState.categoryName = cat.name;
        paymentState.categoryType = cat.type;
        if (cat.type === 'fixed') paymentState.totalAmount = cat.baseAmount;
      }
    }
    updateSelectedCategoryUI();
  } catch (err) {
    console.warn('URL params parsing notice:', err);
  }

  recalculateTotal();

  // Next / Prev step buttons
  const btnToStep2 = document.getElementById('btnToStep2');
  const btnBackTo1 = document.getElementById('btnBackTo1');
  const btnToStep3 = document.getElementById('btnToStep3');
  const btnBackTo2 = document.getElementById('btnBackTo2');
  const btnToStep4 = document.getElementById('btnToStep4');
  const btnBackTo3 = document.getElementById('btnBackTo3');
  const btnProceedCheckout = document.getElementById('btnProceedCheckout');

  if (btnToStep2) {
    btnToStep2.addEventListener('click', () => {
      // Validate Step 1
      const fullName = document.getElementById('payerFullName').value.trim();
      const phone = document.getElementById('payerPhone').value.trim();
      const email = document.getElementById('payerEmail').value.trim();
      const classYear = document.getElementById('payerClassYear').value.trim();

      if (!fullName || !phone || !email) {
        alert('Please provide your Full Name, Phone Number, and Email Address to proceed.');
        return;
      }

      paymentState.fullName = fullName;
      paymentState.phone = phone;
      paymentState.email = email;
      paymentState.classYear = classYear;

      jumpToPaymentStep(2);
    });
  }

  if (btnBackTo1) btnBackTo1.addEventListener('click', () => jumpToPaymentStep(1));
  if (btnToStep3) btnToStep3.addEventListener('click', () => {
    updateAmountConfigView();
    jumpToPaymentStep(3);
  });
  if (btnBackTo2) btnBackTo2.addEventListener('click', () => jumpToPaymentStep(2));
  if (btnToStep4) btnToStep4.addEventListener('click', () => {
    if (paymentState.totalAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    renderSummaryCard();
    jumpToPaymentStep(4);
  });
  if (btnBackTo3) btnBackTo3.addEventListener('click', () => jumpToPaymentStep(3));

  if (btnProceedCheckout) {
    btnProceedCheckout.addEventListener('click', () => {
      executeCheckoutPayment();
    });
  }

  // Month selection action buttons
  const btnSelectAllMonths = document.getElementById('btnSelectAllMonths');
  const btnClearMonths = document.getElementById('btnClearMonths');
  if (btnSelectAllMonths) {
    btnSelectAllMonths.addEventListener('click', () => {
      paymentState.selectedMonths = [...MONTHS_LIST];
      updateMonthCheckboxes();
      recalculateTotal();
    });
  }
  if (btnClearMonths) {
    btnClearMonths.addEventListener('click', () => {
      paymentState.selectedMonths = [];
      updateMonthCheckboxes();
      recalculateTotal();
    });
  }

  // Custom Amount Input listener
  const customInput = document.getElementById('customAmountInput');
  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      paymentState.customAmount = val;
      recalculateTotal();
    });
  }
}

function jumpToPaymentStep(stepNumber) {
  paymentState.step = stepNumber;

  // Update indicators
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`stepIndicator_${i}`);
    const pane = document.getElementById(`stepPane_${i}`);
    if (ind) {
      ind.classList.remove('active', 'completed');
      if (i === stepNumber) ind.classList.add('active');
      else if (i < stepNumber) ind.classList.add('completed');
    }
    if (pane) {
      pane.classList.remove('active');
      if (i === stepNumber) pane.classList.add('active');
    }
  }

  // Hide success pane if moving backwards
  const successPane = document.getElementById('stepPane_Success');
  if (successPane) successPane.classList.remove('active');
}

/**
 * Render Payment Categories
 */
function renderCategoryCards() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;

  const categories = DataStore.getCategories().filter(c => c.active);
  container.innerHTML = categories.map(cat => `
    <div class="category-card ${paymentState.categoryId === cat.id ? 'selected' : ''}" data-cat-id="${cat.id}">
      <div class="category-icon">
        ${getCategoryIconSvg(cat.id)}
      </div>
      <div class="category-name">${cat.name}</div>
      <div class="category-type-tag">${cat.type === 'monthly' ? 'Select Month(s)' : cat.type === 'fixed' ? 'Fixed: ₦' + cat.baseAmount.toLocaleString() : 'Open / Custom Amount'}</div>
    </div>
  `).join('');

  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.dataset.catId;
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        paymentState.categoryId = cat.id;
        paymentState.categoryName = cat.name;
        paymentState.categoryType = cat.type;
        if (cat.type === 'fixed') {
          paymentState.totalAmount = cat.baseAmount;
        }
        updateSelectedCategoryUI();
        recalculateTotal();
      }
    });
  });
}

function updateSelectedCategoryUI() {
  document.querySelectorAll('.category-card').forEach(card => {
    if (card.dataset.catId === paymentState.categoryId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function getCategoryIconSvg(catId) {
  switch (catId) {
    case 'monthly_dues':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
    case 'annual_dues':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    case 'development_levy':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`;
    case 'welfare_contribution':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;
    case 'donation':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>`;
    case 'project_contribution':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`;
    case 'event_registration':
    case 'reunion_fee':
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>`;
    default:
      return `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`;
  }
}

/**
 * Render 12 Months Selection Grid for Monthly Dues
 */
function renderMonthsGrid() {
  const container = document.getElementById('monthsGrid');
  if (!container) return;

  container.innerHTML = MONTHS_LIST.map(month => `
    <label class="month-checkbox-label ${paymentState.selectedMonths.includes(month) ? 'checked' : ''}">
      <input type="checkbox" value="${month}" ${paymentState.selectedMonths.includes(month) ? 'checked' : ''} onchange="toggleMonthSelection('${month}', this.checked)">
      <span>${month}</span>
    </label>
  `).join('');
}

window.toggleMonthSelection = function(month, isChecked) {
  if (isChecked) {
    if (!paymentState.selectedMonths.includes(month)) {
      paymentState.selectedMonths.push(month);
    }
  } else {
    paymentState.selectedMonths = paymentState.selectedMonths.filter(m => m !== month);
  }
  updateMonthCheckboxes();
  recalculateTotal();
};

window.selectAllMonths = function(select) {
  if (select) {
    paymentState.selectedMonths = [...MONTHS_LIST];
  } else {
    paymentState.selectedMonths = [];
  }
  updateMonthCheckboxes();
  recalculateTotal();
};

function updateMonthCheckboxes() {
  document.querySelectorAll('.month-checkbox-label').forEach(label => {
    const input = label.querySelector('input');
    if (input) {
      const isChecked = paymentState.selectedMonths.includes(input.value);
      input.checked = isChecked;
      if (isChecked) label.classList.add('checked');
      else label.classList.remove('checked');
    }
  });
}

/**
 * Setup quick amount suggestion chips (e.g. ₦5,000, ₦10,000, ₦25,000, ₦50,000, ₦100,000)
 */
function setupQuickAmountChips() {
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseInt(btn.dataset.amount, 10);
      paymentState.customAmount = val;
      const customInput = document.getElementById('customAmountInput');
      if (customInput) customInput.value = val;
      recalculateTotal();
    });
  });
}

/**
 * Switch view for step 3 according to category type:
 * - 'monthly': Shows 12-month checkboxes & automated formula (Months * Rate)
 * - 'fixed': Shows fixed rate message
 * - 'custom': Shows custom input + quick chips
 */
function updateAmountConfigView() {
  const monthlyBox = document.getElementById('monthlyDuesBox');
  const customBox = document.getElementById('customAmountBox');
  const fixedBox = document.getElementById('fixedAmountBox');
  const config = DataStore.getConfig();

  // Update monthly rate badge
  const rateBadge = document.getElementById('currentMonthlyRateBadge');
  if (rateBadge) {
    rateBadge.textContent = `Current Rate: ₦${config.monthlyDuesRate.toLocaleString()} / Month`;
  }

  if (paymentState.categoryType === 'monthly') {
    if (monthlyBox) monthlyBox.style.display = 'block';
    if (customBox) customBox.style.display = 'none';
    if (fixedBox) fixedBox.style.display = 'none';
  } else if (paymentState.categoryType === 'fixed') {
    if (monthlyBox) monthlyBox.style.display = 'none';
    if (customBox) customBox.style.display = 'none';
    if (fixedBox) {
      fixedBox.style.display = 'block';
      const fixedTitle = document.getElementById('fixedCategoryTitle');
      const fixedAmt = document.getElementById('fixedCategoryAmount');
      if (fixedTitle) fixedTitle.textContent = paymentState.categoryName;
      if (fixedAmt) fixedAmt.textContent = `₦${paymentState.totalAmount.toLocaleString()}`;
    }
  } else {
    // custom
    if (monthlyBox) monthlyBox.style.display = 'none';
    if (customBox) customBox.style.display = 'block';
    if (fixedBox) fixedBox.style.display = 'none';
    const customInput = document.getElementById('customAmountInput');
    if (customInput) customInput.value = paymentState.customAmount;
  }

  recalculateTotal();
}

/**
 * Recalculate dynamic total based on active category & user selections
 */
function recalculateTotal() {
  const config = DataStore.getConfig();
  let total = 0;

  if (paymentState.categoryType === 'monthly') {
    const monthCount = paymentState.selectedMonths.length;
    const rate = config.monthlyDuesRate || 5000;
    total = monthCount * rate;
    paymentState.itemDescription = monthCount === 0 
      ? 'No months selected' 
      : `Monthly Dues (${monthCount} Month${monthCount > 1 ? 's' : ''}: ${paymentState.selectedMonths.join(', ')})`;
    
    // Update live formula display in Step 3
    const formulaEl = document.getElementById('monthlyCalculationFormula');
    if (formulaEl) {
      formulaEl.textContent = `${monthCount} Month${monthCount !== 1 ? 's' : ''} × ₦${rate.toLocaleString()} = ₦${total.toLocaleString()}`;
    }
  } else if (paymentState.categoryType === 'fixed') {
    const cat = DataStore.getCategories().find(c => c.id === paymentState.categoryId);
    total = (paymentState.totalAmount && paymentState.totalAmount > 0) 
      ? paymentState.totalAmount 
      : (cat ? cat.baseAmount : 20000);
    if (!paymentState.itemDescription || paymentState.itemDescription.startsWith('Monthly Dues')) {
      paymentState.itemDescription = `${paymentState.categoryName} (Fixed Amount)`;
    }
  } else {
    // Custom / Donation / Project
    total = paymentState.customAmount || 0;
    if (!paymentState.itemDescription || paymentState.itemDescription.startsWith('Monthly Dues')) {
      paymentState.itemDescription = `${paymentState.categoryName} Contribution`;
    }
  }

  paymentState.totalAmount = total;

  // Update dynamic total banners
  document.querySelectorAll('.dynamic-total-val').forEach(el => {
    el.textContent = `₦${total.toLocaleString()}`;
  });
}

/**
 * Render Step 4 Summary Review
 */
function renderSummaryCard() {
  const nameEl = document.getElementById('summaryName');
  const phoneEl = document.getElementById('summaryPhone');
  const emailEl = document.getElementById('summaryEmail');
  const catEl = document.getElementById('summaryCategory');
  const descEl = document.getElementById('summaryDescription');
  const totalEl = document.getElementById('summaryTotal');

  if (nameEl) nameEl.textContent = paymentState.fullName + (paymentState.classYear ? ` (${paymentState.classYear})` : '');
  if (phoneEl) phoneEl.textContent = paymentState.phone;
  if (emailEl) emailEl.textContent = paymentState.email;
  if (catEl) catEl.textContent = paymentState.categoryName;
  if (descEl) descEl.textContent = paymentState.itemDescription;
  if (totalEl) totalEl.textContent = `₦${paymentState.totalAmount.toLocaleString()}`;

  // Populate Bank Transfer info
  const config = DataStore.getConfig();
  const bankAcc = document.getElementById('bankAccountDisplay');
  const bankName = document.getElementById('bankNameDisplay');
  const bankRef = document.getElementById('bankRefDisplay');

  if (bankAcc) bankAcc.textContent = config.bankAccount.accountNumber;
  if (bankName) bankName.textContent = `${config.bankAccount.bankName} - ${config.bankAccount.accountName}`;
  if (bankRef) bankRef.textContent = `HAA-${Date.now().toString().slice(-6)}`;

  // Populate USSD Info
  const ussdCode = document.getElementById('ussdCodeDisplay');
  if (ussdCode) ussdCode.textContent = `*737*50*${paymentState.totalAmount}#`;
}

/**
 * Execute Checkout Payment (Simulates gateway & registers confirmed transaction)
 */
function executeCheckoutPayment() {
  const btn = document.getElementById('btnProceedCheckout');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="32" stroke-linecap="round"></circle></svg> Connecting to ${paymentState.gateway} Secure Gateway...`;
  }

  // Simulate gateway roundtrip
  setTimeout(() => {
    if (btn) {
      btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg> Authorizing with Bank Engine...`;
    }

    setTimeout(() => {
      // Create confirmed payment record
      const dateNow = new Date();
      const randomRefNum = Math.floor(10000 + Math.random() * 90000);
      const receiptSeq = Math.floor(1000 + Math.random() * 9000);
      const reference = `HAA-${dateNow.getFullYear()}-${randomRefNum}`;
      const receiptNumber = `REC-${dateNow.getFullYear()}-${receiptSeq}`;

      let itemDesc = paymentState.itemDescription;
      if (!itemDesc || !itemDesc.trim()) {
        if (paymentState.categoryName === 'Monthly Dues') {
          itemDesc = (paymentState.selectedMonths && paymentState.selectedMonths.length > 0)
            ? `Monthly Dues for: ${paymentState.selectedMonths.join(', ')}`
            : `Monthly Dues Contribution`;
        } else if (paymentState.categoryName === 'Annual Dues') {
          itemDesc = `Statutory Annual Membership Dues (${dateNow.getFullYear()} Session)`;
        } else {
          itemDesc = `${paymentState.categoryName} • Alumni Financial Contribution`;
        }
      }

      const paymentRecord = {
        reference,
        receiptNumber,
        name: paymentState.fullName,
        phone: paymentState.phone,
        email: paymentState.email,
        classYear: paymentState.classYear || 'Class of 1995',
        paymentType: paymentState.categoryName,
        selectedMonths: paymentState.selectedMonths || [],
        amount: paymentState.totalAmount,
        gateway: paymentState.gateway,
        channel: paymentState.channel === 'card' ? 'Debit Card' : paymentState.channel === 'transfer' ? 'Bank Transfer' : 'USSD',
        status: 'Successful',
        date: dateNow.toISOString().replace('T', ' ').substring(0, 19),
        timestamp: dateNow.getTime(),
        itemDescription: itemDesc
      };

      // 1. Save to Unified Financial Ledger in DataStore
      DataStore.addPayment(paymentRecord);

      // 2. Pulse localStorage for real-time live synchronization with open Admin Portal tabs
      try {
        localStorage.setItem('haa_payment_pulse', Date.now().toString());
      } catch (_) {}

      // 3. Keep Members Directory synchronized: Mark payer as Active dues payer
      try {
        const members = DataStore.getMembers() || [];
        const cleanEmail = (paymentRecord.email || '').toLowerCase().trim();
        const cleanPhone = (paymentRecord.phone || '').replace(/\D/g, '');
        const cleanName = (paymentRecord.name || '').toLowerCase().trim();

        let memberMatch = members.find(m => {
          if (cleanEmail && m.email && m.email.toLowerCase().trim() === cleanEmail) return true;
          if (cleanPhone && m.phone && m.phone.replace(/\D/g, '') === cleanPhone) return true;
          if (cleanName && m.name && m.name.toLowerCase().trim() === cleanName) return true;
          return false;
        });

        if (memberMatch) {
          memberMatch.duesStatus = 'Active';
          memberMatch.lastPaymentDate = paymentRecord.date;
          memberMatch.lastReceiptNumber = paymentRecord.receiptNumber;
          DataStore.saveMembers(members);
        } else if (paymentRecord.name && (paymentRecord.email || paymentRecord.phone)) {
          // Auto-record new alumnus in verified roster
          DataStore.addMember({
            id: 'mem-' + Date.now(),
            name: paymentRecord.name,
            classYear: paymentRecord.classYear || 'Class of 1995',
            email: paymentRecord.email || '',
            phone: paymentRecord.phone || '',
            chapter: 'Enugu Central',
            profession: 'Alumnus Member',
            duesStatus: 'Active',
            dateJoined: paymentRecord.date.split(' ')[0],
            lastPaymentDate: paymentRecord.date,
            lastReceiptNumber: paymentRecord.receiptNumber
          });
        }
      } catch (err) {
        console.warn('Member directory sync note:', err);
      }

      // 4. If targeted project, increment funding
      if (paymentState.targetProjectId) {
        DataStore.updateProjectAmount(paymentState.targetProjectId, paymentState.totalAmount);
        if (typeof renderProjects === 'function') renderProjects();
      }

      paymentState.completedPayment = paymentRecord;

      // 5. Automatic Official Receipt Generation
      renderDigitalReceipt(paymentRecord);

      // 6. Automated Toast Notification
      if (typeof showReceiptToast === 'function') {
        showReceiptToast(`✓ Official Receipt #${receiptNumber} automatically generated for ${paymentRecord.name}!`, 'success');
      }

      // Transition to Success Step
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `PROCEED TO SECURE PAYMENT`;
      }

      showPaymentSuccessView();
    }, 900);
  }, 900);
}

function showPaymentSuccessView() {
  // Hide other panes
  for (let i = 1; i <= 4; i++) {
    const p = document.getElementById(`stepPane_${i}`);
    if (p) p.classList.remove('active');
  }

  const successPane = document.getElementById('stepPane_Success');
  if (successPane) successPane.classList.add('active');

  // Scroll to receipt
  successPane.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render Official Digital Receipt in inline container
 */
function renderDigitalReceipt(record) {
  if (typeof ReceiptEngine !== 'undefined' && ReceiptEngine.renderDigitalReceipt) {
    ReceiptEngine.renderDigitalReceipt(record, 'digitalReceiptContainer');
    return;
  }

  const container = document.getElementById('digitalReceiptContainer');
  if (!container) return;

  container.innerHTML = `
    ${renderOfficialReceiptHTML(record)}
    <div class="receipt-actions-bar">
      <button class="btn btn-primary" onclick="downloadReceiptPdf('${record.reference}')">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        DOWNLOAD PDF
      </button>
      <button class="btn btn-navy" onclick="window.print()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
        PRINT RECEIPT
      </button>
      <button class="btn btn-emerald" onclick="downloadStandaloneReceipt('${record.reference}')">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
        SAVE OFFLINE (.HTML)
      </button>
      <button class="btn btn-whatsapp" onclick="shareReceiptWhatsApp('${record.reference}')">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        WHATSAPP
      </button>
      <button class="btn btn-outline-light" onclick="copyReceiptVerificationLink('${record.reference}')" style="color: var(--navy-900); border-color: var(--slate-300);">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        COPY LINK
      </button>
      <button class="btn btn-outline-gold" onclick="resetPaymentForm()">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
        MAKE ANOTHER PAYMENT
      </button>
    </div>
  `;
}

/**
 * Universal Official Receipt HTML Generator
 */
function renderOfficialReceiptHTML(record) {
  const qrSvg = generateReceiptQRCodeSVG(record.reference || 'REC-VERIFIED');
  const monthsText = (record.selectedMonths && record.selectedMonths.length > 0)
    ? `${record.selectedMonths.length} Month(s) [${record.selectedMonths.join(', ')}]`
    : '1 Period';

  const descText = record.itemDescription || (record.selectedMonths ? `Monthly Dues Cleared: ${record.selectedMonths.join(', ')}` : 'Class Statutory Dues / Assessment');

  return `
    <div class="digital-receipt-box" id="officialReceiptPrintBox">
      <div class="receipt-header">
        <div class="receipt-brand">
          <img src="logo.png" alt="CIC Alumni Official Crest" style="width: 52px; height: 56px; object-fit: contain;">
          <div class="receipt-brand-text">
            <h3>CIC ALUMNI 1995 SET</h3>
            <p>College of the Immaculate Conception, Enugu</p>
            <div style="font-size: 0.72rem; color: var(--slate-500); font-weight: 600; margin-top: 2px;">Official Dues &amp; Contribution Receipt</div>
          </div>
        </div>
        <div class="receipt-number-badge">
          <div class="label">Receipt Number</div>
          <div class="number">${record.receiptNumber || 'REC-2026-XXXX'}</div>
          <div class="receipt-status-stamp">&check; PAID / VERIFIED</div>
        </div>
      </div>

      <div class="receipt-grid-meta">
        <div class="receipt-meta-item">
          <div class="label">Payer's Full Name</div>
          <div class="val">${escapeHtml(record.name)} ${record.classYear ? `(${escapeHtml(record.classYear)} Set)` : ''}</div>
        </div>
        <div class="receipt-meta-item">
          <div class="label">Payment Date &amp; Time</div>
          <div class="val">${escapeHtml(record.date)}</div>
        </div>
        <div class="receipt-meta-item">
          <div class="label">Phone Number</div>
          <div class="val">${escapeHtml(record.phone || 'N/A')}</div>
        </div>
        <div class="receipt-meta-item">
          <div class="label">Email Address</div>
          <div class="val">${escapeHtml(record.email || 'N/A')}</div>
        </div>
        <div class="receipt-meta-item">
          <div class="label">Transaction Reference</div>
          <div class="val" style="font-family: monospace; color: var(--cic-blue-900); font-weight: 800;">${escapeHtml(record.reference)}</div>
        </div>
        <div class="receipt-meta-item">
          <div class="label">Payment Channel</div>
          <div class="val">${escapeHtml(record.gateway || 'Direct Bank Settlement')} (${escapeHtml(record.channel || 'Direct Transfer')})</div>
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th>Item / Description</th>
            <th style="text-align: center;">Period / Qty</th>
            <th style="text-align: right;">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${escapeHtml(record.paymentType)}</strong>
              <div style="font-size: 0.82rem; color: var(--slate-600); margin-top: 3px;">
                ${escapeHtml(descText)}
              </div>
            </td>
            <td style="text-align: center; font-weight: 600; color: var(--cic-blue-800);">
              ${monthsText}
            </td>
            <td style="text-align: right; font-weight: 700;">
              ₦${Number(record.amount).toLocaleString()}
            </td>
          </tr>
          <tr class="total-row">
            <td colspan="2">TOTAL AMOUNT PAID</td>
            <td style="text-align: right; color: var(--cic-blue-900); font-size: 1.25rem;">
              ₦${Number(record.amount).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="receipt-footer-row">
        <div class="receipt-qr-wrap">
          ${qrSvg}
          <div class="receipt-verification-text">
            <strong>Scan to Verify Online</strong><br>
            Reference: <code style="color: var(--cic-blue-900); font-weight: 700;">${escapeHtml(record.reference)}</code><br>
            Officially verified by National Treasury &amp; Financial Secretariat &bull; CIC Alumni 1995 Set.
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-family: var(--font-heading); font-size: 0.9rem; font-weight: 800; color: var(--cic-blue-900);">
            National Treasury Office
          </div>
          <div style="font-size: 0.72rem; color: var(--slate-500); margin-top: 2px;">
            College of the Immaculate Conception
          </div>
          <div style="margin-top: 0.4rem; display: inline-block; padding: 2px 8px; background: rgba(43, 87, 151, 0.08); border-radius: 4px; font-size: 0.7rem; color: var(--cic-blue-700); font-weight: 700;">
            SEMPER FIDELIS
          </div>
        </div>
      </div>
    </div>
  `;
}

window.renderOfficialReceiptHTML = renderOfficialReceiptHTML;
window.generateReceiptQRCodeSVG = generateReceiptQRCodeSVG;

/**
 * Universal Official Receipt Modal Launcher (Available anywhere)
 */
window.openOfficialReceiptModal = function(refOrRecord) {
  let record = null;
  if (typeof refOrRecord === 'string') {
    record = DataStore.findPaymentByRef(refOrRecord);
  } else if (typeof refOrRecord === 'object' && refOrRecord !== null) {
    record = refOrRecord;
  }

  if (!record) {
    alert('Unable to find receipt details. Please verify the transaction reference.');
    return;
  }

  let modal = document.getElementById('officialReceiptModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'officialReceiptModal';
    modal.className = 'receipt-modal-overlay';
    modal.innerHTML = `
      <div class="receipt-modal-window">
        <div class="receipt-modal-header">
          <h4>
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Official Verified Payment Receipt
          </h4>
          <button class="receipt-modal-close-btn" onclick="closeOfficialReceiptModal()">&times;</button>
        </div>
        <div class="receipt-modal-body" id="officialReceiptModalBody"></div>
        <div class="receipt-modal-footer">
          <button class="btn btn-primary" onclick="printOfficialReceipt()">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            PRINT RECEIPT
          </button>
          <button class="btn btn-navy" onclick="printOfficialReceipt()">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            DOWNLOAD PDF
          </button>
          <button class="btn btn-outline-light" id="btnCopyReceiptLink" style="color: var(--navy-900); border-color: var(--slate-300);">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Copy Verification Link
          </button>
          <button class="btn btn-outline-light" onclick="closeOfficialReceiptModal()" style="margin-left: auto; color: var(--slate-600); border-color: var(--slate-300);">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeOfficialReceiptModal();
    });
  }

  const copyBtn = document.getElementById('btnCopyReceiptLink');
  if (copyBtn) {
    copyBtn.onclick = () => copyReceiptVerificationLink(record.reference);
  }

  const bodyEl = document.getElementById('officialReceiptModalBody');
  if (bodyEl) bodyEl.innerHTML = renderOfficialReceiptHTML(record);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeOfficialReceiptModal = function() {
  const modal = document.getElementById('officialReceiptModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
};

window.printOfficialReceipt = function() {
  window.print();
};

window.copyReceiptVerificationLink = function(ref) {
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  const url = `${base}verify.html?ref=${encodeURIComponent(ref)}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert(`✓ Official verification link copied to clipboard:\n${url}`);
    }).catch(() => {
      prompt('Official verification link:', url);
    });
  } else {
    prompt('Official verification link:', url);
  }
};

window.downloadReceiptPdf = function(ref) {
  window.print();
};

window.resetPaymentForm = function() {
  paymentState.step = 1;
  paymentState.completedPayment = null;
  paymentState.targetProjectId = null;
  paymentState.selectedMonths = [];
  goToPaymentStep(1);
  const infoForm = document.getElementById('payerInfoForm');
  if (infoForm) infoForm.reset();
  const summaryBox = document.getElementById('paymentSuccessView');
  if (summaryBox) summaryBox.style.display = 'none';
  const stepsCont = document.getElementById('paymentStepsContainer');
  if (stepsCont) stepsCont.style.display = 'block';
};

/**
 * Handle Verification Lookup and Display Output
 */
function handlePaymentVerification(ref) {
  const resultBox = document.getElementById('verifyResultBox');
  if (!resultBox) return;

  if (!ref || ref.trim() === '') {
    resultBox.innerHTML = `<div style="color: var(--danger); font-weight: 600;">Please enter a valid Transaction Reference or Receipt Number.</div>`;
    resultBox.classList.add('active');
    return;
  }

  const payment = DataStore.findPaymentByRef(ref);

  if (!payment) {
    resultBox.innerHTML = `
      <div style="text-align: center; padding: 1.5rem;">
        <div style="color: var(--danger); font-size: 2rem; margin-bottom: 0.5rem;">&cross;</div>
        <h4 style="color: var(--navy-900); font-family: var(--font-heading); margin-bottom: 0.35rem;">Record Not Found</h4>
        <p style="color: var(--slate-600); font-size: 0.9rem;">
          No verified payment record exists with reference "<strong>${escapeHtml(ref)}</strong>". Please double-check your receipt code.
        </p>
      </div>
    `;
    resultBox.classList.add('active');
    return;
  }

  // Privacy-safe masking for public lookup
  const maskedName = maskName(payment.name);

  resultBox.innerHTML = `
    <div style="border-left: 4px solid var(--emerald-500); padding-left: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--emerald-600); font-weight: 800; font-size: 1.1rem;">&check; VERIFIED OFFICIAL PAYMENT</span>
        </div>
        <span class="status-badge successful">Status: ${payment.status}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem; margin-top: 1rem;">
        <div>
          <span style="color: var(--slate-500); font-size: 0.8rem; text-transform: uppercase;">Payment Reference:</span><br>
          <strong style="font-family: monospace; color: var(--navy-900);">${payment.reference}</strong>
          ${payment.receiptNumber ? `<div style="font-size: 0.75rem; color: var(--slate-500);">Receipt: ${payment.receiptNumber}</div>` : ''}
        </div>
        <div>
          <span style="color: var(--slate-500); font-size: 0.8rem; text-transform: uppercase;">Amount Paid:</span><br>
          <strong style="color: var(--navy-900); font-size: 1.1rem;">₦${payment.amount.toLocaleString()}</strong>
        </div>
        <div>
          <span style="color: var(--slate-500); font-size: 0.8rem; text-transform: uppercase;">Payment Category:</span><br>
          <strong>${payment.paymentType}</strong>
          ${payment.selectedMonths && payment.selectedMonths.length > 0 ? `<div style="font-size: 0.75rem; color: var(--cic-blue-600); font-weight: 600;">${payment.selectedMonths.join(', ')}</div>` : ''}
        </div>
        <div>
          <span style="color: var(--slate-500); font-size: 0.8rem; text-transform: uppercase;">Payment Date:</span><br>
          <strong>${payment.date}</strong>
        </div>
        <div style="grid-column: span 2;">
          <span style="color: var(--slate-500); font-size: 0.8rem; text-transform: uppercase;">Verified Payer:</span><br>
          <strong>${maskedName}</strong> &bull; <span style="font-size: 0.8rem; color: var(--slate-500);">Privacy Protected</span>
        </div>
      </div>

      <!-- Instant Receipt View, Download & Share Actions -->
      <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--cic-blue-200); display: flex; gap: 0.6rem; flex-wrap: wrap;">
        <button type="button" class="btn btn-primary btn-sm" onclick="openOfficialReceiptModal('${payment.reference}')" style="display: inline-flex; align-items: center; gap: 0.45rem; font-weight: 700;">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          View Official Receipt
        </button>
        <button type="button" class="btn btn-navy btn-sm" onclick="downloadReceiptPdf('${payment.reference}')" style="display: inline-flex; align-items: center; gap: 0.45rem;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download PDF
        </button>
        <button type="button" class="btn btn-emerald btn-sm" onclick="downloadStandaloneReceipt('${payment.reference}')" style="display: inline-flex; align-items: center; gap: 0.45rem;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
          Save Offline (.html)
        </button>
        <button type="button" class="btn btn-whatsapp btn-sm" onclick="shareReceiptWhatsApp('${payment.reference}')" style="display: inline-flex; align-items: center; gap: 0.45rem;">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Share WhatsApp
        </button>
      </div>
    </div>
  `;
  resultBox.classList.add('active');
}

window.handlePaymentVerification = handlePaymentVerification;
window.performPaymentVerification = handlePaymentVerification;

function maskName(str) {
  if (!str) return 'Alumnus';
  const parts = str.split(' ');
  return parts.map(p => {
    if (p.length <= 2) return p;
    return p[0] + '*'.repeat(p.length - 2) + p[p.length - 1];
  }).join(' ');
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
}

window.copyAnthemLyrics = function() {
  const text = `THE COLLEGE ANTHEM (C.I.C. ENUGU)\n\nOut of the shadows of the past\nWe come to cheer you,\nBoys of the Old Brigade of Gallant C.I.C.\nA thousand voices unite in a Mighty chorus\nBoys of Old Saint Mary march to victory.\n\nREFRAIN\nFearless and strong\nAre the boys of Saint Mary College\nGlorious and proud\nLoyal sons of the old White and Blue.\nBrave hearts and true\nLet their names be etched in triumph glory\nOnward march on\nBoys of C.I.C. to glory!`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const targets = [
        document.getElementById('copyAnthemBtnText'),
        document.getElementById('copyAnthemBtnTextIndex')
      ].filter(Boolean);
      
      targets.forEach(btnText => {
        const orig = btnText.textContent;
        btnText.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => { btnText.textContent = orig; }, 2500);
      });
    }).catch(() => {
      alert(text);
    });
  } else {
    alert(text);
  }
};

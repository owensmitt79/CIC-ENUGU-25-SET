/**
 * High Alumni Association - Administrator Portal Logic
 * Provides secure analytics, payments ledger, dues rate configurator,
 * category manager, CSV export, and content management.
 */

let isAdminAuthenticated = (typeof sessionStorage !== 'undefined') && sessionStorage.getItem('cic_admin_logged_in') === 'true';
if (!isAdminAuthenticated) {
  if (typeof window !== 'undefined') {
    window.location.replace('login.html');
  }
}

// Cross-tab real-time pulse synchronization for payments, dues, categories, news, and gallery
window.addEventListener('storage', function(e) {
  if (e.key === 'haa_payment_pulse' || e.key === 'haa_payments_v1' || e.key === 'haa_categories_pulse' || e.key === 'haa_categories_v1') {
    if (typeof loadAdminDashboardData === 'function') loadAdminDashboardData();
    if (typeof filterAndRenderPaymentsTable === 'function') filterAndRenderPaymentsTable();
    if (typeof renderAdminMonthlyDuesTable === 'function') renderAdminMonthlyDuesTable();
    if (typeof renderAdminCategories === 'function') renderAdminCategories();
    if (typeof renderDuesCategoryChips === 'function') renderDuesCategoryChips();
  }
  if (e.key === 'haa_news_v1' || e.key === 'haa_news_pulse') {
    if (typeof renderAdminNews === 'function') renderAdminNews();
    if (typeof updateNewsGalleryBadgeCounts === 'function') updateNewsGalleryBadgeCounts();
  }
  if (e.key === 'haa_gallery_v1' || e.key === 'haa_gallery_pulse') {
    if (typeof renderAdminGallery === 'function') renderAdminGallery();
    if (typeof updateNewsGalleryBadgeCounts === 'function') updateNewsGalleryBadgeCounts();
  }
});

/**
 * Global Bulletproof Tab & Pane Switcher for Admin Navigation Bar
 */
window.switchAdminPane = function(paneId) {
  if (!paneId) return;

  // Map alias panes for News & Gallery
  let targetPaneId = paneId;
  let requestedNewsGalleryTab = null;
  if (paneId === 'adminPane_News') {
    targetPaneId = 'adminPane_NewsGallery';
    requestedNewsGalleryTab = 'news';
  } else if (paneId === 'adminPane_Gallery') {
    targetPaneId = 'adminPane_NewsGallery';
    requestedNewsGalleryTab = 'gallery';
  } else if (paneId === 'adminPane_NewsGallery') {
    targetPaneId = 'adminPane_NewsGallery';
  }

  // 1. Update buttons
  const allBtns = document.querySelectorAll('.admin-tab-btn');
  allBtns.forEach(btn => {
    const p = btn.dataset.pane || btn.getAttribute('data-pane');
    if (paneId === 'adminPane_News' && p === 'adminPane_News') {
      btn.classList.add('active');
    } else if (paneId === 'adminPane_Gallery' && p === 'adminPane_Gallery') {
      btn.classList.add('active');
    } else if (p === targetPaneId || p === paneId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Update panes
  const allPanes = document.querySelectorAll('.admin-pane');
  allPanes.forEach(pane => {
    if (pane.id === targetPaneId) {
      pane.classList.add('active');
      pane.style.display = 'block';
    } else {
      pane.classList.remove('active');
      pane.style.display = 'none';
    }
  });

  // 3. Lazy render specific pane data
  try {
    if (targetPaneId === 'adminPane_Overview') {
      if (typeof loadAdminDashboardData === 'function') loadAdminDashboardData();
    } else if (targetPaneId === 'adminPane_Payments') {
      if (typeof filterAndRenderPaymentsTable === 'function') filterAndRenderPaymentsTable();
    } else if (targetPaneId === 'adminPane_MonthlyDues') {
      if (typeof renderAdminMonthlyDuesTable === 'function') renderAdminMonthlyDuesTable();
    } else if (targetPaneId === 'adminPane_Categories') {
      if (typeof renderAdminCategories === 'function') renderAdminCategories();
    } else if (targetPaneId === 'adminPane_Events') {
      if (typeof renderAdminEvents === 'function') renderAdminEvents();
    } else if (targetPaneId === 'adminPane_Projects') {
      if (typeof renderAdminProjects === 'function') renderAdminProjects();
    } else if (targetPaneId === 'adminPane_CreateProject') {
      if (typeof initAdminProjectsStudio === 'function') initAdminProjectsStudio();
      const titleInput = document.getElementById('newProjectTitle');
      if (titleInput) titleInput.focus();
    } else if (targetPaneId === 'adminPane_IssueReceipt') {
      if (typeof initIssueReceiptStudio === 'function') initIssueReceiptStudio();
      const nameInput = document.getElementById('issueMemberName');
      if (nameInput) nameInput.focus();
    } else if (targetPaneId === 'adminPane_NewsGallery') {
      if (typeof initAdminNewsStudio === 'function') initAdminNewsStudio();
      if (typeof initAdminGalleryStudio === 'function') initAdminGalleryStudio();
      if (typeof updateNewsGalleryBadgeCounts === 'function') updateNewsGalleryBadgeCounts();
      if (requestedNewsGalleryTab) {
        if (typeof switchNewsGallerySubtab === 'function') switchNewsGallerySubtab(requestedNewsGalleryTab);
      } else {
        const galSec = document.getElementById('adminGallerySection');
        if (galSec && galSec.style.display === 'block') {
          if (typeof switchNewsGallerySubtab === 'function') switchNewsGallerySubtab('gallery');
        } else {
          if (typeof switchNewsGallerySubtab === 'function') switchNewsGallerySubtab('news');
        }
      }
    } else if (targetPaneId === 'adminPane_LeadershipMembers') {
      if (typeof initAdminLeadershipMembers === 'function') initAdminLeadershipMembers();
    } else if (targetPaneId === 'adminPane_MediaLibrary') {
      window.switchAdminPane('adminPane_NewsGallery');
      window.switchNewsGallerySubtab('media');
      return;
    }
  } catch (err) {
    console.warn('Pane render warning:', err);
  }
};

// Global click delegation for all .admin-tab-btn buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.admin-tab-btn');
  if (btn) {
    const paneId = btn.dataset.pane || btn.getAttribute('data-pane');
    if (paneId) {
      window.switchAdminPane(paneId);
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Admin button in top bar or navigation
  const adminOpenBtns = document.querySelectorAll('.btn-open-admin');
  adminOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminPortal();
    });
  });

  const adminCloseBtn = document.getElementById('adminCloseBtn');
  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      closeAdminPortal();
    });
  }

  // Safely update gate display credentials if helper exists
  if (typeof updateAdminGateCredentialsDisplay === 'function') {
    try { updateAdminGateCredentialsDisplay(); } catch (_) {}
  }

  // Load Admin Dashboard directly on admin page
  const mainDashboard = document.getElementById('adminMainDashboard');
  if (mainDashboard) {
    isAdminAuthenticated = true;
    mainDashboard.style.display = 'flex';
    try {
      loadAdminDashboardData();
    } catch (err) {
      console.warn('Initial dashboard load warning:', err);
    }
  }

  // Real-time cross-tab synchronization: Updates ledger, payers list, and metrics automatically whenever any payment is made
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === 'haa_payments_v1' || e.key === 'haa_members_v1' || e.key === 'haa_payment_pulse') {
      try {
        loadAdminDashboardData();
        filterAndRenderPaymentsTable();
        renderAdminMonthlyDuesTable();
        if (typeof renderAdminMembers === 'function') renderAdminMembers();
      } catch (err) {
        console.warn('Storage sync update note:', err);
      }
    }
  });

  // Admin Login form
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredEmail = (document.getElementById('adminGateEmail')?.value || '').trim();
      const pin = (document.getElementById('adminPinInput')?.value || '').trim();
      const validPin = DataStore.getAdminPin();

      if (pin === validPin) {
        isAdminAuthenticated = true;
        sessionStorage.setItem('cic_admin_logged_in', 'true');
        const authGate = document.getElementById('adminAuthGate');
        const mainDashboard = document.getElementById('adminMainDashboard');
        if (authGate) authGate.style.display = 'none';
        if (mainDashboard) mainDashboard.style.display = 'flex';
        loadAdminDashboardData();
      } else {
        const errEl = document.getElementById('adminAuthError');
        if (errEl) {
          errEl.textContent = 'Invalid email or password. Please verify your credentials and try again.';
          errEl.style.display = 'block';
        }
      }
    });
  }

  // Admin Logout
  const logoutBtns = document.querySelectorAll('.btn-admin-logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('cic_admin_logged_in');
      isAdminAuthenticated = false;
      window.location.href = 'login.html';
    });
  });

  // Admin Nav Tab Switching via delegation and direct calls
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      const paneId = btn.dataset.pane || btn.getAttribute('data-pane');
      if (paneId) {
        window.switchAdminPane(paneId);
      }
    });
  });

  // Admin Search & Filter in Payments
  const searchInput = document.getElementById('adminSearchPayments');
  const catFilter = document.getElementById('adminCategoryFilter');
  if (searchInput) searchInput.addEventListener('input', () => filterAndRenderPaymentsTable());
  if (catFilter) catFilter.addEventListener('change', () => filterAndRenderPaymentsTable());

  // Export CSV button
  const exportCsvBtn = document.getElementById('btnExportPaymentsCsv');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => exportPaymentsToCSV());
  }

  // Save Monthly Dues Rate Form
  const duesForm = document.getElementById('adminDuesRateForm');
  if (duesForm) {
    duesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newRate = parseInt(document.getElementById('adminMonthlyDuesInput').value, 10);
      if (newRate > 0) {
        const cfg = DataStore.getConfig();
        cfg.monthlyDuesRate = newRate;
        DataStore.saveConfig(cfg);

        // Update category baseAmount as well
        const cats = DataStore.getCategories();
        const mCat = cats.find(c => c.id === 'monthly_dues');
        if (mCat) {
          mCat.baseAmount = newRate;
          DataStore.saveCategories(cats);
        }

        alert(`Monthly Dues rate successfully updated to ₦${newRate.toLocaleString()} / Month!`);
        loadAdminDashboardData();
        renderAdminMonthlyDuesTable();
        
        // Update public view
        if (typeof updateAmountConfigView === 'function') {
          updateAmountConfigView();
        }
      }
    });
  }

  // Gateway Settings Form
  const gatewayForm = document.getElementById('adminGatewaySettingsForm');
  if (gatewayForm) {
    gatewayForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cfg = DataStore.getConfig();
      cfg.activeGateway = document.getElementById('adminActiveGatewaySelect').value;
      cfg.gatewayMode = document.getElementById('adminGatewayModeSelect').value;
      DataStore.saveConfig(cfg);
      alert(`Gateway configuration updated! Active Provider: ${cfg.activeGateway} (${cfg.gatewayMode})`);
    });
  }

  // Create Project Form
  const createProjectForm = document.getElementById('adminCreateProjectForm');
  if (createProjectForm) {
    createProjectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newProjectTitle').value.trim();
      const category = document.getElementById('newProjectCategory').value;
      const target = parseInt(document.getElementById('newProjectTarget').value, 10);
      const initialRaised = parseInt(document.getElementById('newProjectInitialRaised').value, 10) || 0;
      const image = document.getElementById('newProjectImage').value.trim() || 'images/campus.jpg';
      const description = document.getElementById('newProjectDescription').value.trim();

      if (!title || !target || target <= 0) {
        alert('Please enter a valid project title and target amount.');
        return;
      }

      const newProject = {
        id: 'prj-' + Date.now(),
        title: title,
        category: category,
        targetAmount: target,
        raisedAmount: initialRaised,
        donorCount: initialRaised > 0 ? 1 : 0,
        status: 'active',
        image: image,
        description: description
      };

      DataStore.addProject(newProject);

      // Immediately refresh public view and admin table
      if (typeof renderProjects === 'function') {
        renderProjects();
      }
      renderAdminProjects();
      loadAdminDashboardData();

      alert(`✓ Project "${title}" successfully created and launched! It is now visible on the website.`);
      createProjectForm.reset();
      const initRaisedInput = document.getElementById('newProjectInitialRaised');
      if (initRaisedInput) initRaisedInput.value = '0';
      const imgInput = document.getElementById('newProjectImage');
      if (imgInput) imgInput.value = 'images/campus.jpg';

      switchToProjectsTab();
    });
  }

  // Issue Dues Receipt Form Submission
  const issueForm = document.getElementById('issueDuesReceiptForm');
  if (issueForm) {
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('issueMemberName').value.trim();
      const phone = document.getElementById('issueMemberPhone').value.trim();
      const email = (document.getElementById('issueMemberEmail').value || '').trim() || `${name.toLowerCase().replace(/\s+/g, '.') || 'alumnus'}@cic1995.org`;
      const classYear = document.getElementById('issueMemberClassYear').value.trim() || '1995';
      const category = document.getElementById('issueCategorySelect').value;
      const channel = document.getElementById('issuePaymentChannel').value;
      const amount = parseInt(document.getElementById('issueAmountInput').value, 10) || 5000;
      const paymentDate = document.getElementById('issuePaymentDate').value || new Date().toISOString().split('T')[0];
      const bankRef = (document.getElementById('issueBankReference').value || '').trim();
      const notes = (document.getElementById('issueReceiptNotes').value || '').trim();

      // Collect selected months if Monthly Dues
      const selectedMonths = [];
      if (category === 'Monthly Dues') {
        document.querySelectorAll('.issue-month-checkbox:checked').forEach(cb => {
          selectedMonths.push(cb.value);
        });
      }

      const dateObj = new Date(paymentDate);
      const year = isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear();
      const refRandom = Math.floor(10000 + Math.random() * 90000);
      const receiptSeq = Math.floor(1000 + Math.random() * 9000);

      const reference = `CIC-${year}-${refRandom}`;
      const receiptNumber = `REC-${year}-${receiptSeq}`;

      const newRecord = {
        reference,
        receiptNumber,
        name,
        phone,
        email,
        classYear,
        paymentType: category,
        amount,
        selectedMonths,
        itemDescription: selectedMonths.length > 0
          ? `Monthly Dues for: ${selectedMonths.join(', ')} (${bankRef ? `Ref: ${bankRef}` : 'Treasury Direct Settlement'})`
          : `${category} • ${bankRef ? `Ref: ${bankRef}` : 'Treasury Direct Settlement'}`,
        gateway: 'Treasury Settlement',
        channel: channel,
        status: 'Successful',
        date: paymentDate,
        notes: notes
      };

      DataStore.addPayment(newRecord);

      // Pulse storage for live cross-tab updates
      try {
        localStorage.setItem('haa_payment_pulse', Date.now().toString());
      } catch (_) {}

      // Keep Members Directory synchronized with Active status
      try {
        const members = DataStore.getMembers() || [];
        const cleanEmail = (email || '').toLowerCase().trim();
        const cleanPhone = (phone || '').replace(/\D/g, '');
        const cleanName = (name || '').toLowerCase().trim();

        let memberMatch = members.find(m => {
          if (cleanEmail && m.email && m.email.toLowerCase().trim() === cleanEmail) return true;
          if (cleanPhone && m.phone && m.phone.replace(/\D/g, '') === cleanPhone) return true;
          if (cleanName && m.name && m.name.toLowerCase().trim() === cleanName) return true;
          return false;
        });

        if (memberMatch) {
          memberMatch.duesStatus = 'Active';
          memberMatch.lastPaymentDate = paymentDate;
          memberMatch.lastReceiptNumber = receiptNumber;
          DataStore.saveMembers(members);
        }
      } catch (err) {}

      // Refresh admin tables and KPI cards
      loadAdminDashboardData();
      filterAndRenderPaymentsTable();
      renderAdminMonthlyDuesTable();
      if (typeof renderAdminMembers === 'function') renderAdminMembers();

      if (typeof showReceiptToast === 'function') {
        showReceiptToast(`✓ Official Receipt #${receiptNumber} generated automatically for ${name}!`, 'success');
      }

      // Immediately open universal receipt modal for instant review, printing, or download
      if (typeof openOfficialReceiptModal === 'function') {
        openOfficialReceiptModal(newRecord);
      }
    });
  }
});

/**
 * Admin Credentials & Gate Display Helpers
 */
window.updateAdminGateCredentialsDisplay = function() {
  const email = (typeof DataStore !== 'undefined' && DataStore.getAdminEmail) ? DataStore.getAdminEmail() : 'admin@cic1995.org';

  const settingsPinEl = document.getElementById('displaySettingsPin');
  if (settingsPinEl) settingsPinEl.textContent = '••••••••';

  const settingsEmailEl = document.getElementById('displaySettingsEmail');
  if (settingsEmailEl) settingsEmailEl.textContent = email;

  const settingEmailInput = document.getElementById('settingAdminEmail');
  if (settingEmailInput) settingEmailInput.value = email;
};

window.updateAdminSecurityCredentials = function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const currentPin = (document.getElementById('settingCurrentPin')?.value || '').trim();
  const newPin = (document.getElementById('settingNewPin')?.value || '').trim();
  const confirmPin = (document.getElementById('settingConfirmPin')?.value || '').trim();
  const newEmail = (document.getElementById('settingAdminEmail')?.value || '').trim();
  const alertBox = document.getElementById('credentialChangeAlert');

  const validCurrentPin = DataStore.getAdminPin();

  if (currentPin !== validCurrentPin) {
    if (alertBox) {
      alertBox.textContent = 'Current security PIN is incorrect. Verification failed.';
      alertBox.style.display = 'block';
      alertBox.style.background = '#fef2f2';
      alertBox.style.color = '#b91c1c';
      alertBox.style.border = '1px solid #fecaca';
    }
    return;
  }

  if (newPin.length < 4) {
    if (alertBox) {
      alertBox.textContent = 'New security PIN must be at least 4 characters long.';
      alertBox.style.display = 'block';
      alertBox.style.background = '#fef2f2';
      alertBox.style.color = '#b91c1c';
      alertBox.style.border = '1px solid #fecaca';
    }
    return;
  }

  if (newPin !== confirmPin) {
    if (alertBox) {
      alertBox.textContent = 'New PIN and Confirm PIN do not match. Please re-enter.';
      alertBox.style.display = 'block';
      alertBox.style.background = '#fef2f2';
      alertBox.style.color = '#b91c1c';
      alertBox.style.border = '1px solid #fecaca';
    }
    return;
  }

  // Update DataStore
  DataStore.setAdminPin(newPin);
  if (newEmail) {
    DataStore.setAdminEmail(newEmail);
  }

  // Update UI Displays
  updateAdminGateCredentialsDisplay();

  // Reset form inputs
  const form = document.getElementById('adminSecurityCredentialsForm');
  if (form) form.reset();
  const emailInput = document.getElementById('settingAdminEmail');
  if (emailInput && newEmail) emailInput.value = newEmail;

  if (alertBox) {
    alertBox.textContent = `Success! Security credentials updated. New PIN: ${newPin}`;
    alertBox.style.display = 'block';
    alertBox.style.background = '#f0fdf4';
    alertBox.style.color = '#15803d';
    alertBox.style.border = '1px solid #bbf7d0';
  }

  alert(`Administrator Security Credentials Updated Successfully!\nNew Active Passcode: ${newPin}\nAuthorized Email: ${newEmail}`);
};

function openAdminPortal() {
  const overlay = document.getElementById('adminOverlay');
  if (overlay) {
    overlay.classList.add('active');
    if (!isAdminAuthenticated) {
      document.getElementById('adminAuthGate').style.display = 'block';
      document.getElementById('adminMainDashboard').style.display = 'none';
      const pinInput = document.getElementById('adminPinInput');
      if (pinInput) pinInput.value = '';
      const errEl = document.getElementById('adminAuthError');
      if (errEl) errEl.style.display = 'none';
    } else {
      document.getElementById('adminAuthGate').style.display = 'none';
      document.getElementById('adminMainDashboard').style.display = 'flex';
      loadAdminDashboardData();
    }
  } else {
    window.location.href = './?openAdmin=true';
  }
}

// Auto open admin if launched from subpages
try {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openAdmin') === 'true' || urlParams.get('admin') === 'true') {
    setTimeout(openAdminPortal, 250);
  }
} catch (e) {}

function closeAdminPortal() {
  const overlay = document.getElementById('adminOverlay');
  if (overlay) overlay.classList.remove('active');
}

/**
 * Load and Compute Admin Dashboard KPI Metrics and Payments Ledger
 */
function loadAdminDashboardData() {
  const payments = DataStore.getPayments();
  const config = DataStore.getConfig();

  // Metrics computation
  let totalRevenue = 0;
  let todayRevenue = 0;
  let monthlyDuesTotal = 0;
  let donationsTotal = 0;
  let eventsTotal = 0;

  const todayStr = new Date().toISOString().slice(0, 10);

  payments.forEach(p => {
    const amt = Number(p.amount) || 0;
    totalRevenue += amt;

    if (p.date && p.date.startsWith(todayStr)) {
      todayRevenue += amt;
    }

    if (p.paymentType === 'Monthly Dues' || p.paymentType === 'Annual Dues') {
      monthlyDuesTotal += amt;
    } else if (p.paymentType === 'Donation' || p.paymentType === 'Project Contribution' || p.paymentType === 'Welfare Contribution') {
      donationsTotal += amt;
    } else if (p.paymentType === 'Event Registration' || p.paymentType === 'Reunion Fee') {
      eventsTotal += amt;
    }
  });

  // Render KPI values
  setElText('kpiTotalRevenue', `₦${totalRevenue.toLocaleString()}`);
  setElText('kpiTodayRevenue', `₦${todayRevenue.toLocaleString()}`);
  setElText('kpiTotalTxns', payments.length.toString());
  setElText('kpiDuesCollections', `₦${monthlyDuesTotal.toLocaleString()}`);
  setElText('kpiDonationsTotal', `₦${donationsTotal.toLocaleString()}`);
  setElText('kpiEventsTotal', `₦${eventsTotal.toLocaleString()}`);

  // Populate Monthly Dues rate input
  const duesInput = document.getElementById('adminMonthlyDuesInput');
  if (duesInput) duesInput.value = config.monthlyDuesRate;

  // Populate Gateway select
  const gwSelect = document.getElementById('adminActiveGatewaySelect');
  const gwMode = document.getElementById('adminGatewayModeSelect');
  if (gwSelect) gwSelect.value = config.activeGateway || 'Paystack';
  if (gwMode) gwMode.value = config.gatewayMode || 'Test Mode';

  // Render Category filter options in payments tab
  const catFilter = document.getElementById('adminCategoryFilter');
  if (catFilter) {
    const categories = DataStore.getCategories();
    catFilter.innerHTML = `<option value="ALL">All Categories &amp; Dues</option>` +
      categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // Render dues stream filter chips
  renderDuesCategoryChips();
  renderAdminCategories();

  // Render payments & dues ledger
  filterAndRenderPaymentsTable();
  renderAdminMonthlyDuesTable();

  // Initialize News & Announcements Studio
  initAdminNewsStudio();
  renderAdminNews();

  // Initialize Projects & Initiatives Studio
  initAdminProjectsStudio();
  renderAdminProjects();

  // Initialize Leadership & Members Management Studio
  updateLeadershipMembersCounts();
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

let activeLedgerCategory = 'ALL';

window.handleAdminCategoryFilterChange = function(cat) {
  activeLedgerCategory = cat || 'ALL';
  updateActiveLedgerChipsUI();
  filterAndRenderPaymentsTable();
};

window.setLedgerCategoryChip = function(cat) {
  activeLedgerCategory = cat || 'ALL';
  const selectEl = document.getElementById('adminCategoryFilter');
  if (selectEl) selectEl.value = activeLedgerCategory;
  updateActiveLedgerChipsUI();
  filterAndRenderPaymentsTable();
};

function updateActiveLedgerChipsUI() {
  document.querySelectorAll('.dues-chip-btn').forEach(btn => {
    if (btn.dataset.category === activeLedgerCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function renderDuesCategoryChips() {
  const container = document.getElementById('duesChipFilterBar');
  if (!container) return;

  const categories = DataStore.getCategories();
  const chipList = [
    { id: 'ALL', name: 'All Dues & Payers' },
    ...categories.filter(c => c.active).map(c => ({ id: c.name, name: c.name }))
  ];

  container.innerHTML = chipList.map(c => `
    <button type="button" class="dues-chip-btn ${activeLedgerCategory === c.id ? 'active' : ''}" data-category="${escapeHtml(c.id)}" onclick="setLedgerCategoryChip('${escapeHtml(c.id)}')">
      ${escapeHtml(c.name)}
    </button>
  `).join('');
}

/**
 * Filter & Render Payments Ledger (Payers Directory)
 * Automatically updates KPI cards, unique payers count, and actions for EVERY due paid
 */
function filterAndRenderPaymentsTable() {
  const container = document.getElementById('adminPaymentsTableBody');
  const payments = DataStore.getPayments();

  // 1. Compute & update high-level KPI metrics across all payments
  let totalAmount = 0;
  const uniquePayersSet = new Set();
  let totalDuesCount = 0;

  payments.forEach(p => {
    totalAmount += Number(p.amount || 0);
    const identifier = (p.email || p.phone || p.name || '').toLowerCase().trim();
    if (identifier) uniquePayersSet.add(identifier);
    const pType = (p.paymentType || '').toLowerCase();
    if (pType.includes('dues') || pType.includes('levy') || pType.includes('welfare') || (p.selectedMonths && p.selectedMonths.length > 0)) {
      totalDuesCount++;
    }
  });

  setElText('ledgerKpiTotalAmount', `₦${totalAmount.toLocaleString()}`);
  setElText('ledgerKpiUniquePayers', uniquePayersSet.size.toString());
  setElText('ledgerKpiTotalReceipts', payments.length.toString());
  setElText('sidebarPayersCount', uniquePayersSet.size.toString());
  setElText('sidebarDuesCount', totalDuesCount.toString());

  if (payments.length > 0) {
    const latest = payments[0];
    setElText('ledgerKpiLatestPayer', latest.name || 'Alumnus Payer');
    setElText('ledgerKpiLatestAmount', `₦${Number(latest.amount || 0).toLocaleString()} • ${latest.paymentType || 'Dues'}`);
  } else {
    setElText('ledgerKpiLatestPayer', '—');
    setElText('ledgerKpiLatestAmount', 'No transactions yet');
  }

  if (!container) return;

  // 2. Filter records by search and active category
  const searchInput = document.getElementById('adminSearchPayments');
  const catFilter = document.getElementById('adminCategoryFilter');

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const selectedCat = activeLedgerCategory !== 'ALL' ? activeLedgerCategory : (catFilter ? catFilter.value : 'ALL');

  const filtered = payments.filter(p => {
    const matchesCat = selectedCat === 'ALL' || p.paymentType === selectedCat;
    const matchesQuery = !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.reference && p.reference.toLowerCase().includes(query)) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(query)) ||
      (p.itemDescription && p.itemDescription.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--slate-500); padding: 3rem 1.5rem;"><div style="font-weight: 600; color: var(--navy-900); font-size: 1.05rem; margin-bottom: 0.35rem;">No matching payer records found</div><div style="font-size: 0.85rem;">Try clearing search filters or selecting another dues stream.</div></td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const receiptNum = p.receiptNumber || p.reference;
    const monthsText = (p.selectedMonths && p.selectedMonths.length > 0)
      ? p.selectedMonths.join(', ')
      : '';
    const descText = p.itemDescription || '';

    return `
      <tr>
        <td>
          <div style="font-family: monospace; font-weight: 800; color: var(--navy-900); font-size: 0.9rem;">
            ${escapeHtml(receiptNum)}
          </div>
          <div style="font-size: 0.72rem; color: var(--slate-500); font-family: monospace;">
            Ref: ${escapeHtml(p.reference)}
          </div>
        </td>
        <td>
          <strong style="color: var(--navy-900); font-size: 0.92rem; display: block;">${escapeHtml(p.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--slate-600); margin-top: 1px;">
            ${escapeHtml(p.phone || '')}${p.phone && p.email ? ' • ' : ''}${escapeHtml(p.email || '')}
          </div>
          <div style="font-size: 0.72rem; color: var(--slate-400); margin-top: 1px;">
            ${escapeHtml(p.classYear || 'Class of 1995')}
          </div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; background: rgba(43, 87, 151, 0.08); color: var(--cic-blue-700); border: 1px solid rgba(43, 87, 151, 0.2); border-radius: 4px; font-size: 0.78rem; font-weight: 700;">
            ${escapeHtml(p.paymentType)}
          </span>
          ${monthsText ? `
            <div style="font-size: 0.75rem; color: var(--cic-blue-600); font-weight: 600; margin-top: 3px;">
              ${escapeHtml(monthsText)}
            </div>
          ` : ''}
          ${descText && !monthsText ? `
            <div style="font-size: 0.73rem; color: var(--slate-500); margin-top: 2px; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(descText)}">
              ${escapeHtml(descText)}
            </div>
          ` : ''}
        </td>
        <td>
          <strong style="font-weight: 800; color: var(--navy-900); font-size: 1rem;">
            ₦${Number(p.amount || 0).toLocaleString()}
          </strong>
        </td>
        <td>
          <span style="font-size: 0.82rem; font-weight: 700; color: var(--slate-700);">${escapeHtml(p.gateway || 'Paystack')}</span>
          <div style="font-size: 0.72rem; color: var(--slate-500);">${escapeHtml(p.channel || 'Online Checkout')}</div>
        </td>
        <td>
          <div style="font-size: 0.8rem; color: var(--slate-600); white-space: nowrap;">
            ${escapeHtml(p.date || 'N/A')}
          </div>
        </td>
        <td>
          <span class="status-badge successful" style="background: rgba(34, 197, 94, 0.12); color: #15803D; font-weight: 700;">
            ✓ Cleared
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
            <button type="button" class="btn btn-sm btn-outline-blue" onclick="viewReceiptInAdmin('${p.reference}')" title="View &amp; Verify Official Receipt" style="font-weight: 700; padding: 0.28rem 0.65rem; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 0.35rem;">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Receipt
            </button>
            <button type="button" class="btn btn-sm btn-outline-light" onclick="printReceiptDirect('${p.reference}')" title="Print Official Receipt" style="padding: 0.28rem 0.55rem; font-size: 0.78rem; color: var(--slate-700);">
              🖨️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.viewReceiptInAdmin = function(ref) {
  if (typeof ReceiptEngine !== 'undefined' && ReceiptEngine.openOfficialReceiptModal) {
    ReceiptEngine.openOfficialReceiptModal(ref);
  } else if (typeof openOfficialReceiptModal === 'function') {
    openOfficialReceiptModal(ref);
  } else {
    const payment = DataStore.findPaymentByRef(ref);
    if (payment) {
      alert(`Official Receipt: ${payment.receiptNumber || payment.reference}\nPayer: ${payment.name}\nAmount: ₦${Number(payment.amount).toLocaleString()}\nStatus: Verified`);
    }
  }
};

window.printReceiptDirect = function(ref) {
  if (typeof ReceiptEngine !== 'undefined' && ReceiptEngine.downloadReceiptPdf) {
    ReceiptEngine.downloadReceiptPdf(ref);
  } else if (typeof openOfficialReceiptModal === 'function') {
    openOfficialReceiptModal(ref);
    setTimeout(() => window.print(), 300);
  }
};

/**
 * Export Payments & Payers Ledger to CSV
 */
function exportPaymentsToCSV() {
  const payments = DataStore.getPayments();
  if (payments.length === 0) {
    alert('No payment records to export.');
    return;
  }

  const headers = ['Reference', 'Receipt Number', 'Payer Name', 'Phone', 'Email', 'Class Year', 'Dues Category', 'Coverage & Description', 'Amount (NGN)', 'Gateway', 'Channel', 'Status', 'Timestamp'];
  
  const rows = payments.map(p => [
    `"${p.reference || ''}"`,
    `"${p.receiptNumber || ''}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.phone || ''}"`,
    `"${p.email || ''}"`,
    `"${p.classYear || 'Class of 1995'}"`,
    `"${p.paymentType || ''}"`,
    `"${(p.itemDescription || (p.selectedMonths && p.selectedMonths.join(', ')) || '').replace(/"/g, '""')}"`,
    Number(p.amount || 0),
    `"${p.gateway || ''}"`,
    `"${p.channel || ''}"`,
    `"${p.status || 'Successful'}"`,
    `"${p.date || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `CIC_Alumni_Payers_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * All Dues & Levies Audit Tracker
 * Tracks every due paid (Monthly Dues, Annual Membership, Welfare Levies, Special Project Levies)
 */
function renderAdminMonthlyDuesTable() {
  const container = document.getElementById('adminMonthlyDuesTableBody');
  const payments = DataStore.getPayments();

  // 1. Calculate dues streams breakdown
  let monthlyTotal = 0, monthlyCount = 0;
  let annualTotal = 0, annualCount = 0;
  let welfareTotal = 0, welfareCount = 0;
  let allDuesTotal = 0;

  payments.forEach(p => {
    const amt = Number(p.amount || 0);
    const pType = (p.paymentType || '').toLowerCase();

    if (pType === 'monthly dues' || (p.selectedMonths && p.selectedMonths.length > 0)) {
      monthlyTotal += amt;
      monthlyCount++;
      allDuesTotal += amt;
    } else if (pType === 'annual dues') {
      annualTotal += amt;
      annualCount++;
      allDuesTotal += amt;
    } else if (pType.includes('welfare') || pType.includes('development') || pType.includes('levy')) {
      welfareTotal += amt;
      welfareCount++;
      allDuesTotal += amt;
    }
  });

  setElText('duesSummaryMonthlyTotal', `₦${monthlyTotal.toLocaleString()}`);
  setElText('duesSummaryMonthlyCount', `${monthlyCount} payments cleared`);
  setElText('duesSummaryAnnualTotal', `₦${annualTotal.toLocaleString()}`);
  setElText('duesSummaryAnnualCount', `${annualCount} statutory dues cleared`);
  setElText('duesSummaryWelfareTotal', `₦${welfareTotal.toLocaleString()}`);
  setElText('duesSummaryWelfareCount', `${welfareCount} contributions recorded`);
  setElText('adminDuesTotalCollected', `₦${allDuesTotal.toLocaleString()}`);

  const cfg = (typeof DataStore !== 'undefined' && DataStore.getConfig) ? DataStore.getConfig() : null;
  if (cfg) {
    setElText('cfgDisplayMonthly', `₦${(cfg.monthlyDuesRate || 5000).toLocaleString()}`);
    setElText('cfgDisplayAnnual', `₦${(cfg.annualDuesRate || 25000).toLocaleString()}`);
  }

  if (!container) return;

  // 2. Filter for all dues streams
  const duesList = payments.filter(p => {
    const pType = (p.paymentType || '').toLowerCase();
    return pType.includes('dues') || pType.includes('levy') || pType.includes('welfare') || (p.selectedMonths && p.selectedMonths.length > 0);
  });

  if (duesList.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--slate-500); padding: 3rem 1.5rem;"><div style="font-weight: 600; color: var(--navy-900); font-size: 1rem; margin-bottom: 0.25rem;">No dues payments recorded yet</div><div style="font-size: 0.85rem;">When members pay dues online or via secretariat, records appear here immediately.</div></td></tr>`;
    return;
  }

  container.innerHTML = duesList.map(p => {
    const monthsStr = (p.selectedMonths && p.selectedMonths.length > 0)
      ? p.selectedMonths.join(', ')
      : (p.itemDescription || 'Statutory Session Dues');

    return `
      <tr>
        <td>
          <strong style="color: var(--navy-900); font-size: 0.92rem; display: block;">${escapeHtml(p.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--slate-500);">${escapeHtml(p.phone || p.email || 'N/A')}</div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; background: rgba(43, 87, 151, 0.08); color: var(--cic-blue-700); border: 1px solid rgba(43, 87, 151, 0.2); border-radius: 4px; font-size: 0.78rem; font-weight: 700;">
            ${escapeHtml(p.paymentType)}
          </span>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: var(--slate-700); font-weight: 600;">
            ${escapeHtml(monthsStr)}
          </span>
        </td>
        <td>
          <strong style="font-weight: 800; color: var(--navy-900); font-size: 0.98rem;">
            ₦${Number(p.amount || 0).toLocaleString()}
          </strong>
        </td>
        <td style="font-size: 0.8rem; color: var(--slate-600); white-space: nowrap;">
          ${escapeHtml(p.date || 'N/A')}
        </td>
        <td>
          <span class="status-badge successful" style="background: rgba(34, 197, 94, 0.12); color: #15803D; font-weight: 700;">
            ✓ Cleared
          </span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-sm btn-outline-blue" onclick="viewReceiptInAdmin('${p.reference}')" title="View Official Receipt" style="font-weight: 700; padding: 0.25rem 0.6rem; font-size: 0.75rem;">
            Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * ============================================================================
 * PAYMENT CATEGORIES & LEVIES CONTROLLER
 * Full administrative control suite to add, configure, adjust rates, and
 * toggle public portal visibility for all alumni dues, levies, and contributions.
 * ============================================================================
 */
let adminCategoryFilterType = 'ALL';
let adminCategorySearchQuery = '';

function renderAdminCategories() {
  const container = document.getElementById('adminCategoriesList');
  if (!container) return;

  const categories = DataStore.getCategories() || [];
  const payments = DataStore.getPayments() || [];

  // 1. Calculate KPI Metrics
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.active).length;
  const fixedCount = categories.filter(c => c.type === 'fixed' || c.type === 'monthly').length;
  const customCount = categories.filter(c => c.type === 'custom').length;

  // Calculate collections and payer counts mapped by category name or id
  const collectionsMap = {};
  const payersMap = {};
  let totalInflowAll = 0;

  payments.forEach(p => {
    const amt = Number(p.amount || 0);
    totalInflowAll += amt;
    const pType = (p.paymentType || '').toLowerCase().trim();
    const pDesc = (p.itemDescription || '').toLowerCase();
    const payerId = (p.email || p.phone || p.name || '').toLowerCase().trim();

    categories.forEach(cat => {
      const catName = (cat.name || '').toLowerCase().trim();
      const catId = (cat.id || '').toLowerCase().trim();
      if (pType === catName || pType.includes(catName) || pDesc.includes(catName) || pType.includes(catId)) {
        collectionsMap[cat.id] = (collectionsMap[cat.id] || 0) + amt;
        if (!payersMap[cat.id]) payersMap[cat.id] = new Set();
        if (payerId) payersMap[cat.id].add(payerId);
      }
    });
  });

  // Update KPI Cards
  setElText('catKpiActiveCount', activeCount.toString());
  setElText('catKpiTotalSub', `Out of ${totalCount} configured streams`);
  setElText('catKpiFixedCount', fixedCount.toString());
  setElText('catKpiCustomCount', customCount.toString());
  setElText('catKpiTotalCollected', '₦' + totalInflowAll.toLocaleString());
  setElText('catKpiTotalPayersSub', `Across ${payments.length} verified settlements`);
  setElText('sidebarCategoryActiveCount', `${activeCount} Active`);

  // 2. Filter Categories
  let filtered = categories.filter(cat => {
    if (adminCategoryFilterType === 'ACTIVE' && !cat.active) return false;
    if (adminCategoryFilterType === 'DISABLED' && cat.active) return false;
    if (adminCategoryFilterType === 'monthly' && cat.type !== 'monthly') return false;
    if (adminCategoryFilterType === 'fixed' && cat.type !== 'fixed') return false;
    if (adminCategoryFilterType === 'custom' && cat.type !== 'custom') return false;

    if (adminCategorySearchQuery) {
      const q = adminCategorySearchQuery.toLowerCase();
      const matchName = (cat.name || '').toLowerCase().includes(q);
      const matchId = (cat.id || '').toLowerCase().includes(q);
      const matchDesc = (cat.description || '').toLowerCase().includes(q);
      const matchAmount = String(cat.baseAmount || '').includes(q);
      if (!matchName && !matchId && !matchDesc && !matchAmount) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: var(--white); border: 2px dashed var(--slate-200); border-radius: var(--radius-xl); padding: 3rem 1.5rem; text-align: center;">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin-bottom: 1rem;"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
        <h4 style="font-family: var(--font-heading); color: var(--navy-900); margin-bottom: 0.5rem;">No Matching Payment Categories Found</h4>
        <p style="color: var(--slate-500); font-size: 0.9rem; margin-bottom: 1.25rem;">Try adjusting your filter or search query, or create a new assessment category.</p>
        <button type="button" class="btn btn-primary" onclick="openCategoryModal()">+ Add Payment Category</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(cat => {
    const isMonthly = cat.type === 'monthly';
    const isFixed = cat.type === 'fixed';
    const typeLabel = isMonthly ? 'Monthly Assessment' : (isFixed ? 'Fixed Statutory Fee' : 'Open Contribution');
    const typeClass = isMonthly ? 'monthly' : (isFixed ? 'fixed' : 'custom');
    const rateText = `₦${Number(cat.baseAmount || 0).toLocaleString()}${isMonthly ? ' / mo' : ''}`;
    const collected = collectionsMap[cat.id] || 0;
    const payersCount = payersMap[cat.id] ? payersMap[cat.id].size : 0;

    return `
      <div class="cat-controller-card ${cat.active ? '' : 'disabled'}" id="catCard_${cat.id}">
        <!-- Left: Icon & Details -->
        <div class="cat-card-left">
          <div class="cat-icon-box">
            ${getCategoryAdminIcon(cat.id, cat.type)}
          </div>
          <div class="cat-info-block">
            <div class="cat-title-row">
              <h4 class="cat-title-text" id="catTitle_${cat.id}">${escapeHtml(cat.name)}</h4>
              <span class="cat-code-tag">#${escapeHtml(cat.id)}</span>
              <span class="cat-type-pill ${typeClass}">
                ${typeLabel}
              </span>
            </div>
            <div class="cat-desc-text">
              ${escapeHtml(cat.description || 'Statutory association contribution item.')}
            </div>
            <div class="cat-meta-row">
              <span><strong>Total Collections:</strong> <span style="color: var(--emerald-600); font-weight: 700;">₦${collected.toLocaleString()}</span></span>
              <span>&bull;</span>
              <span><strong>Verified Payers:</strong> ${payersCount} Alumnus</span>
              <span>&bull;</span>
              <span><strong>Portal Visibility:</strong> ${cat.active ? '<span style="color: var(--emerald-600); font-weight: 600;">Visible to Public</span>' : '<span style="color: var(--slate-400); font-weight: 600;">Hidden</span>'}</span>
            </div>
          </div>
        </div>

        <!-- Right: Amount, Toggle & Actions -->
        <div class="cat-card-right">
          <div class="cat-amount-display">
            <div class="cat-amount-label">${isMonthly ? 'Monthly Unit Rate' : (isFixed ? 'Statutory Fee' : 'Default / Base')}</div>
            <div class="cat-amount-val">${rateText}</div>
          </div>

          <!-- Active/Disabled Toggle Switch -->
          <div class="cat-toggle-wrap">
            <label class="cat-toggle-switch">
              <input type="checkbox" ${cat.active ? 'checked' : ''} onchange="toggleCategoryStatus('${escapeHtml(cat.id)}')">
              <span class="cat-toggle-slider"></span>
            </label>
            <span class="cat-toggle-label ${cat.active ? 'active' : 'inactive'}">${cat.active ? 'Active' : 'Disabled'}</span>
          </div>

          <!-- Actions Group (Rename, Settings/Edit, Payers, Delete) -->
          <div class="cat-actions-group">
            <button type="button" class="cat-btn-action cat-btn-rename" title="Rename this dues stream" onclick="renameCategoryQuick('${escapeHtml(cat.id)}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              <span>Rename</span>
            </button>
            <button type="button" class="cat-btn-action cat-btn-edit" title="Edit full details & rates" onclick="openCategoryModal('${escapeHtml(cat.id)}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="cat-btn-action cat-btn-payers" title="View Payers in Ledger" onclick="viewCategoryPayersInLedger('${escapeHtml(cat.name)}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Payers</span>
            </button>
            <button type="button" class="cat-btn-action cat-btn-delete" title="Delete this dues stream" onclick="deleteCategory('${escapeHtml(cat.id)}')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryAdminIcon(catId, type) {
  if (type === 'monthly' || catId === 'monthly_dues') {
    return `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
  }
  if (catId.includes('annual') || catId.includes('membership')) {
    return `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  }
  if (catId.includes('development') || catId.includes('project') || catId.includes('building')) {
    return `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`;
  }
  if (catId.includes('welfare') || catId.includes('relief') || catId.includes('donation')) {
    return `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;
  }
  return `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`;
}

function filterAndRenderAdminCategories() {
  const searchInput = document.getElementById('adminCategorySearchInput');
  adminCategorySearchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  renderAdminCategories();
}

window.setCategoryFilter = function(filterType) {
  adminCategoryFilterType = filterType;
  const chipContainer = document.getElementById('categoryFilterChips');
  if (chipContainer) {
    chipContainer.querySelectorAll('.dues-chip-btn').forEach(btn => {
      if (btn.dataset.filter === filterType) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }
  renderAdminCategories();
};

window.toggleCategoryStatus = function(catIdOrIdx) {
  const cats = DataStore.getCategories();
  let cat = null;
  if (typeof catIdOrIdx === 'number') {
    cat = cats[catIdOrIdx];
  } else {
    cat = cats.find(c => c.id === catIdOrIdx || c.name === catIdOrIdx);
    if (!cat && !isNaN(catIdOrIdx)) cat = cats[Number(catIdOrIdx)];
  }

  if (cat) {
    cat.active = !cat.active;
    DataStore.saveCategories(cats);
    localStorage.setItem('haa_payment_pulse', Date.now().toString());
    localStorage.setItem('haa_categories_pulse', Date.now().toString());
    renderAdminCategories();
    renderDuesCategoryChips();
    if (typeof showReceiptToast === 'function') {
      showReceiptToast(`✓ Category "${cat.name}" is now ${cat.active ? 'Active (Visible on Portal)' : 'Disabled (Hidden)'}`, 'success');
    }
  }
};

window.openCategoryModal = function(catId) {
  const overlay = document.getElementById('categoryModalOverlay');
  const modalTitle = document.getElementById('categoryModalTitle');
  const form = document.getElementById('categoryControllerForm');
  const origIdInput = document.getElementById('catFormOriginalId');
  const nameInput = document.getElementById('catFormName');
  const idInput = document.getElementById('catFormId');
  const typeSelect = document.getElementById('catFormType');
  const amountInput = document.getElementById('catFormBaseAmount');
  const descInput = document.getElementById('catFormDescription');
  const activeInput = document.getElementById('catFormActive');

  if (!overlay) return;

  if (catId) {
    const cats = DataStore.getCategories();
    const cat = cats.find(c => c.id === catId);
    if (!cat) return;

    if (modalTitle) modalTitle.textContent = `Edit Payment Category: ${cat.name}`;
    if (origIdInput) origIdInput.value = cat.id;
    if (nameInput) nameInput.value = cat.name || '';
    if (idInput) {
      idInput.value = cat.id || '';
      idInput.readOnly = true;
      idInput.style.background = 'var(--slate-100)';
    }
    if (typeSelect) typeSelect.value = cat.type || 'fixed';
    if (amountInput) amountInput.value = cat.baseAmount || 0;
    if (descInput) descInput.value = cat.description || '';
    if (activeInput) activeInput.checked = !!cat.active;
  } else {
    if (modalTitle) modalTitle.textContent = 'Add New Payment Category';
    if (form) form.reset();
    if (origIdInput) origIdInput.value = '';
    if (idInput) {
      idInput.readOnly = false;
      idInput.style.background = 'var(--white)';
    }
    if (amountInput) amountInput.value = 10000;
    if (activeInput) activeInput.checked = true;
  }

  handleCatTypeChange(typeSelect ? typeSelect.value : 'fixed');
  overlay.classList.add('active');
  if (nameInput) nameInput.focus();
};

window.closeCategoryModal = function() {
  const overlay = document.getElementById('categoryModalOverlay');
  if (overlay) overlay.classList.remove('active');
};

window.autoGenerateCategorySlug = function(nameVal) {
  const origId = document.getElementById('catFormOriginalId');
  if (origId && origId.value) return; // Editing existing, don't change slug

  const idInput = document.getElementById('catFormId');
  if (idInput && nameVal) {
    const slug = nameVal.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    idInput.value = slug;
  }
};

window.handleCatTypeChange = function(type) {
  const label = document.getElementById('catFormAmountLabel');
  if (!label) return;
  if (type === 'monthly') {
    label.innerHTML = `Monthly Assessment Rate (₦ / Month) <span style="color: red;">*</span>`;
  } else if (type === 'fixed') {
    label.innerHTML = `Approved Statutory Fee (₦) <span style="color: red;">*</span>`;
  } else {
    label.innerHTML = `Default / Minimum Contribution (₦) <span style="color: red;">*</span>`;
  }
};

window.saveCategoryForm = function(event) {
  if (event) event.preventDefault();

  const origId = (document.getElementById('catFormOriginalId').value || '').trim();
  const name = (document.getElementById('catFormName').value || '').trim();
  let id = (document.getElementById('catFormId').value || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const type = document.getElementById('catFormType').value;
  const baseAmount = Number(document.getElementById('catFormBaseAmount').value || 0);
  const description = (document.getElementById('catFormDescription').value || '').trim();
  const active = document.getElementById('catFormActive').checked;

  if (!name) {
    alert('Please enter a category title.');
    return;
  }
  if (!id) {
    id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  }

  const cats = DataStore.getCategories();

  if (origId) {
    // Updating existing
    const existingIdx = cats.findIndex(c => c.id === origId);
    if (existingIdx !== -1) {
      const oldName = cats[existingIdx].name;
      cats[existingIdx] = {
        ...cats[existingIdx],
        name,
        type,
        baseAmount,
        description,
        active
      };

      // Keep historical payment types linked if name changed
      if (oldName && oldName !== name) {
        const payments = DataStore.getPayments();
        let changed = false;
        payments.forEach(p => {
          if (p.paymentType === oldName) {
            p.paymentType = name;
            changed = true;
          }
        });
        if (changed) {
          DataStore.set(STORAGE_KEYS.PAYMENTS, payments);
        }
      }
    }
  } else {
    // Check if ID collision
    let finalId = id;
    let counter = 1;
    while (cats.some(c => c.id === finalId)) {
      finalId = `${id}_${counter++}`;
    }

    cats.push({
      id: finalId,
      name,
      type,
      baseAmount,
      description,
      active
    });
  }

  DataStore.saveCategories(cats);
  localStorage.setItem('haa_payment_pulse', Date.now().toString());
  localStorage.setItem('haa_categories_pulse', Date.now().toString());

  closeCategoryModal();
  renderAdminCategories();
  renderDuesCategoryChips();
  if (typeof filterAndRenderPaymentsTable === 'function') filterAndRenderPaymentsTable();

  // If this was Monthly Dues, update config rate as well
  if (origId === 'monthly_dues' || id === 'monthly_dues') {
    const config = DataStore.getConfig();
    config.monthlyDuesRate = baseAmount;
    DataStore.saveConfig(config);
  }

  if (typeof showReceiptToast === 'function') {
    showReceiptToast(`✓ Dues item "${name}" updated successfully!`, 'success');
  }
};

/**
 * 1-Click Fast Rename for any Dues Stream
 */
window.renameCategoryQuick = function(catId) {
  const cats = DataStore.getCategories();
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;

  const newName = prompt(`Enter new title for "${cat.name}":`, cat.name);
  if (!newName || !newName.trim() || newName.trim() === cat.name) return;

  const cleanName = newName.trim();
  const oldName = cat.name;
  cat.name = cleanName;

  // Seamlessly update historical payment records so stats and ledger filters stay linked
  const payments = DataStore.getPayments();
  let changed = false;
  payments.forEach(p => {
    if (p.paymentType === oldName) {
      p.paymentType = cleanName;
      changed = true;
    }
  });
  if (changed) {
    DataStore.set(STORAGE_KEYS.PAYMENTS, payments);
  }

  DataStore.saveCategories(cats);
  localStorage.setItem('haa_payment_pulse', Date.now().toString());
  localStorage.setItem('haa_categories_pulse', Date.now().toString());

  renderAdminCategories();
  renderDuesCategoryChips();
  if (typeof filterAndRenderPaymentsTable === 'function') filterAndRenderPaymentsTable();

  if (typeof showReceiptToast === 'function') {
    showReceiptToast(`✓ Successfully renamed "${oldName}" to "${cleanName}"!`, 'success');
  }
};

/**
 * Unrestricted Delete for ANY Dues item
 */
window.deleteCategory = function(catId) {
  const cats = DataStore.getCategories();
  const cat = cats.find(c => c.id === catId);
  if (!cat) return;

  const confirmMsg = `Are you sure you want to delete "${cat.name}"?\n\nThis will remove it completely from the payment portal and admin manager.\n(You can restore the 10 standard association dues anytime using "Restore Standard Dues").`;
  if (confirm(confirmMsg)) {
    const updated = cats.filter(c => c.id !== catId);
    DataStore.saveCategories(updated);
    localStorage.setItem('haa_payment_pulse', Date.now().toString());
    localStorage.setItem('haa_categories_pulse', Date.now().toString());
    renderAdminCategories();
    renderDuesCategoryChips();
    if (typeof showReceiptToast === 'function') {
      showReceiptToast(`✓ Dues stream "${cat.name}" deleted successfully.`, 'success');
    }
  }
};

window.viewCategoryPayersInLedger = function(catName) {
  // 1. Switch to Payments tab
  if (typeof switchAdminPane === 'function') {
    switchAdminPane('adminPane_Payments');
  }

  // 2. Select category chip or set search
  setTimeout(() => {
    if (typeof setLedgerCategoryChip === 'function') {
      setLedgerCategoryChip(catName);
    } else {
      const searchInput = document.getElementById('adminPaymentsSearch');
      if (searchInput) {
        searchInput.value = catName;
        if (typeof filterAndRenderPaymentsTable === 'function') filterAndRenderPaymentsTable();
      }
    }
  }, 100);
};

window.resetDefaultCategories = function() {
  if (confirm('Are you sure you want to reset all payment categories to the association standard defaults?\n\nCustom categories will be replaced with the 10 approved general assembly dues streams.')) {
    DataStore.resetCategories();
    localStorage.setItem('haa_payment_pulse', Date.now().toString());
    localStorage.setItem('haa_categories_pulse', Date.now().toString());
    renderAdminCategories();
    renderDuesCategoryChips();
    if (typeof showReceiptToast === 'function') {
      showReceiptToast('✓ Payment categories successfully reset to association standard dues.', 'success');
    }
  }
};

/**
 * ============================================================================
 * Admin Events Scheduling & Ingestion Management Suite
 * ============================================================================
 */

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

window.handleQuickEventFile = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type || !file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, JPEG, WebP).');
    return;
  }

  const dataUrlHidden = document.getElementById('quickEventDataUrl');
  const previewBox = document.getElementById('quickEventPreviewBox');
  const previewImg = document.getElementById('quickEventPreviewImg');
  const previewName = document.getElementById('quickEventPreviewName');
  const urlInput = document.getElementById('quickEventImageUrl');

  if (previewName) previewName.textContent = 'Optimizing image...';
  if (previewBox) previewBox.style.display = 'flex';

  window.optimizeImageFile(file).then(dataUrl => {
    if (dataUrlHidden) dataUrlHidden.value = dataUrl;
    if (previewImg) previewImg.src = dataUrl;
    const estKb = Math.round(dataUrl.length * 0.75 / 1024);
    if (previewName) previewName.textContent = `${file.name} (Ready: ~${estKb} KB)`;
    if (urlInput) urlInput.value = 'Custom Uploaded Photo (' + file.name + ')';
  }).catch(err => {
    console.error('Error optimizing event photo:', err);
    alert('Could not process photo file.');
  });
};

window.clearQuickEventPreview = function() {
  const fileInput = document.getElementById('quickEventImageFile');
  const dataUrlHidden = document.getElementById('quickEventDataUrl');
  const previewBox = document.getElementById('quickEventPreviewBox');
  const previewImg = document.getElementById('quickEventPreviewImg');

  if (fileInput) fileInput.value = '';
  if (dataUrlHidden) dataUrlHidden.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
};

window.focusEventUpload = function() {
  const titleInput = document.getElementById('quickEventTitle');
  if (titleInput) {
    titleInput.focus();
    titleInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.handleQuickEventUpload = function(event) {
  event.preventDefault();

  const editId = (document.getElementById('eventEditId')?.value || '').trim();
  const title = (document.getElementById('quickEventTitle')?.value || '').trim();
  const category = document.getElementById('quickEventCategory')?.value || 'Reunions';
  const date = (document.getElementById('quickEventDate')?.value || '').trim();
  const time = (document.getElementById('quickEventTime')?.value || '').trim() || '10:00 AM Prompt';
  const location = (document.getElementById('quickEventVenue')?.value || '').trim();
  const fee = parseInt(document.getElementById('quickEventFee')?.value || '0', 10) || 0;
  const dataUrl = (document.getElementById('quickEventDataUrl')?.value || '').trim();
  const directUrl = (document.getElementById('quickEventImageUrl')?.value || '').trim();
  const image = dataUrl || directUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80';
  const featured = !!document.getElementById('quickEventFeatured')?.checked;
  const description = (document.getElementById('quickEventDesc')?.value || '').trim();

  if (!title || !date || !location || !description) {
    alert('Please fill in all required fields: Title, Date, Venue, and Description.');
    return;
  }

  const displayDate = formatDisplayDate(date);

  if (editId) {
    // Update existing event
    const updated = DataStore.updateEvent({
      id: editId,
      title,
      category,
      date,
      displayDate,
      time,
      location,
      fee,
      image,
      featured,
      description,
      status: 'upcoming'
    });

    if (updated) {
      alert(`✓ Event "${title}" successfully updated!`);
    }
  } else {
    // Add new event
    const newEvent = {
      id: 'evt-' + Date.now(),
      title,
      category,
      date,
      displayDate,
      time,
      location,
      fee,
      image,
      featured,
      description,
      status: 'upcoming'
    };

    DataStore.addEvent(newEvent);
    alert(`✓ Event "${title}" successfully scheduled and published live!`);
  }

  cancelQuickEventEdit();
  renderAdminEvents();

  if (typeof renderEvents === 'function') {
    renderEvents();
  }
};

window.editAdminEvent = function(id) {
  const item = DataStore.findEventById(id);
  if (!item) {
    alert('Event not found.');
    return;
  }

  const editIdInput = document.getElementById('eventEditId');
  const titleInput = document.getElementById('quickEventTitle');
  const catSelect = document.getElementById('quickEventCategory');
  const dateInput = document.getElementById('quickEventDate');
  const timeInput = document.getElementById('quickEventTime');
  const venueInput = document.getElementById('quickEventVenue');
  const feeInput = document.getElementById('quickEventFee');
  const urlInput = document.getElementById('quickEventImageUrl');
  const dataUrlHidden = document.getElementById('quickEventDataUrl');
  const featuredCheck = document.getElementById('quickEventFeatured');
  const descInput = document.getElementById('quickEventDesc');
  const formTitle = document.getElementById('quickEventFormTitle');
  const btnSubmit = document.getElementById('btnSubmitQuickEvent');
  const btnCancel = document.getElementById('btnCancelEventEdit');

  if (editIdInput) editIdInput.value = item.id;
  if (titleInput) titleInput.value = item.title || '';
  if (catSelect) catSelect.value = item.category || 'Reunions';
  if (dateInput) dateInput.value = item.date || '';
  if (timeInput) timeInput.value = item.time || '';
  if (venueInput) venueInput.value = item.location || '';
  if (feeInput) feeInput.value = item.fee !== undefined ? item.fee : 0;
  if (dataUrlHidden) dataUrlHidden.value = item.image || '';
  if (urlInput) urlInput.value = item.image || '';
  if (featuredCheck) featuredCheck.checked = !!item.featured;
  if (descInput) descInput.value = item.description || '';

  // Show preview if image exists
  const previewBox = document.getElementById('quickEventPreviewBox');
  const previewImg = document.getElementById('quickEventPreviewImg');
  const previewName = document.getElementById('quickEventPreviewName');
  if (item.image && previewBox && previewImg) {
    previewImg.src = item.image;
    if (previewName) previewName.textContent = item.title || 'Event Banner';
    previewBox.style.display = 'flex';
  }

  if (formTitle) formTitle.textContent = `Edit Scheduled Event: "${item.title}"`;
  if (btnSubmit) {
    btnSubmit.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      <span>Save Changes &amp; Update Event</span>
    `;
  }
  if (btnCancel) btnCancel.style.display = 'inline-block';

  if (titleInput) {
    titleInput.focus();
    titleInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.cancelQuickEventEdit = function() {
  const form = document.getElementById('quickEventUploadForm');
  const editIdInput = document.getElementById('eventEditId');
  const formTitle = document.getElementById('quickEventFormTitle');
  const btnSubmit = document.getElementById('btnSubmitQuickEvent');
  const btnCancel = document.getElementById('btnCancelEventEdit');

  if (form) form.reset();
  if (editIdInput) editIdInput.value = '';
  clearQuickEventPreview();

  if (formTitle) formTitle.textContent = 'Upload New Event & Information';
  if (btnSubmit) {
    btnSubmit.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
      <span>Upload Event &amp; Information</span>
    `;
  }
  if (btnCancel) btnCancel.style.display = 'none';
};

window.deleteAdminEvent = function(id) {
  const item = DataStore.findEventById(id);
  const title = item ? item.title : 'this event';

  if (confirm(`Are you sure you want to permanently delete event "${title}"?\n\nThis will remove it immediately from both the administrative console and the public website.`)) {
    DataStore.deleteEventById(id);

    const editIdInput = document.getElementById('eventEditId');
    if (editIdInput && editIdInput.value === id) {
      cancelQuickEventEdit();
    }

    renderAdminEvents();

    if (typeof renderEvents === 'function') {
      renderEvents();
    }

    alert(`✓ Event "${title}" has been deleted.`);
  }
};

window.deleteEvent = function(idx) {
  const events = DataStore.getEvents();
  if (events && events[idx]) {
    deleteAdminEvent(events[idx].id);
  }
};

function renderAdminEvents() {
  const container = document.getElementById('adminEventsList');
  if (!container) return;

  const searchVal = (document.getElementById('adminSearchEvents')?.value || '').trim().toLowerCase();
  let events = DataStore.getEvents();

  if (searchVal) {
    events = events.filter(e =>
      (e.title && e.title.toLowerCase().includes(searchVal)) ||
      (e.location && e.location.toLowerCase().includes(searchVal)) ||
      (e.category && e.category.toLowerCase().includes(searchVal)) ||
      (e.description && e.description.toLowerCase().includes(searchVal))
    );
  }

  if (events.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--white); border: 1.5px dashed var(--slate-300); border-radius: var(--radius-xl);">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--slate-100); color: var(--slate-400); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
          <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h4 style="color: var(--navy-900); font-weight: 700; margin-bottom: 0.25rem;">No Events Scheduled</h4>
        <p style="color: var(--slate-500); font-size: 0.88rem; max-width: 420px; margin: 0 auto 1.25rem;">
          ${searchVal ? 'No events match your active search keyword.' : 'Use the upload section above to schedule your first alumni event or reunion.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = events.map(evt => `
    <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;" class="admin-event-card-item">
      <div style="position: relative; height: 160px; background: #0f172a; overflow: hidden;">
        <img src="${evt.image || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(evt.title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/campus.jpg'">
        <div style="position: absolute; top: 10px; left: 10px; display: flex; gap: 0.4rem; flex-wrap: wrap;">
          <span style="background: rgba(15, 23, 42, 0.85); color: #fff; backdrop-filter: blur(4px); font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px; text-transform: uppercase;">
            ${escapeHtml(evt.category || 'Event')}
          </span>
          ${evt.featured ? '<span style="background: rgba(245, 158, 11, 0.9); color: #fff; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px;">★ Featured</span>' : ''}
        </div>
        <div style="position: absolute; bottom: 10px; right: 10px;">
          <span style="background: ${evt.fee > 0 ? 'var(--emerald-600)' : 'var(--cic-blue-600)'}; color: #fff; font-size: 0.78rem; font-weight: 800; padding: 0.25rem 0.65rem; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            ${evt.fee > 0 ? '₦' + evt.fee.toLocaleString() : 'FREE ADMISSION'}
          </span>
        </div>
      </div>
      <div style="padding: 1.15rem; display: flex; flex-direction: column; flex: 1;">
        <h4 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; line-height: 1.35;">
          ${escapeHtml(evt.title)}
        </h4>
        <div style="font-size: 0.78rem; color: var(--slate-600); margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span>📅</span>
            <strong>${escapeHtml(evt.displayDate || evt.date)}</strong>
            <span style="color: var(--slate-400);">&bull;</span>
            <span>${escapeHtml(evt.time || '10:00 AM')}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <span>📍</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(evt.location || 'College Campus')}</span>
          </div>
        </div>
        <p style="font-size: 0.83rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.45; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(evt.description || '')}
        </p>
        <div style="display: flex; gap: 0.5rem; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 0.75rem;">
          <button type="button" class="btn btn-sm btn-outline-light" onclick="editAdminEvent('${evt.id}')" style="font-size: 0.76rem; padding: 0.25rem 0.65rem; color: var(--slate-700); border-color: var(--slate-300); font-weight: 600;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Event
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="deleteAdminEvent('${evt.id}')" style="font-size: 0.76rem; padding: 0.25rem 0.65rem; color: var(--danger); border-color: rgba(220, 38, 38, 0.3); font-weight: 600; margin-left: auto;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.renderAdminEvents = renderAdminEvents;

/**
 * ============================================================================
 * ADMIN DEVELOPMENTAL PROJECTS & INITIATIVES MANAGEMENT SUITE
 * ============================================================================
 */

let projectStudioInitialized = false;

/**
 * Format currency with Naira symbol
 */
function formatNairaDisplay(amount) {
  const num = Number(amount) || 0;
  return '₦' + num.toLocaleString('en-NG');
}

/**
 * Initialize Project Creation & Edit Studio
 */
function initAdminProjectsStudio() {
  const form = document.getElementById('adminCreateProjectForm');
  if (!form) return;

  const titleInput = document.getElementById('newProjectTitle');
  const catSelect = document.getElementById('newProjectCategory');
  const statusSelect = document.getElementById('newProjectStatus');
  const targetInput = document.getElementById('newProjectTarget');
  const raisedInput = document.getElementById('newProjectInitialRaised');
  const donorsInput = document.getElementById('newProjectDonors');
  const imageInput = document.getElementById('newProjectImage');
  const descInput = document.getElementById('newProjectDescription');
  const searchInput = document.getElementById('adminSearchProjects');
  const catFilter = document.getElementById('adminProjectCategoryFilter');
  const statusFilter = document.getElementById('adminProjectStatusFilter');

  // Bind live filters once
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderAdminProjects());
  }
  if (catFilter && !catFilter.dataset.bound) {
    catFilter.dataset.bound = 'true';
    catFilter.addEventListener('change', () => renderAdminProjects());
  }
  if (statusFilter && !statusFilter.dataset.bound) {
    statusFilter.dataset.bound = 'true';
    statusFilter.addEventListener('change', () => renderAdminProjects());
  }

  // Update live preview function
  function updateLivePreview() {
    const title = titleInput ? titleInput.value.trim() : '';
    const category = catSelect ? catSelect.value : 'Infrastructure';
    const status = statusSelect ? statusSelect.value : 'active';
    const target = targetInput ? (Number(targetInput.value) || 0) : 0;
    const raised = raisedInput ? (Number(raisedInput.value) || 0) : 0;
    const donors = donorsInput ? (Number(donorsInput.value) || 0) : 0;
    const image = imageInput && imageInput.value.trim() ? imageInput.value.trim() : 'images/campus.jpg';
    const desc = descInput ? descInput.value.trim() : '';

    const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

    // Update hints
    const targetHint = document.getElementById('newProjectTargetHint');
    if (targetHint) targetHint.textContent = `Formatted: ${formatNairaDisplay(target)}`;
    const raisedHint = document.getElementById('newProjectRaisedHint');
    if (raisedHint) raisedHint.textContent = `Formatted: ${formatNairaDisplay(raised)}`;

    // Update Preview Elements
    const pTitle = document.getElementById('previewProjectTitle');
    if (pTitle) pTitle.textContent = title || 'CIC 1995 Ultra-Modern Science & STEM Lab';

    const pCat = document.getElementById('previewProjectCategory');
    if (pCat) pCat.textContent = category;

    const pStatus = document.getElementById('previewProjectStatusBadge');
    if (pStatus) {
      if (status === 'active') {
        pStatus.textContent = 'Active';
        pStatus.style.background = 'rgba(16, 185, 129, 0.15)';
        pStatus.style.color = '#047857';
      } else if (status === 'completed') {
        pStatus.textContent = 'Completed';
        pStatus.style.background = 'rgba(59, 130, 246, 0.15)';
        pStatus.style.color = '#1d4ed8';
      } else {
        pStatus.textContent = 'Paused';
        pStatus.style.background = 'rgba(245, 158, 11, 0.15)';
        pStatus.style.color = '#b45309';
      }
    }

    const pImg = document.getElementById('previewProjectImg');
    if (pImg) pImg.src = image;

    const pDesc = document.getElementById('previewProjectDesc');
    if (pDesc) {
      pDesc.textContent = desc || 'Describe the objectives, beneficiary students or school community, and expected milestones for this project...';
    }

    const pRaised = document.getElementById('previewProjectRaised');
    if (pRaised) pRaised.textContent = formatNairaDisplay(raised);

    const pTarget = document.getElementById('previewProjectTarget');
    if (pTarget) pTarget.textContent = `Goal: ${formatNairaDisplay(target)}`;

    const pBar = document.getElementById('previewProjectBar');
    if (pBar) pBar.style.width = `${percent}%`;

    const pDonors = document.getElementById('previewProjectDonorsStat');
    if (pDonors) {
      pDonors.innerHTML = `<strong>${percent}% funded</strong> &bull; ${donors} generous alumni contributors`;
    }
  }

  // Bind live preview listeners once
  const previewInputs = [titleInput, catSelect, statusSelect, targetInput, raisedInput, donorsInput, imageInput, descInput];
  previewInputs.forEach(input => {
    if (input && !input.dataset.boundPreview) {
      input.dataset.boundPreview = 'true';
      input.addEventListener('input', updateLivePreview);
      input.addEventListener('change', updateLivePreview);
    }
  });

  // Helper for human-readable file sizes
  function formatUploadFileSize(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Core file upload processor
  window.processProjectImageFile = function(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, or GIF).');
      return;
    }

    const nameEl = document.getElementById('projectUploadFileName');
    const statusEl = document.getElementById('projectUploadStatusText');
    if (statusEl) statusEl.textContent = 'Optimizing image...';

    window.optimizeImageFile(file).then(dataUrl => {
      const imgInput = document.getElementById('newProjectImage');
      if (imgInput) imgInput.value = dataUrl;

      const thumb = document.getElementById('projectUploadThumb');
      if (thumb) thumb.src = dataUrl;

      const estKb = Math.round(dataUrl.length * 0.75 / 1024);
      if (nameEl) nameEl.textContent = `${file.name} (~${estKb} KB)`;

      if (statusEl) {
        statusEl.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> Ready to Save (~${estKb} KB)`;
      }

      updateLivePreview();
    }).catch(err => {
      console.error('Error optimizing project image:', err);
      alert('Could not process project image.');
    });
  };

  // Browse files trigger
  window.triggerProjectImageBrowse = function() {
    const fileInput = document.getElementById('projectImageFileInput');
    if (fileInput) fileInput.click();
  };

  // File input change handler
  window.handleProjectImageUpload = function(event) {
    const file = event.target && event.target.files ? event.target.files[0] : null;
    if (file) {
      window.processProjectImageFile(file);
    }
  };

  // Remove uploaded image & reset to default
  window.removeProjectUploadedImage = function() {
    const imgInput = document.getElementById('newProjectImage');
    if (imgInput) imgInput.value = 'images/campus.jpg';

    const fileInput = document.getElementById('projectImageFileInput');
    if (fileInput) fileInput.value = '';

    const thumb = document.getElementById('projectUploadThumb');
    if (thumb) thumb.src = 'images/campus.jpg';

    const nameEl = document.getElementById('projectUploadFileName');
    if (nameEl) nameEl.textContent = 'campus.jpg (Default Banner)';

    const statusEl = document.getElementById('projectUploadStatusText');
    if (statusEl) {
      statusEl.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> Ready for publishing`;
    }

    updateLivePreview();
  };

  // Toggle optional URL override
  window.toggleProjectUrlInput = function() {
    const grp = document.getElementById('projectUrlOverrideGroup');
    const btn = document.getElementById('toggleProjectUrlBtn');
    if (!grp) return;
    if (grp.style.display === 'none' || !grp.style.display) {
      grp.style.display = 'block';
      if (btn) btn.textContent = 'Hide URL box';
      const input = document.getElementById('projectUrlOverrideInput');
      if (input) input.focus();
    } else {
      grp.style.display = 'none';
      if (btn) btn.textContent = 'Or paste image URL';
    }
  };

  // Apply custom URL override
  window.applyProjectUrlOverride = function() {
    const input = document.getElementById('projectUrlOverrideInput');
    if (!input || !input.value.trim()) {
      alert('Please enter a valid image URL.');
      return;
    }
    const url = input.value.trim();
    const imgInput = document.getElementById('newProjectImage');
    if (imgInput) imgInput.value = url;

    const thumb = document.getElementById('projectUploadThumb');
    if (thumb) thumb.src = url;

    const nameEl = document.getElementById('projectUploadFileName');
    if (nameEl) nameEl.textContent = url.slice(0, 35) + (url.length > 35 ? '...' : '');

    const statusEl = document.getElementById('projectUploadStatusText');
    if (statusEl) {
      statusEl.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> External URL applied`;
    }

    updateLivePreview();
  };

  // Dropzone drag-and-drop bindings
  const dropzone = document.getElementById('projectUploadDropzone');
  if (dropzone && !dropzone.dataset.boundDrop) {
    dropzone.dataset.boundDrop = 'true';
    ['dragenter', 'dragover'].forEach(evtName => {
      dropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evtName => {
      dropzone.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        window.processProjectImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Clear all projects helper for full admin control
  window.clearAllAdminProjects = function() {
    const count = DataStore.getProjects().length;
    if (count === 0) {
      alert('There are currently no projects in the directory.');
      return;
    }

    if (confirm(`ADMIN CONFIRMATION:\n\nAre you sure you want to permanently clear all ${count} project(s) from the portal?\n\nThis will give you a clean slate to create and control brand-new initiatives.`)) {
      DataStore.clearAllProjects();
      renderAdminProjects();
      loadAdminDashboardData();
      if (typeof renderProjects === 'function') {
        renderProjects();
      }
      alert('All projects have been cleared. The admin now has full control to create and publish new initiatives.');
    }
  };

  // Bind preset helper globally for backwards compatibility
  window.setProjectStudioImage = function(url) {
    if (imageInput) {
      imageInput.value = url;
      const thumb = document.getElementById('projectUploadThumb');
      if (thumb) thumb.src = url;
      updateLivePreview();
    }
  };

  // Bind form submission once
  if (!form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = (document.getElementById('editProjectId')?.value || '').trim();
      const title = titleInput.value.trim();
      const category = catSelect.value;
      const status = statusSelect.value;
      const target = Number(targetInput.value);
      const raised = Number(raisedInput.value) || 0;
      const donors = Number(donorsInput.value) || 0;
      const image = (imageInput.value || 'images/campus.jpg').trim();
      const description = descInput.value.trim();

      if (!title || !target || !description) {
        alert('Please fill in all required fields (Title, Target Goal, and Description).');
        return;
      }

      if (target <= 0) {
        alert('Funding Target Goal must be greater than zero.');
        return;
      }

      if (editId) {
        // UPDATE EXISTING PROJECT
        const existing = DataStore.findProjectById(editId);
        const updatedProject = {
          id: editId,
          title: title,
          category: category,
          status: status,
          targetAmount: target,
          raisedAmount: raised,
          donorCount: donors,
          image: image,
          description: description
        };

        DataStore.updateProject(updatedProject);
        alert(`Success! Project "${title}" has been updated.`);
      } else {
        // CREATE BRAND NEW PROJECT
        const newProject = {
          id: 'prj-' + Date.now(),
          title: title,
          category: category,
          status: status,
          targetAmount: target,
          raisedAmount: raised,
          donorCount: donors,
          image: image,
          description: description
        };

        DataStore.addProject(newProject);
        alert(`Congratulations! Project "${title}" has been created and published live on the alumni portal!`);
      }

      // Reset form & studio state
      resetProjectStudioForm();

      // Return to projects directory
      switchToProjectsTab();

      // Synchronize overall dashboard metrics & public view if available
      loadAdminDashboardData();
      if (typeof renderProjects === 'function') {
        renderProjects();
      }
    });
  }

  // Trigger initial preview calculation
  updateLivePreview();
  projectStudioInitialized = true;
}

/**
 * Reset Project Studio Form
 */
window.resetProjectStudioForm = function() {
  const form = document.getElementById('adminCreateProjectForm');
  if (form) form.reset();

  const editIdInput = document.getElementById('editProjectId');
  if (editIdInput) editIdInput.value = '';

  const headerTitle = document.getElementById('projectStudioHeaderTitle');
  if (headerTitle) headerTitle.textContent = 'Create New Developmental Project';

  const headerDesc = document.getElementById('projectStudioHeaderDesc');
  if (headerDesc) {
    headerDesc.textContent = 'Design and publish a new alumni fundraising goal or infrastructure project. Changes synchronize immediately across the live portal.';
  }

  const submitBtnText = document.getElementById('btnSubmitProjectText');
  if (submitBtnText) submitBtnText.textContent = 'Create & Publish Project';

  const imageInput = document.getElementById('newProjectImage');
  if (imageInput) imageInput.value = 'images/campus.jpg';

  const fileInput = document.getElementById('projectImageFileInput');
  if (fileInput) fileInput.value = '';

  const uploadThumb = document.getElementById('projectUploadThumb');
  if (uploadThumb) uploadThumb.src = 'images/campus.jpg';

  const uploadFileName = document.getElementById('projectUploadFileName');
  if (uploadFileName) uploadFileName.textContent = 'campus.jpg (Default Banner)';

  const uploadStatus = document.getElementById('projectUploadStatusText');
  if (uploadStatus) {
    uploadStatus.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> Ready for publishing';
  }

  const urlOverrideGroup = document.getElementById('projectUrlOverrideGroup');
  if (urlOverrideGroup) urlOverrideGroup.style.display = 'none';

  const urlOverrideBtn = document.getElementById('toggleProjectUrlBtn');
  if (urlOverrideBtn) urlOverrideBtn.textContent = 'Or paste image URL';

  const urlOverrideInput = document.getElementById('projectUrlOverrideInput');
  if (urlOverrideInput) urlOverrideInput.value = '';

  const targetInput = document.getElementById('newProjectTarget');
  if (targetInput) targetInput.value = '25000000';

  const raisedInput = document.getElementById('newProjectInitialRaised');
  if (raisedInput) raisedInput.value = '0';

  const donorsInput = document.getElementById('newProjectDonors');
  if (donorsInput) donorsInput.value = '0';

  const catSelect = document.getElementById('newProjectCategory');
  if (catSelect) catSelect.value = 'Infrastructure';

  const statusSelect = document.getElementById('newProjectStatus');
  if (statusSelect) statusSelect.value = 'active';

  // Trigger live preview refresh
  const titleInput = document.getElementById('newProjectTitle');
  if (titleInput) {
    titleInput.dispatchEvent(new Event('input'));
  }
};

/**
 * Cancel Project Edit and Return
 */
window.cancelProjectEdit = function() {
  resetProjectStudioForm();
  switchToProjectsTab();
};

/**
 * Render Admin Projects List with KPI Cards and Action Toolbars
 */
function renderAdminProjects() {
  const container = document.getElementById('adminProjectsList');
  if (!container) return;

  const projects = DataStore.getProjects();

  // 1. Calculate and update KPI Cards
  let totalRaised = 0;
  let totalGoal = 0;
  let totalDonors = 0;

  projects.forEach(p => {
    totalRaised += (Number(p.raisedAmount) || 0);
    totalGoal += (Number(p.targetAmount) || 0);
    totalDonors += (Number(p.donorCount) || 0);
  });

  const overallPercent = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;

  const kpiRaised = document.getElementById('adminProjectTotalRaised');
  if (kpiRaised) kpiRaised.textContent = formatNairaDisplay(totalRaised);

  const kpiGoal = document.getElementById('adminProjectTotalGoal');
  if (kpiGoal) kpiGoal.textContent = formatNairaDisplay(totalGoal);

  const kpiPercent = document.getElementById('adminProjectOverallPercent');
  if (kpiPercent) kpiPercent.textContent = `${overallPercent}%`;

  const kpiDonors = document.getElementById('adminProjectTotalDonors');
  if (kpiDonors) kpiDonors.textContent = totalDonors.toLocaleString();

  // 2. Filter list according to search & dropdowns
  const searchInput = document.getElementById('adminSearchProjects');
  const catFilter = document.getElementById('adminProjectCategoryFilter');
  const statusFilter = document.getElementById('adminProjectStatusFilter');

  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const selectedCat = catFilter ? catFilter.value : 'ALL';
  const selectedStatus = statusFilter ? statusFilter.value : 'ALL';

  const filtered = projects.filter(prj => {
    const matchCat = selectedCat === 'ALL' || (prj.category && prj.category.toLowerCase() === selectedCat.toLowerCase());
    const matchStatus = selectedStatus === 'ALL' || ((prj.status || 'active').toLowerCase() === selectedStatus.toLowerCase());
    const matchQuery = !query ||
      (prj.title && prj.title.toLowerCase().includes(query)) ||
      (prj.description && prj.description.toLowerCase().includes(query)) ||
      (prj.category && prj.category.toLowerCase().includes(query));

    return matchCat && matchStatus && matchQuery;
  });

  // 3. Render Empty State
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3.5rem 1.5rem; background: var(--white); border-radius: var(--radius-xl); border: 2px dashed var(--slate-300); box-shadow: var(--shadow-sm);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--cic-blue-50); color: var(--cic-blue-600); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        </div>
        <h4 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.25rem; margin-bottom: 0.5rem;">No Projects Found</h4>
        <p style="color: var(--slate-600); max-width: 440px; margin: 0 auto 1.5rem auto; font-size: 0.9rem;">
          ${query || selectedCat !== 'ALL' || selectedStatus !== 'ALL' ? 'No projects match your active search filter. Try clearing filters or creating a new campaign.' : 'No developmental projects have been created yet. Launch your first project to start tracking donations.'}
        </p>
        <button class="btn btn-primary" onclick="switchToCreateProjectTab()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          + Create New Project
        </button>
      </div>
    `;
    return;
  }

  // 4. Render Project Cards
  container.innerHTML = filtered.map(prj => {
    const percent = prj.targetAmount > 0 ? Math.min(100, Math.round((prj.raisedAmount / prj.targetAmount) * 100)) : 0;
    const status = (prj.status || 'active').toLowerCase();

    let statusBadgeHtml = '';
    if (status === 'completed') {
      statusBadgeHtml = `<span class="status-badge successful" style="background: rgba(59, 130, 246, 0.15); color: #1d4ed8; font-weight: 700;">Completed</span>`;
    } else if (status === 'paused') {
      statusBadgeHtml = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.15); color: #b45309; font-weight: 700;">Paused</span>`;
    } else {
      statusBadgeHtml = `<span class="status-badge successful" style="font-weight: 700;">Active Campaign</span>`;
    }

    return `
      <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 1.25rem; display: flex; gap: 1.5rem; align-items: stretch; flex-wrap: wrap; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s;">
        <!-- Thumbnail -->
        <div style="position: relative; width: 150px; min-width: 150px; height: 115px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--slate-200); flex-shrink: 0;">
          <img src="${prj.image}" alt="${escapeHtml(prj.title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/campus.jpg'">
          <span style="position: absolute; bottom: 6px; left: 6px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; background: rgba(11, 19, 32, 0.85); color: #fff; padding: 0.15rem 0.45rem; border-radius: 4px; backdrop-filter: blur(4px);">
            ${escapeHtml(prj.category)}
          </span>
        </div>

        <!-- Body Details -->
        <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; gap: 0.75rem; flex-wrap: wrap;">
              <div>
                <h4 style="color: var(--navy-900); font-family: var(--font-heading); font-weight: 700; font-size: 1.15rem; margin: 0 0 0.25rem 0;">
                  ${escapeHtml(prj.title)}
                </h4>
                <div style="display: flex; gap: 0.6rem; align-items: center; font-size: 0.82rem; color: var(--slate-500);">
                  ${statusBadgeHtml}
                  <span>&bull;</span>
                  <span>ID: <code>${prj.id}</code></span>
                </div>
              </div>

              <!-- Financial Metric -->
              <div style="text-align: right;">
                <div style="font-weight: 800; color: var(--emerald-600); font-size: 1.15rem;">
                  ${formatNairaDisplay(prj.raisedAmount)}
                </div>
                <div style="font-size: 0.8rem; color: var(--slate-500);">
                  Goal: ${formatNairaDisplay(prj.targetAmount)}
                </div>
              </div>
            </div>

            <p style="font-size: 0.88rem; color: var(--slate-600); margin: 0.35rem 0 0.85rem 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(prj.description)}
            </p>
          </div>

          <!-- Progress Bar & Metrics -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--slate-600); margin-bottom: 0.35rem;">
              <span><strong>${percent}%</strong> funding reached</span>
              <span><strong>${prj.donorCount || 0}</strong> verified alumni donors</span>
            </div>
            <div style="width: 100%; height: 8px; background: var(--slate-100); border-radius: 99px; overflow: hidden;">
              <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--cic-blue-600), var(--emerald-500)); border-radius: 99px; transition: width 0.4s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Action Toolbar -->
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 0.5rem; border-left: 1px solid var(--slate-100); padding-left: 1.25rem; flex-shrink: 0; min-width: 160px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="editProjectInAdmin('${prj.id}')" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 700;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Project
          </button>

          <button type="button" class="btn btn-sm btn-outline-light" onclick="quickAddProjectDonation('${prj.id}')" style="width: 100%; color: var(--emerald-700); border-color: #a7f3d0; background: #f0fdf4; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; font-weight: 700;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            + Add Funds
          </button>

          <button type="button" class="btn btn-sm btn-outline-light" onclick="toggleProjectStatus('${prj.id}')" style="width: 100%; color: var(--slate-700); border-color: var(--slate-300); font-size: 0.78rem;">
            Status: ${status === 'active' ? 'Mark Completed' : (status === 'completed' ? 'Mark Paused' : 'Activate')}
          </button>

          <div style="display: flex; gap: 0.35rem; width: 100%;">
            <button type="button" class="btn btn-sm btn-outline-light" onclick="window.open('projects.html', '_blank')" style="flex: 1; padding: 0.3rem; font-size: 0.75rem; color: var(--cic-blue-700); border-color: var(--cic-blue-200);" title="View on Live Website">
              View
            </button>
            <button type="button" class="btn btn-sm btn-outline-light" onclick="deleteProjectInAdmin('${prj.id}')" style="flex: 1; padding: 0.3rem; font-size: 0.75rem; color: var(--danger); border-color: #fecaca;" title="Permanently Delete Project">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Edit Project from Admin
 */
window.editProjectInAdmin = function(projectId) {
  const prj = DataStore.findProjectById(projectId);
  if (!prj) {
    alert('Project could not be found.');
    return;
  }

  // Pre-fill form inputs
  const editIdInput = document.getElementById('editProjectId');
  const titleInput = document.getElementById('newProjectTitle');
  const catSelect = document.getElementById('newProjectCategory');
  const statusSelect = document.getElementById('newProjectStatus');
  const targetInput = document.getElementById('newProjectTarget');
  const raisedInput = document.getElementById('newProjectInitialRaised');
  const donorsInput = document.getElementById('newProjectDonors');
  const imageInput = document.getElementById('newProjectImage');
  const descInput = document.getElementById('newProjectDescription');

  if (editIdInput) editIdInput.value = prj.id;
  if (titleInput) titleInput.value = prj.title || '';
  if (catSelect) catSelect.value = prj.category || 'Infrastructure';
  if (statusSelect) statusSelect.value = prj.status || 'active';
  if (targetInput) targetInput.value = prj.targetAmount || 0;
  if (raisedInput) raisedInput.value = prj.raisedAmount || 0;
  if (donorsInput) donorsInput.value = prj.donorCount || 0;
  if (imageInput) imageInput.value = prj.image || 'images/campus.jpg';
  if (descInput) descInput.value = prj.description || '';

  // Update image upload preview card
  const uploadThumb = document.getElementById('projectUploadThumb');
  if (uploadThumb) uploadThumb.src = prj.image || 'images/campus.jpg';

  const uploadFileName = document.getElementById('projectUploadFileName');
  if (uploadFileName) {
    uploadFileName.textContent = prj.title ? `${prj.title.slice(0, 30)} (Current Banner)` : 'Current Banner';
  }

  const uploadStatus = document.getElementById('projectUploadStatusText');
  if (uploadStatus) {
    uploadStatus.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> Current banner loaded';
  }

  // Update studio headers
  const headerTitle = document.getElementById('projectStudioHeaderTitle');
  if (headerTitle) headerTitle.textContent = `Edit Project: ${prj.title}`;

  const headerDesc = document.getElementById('projectStudioHeaderDesc');
  if (headerDesc) {
    headerDesc.textContent = `Update capital goal, description, image, or milestone status for initiative (${prj.id}).`;
  }

  const submitBtnText = document.getElementById('btnSubmitProjectText');
  if (submitBtnText) submitBtnText.textContent = 'Save Project Updates';

  // Switch tab to Studio
  switchToCreateProjectTab();

  // Trigger live preview update
  if (titleInput) {
    titleInput.dispatchEvent(new Event('input'));
  }
};

/**
 * Record a Manual or Direct Donation Allocation to a Project
 */
window.quickAddProjectDonation = function(projectId) {
  const prj = DataStore.findProjectById(projectId);
  if (!prj) return;

  const donorName = prompt(`Record Donation for "${prj.title}":\nEnter Alumnus / Donor Name:`, 'Class Member Contribution');
  if (!donorName || !donorName.trim()) return;

  const amountStr = prompt(`Enter Donation Amount (₦) for ${donorName}:`, '100000');
  if (!amountStr) return;

  const amount = Number(amountStr.replace(/[^0-9.]/g, ''));
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid numeric donation amount greater than 0.');
    return;
  }

  // 1. Update Project raisedAmount & donorCount
  DataStore.updateProjectAmount(projectId, amount);

  // 2. Automatically log an official transaction in DataStore so accounting is reconciled
  const txRef = 'HAA-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);
  const recNo = 'REC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const paymentRecord = {
    reference: txRef,
    receiptNumber: recNo,
    name: donorName.trim(),
    phone: '08000000000',
    email: 'secretariat@cicalumni1995.org',
    paymentType: 'Project Contribution',
    selectedMonths: [],
    amount: amount,
    gateway: 'Direct Bank Transfer',
    channel: 'Bank Transfer / Secretariat Entry',
    status: 'Successful',
    date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    timestamp: Date.now(),
    itemDescription: `${prj.title} Contribution (${donorName.trim()})`
  };

  DataStore.addPayment(paymentRecord);

  // Refresh views
  renderAdminProjects();
  loadAdminDashboardData();
  if (typeof renderProjects === 'function') {
    renderProjects();
  }

  alert(`Success!\nRecorded ₦${amount.toLocaleString()} for project: "${prj.title}".\nReceipt Generated: ${recNo}`);
};

/**
 * Toggle Project Status between active, completed, and paused
 */
window.toggleProjectStatus = function(projectId) {
  const prj = DataStore.findProjectById(projectId);
  if (!prj) return;

  const current = (prj.status || 'active').toLowerCase();
  let next = 'active';

  if (current === 'active') {
    next = 'completed';
  } else if (current === 'completed') {
    next = 'paused';
  } else {
    next = 'active';
  }

  prj.status = next;
  DataStore.updateProject(prj);
  renderAdminProjects();
  if (typeof renderProjects === 'function') {
    renderProjects();
  }
};

/**
 * Tab Switching Helpers
 */
window.switchToCreateProjectTab = function() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

  const btn = document.querySelector('.admin-tab-btn[data-pane="adminPane_CreateProject"]');
  if (btn) btn.classList.add('active');

  const pane = document.getElementById('adminPane_CreateProject');
  if (pane) pane.classList.add('active');

  initAdminProjectsStudio();

  const titleInput = document.getElementById('newProjectTitle');
  if (titleInput) {
    titleInput.focus();
  }
};

window.switchToProjectsTab = function() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

  const btn = document.querySelector('.admin-tab-btn[data-pane="adminPane_Projects"]');
  if (btn) btn.classList.add('active');

  const pane = document.getElementById('adminPane_Projects');
  if (pane) pane.classList.add('active');

  renderAdminProjects();
};

window.viewProjectFromAdmin = function(projectId) {
  window.open('projects.html', '_blank');
};

window.deleteProjectInAdmin = function(projectId) {
  const projects = DataStore.getProjects();
  const prj = projects.find(p => p.id === projectId);
  if (!prj) return;

  if (confirm(`Are you sure you want to permanently delete the project:\n\n"${prj.title}"?\n\nThis will remove it from the public website.`)) {
    DataStore.deleteProject(projectId);
    if (typeof renderProjects === 'function') {
      renderProjects();
    }
    renderAdminProjects();
    loadAdminDashboardData();
    alert('Project has been successfully deleted.');
  }
};

/**
 * Helper to escape HTML safely
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Quick News & Announcement Ingestion Handlers
 */
window.handleQuickNewsFile = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type || !file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, JPEG, WebP).');
    return;
  }

  const previewBox = document.getElementById('quickNewsPreviewBox');
  const previewImg = document.getElementById('quickNewsPreviewImg');
  const previewName = document.getElementById('quickNewsPreviewName');
  const urlInput = document.getElementById('quickNewsImageUrl');

  if (previewName) previewName.textContent = 'Optimizing photo...';
  if (previewBox) previewBox.style.display = 'flex';

  window.optimizeImageFile(file).then(dataUrl => {
    window._quickNewsUploadedDataUrl = dataUrl;
    if (previewImg) previewImg.src = dataUrl;
    const estKb = Math.round(dataUrl.length * 0.75 / 1024);
    if (previewName) previewName.textContent = `${file.name} (~${estKb} KB)`;
    if (urlInput) urlInput.value = 'Custom Uploaded Photo (' + file.name + ')';
  }).catch(err => {
    console.error('Error optimizing news photo:', err);
    alert('Could not process photo file.');
  });
};

window.clearQuickNewsPreview = function() {
  window._quickNewsUploadedDataUrl = null;
  const fileInput = document.getElementById('quickNewsImageFile');
  const previewBox = document.getElementById('quickNewsPreviewBox');
  const previewImg = document.getElementById('quickNewsPreviewImg');
  const urlInput = document.getElementById('quickNewsImageUrl');

  if (fileInput) fileInput.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
  if (urlInput) urlInput.value = 'images/campus.jpg';
};

window.handleQuickNewsUpload = function(event) {
  if (event && event.preventDefault) event.preventDefault();

  const title = (document.getElementById('quickNewsTitle')?.value || '').trim();
  const category = document.getElementById('quickNewsCategory')?.value || 'Alumni News';
  const date = document.getElementById('quickNewsDate')?.value || new Date().toISOString().split('T')[0];
  const featured = !!document.getElementById('quickNewsFeatured')?.checked;
  const summary = (document.getElementById('quickNewsSummary')?.value || '').trim();
  const content = (document.getElementById('quickNewsContent')?.value || summary || '').trim();

  let image = window._quickNewsUploadedDataUrl;
  if (!image) {
    const manualUrl = (document.getElementById('quickNewsImageUrl')?.value || '').trim();
    if (manualUrl && !manualUrl.startsWith('Custom Uploaded Photo')) {
      image = manualUrl;
    } else {
      image = 'images/campus.jpg';
    }
  }

  if (!title || !summary) {
    alert('Please fill in all required fields (Title and Summary / Lead Brief).');
    return;
  }

  const newNews = {
    id: 'news-' + Date.now(),
    title,
    category,
    date,
    featured,
    image,
    summary,
    content
  };

  DataStore.addNews(newNews);

  const form = document.getElementById('quickNewsUploadForm');
  if (form) form.reset();

  clearQuickNewsPreview();

  const dateInput = document.getElementById('quickNewsDate');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (typeof renderAdminNews === 'function') {
    renderAdminNews();
  }

  if (typeof updateNewsGalleryBadgeCounts === 'function') {
    updateNewsGalleryBadgeCounts();
  }

  if (typeof renderNews === 'function') {
    renderNews();
  }

  alert(`✓ Announcement & Information "${title}" uploaded and published successfully!`);
};

/**
 * Admin News & Announcements Publishing Studio Controller
 */
function initAdminNewsStudio() {
  const form = document.getElementById('adminNewsForm');
  const dateInput = document.getElementById('newsDateInput');
  const quickDateInput = document.getElementById('quickNewsDate');
  const searchInput = document.getElementById('adminSearchNews');
  const categoryFilter = document.getElementById('adminNewsCategoryFilter');

  // Set default today's date if empty
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  if (quickDateInput && !quickDateInput.value) {
    quickDateInput.value = new Date().toISOString().split('T')[0];
  }

  // Bind live search input once
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderAdminNews());
  }

  // Bind category filter once
  if (categoryFilter && !categoryFilter.dataset.bound) {
    categoryFilter.dataset.bound = 'true';
    categoryFilter.addEventListener('change', () => renderAdminNews());
  }

  // Bind form submission once
  if (form && !form.dataset.bound) {
    form.dataset.bound = 'true';
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const editId = (document.getElementById('newsEditId')?.value || '').trim();
      const title = document.getElementById('newsTitleInput').value.trim();
      const category = document.getElementById('newsCategorySelect').value;
      const date = document.getElementById('newsDateInput').value;
      const featured = document.getElementById('newsFeaturedCheckbox').checked;
      const image = document.getElementById('newsImageInput').value.trim() || 'images/campus.jpg';
      const summary = document.getElementById('newsSummaryInput').value.trim();
      const content = document.getElementById('newsContentInput').value.trim();

      if (!title || !date || !summary || !content) {
        alert('Please fill in all required fields (Title, Date, Summary, and Announcement Body).');
        return;
      }

      if (editId) {
        // Update existing announcement
        const updated = DataStore.updateNews({
          id: editId,
          title,
          category,
          date,
          featured,
          image,
          summary,
          content
        });

        if (updated) {
          alert(`✓ Announcement "${title}" successfully updated!`);
        }
      } else {
        // Create new announcement
        const newNews = {
          id: 'news-' + Date.now(),
          title,
          category,
          date,
          featured,
          image,
          summary,
          content
        };

        DataStore.addNews(newNews);
        alert(`✓ Announcement "${title}" published successfully! It is now live on the portal.`);
      }

      cancelNewsEdit();
      renderAdminNews();

      // Immediately sync public homepage news section if active
      if (typeof renderNews === 'function') {
        renderNews();
      }
    });
  }
}

window.toggleAdminNewsForm = function(forceOpen) {
  if (typeof switchNewsGallerySubtab === 'function') {
    switchNewsGallerySubtab('news');
  }

  const quickForm = document.getElementById('quickNewsUploadForm');
  const quickTitle = document.getElementById('quickNewsTitle');
  if (quickForm) {
    quickForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (quickTitle) {
      setTimeout(() => quickTitle.focus(), 250);
    }
  }
};

window.cancelNewsEdit = function() {
  const card = document.getElementById('adminNewsFormCard');
  const form = document.getElementById('adminNewsForm');
  const editId = document.getElementById('newsEditId');
  const headerTitle = document.getElementById('newsFormHeaderTitle');
  const btnSave = document.getElementById('btnSaveNews');
  const dateInput = document.getElementById('newsDateInput');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (headerTitle) {
    headerTitle.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      Publish New Announcement
    `;
  }

  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      Publish Announcement
    `;
  }

  if (card) card.style.display = 'none';
};

window.editNewsInAdmin = function(newsId) {
  const item = DataStore.findNewsById(newsId);
  if (!item) {
    alert('Announcement not found.');
    return;
  }

  const card = document.getElementById('adminNewsFormCard');
  const editId = document.getElementById('newsEditId');
  const titleInput = document.getElementById('newsTitleInput');
  const categorySelect = document.getElementById('newsCategorySelect');
  const dateInput = document.getElementById('newsDateInput');
  const featuredCheckbox = document.getElementById('newsFeaturedCheckbox');
  const imageInput = document.getElementById('newsImageInput');
  const summaryInput = document.getElementById('newsSummaryInput');
  const contentInput = document.getElementById('newsContentInput');
  const headerTitle = document.getElementById('newsFormHeaderTitle');
  const btnSave = document.getElementById('btnSaveNews');

  if (editId) editId.value = item.id;
  if (titleInput) titleInput.value = item.title || '';
  if (categorySelect) categorySelect.value = item.category || 'Alumni News';
  if (dateInput) dateInput.value = item.date || '';
  if (featuredCheckbox) featuredCheckbox.checked = !!item.featured;
  if (imageInput) imageInput.value = item.image || 'images/campus.jpg';
  if (summaryInput) summaryInput.value = item.summary || '';
  if (contentInput) contentInput.value = item.content || '';

  if (headerTitle) {
    headerTitle.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      Edit Announcement: "${escapeHtml(item.title)}"
    `;
  }

  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      Save Changes &amp; Update
    `;
  }

  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (titleInput) titleInput.focus();
};

window.deleteNewsInAdmin = function(newsId) {
  const item = DataStore.findNewsById(newsId);
  if (!item) return;

  if (confirm(`Are you sure you want to permanently delete this announcement?\n\n"${item.title}"\n\nThis will remove it immediately from both the administrative console and the public portal.`)) {
    DataStore.deleteNews(newsId);

    const editId = document.getElementById('newsEditId');
    if (editId && editId.value === newsId) {
      cancelNewsEdit();
    }

    renderAdminNews();

    if (typeof renderNews === 'function') {
      renderNews();
    }

    alert(`✓ Announcement "${item.title}" has been deleted.`);
  }
};

window.previewNewsArticleInAdmin = function(newsId) {
  const item = DataStore.findNewsById(newsId);
  if (!item) return;

  if (typeof openGenericModal === 'function') {
    openGenericModal(`
      <div>
        <img src="${item.image || 'images/campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-lg) var(--radius-lg) 0 0;" onerror="this.src='images/campus.jpg'">
        <div style="padding: 2rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <span class="news-cat-tag">${item.category}</span>
            <span style="font-size: 0.85rem; color: var(--slate-500);">${item.date}</span>
            ${item.featured ? '<span style="background: rgba(245, 158, 11, 0.15); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.75rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px;">Featured Headline</span>' : ''}
          </div>
          <h2 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.5rem; line-height: 1.35; margin-bottom: 1.25rem;">
            ${escapeHtml(item.title)}
          </h2>
          <div style="font-size: 0.98rem; color: var(--slate-700); line-height: 1.8; white-space: pre-line;">
            ${escapeHtml(item.content)}
          </div>
        </div>
      </div>
    `);
  } else {
    alert(`${item.title}\n\nDate: ${item.date} | Category: ${item.category}\n\n${item.content}`);
  }
};

window.toggleSelectAllAdminNews = function(masterCheckbox) {
  const checkboxes = document.querySelectorAll('.admin-news-item-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = masterCheckbox.checked;
  });
  handleAdminNewsCheckboxChange();
};

window.handleAdminNewsCheckboxChange = function() {
  const checkboxes = Array.from(document.querySelectorAll('.admin-news-item-checkbox'));
  const checked = checkboxes.filter(cb => cb.checked);
  const master = document.getElementById('selectAllAdminNewsCheckbox');
  const btnDeleteSelected = document.getElementById('btnDeleteSelectedNews');
  const statusSpan = document.getElementById('adminNewsSelectionStatus');

  if (master) {
    master.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
    master.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
  }

  if (statusSpan) {
    if (checked.length > 0) {
      statusSpan.style.display = 'inline';
      statusSpan.textContent = `(${checked.length} selected)`;
    } else {
      statusSpan.style.display = 'none';
    }
  }

  if (btnDeleteSelected) {
    if (checked.length > 0) {
      btnDeleteSelected.disabled = false;
      btnDeleteSelected.style.opacity = '1';
      btnDeleteSelected.style.cursor = 'pointer';
      btnDeleteSelected.innerHTML = `
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        <span>Delete (${checked.length}) Selected</span>
      `;
    } else {
      btnDeleteSelected.disabled = true;
      btnDeleteSelected.style.opacity = '0.45';
      btnDeleteSelected.style.cursor = 'not-allowed';
      btnDeleteSelected.innerHTML = `
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        <span>Delete Selected</span>
      `;
    }
  }
};

window.deleteSelectedAdminNews = function() {
  const checkboxes = Array.from(document.querySelectorAll('.admin-news-item-checkbox:checked'));
  if (checkboxes.length === 0) return;

  const count = checkboxes.length;
  if (!confirm(`Are you sure you want to permanently delete the ${count} selected announcement(s) / information from the alumni database?\n\nThis will remove them immediately from the website.`)) {
    return;
  }

  checkboxes.forEach(cb => {
    const id = cb.dataset.newsId;
    if (id) {
      DataStore.deleteNews(id);
    }
  });

  renderAdminNews();
  if (typeof renderAdminMediaLibrary === 'function') renderAdminMediaLibrary();
  if (typeof renderNews === 'function') renderNews();
  alert(`✓ Successfully deleted ${count} announcement(s).`);
};

window.deleteAllAdminNews = function() {
  const newsList = DataStore.getNews();
  if (newsList.length === 0) {
    alert('There is no uploaded information to delete.');
    return;
  }

  if (!confirm(`CAUTION: Are you sure you want to permanently delete ALL (${newsList.length}) uploaded announcements and information?\n\nThis action cannot be undone.`)) {
    return;
  }

  newsList.forEach(item => {
    DataStore.deleteNews(item.id);
  });

  renderAdminNews();
  if (typeof renderAdminMediaLibrary === 'function') renderAdminMediaLibrary();
  if (typeof renderNews === 'function') renderNews();
  alert('✓ All uploaded announcements and information have been cleared.');
};

function renderAdminNews() {
  const container = document.getElementById('adminNewsList');
  if (!container) return;

  const newsList = DataStore.getNews();
  const totalCountEl = document.getElementById('adminNewsTotalCount');
  const badgeCountEl = document.getElementById('badgeCountNews');
  const masterCb = document.getElementById('selectAllAdminNewsCheckbox');
  const btnDeleteSelected = document.getElementById('btnDeleteSelectedNews');
  const btnClearAll = document.getElementById('btnClearAllNews');
  const statusSpan = document.getElementById('adminNewsSelectionStatus');

  if (totalCountEl) totalCountEl.textContent = newsList.length;
  if (badgeCountEl) badgeCountEl.textContent = newsList.length;

  if (masterCb) {
    masterCb.checked = false;
    masterCb.indeterminate = false;
    masterCb.disabled = newsList.length === 0;
  }

  if (btnDeleteSelected) {
    btnDeleteSelected.disabled = true;
    btnDeleteSelected.style.opacity = '0.45';
    btnDeleteSelected.style.cursor = 'not-allowed';
    btnDeleteSelected.innerHTML = `
      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      <span>Delete Selected</span>
    `;
  }

  if (btnClearAll) {
    btnClearAll.disabled = newsList.length === 0;
    btnClearAll.style.opacity = newsList.length === 0 ? '0.45' : '1';
    btnClearAll.style.cursor = newsList.length === 0 ? 'not-allowed' : 'pointer';
  }

  if (statusSpan) {
    statusSpan.style.display = 'none';
  }

  if (newsList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; background: var(--white); border: 1px dashed var(--slate-300); border-radius: var(--radius-lg);">
        <svg width="40" height="40" fill="none" stroke="var(--slate-400)" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 0.75rem;"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <h4 style="color: var(--navy-900); font-weight: 700; margin-bottom: 0.25rem;">No Bulletins or Announcements Uploaded</h4>
        <p style="color: var(--slate-500); font-size: 0.88rem; max-width: 420px; margin: 0 auto 1.25rem;">
          There is currently no news or information uploaded. Use the form above to publish your first announcement.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = newsList.map(item => `
    <div style="background: var(--white); border: 1.5px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); display: flex; gap: 1.15rem; align-items: flex-start; transition: var(--transition);" class="admin-news-card-item">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; flex-shrink: 0;">
        <input type="checkbox" class="admin-news-item-checkbox" data-news-id="${item.id}" onchange="handleAdminNewsCheckboxChange()" style="width: 19px; height: 19px; accent-color: #e11d48; cursor: pointer;" title="Select item for deletion">
        <img src="${item.image || 'images/campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 105px; height: 80px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--slate-200);" onerror="this.src='images/campus.jpg'">
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap;">
          <span style="background: var(--cic-blue-50); color: var(--cic-blue-700); border: 1px solid var(--cic-blue-200); font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 9999px; text-transform: uppercase;">
            ${item.category || 'General'}
          </span>
          <span style="font-size: 0.78rem; color: var(--slate-500); font-weight: 500;">
            📅 ${item.date || 'Recent'}
          </span>
          ${item.featured ? `
            <span style="background: rgba(245, 158, 11, 0.12); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.25); font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px;">
              ★ Featured Pin
            </span>
          ` : ''}
        </div>
        <h4 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; line-height: 1.35;">
          ${escapeHtml(item.title)}
        </h4>
        <p style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 0.75rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(item.summary || '')}
        </p>
        <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--slate-100); padding-top: 0.75rem;">
          <button type="button" class="btn btn-sm btn-outline-light" onclick="previewNewsArticleInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.28rem 0.7rem; color: var(--cic-blue-700); border-color: var(--cic-blue-200); font-weight: 600;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 3px;"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="editNewsInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.28rem 0.7rem; color: var(--slate-700); border-color: var(--slate-300); font-weight: 600;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 3px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>
          <button type="button" class="btn btn-sm" onclick="deleteNewsInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.32rem 0.95rem; color: #ffffff; background: #dc2626; border: 1px solid #b91c1c; font-weight: 700; border-radius: 6px; margin-left: auto; display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(220, 38, 38, 0.2);" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete Information
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.renderAdminNews = renderAdminNews;

window.switchNewsGallerySubtab = function(tab) {
  const newsSec = document.getElementById('adminNewsSection');
  const gallerySec = document.getElementById('adminGallerySection');
  const mediaSec = document.getElementById('adminMediaSection');

  const subtabNewsBtn = document.getElementById('subtabNewsBtn');
  const subtabGalleryBtn = document.getElementById('subtabGalleryBtn');
  const subtabMediaBtn = document.getElementById('subtabMediaBtn');
  const sideNewsBtn = document.getElementById('adminTabBtn_News');
  const sideGalBtn = document.getElementById('adminTabBtn_Gallery');
  const sideMediaBtn = document.getElementById('adminTabBtn_MediaLibrary');

  [subtabNewsBtn, subtabGalleryBtn, subtabMediaBtn].forEach(b => {
    if (b) b.classList.remove('active');
  });

  if (newsSec) newsSec.style.display = 'none';
  if (gallerySec) gallerySec.style.display = 'none';
  if (mediaSec) mediaSec.style.display = 'none';

  if (tab === 'gallery') {
    if (gallerySec) gallerySec.style.display = 'block';
    if (subtabGalleryBtn) subtabGalleryBtn.classList.add('active');
    if (sideGalBtn) sideGalBtn.classList.add('active');
    if (sideNewsBtn) sideNewsBtn.classList.remove('active');
    if (sideMediaBtn) sideMediaBtn.classList.remove('active');
    initAdminGalleryStudio();
    renderAdminGallery();
  } else if (tab === 'media') {
    if (mediaSec) mediaSec.style.display = 'block';
    if (subtabMediaBtn) subtabMediaBtn.classList.add('active');
    if (sideMediaBtn) sideMediaBtn.classList.add('active');
    if (sideNewsBtn) sideNewsBtn.classList.remove('active');
    if (sideGalBtn) sideGalBtn.classList.remove('active');
    renderAdminMediaLibrary();
  } else {
    if (newsSec) newsSec.style.display = 'block';
    if (subtabNewsBtn) subtabNewsBtn.classList.add('active');
    if (sideNewsBtn) sideNewsBtn.classList.add('active');
    if (sideGalBtn) sideGalBtn.classList.remove('active');
    if (sideMediaBtn) sideMediaBtn.classList.remove('active');
    initAdminNewsStudio();
    renderAdminNews();
  }
  updateNewsGalleryBadgeCounts();
};

window.updateNewsGalleryBadgeCounts = function() {
  if (typeof DataStore !== 'undefined') {
    const newsList = DataStore.getNews() || [];
    const galleryList = DataStore.getGallery() || [];
    const mediaList = (typeof getAllUploadedMedia === 'function') ? getAllUploadedMedia() : [];
    const bNews = document.getElementById('badgeCountNews');
    const bGal = document.getElementById('badgeCountGallery');
    const bMedia = document.getElementById('badgeCountMedia');
    const sNews = document.getElementById('sidebarNewsCount');
    const sGal = document.getElementById('sidebarGalleryCount');
    const sMedia = document.getElementById('sidebarMediaCount');
    const sBoth = document.getElementById('sidebarNewsGalleryCount');
    if (bNews) bNews.textContent = newsList.length;
    if (bGal) bGal.textContent = galleryList.length;
    if (bMedia) bMedia.textContent = mediaList.length;
    if (sNews) sNews.textContent = newsList.length;
    if (sGal) sGal.textContent = galleryList.length;
    if (sMedia) sMedia.textContent = mediaList.length;
    if (sBoth) sBoth.textContent = newsList.length + galleryList.length;
  }
};

window.switchToNewsTab = function() {
  switchAdminPane('adminPane_NewsGallery');
  switchNewsGallerySubtab('news');
};

window.switchToGalleryTab = function() {
  switchAdminPane('adminPane_NewsGallery');
  switchNewsGallerySubtab('gallery');
};

/**
 * ============================================================================
 * Uploaded Media & Images Manager Controller (Delete Space)
 * ============================================================================
 */
window.getAllUploadedMedia = function() {
  const media = [];

  // 1. Alumni Photo Gallery
  if (typeof DataStore !== 'undefined' && DataStore.getGallery) {
    const gallery = DataStore.getGallery() || [];
    gallery.forEach(g => {
      if (g.image) {
        media.push({
          id: g.id,
          type: 'gallery',
          sourceName: 'Alumni Photo Gallery',
          sourceBadgeColor: 'var(--cic-blue-700)',
          sourceBadgeBg: 'var(--cic-blue-50)',
          title: g.title || 'Gallery Photograph',
          caption: g.caption || '',
          category: g.category || 'Reunions',
          image: g.image,
          date: 'Archive'
        });
      }
    });
  }

  // 2. News & Announcements Cover Photos
  if (typeof DataStore !== 'undefined' && DataStore.getNews) {
    const news = DataStore.getNews() || [];
    news.forEach(n => {
      if (n.image && (n.image.startsWith('data:image/') || n.image.startsWith('http') || !n.image.endsWith('campus.jpg'))) {
        media.push({
          id: n.id,
          type: 'news',
          sourceName: 'News Announcement',
          sourceBadgeColor: '#b45309',
          sourceBadgeBg: 'rgba(245, 158, 11, 0.12)',
          title: n.title || 'News Cover Photo',
          caption: n.summary || '',
          category: n.category || 'Alumni News',
          image: n.image,
          date: n.date || 'Recent'
        });
      }
    });
  }

  // 3. Events Banner Photos
  if (typeof DataStore !== 'undefined' && DataStore.getEvents) {
    const events = DataStore.getEvents() || [];
    events.forEach(e => {
      if (e.image && (e.image.startsWith('data:image/') || (e.image.startsWith('http') && !e.image.includes('images.unsplash.com/photo-1511578314322-379afb476865')))) {
        media.push({
          id: e.id,
          type: 'event',
          sourceName: 'Event Banner',
          sourceBadgeColor: '#059669',
          sourceBadgeBg: 'rgba(5, 150, 105, 0.12)',
          title: e.title || 'Event Banner',
          caption: e.location || '',
          category: e.category || 'Events',
          image: e.image,
          date: e.date || 'Scheduled'
        });
      }
    });
  }

  // 4. Projects Images
  if (typeof DataStore !== 'undefined' && DataStore.getProjects) {
    const projects = DataStore.getProjects() || [];
    projects.forEach(p => {
      if (p.image && (p.image.startsWith('data:image/') || !p.image.endsWith('campus.jpg'))) {
        media.push({
          id: p.id,
          type: 'project',
          sourceName: 'Project Funding',
          sourceBadgeColor: '#7c3aed',
          sourceBadgeBg: 'rgba(124, 58, 237, 0.12)',
          title: p.title || 'Project Photo',
          caption: p.targetText || '',
          category: p.category || 'Projects',
          image: p.image,
          date: 'Active'
        });
      }
    });
  }

  return media;
};

window.renderAdminMediaLibrary = function() {
  const container = document.getElementById('adminMediaLibraryGrid');
  if (!container) return;

  const searchVal = (document.getElementById('adminSearchMedia')?.value || '').trim().toLowerCase();
  const filterType = document.getElementById('adminMediaFilterSelect')?.value || 'ALL';

  let list = window.getAllUploadedMedia();

  if (filterType !== 'ALL') {
    list = list.filter(m => m.type === filterType);
  }

  if (searchVal) {
    list = list.filter(m =>
      (m.title && m.title.toLowerCase().includes(searchVal)) ||
      (m.caption && m.caption.toLowerCase().includes(searchVal)) ||
      (m.category && m.category.toLowerCase().includes(searchVal)) ||
      (m.sourceName && m.sourceName.toLowerCase().includes(searchVal))
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--white); border: 1.5px dashed var(--slate-300); border-radius: var(--radius-xl);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--slate-100); color: var(--slate-400); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h4 style="color: var(--navy-900); font-weight: 700; margin-bottom: 0.35rem; font-family: var(--font-heading); font-size: 1.25rem;">No Uploaded Images Found</h4>
        <p style="color: var(--slate-500); font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem;">
          ${searchVal || filterType !== 'ALL' ? 'No uploaded images match your filter or keyword.' : 'No uploaded pictures currently in storage. Photos uploaded through the gallery or announcements will be listed here.'}
        </p>
        <button type="button" class="btn btn-primary" onclick="switchNewsGallerySubtab('gallery')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          + Upload Photo to Gallery
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(item => `
    <div style="background: var(--white); border: 1.5px solid var(--slate-200); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease;">
      <div style="position: relative; height: 185px; background: #0b1120; cursor: pointer; overflow: hidden;" onclick="previewMediaItem('${item.id}', '${item.type}')">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='images/campus.jpg'">
        <div style="position: absolute; top: 10px; left: 10px;">
          <span style="background: ${item.sourceBadgeBg}; color: ${item.sourceBadgeColor}; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid rgba(0,0,0,0.06); backdrop-filter: blur(4px);">
            ${escapeHtml(item.sourceName)}
          </span>
        </div>
      </div>
      <div style="padding: 1rem 1.15rem 1.15rem; display: flex; flex-direction: column; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span style="font-size: 0.74rem; color: var(--slate-500); font-weight: 600;">📁 ${escapeHtml(item.category)}</span>
          <span style="font-size: 0.72rem; color: var(--slate-400);">📅 ${escapeHtml(item.date)}</span>
        </div>
        <h5 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 0.98rem; font-weight: 700; margin-bottom: 0.35rem; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(item.title)}">
          ${escapeHtml(item.title)}
        </h5>
        <p style="font-size: 0.82rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.45; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(item.caption || 'Custom uploaded graphic')}
        </p>
        <div style="border-top: 1px solid var(--slate-100); padding-top: 0.85rem; display: flex; gap: 0.5rem; align-items: center;">
          <button type="button" class="btn btn-sm btn-outline-light" onclick="previewMediaItem('${item.id}', '${item.type}')" style="flex: 1; font-size: 0.76rem; font-weight: 600; padding: 0.35rem 0.5rem; color: var(--cic-blue-700); border-color: var(--cic-blue-200);">
            👁️ Preview
          </button>
          <button type="button" class="btn btn-sm btn-danger" onclick="deleteUploadedMediaImage('${item.type}', '${item.id}')" style="flex: 1.25; font-size: 0.78rem; font-weight: 700; padding: 0.38rem 0.6rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; background: #dc2626; color: #fff; border: none; border-radius: var(--radius-md); box-shadow: 0 1px 3px rgba(220, 38, 38, 0.3); cursor: pointer;">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete Image
          </button>
        </div>
      </div>
    </div>
  `).join('');
};

window.previewMediaItem = function(id, type) {
  const media = window.getAllUploadedMedia().find(m => m.id === id && m.type === type);
  if (!media) return;

  if (typeof openGenericModal === 'function') {
    openGenericModal(`
      <div>
        <img src="${media.image}" alt="${escapeHtml(media.title)}" style="width: 100%; max-height: 480px; object-fit: contain; background: #0b1120; border-radius: var(--radius-lg) var(--radius-lg) 0 0;" onerror="this.src='images/campus.jpg'">
        <div style="padding: 1.5rem;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
            <span style="background: ${media.sourceBadgeBg}; color: ${media.sourceBadgeColor}; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">
              ${escapeHtml(media.sourceName)}
            </span>
            <span style="font-size: 0.8rem; color: var(--slate-500);">📁 ${escapeHtml(media.category)}</span>
          </div>
          <h3 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.35rem; margin-bottom: 0.5rem;">
            ${escapeHtml(media.title)}
          </h3>
          <p style="font-size: 0.92rem; color: var(--slate-600); margin-bottom: 1.5rem; line-height: 1.6;">
            ${escapeHtml(media.caption)}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 1rem;">
            <button type="button" class="btn btn-outline-light" onclick="closeGenericModal()">
              Close
            </button>
            <button type="button" class="btn btn-danger" onclick="closeGenericModal(); deleteUploadedMediaImage('${media.type}', '${media.id}')" style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; background: #dc2626; color: #fff;">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Delete This Image
            </button>
          </div>
        </div>
      </div>
    `);
  }
};

window.deleteUploadedMediaImage = function(type, id) {
  const media = window.getAllUploadedMedia().find(m => m.id === id && m.type === type);
  const titleName = media ? `"${media.title}"` : 'this image';

  if (!confirm(`Are you sure you want to permanently delete ${titleName} from the system?`)) {
    return;
  }

  if (type === 'gallery') {
    DataStore.deleteGalleryItem(id);
  } else if (type === 'news') {
    DataStore.deleteNews(id);
  } else if (type === 'event') {
    let events = DataStore.getEvents() || [];
    events = events.filter(e => e.id !== id);
    DataStore.saveEvents(events);
  } else if (type === 'project') {
    let projects = DataStore.getProjects() || [];
    projects = projects.filter(p => p.id !== id);
    DataStore.saveProjects(projects);
  }

  // Refresh all dependent views and counters
  if (typeof renderAdminMediaLibrary === 'function') renderAdminMediaLibrary();
  if (typeof renderAdminGallery === 'function') renderAdminGallery();
  if (typeof renderAdminNews === 'function') renderAdminNews();
  if (typeof updateNewsGalleryBadgeCounts === 'function') updateNewsGalleryBadgeCounts();
  if (typeof renderNews === 'function') renderNews();
  if (typeof renderGallery === 'function') renderGallery();

  alert(`✓ Image ${titleName} successfully deleted from the system.`);
};

/**
 * ============================================================================
 * Alumni Photo Gallery Controller Suite
 * ============================================================================
 */
function initAdminGalleryStudio() {
  const form = document.getElementById('adminGalleryForm');
  const searchInput = document.getElementById('adminSearchGallery');
  const categoryFilter = document.getElementById('adminGalleryCategoryFilter');
  const dropzone = document.getElementById('galleryImageDropzone');

  // Bind live search input once
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderAdminGallery());
  }

  // Bind category filter once
  if (categoryFilter && !categoryFilter.dataset.bound) {
    categoryFilter.dataset.bound = 'true';
    categoryFilter.addEventListener('change', () => renderAdminGallery());
  }

  // Bind dropzone drag-and-drop once
  if (dropzone && !dropzone.dataset.bound) {
    dropzone.dataset.bound = 'true';

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleGalleryPhotoUpload(files[0]);
      }
    }, false);
  }
}

window.handleGalleryFileSelect = function(event) {
  const file = event.target.files && event.target.files[0];
  if (file) {
    handleGalleryPhotoUpload(file);
  }
};

function handleGalleryPhotoUpload(file) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, JPEG, WebP).');
    return;
  }

  const dataUrlHidden = document.getElementById('galleryPhotoDataUrl');
  const previewBox = document.getElementById('galleryPhotoPreviewBox');
  const previewImg = document.getElementById('galleryPreviewImg');
  const fileNameEl = document.getElementById('galleryPreviewFileName');
  const statusBadge = document.getElementById('galleryPreviewStatusBadge');
  const urlInput = document.getElementById('galleryPhotoUrlInput');

  if (statusBadge) {
    statusBadge.textContent = 'Optimizing photo...';
    statusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
    statusBadge.style.color = '#b45309';
  }
  if (previewBox) previewBox.style.display = 'block';

  window.optimizeImageFile(file).then(dataUrl => {
    if (dataUrlHidden) dataUrlHidden.value = dataUrl;
    if (previewImg) previewImg.src = dataUrl;
    const estKb = Math.round(dataUrl.length * 0.75 / 1024);
    if (fileNameEl) fileNameEl.textContent = `${file.name} (~${estKb} KB)`;
    if (statusBadge) {
      statusBadge.textContent = '✓ Ready to Save';
      statusBadge.style.background = 'rgba(5, 150, 105, 0.12)';
      statusBadge.style.color = '#059669';
    }
    if (urlInput) urlInput.value = '';
  }).catch(err => {
    console.error('Error optimizing gallery photo:', err);
    alert('Could not process photo file.');
  });
}

window.handleGalleryUrlInput = function(val) {
  val = (val || '').trim();
  const previewBox = document.getElementById('galleryPhotoPreviewBox');
  const previewImg = document.getElementById('galleryPreviewImg');
  const fileNameEl = document.getElementById('galleryPreviewFileName');
  const statusBadge = document.getElementById('galleryPreviewStatusBadge');
  const dataUrlHidden = document.getElementById('galleryPhotoDataUrl');

  if (val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('images/'))) {
    if (dataUrlHidden) dataUrlHidden.value = val;
    if (previewImg) {
      previewImg.src = val;
      previewImg.onerror = () => {
        if (previewBox) previewBox.style.display = 'none';
      };
      previewImg.onload = () => {
        if (previewBox) previewBox.style.display = 'block';
      };
    }
    if (fileNameEl) fileNameEl.textContent = val.length > 50 ? val.substring(0, 47) + '...' : val;
    if (statusBadge) statusBadge.textContent = 'External Image URL';
    if (previewBox) previewBox.style.display = 'block';
  } else if (!val && (!dataUrlHidden || !dataUrlHidden.value)) {
    if (previewBox) previewBox.style.display = 'none';
  }
};

window.setGalleryPreset = function(url, title, category, caption) {
  const urlInput = document.getElementById('galleryPhotoUrlInput');
  const titleInput = document.getElementById('galleryPhotoTitleInput');
  const catSelect = document.getElementById('galleryPhotoCategorySelect');
  const captionInput = document.getElementById('galleryPhotoCaptionInput');

  if (urlInput) urlInput.value = url;
  if (titleInput) titleInput.value = title;
  if (catSelect) catSelect.value = category;
  if (captionInput) captionInput.value = caption;

  handleGalleryUrlInput(url);
};

window.clearGalleryPhotoPreview = function() {
  const fileInput = document.getElementById('galleryPhotoFileInput');
  const urlInput = document.getElementById('galleryPhotoUrlInput');
  const dataUrlHidden = document.getElementById('galleryPhotoDataUrl');
  const previewBox = document.getElementById('galleryPhotoPreviewBox');
  const previewImg = document.getElementById('galleryPreviewImg');

  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
  if (dataUrlHidden) dataUrlHidden.value = '';
  if (previewImg) previewImg.src = '';
  if (previewBox) previewBox.style.display = 'none';
};

window.toggleAdminGalleryForm = function(forceOpen) {
  if (typeof switchNewsGallerySubtab === 'function') {
    switchNewsGallerySubtab('gallery');
  }

  const card = document.getElementById('adminGalleryFormCard');
  if (!card) return;

  const isHidden = card.style.display === 'none' || !card.style.display;
  const shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;

  if (shouldOpen) {
    card.style.display = 'block';
    const titleInput = document.getElementById('galleryPhotoTitleInput');
    if (titleInput) titleInput.focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    cancelGalleryEdit();
  }
};

window.cancelGalleryEdit = function() {
  const card = document.getElementById('adminGalleryFormCard');
  const form = document.getElementById('adminGalleryForm');
  const editId = document.getElementById('galleryPhotoEditId');
  const headerTitle = document.getElementById('galleryFormHeaderTitle');
  const btnSave = document.getElementById('btnSaveGalleryPhoto');

  if (form) form.reset();
  if (editId) editId.value = '';
  clearGalleryPhotoPreview();

  if (headerTitle) {
    headerTitle.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      <span>Upload Photo to Alumni Gallery</span>
    `;
  }

  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      Save Photo to Gallery
    `;
  }

  // Keep visible as dedicated upload card
  if (card) card.style.display = 'block';
};

window.saveAdminGalleryPhoto = function(event) {
  event.preventDefault();

  const editId = (document.getElementById('galleryPhotoEditId')?.value || '').trim();
  const title = (document.getElementById('galleryPhotoTitleInput')?.value || '').trim();
  const category = document.getElementById('galleryPhotoCategorySelect')?.value || 'Reunions';
  const caption = (document.getElementById('galleryPhotoCaptionInput')?.value || '').trim() || title;
  const dataUrl = (document.getElementById('galleryPhotoDataUrl')?.value || '').trim();
  const directUrl = (document.getElementById('galleryPhotoUrlInput')?.value || '').trim();
  const image = dataUrl || directUrl;

  if (!title) {
    alert('Please enter a photo title or event name.');
    return;
  }

  if (!image) {
    alert('Please upload an image file or provide a valid photo URL.');
    return;
  }

  if (editId) {
    // Update existing photo
    const updated = DataStore.updateGalleryItem({
      id: editId,
      title,
      category,
      image,
      caption
    });

    if (updated) {
      alert(`✓ Photo "${title}" successfully updated!`);
    }
  } else {
    // Add new photo
    const newPhoto = {
      id: 'gal-' + Date.now(),
      title,
      category,
      image,
      caption
    };

    DataStore.addGalleryItem(newPhoto);
    alert(`✓ Photo "${title}" added to the Alumni Gallery! It is now live across the portal.`);
  }

  cancelGalleryEdit();
  renderAdminGallery();
  updateNewsGalleryBadgeCounts();

  // Immediately synchronize public gallery if on page
  if (typeof renderGallery === 'function') {
    renderGallery();
  }
};

window.editGalleryPhotoInAdmin = function(photoId) {
  const item = DataStore.findGalleryItemById(photoId);
  if (!item) {
    alert('Gallery photo not found.');
    return;
  }

  const card = document.getElementById('adminGalleryFormCard');
  const editId = document.getElementById('galleryPhotoEditId');
  const titleInput = document.getElementById('galleryPhotoTitleInput');
  const categorySelect = document.getElementById('galleryPhotoCategorySelect');
  const captionInput = document.getElementById('galleryPhotoCaptionInput');
  const urlInput = document.getElementById('galleryPhotoUrlInput');
  const dataUrlHidden = document.getElementById('galleryPhotoDataUrl');
  const headerTitle = document.getElementById('galleryFormHeaderTitle');
  const btnSave = document.getElementById('btnSaveGalleryPhoto');

  if (editId) editId.value = item.id;
  if (titleInput) titleInput.value = item.title || '';
  if (categorySelect) categorySelect.value = item.category || 'Reunions';
  if (captionInput) captionInput.value = item.caption || '';
  if (dataUrlHidden) dataUrlHidden.value = item.image || '';

  if (item.image && (item.image.startsWith('http') || item.image.startsWith('images/'))) {
    if (urlInput) urlInput.value = item.image;
  } else {
    if (urlInput) urlInput.value = '';
  }

  // Display preview box
  const previewBox = document.getElementById('galleryPhotoPreviewBox');
  const previewImg = document.getElementById('galleryPreviewImg');
  const fileNameEl = document.getElementById('galleryPreviewFileName');
  const statusBadge = document.getElementById('galleryPreviewStatusBadge');

  if (previewImg) previewImg.src = item.image || '';
  if (fileNameEl) fileNameEl.textContent = item.title || 'Current Photo';
  if (statusBadge) statusBadge.textContent = 'Existing Photo Loaded';
  if (previewBox) previewBox.style.display = 'block';

  if (headerTitle) {
    headerTitle.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      <span>Edit Photo: "${escapeHtml(item.title)}"</span>
    `;
  }

  if (btnSave) {
    btnSave.innerHTML = `
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      Save Changes &amp; Update
    `;
  }

  if (card) {
    card.style.display = 'block';
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  if (titleInput) titleInput.focus();
};

window.deleteGalleryPhotoInAdmin = function(photoId) {
  const item = DataStore.findGalleryItemById(photoId);
  if (!item) return;

  if (confirm(`Are you sure you want to permanently delete this photo from the gallery?\n\n"${item.title}"\n\nThis will remove it immediately from both the administrative gallery and the public portal.`)) {
    DataStore.deleteGalleryItem(photoId);

    const editId = document.getElementById('galleryPhotoEditId');
    if (editId && editId.value === photoId) {
      cancelGalleryEdit();
    }

    renderAdminGallery();
    updateNewsGalleryBadgeCounts();

    if (typeof renderGallery === 'function') {
      renderGallery();
    }

    alert(`✓ Photo "${item.title}" has been deleted from the gallery.`);
  }
};

window.previewGalleryPhotoInAdmin = function(photoId) {
  const item = DataStore.findGalleryItemById(photoId);
  if (!item) return;

  if (typeof openGenericModal === 'function') {
    openGenericModal(`
      <div>
        <img src="${item.image || 'images/campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 100%; max-height: 480px; object-fit: contain; background: #0b1120; border-radius: var(--radius-lg) var(--radius-lg) 0 0;" onerror="this.src='images/campus.jpg'">
        <div style="padding: 1.75rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <span style="background: var(--cic-blue-50); color: var(--cic-blue-700); border: 1px solid var(--cic-blue-200); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; text-transform: uppercase;">
              ${escapeHtml(item.category || 'Gallery')}
            </span>
          </div>
          <h2 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.45rem; line-height: 1.35; margin-bottom: 0.75rem;">
            ${escapeHtml(item.title)}
          </h2>
          <p style="font-size: 0.96rem; color: var(--slate-700); line-height: 1.6; margin: 0;">
            ${escapeHtml(item.caption)}
          </p>
        </div>
      </div>
    `);
  } else {
    alert(`${item.title}\n\nCategory: ${item.category}\n\n${item.caption}`);
  }
};

function renderAdminGallery() {
  const container = document.getElementById('adminGalleryGrid');
  if (!container) return;

  const searchVal = (document.getElementById('adminSearchGallery')?.value || '').trim().toLowerCase();
  const categoryVal = document.getElementById('adminGalleryCategoryFilter')?.value || 'ALL';

  let galleryList = DataStore.getGallery();

  if (categoryVal !== 'ALL') {
    galleryList = galleryList.filter(g => (g.category || '').toLowerCase() === categoryVal.toLowerCase());
  }

  if (searchVal) {
    galleryList = galleryList.filter(g =>
      (g.title && g.title.toLowerCase().includes(searchVal)) ||
      (g.caption && g.caption.toLowerCase().includes(searchVal)) ||
      (g.category && g.category.toLowerCase().includes(searchVal))
    );
  }

  if (galleryList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--white); border: 1.5px dashed var(--slate-300); border-radius: var(--radius-xl);">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--slate-100); color: var(--slate-400); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        </div>
        <h4 style="color: var(--navy-900); font-weight: 700; margin-bottom: 0.35rem; font-family: var(--font-heading); font-size: 1.25rem;">No Photos Found in Archive</h4>
        <p style="color: var(--slate-500); font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem;">
          ${searchVal || categoryVal !== 'ALL' ? 'No photos match your active search keyword or category filter.' : 'There are currently no photos uploaded to the Alumni Gallery archive.'}
        </p>
        <button type="button" class="btn btn-primary" onclick="toggleAdminGalleryForm(true)" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          + Upload First Photo
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = galleryList.map(item => `
    <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease;" class="admin-gallery-card-item">
      <div style="position: relative; height: 210px; background: #0f172a; overflow: hidden; cursor: pointer;" onclick="previewGalleryPhotoInAdmin('${item.id}')">
        <img src="${item.image || 'images/campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onerror="this.src='images/campus.jpg'" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <div style="position: absolute; top: 12px; left: 12px;">
          <span style="background: rgba(15, 23, 42, 0.85); color: #fff; backdrop-filter: blur(4px); font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.2);">
            ${escapeHtml(item.category || 'General')}
          </span>
        </div>
      </div>
      <div style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
        <h4 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.08rem; font-weight: 700; margin-bottom: 0.4rem; line-height: 1.35;">
          ${escapeHtml(item.title)}
        </h4>
        <p style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 1.25rem; line-height: 1.5; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(item.caption || '')}
        </p>
        <div style="display: flex; gap: 0.5rem; align-items: center; border-top: 1px solid var(--slate-100); padding-top: 0.85rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-outline-light" onclick="previewGalleryPhotoInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: var(--cic-blue-700); border-color: var(--cic-blue-200); font-weight: 600;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="editGalleryPhotoInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: var(--slate-700); border-color: var(--slate-300); font-weight: 600;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="deleteGalleryPhotoInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.3rem 0.65rem; color: var(--danger); border-color: rgba(220, 38, 38, 0.3); font-weight: 600; margin-left: auto;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.renderAdminGallery = renderAdminGallery;
window.initAdminGalleryStudio = initAdminGalleryStudio;

/**
 * Switcher Helpers
 */
window.switchToIssueReceiptTab = function() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

  const issueBtn = document.querySelector('[data-pane="adminPane_IssueReceipt"]');
  const issuePane = document.getElementById('adminPane_IssueReceipt');
  if (issueBtn) issueBtn.classList.add('active');
  if (issuePane) issuePane.classList.add('active');

  initIssueReceiptStudio();
  const nameInput = document.getElementById('issueMemberName');
  if (nameInput) nameInput.focus();
};

window.switchToPaymentsTab = function() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

  const payBtn = document.querySelector('[data-pane="adminPane_Payments"]');
  const payPane = document.getElementById('adminPane_Payments');
  if (payBtn) payBtn.classList.add('active');
  if (payPane) payPane.classList.add('active');

  filterAndRenderPaymentsTable();
};

/**
 * Issue Member Dues Receipt Studio Controller
 */
const ALL_MONTHS_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function initIssueReceiptStudio() {
  const container = document.getElementById('issueMonthsGrid');
  const rateDisplay = document.getElementById('issueRateDisplay');
  const amountInput = document.getElementById('issueAmountInput');
  const dateInput = document.getElementById('issuePaymentDate');
  const categorySelect = document.getElementById('issueCategorySelect');
  const monthsBox = document.getElementById('issueMonthsContainer');

  const config = DataStore.getConfig();
  const duesRate = config.monthlyDuesRate || 5000;
  if (rateDisplay) rateDisplay.textContent = duesRate.toLocaleString();

  // Set today's date if empty
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Render 12 months checkboxes if container empty
  if (container && container.children.length === 0) {
    container.innerHTML = ALL_MONTHS_NAMES.map((m, idx) => `
      <label class="issue-month-label" id="label_issue_month_${idx}">
        <input type="checkbox" class="issue-month-checkbox" value="${m}" onchange="recalculateIssueDuesTotal()">
        <span>${m}</span>
      </label>
    `).join('');
  }

  // Bind category change
  if (categorySelect && !categorySelect.dataset.bound) {
    categorySelect.dataset.bound = 'true';
    categorySelect.addEventListener('change', () => {
      const cat = categorySelect.value;
      if (cat === 'Monthly Dues') {
        if (monthsBox) monthsBox.style.display = 'block';
        recalculateIssueDuesTotal();
      } else {
        if (monthsBox) monthsBox.style.display = 'none';
        const categories = DataStore.getCategories();
        const foundCat = categories.find(c => c.name.toLowerCase() === cat.toLowerCase());
        if (foundCat && amountInput) {
          amountInput.value = foundCat.baseAmount || 10000;
        }
      }
    });
  }

  recalculateIssueDuesTotal();
}

window.selectAllIssueMonths = function(select) {
  document.querySelectorAll('.issue-month-checkbox').forEach(cb => {
    cb.checked = !!select;
  });
  recalculateIssueDuesTotal();
};

window.recalculateIssueDuesTotal = function() {
  const categorySelect = document.getElementById('issueCategorySelect');
  if (categorySelect && categorySelect.value !== 'Monthly Dues') return;

  const config = DataStore.getConfig();
  const rate = config.monthlyDuesRate || 5000;
  let count = 0;

  document.querySelectorAll('.issue-month-checkbox').forEach((cb, idx) => {
    const label = document.getElementById(`label_issue_month_${idx}`);
    if (cb.checked) {
      count++;
      if (label) label.classList.add('checked');
    } else {
      if (label) label.classList.remove('checked');
    }
  });

  const amountInput = document.getElementById('issueAmountInput');
  if (amountInput) {
    amountInput.value = count > 0 ? (count * rate) : rate;
  }
};

/* ==========================================================================
   ADMIN: LEADERSHIP & MEMBERS MANAGEMENT LOGIC
   ========================================================================== */

let activeLeadershipMembersSubtab = 'leaders'; // 'leaders' | 'members' | 'bulk'

function updateLeadershipMembersCounts() {
  const leaders = DataStore.getLeadership() || [];
  const members = DataStore.getMembers() || [];
  const lCountEl = document.getElementById('badgeCountLeaders');
  const mCountEl = document.getElementById('badgeCountMembers');
  if (lCountEl) lCountEl.textContent = leaders.length.toString();
  if (mCountEl) mCountEl.textContent = members.length.toString();
}

function initAdminLeadershipMembers() {
  updateLeadershipMembersCounts();
  switchLeadershipMembersSubtab(activeLeadershipMembersSubtab);
}

window.switchLeadershipMembersSubtab = function(tab) {
  activeLeadershipMembersSubtab = tab;
  const leadersSec = document.getElementById('adminLeadersSection');
  const membersSec = document.getElementById('adminMembersSection');

  const subtabLeadersBtn = document.getElementById('subtabLeadersBtn');
  const subtabMembersBtn = document.getElementById('subtabMembersBtn');

  [subtabLeadersBtn, subtabMembersBtn].forEach(b => {
    if (b) b.classList.remove('active');
  });

  if (leadersSec) leadersSec.style.display = 'none';
  if (membersSec) membersSec.style.display = 'none';

  if (tab === 'members') {
    if (membersSec) membersSec.style.display = 'block';
    if (subtabMembersBtn) subtabMembersBtn.classList.add('active');
    renderAdminMembers();
  } else {
    if (leadersSec) leadersSec.style.display = 'block';
    if (subtabLeadersBtn) subtabLeadersBtn.classList.add('active');
    renderAdminLeadership();
  }
};

window.toggleAdminLeaderForm = function(forceClose) {
  const card = document.getElementById('adminLeaderFormCard');
  if (!card) return;
  if (forceClose || card.style.display === 'block') {
    card.style.display = 'none';
    resetAdminLeaderForm();
  } else {
    card.style.display = 'block';
    const nameInput = document.getElementById('leaderNameInput');
    if (nameInput) nameInput.focus();
  }
};

function resetAdminLeaderForm() {
  const form = document.getElementById('adminLeaderForm');
  if (form) form.reset();
  const idInput = document.getElementById('leaderEditId');
  if (idInput) idInput.value = '';
  const titleEl = document.getElementById('leaderFormHeaderTitle');
  if (titleEl) {
    titleEl.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      <span>Upload Executive Leadership Profile</span>
    `;
  }
  const previewImg = document.getElementById('leaderPhotoPreviewImg');
  if (previewImg) previewImg.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
  const customPos = document.getElementById('leaderCustomPositionInput');
  if (customPos) customPos.style.display = 'none';
}

window.handleLeaderPositionChange = function() {
  const sel = document.getElementById('leaderPositionSelect');
  const customPos = document.getElementById('leaderCustomPositionInput');
  if (sel && customPos) {
    if (sel.value === 'Other') {
      customPos.style.display = 'block';
      customPos.focus();
    } else {
      customPos.style.display = 'none';
    }
  }
};

window.handleAdminLeaderPhotoUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WebP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const previewImg = document.getElementById('leaderPhotoPreviewImg');
    const urlInput = document.getElementById('leaderPhotoUrlInput');
    if (previewImg) previewImg.src = dataUrl;
    if (urlInput) urlInput.value = dataUrl;
  };
  reader.readAsDataURL(file);
};

window.updateLeaderPhotoFromUrl = function(url) {
  if (url && url.trim()) {
    const previewImg = document.getElementById('leaderPhotoPreviewImg');
    if (previewImg) previewImg.src = url.trim();
  }
};

window.handleQuickLeaderUpload = function(event) {
  event.preventDefault();
  const positionInput = document.getElementById('quickLeaderPosition');
  const nameInput = document.getElementById('quickLeaderName');

  const position = (positionInput ? positionInput.value : '').trim();
  const name = (nameInput ? nameInput.value : '').trim();

  if (!position || !name) {
    alert('Please enter both the Executive Position and Full Name.');
    return;
  }

  const defaultBio = `${name} serves as ${position} on the Executive Leadership Council of the CIC Alumni 1995 Set.`;
  const newLeader = {
    id: 'lead-' + Date.now(),
    name: name,
    position: position,
    classYear: 'Class of 1995',
    phone: '',
    email: '',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: defaultBio
  };

  DataStore.addLeader(newLeader);

  if (positionInput) positionInput.value = '';
  if (nameInput) nameInput.value = '';

  if (typeof showReceiptToast === 'function') {
    showReceiptToast(`✓ Uploaded "${name}" as ${position}!`, 'success');
  } else {
    alert(`✓ Successfully uploaded ${name} as ${position}!`);
  }

  updateLeadershipMembersCounts();
  renderAdminLeadership();
  if (typeof renderLeadership === 'function') renderLeadership();
};

window.saveAdminLeader = function(event) {
  event.preventDefault();
  const name = document.getElementById('leaderNameInput').value.trim();
  let position = document.getElementById('leaderPositionSelect').value;
  if (position === 'Other') {
    const customPos = (document.getElementById('leaderCustomPositionInput').value || '').trim();
    position = customPos || 'Executive Member';
  }
  const classYear = (document.getElementById('leaderClassYearInput').value || '').trim() || 'Class of 1995';
  const phone = (document.getElementById('leaderPhoneInput').value || '').trim();
  const email = (document.getElementById('leaderEmailInput').value || '').trim();
  const photo = (document.getElementById('leaderPhotoUrlInput').value || '').trim() || document.getElementById('leaderPhotoPreviewImg').src;
  const bio = (document.getElementById('leaderBioInput').value || '').trim();
  const editId = (document.getElementById('leaderEditId').value || '').trim();

  if (!name || !position) {
    alert('Please enter both the Executive Position and Full Name.');
    return;
  }

  const defaultBio = `${name} serves as ${position} on the Executive Leadership Council of the CIC Alumni 1995 Set.`;
  const leaderPayload = {
    id: editId || 'lead-' + Date.now(),
    name,
    position,
    classYear,
    phone,
    email,
    photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: bio || defaultBio
  };

  if (editId) {
    DataStore.updateLeader(editId, leaderPayload);
    alert(`✓ Executive profile "${name}" successfully updated!`);
  } else {
    DataStore.addLeader(leaderPayload);
    alert(`✓ Executive "${name}" successfully uploaded and published to the website!`);
  }

  toggleAdminLeaderForm(true);
  updateLeadershipMembersCounts();
  renderAdminLeadership();

  if (typeof renderLeadership === 'function') {
    renderLeadership();
  }
};

window.editAdminLeader = function(id) {
  const leaders = DataStore.getLeadership();
  const leader = leaders.find(l => (l.id === id || String(leaders.indexOf(l)) === String(id)));
  if (!leader) return;

  const card = document.getElementById('adminLeaderFormCard');
  if (card) card.style.display = 'block';

  document.getElementById('leaderEditId').value = leader.id || id;
  document.getElementById('leaderNameInput').value = leader.name;
  
  const posSelect = document.getElementById('leaderPositionSelect');
  const customPos = document.getElementById('leaderCustomPositionInput');
  let matched = false;
  for (let opt of posSelect.options) {
    if (opt.value === leader.position) {
      posSelect.value = leader.position;
      matched = true;
      break;
    }
  }
  if (!matched) {
    posSelect.value = 'Other';
    if (customPos) {
      customPos.style.display = 'block';
      customPos.value = leader.position;
    }
  } else {
    if (customPos) customPos.style.display = 'none';
  }

  document.getElementById('leaderClassYearInput').value = leader.classYear || 'Class of 1995';
  document.getElementById('leaderPhoneInput').value = leader.phone || '';
  document.getElementById('leaderEmailInput').value = leader.email || '';
  document.getElementById('leaderPhotoUrlInput').value = leader.photo || '';
  document.getElementById('leaderPhotoPreviewImg').src = leader.photo || 'images/campus.jpg';
  document.getElementById('leaderBioInput').value = leader.bio || '';

  const titleEl = document.getElementById('leaderFormHeaderTitle');
  if (titleEl) {
    titleEl.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      <span>Edit Executive: ${escapeHtml(leader.name)}</span>
    `;
  }

  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteAdminLeader = function(id) {
  const leaders = DataStore.getLeadership();
  const leader = leaders.find(l => (l.id === id || String(leaders.indexOf(l)) === String(id)));
  const name = leader ? leader.name : 'this executive';
  if (confirm(`Are you sure you want to remove ${name} from the Executive Leadership Council?`)) {
    DataStore.deleteLeader(id);
    updateLeadershipMembersCounts();
    renderAdminLeadership();
    if (typeof renderLeadership === 'function') {
      renderLeadership();
    }
  }
};

function renderAdminLeadership() {
  const container = document.getElementById('adminLeadershipGrid');
  if (!container) return;

  const leaders = DataStore.getLeadership() || [];
  const query = (document.getElementById('adminSearchLeaders')?.value || '').toLowerCase().trim();

  const filtered = leaders.filter(l => {
    if (!query) return true;
    return (l.name || '').toLowerCase().includes(query) ||
           (l.position || '').toLowerCase().includes(query) ||
           (l.bio || '').toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--white); border-radius: var(--radius-lg); border: 1px dashed var(--slate-300);">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: var(--slate-400); margin: 0 auto 0.75rem auto;"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <h5 style="color: var(--navy-900); margin-bottom: 0.25rem;">No executive leaders found</h5>
        <p style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 1rem;">Click "+ Upload Executive" above or adjust your search filter.</p>
        <button type="button" class="btn btn-sm btn-primary" onclick="toggleAdminLeaderForm()">+ Upload Executive</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((l, idx) => {
    const leaderId = l.id || `lead-${idx}`;
    return `
      <div class="admin-leader-card">
        <div class="admin-leader-card-header">
          <img src="${escapeHtml(l.photo || 'images/campus.jpg')}" alt="${escapeHtml(l.name)}" class="admin-leader-avatar" onerror="this.src='images/campus.jpg'">
          <div style="flex: 1; min-width: 0;">
            <h5 style="font-family: var(--font-heading); color: var(--navy-900); font-size: 1.05rem; margin: 0 0 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(l.name)}
            </h5>
            <span style="display: inline-block; padding: 2px 8px; background: rgba(43, 87, 151, 0.12); color: var(--cic-blue-700); border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
              ${escapeHtml(l.position)}
            </span>
            <div style="font-size: 0.75rem; color: var(--slate-500); margin-top: 0.25rem;">${escapeHtml(l.classYear || 'Class of 1995')}</div>
          </div>
        </div>
        <div class="admin-leader-card-body">
          <p style="font-size: 0.82rem; color: var(--slate-600); line-height: 1.5; margin: 0 0 1rem 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(l.bio)}
          </p>
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: auto; border-top: 1px solid var(--slate-100); padding-top: 0.75rem;">
            <button type="button" class="btn btn-sm btn-outline-blue" onclick="editAdminLeader('${leaderId}')">
              ✏️ Edit
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteAdminLeader('${leaderId}')" style="color: #DC2626; border-color: #FCA5A5;">
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// ALUMNI MEMBERS DIRECTORY LOGIC
// ----------------------------------------------------

window.toggleAdminMemberForm = function(forceClose) {
  const card = document.getElementById('adminMemberFormCard');
  if (!card) return;
  if (forceClose || card.style.display === 'block') {
    card.style.display = 'none';
    resetAdminMemberForm();
  } else {
    card.style.display = 'block';
    const nameInput = document.getElementById('memberNameInput');
    if (nameInput) nameInput.focus();
  }
};

function resetAdminMemberForm() {
  const form = document.getElementById('adminMemberForm');
  if (form) form.reset();
  const idInput = document.getElementById('memberEditId');
  if (idInput) idInput.value = '';
  const titleEl = document.getElementById('memberFormHeaderTitle');
  if (titleEl) {
    titleEl.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
      <span>Register Alumni Member</span>
    `;
  }
}

window.handleQuickMemberUpload = function(event) {
  event.preventDefault();
  const nameInput = document.getElementById('quickMemberName');
  const emailInput = document.getElementById('quickMemberEmail');

  const name = (nameInput ? nameInput.value : '').trim();
  const email = (emailInput ? emailInput.value : '').trim();

  if (!name || !email) {
    alert('Please enter both Member Full Name and Email Address.');
    return;
  }

  const newMember = {
    id: 'mem-1995-' + Date.now(),
    name: name,
    email: email,
    phone: '',
    chapter: 'Enugu Central',
    classYear: 'Class of 1995',
    profession: 'Alumnus',
    duesStatus: 'Active',
    dateJoined: new Date().toISOString().split('T')[0]
  };

  DataStore.addMember(newMember);

  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';

  if (typeof showReceiptToast === 'function') {
    showReceiptToast(`✓ Uploaded member "${name}" (${email})!`, 'success');
  } else {
    alert(`✓ Successfully registered ${name} (${email}) into the roster!`);
  }

  updateLeadershipMembersCounts();
  renderAdminMembers();
};

window.saveAdminMember = function(event) {
  event.preventDefault();
  const name = document.getElementById('memberNameInput').value.trim();
  const email = (document.getElementById('memberEmailInput').value || '').trim();
  const phone = (document.getElementById('memberPhoneInput').value || '').trim();
  const chapter = document.getElementById('memberChapterSelect').value;
  const classYear = (document.getElementById('memberClassYearInput').value || '').trim() || 'Class of 1995';
  const profession = (document.getElementById('memberProfessionInput').value || '').trim() || 'Alumnus';
  const duesStatus = document.getElementById('memberDuesStatusSelect').value;
  const editId = (document.getElementById('memberEditId').value || '').trim();

  if (!name || !email) {
    alert('Please enter both Member Full Name and Email Address.');
    return;
  }

  const memberPayload = {
    id: editId || 'mem-1995-' + Date.now(),
    name,
    phone,
    email,
    chapter,
    classYear,
    profession,
    duesStatus,
    dateJoined: new Date().toISOString().split('T')[0]
  };

  if (editId) {
    DataStore.updateMember(editId, memberPayload);
    alert(`✓ Member record for "${name}" successfully updated!`);
  } else {
    DataStore.addMember(memberPayload);
    alert(`✓ Member "${name}" successfully registered into the Class of 1995 Roster!`);
  }

  toggleAdminMemberForm(true);
  updateLeadershipMembersCounts();
  renderAdminMembers();
};

window.editAdminMember = function(id) {
  const members = DataStore.getMembers();
  const m = members.find(item => item.id === id);
  if (!m) return;

  const card = document.getElementById('adminMemberFormCard');
  if (card) card.style.display = 'block';

  document.getElementById('memberEditId').value = m.id;
  document.getElementById('memberNameInput').value = m.name;
  document.getElementById('memberPhoneInput').value = m.phone || '';
  document.getElementById('memberEmailInput').value = m.email || '';
  document.getElementById('memberChapterSelect').value = m.chapter || 'Enugu Central';
  document.getElementById('memberClassYearInput').value = m.classYear || 'Class of 1995';
  document.getElementById('memberProfessionInput').value = m.profession || '';
  document.getElementById('memberDuesStatusSelect').value = m.duesStatus || 'Active';

  const titleEl = document.getElementById('memberFormHeaderTitle');
  if (titleEl) {
    titleEl.innerHTML = `
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      <span>Edit Member: ${escapeHtml(m.name)}</span>
    `;
  }

  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.deleteAdminMember = function(id) {
  const members = DataStore.getMembers();
  const m = members.find(item => item.id === id);
  const name = m ? m.name : 'this member';
  if (confirm(`Are you sure you want to remove ${name} from the Alumni Members roster?`)) {
    DataStore.deleteMember(id);
    updateLeadershipMembersCounts();
    renderAdminMembers();
  }
};

window.prefillIssueReceiptForMember = function(id) {
  const members = DataStore.getMembers();
  const m = members.find(item => item.id === id);
  if (!m) return;

  const issueTabBtn = document.getElementById('adminTabBtn_IssueReceipt');
  if (issueTabBtn) issueTabBtn.click();

  const nameInput = document.getElementById('issueMemberName');
  const phoneInput = document.getElementById('issueMemberPhone');
  const emailInput = document.getElementById('issueMemberEmail');
  const classInput = document.getElementById('issueMemberClassYear');

  if (nameInput) nameInput.value = m.name;
  if (phoneInput) phoneInput.value = m.phone;
  if (emailInput) emailInput.value = m.email || `${m.name.toLowerCase().replace(/\s+/g, '.')}@cic1995.org`;
  if (classInput) classInput.value = m.classYear || '1995';

  const form = document.getElementById('issueDuesReceiptForm');
  if (form) form.scrollIntoView({ behavior: 'smooth' });
};

function renderAdminMembers() {
  const tbody = document.getElementById('adminMembersTableBody');
  if (!tbody) return;

  const members = DataStore.getMembers() || [];
  const query = (document.getElementById('adminSearchMembers')?.value || '').toLowerCase().trim();
  const chapterFilter = document.getElementById('adminMemberChapterFilter')?.value || 'ALL';
  const statusFilter = document.getElementById('adminMemberStatusFilter')?.value || 'ALL';

  const filtered = members.filter(m => {
    if (chapterFilter !== 'ALL' && m.chapter !== chapterFilter) return false;
    if (statusFilter !== 'ALL' && m.duesStatus !== statusFilter) return false;
    if (!query) return true;
    return (m.name || '').toLowerCase().includes(query) ||
           (m.phone || '').toLowerCase().includes(query) ||
           (m.email || '').toLowerCase().includes(query) ||
           (m.profession || '').toLowerCase().includes(query) ||
           (m.chapter || '').toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--slate-500);">
          <div style="font-size: 1rem; font-weight: 600; color: var(--navy-900); margin-bottom: 0.25rem;">No alumni members match your criteria</div>
          <div style="font-size: 0.85rem; margin-bottom: 1rem;">Try clearing search filters or add members using the quick upload form above.</div>
          <button type="button" class="btn btn-sm btn-primary" onclick="toggleAdminMemberForm()">+ Add Single Member</button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    const initials = (m.name || 'Alumnus').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const isPaid = (m.duesStatus || '').toLowerCase() === 'active';
    const statusBadgeClass = isPaid ? 'status-badge successful' : 'status-badge';
    const statusBadgeStyle = isPaid
      ? 'background: rgba(34, 197, 94, 0.12); color: #15803D;'
      : 'background: rgba(234, 179, 8, 0.15); color: #A16207;';

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="admin-member-avatar-init">${initials}</div>
            <div>
              <strong style="color: var(--navy-900); font-size: 0.92rem;">${escapeHtml(m.name)}</strong>
              <div style="font-size: 0.75rem; color: var(--slate-500);">${escapeHtml(m.profession || 'Alumnus')}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; background: var(--cic-blue-50); color: var(--cic-blue-700); border: 1px solid var(--cic-blue-200); border-radius: 4px; font-size: 0.78rem; font-weight: 600;">
            ${escapeHtml(m.chapter || 'Enugu Central')}
          </span>
          <div style="font-size: 0.72rem; color: var(--slate-500); margin-top: 2px;">${escapeHtml(m.classYear || 'Class of 1995')}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--slate-700); font-size: 0.85rem;">${escapeHtml(m.phone || 'N/A')}</div>
          <div style="font-size: 0.78rem; color: var(--slate-500);">${escapeHtml(m.email || 'N/A')}</div>
        </td>
        <td>
          <span class="${statusBadgeClass}" style="${statusBadgeStyle}">
            ${escapeHtml(m.duesStatus || 'Active')}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-outline-blue" title="Issue Dues Receipt" onclick="prefillIssueReceiptForMember('${m.id}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; font-weight: 700;">
              + Issue Receipt
            </button>
            <button type="button" class="btn btn-sm btn-outline-light" title="Edit Member" onclick="editAdminMember('${m.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--slate-700);">
              ✏️
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" title="Delete Member" onclick="deleteAdminMember('${m.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: #DC2626; border-color: #FCA5A5;">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// BULK UPLOAD & CSV PROCESSING LOGIC
// ----------------------------------------------------

window.toggleAdminBulkUploadBar = function() {
  switchLeadershipMembersSubtab('bulk');
  const dropzone = document.getElementById('bulkUploadDropzone');
  if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth' });
};

window.handleAdminBulkCsvFile = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const displayEl = document.getElementById('bulkCsvFileNameDisplay');
  if (displayEl) {
    displayEl.innerHTML = `<strong>Selected file:</strong> ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const textArea = document.getElementById('bulkCsvTextInput');
    if (textArea) {
      textArea.value = text;
    }
  };
  reader.readAsText(file);
};

window.handleBulkTargetChange = function() {
  const targetSel = document.getElementById('bulkTargetSelect');
  if (!targetSel) return;
  const target = targetSel.value;

  const formatDisp = document.getElementById('bulkFormatDisplay');
  const textLabel = document.getElementById('bulkCsvTextInputLabel');
  const textInput = document.getElementById('bulkCsvTextInput');
  const btnL = document.getElementById('btnDownloadTemplateLeaders');
  const btnM = document.getElementById('btnDownloadTemplateMembers');
  const dropzoneTitle = document.getElementById('bulkDropzoneTitle');

  if (target === 'leadership') {
    if (formatDisp) formatDisp.innerHTML = '<code>Position, Name</code> (e.g. National President, Dr. Jude Okafor)';
    if (textLabel) textLabel.textContent = 'Paste Leadership Records (Position, Name) — One per line:';
    if (textInput) textInput.placeholder = 'National President, Dr. Jude Okafor\nVice President, Engr. Emeka Nwankwo\nFinancial Secretary, Engr. Ilo\nNational Treasurer, Dr. Chinwe Okonkwo\nGeneral Secretary, Barr. Tunde Balogun';
    if (btnL) btnL.style.display = 'inline-flex';
    if (btnM) btnM.style.display = 'none';
    if (dropzoneTitle) dropzoneTitle.textContent = 'Upload Leadership CSV (Position, Name)';
  } else {
    if (formatDisp) formatDisp.innerHTML = '<code>Name, Email Address</code> (e.g. Chukwuebuka Eze, ebuka.eze@example.com)';
    if (textLabel) textLabel.textContent = 'Paste Member Records (Name, Email Address) — One per line:';
    if (textInput) textInput.placeholder = 'Chukwuebuka O. Eze, ebuka.eze@example.com\nEngr. Michael Adebayo, m.adebayo@cic1995.org\nDr. Jude N. Eze, jude.eze@example.com\nArc. Emeka Nnamani, e.nnamani@archstudio.com';
    if (btnL) btnL.style.display = 'none';
    if (btnM) btnM.style.display = 'inline-flex';
    if (dropzoneTitle) dropzoneTitle.textContent = 'Upload Members CSV (Name, Email Address)';
  }
};

window.processAdminBulkRosterUpload = function() {
  const textInput = document.getElementById('bulkCsvTextInput');
  const targetSel = document.getElementById('bulkTargetSelect');
  const target = targetSel ? targetSel.value : 'members';
  const alertEl = document.getElementById('bulkUploadResultAlert');

  const rawText = (textInput ? textInput.value : '').trim();
  if (!rawText) {
    alert('Please choose a CSV file or paste spreadsheet rows into the space provided.');
    return;
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    alert('No readable data rows found.');
    return;
  }

  let startIdx = 0;
  const headerLower = lines[0].toLowerCase();
  if (headerLower.includes('name') || headerLower.includes('position') || headerLower.includes('email') || headerLower.includes('chapter')) {
    startIdx = 1;
  }

  const knownPositions = [
    'president', 'vice', 'secretary', 'treasurer', 'financial', 'pro', 'relations', 
    'welfare', 'officer', 'legal', 'adviser', 'ex-officio', 'chairman', 'director', 'provost'
  ];

  if (target === 'leadership') {
    let count = 0;
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1 && parts[0]) {
        let position = 'Executive Member';
        let name = parts[0];

        if (parts.length >= 2 && parts[1]) {
          const p0Lower = parts[0].toLowerCase();
          const isP0Pos = knownPositions.some(k => p0Lower.includes(k));
          if (isP0Pos) {
            position = parts[0];
            name = parts[1];
          } else {
            name = parts[0];
            position = parts[1];
          }
        }

        DataStore.addLeader({
          id: 'lead-' + Date.now() + '-' + i,
          name: name,
          position: position,
          classYear: parts[2] || 'Class of 1995',
          phone: parts[3] || '',
          email: parts[4] || '',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          bio: `${name} serves as ${position} on the Executive Leadership Council of the CIC Alumni 1995 Set.`
        });
        count++;
      }
    }

    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(34, 197, 94, 0.12)';
      alertEl.style.color = '#15803D';
      alertEl.style.border = '1px solid #86EFAC';
      alertEl.textContent = `✓ Successfully imported and published ${count} Executive Leadership profile(s) (Position & Name)!`;
    }

    if (typeof showReceiptToast === 'function') {
      showReceiptToast(`✓ Imported ${count} leadership profiles!`, 'success');
    } else {
      alert(`✓ Successfully imported and published ${count} Executive Leadership profile(s)!`);
    }

    updateLeadershipMembersCounts();
    switchLeadershipMembersSubtab('leaders');
    if (typeof renderLeadership === 'function') renderLeadership();

  } else {
    let count = 0;
    const membersToInsert = [];

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(/[,\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1 && parts[0]) {
        let name = parts[0];
        let email = '';

        if (parts.length >= 2 && parts[1]) {
          if (parts[1].includes('@')) {
            name = parts[0];
            email = parts[1];
          } else if (parts[0].includes('@')) {
            email = parts[0];
            name = parts[1];
          } else {
            name = parts[0];
            email = parts[1];
          }
        } else {
          email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@cic1995.org`;
        }

        membersToInsert.push({
          name: name,
          email: email,
          phone: parts[2] || '',
          chapter: parts[3] || 'Enugu Central',
          classYear: parts[4] || 'Class of 1995',
          profession: parts[5] || 'Alumnus',
          duesStatus: parts[6] || 'Active'
        });
      }
    }

    const added = DataStore.bulkAddMembers(membersToInsert);

    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(34, 197, 94, 0.12)';
      alertEl.style.color = '#15803D';
      alertEl.style.border = '1px solid #86EFAC';
      alertEl.textContent = `✓ Successfully imported ${added} Alumni Member(s) with Name & Email Address!`;
    }

    if (typeof showReceiptToast === 'function') {
      showReceiptToast(`✓ Imported ${added} members into roster!`, 'success');
    } else {
      alert(`✓ Successfully imported ${added} Alumni Member(s) into the Class of 1995 Roster!`);
    }

    updateLeadershipMembersCounts();
    switchLeadershipMembersSubtab('members');
  }

  if (textInput) textInput.value = '';
};

window.downloadLeadershipCsvTemplate = function() {
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
    'Position,Name\n' +
    'National President,Dr. Jude O. Okafor\n' +
    'Vice President,Engr. Emeka Nwankwo\n' +
    'Financial Secretary,Engr. Ilo\n' +
    'National Treasurer,Dr. Chinwe Okonkwo\n' +
    'General Secretary,Barr. Tunde Balogun\n' +
    'Public Relations Officer,Mr. Franklyn Chukwuma\n' +
    'National Welfare Officer,Arc. Emeka Nnamani\n' +
    'Legal Adviser,Barr. Obinna Umeh'
  );
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', 'CIC_Leadership_Position_Name_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.downloadMembersCsvTemplate = function() {
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
    'Name,Email\n' +
    'Chukwuebuka O. Eze,ebuka.eze@example.com\n' +
    'Engr. Michael C. Adebayo,m.adebayo@cic1995.org\n' +
    'Dr. Chinwe E. Okonkwo,c.okonkwo@cic1995.org\n' +
    'Barr. Tunde O. Balogun,tunde.balogun@legalpartners.ng\n' +
    'Mr. Franklyn I. Chukwuma,f.chukwuma@fincapital.com\n' +
    'Arc. Emeka J. Nnamani,e.nnamani@archstudio.com'
  );
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', 'CIC_Members_Name_Email_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.exportMembersToCSV = function() {
  const members = DataStore.getMembers();
  if (!members || members.length === 0) {
    alert('No members available to export.');
    return;
  }

  let csv = 'ID,Name,ClassYear,Chapter,Profession,Phone,Email,DuesStatus,DateJoined\n';
  members.forEach(m => {
    const row = [
      m.id || '',
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.classYear || '').replace(/"/g, '""')}"`,
      `"${(m.chapter || '').replace(/"/g, '""')}"`,
      `"${(m.profession || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.duesStatus || '').replace(/"/g, '""')}"`,
      `"${(m.dateJoined || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CIC_1995_Alumni_Members_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};



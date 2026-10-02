/**
 * High Alumni Association - Administrator Portal Logic
 * Provides secure analytics, payments ledger, dues rate configurator,
 * category manager, CSV export, and content management.
 */

let isAdminAuthenticated = false;

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

  // Update gate display credentials
  updateAdminGateCredentialsDisplay();

  // Load Admin Dashboard directly on admin page
  const mainDashboard = document.getElementById('adminMainDashboard');
  if (mainDashboard) {
    isAdminAuthenticated = true;
    mainDashboard.style.display = 'flex';
    loadAdminDashboardData();
  }

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
          errEl.textContent = 'Invalid email or password. Please check the Login Information box below.';
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

  // Admin Nav Tab Switching
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const paneId = btn.dataset.pane;
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add('active');

      if (paneId === 'adminPane_MonthlyDues') {
        renderAdminMonthlyDuesTable();
      } else if (paneId === 'adminPane_Categories') {
        renderAdminCategories();
      } else if (paneId === 'adminPane_Events') {
        renderAdminEvents();
      } else if (paneId === 'adminPane_Projects') {
        renderAdminProjects();
      } else if (paneId === 'adminPane_CreateProject') {
        initAdminProjectsStudio();
        const titleInput = document.getElementById('newProjectTitle');
        if (titleInput) titleInput.focus();
      } else if (paneId === 'adminPane_IssueReceipt') {
        initIssueReceiptStudio();
        const nameInput = document.getElementById('issueMemberName');
        if (nameInput) nameInput.focus();
      } else if (paneId === 'adminPane_News') {
        initAdminNewsStudio();
        renderAdminNews();
      } else if (paneId === 'adminPane_LeadershipMembers') {
        initAdminLeadershipMembers();
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
      const image = document.getElementById('newProjectImage').value.trim() || 'campus.jpg';
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
      if (imgInput) imgInput.value = 'campus.jpg';

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

      // Refresh admin tables and KPI cards
      loadAdminDashboardData();
      renderAdminMonthlyDuesTable();

      alert(`✓ Official Receipt #${receiptNumber} generated successfully for ${name} (Amount: ₦${amount.toLocaleString()})!`);

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
  const pin = (typeof DataStore !== 'undefined' && DataStore.getAdminPin) ? DataStore.getAdminPin() : 'admin123';
  const email = (typeof DataStore !== 'undefined' && DataStore.getAdminEmail) ? DataStore.getAdminEmail() : 'admin@cic1995.org';

  const gatePinEl = document.getElementById('gateAdminPinDisplay');
  if (gatePinEl) gatePinEl.textContent = pin;

  const gateEmailEl = document.getElementById('gateAdminEmailDisplay');
  if (gateEmailEl) gateEmailEl.textContent = email;

  const settingsPinEl = document.getElementById('displaySettingsPin');
  if (settingsPinEl) settingsPinEl.textContent = pin;

  const settingsEmailEl = document.getElementById('displaySettingsEmail');
  if (settingsEmailEl) settingsEmailEl.textContent = email;

  const settingEmailInput = document.getElementById('settingAdminEmail');
  if (settingEmailInput) settingEmailInput.value = email;
};

window.autofillGatePin = function() {
  const pin = (typeof DataStore !== 'undefined' && DataStore.getAdminPin) ? DataStore.getAdminPin() : 'admin123';
  const email = (typeof DataStore !== 'undefined' && DataStore.getAdminEmail) ? DataStore.getAdminEmail() : 'admin@cic1995.org';
  const emailInput = document.getElementById('adminGateEmail');
  const pinInput = document.getElementById('adminPinInput');
  if (emailInput) emailInput.value = email;
  if (pinInput) pinInput.value = pin;
  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
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
    window.location.href = 'index.html?openAdmin=true';
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
    catFilter.innerHTML = `<option value="ALL">All Categories</option>` +
      categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  // Render payments table
  filterAndRenderPaymentsTable();

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

/**
 * Filter & Render Payments Ledger
 */
function filterAndRenderPaymentsTable() {
  const container = document.getElementById('adminPaymentsTableBody');
  if (!container) return;

  const payments = DataStore.getPayments();
  const searchInput = document.getElementById('adminSearchPayments');
  const catFilter = document.getElementById('adminCategoryFilter');

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const catVal = catFilter ? catFilter.value : 'ALL';

  const filtered = payments.filter(p => {
    const matchesCat = catVal === 'ALL' || p.paymentType === catVal;
    const matchesQuery = !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.reference && p.reference.toLowerCase().includes(query)) ||
      (p.receiptNumber && p.receiptNumber.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--slate-500); padding: 2rem;">No matching payment records found.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <tr>
      <td style="font-family: monospace; font-weight: 700; color: var(--navy-900);">
        ${p.reference}
        <div style="font-size: 0.72rem; color: var(--slate-500);">${p.receiptNumber || ''}</div>
      </td>
      <td>
        <strong>${p.name}</strong>
        <div style="font-size: 0.78rem; color: var(--slate-500);">${p.email} &bull; ${p.phone}</div>
      </td>
      <td>
        <span style="font-weight: 600; color: var(--blue-800);">${p.paymentType}</span>
        ${p.selectedMonths && p.selectedMonths.length > 0 ? `<div style="font-size: 0.75rem; color: var(--blue-600); font-weight: 600;">${p.selectedMonths.join(', ')}</div>` : ''}
      </td>
      <td style="font-weight: 800; color: var(--navy-900);">
        ₦${p.amount.toLocaleString()}
      </td>
      <td>
        <span style="font-size: 0.8rem; font-weight: 600;">${p.gateway}</span>
        <div style="font-size: 0.72rem; color: var(--slate-500);">${p.channel}</div>
      </td>
      <td style="font-size: 0.8rem; color: var(--slate-600); white-space: nowrap;">
        ${p.date}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-gold" onclick="viewReceiptInAdmin('${p.reference}')">
          Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

window.viewReceiptInAdmin = function(ref) {
  if (typeof openOfficialReceiptModal === 'function') {
    openOfficialReceiptModal(ref);
  } else {
    const payment = DataStore.findPaymentByRef(ref);
    if (payment) {
      alert(`Payment Reference: ${payment.reference}\nReceipt #: ${payment.receiptNumber}\nPayer: ${payment.name}\nAmount: ₦${payment.amount.toLocaleString()}`);
    }
  }
};

/**
 * Export Payments Ledger to CSV
 */
function exportPaymentsToCSV() {
  const payments = DataStore.getPayments();
  if (payments.length === 0) {
    alert('No payment records to export.');
    return;
  }

  const headers = ['Reference', 'Receipt Number', 'Payer Name', 'Phone', 'Email', 'Class Year', 'Payment Type', 'Amount (NGN)', 'Months', 'Gateway', 'Channel', 'Status', 'Date'];
  
  const rows = payments.map(p => [
    `"${p.reference}"`,
    `"${p.receiptNumber || ''}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.phone || ''}"`,
    `"${p.email || ''}"`,
    `"${p.classYear || ''}"`,
    `"${p.paymentType || ''}"`,
    p.amount,
    `"${(p.selectedMonths || []).join(', ')}"`,
    `"${p.gateway || ''}"`,
    `"${p.channel || ''}"`,
    `"${p.status || 'Successful'}"`,
    `"${p.date || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `High_Alumni_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Monthly Dues Tab Tracker
 */
function renderAdminMonthlyDuesTable() {
  const container = document.getElementById('adminMonthlyDuesTableBody');
  if (!container) return;

  const payments = DataStore.getPayments().filter(p => p.paymentType === 'Monthly Dues');
  const config = DataStore.getConfig();

  let totalDuesCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  setElText('adminDuesTotalCollected', `₦${totalDuesCollected.toLocaleString()}`);

  if (payments.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No monthly dues records found.</td></tr>`;
    return;
  }

  container.innerHTML = payments.map(p => `
    <tr>
      <td><strong>${p.name}</strong><br><span style="font-size: 0.75rem; color: var(--slate-500);">${p.phone}</span></td>
      <td>
        <span style="font-weight: 700; color: var(--navy-900);">${(p.selectedMonths || []).length} Month(s)</span>
        <div style="font-size: 0.78rem; color: var(--slate-600);">${(p.selectedMonths || []).join(', ')}</div>
      </td>
      <td style="font-weight: 800; color: var(--navy-900);">₦${p.amount.toLocaleString()}</td>
      <td style="font-size: 0.8rem; color: var(--slate-600);">${p.date}</td>
      <td><span class="status-badge successful">Cleared</span></td>
    </tr>
  `).join('');
}

/**
 * Payment Categories Manager
 */
function renderAdminCategories() {
  const container = document.getElementById('adminCategoriesList');
  if (!container) return;

  const categories = DataStore.getCategories();
  container.innerHTML = categories.map((cat, idx) => `
    <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="color: var(--navy-900); font-weight: 700;">${cat.name}</h4>
        <div style="font-size: 0.8rem; color: var(--slate-500);">Type: <strong>${cat.type.toUpperCase()}</strong> &bull; Base Rate: <strong>₦${cat.baseAmount.toLocaleString()}</strong></div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span class="status-badge ${cat.active ? 'successful' : ''}" style="${!cat.active ? 'background: var(--slate-200); color: var(--slate-600);' : ''}">
          ${cat.active ? 'Active' : 'Disabled'}
        </span>
        <button class="btn btn-sm ${cat.active ? 'btn-navy' : 'btn-primary'}" onclick="toggleCategoryStatus(${idx})">
          ${cat.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  `).join('');
}

window.toggleCategoryStatus = function(idx) {
  const cats = DataStore.getCategories();
  if (cats[idx]) {
    cats[idx].active = !cats[idx].active;
    DataStore.saveCategories(cats);
    renderAdminCategories();
    renderCategoryCards();
  }
};

/**
 * Admin Events Management
 */
function renderAdminEvents() {
  const container = document.getElementById('adminEventsList');
  if (!container) return;

  const events = DataStore.getEvents();
  container.innerHTML = events.map((evt, idx) => `
    <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h4 style="color: var(--navy-900); font-weight: 700;">${evt.title}</h4>
        <div style="font-size: 0.8rem; color: var(--slate-500);">${evt.displayDate} &bull; Fee: ₦${evt.fee.toLocaleString()} &bull; Status: <strong>${evt.status}</strong></div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-sm btn-outline-gold" onclick="deleteEvent(${idx})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.deleteEvent = function(idx) {
  if (confirm('Are you sure you want to delete this event?')) {
    const events = DataStore.getEvents();
    events.splice(idx, 1);
    DataStore.saveEvents(events);
    renderAdminEvents();
    renderEvents();
  }
};

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
    const image = imageInput && imageInput.value.trim() ? imageInput.value.trim() : 'campus.jpg';
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

  // Bind preset helper globally
  window.setProjectStudioImage = function(url) {
    if (imageInput) {
      imageInput.value = url;
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
      const image = (imageInput.value || 'campus.jpg').trim();
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
  if (imageInput) imageInput.value = 'campus.jpg';

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
          <img src="${prj.image}" alt="${escapeHtml(prj.title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='campus.jpg'">
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
  if (imageInput) imageInput.value = prj.image || 'campus.jpg';
  if (descInput) descInput.value = prj.description || '';

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
 * Admin News & Announcements Publishing Studio Controller
 */
function initAdminNewsStudio() {
  const form = document.getElementById('adminNewsForm');
  const dateInput = document.getElementById('newsDateInput');
  const searchInput = document.getElementById('adminSearchNews');
  const categoryFilter = document.getElementById('adminNewsCategoryFilter');

  // Set default today's date if empty
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
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
      const image = document.getElementById('newsImageInput').value.trim() || 'campus.jpg';
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
  const card = document.getElementById('adminNewsFormCard');
  if (!card) return;

  const isHidden = card.style.display === 'none' || !card.style.display;
  const shouldOpen = forceOpen !== undefined ? forceOpen : isHidden;

  if (shouldOpen) {
    card.style.display = 'block';
    const titleInput = document.getElementById('newsTitleInput');
    if (titleInput) titleInput.focus();
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    cancelNewsEdit();
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
  if (imageInput) imageInput.value = item.image || 'campus.jpg';
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
        <img src="${item.image || 'campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-lg) var(--radius-lg) 0 0;" onerror="this.src='campus.jpg'">
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

function renderAdminNews() {
  const container = document.getElementById('adminNewsList');
  if (!container) return;

  const searchVal = (document.getElementById('adminSearchNews')?.value || '').trim().toLowerCase();
  const categoryVal = document.getElementById('adminNewsCategoryFilter')?.value || 'ALL';

  let newsList = DataStore.getNews();

  if (categoryVal !== 'ALL') {
    newsList = newsList.filter(n => (n.category || '').toLowerCase() === categoryVal.toLowerCase());
  }

  if (searchVal) {
    newsList = newsList.filter(n =>
      (n.title && n.title.toLowerCase().includes(searchVal)) ||
      (n.summary && n.summary.toLowerCase().includes(searchVal)) ||
      (n.content && n.content.toLowerCase().includes(searchVal)) ||
      (n.category && n.category.toLowerCase().includes(searchVal)) ||
      (n.date && n.date.includes(searchVal))
    );
  }

  if (newsList.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem; background: var(--white); border: 1px dashed var(--slate-300); border-radius: var(--radius-lg);">
        <svg width="40" height="40" fill="none" stroke="var(--slate-400)" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 0.75rem;"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <h4 style="color: var(--navy-900); font-weight: 700; margin-bottom: 0.25rem;">No Bulletins or Announcements Found</h4>
        <p style="color: var(--slate-500); font-size: 0.88rem; max-width: 420px; margin: 0 auto 1.25rem;">
          ${searchVal || categoryVal !== 'ALL' ? 'No records match your active search and category filters.' : 'There are currently no published articles in the alumni archive.'}
        </p>
        <button type="button" class="btn btn-primary btn-sm" onclick="toggleAdminNewsForm(true)">
          + Publish First Announcement
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = newsList.map(item => `
    <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); display: flex; gap: 1.25rem; align-items: flex-start; transition: var(--transition);" class="admin-news-card-item">
      <img src="${item.image || 'campus.jpg'}" alt="${escapeHtml(item.title)}" style="width: 110px; height: 85px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--slate-200); flex-shrink: 0;" onerror="this.src='campus.jpg'">
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
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-sm btn-outline-light" onclick="previewNewsArticleInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.25rem 0.65rem; color: var(--cic-blue-700); border-color: var(--cic-blue-200);">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview Article
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="editNewsInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.25rem 0.65rem; color: var(--slate-700); border-color: var(--slate-300);">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit Notice
          </button>
          <button type="button" class="btn btn-sm btn-outline-light" onclick="deleteNewsInAdmin('${item.id}')" style="font-size: 0.78rem; padding: 0.25rem 0.65rem; color: var(--danger); border-color: rgba(220, 38, 38, 0.3);">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 2px;"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.renderAdminNews = renderAdminNews;

window.switchToNewsTab = function() {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));

  const newsBtn = document.querySelector('[data-pane="adminPane_News"]');
  const newsPane = document.getElementById('adminPane_News');
  if (newsBtn) newsBtn.classList.add('active');
  if (newsPane) newsPane.classList.add('active');

  initAdminNewsStudio();
  renderAdminNews();
};

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
 * Monthly Dues Tracker Table
 */
function renderAdminMonthlyDuesTable() {
  const container = document.getElementById('adminMonthlyDuesTableBody');
  const totalDisplay = document.getElementById('adminDuesTotalCollected');
  if (!container) return;

  const payments = DataStore.getPayments();
  const duesPayments = payments.filter(p => p.paymentType === 'Monthly Dues' || (p.selectedMonths && p.selectedMonths.length > 0));

  let totalDues = 0;
  duesPayments.forEach(p => totalDues += Number(p.amount || 0));
  if (totalDisplay) totalDisplay.textContent = `₦${totalDues.toLocaleString()}`;

  if (duesPayments.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--slate-500); padding: 2rem;">No monthly dues records recorded yet.</td></tr>`;
    return;
  }

  container.innerHTML = duesPayments.map(p => {
    const monthsStr = (p.selectedMonths && p.selectedMonths.length > 0)
      ? p.selectedMonths.join(', ')
      : 'Class Statutory Period';
    return `
      <tr>
        <td>
          <strong style="color: var(--navy-900);">${escapeHtml(p.name)}</strong>
          <div style="font-size: 0.78rem; color: var(--slate-500);">${escapeHtml(p.phone || p.email || 'N/A')}</div>
        </td>
        <td>
          <span style="display: inline-block; padding: 2px 8px; background: rgba(43, 87, 151, 0.08); color: var(--cic-blue-700); border-radius: 4px; font-size: 0.8rem; font-weight: 600;">
            ${escapeHtml(monthsStr)}
          </span>
        </td>
        <td style="font-weight: 800; color: var(--navy-900);">
          ₦${Number(p.amount || 0).toLocaleString()}
        </td>
        <td style="font-size: 0.82rem; color: var(--slate-600); white-space: nowrap;">
          ${escapeHtml(p.date || 'N/A')}
        </td>
        <td>
          <span class="status-badge successful">Cleared</span>
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-gold" onclick="viewReceiptInAdmin('${p.reference}')">
            Receipt
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

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
  const bulkSec = document.getElementById('adminBulkUploadSection');

  const subtabLeadersBtn = document.getElementById('subtabLeadersBtn');
  const subtabMembersBtn = document.getElementById('subtabMembersBtn');
  const subtabBulkBtn = document.getElementById('subtabBulkBtn');

  [subtabLeadersBtn, subtabMembersBtn, subtabBulkBtn].forEach(b => {
    if (b) b.classList.remove('active');
  });

  if (leadersSec) leadersSec.style.display = 'none';
  if (membersSec) membersSec.style.display = 'none';
  if (bulkSec) bulkSec.style.display = 'none';

  if (tab === 'leaders') {
    if (leadersSec) leadersSec.style.display = 'block';
    if (subtabLeadersBtn) subtabLeadersBtn.classList.add('active');
    renderAdminLeadership();
  } else if (tab === 'members') {
    if (membersSec) membersSec.style.display = 'block';
    if (subtabMembersBtn) subtabMembersBtn.classList.add('active');
    renderAdminMembers();
  } else if (tab === 'bulk') {
    if (bulkSec) bulkSec.style.display = 'block';
    if (subtabBulkBtn) subtabBulkBtn.classList.add('active');
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

  if (!name || !bio) {
    alert('Please complete all required fields.');
    return;
  }

  const leaderPayload = {
    id: editId || 'lead-' + Date.now(),
    name,
    position,
    classYear,
    phone,
    email,
    photo,
    bio
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
  document.getElementById('leaderPhotoPreviewImg').src = leader.photo || 'campus.jpg';
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
          <img src="${escapeHtml(l.photo || 'campus.jpg')}" alt="${escapeHtml(l.name)}" class="admin-leader-avatar" onerror="this.src='campus.jpg'">
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

window.saveAdminMember = function(event) {
  event.preventDefault();
  const name = document.getElementById('memberNameInput').value.trim();
  const phone = document.getElementById('memberPhoneInput').value.trim();
  const email = (document.getElementById('memberEmailInput').value || '').trim();
  const chapter = document.getElementById('memberChapterSelect').value;
  const classYear = (document.getElementById('memberClassYearInput').value || '').trim() || 'Class of 1995';
  const profession = (document.getElementById('memberProfessionInput').value || '').trim() || 'Alumnus';
  const duesStatus = document.getElementById('memberDuesStatusSelect').value;
  const editId = (document.getElementById('memberEditId').value || '').trim();

  if (!name || !phone) {
    alert('Please enter member name and contact phone number.');
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
          <div style="font-size: 0.85rem; margin-bottom: 1rem;">Try clearing search filters or add members using the Bulk Upload bar.</div>
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

window.processAdminBulkRosterUpload = function() {
  const textInput = document.getElementById('bulkCsvTextInput');
  const target = document.getElementById('bulkTargetSelect').value;
  const alertEl = document.getElementById('bulkUploadResultAlert');

  const rawText = (textInput ? textInput.value : '').trim();
  if (!rawText) {
    alert('Please choose a CSV file or paste spreadsheet rows in the text area.');
    return;
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    alert('No readable data rows found.');
    return;
  }

  let startIdx = 0;
  const headerLower = lines[0].toLowerCase();
  if (headerLower.includes('name') || headerLower.includes('chapter') || headerLower.includes('email') || headerLower.includes('position')) {
    startIdx = 1;
  }

  const parsedItems = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/[,\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length >= 1 && parts[0]) {
      parsedItems.push({
        name: parts[0],
        secondary: parts[1] || '',
        phone: parts[2] || '',
        email: parts[3] || '',
        classYear: parts[4] || 'Class of 1995',
        profession: parts[5] || 'Alumnus',
        status: parts[6] || 'Active'
      });
    }
  }

  if (parsedItems.length === 0) {
    alert('Could not parse any valid records from the provided content.');
    return;
  }

  if (target === 'leadership') {
    let count = 0;
    parsedItems.forEach((item, idx) => {
      DataStore.addLeader({
        id: 'lead-' + Date.now() + '-' + idx,
        name: item.name,
        position: item.secondary || 'Executive Committee Member',
        classYear: item.classYear || 'Class of 1995',
        phone: item.phone || '',
        email: item.email || '',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        bio: `${item.name} serves the CIC Alumni 1995 Set Executive Leadership Council.`
      });
      count++;
    });

    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(34, 197, 94, 0.12)';
      alertEl.style.color = '#15803D';
      alertEl.style.border = '1px solid #86EFAC';
      alertEl.textContent = `✓ Successfully imported ${count} Executive Leadership profile(s)!`;
    }

    alert(`✓ Successfully imported and published ${count} Executive Leadership profile(s)!`);
    updateLeadershipMembersCounts();
    switchLeadershipMembersSubtab('leaders');
    if (typeof renderLeadership === 'function') renderLeadership();

  } else {
    const membersToInsert = parsedItems.map(item => ({
      name: item.name,
      chapter: item.secondary || 'Enugu Central',
      phone: item.phone,
      email: item.email,
      classYear: item.classYear || 'Class of 1995',
      profession: item.profession || 'Alumnus',
      duesStatus: item.status || 'Active'
    }));

    const added = DataStore.bulkAddMembers(membersToInsert);

    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(34, 197, 94, 0.12)';
      alertEl.style.color = '#15803D';
      alertEl.style.border = '1px solid #86EFAC';
      alertEl.textContent = `✓ Successfully imported ${added} Alumni Member(s) into the Class of 1995 Roster!`;
    }

    alert(`✓ Successfully imported ${added} Alumni Member(s) into the Class of 1995 Roster!`);
    updateLeadershipMembersCounts();
    switchLeadershipMembersSubtab('members');
  }

  if (textInput) textInput.value = '';
};

window.downloadMembersCsvTemplate = function() {
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(
    'Name,ChapterOrPosition,Phone,Email,ClassYear,Profession,Status\n' +
    'Engr. Michael C. Adebayo,Lagos Main,08034521109,m.adebayo@cic1995.org,Class of 1995,Civil Engineer,Active\n' +
    'Dr. (Mrs.) Chinwe E. Okonkwo,Enugu Central,08029814452,c.okonkwo@cic1995.org,Class of 1995,Consultant Pediatrician,Active\n' +
    'Barr. Tunde O. Balogun,Abuja FCT,08187762210,tunde.balogun@legalpartners.ng,Class of 1995,Senior Counsel,Active\n' +
    'Mr. Franklyn I. Chukwuma,Lagos Main,07031189033,f.chukwuma@fincapital.com,Class of 1995,Chartered Accountant,Active\n' +
    'Arc. Emeka J. Nnamani,Enugu Central,08039923411,e.nnamani@archstudio.com,Class of 1995,Principal Architect,Active'
  );
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', 'cic_alumni_1995_members_template.csv');
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



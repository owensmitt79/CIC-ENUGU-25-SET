/**
 * CIC Enugu 1995 Alumni Association Portal
 * REST API Client & LocalStorage Sync Adapter
 * Connects the static frontend to the live Node.js Express backend.
 * 
 * Default Backend URL: http://localhost:5050
 * Default API Endpoint: http://localhost:5050/api
 */

(function (window) {
  'use strict';

  const LIVE_BACKEND_URL = 'http://localhost:5050';
  const LIVE_API_BASE = `${LIVE_BACKEND_URL}/api`;

  // Determine API base URL (checks localStorage override first, then live Render backend)
  const determineInitialBaseUrl = function () {
    try {
      if (typeof localStorage !== 'undefined') {
        const customUrl = localStorage.getItem('cic_backend_url');
        if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
          const trimmed = customUrl.trim().replace(/\/$/, '');
          return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
        }
      }
    } catch (_) {}
    return LIVE_API_BASE;
  };

  const ApiClient = {
    backendUrl: LIVE_BACKEND_URL,
    baseUrl: determineInitialBaseUrl(),
    isOnline: false,
    lastPingCheck: 0,

    /**
     * Set custom API Base URL dynamically
     */
    setBaseUrl(url) {
      if (!url) return;
      const clean = String(url).trim().replace(/\/$/, '');
      this.baseUrl = clean.endsWith('/api') ? clean : `${clean}/api`;
      this.backendUrl = clean.replace(/\/api$/, '');
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('cic_backend_url', this.baseUrl);
        }
      } catch (_) {}
      console.log(`[ApiClient] Base URL updated to: ${this.baseUrl}`);
    },

    /**
     * Check if Node.js backend is accessible with 15s timeout
     */
    async ping() {
      const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;

      try {
        const res = await fetch(`${this.baseUrl}/`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller ? controller.signal : undefined
        });
        if (timer) clearTimeout(timer);
        const data = await res.json();
        this.isOnline = Boolean(data && data.status === 'online');
        this.lastPingCheck = Date.now();
      } catch (_) {
        if (timer) clearTimeout(timer);
        this.isOnline = false;
        this.lastPingCheck = Date.now();
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apiclient:status', {
          detail: { isOnline: this.isOnline, backendUrl: this.backendUrl, baseUrl: this.baseUrl }
        }));
      }

      return this.isOnline;
    },

    /**
     * Standard Fetch Wrapper with HttpOnly cookie support & Bearer fallback
     */
    async request(endpoint, options = {}) {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

      const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
      };

      // Add Authorization header if client token exists in localStorage
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cic_admin_token') : null;
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
      }

      const fetchOptions = {
        credentials: 'include', // Passes HttpOnly JWT cookies across CORS
        ...options,
        headers
      };

      try {
        const response = await fetch(url, fetchOptions);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const errMsg = (data && data.message) ? data.message : `Request failed with status ${response.status}`;
          throw new Error(errMsg);
        }

        return data;
      } catch (err) {
        console.warn(`[ApiClient] Request to ${endpoint} failed:`, err.message);
        throw err;
      }
    },

    // -------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------
    Auth: {
      async login(email, password, pin) {
        const res = await ApiClient.request('/auth/login', {
          method: 'POST',
          body: { email, password, pin }
        });
        if (res?.user && typeof localStorage !== 'undefined') {
          localStorage.setItem('cic_admin_user', JSON.stringify(res.user));
          if (res.token) {
            localStorage.setItem('cic_admin_token', res.token);
          }
        }
        return res;
      },

      async logout() {
        try {
          await ApiClient.request('/auth/logout', { method: 'POST' });
        } catch (_) {}
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('cic_admin_token');
          localStorage.removeItem('cic_admin_user');
        }
        return true;
      },

      async getMe() {
        return ApiClient.request('/auth/me');
      },

      async updatePassword(currentPassword, newPassword) {
        return ApiClient.request('/auth/update-password', {
          method: 'POST',
          body: { currentPassword, newPassword }
        });
      },

      async updatePin(newPin) {
        return ApiClient.request('/auth/update-pin', {
          method: 'POST',
          body: { newPin }
        });
      }
    },

    // -------------------------------------------------------------
    // PAYMENTS & DIGITAL RECEIPTS
    // -------------------------------------------------------------
    Payments: {
      async initialize(paymentData) {
        return ApiClient.request('/payments/initialize', {
          method: 'POST',
          body: paymentData
        });
      },

      async verify(reference) {
        return ApiClient.request(`/payments/verify/${encodeURIComponent(reference)}`, {
          method: 'POST'
        });
      },

      async verifyLookup(refOrReceipt) {
        return ApiClient.request(`/payments/verify-lookup/${encodeURIComponent(refOrReceipt)}`);
      },

      async getReceipt(reference) {
        return ApiClient.request(`/payments/receipt/${encodeURIComponent(reference)}`);
      },

      async recordManual(paymentData) {
        return ApiClient.request('/payments/manual', {
          method: 'POST',
          body: paymentData
        });
      },

      async getLedger(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiClient.request(`/payments${query ? `?${query}` : ''}`);
      },

      getExportCsvUrl() {
        return `${ApiClient.baseUrl}/payments/export/csv`;
      }
    },

    // -------------------------------------------------------------
    // ALUMNI MEMBERS
    // -------------------------------------------------------------
    Members: {
      async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiClient.request(`/members${query ? `?${query}` : ''}`);
      },

      async getById(id) {
        return ApiClient.request(`/members/${id}`);
      },

      async create(memberData) {
        return ApiClient.request('/members', {
          method: 'POST',
          body: memberData
        });
      },

      async update(id, memberData) {
        return ApiClient.request(`/members/${id}`, {
          method: 'PUT',
          body: memberData
        });
      },

      async delete(id) {
        return ApiClient.request(`/members/${id}`, {
          method: 'DELETE'
        });
      },

      getExportCsvUrl() {
        return `${ApiClient.baseUrl}/members/export/csv`;
      }
    },

    // -------------------------------------------------------------
    // CAPITAL PROJECTS
    // -------------------------------------------------------------
    Projects: {
      async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return ApiClient.request(`/projects${query ? `?${query}` : ''}`);
      },

      async getById(id) {
        return ApiClient.request(`/projects/${id}`);
      },

      async create(projectData) {
        return ApiClient.request('/projects', {
          method: 'POST',
          body: projectData
        });
      },

      async update(id, projectData) {
        return ApiClient.request(`/projects/${id}`, {
          method: 'PUT',
          body: projectData
        });
      },

      async allocateFunds(id, addedAmount, donorName) {
        return ApiClient.request(`/projects/${id}/allocate`, {
          method: 'POST',
          body: { addedAmount, donorName }
        });
      },

      async delete(id) {
        return ApiClient.request(`/projects/${id}`, {
          method: 'DELETE'
        });
      },

      async clearAll() {
        return ApiClient.request('/projects', {
          method: 'DELETE'
        });
      }
    },

    // -------------------------------------------------------------
    // LEADERSHIP COUNCIL
    // -------------------------------------------------------------
    Leadership: {
      async getAll() {
        return ApiClient.request('/leadership');
      },

      async create(leaderData) {
        return ApiClient.request('/leadership', {
          method: 'POST',
          body: leaderData
        });
      },

      async update(id, leaderData) {
        return ApiClient.request(`/leadership/${id}`, {
          method: 'PUT',
          body: leaderData
        });
      },

      async delete(id) {
        return ApiClient.request(`/leadership/${id}`, {
          method: 'DELETE'
        });
      },

      async reorder(items) {
        return ApiClient.request('/leadership/reorder', {
          method: 'PUT',
          body: { items }
        });
      }
    },

    // -------------------------------------------------------------
    // DUES CATEGORIES
    // -------------------------------------------------------------
    Categories: {
      async getAll() {
        return ApiClient.request('/categories');
      },

      async create(catData) {
        return ApiClient.request('/categories', {
          method: 'POST',
          body: catData
        });
      },

      async update(id, catData) {
        return ApiClient.request(`/categories/${id}`, {
          method: 'PUT',
          body: catData
        });
      },

      async delete(id) {
        return ApiClient.request(`/categories/${id}`, {
          method: 'DELETE'
        });
      },

      async getPayers(id) {
        return ApiClient.request(`/categories/${id}/payers`);
      }
    },

    // -------------------------------------------------------------
    // ASSOCIATION CONFIG
    // -------------------------------------------------------------
    Config: {
      async get() {
        return ApiClient.request('/config');
      },

      async update(configData) {
        return ApiClient.request('/config', {
          method: 'PUT',
          body: configData
        });
      }
    },

    // -------------------------------------------------------------
    // EXECUTIVE REPORTS & DASHBOARD
    // -------------------------------------------------------------
    Reports: {
      async getDashboard() {
        return ApiClient.request('/reports/dashboard');
      },

      async getMonthly() {
        return ApiClient.request('/reports/monthly');
      }
    },

    // -------------------------------------------------------------
    // FILE / IMAGE UPLOADS
    // -------------------------------------------------------------
    Upload: {
      async uploadBase64(base64DataUrl, folder = 'general') {
        return ApiClient.request('/upload', {
          method: 'POST',
          body: { base64: base64DataUrl, folder }
        });
      },

      async uploadFile(file, folder = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        return ApiClient.request('/upload', {
          method: 'POST',
          body: formData
        });
      }
    },

    // -------------------------------------------------------------
    // BIDIRECTIONAL SYNC ENGINE WITH LOCALSTORAGE
    // -------------------------------------------------------------
    async syncWithLocalStorage() {
      const isUp = await this.ping();
      if (!isUp) {
        console.log('ℹ️ Render backend offline or sleeping. Seamlessly using LocalStorage DataStore.');
        return false;
      }

      console.log(`⚡ Render backend connected (${this.baseUrl}). Synchronizing LocalStorage cache with database...`);

      try {
        // Sync Config
        try {
          const cfgRes = await this.Config.get();
          if (cfgRes?.data && typeof window.DataStore?.saveConfig === 'function') {
            window.DataStore.saveConfig({
              ...cfgRes.data,
              backendUrl: ApiClient.backendUrl,
              apiUrl: ApiClient.baseUrl
            });
          }
        } catch (_) {}

        // Sync Categories
        try {
          const catRes = await this.Categories.getAll();
          if (catRes?.data && Array.isArray(catRes.data) && catRes.data.length > 0 && typeof window.DataStore?.saveCategories === 'function') {
            window.DataStore.saveCategories(catRes.data);
          }
        } catch (_) {}

        // Sync Projects
        try {
          const prjRes = await this.Projects.getAll();
          if (prjRes?.data && Array.isArray(prjRes.data) && prjRes.data.length > 0 && typeof window.DataStore?.saveProjects === 'function') {
            window.DataStore.saveProjects(prjRes.data);
          }
        } catch (_) {}

        // Sync Leadership
        try {
          const leadRes = await this.Leadership.getAll();
          if (leadRes?.data && Array.isArray(leadRes.data) && leadRes.data.length > 0 && typeof window.DataStore?.saveLeadership === 'function') {
            window.DataStore.saveLeadership(leadRes.data);
          }
        } catch (_) {}

        // Sync Members
        try {
          const memRes = await this.Members.getAll({ all: 'true' });
          if (memRes?.data && Array.isArray(memRes.data) && memRes.data.length > 0 && typeof window.DataStore?.saveMembers === 'function') {
            window.DataStore.saveMembers(memRes.data);
          }
        } catch (_) {}

        // Sync Payments
        try {
          const payRes = await this.Payments.getLedger({ all: 'true' });
          if (payRes?.data && Array.isArray(payRes.data) && payRes.data.length > 0 && typeof window.DataStore?.savePayments === 'function') {
            window.DataStore.savePayments(payRes.data);
          }
        } catch (_) {}

        console.log('✅ Synchronization complete. LocalStorage updated with database records.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('datastore:synced'));
        }
        return true;
      } catch (err) {
        console.warn('⚠️ Sync encountered warning:', err.message);
        return false;
      }
    }
  };

  // Auto-run sync on startup when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => ApiClient.syncWithLocalStorage(), 150);
      });
    } else {
      setTimeout(() => ApiClient.syncWithLocalStorage(), 150);
    }
  }

  window.ApiClient = ApiClient;
})(typeof window !== 'undefined' ? window : globalThis);

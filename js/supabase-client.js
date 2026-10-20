/**
 * CIC Enugu 1995 Alumni Association Portal
 * Global Supabase Client Initializer
 *
 * Provides a universal singleton Supabase client instance on window.supabaseClient
 * for both browser and ES module environments.
 */

(function (window) {
  'use strict';

  const SUPABASE_PROJECT_URL = 'https://kyyoahufvlahubrkxgyo.supabase.co';
  const SUPABASE_PUBLIC_KEY = 'sb_publishable_qAVO4TSs5DGJJnNMI_cn1A_TZ35Qb_J';

  function initSupabase() {
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      return window.supabaseClient;
    }
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      try {
        window.supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_KEY);
        return window.supabaseClient;
      } catch (err) {
        console.warn('[SupabaseInit] Error creating client:', err);
      }
    }
    return null;
  }

  window.SUPABASE_PROJECT_URL = SUPABASE_PROJECT_URL;
  window.SUPABASE_PUBLIC_KEY = SUPABASE_PUBLIC_KEY;
  window.getSupabaseClient = initSupabase;

  // Initialize immediately if vendor library is already in global scope
  initSupabase();

  // Re-check after DOMContentLoaded in case vendor bundle was deferred
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initSupabase();
    });
  }
})(typeof window !== 'undefined' ? window : this);

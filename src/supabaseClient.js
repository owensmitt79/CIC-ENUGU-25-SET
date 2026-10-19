// Supabase Project Configuration Variables
const SUPABASE_URL = 'https://kyyoahufvlahubrkxgyo.supabase.co/rest/v1/';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_qAVO4TSs5DGJJnNMI_cn1A_TZ35Qb_J';

// Clean base project URL for Supabase SDK (strips trailing /rest/v1/ if present)
const projectUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');

// Resolve createClient from global window.supabase (UMD bundle) or dynamic import
let supabaseInstance = null;

if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseInstance = window.supabase.createClient(projectUrl, SUPABASE_PUBLIC_KEY);
}

export const getSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseInstance = window.supabase.createClient(projectUrl, SUPABASE_PUBLIC_KEY);
    return supabaseInstance;
  }
  try {
    const mod = await import('@supabase/supabase-js');
    supabaseInstance = mod.createClient(projectUrl, SUPABASE_PUBLIC_KEY);
    return supabaseInstance;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    throw e;
  }
};

export const supabase = (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(projectUrl, SUPABASE_PUBLIC_KEY)
  : {
      auth: {
        signInWithPassword: async (creds) => {
          const client = await getSupabase();
          return client.auth.signInWithPassword(creds);
        },
        signUp: async (creds) => {
          const client = await getSupabase();
          return client.auth.signUp(creds);
        }
      }
    };

if (typeof window !== 'undefined') {
  window.supabaseClient = supabase;
}

// Export variables and client for use across the application
export { SUPABASE_URL, SUPABASE_PUBLIC_KEY };
export default supabase;

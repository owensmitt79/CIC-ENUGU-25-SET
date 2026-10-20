/**
 * CIC Enugu 1995 Alumni Association Portal
 * Global Supabase Client Initializer & Storage CDN Helper
 *
 * Provides a universal singleton Supabase client instance on window.supabaseClient
 * and helper methods for public storage URLs and Blob conversion.
 */

(function (window) {
  'use strict';

  const SUPABASE_PROJECT_URL = 'https://kyyoahufvlahubrkxgyo.supabase.co';
  const SUPABASE_PUBLIC_KEY = 'sb_publishable_qAVO4TSs5DGJJnNMI_cn1A_TZ35Qb_J';
  const GALLERY_BUCKET = 'gallery-media';

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

  /**
   * Resolves a gallery image string to a valid public URL.
   * Handles:
   * 1. Storage paths: "photos/gal-123.jpg" -> Supabase CDN public URL
   * 2. Full public URLs: "https://...supabase.co/storage/v1/object/public/gallery-media/..."
   * 3. Local assets: "images/campus.jpg"
   * 4. Base64 Data URLs (fallback)
   */
  function resolveGalleryImageUrl(imgPath) {
    if (!imgPath) return 'images/campus.jpg';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:') || imgPath.startsWith('images/')) {
      return imgPath;
    }
    const cleanPath = imgPath.replace(/^gallery-media\/?/, '').replace(/^\/+/, '');
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${GALLERY_BUCKET}/${cleanPath}`;
  }

  /**
   * Helper to convert Base64 Data URL to a native binary Blob for direct Storage upload
   */
  function dataUrlToBlob(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    try {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.warn('Failed to convert Data URL to Blob:', e);
      return null;
    }
  }

  window.SUPABASE_PROJECT_URL = SUPABASE_PROJECT_URL;
  window.SUPABASE_PUBLIC_KEY = SUPABASE_PUBLIC_KEY;
  window.GALLERY_BUCKET = GALLERY_BUCKET;
  window.getSupabaseClient = initSupabase;
  window.resolveGalleryImageUrl = resolveGalleryImageUrl;
  window.dataUrlToBlob = dataUrlToBlob;

  // Initialize immediately if vendor library is already in global scope
  initSupabase();

  // Re-check after DOMContentLoaded in case vendor bundle was deferred
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      initSupabase();
    });
  }
})(typeof window !== 'undefined' ? window : this);

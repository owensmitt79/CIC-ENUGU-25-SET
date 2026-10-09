// ==============================================================================
// CIC Enugu 1995 Alumni Portal — High-Performance Firebase Initialization
// Optimized for Core Web Vitals (FCP, LCP, INP, TBT, Speed Index)
// ==============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

// Dynamic API key resolution
const getClientApiKey = () => {
  if (typeof window !== "undefined" && window.__FIREBASE_API_KEY__) {
    return window.__FIREBASE_API_KEY__;
  }
  try {
    return atob("QUl6YVN5Q1VJSnFwaUt6dVBtWkEzMFFkNTNEYUpSV2JkVGZ1U1hr");
  } catch (e) {
    return "";
  }
};

export const firebaseConfig = {
  apiKey: getClientApiKey(),
  authDomain: "cicenuguset95.firebaseapp.com",
  projectId: "cicenuguset95",
  storageBucket: "cicenuguset95.firebasestorage.app",
  messagingSenderId: "435024963541",
  appId: "1:435024963541:web:1870a15bdf7d04cb657f5c",
  measurementId: "G-DFVTL81RTE"
};

// Initialize Core Firebase App immediately (lightweight, ~18KB)
export const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
  window.firebaseApp = app;
}

// Deferred / Non-blocking initialization of auxiliary services for optimal PageSpeed
export let db = null;
export let auth = null;
export let storage = null;
export let analytics = null;

const initAuxiliaryServices = async () => {
  try {
    if (typeof window !== "undefined" && window.location.protocol.startsWith("http")) {
      const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js").catch(() => ({}));
      if (getAnalytics) {
        analytics = getAnalytics(app);
        window.firebaseAnalytics = analytics;
      }
    }

    const [fsMod, authMod, stMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js").catch(() => null),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js").catch(() => null),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js").catch(() => null)
    ]);

    if (fsMod) {
      db = fsMod.getFirestore(app);
      window.firebaseDb = db;
    }
    if (authMod) {
      auth = authMod.getAuth(app);
      window.firebaseAuth = auth;
    }
    if (stMod) {
      storage = stMod.getStorage(app);
      window.firebaseStorage = storage;
    }
  } catch (err) {
    // Non-blocking fallback
  }
};

if (typeof window !== "undefined") {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initAuxiliaryServices(), { timeout: 3000 });
  } else {
    setTimeout(initAuxiliaryServices, 1200);
  }
}

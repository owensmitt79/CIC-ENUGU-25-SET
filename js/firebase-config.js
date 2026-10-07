// ==============================================================================
// CIC Enugu 1995 Alumni Portal — Firebase SDK Configuration & Initialization
// ==============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCUIJqpiKzuPmZA30Qd53DaJRWbdTfuSXk",
  authDomain: "cicenuguset95.firebaseapp.com",
  projectId: "cicenuguset95",
  storageBucket: "cicenuguset95.firebasestorage.app",
  messagingSenderId: "435024963541",
  appId: "1:435024963541:web:1870a15bdf7d04cb657f5c",
  measurementId: "G-DFVTL81RTE"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const analytics = (typeof window !== "undefined" && window.location.protocol.startsWith("http")) 
  ? getAnalytics(app) 
  : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Expose on global window object for easy access across client scripts
if (typeof window !== "undefined") {
  window.firebaseApp = app;
  window.firebaseDb = db;
  window.firebaseAuth = auth;
  window.firebaseStorage = storage;
  window.firebaseAnalytics = analytics;
}

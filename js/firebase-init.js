// Firebase v10 Modular SDK Initialization
// Use type="module" in index.html to import these

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * PASTE YOUR FIREBASE CONFIG HERE FROM THE GUIDE
 * [Firebase Setup Guide](file:///C:/Users/HP/.gemini/antigravity/brain/7556797d-253a-441c-a85d-27df1b87130b/firebase_setup_guide.md)
 */
const firebaseConfig = {
  apiKey: "AIzaSyDeUXdvZ1gSvbgPu3Xbns-eUDrhTkcgmLE",
  authDomain: "yousaf-brothers.firebaseapp.com",
  projectId: "yousaf-brothers",
  storageBucket: "yousaf-brothers.firebasestorage.app",
  messagingSenderId: "876515835879",
  appId: "1:876515835879:web:d2b4725f019d9f608bc742",
  measurementId: "G-PWY0LMD1R0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase initialized successfully. Cloud Sync Active.");

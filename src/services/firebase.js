import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAoFux1NV6jRw6-HpYXsUWKJZz4GUq5osk",
  authDomain: "shivam-roy-oils-pos.firebaseapp.com",
  projectId: "shivam-roy-oils-pos",
  storageBucket: "shivam-roy-oils-pos.firebasestorage.app",
  messagingSenderId: "596287479918",
  appId: "1:596287479918:web:9dc227e2de064f0faac67f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Fast promise wrapper that resolves with fallback if network takes longer than maxMs.
 * Ensures zero lag / 0ms blocking on mobile connections.
 */
export async function withTimeout(promise, maxMs = 600, fallback = null) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallback), maxMs);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    return fallback;
  }
}

export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
};

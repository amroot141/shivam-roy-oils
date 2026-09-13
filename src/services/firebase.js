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

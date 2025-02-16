import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "AIzaSyCJm7gwfJRetijVIzPb68llSQOyLwlUgc8",
    authDomain: "shop-shesha.firebaseapp.com",
    projectId: "shop-shesha",
    storageBucket: "shop-shesha.firebasestorage.app",
    messagingSenderId: "650082037699",
    appId: "1:650082037699:web:0eba5cb8ab47b1fd6a1776",
    measurementId: "G-3WEJG0NR4W"
  };
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
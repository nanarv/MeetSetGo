import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBW1grqzx8I83g__aJO7jcGbD2tY_XegXM',
  authDomain: 'meetsetgo-b67ea.firebaseapp.com',
  projectId: 'meetsetgo-b67ea',
  storageBucket: 'meetsetgo-b67ea.firebasestorage.app',
  messagingSenderId: '957461854206',
  appId: '1:957461854206:web:b3fc232908f3ff6ce2b2af',
  measurementId: 'G-3SDVC9L058',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

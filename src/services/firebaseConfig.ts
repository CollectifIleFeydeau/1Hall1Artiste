// Configuration Firebase pour l'application Collectif Île Feydeau
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
// Les valeurs sont maintenant chargées depuis les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY", // Remplacer par la nouvelle clé ou utiliser une variable d'environnement
  authDomain: "collectif-ile-feydeau----app.firebaseapp.com",
  projectId: "collectif-ile-feydeau----app",
  storageBucket: "collectif-ile-feydeau----app.firebasestorage.app",
  messagingSenderId: "705686402200",
  appId: "1:705686402200:web:3e36a3b2c359a62be14ced",
  measurementId: "G-D6K43TLW5Y" // ID Google Analytics
};

// Initialiser Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Initialiser Analytics (uniquement côté client)
let analyticsInstance: any = null;

export const initFirebaseAnalytics = () => {
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(firebaseApp);
    return analyticsInstance;
  }
  return null;
};

export const getFirebaseAnalytics = () => analyticsInstance;

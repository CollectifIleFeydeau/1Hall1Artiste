// Configuration Firebase pour l'application Collectif Île Feydeau
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: "collectif-ile-feydeau----app.firebaseapp.com",
  projectId: "collectif-ile-feydeau----app",
  storageBucket: "collectif-ile-feydeau----app.firebasestorage.app",
  messagingSenderId: "705686402200",
  appId: "1:705686402200:web:3e36a3b2c359a62be14ced",
  measurementId: "G-D6K43TLW5Y" // ID Google Analytics
};

// Variable pour stocker l'instance Firebase
let firebaseApp: any = null;

// Fonction pour initialiser Firebase de manière conditionnelle
const initializeFirebase = () => {
  // Vérifier si la clé API est disponible
  if (firebaseConfig.apiKey) {
    try {
      return initializeApp(firebaseConfig);
    } catch (error) {
      console.warn('Erreur lors de l\'initialisation de Firebase:', error);
      return null;
    }
  } else {
    console.warn('Firebase non initialisé: clé API manquante');
    return null;
  }
};

// Initialiser Firebase uniquement si la clé API est disponible
export const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  return firebaseApp;
};

// Initialiser Analytics (uniquement côté client et si Firebase est initialisé)
let analyticsInstance: any = null;

export const initFirebaseAnalytics = () => {
  if (typeof window !== 'undefined') {
    const app = getFirebaseApp();
    if (app) {
      try {
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      } catch (error) {
        console.warn('Erreur lors de l\'initialisation de Firebase Analytics:', error);
      }
    }
  }
  return null;
};

export const getFirebaseAnalytics = () => analyticsInstance;

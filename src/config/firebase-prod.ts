/**
 * Configuration Firebase pour la production
 * Utilisée quand les variables d'environnement ne sont pas disponibles
 */

// Configuration Firebase pour production
export const FIREBASE_PROD_CONFIG = {
  apiKey: "AIzaSyAjiVgKin-J3S7zsirw9xImh4sOBxAwUuU",
  authDomain: "collectif-ile-feydeau----app.firebaseapp.com",
  databaseURL: "https://collectif-ile-feydeau----app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "collectif-ile-feydeau----app",
  storageBucket: "collectif-ile-feydeau----app.firebasestorage.app",
  messagingSenderId: "705686402200",
  appId: "1:705686402200:web:3e36a3b2c359a62be14ced",
  measurementId: "G-D6K43TLW5Y"
};

// Fonction pour obtenir la configuration Firebase
export function getFirebaseConfig() {
  // Essayer d'abord les variables d'environnement
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  
  if (envApiKey) {
    console.log('🔥 [Firebase] Utilisation des variables d\'environnement');
    return {
      ...FIREBASE_PROD_CONFIG,
      apiKey: envApiKey
    };
  }
  
  // Fallback sur la configuration hard-codée pour production
  console.log('🔥 [Firebase] Utilisation de la configuration production');
  return FIREBASE_PROD_CONFIG;
}


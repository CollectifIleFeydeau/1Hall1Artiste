import { getAnalytics, setAnalyticsCollectionEnabled, isSupported, setUserId } from "firebase/analytics";
import { firebaseApp } from "../services/firebaseConfig";

/**
 * Active le mode debug pour Firebase Analytics
 * À utiliser uniquement en développement
 */
export const initFirebaseDebug = async () => {
  try {
    // Vérifier si Analytics est supporté
    const supported = await isSupported();
    if (!supported) {
      console.warn("[FirebaseDebug] Analytics n'est pas supporté dans cet environnement");
      return;
    }

    // Obtenir l'instance Analytics
    const analytics = getAnalytics(firebaseApp);
    
    // Activer la collecte de données
    setAnalyticsCollectionEnabled(analytics, true);
    
    // Activer le mode debug via les méthodes disponibles
    // Note: Firebase Analytics n'a pas de méthode setDebugMode officielle
    // On utilise d'autres approches pour activer le debug
    
    // Définir un ID utilisateur pour le debug
    const debugUserId = `debug-user-${Date.now()}`;
    setUserId(analytics, debugUserId);
    
    // Ajouter les paramètres de requête pour activer le mode debug
    const url = new URL(window.location.href);
    url.searchParams.set('firebase_debug', 'true');
    url.searchParams.set('debug_mode', 'true');
    url.searchParams.set('debug_view', 'true');
    window.history.replaceState({}, document.title, url.toString());
    
    // Définir la variable globale pour le debug Firebase
    // @ts-ignore - Cette propriété n'est pas dans les types mais est utilisée par Firebase
    window.self.FIREBASE_ANALYTICS_DEBUG_MODE = true;
    
    console.log("[FirebaseDebug] Mode debug activé pour Firebase Analytics");
    console.log(`[FirebaseDebug] ID utilisateur de debug: ${debugUserId}`);
    
    // Afficher les instructions pour voir les événements dans DebugView
    console.info(
      "%c[FirebaseDebug] Pour voir les événements dans DebugView: %c\n" +
      "1. Ouvrez la console Firebase\n" +
      "2. Allez dans Analytics > DebugView\n" +
      "3. Sélectionnez votre appareil de debug",
      "color: #4285F4; font-weight: bold;", "color: #000;"
    );
  } catch (error) {
    console.error("[FirebaseDebug] Erreur lors de l'initialisation du mode debug:", error);
  }
};

/**
 * Force l'envoi d'un événement de test pour vérifier que DebugView fonctionne
 */
export const sendTestEvent = () => {
  try {
    const analytics = getAnalytics(firebaseApp);
    if (!analytics) {
      console.warn("[FirebaseDebug] Analytics non disponible pour l'événement de test");
      return;
    }
    
    // Importer logEvent dynamiquement pour éviter les erreurs de compilation
    import('firebase/analytics').then(({ logEvent }) => {
      logEvent(analytics, 'test_debug_event', {
        timestamp: new Date().toISOString(),
        debug: true
      });
      console.log("[FirebaseDebug] Événement de test envoyé");
    });
  } catch (error) {
    console.error("[FirebaseDebug] Erreur lors de l'envoi de l'événement de test:", error);
  }
};

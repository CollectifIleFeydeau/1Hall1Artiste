/**
 * Utilitaire pour activer le mode debug de Google Analytics
 * Utilise l'API gtag directement pour forcer le mode debug
 */

// Définir gtag comme une fonction globale
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialise le mode debug pour Google Analytics
 */
export const initGtagDebug = () => {
  try {
    // Initialiser dataLayer si nécessaire
    window.dataLayer = window.dataLayer || [];
    
    // Définir la fonction gtag
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Activer le mode debug
    window.gtag('config', 'G-D6K43TLW5Y', {
      debug_mode: true,
      send_page_view: false // Ne pas envoyer de page view automatiquement
    });
    
    console.log('[GtagDebug] Mode debug activé pour Google Analytics');
    
    // Ajouter le script de debug
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=G-D6K43TLW5Y&debug=1`;
    document.head.appendChild(script);
    
    // Forcer les paramètres d'URL pour le debug
    const url = new URL(window.location.href);
    url.searchParams.set('gtm_debug', 'x');
    url.searchParams.set('gtm_debug_session', 'x');
    window.history.replaceState({}, document.title, url.toString());
    
  } catch (error) {
    console.error('[GtagDebug] Erreur lors de l\'initialisation du mode debug:', error);
  }
};

/**
 * Envoie un événement de test via gtag
 */
export const sendGtagTestEvent = () => {
  try {
    if (!window.gtag) {
      console.warn('[GtagDebug] gtag n\'est pas initialisé');
      return;
    }
    
    // Envoyer un événement de test
    window.gtag('event', 'test_event', {
      event_category: 'debug',
      event_label: 'test_label',
      debug_mode: true,
      timestamp: new Date().toISOString()
    });
    
    console.log('[GtagDebug] Événement de test envoyé via gtag');
  } catch (error) {
    console.error('[GtagDebug] Erreur lors de l\'envoi de l\'événement de test:', error);
  }
};

/**
 * Service de suivi des erreurs
 * Ce service permet de collecter des informations sur les erreurs rencontrées
 * par les utilisateurs et de les envoyer à un service de suivi
 */

// Type pour les erreurs collectées
export interface ErrorInfo {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  path: string;
  componentName?: string;
  additionalInfo?: Record<string, any>;
}

// Stockage local des erreurs
const ERROR_STORAGE_KEY = 'app_errors';
const MAX_STORED_ERRORS = 50;

/**
 * Capturer une erreur et la stocker localement
 */
export const captureError = (
  error: Error | string,
  componentName?: string,
  additionalInfo?: Record<string, any>
): void => {
  try {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    
    const errorInfo: ErrorInfo = {
      message,
      stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      path: window.location.pathname,
      componentName,
      additionalInfo
    };
    
    // Récupérer les erreurs existantes
    const storedErrorsStr = localStorage.getItem(ERROR_STORAGE_KEY);
    let storedErrors: ErrorInfo[] = [];
    
    if (storedErrorsStr) {
      try {
        storedErrors = JSON.parse(storedErrorsStr);
        if (!Array.isArray(storedErrors)) storedErrors = [];
      } catch (e) {
        console.error('Erreur lors de la lecture des erreurs stockées:', e);
        storedErrors = [];
      }
    }
    
    // Ajouter la nouvelle erreur
    storedErrors.push(errorInfo);
    
    // Limiter le nombre d'erreurs stockées
    if (storedErrors.length > MAX_STORED_ERRORS) {
      storedErrors = storedErrors.slice(-MAX_STORED_ERRORS);
    }
    
    // Sauvegarder les erreurs
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(storedErrors));
    
    // Afficher l'erreur dans la console pour le débogage
    console.error('Erreur capturée:', errorInfo);
  } catch (e) {
    console.error('Erreur lors de la capture d\'erreur:', e);
  }
};

/**
 * Récupérer toutes les erreurs stockées
 */
export const getStoredErrors = (): ErrorInfo[] => {
  try {
    const storedErrorsStr = localStorage.getItem(ERROR_STORAGE_KEY);
    if (!storedErrorsStr) return [];
    
    const storedErrors = JSON.parse(storedErrorsStr);
    return Array.isArray(storedErrors) ? storedErrors : [];
  } catch (e) {
    console.error('Erreur lors de la récupération des erreurs stockées:', e);
    return [];
  }
};

/**
 * Effacer toutes les erreurs stockées
 */
export const clearStoredErrors = (): void => {
  localStorage.removeItem(ERROR_STORAGE_KEY);
};

// Configuration EmailJS
const EMAIL_SERVICE_ID = 'service_3l31ox3';
const EMAIL_TEMPLATE_ID = 'template_q7nh8h2';

/**
 * Initialiser EmailJS
 * À appeler au démarrage de l'application
 */
export const initEmailJS = async (): Promise<void> => {
  try {
    const emailjs = await import('@emailjs/browser');
    // Vous n'avez pas besoin de spécifier le USER_ID ici
    // EmailJS le récupérera depuis le script chargé dans index.html
  } catch (error) {
    console.error('Erreur lors de l\'initialisation d\'EmailJS:', error);
  }
};

/**
 * Vérifier et envoyer les erreurs automatiquement
 * À appeler périodiquement ou lors d'événements spécifiques
 */
export const checkAndSendErrors = async (): Promise<void> => {
  const errors = getStoredErrors();
  
  // Envoyer les erreurs si leur nombre dépasse un certain seuil
  if (errors.length >= 1) {
    await sendErrorsToTrackingService();
  } else if (errors.length > 0) {
    console.log(`${errors.length} erreur(s) en attente d'envoi`);
  }
};

/**
 * Envoyer les erreurs stockées à un service de suivi via EmailJS
 */
export const sendErrorsToTrackingService = async (): Promise<boolean> => {
  try {
    const errors = getStoredErrors();
    if (errors.length === 0) return true;
    
    // Vérifier si nous sommes en production
    const isProd = import.meta.env.PROD;
    
    if (isProd) {
      console.log(`Envoi de ${errors.length} erreurs par email`);
      
      // Importer EmailJS dynamiquement
      const emailjs = await import('@emailjs/browser');
      
      // Préparer les données pour le modèle d'email
      const templateParams = {
        errors_json: JSON.stringify(errors, null, 2),
        error_count: errors.length,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        app_version: '1.0.0', // À mettre à jour avec la version de votre application
        app_name: 'Collectif Feydeau'
      };
      
      // Envoyer l'email avec la clé publique explicite
      // Même si elle est déjà initialisée dans index.html, la fournir ici pour s'assurer qu'elle est disponible
      const PUBLIC_KEY = 'HoNWMyqrINGzjeK6E';
      const response = await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      
      if (response.status === 200) {
        console.log('Erreurs envoyées avec succès');
        clearStoredErrors();
        return true;
      } else {
        throw new Error(`Erreur lors de l'envoi: ${response.text}`);
      }
    } else {
      // En développement, juste afficher les erreurs
      console.log('Mode développement - Simulation d\'envoi de', errors.length, 'erreurs');
      console.table(errors);
      clearStoredErrors();
      return true;
    }
  } catch (e) {
    console.error('Erreur lors de l\'envoi des erreurs:', e);
    return false;
  }
};

/**
 * Configurer un gestionnaire global d'erreurs non capturées
 */
export const setupGlobalErrorHandler = (): void => {
  window.onerror = (message, source, lineno, colno, error) => {
    captureError(
      error || String(message),
      'GlobalErrorHandler',
      { source, lineno, colno }
    );
    return false; // Permettre au gestionnaire d'erreurs par défaut de s'exécuter également
  };
  
  window.addEventListener('unhandledrejection', (event) => {
    captureError(
      event.reason || 'Promesse rejetée non gérée',
      'UnhandledRejection'
    );
  });
};

/**
 * Créer un composant d'erreur pour React Error Boundary
 */
export const createErrorBoundaryHandler = (componentName: string) => {
  return (error: Error, info: { componentStack: string }) => {
    captureError(error, componentName, { componentStack: info.componentStack });
  };
};

/**
 * Fonction de test pour déclencher manuellement l'envoi d'erreurs
 * À utiliser dans la console pour tester le système
 */
export const testErrorReporting = async (): Promise<void> => {
  console.log('🧪 Test du système de suivi d\'erreurs...');
  
  // Créer une erreur de test
  captureError('Erreur de test pour vérifier le système de suivi', 'TestErrorReporting', {
    testMode: true,
    timestamp: new Date().toISOString()
  });
  
  // Forcer l'envoi immédiat
  const success = await sendErrorsToTrackingService();
  
  if (success) {
    console.log('✅ Test réussi : Erreur envoyée par email');
  } else {
    console.log('❌ Test échoué : Erreur non envoyée');
  }
};

// Exposer la fonction de test globalement pour la console
if (typeof window !== 'undefined') {
  (window as any).testErrorReporting = testErrorReporting;
}

/**
 * Système de gestion des erreurs et de journalisation pour l'application
 * Ce fichier initialise les gestionnaires d'erreurs globaux et le système de logs
 */

import { initErrorHandlers, createLogViewer, createLogger } from './logger';

const logger = createLogger('ErrorHandling');

/**
 * Initialise le système de gestion des erreurs
 * À appeler dans le composant racine de l'application
 */
export function initErrorHandlingSystem() {
  // Initialiser les gestionnaires d'erreurs globaux
  initErrorHandlers();
  
  // Créer le visualiseur de logs (uniquement en développement)
  if (process.env.NODE_ENV === 'development') {
    const logViewer = createLogViewer();
    
    // Exposer le logViewer dans la console pour le débogage
    (window as any).__logViewer = logViewer;
    
    logger.info('Système de visualisation des logs initialisé (appuyez sur le bouton "Logs" pour voir les logs)');
  }
  
  logger.info('Système de gestion des erreurs initialisé');
}

/**
 * Enregistre une erreur avec des informations contextuelles
 * @param error L'erreur à enregistrer
 * @param context Informations contextuelles supplémentaires
 */
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(`Erreur: ${error.message}`, {
    name: error.name,
    stack: error.stack,
    ...context
  });
}

/**
 * Enregistre une erreur liée à l'API
 * @param endpoint Point d'accès de l'API
 * @param error L'erreur à enregistrer
 */
export function logApiError(endpoint: string, error: any) {
  logger.error(`Erreur API (${endpoint})`, {
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    data: error.data
  });
}


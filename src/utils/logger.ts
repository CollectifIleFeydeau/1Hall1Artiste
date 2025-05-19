/**
 * Utilitaire de journalisation pour l'application
 * Permet de centraliser et formater les logs pour faciliter le débogage
 */

// Niveaux de log disponibles
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Configuration des couleurs pour les différents niveaux de log
const LOG_COLORS = {
  info: '#4a5d94',  // Bleu de l'application
  warn: '#ff7a45',  // Orange de l'application
  error: '#e53935', // Rouge
  debug: '#2e7d32'  // Vert
};

/**
 * Fonction de journalisation avec formatage et préfixe
 * @param module Nom du module/composant qui génère le log
 * @param message Message à journaliser
 * @param level Niveau de log (info, warn, error, debug)
 * @param data Données supplémentaires à journaliser
 */
export function log(
  module: string,
  message: string,
  level: LogLevel = 'info',
  data?: any
) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${module}]`;
  
  const style = `color: ${LOG_COLORS[level]}; font-weight: bold`;
  
  switch (level) {
    case 'info':
      console.log(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'warn':
      console.warn(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'error':
      console.error(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'debug':
      console.debug(`%c${prefix} ${message}`, style, data ? data : '');
      break;
  }
}

/**
 * Crée un logger spécifique à un module
 * @param moduleName Nom du module pour lequel créer un logger
 */
export function createLogger(moduleName: string) {
  return {
    info: (message: string, data?: any) => log(moduleName, message, 'info', data),
    warn: (message: string, data?: any) => log(moduleName, message, 'warn', data),
    error: (message: string, data?: any) => log(moduleName, message, 'error', data),
    debug: (message: string, data?: any) => log(moduleName, message, 'debug', data)
  };
}

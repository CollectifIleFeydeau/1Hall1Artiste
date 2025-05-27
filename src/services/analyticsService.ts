import { createLogger } from "@/utils/logger";
import { captureError, getStoredErrors as getEmailJSErrors, clearStoredErrors } from "./errorTracking";

// Utiliser la version définie manuellement pour éviter l'erreur d'importation JSON
const APP_VERSION = "1.0.0";

// Créer un logger pour le service d'analyse
const logger = createLogger('AnalyticsService');

// Types pour les métadonnées et événements
export interface AppMetadata {
  version: string;
  buildNumber?: string;
  environment: 'development' | 'production';
  deviceInfo: DeviceInfo;
  sessionId: string;
  installId: string;
}

export interface DeviceInfo {
  platform: string;
  osVersion?: string;
  browser: string;
  browserVersion?: string;
  screenSize: string;
  language: string;
  isOnline: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  memoryInfo?: string;
}

export interface ErrorEvent {
  errorId: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  category: ErrorCategory;
  metadata: AppMetadata;
  context?: Record<string, any>;
  fingerprint: string;
  count: number;
  lastOccurrence: string;
  firstOccurrence: string;
}

export interface UsageEvent {
  eventName: string;
  timestamp: string;
  properties?: Record<string, any>;
  metadata: AppMetadata;
}

// Catégories d'erreurs pour une meilleure organisation
export enum ErrorCategory {
  NETWORK = 'network',
  UI = 'ui',
  DATA = 'data',
  NAVIGATION = 'navigation',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

// Stockage local des erreurs et événements
const ERROR_STORAGE_KEY = 'feydeau-error-events';
const USAGE_STORAGE_KEY = 'feydeau-usage-events';
const METADATA_STORAGE_KEY = 'feydeau-app-metadata';
const MAX_STORED_ERRORS = 50;
const MAX_STORED_EVENTS = 100;

// Métadonnées globales de l'application
let appMetadata: AppMetadata;

/**
 * Initialise le service d'analyse avec les métadonnées de l'application
 */
export function initAnalytics(): AppMetadata {
  // Générer ou récupérer l'ID d'installation
  let installId = localStorage.getItem('feydeau-install-id');
  if (!installId) {
    installId = generateUniqueId();
    localStorage.setItem('feydeau-install-id', installId);
  }
  
  // Générer un ID de session pour cette session de navigation
  const sessionId = generateUniqueId();
  
  // Détecter l'environnement
  const environment = window.location.hostname === 'localhost' || 
                      window.location.hostname.includes('127.0.0.1') 
                      ? 'development' : 'production';
  
  // Collecter les informations sur l'appareil
  const deviceInfo = detectDeviceInfo();
  
  // Créer les métadonnées de l'application
  appMetadata = {
    version: APP_VERSION,
    environment,
    deviceInfo,
    sessionId,
    installId
  };
  
  // Stocker les métadonnées
  localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(appMetadata));
  
  logger.info("Service d'analyse initialisé", { appMetadata });
  
  // Configurer les gestionnaires d'erreurs globaux
  setupErrorHandlers();
  
  return appMetadata;
}

/**
 * Détecte les informations sur l'appareil et le navigateur
 */
function detectDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || 'unknown';
  const language = navigator.language || 'unknown';
  
  // Détecter le navigateur et sa version
  let browser = 'unknown';
  let browserVersion = 'unknown';
  
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Edge') || userAgent.includes('Edg')) {
    browser = 'Edge';
    browserVersion = userAgent.match(/Edge?\/([\d.]+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browser = 'Internet Explorer';
    browserVersion = userAgent.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] || 'unknown';
  }
  
  // Détecter le type d'appareil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  // Obtenir la taille de l'écran
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  
  // Obtenir des informations sur la mémoire si disponibles
  let memoryInfo: string | undefined;
  if ((navigator as any).deviceMemory) {
    memoryInfo = `${(navigator as any).deviceMemory}GB`;
  }
  
  // Détecter la version du système d'exploitation
  let osVersion: string | undefined;
  
  if (userAgent.includes('Windows')) {
    osVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1] || undefined;
    if (osVersion) {
      // Convertir les versions NT en noms conviviaux
      const ntVersions: Record<string, string> = {
        '10.0': 'Windows 10/11',
        '6.3': 'Windows 8.1',
        '6.2': 'Windows 8',
        '6.1': 'Windows 7',
        '6.0': 'Windows Vista',
        '5.2': 'Windows XP x64',
        '5.1': 'Windows XP'
      };
      osVersion = ntVersions[osVersion] || `Windows (NT ${osVersion})`;
    }
  } else if (userAgent.includes('Mac OS X')) {
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/)?.[1]?.replace(/_/g, '.') || undefined;
    if (osVersion) {
      osVersion = `macOS ${osVersion}`;
    }
  } else if (userAgent.includes('Android')) {
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || undefined;
    if (osVersion) {
      osVersion = `Android ${osVersion}`;
    }
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone OS')) {
    osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || undefined;
    if (osVersion) {
      osVersion = `iOS ${osVersion}`;
    }
  } else if (userAgent.includes('Linux')) {
    osVersion = 'Linux';
  }
  
  return {
    platform,
    osVersion,
    browser,
    browserVersion,
    screenSize,
    language,
    isOnline: navigator.onLine,
    isMobile,
    isTablet,
    isDesktop,
    memoryInfo
  };
}

/**
 * Configure les gestionnaires d'erreurs globaux pour capturer les erreurs non gérées
 */
function setupErrorHandlers() {
  // Capturer les erreurs non gérées
  window.onerror = (message, source, lineno, colno, error) => {
    if (error) {
      trackError(error, { source, lineno, colno });
    } else {
      // Si aucun objet d'erreur n'est disponible, créer une erreur synthétique
      const syntheticError = new Error(message as string);
      trackError(syntheticError, { source, lineno, colno, synthetic: true });
    }
    return false; // Permettre à l'erreur de se propager
  };
  
  // Capturer les rejets de promesses non gérés
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    trackError(error, { unhandledRejection: true });
  };
  
  // Écouter les événements de connectivité réseau
  window.addEventListener('online', () => {
    // Mettre à jour le statut en ligne dans les métadonnées
    if (appMetadata) {
      appMetadata.deviceInfo.isOnline = true;
      // Tenter d'envoyer les événements en attente
      flushEvents();
    }
  });
  
  window.addEventListener('offline', () => {
    // Mettre à jour le statut en ligne dans les métadonnées
    if (appMetadata) {
      appMetadata.deviceInfo.isOnline = false;
    }
  });
  
  logger.info("Gestionnaires d'erreurs configurés");
}

/**
 * Génère un identifiant unique pour les événements et sessions
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Calcule une empreinte digitale pour une erreur afin de regrouper les erreurs similaires
 */
function generateErrorFingerprint(error: Error, context?: Record<string, any>): string {
  // Extraire le nom de l'erreur et le message
  const errorName = error.name || 'Error';
  const errorMessage = error.message || '';
  
  // Extraire la première ligne de la stack trace si disponible
  const stackFirstLine = error.stack?.split('\n')[1]?.trim() || '';
  
  // Combiner ces éléments pour créer une empreinte unique mais qui regroupe les erreurs similaires
  let fingerprintSource = `${errorName}:${errorMessage}`;
  
  // Ajouter des informations de contexte pertinentes à l'empreinte
  if (context) {
    if (context.componentStack) {
      // Ajouter le premier composant de la pile de composants React
      const firstComponent = context.componentStack.split('\n')[1]?.trim() || '';
      fingerprintSource += `:${firstComponent}`;
    }
    
    if (context.category) {
      fingerprintSource += `:${context.category}`;
    }
    
    // Ajouter l'URL de la page (sans paramètres de requête)
    if (context.url) {
      const urlPath = new URL(context.url).pathname;
      fingerprintSource += `:${urlPath}`;
    }
  }
  
  // Ajouter la première ligne de la stack trace pour plus de précision
  if (stackFirstLine) {
    fingerprintSource += `:${stackFirstLine}`;
  }
  
  // Créer un hachage simple de cette chaîne
  let hash = 0;
  for (let i = 0; i < fingerprintSource.length; i++) {
    const char = fingerprintSource.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en entier 32 bits
  }
  
  // Convertir en chaîne hexadécimale
  return Math.abs(hash).toString(16);
}

/**
 * Détermine la catégorie d'une erreur en fonction de son message et de sa stack trace
 */
function categorizeError(error: Error, context?: Record<string, any>): ErrorCategory {
  const errorMessage = error.message.toLowerCase();
  const errorStack = (error.stack || '').toLowerCase();
  
  // Si une catégorie est déjà fournie dans le contexte, l'utiliser
  if (context?.category && Object.values(ErrorCategory).includes(context.category)) {
    return context.category as ErrorCategory;
  }
  
  // Erreurs réseau
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('xhr') ||
    errorMessage.includes('http') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('cors') ||
    errorMessage.includes('api') ||
    errorStack.includes('fetch') ||
    error instanceof TypeError && errorMessage.includes('failed to fetch')
  ) {
    return ErrorCategory.NETWORK;
  }
  
  // Erreurs d'interface utilisateur
  if (
    errorStack.includes('react') ||
    errorStack.includes('render') ||
    errorStack.includes('component') ||
    errorStack.includes('dom') ||
    context?.componentStack
  ) {
    return ErrorCategory.UI;
  }
  
  // Erreurs de données
  if (
    errorMessage.includes('json') ||
    errorMessage.includes('parse') ||
    errorMessage.includes('data') ||
    errorMessage.includes('undefined') ||
    errorMessage.includes('null') ||
    errorMessage.includes('property') ||
    errorMessage.includes('object')
  ) {
    return ErrorCategory.DATA;
  }
  
  // Erreurs de navigation
  if (
    errorMessage.includes('route') ||
    errorMessage.includes('navigation') ||
    errorMessage.includes('history') ||
    errorMessage.includes('path') ||
    errorStack.includes('router')
  ) {
    return ErrorCategory.NAVIGATION;
  }
  
  // Erreurs de permissions
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('access') ||
    errorMessage.includes('denied') ||
    errorMessage.includes('unauthorized')
  ) {
    return ErrorCategory.PERMISSION;
  }
  
  // Erreurs de stockage
  if (
    errorMessage.includes('storage') ||
    errorMessage.includes('localstorage') ||
    errorMessage.includes('sessionstorage') ||
    errorMessage.includes('indexeddb') ||
    errorMessage.includes('database') ||
    errorMessage.includes('quota')
  ) {
    return ErrorCategory.STORAGE;
  }
  
  // Par défaut, catégorie inconnue
  return ErrorCategory.UNKNOWN;
}

/**
 * Suit une erreur, la catégorise et la déduplique
 * Intègre avec le système EmailJS existant
 */
export function trackError(error: Error, context?: Record<string, any>): string {
  try {
    if (!appMetadata) {
      // Initialiser les métadonnées si ce n'est pas déjà fait
      initAnalytics();
    }
    
    // Enrichir le contexte avec des informations supplémentaires
    const enrichedContext = {
      ...context,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      componentStack: context?.componentStack || undefined
    };
    
    // Catégoriser l'erreur
    const category = categorizeError(error, enrichedContext);
    
    // Générer une empreinte pour cette erreur
    const fingerprint = generateErrorFingerprint(error, { ...enrichedContext, category });
    
    // Créer un ID unique pour cette occurrence d'erreur
    const errorId = generateUniqueId();
    
    // Créer l'événement d'erreur
    const now = new Date().toISOString();
    const errorEvent: ErrorEvent = {
      errorId,
      timestamp: now,
      message: error.message,
      stack: error.stack,
      componentStack: enrichedContext.componentStack,
      category,
      metadata: { ...appMetadata },
      context: enrichedContext,
      fingerprint,
      count: 1,
      lastOccurrence: now,
      firstOccurrence: now
    };
    
    // Récupérer les erreurs existantes
    const storedErrorsJson = localStorage.getItem(ERROR_STORAGE_KEY);
    let storedErrors: ErrorEvent[] = [];
    
    if (storedErrorsJson) {
      try {
        storedErrors = JSON.parse(storedErrorsJson);
      } catch (e) {
        logger.error("Erreur lors de la lecture des erreurs stockées", { error: e });
        // Réinitialiser si les données sont corrompues
        storedErrors = [];
      }
    }
    
    // Vérifier si cette erreur existe déjà (dédupliquer)
    const existingErrorIndex = storedErrors.findIndex(e => e.fingerprint === fingerprint);
    
    if (existingErrorIndex >= 0) {
      // Mettre à jour l'erreur existante
      const existingError = storedErrors[existingErrorIndex];
      existingError.count += 1;
      existingError.lastOccurrence = now;
      
      // Mettre à jour le contexte avec les informations les plus récentes
      existingError.context = enrichedContext;
      
      // Déplacer cette erreur au début du tableau (la plus récente)
      storedErrors.splice(existingErrorIndex, 1);
      storedErrors.unshift(existingError);
      
      logger.info(`Erreur existante mise à jour (${existingError.count} occurrences)`, { 
        errorId: existingError.errorId,
        fingerprint,
        category
      });
    } else {
      // Ajouter la nouvelle erreur au début du tableau
      storedErrors.unshift(errorEvent);
      
      logger.info("Nouvelle erreur suivie", { 
        errorId,
        fingerprint,
        category,
        message: error.message
      });
    }
    
    // Limiter le nombre d'erreurs stockées
    if (storedErrors.length > MAX_STORED_ERRORS) {
      storedErrors = storedErrors.slice(0, MAX_STORED_ERRORS);
    }
    
    // Sauvegarder les erreurs mises à jour
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(storedErrors));
    
    // IMPORTANT: Intégration avec le système EmailJS existant
    // Capturer l'erreur dans le système EmailJS pour l'envoi par email
    captureError(
      error,
      enrichedContext.componentStack ? 'React Component' : context?.componentName || 'Analytics',
      {
        ...enrichedContext,
        category,
        fingerprint,
        analyticsErrorId: errorId
      }
    );
    
    return errorId;
  } catch (e) {
    // Éviter les boucles infinies en cas d'erreur dans le suivi d'erreur
    console.error("Erreur lors du suivi d'erreur:", e);
    return 'error-tracking-failed';
  }
}

/**
 * Suit un événement d'utilisation
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  try {
    if (!appMetadata) {
      // Initialiser les métadonnées si ce n'est pas déjà fait
      initAnalytics();
    }
    
    // Créer l'événement d'utilisation
    const usageEvent: UsageEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer
      },
      metadata: { ...appMetadata }
    };
    
    // Récupérer les événements existants
    const storedEventsJson = localStorage.getItem(USAGE_STORAGE_KEY);
    let storedEvents: UsageEvent[] = [];
    
    if (storedEventsJson) {
      try {
        storedEvents = JSON.parse(storedEventsJson);
      } catch (e) {
        logger.error("Erreur lors de la lecture des événements stockés", { error: e });
        // Réinitialiser si les données sont corrompues
        storedEvents = [];
      }
    }
    
    // Ajouter le nouvel événement
    storedEvents.push(usageEvent);
    
    // Limiter le nombre d'événements stockés
    if (storedEvents.length > MAX_STORED_EVENTS) {
      storedEvents = storedEvents.slice(-MAX_STORED_EVENTS);
    }
    
    // Sauvegarder les événements mis à jour
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(storedEvents));
    
    logger.info(`Événement suivi: ${eventName}`, properties);
    
    // Tenter d'envoyer les événements au serveur si en ligne
    if (navigator.onLine) {
      sendEventsToServer();
    }
  } catch (e) {
    logger.error("Erreur lors du suivi d'événement", { eventName, error: e });
  }
}

/**
 * Synchronise les erreurs avec le système EmailJS
 * Cette fonction est appelée périodiquement pour s'assurer que les deux systèmes
 * sont synchronisés
 */
export function synchronizeWithEmailJS(): void {
  try {
    // Récupérer les erreurs du système EmailJS
    const emailJSErrors = getEmailJSErrors();
    
    // Récupérer les erreurs du système d'analyse
    const analyticsErrors = getStoredErrors();
    
    logger.info("Synchronisation des erreurs", { 
      emailJSErrorsCount: emailJSErrors.length,
      analyticsErrorsCount: analyticsErrors.length 
    });
    
    // Les erreurs sont déjà capturées par EmailJS via l'intégration dans trackError
    // Aucune action supplémentaire n'est nécessaire ici
  } catch (e) {
    logger.error("Erreur lors de la synchronisation avec EmailJS", { error: e });
  }
}

/**
 * Envoie les événements d'utilisation stockés au serveur
 */
async function sendEventsToServer(): Promise<void> {
  // Récupérer les événements stockés
  const storedEventsJson = localStorage.getItem(USAGE_STORAGE_KEY);
  if (!storedEventsJson) return;
  
  try {
    const storedEvents = JSON.parse(storedEventsJson);
    if (storedEvents.length === 0) return;
    
    // Dans un environnement de production, envoyez les événements à votre service d'analyse
    // Pour l'instant, nous les journalisons simplement
    logger.info(`Envoi de ${storedEvents.length} événements au serveur`);
    
    // Simuler un envoi réussi et effacer les événements envoyés
    // Dans une implémentation réelle, vous effectueriez une requête fetch ici
    // localStorage.removeItem(USAGE_STORAGE_KEY);
  } catch (e) {
    logger.error("Erreur lors de l'envoi des événements au serveur", { error: e });
  }
}

/**
 * Tente d'envoyer tous les événements en attente au serveur
 */
export function flushEvents(): void {
  if (navigator.onLine) {
    sendEventsToServer();
    synchronizeWithEmailJS();
  }
}

/**
 * Récupère les erreurs stockées pour affichage ou débogage
 */
export function getStoredErrors(): ErrorEvent[] {
  const storedErrorsJson = localStorage.getItem(ERROR_STORAGE_KEY);
  if (!storedErrorsJson) return [];
  
  try {
    return JSON.parse(storedErrorsJson);
  } catch (e) {
    logger.error("Erreur lors de la lecture des erreurs stockées", { error: e });
    return [];
  }
}

/**
 * Récupère les événements d'utilisation stockés pour affichage ou débogage
 */
export function getStoredEvents(): UsageEvent[] {
  const storedEventsJson = localStorage.getItem(USAGE_STORAGE_KEY);
  if (!storedEventsJson) return [];
  
  try {
    return JSON.parse(storedEventsJson);
  } catch (e) {
    logger.error("Erreur lors de la lecture des événements stockés", { error: e });
    return [];
  }
}

/**
 * Récupère les métadonnées de l'application
 */
export function getAppMetadata(): AppMetadata {
  return appMetadata;
}

/**
 * Efface toutes les données d'analyse stockées
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem(ERROR_STORAGE_KEY);
  localStorage.removeItem(USAGE_STORAGE_KEY);
  logger.info("Données d'analyse effacées");
}

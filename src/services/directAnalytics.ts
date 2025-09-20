/**
 * Service Google Analytics Direct - Sans SDK Firebase
 * Utilise l'API Google Analytics directement comme le système de likes
 */

// Configuration Google Analytics
const GA_MEASUREMENT_ID = 'G-D6K43TLW5Y';
const GA_API_SECRET = 'your-api-secret'; // À configurer si nécessaire
const GA_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

// Configuration alternative avec gtag
const GTAG_ENDPOINT = `https://www.google-analytics.com/collect`;

// Interface pour les événements
interface AnalyticsEvent {
  name: string;
  parameters: Record<string, any>;
}

interface AnalyticsPayload {
  client_id: string;
  events: AnalyticsEvent[];
}

// Génération d'un client ID unique (comme sessionId pour les likes)
function getClientId(): string {
  let clientId = localStorage.getItem('ga_client_id');
  if (!clientId) {
    clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    localStorage.setItem('ga_client_id', clientId);
  }
  return clientId;
}

/**
 * Envoie un événement directement à Google Analytics (méthode 1: Measurement Protocol)
 */
export async function sendAnalyticsEvent(eventName: string, parameters: Record<string, any> = {}): Promise<boolean> {
  try {
    const clientId = getClientId();
    
    const payload: AnalyticsPayload = {
      client_id: clientId,
      events: [{
        name: eventName,
        parameters: {
          ...parameters,
          timestamp: new Date().toISOString(),
          page_location: window.location.href,
          page_title: document.title
        }
      }]
    };

    console.log('📊 [DirectAnalytics] Envoi événement:', eventName, parameters);

    const response = await fetch(GA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const success = response.ok;
    console.log(`📊 [DirectAnalytics] Événement ${eventName}:`, success ? '✅ Envoyé' : '❌ Échec');
    
    return success;
  } catch (error) {
    // Ne pas logger les erreurs CORS comme des erreurs critiques
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.log('📊 [DirectAnalytics] Erreur CORS attendue (normale):', error.message);
    } else {
      console.error('📊 [DirectAnalytics] Erreur envoi événement:', error);
    }
    return false;
  }
}

/**
 * Envoie un événement via gtag (méthode 2: Global Site Tag)
 */
export function sendGtagEvent(eventName: string, parameters: Record<string, any> = {}): void {
  try {
    // Initialiser gtag si nécessaire
    if (!window.gtag) {
      initializeGtag();
    }

    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        custom_parameter_timestamp: new Date().toISOString(),
        debug_mode: import.meta.env.DEV
      });
      
      console.log('📊 [DirectAnalytics] Gtag événement envoyé:', eventName, parameters);
    } else {
      console.warn('📊 [DirectAnalytics] Gtag non disponible');
    }
  } catch (error) {
    console.error('📊 [DirectAnalytics] Erreur gtag:', error);
  }
}

/**
 * Initialise gtag directement (comme dans gtag-debug.ts)
 */
function initializeGtag(): void {
  try {
    // Initialiser dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Définir gtag
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Configurer GA
    window.gtag('config', GA_MEASUREMENT_ID, {
      debug_mode: import.meta.env.DEV,
      send_page_view: true
    });
    
    // Charger le script gtag
    if (!document.querySelector(`script[src*="gtag/js"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }
    
    console.log('📊 [DirectAnalytics] Gtag initialisé');
  } catch (error) {
    console.error('📊 [DirectAnalytics] Erreur initialisation gtag:', error);
  }
}

/**
 * Service principal - comme likesService mais pour Analytics
 */
export class DirectAnalyticsService {
  private isInitialized = false;
  
  constructor() {
    this.initialize();
  }
  
  private initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Initialiser gtag automatiquement
      initializeGtag();
      this.isInitialized = true;
      
      console.log('📊 [DirectAnalytics] Service initialisé');
      
      // Envoyer un événement de test
      this.trackEvent('service_initialized', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent.substring(0, 50)
      });
      
    } catch (error) {
      console.error('📊 [DirectAnalytics] Erreur initialisation:', error);
    }
  }
  
  /**
   * Envoie un événement (méthode principale)
   */
  public async trackEvent(eventName: string, parameters: Record<string, any> = {}): Promise<void> {
    try {
      // Méthode 1: Gtag (plus fiable) - SEULE MÉTHODE UTILISÉE
      sendGtagEvent(eventName, parameters);
      
      // Méthode 2: API directe désactivée (CORS bloque les appels directs)
      // await sendAnalyticsEvent(eventName, parameters);
      
    } catch (error) {
      console.error('📊 [DirectAnalytics] Erreur trackEvent:', error);
    }
  }
  
  /**
   * Track page view
   */
  public trackPageView(pagePath: string, pageTitle: string): void {
    this.trackEvent('page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: pageTitle
    });
  }
  
  /**
   * Track interaction
   */
  public trackInteraction(action: string, element: string, properties: Record<string, any> = {}): void {
    this.trackEvent('user_interaction', {
      interaction_type: action,
      element_name: element,
      ...properties
    });
  }
  
  /**
   * Test de connectivité temps réel
   */
  public async testRealTime(): Promise<string> {
    const testId = Math.random().toString(36).substring(7);
    
    await this.trackEvent('realtime_test', {
      test_id: testId,
      timestamp: new Date().toISOString(),
      test_type: 'connectivity'
    });
    
    console.log(`📊 [DirectAnalytics] Test temps réel envoyé (ID: ${testId})`);
    return testId;
  }
}

// Instance singleton
export const directAnalytics = new DirectAnalyticsService();

// Exposer les fonctions globalement pour les tests (dev uniquement)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).directAnalytics = directAnalytics;
  (window as any).testDirectAnalytics = () => directAnalytics.testRealTime();
  
  console.log('📊 [DirectAnalytics] Fonctions disponibles:');
  console.log('- directAnalytics.trackEvent(name, params)');
  console.log('- testDirectAnalytics() : Test temps réel');
}

// Déclarer gtag pour TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

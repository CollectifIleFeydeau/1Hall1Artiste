/**
 * Utilitaire pour forcer l'envoi d'événements via différentes méthodes
 * Tente plusieurs approches pour s'assurer que les événements sont bien envoyés
 */

import { getAnalytics, logEvent } from 'firebase/analytics';
import { getFirebaseApp } from '../services/firebaseConfig';
import { analytics, EventCategory, EventAction } from '../services/firebaseAnalytics';

/**
 * Force l'envoi d'un événement via plusieurs méthodes
 * @param eventName Nom de l'événement
 * @param eventParams Paramètres de l'événement
 */
export const forceSendEvent = (eventName: string, eventParams: Record<string, any> = {}) => {
  // Ajouter des paramètres de debug
  const params = {
    ...eventParams,
    debug_mode: true,
    timestamp: new Date().toISOString(),
    force_sent: true
  };

  // 1. Méthode Firebase Analytics standard
  try {
    const app = getFirebaseApp();
    if (!app) {
      console.warn('Firebase non initialisé, impossible d\'utiliser Analytics');
      return;
    }
    const analyticsInstance = getAnalytics(app);
    logEvent(analyticsInstance, eventName, params);
    console.log(`[Force Send] Événement "${eventName}" envoyé via Firebase Analytics`);
  } catch (error) {
    console.error(`[Force Send] Erreur lors de l'envoi via Firebase Analytics:`, error);
  }

  // 2. Méthode via notre service Analytics
  try {
    // Utiliser la méthode trackEvent avec la catégorie FEATURE et l'action FEATURE_USE
    analytics.trackEvent(EventCategory.FEATURE, EventAction.FEATURE_USE, {
      event_name: eventName,
      ...params
    });
    console.log(`[Force Send] Événement "${eventName}" envoyé via notre service Analytics`);
  } catch (error) {
    console.error(`[Force Send] Erreur lors de l'envoi via notre service Analytics:`, error);
  }

  // 3. Méthode directe via gtag
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        send_to: 'default', // Envoyer à toutes les propriétés configurées
      });
      console.log(`[Force Send] Événement "${eventName}" envoyé via gtag`);
    }
  } catch (error) {
    console.error(`[Force Send] Erreur lors de l'envoi via gtag:`, error);
  }

  // 4. Méthode via dataLayer (pour GTM)
  try {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.dataLayer.push({
      event: eventName,
      ...params
    });
    console.log(`[Force Send] Événement "${eventName}" envoyé via dataLayer`);
  } catch (error) {
    console.error(`[Force Send] Erreur lors de l'envoi via dataLayer:`, error);
  }

  // 5. Méthode via localStorage pour debug
  try {
    const debugEvents = JSON.parse(localStorage.getItem('debug_analytics_events') || '[]');
    debugEvents.push({
      name: eventName,
      params,
      timestamp: Date.now()
    });
    localStorage.setItem('debug_analytics_events', JSON.stringify(debugEvents));
    console.log(`[Force Send] Événement "${eventName}" sauvegardé dans localStorage pour debug`);
  } catch (error) {
    console.error(`[Force Send] Erreur lors de la sauvegarde dans localStorage:`, error);
  }

  return {
    eventName,
    params,
    timestamp: Date.now(),
    success: true
  };
};

/**
 * Force l'envoi d'un événement page_view
 * @param pagePath Chemin de la page
 * @param pageTitle Titre de la page
 */
export const forceSendPageView = (pagePath: string, pageTitle: string) => {
  return forceSendEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href
  });
};

/**
 * Force l'envoi d'un événement d'interaction utilisateur
 * @param actionName Nom de l'action
 * @param elementId ID de l'élément (optionnel)
 */
export const forceSendUserInteraction = (actionName: string, elementId?: string) => {
  return forceSendEvent('user_interaction', {
    action: actionName,
    element_id: elementId || 'unknown',
    screen_name: window.location.pathname
  });
};

/**
 * Force l'envoi d'un événement de complétion d'onboarding
 */
export const forceSendOnboardingComplete = () => {
  return forceSendEvent('onboarding_complete', {
    method: 'forced',
    success: true
  });
};

/**
 * Récupère les événements de debug stockés dans localStorage
 */
export const getDebugEvents = () => {
  try {
    return JSON.parse(localStorage.getItem('debug_analytics_events') || '[]');
  } catch (error) {
    console.error('Erreur lors de la récupération des événements de debug:', error);
    return [];
  }
};

/**
 * Efface les événements de debug stockés dans localStorage
 */
export const clearDebugEvents = () => {
  localStorage.setItem('debug_analytics_events', '[]');
};


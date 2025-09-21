import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  analytics, 
  trackPageView, 
  trackEvent, 
  trackInteraction,
  trackSwipe,
  trackFeatureUse,
  EventCategory,
  EventAction,
  EventProperties
} from '../services/firebaseAnalytics';

/**
 * Hook personnalisé pour utiliser Firebase Analytics dans les composants React
 * Permet de suivre automatiquement les vues de page et fournit des méthodes pour
 * suivre d'autres types d'événements
 */
export function useAnalytics() {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  // Suivre automatiquement les changements de page
  useEffect(() => {
    const currentPath = location.pathname;
    const pageTitle = document.title;

    // Suivre la vue de page
    trackPageView(currentPath, pageTitle);

    // Suivre le changement de route si ce n'est pas la première page
    if (previousPath.current && previousPath.current !== currentPath) {
      analytics.trackRouteChange(previousPath.current, currentPath);
    }

    // Mettre à jour le chemin précédent
    previousPath.current = currentPath;
  }, [location.pathname]);

  // Retourner les fonctions de suivi pour une utilisation facile dans les composants
  return {
    // Événements génériques
    trackEvent: (category: EventCategory, action: EventAction, properties?: EventProperties) => 
      trackEvent(category, action, properties),

    // Interactions utilisateur
    trackInteraction: (action: EventAction, element: string, properties?: EventProperties) => 
      trackInteraction(action, element, properties),

    // Interactions de swipe
    trackSwipe: (direction: 'left' | 'right' | 'up' | 'down', source: string, success: boolean, properties?: EventProperties) => 
      trackSwipe(direction, source, success, properties),

    // Utilisation de fonctionnalités
    trackFeatureUse: (featureName: string, properties?: EventProperties) => 
      trackFeatureUse(featureName, properties),

    // Interactions avec le contenu
    trackContentInteraction: (action: EventAction, contentType: string, contentId: string, properties?: EventProperties) => 
      analytics.trackContentInteraction(action, contentType, contentId, properties),

    // Interactions média
    trackMediaInteraction: (action: EventAction, mediaType: string, mediaId: string, properties?: EventProperties) => 
      analytics.trackMediaInteraction(action, mediaType, mediaId, properties),

    // Interactions avec la carte
    trackMapInteraction: (action: EventAction, properties?: EventProperties) => 
      analytics.trackMapInteraction(action, properties),

    // Interactions avec le programme
    trackProgramInteraction: (action: EventAction, properties?: EventProperties) => 
      analytics.trackProgramInteraction(action, properties),

    // Interactions communautaires
    trackCommunityInteraction: (action: EventAction, properties?: EventProperties) => 
      analytics.trackCommunityInteraction(action, properties),

    // Interactions de donation
    trackDonationInteraction: (action: EventAction, properties?: EventProperties) => 
      analytics.trackDonationInteraction(action, properties),


    // Erreurs
    trackError: (action: EventAction, message: string, properties?: EventProperties) => 
      analytics.trackError(action, message, properties),
  };
}

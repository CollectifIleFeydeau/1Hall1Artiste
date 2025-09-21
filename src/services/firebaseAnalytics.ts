import { getFirebaseAnalytics } from './firebaseConfig';
import { logEvent } from 'firebase/analytics';

// Types pour les événements
export enum EventCategory {
  NAVIGATION = 'navigation',
  INTERACTION = 'interaction',
  CONTENT = 'content',
  MEDIA = 'media',
  PERFORMANCE = 'performance',
  ERROR = 'error',
  USER = 'user',
  FEATURE = 'feature',
  COMMUNITY = 'community',
  PROGRAM = 'program',
  MAP = 'map',
  DONATION = 'donation',
}

export enum EventAction {
  // Navigation
  PAGE_VIEW = 'page_view',
  ROUTE_CHANGE = 'route_change',
  EXTERNAL_LINK = 'external_link',
  BACK = 'back',
  FORWARD = 'forward',
  
  // Interaction
  CLICK = 'click',
  SWIPE = 'swipe',
  SCROLL = 'scroll',
  ZOOM = 'zoom',
  DRAG = 'drag',
  HOVER = 'hover',
  FOCUS = 'focus',
  BLUR = 'blur',
  
  // Content
  VIEW = 'view',
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  SHARE = 'share',
  SAVE = 'save',
  UNSAVE = 'unsave',
  LIKE = 'like',
  UNLIKE = 'unlike',
  
  // Media
  PLAY = 'play',
  PAUSE = 'pause',
  COMPLETE = 'complete',
  SEEK = 'seek',
  VOLUME_CHANGE = 'volume_change',
  FULLSCREEN = 'fullscreen',
  
  // Performance
  LOAD_TIME = 'load_time',
  FIRST_PAINT = 'first_paint',
  FIRST_CONTENTFUL_PAINT = 'first_contentful_paint',
  FIRST_INPUT_DELAY = 'first_input_delay',
  
  // Error
  JS_ERROR = 'js_error',
  API_ERROR = 'api_error',
  RESOURCE_ERROR = 'resource_error',
  
  // User
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PROFILE_UPDATE = 'profile_update',
  
  // Feature
  FEATURE_ENABLE = 'feature_enable',
  FEATURE_DISABLE = 'feature_disable',
  FEATURE_USE = 'feature_use',
  
  
  // Community
  CONTRIBUTION = 'contribution',
  COMMENT = 'comment',
  UPLOAD = 'upload',
  
  // Program
  EVENT_VIEW = 'event_view',
  EVENT_DETAILS = 'event_details',
  EVENT_REMINDER = 'event_reminder',
  
  // Map
  MAP_LOAD = 'map_load',
  LOCATION_VIEW = 'location_view',
  ROUTE_CALCULATE = 'route_calculate',
  USER_LOCATION = 'user_location',
  
  // Donation
  DONATION_START = 'donation_start',
  DONATION_COMPLETE = 'donation_complete',
  DONATION_CANCEL = 'donation_cancel',
}

// Interface pour les propriétés d'événement
export interface EventProperties {
  [key: string]: any;
}

// Classe principale pour l'analytique
class AnalyticsService {
  // Traquer un événement générique
  trackEvent(category: EventCategory, action: EventAction, properties?: EventProperties): void {
    try {
      const analytics = getFirebaseAnalytics();
      if (!analytics) return;

      // Préparer les propriétés de l'événement
      const eventName = `${category}_${action}`;
      const eventParams: Record<string, any> = {
        event_category: category,
        event_action: action,
        timestamp: new Date().toISOString(),
        ...properties
      };

      // Forcer l'affichage en DebugView si activé
      try {
        const urlHasDebug = typeof window !== 'undefined' && window.location.search.includes('firebase_debug=1');
        const lsDebug = typeof window !== 'undefined' && localStorage.getItem('analytics_debug') === '1';
        const debugEnabled = import.meta.env.DEV || urlHasDebug || lsDebug;
        if (debugEnabled) {
          eventParams.debug_mode = true;
        }
      } catch (_) {
        // ignore
      }

      // Envoyer l'événement à Firebase Analytics
      logEvent(analytics, eventName, eventParams);
      
      // Log pour le débogage en développement
      if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, eventParams);
      }
    } catch (error) {
      console.error('[Analytics] Erreur lors du tracking de l\'événement:', error);
    }
  }

  // Traquer une vue de page
  trackPageView(pagePath: string, pageTitle: string): void {
    this.trackEvent(EventCategory.NAVIGATION, EventAction.PAGE_VIEW, {
      page_path: pagePath,
      page_title: pageTitle
    });
  }

  // Traquer un changement de route
  trackRouteChange(from: string, to: string): void {
    this.trackEvent(EventCategory.NAVIGATION, EventAction.ROUTE_CHANGE, {
      from_route: from,
      to_route: to
    });
  }

  // Traquer une interaction utilisateur
  trackInteraction(action: EventAction, element: string, properties?: EventProperties): void {
    this.trackEvent(EventCategory.INTERACTION, action, {
      element,
      ...properties
    });
  }

  // Traquer une interaction avec du contenu
  trackContentInteraction(action: EventAction, contentType: string, contentId: string, properties?: EventProperties): void {
    this.trackEvent(EventCategory.CONTENT, action, {
      content_type: contentType,
      content_id: contentId,
      ...properties
    });
  }

  // Traquer une interaction média
  trackMediaInteraction(action: EventAction, mediaType: string, mediaId: string, properties?: EventProperties): void {
    this.trackEvent(EventCategory.MEDIA, action, {
      media_type: mediaType,
      media_id: mediaId,
      ...properties
    });
  }

  // Traquer une métrique de performance
  trackPerformance(action: EventAction, value: number, properties?: EventProperties): void {
    this.trackEvent(EventCategory.PERFORMANCE, action, {
      value,
      ...properties
    });
  }

  // Traquer une erreur
  trackError(action: EventAction, message: string, properties?: EventProperties): void {
    this.trackEvent(EventCategory.ERROR, action, {
      error_message: message,
      ...properties
    });
  }

  // Traquer une action utilisateur
  trackUserAction(action: EventAction, properties?: EventProperties): void {
    this.trackEvent(EventCategory.USER, action, properties);
  }

  // Traquer l'utilisation d'une fonctionnalité
  trackFeatureUse(featureName: string, properties?: EventProperties): void {
    this.trackEvent(EventCategory.FEATURE, EventAction.FEATURE_USE, {
      feature_name: featureName,
      ...properties
    });
  }


  // Traquer les interactions avec la carte
  trackMapInteraction(action: EventAction, properties?: EventProperties): void {
    this.trackEvent(EventCategory.MAP, action, properties);
  }

  // Traquer les interactions avec le programme
  trackProgramInteraction(action: EventAction, properties?: EventProperties): void {
    this.trackEvent(EventCategory.PROGRAM, action, properties);
  }

  // Traquer les interactions communautaires
  trackCommunityInteraction(action: EventAction, properties?: EventProperties): void {
    this.trackEvent(EventCategory.COMMUNITY, action, properties);
  }

  // Traquer les interactions de donation
  trackDonationInteraction(action: EventAction, properties?: EventProperties): void {
    this.trackEvent(EventCategory.DONATION, action, properties);
  }

  // Traquer les interactions de swipe
  trackSwipe(direction: 'left' | 'right' | 'up' | 'down', source: string, success: boolean, properties?: EventProperties): void {
    this.trackEvent(EventCategory.INTERACTION, EventAction.SWIPE, {
      swipe_direction: direction,
      swipe_source: source,
      swipe_success: success,
      ...properties
    });
  }

  // Traquer les métriques de session
  startSession(): void {
    this.trackEvent(EventCategory.USER, EventAction.LOGIN as EventAction, {
      session_start: Date.now()
    });
    
    // Stocker le début de la session
    sessionStorage.setItem('session_start', Date.now().toString());
  }

  endSession(): void {
    const sessionStart = sessionStorage.getItem('session_start');
    if (sessionStart) {
      const sessionDuration = Date.now() - parseInt(sessionStart, 10);
      this.trackEvent(EventCategory.USER, EventAction.LOGOUT as EventAction, {
        session_duration: sessionDuration
      });
    }
  }

  // ===== Domain-specific helpers =====
  // Bâtiment (lieux)
  trackBuildingView(buildingId: string, buildingName: string): void {
    this.trackEvent(EventCategory.CONTENT, EventAction.VIEW, {
      content_type: 'building',
      building_id: buildingId,
      building_name: buildingName
    });
  }

  trackBuildingHistoryView(buildingId: string, sectionTitle: string): void {
    this.trackEvent(EventCategory.CONTENT, EventAction.VIEW, {
      content_type: 'building_history',
      building_id: buildingId,
      section_title: sectionTitle
    });
  }

  // Artiste
  trackArtistView(artistId: string, artistName: string): void {
    this.trackEvent(EventCategory.CONTENT, EventAction.VIEW, {
      content_type: 'artist',
      artist_id: artistId,
      artist_name: artistName
    });
  }

  // Concert / Event du programme
  trackConcertView(eventId: string, title: string, isoDate?: string): void {
    this.trackEvent(EventCategory.PROGRAM, EventAction.EVENT_VIEW, {
      event_id: eventId,
      event_title: title,
      event_date: isoDate
    });
  }

  trackProgramCTA(action: 'open_program' | 'open_event_details' | 'add_to_calendar' | 'get_directions', eventId?: string): void {
    this.trackEvent(EventCategory.PROGRAM, EventAction.CLICK, {
      cta_action: action,
      event_id: eventId
    });
  }

  // Page dons / tunnel dons
  trackDonationPageOpen(source: string): void {
    this.trackEvent(EventCategory.DONATION, EventAction.VIEW, {
      page: 'donation',
      source
    });
  }

  // Vidéo d'introduction
  trackIntroVideo(action: 'start' | 'complete' | 'skip'): void {
    const map: Record<string, EventAction> = {
      start: EventAction.PLAY,
      complete: EventAction.COMPLETE,
      skip: EventAction.PAUSE
    };
    const resolved = map[action] || EventAction.PLAY;
    this.trackEvent(EventCategory.MEDIA, resolved, {
      media_type: 'intro_video'
    });
  }

  // Contrôles audio (lecteur des histoires)
  trackAudio(action: 'play' | 'pause' | 'seek' | 'volume_change', trackId: string, value?: number): void {
    const actionMap: Record<string, EventAction> = {
      play: EventAction.PLAY,
      pause: EventAction.PAUSE,
      seek: EventAction.SEEK,
      volume_change: EventAction.VOLUME_CHANGE
    };
    const evt = actionMap[action] || EventAction.PLAY;
    this.trackEvent(EventCategory.MEDIA, evt, {
      media_type: 'audio',
      media_id: trackId,
      value
    });
  }
}

// Exporter une instance singleton
export const analytics = new AnalyticsService();

// Exporter des fonctions utilitaires pour faciliter l'utilisation
export const trackPageView = (pagePath: string, pageTitle: string) => 
  analytics.trackPageView(pagePath, pageTitle);

export const trackEvent = (category: EventCategory, action: EventAction, properties?: EventProperties) => 
  analytics.trackEvent(category, action, properties);

export const trackInteraction = (action: EventAction, element: string, properties?: EventProperties) => 
  analytics.trackInteraction(action, element, properties);

export const trackSwipe = (direction: 'left' | 'right' | 'up' | 'down', source: string, success: boolean, properties?: EventProperties) => 
  analytics.trackSwipe(direction, source, success, properties);

export const trackFeatureUse = (featureName: string, properties?: EventProperties) => 
  analytics.trackFeatureUse(featureName, properties);

export const trackError = (action: EventAction, message: string, properties?: EventProperties) => 
  analytics.trackError(action, message, properties);

import { Event } from "@/data/events";
import { createLogger } from "@/utils/logger";

// Créer un logger pour le service de calendrier
const logger = createLogger('calendarService');

/**
 * Types d'erreurs possibles lors de l'ajout au calendrier
 */
export enum CalendarErrorType {
  NOT_SUPPORTED = "NOT_SUPPORTED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  GENERAL_ERROR = "GENERAL_ERROR"
}

/**
 * Résultat de l'opération d'ajout au calendrier
 */
export interface CalendarResult {
  success: boolean;
  errorType?: CalendarErrorType;
  errorMessage?: string;
}

/**
 * Vérifie si l'API de calendrier est disponible sur l'appareil
 */
export const isCalendarSupported = (): boolean => {
  // Vérifier si nous sommes dans un navigateur mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Vérifier si l'API Web Share est disponible (indicateur indirect de support)
  const hasWebShare = 'share' in navigator && 'canShare' in navigator;
  
  // Sur iOS, nous pouvons utiliser des liens webcal://
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Sur desktop, nous pouvons toujours proposer le téléchargement du fichier .ics
  const isDesktop = !isMobile;
  
  logger.info("Vérification du support calendrier", { 
    isMobile, 
    hasWebShare, 
    isIOS, 
    isDesktop,
    userAgent: navigator.userAgent 
  });
  
  // Retourner true pour tous les appareils
  // - Sur mobile avec Web Share: utiliser l'API de partage
  // - Sur iOS: utiliser les liens webcal://
  // - Sur desktop: proposer le téléchargement du fichier .ics
  return hasWebShare || isIOS || isDesktop;
};

/**
 * Formate un événement pour l'export vers le calendrier
 */
const formatEventForCalendar = (event: Event): string => {
  // Déterminer la date de l'événement en fonction du jour (samedi ou dimanche)
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Trouver la date du prochain samedi ou dimanche en fonction des jours de l'événement
  let eventDate = new Date();
  if (event.days.includes('samedi')) {
    // Trouver le prochain samedi (jour 6)
    while (eventDate.getDay() !== 6) {
      eventDate.setDate(eventDate.getDate() + 1);
    }
  } else if (event.days.includes('dimanche')) {
    // Trouver le prochain dimanche (jour 0)
    while (eventDate.getDay() !== 0) {
      eventDate.setDate(eventDate.getDate() + 1);
    }
  }
  
  // Extraire les heures de début et de fin
  const startTime = event.time.split(' - ')[0];
  const endTime = event.time.split(' - ')[1] || (parseInt(startTime.split('h')[0]) + 1) + 'h00';
  
  // Formater les dates de début et de fin au format iCalendar
  const startDate = new Date(eventDate);
  const [startHour, startMinute] = startTime.split('h').map(part => parseInt(part) || 0);
  startDate.setHours(startHour, startMinute, 0);
  
  const endDate = new Date(eventDate);
  const [endHour, endMinute] = endTime.split('h').map(part => parseInt(part) || 0);
  endDate.setHours(endHour, endMinute, 0);
  
  // Formater au format iCalendar (RFC 5545)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const formatText = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,');
  };
  
  // Créer l'événement au format iCalendar
  const icalEvent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Collectif Feydeau//App//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@collectif-feydeau.app`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${formatText(event.title)}`,
    `DESCRIPTION:${formatText(event.artistName || '')}`,
    `LOCATION:${formatText('Île Feydeau, Nantes')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icalEvent;
};

/**
 * Ajoute un événement au calendrier de l'appareil
 * Utilise différentes approches selon la plateforme
 */
export const addToCalendar = async (event: Event): Promise<CalendarResult> => {
  try {
    // Toujours retourner true pour la vérification de support
    // Nous allons gérer les différentes plateformes directement
    
    // Formater l'événement au format iCalendar
    const icalEvent = formatEventForCalendar(event);
    
    // Détecter les plateformes
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    logger.info("Détection de plateforme", { isIOS, isAndroid, isMobile, userAgent: navigator.userAgent });
    
    // Créer le blob pour toutes les plateformes
    const blob = new Blob([icalEvent], { type: 'text/calendar;charset=utf-8' });
    
    // Approche spécifique pour iOS
    if (isIOS) {
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url.replace('blob:', 'webcal:');
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        logger.info("Événement ajouté au calendrier iOS", { eventId: event.id });
        return { success: true };
      } catch (iosError) {
        logger.warn("Erreur lors de l'ajout au calendrier iOS", { iosError });
        // Continuer avec la méthode alternative
      }
    }
    
    // Approche spécifique pour Android
    if (isAndroid) {
      try {
        // Sur Android, essayer d'abord le partage simple
        if (navigator.share) {
          // Créer une URL temporaire pour le fichier .ics
          const url = URL.createObjectURL(blob);
          
          // Partager un lien et des informations
          await navigator.share({
            title: `Ajouter "${event.title}" à votre calendrier`,
            text: `Événement: ${event.title} - ${event.days.join(' et ')} à ${event.time}\nLieu: Île Feydeau, Nantes`,
            url: window.location.href // Utiliser l'URL actuelle comme fallback
          });
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          logger.info("Informations partagées pour ajout au calendrier Android", { eventId: event.id });
          return { success: true };
        }
      } catch (androidError) {
      }
    }
    
    // Essayer le partage de fichier (pour les appareils mobiles qui le supportent)
    if (isMobile && navigator.share) {
      try {
        // Créer un fichier à partir du blob
        const file = new File([blob], `${event.title.replace(/\s+/g, '_')}.ics`, { type: 'text/calendar' });
        
        // Vérifier si le partage de fichier est supporté
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Ajouter "${event.title}" à votre calendrier`,
            text: `Événement: ${event.title} - ${event.days.join(' et ')} à ${event.time}`
          });
          
          logger.info("Fichier partagé pour ajout au calendrier", { eventId: event.id });
          return { success: true };
        }
      } catch (shareError) {
        logger.warn("Erreur lors du partage de fichier", { shareError });
        // Continuer avec le téléchargement direct
      }
    }
    
    // Méthode universelle : téléchargement direct du fichier .ics
    // Cette méthode fonctionne sur la plupart des navigateurs desktop
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
      link.style.display = 'none'; // Masquer l'élément
      
      // Vérification sécurisée avant manipulation DOM
      if (document.body && document.contains(document.body)) {
        document.body.appendChild(link);
        link.click();
        
        // Cleanup sécurisé avec vérification
        if (document.body.contains(link)) {
          try {
            document.body.removeChild(link);
          } catch (removeError) {
            logger.warn('Error removing calendar download element:', removeError);
            // Fallback: essayer de supprimer via remove() si disponible
            if (link.remove) {
              link.remove();
            }
          }
        }
      } else {
        logger.warn('Document body not available for calendar download');
      }
      
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch (revokeError) {
          logger.warn('Error revoking object URL:', revokeError);
        }
      }, 100);
    } catch (downloadError) {
      logger.error('Error in calendar download:', downloadError);
      throw downloadError; // Re-lancer l'erreur pour qu'elle soit gérée par le catch principal
    }
    
    logger.info("Fichier .ics téléchargé", { eventId: event.id, platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop' });
    return { success: true };
  } catch (error) {
    logger.error("Erreur lors de l'ajout au calendrier", { error });
    return {
      success: false,
      errorType: CalendarErrorType.GENERAL_ERROR,
      errorMessage: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    };
  }
};

/**
 * Crée un rappel pour un événement
 * Utilise les notifications natives si disponibles, sinon utilise le système de notification interne
 */
export const createReminder = async (event: Event, reminderTime: Date): Promise<CalendarResult> => {
  try {
    // Vérifier si les notifications sont supportées
    if (!('Notification' in window)) {
      logger.warn("Notifications non supportées");
      return {
        success: false,
        errorType: CalendarErrorType.NOT_SUPPORTED,
        errorMessage: "Les notifications ne sont pas supportées sur cet appareil"
      };
    }
    
    // Demander la permission si nécessaire
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        logger.warn("Permission de notification refusée");
        return {
          success: false,
          errorType: CalendarErrorType.PERMISSION_DENIED,
          errorMessage: "Permission refusée pour les notifications"
        };
      }
    }
    
    // Calculer le délai jusqu'au rappel
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    if (timeUntilReminder <= 0) {
      logger.warn("La date de rappel est déjà passée");
      return {
        success: false,
        errorType: CalendarErrorType.GENERAL_ERROR,
        errorMessage: "La date de rappel est déjà passée"
      };
    }
    
    // Enregistrer le rappel dans le service worker si disponible
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        payload: {
          id: `reminder-${event.id}`,
          title: `Rappel: ${event.title}`,
          body: `${event.days.join(' et ')} à ${event.time} - Île Feydeau, Nantes`,
          timestamp: reminderTime.getTime()
        }
      });
      
      logger.info("Rappel programmé via service worker", { 
        eventId: event.id, 
        reminderTime: reminderTime.toISOString() 
      });
      
      return { success: true };
    } else {
      // Fallback: utiliser setTimeout (ne fonctionne que si l'application reste ouverte)
      setTimeout(() => {
        new Notification(`Rappel: ${event.title}`, {
          body: `${event.days.join(' et ')} à ${event.time} - Île Feydeau, Nantes`,
          icon: '/icon-192x192.png'
        });
      }, timeUntilReminder);
      
      logger.info("Rappel programmé via setTimeout", { 
        eventId: event.id, 
        reminderTime: reminderTime.toISOString() 
      });
      
      return { success: true };
    }
  } catch (error) {
    logger.error("Erreur lors de la création du rappel", { error });
    return {
      success: false,
      errorType: CalendarErrorType.GENERAL_ERROR,
      errorMessage: error instanceof Error ? error.message : "Une erreur inconnue est survenue"
    };
  }
};


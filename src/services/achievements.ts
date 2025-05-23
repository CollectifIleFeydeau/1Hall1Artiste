/**
 * Service de gestion des réalisations utilisateur
 * Ce service permet de suivre les actions importantes de l'utilisateur
 * et de déclencher des célébrations pour les moments clés
 */

// Types de réalisations disponibles
export enum AchievementType {
  FIRST_EVENT_SAVED = 'first_event_saved',
  ALL_LOCATIONS_VISITED = 'all_locations_visited',
  MULTIPLE_EVENTS_SAVED = 'multiple_events_saved',
  NOTIFICATION_SET = 'notification_set'
}

// Interface pour une réalisation
export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  unlockedAt?: string;
  celebrationMessage: string;
}

// Liste des réalisations disponibles
const achievementsList: Achievement[] = [
  {
    id: AchievementType.FIRST_EVENT_SAVED,
    title: "Premier événement sauvegardé",
    description: "Vous avez sauvegardé votre premier événement",
    celebrationMessage: "Félicitations ! Vous avez sauvegardé votre premier événement !"
  },
  {
    id: AchievementType.ALL_LOCATIONS_VISITED,
    title: "Explorateur de l'Île",
    description: "Vous avez visité tous les lieux de l'Île Feydeau",
    celebrationMessage: "Bravo ! Vous avez visité tous les lieux de l'Île Feydeau !"
  },
  {
    id: AchievementType.MULTIPLE_EVENTS_SAVED,
    title: "Collectionneur d'événements",
    description: "Vous avez sauvegardé 5 événements ou plus",
    celebrationMessage: "Impressionnant ! Vous êtes un vrai collectionneur d'événements !"
  },
  {
    id: AchievementType.NOTIFICATION_SET,
    title: "Toujours à l'heure",
    description: "Vous avez configuré votre première notification",
    celebrationMessage: "Super ! Vous ne manquerez plus aucun événement !"
  }
];

/**
 * Récupérer toutes les réalisations avec leur statut
 */
export const getAchievements = (): Achievement[] => {
  try {
    const unlockedAchievementsStr = localStorage.getItem('unlockedAchievements');
    let unlockedAchievements = {};
    
    if (unlockedAchievementsStr) {
      try {
        unlockedAchievements = JSON.parse(unlockedAchievementsStr);
      } catch (error) {
        console.error('Erreur lors de la lecture des réalisations débloquées:', error);
        unlockedAchievements = {};
      }
    }
    
    // Retourner la liste complète avec les dates de déblocage
    return achievementsList.map(achievement => ({
      ...achievement,
      unlockedAt: unlockedAchievements[achievement.id]
    }));
  } catch (error) {
    console.error('Erreur dans getAchievements:', error);
    return achievementsList;
  }
};

/**
 * Vérifier si une réalisation est débloquée
 */
export const isAchievementUnlocked = (achievementId: AchievementType): boolean => {
  try {
    const unlockedAchievementsStr = localStorage.getItem('unlockedAchievements');
    if (!unlockedAchievementsStr) return false;
    
    const unlockedAchievements = JSON.parse(unlockedAchievementsStr);
    return !!unlockedAchievements[achievementId];
  } catch (error) {
    console.error('Erreur dans isAchievementUnlocked:', error);
    return false;
  }
};

/**
 * Débloquer une réalisation
 * @returns true si la réalisation vient d'être débloquée, false si elle l'était déjà
 */
export const unlockAchievement = (achievementId: AchievementType): boolean => {
  try {
    console.log(`[achievements] Tentative de déblocage de l'achievement: ${achievementId}`);
    
    // Vérifier si la réalisation est déjà débloquée
    const isAlreadyUnlocked = isAchievementUnlocked(achievementId);
    console.log(`[achievements] Achievement déjà débloqué: ${isAlreadyUnlocked}`);
    
    if (isAlreadyUnlocked) {
      console.log(`[achievements] Achievement déjà débloqué, aucune action nécessaire`);
      return false;
    }
    
    // Récupérer les réalisations débloquées
    const unlockedAchievementsStr = localStorage.getItem('unlockedAchievements');
    console.log(`[achievements] Récupération des achievements débloqués depuis localStorage: ${unlockedAchievementsStr || 'aucun'}`);
    
    let unlockedAchievements = {};
    
    if (unlockedAchievementsStr) {
      try {
        unlockedAchievements = JSON.parse(unlockedAchievementsStr);
        console.log(`[achievements] Achievements débloqués parsés:`, unlockedAchievements);
      } catch (error) {
        console.error('[achievements] Erreur lors de la lecture des réalisations débloquées:', error);
        unlockedAchievements = {};
      }
    }
    
    // Débloquer la réalisation
    const unlockTime = new Date().toISOString();
    unlockedAchievements[achievementId] = unlockTime;
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    console.log(`[achievements] Achievement ${achievementId} débloqué à ${unlockTime}`);
    
    // Déclencher l'événement d'achievement pour afficher les confettis
    try {
      // Utiliser un timeout pour éviter les problèmes de timing
      console.log(`[achievements] Planification du déclenchement de l'événement d'achievement dans 100ms`);
      setTimeout(() => {
        // Créer et dispatcher directement l'événement personnalisé
        const message = getAchievementCelebrationMessage(achievementId);
        console.log(`[achievements] Message de célébration: ${message}`);
        
        if (message) {
          console.log(`[achievements] Déclenchement de l'événement global app-achievement pour: ${achievementId}`);
          // Créer un événement global pour éviter les dépendances circulaires
          const event = new CustomEvent('app-achievement', {
            detail: { type: achievementId, message }
          });
          window.dispatchEvent(event);
          console.log(`[achievements] Événement global dispatché avec succès`);
        } else {
          console.error(`[achievements] Impossible de trouver un message pour l'achievement ${achievementId}`);
        }
      }, 100);
    } catch (error) {
      console.error('[achievements] Erreur lors du déclenchement de l\'achievement:', error);
    }
    
    return true;
  } catch (error) {
    console.error('[achievements] Erreur globale dans unlockAchievement:', error);
    return false;
  }
};

/**
 * Récupérer le message de célébration pour une réalisation
 */
export const getAchievementCelebrationMessage = (achievementId: AchievementType): string | null => {
  const achievement = achievementsList.find(a => a.id === achievementId);
  return achievement ? achievement.celebrationMessage : null;
};

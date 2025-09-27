/**
 * Types pour le système d'achievements
 */

export enum AchievementType {
  FIRST_EVENT_SAVED = 'FIRST_EVENT_SAVED',
  FIVE_EVENTS_SAVED = 'FIVE_EVENTS_SAVED',
  ALL_LOCATIONS_VISITED = 'ALL_LOCATIONS_VISITED',
  FIRST_LOCATION_VISITED = 'FIRST_LOCATION_VISITED',
  HALF_LOCATIONS_VISITED = 'HALF_LOCATIONS_VISITED'
}

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
}


// Types pour le système de likes
export interface LikeData {
  liked: boolean;
  total: number;
  likedBy?: string[]; // Optionnel, utilisé pour le cache
}

export interface LikeEntry {
  entryId: string;
  likes: number;
  likedBy: string[];
  lastLiked: string;
}

export interface LikeStats {
  total: number;
  today: number;
  topEntry?: string;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  total: number;
  error?: string;
}

// Structure Firebase pour les likes
export interface FirebaseLikesStructure {
  'community-photos': {
    [entryId: string]: {
      likes: number;
      likedBy: string[];
      lastLiked: string;
    };
  };
  'likes-stats': {
    total: number;
    today: number;
    topEntry: string;
  };
}

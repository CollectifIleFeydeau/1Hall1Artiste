/**
 * Types pour la galerie communautaire
 */

export interface ModerationStatus {
  status: 'pending' | 'approved' | 'rejected';
  moderatedAt: string | null;
  reason?: string;
}

export interface CommunityEntry {
  id: string;
  type: 'photo' | 'testimonial';
  displayName: string;
  sessionId?: string;
  createdAt: string;
  timestamp: string;
  eventId?: string;
  locationId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  moderation?: ModerationStatus;
}

export interface CommunityContentData {
  entries: CommunityEntry[];
}

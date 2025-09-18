/**
 * 🚀 RÉVOLUTION CLOUDINARY : Service communautaire ultra-simple
 * Fini GitHub, fini les workflows, fini la complexité !
 */

// Import des types
import { CommunityEntry, SubmissionParams, ModerationStatus, ModerationResult } from "../types/communityTypes";

// 🚀 RÉVOLUTION : Tout vient du service Cloudinary pur !
export { 
  fetchCommunityEntries, 
  submitContribution, 
  deleteCommunityEntry 
} from './cloudinaryService';

// Fonctions utilitaires conservées pour compatibilité
export function getStoredEntries(): CommunityEntry[] {
  try {
    const stored = localStorage.getItem('community_entries');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[CommunityService] Erreur lecture localStorage:', error);
    return [];
  }
}

export function saveEntries(entries: CommunityEntry[]): void {
  try {
    localStorage.setItem('community_entries', JSON.stringify(entries));
    console.log(`[CommunityService] ${entries.length} entrées sauvegardées`);
  } catch (error) {
    console.error('[CommunityService] Erreur sauvegarde localStorage:', error);
  }
}

// Fonctions de modération conservées
export async function moderateEntry(entryId: string, decision: 'approve' | 'reject', reason?: string): Promise<ModerationResult> {
  console.log(`[CommunityService] Modération de l'entrée ${entryId}: ${decision}`);
  
  const entries = getStoredEntries();
  const entryIndex = entries.findIndex(entry => entry.id === entryId);
  
  if (entryIndex === -1) {
    return {
      success: false,
      error: 'Entrée non trouvée'
    };
  }

  const entry = entries[entryIndex];
  entry.moderation = {
    status: decision === 'approve' ? 'approved' : 'rejected',
    moderatedAt: new Date().toISOString(),
    reason
  };

  entries[entryIndex] = entry;
  saveEntries(entries);

  return {
    success: true,
    entry
  };
}

export async function restoreEntry(entryId: string): Promise<void> {
  const entries = getStoredEntries();
  const updatedEntries = entries.map(entry => 
    entry.id === entryId 
      ? { ...entry, moderation: { status: 'pending' as ModerationStatus, moderatedAt: null } }
      : entry
  );
  
  saveEntries(updatedEntries);
  console.log(`[CommunityService] Entrée ${entryId} restaurée`);
}

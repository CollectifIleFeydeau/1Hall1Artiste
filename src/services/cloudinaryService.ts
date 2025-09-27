/**
 * Service de galerie communautaire - Cloudinary + Firebase
 */

import { CommunityEntry, SubmissionParams, ModerationStatus } from "../types/communityTypes";

// Configuration Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dpatqkgsc';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

// Configuration Firebase Realtime Database
const FIREBASE_CONFIG = {
  databaseURL: "https://collectif-feydeau-default-rtdb.europe-west1.firebasedatabase.app"
};

export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  try {
    // Nettoyage initial avec protection localStorage
    let isFirstLoad = false;
    try {
      isFirstLoad = !localStorage.getItem('cloudinary_revolution_started');
      if (isFirstLoad) {
        localStorage.removeItem('community_entries');
        localStorage.setItem('cloudinary_revolution_started', 'true');
        console.log('[CloudinaryService] Système initialisé');
      }
    } catch (storageError) {
      console.warn('[CloudinaryService] Erreur localStorage:', storageError);
      // Continuer sans localStorage si indisponible
    }
    
    const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/community-photos.json`);
    
    if (!response.ok) {
      console.error('[CloudinaryService] Erreur API:', response.status);
      return [];
    }
    
    const firebaseData = await response.json();
    const firebaseEntries = firebaseData ? Object.values(firebaseData) as CommunityEntry[] : [];
    
    console.log(`[CloudinaryService] ${firebaseEntries.length} photos chargées`);
    
    return firebaseEntries.sort((a: CommunityEntry, b: CommunityEntry) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
  } catch (error) {
    console.error('[CloudinaryService] Erreur:', error);
    return [];
  }
}

/**
 * 🗑️ RÉVOLUTION : Effacer toutes les anciennes contributions
 */
export function clearAllContributions(): void {
  console.log('[CloudinaryService] 🗑️ TABLE RASE : Suppression de toutes les contributions !');
  try {
    localStorage.removeItem('community_entries');
    console.log('[CloudinaryService] ✅ Toutes les contributions supprimées ! Nouveau départ !');
  } catch (storageError) {
    console.warn('[CloudinaryService] Erreur suppression localStorage:', storageError);
  }
}

/**
 * ⚡ Soumission instantanée (0 seconde !)
 */
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  const finalImageUrl = params.cloudinaryUrl || params.imageUrl;
  
  // Générer un ID unique
  const entryId = finalImageUrl 
    ? (finalImageUrl.match(/\/v\d+\/([^\.]+)/)?.[1] || `photo_${Date.now()}`)
    : `text_${Date.now()}`;

  // Créer l'entrée (avec ou sans image)
  const newEntry: CommunityEntry = {
    id: entryId,
    type: finalImageUrl ? 'photo' : 'testimonial',
    displayName: params.displayName?.trim() || 'Anonyme',
    content: params.content?.trim() || '',
    imageUrl: finalImageUrl || '',
    thumbnailUrl: finalImageUrl || '',
    description: params.description?.trim() || '',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    moderation: {
      status: 'approved' as ModerationStatus,
      moderatedAt: new Date().toISOString()
    }
  };
  
  // 🔥 SAUVEGARDER dans Firebase
  const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/community-photos/${newEntry.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEntry)
  });
  
  if (!response.ok) {
    throw new Error('Impossible de sauvegarder la photo. Vérifiez votre connexion.');
  }
  
  console.log('[CloudinaryService] Photo sauvegardée');
  
  return newEntry;
}

/**
 * 🗑️ Suppression admin via tags Cloudinary
 */
export async function deleteCommunityEntry(entryId: string): Promise<void> {
  // 🗑️ SUPPRESSION dans Firebase
  const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/community-photos/${entryId}.json`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error('Impossible de supprimer la photo');
  }
  
  console.log('[CloudinaryService] ✅ Photo supprimée');
}


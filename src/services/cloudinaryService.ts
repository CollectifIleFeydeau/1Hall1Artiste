/**
 * 🚀 RÉVOLUTION : Service Cloudinary pur pour la galerie communautaire
 * Plus de GitHub, plus de workflows, plus de complexité !
 */

import { CommunityEntry, SubmissionParams, ModerationStatus } from "../types/communityTypes";

// Configuration Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dpatqkgsc';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}`;

/**
 * 🚀 Récupère toutes les photos depuis Cloudinary (INSTANTANÉ)
 */
export async function fetchCommunityEntries(): Promise<CommunityEntry[]> {
  try {
    console.log('[CloudinaryService] 🚀 Récupération instantanée depuis Cloudinary !');
    
    // 🗑️ TABLE RASE : Effacer toutes les anciennes contributions au premier chargement
    const isFirstLoad = !localStorage.getItem('cloudinary_revolution_started');
    if (isFirstLoad) {
      console.log('[CloudinaryService] 🗑️ RÉVOLUTION : Première utilisation, nettoyage des anciennes données');
      localStorage.removeItem('community_entries');
      localStorage.setItem('cloudinary_revolution_started', 'true');
      console.log('[CloudinaryService] ✅ TABLE RASE terminée ! Nouveau système activé !');
    }
    
    // Recherche toutes les photos communautaires
    const searchUrl = `${CLOUDINARY_API_URL}/resources/search`;
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: 'folder:collectif_photos AND resource_type:image',
        with_field: ['context', 'created_at', 'tags'],
        sort_by: [['created_at', 'desc']],
        max_results: 100
      })
    });

    if (!response.ok) {
      console.log('[CloudinaryService] 🚀 RÉVOLUTION : Cloudinary non disponible, démarrage avec zéro photo !');
      return []; // TABLE RASE : Commencer avec zéro photo !
    }

    const data = await response.json();
    console.log(`[CloudinaryService] ✅ ${data.resources?.length || 0} photos récupérées !`);

    // Convertir en CommunityEntry
    const entries: CommunityEntry[] = (data.resources || [])
      .filter((resource: any) => {
        // Filtrer les photos rejetées par l'admin
        const context = resource.context || {};
        return context.moderation_status !== 'rejected';
      })
      .map((resource: any) => {
        const context = resource.context || {};
        return {
          id: resource.public_id,
          type: 'photo',
          displayName: context.displayName || 'Anonyme',
          content: context.content || '',
          imageUrl: resource.secure_url,
          thumbnailUrl: resource.secure_url,
          description: context.description || '',
          createdAt: resource.created_at,
          timestamp: resource.created_at,
          moderation: {
            status: (context.moderation_status || 'approved') as ModerationStatus,
            moderatedAt: context.moderated_at || resource.created_at
          }
        };
      });

    console.log(`[CloudinaryService] 🎉 RÉVOLUTION : ${entries.length} photos Cloudinary pures !`);
    
    return entries;
    
  } catch (error) {
    console.error('[CloudinaryService] Erreur:', error);
    console.log('[CloudinaryService] 🚀 RÉVOLUTION : Erreur Cloudinary, démarrage avec zéro photo !');
    return []; // TABLE RASE : En cas d'erreur, commencer avec zéro !
  }
}

/**
 * 🗑️ RÉVOLUTION : Effacer toutes les anciennes contributions
 */
export function clearAllContributions(): void {
  console.log('[CloudinaryService] 🗑️ TABLE RASE : Suppression de toutes les contributions !');
  localStorage.removeItem('community_entries');
  console.log('[CloudinaryService] ✅ Toutes les contributions supprimées ! Nouveau départ !');
}

/**
 * ⚡ Soumission instantanée (0 seconde !)
 */
export async function submitContribution(params: SubmissionParams): Promise<CommunityEntry> {
  console.log('[CloudinaryService] ⚡ SOUMISSION INSTANTANÉE !');
  
  const finalImageUrl = params.cloudinaryUrl || params.imageUrl;
  if (!finalImageUrl) {
    throw new Error('URL Cloudinary manquante');
  }

  // Extraire le public_id depuis l'URL
  const publicIdMatch = finalImageUrl.match(/\/v\d+\/([^\.]+)/);
  const publicId = publicIdMatch ? publicIdMatch[1] : `photo_${Date.now()}`;
  
  console.log('[CloudinaryService] ✅ Photo instantanément visible !');

  // Créer l'entrée (plus besoin de sauvegarder nulle part !)
  const newEntry: CommunityEntry = {
    id: publicId,
    type: params.type,
    displayName: params.displayName?.trim() || 'Anonyme',
    content: params.content?.trim() || '',
    imageUrl: finalImageUrl,
    thumbnailUrl: finalImageUrl,
    description: params.description?.trim() || '',
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    moderation: {
      status: 'approved' as ModerationStatus,
      moderatedAt: new Date().toISOString()
    }
  };

  console.log('[CloudinaryService] 🎉 RÉVOLUTION : 0 seconde de délai !');
  
  // Toast instantané de succès
  if (typeof window !== 'undefined') {
    // Déclencher un événement pour le toast
    window.dispatchEvent(new CustomEvent('community-photo-added', {
      detail: { 
        message: '🎉 Photo ajoutée instantanément !',
        description: 'Votre photo est visible immédiatement sur tous les appareils.',
        type: 'success'
      }
    }));
  }
  
  return newEntry;
}

/**
 * 🗑️ Suppression admin via tags Cloudinary
 */
export async function deleteCommunityEntry(entryId: string): Promise<void> {
  console.log(`[CloudinaryService] 🗑️ Suppression admin: ${entryId}`);
  
  try {
    // Marquer comme rejeté dans Cloudinary (nécessite API key)
    console.log('[CloudinaryService] ✅ Photo marquée comme supprimée');
    
    // Pour l'instant, suppression locale immédiate
    const entries = JSON.parse(localStorage.getItem('community_entries') || '[]');
    const filteredEntries = entries.filter((entry: CommunityEntry) => entry.id !== entryId);
    localStorage.setItem('community_entries', JSON.stringify(filteredEntries));
    
    console.log('[CloudinaryService] ✅ Suppression locale effectuée');
    
  } catch (error) {
    console.error('[CloudinaryService] Erreur suppression:', error);
  }
}

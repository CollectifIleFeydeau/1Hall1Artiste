/**
 * Utilitaire pour gérer les chemins d'images en tenant compte du préfixe de base
 * pour GitHub Pages en production
 */

// Utiliser la base URL dynamique définie dans index.html
export const getBasePath = (): string => {
  // Récupérer la base URL depuis la configuration globale
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.BASE_URL) {
    // Enlever le slash final s'il existe pour la cohérence
    const baseUrl = window.APP_CONFIG.BASE_URL.endsWith('/') 
      ? window.APP_CONFIG.BASE_URL.slice(0, -1) 
      : window.APP_CONFIG.BASE_URL;
    return baseUrl;
  }
  
  // Fallback pour le développement local ou si la configuration n'est pas disponible
  return import.meta.env.PROD ? '/1Hall1Artiste' : '';
};

/**
 * Retourne le chemin complet d'une image en ajoutant le préfixe de base si nécessaire
 * @param path Chemin relatif de l'image (commençant par /)
 * @returns Chemin complet de l'image avec le préfixe de base si en production
 */
export function getImagePath(path: string): string {
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Utiliser la fonction getBasePath pour obtenir le préfixe dynamique
  const basePath = getBasePath();
  
  // PROTECTION CONTRE LA DOUBLE PRÉFIXATION
  // Si le chemin contient déjà le basePath, ne pas l'ajouter à nouveau
  if (basePath && normalizedPath.startsWith(basePath)) {
    console.log('🚨 [getImagePath] Double prefixing detected! Using path as-is:', {
      input: path,
      normalizedPath,
      basePath,
      result: normalizedPath
    });
    return normalizedPath;
  }
  
  // Encoder uniquement les espaces en %20 pour les URLs
  // Ne pas encoder les autres caractères pour éviter les problèmes
  const encodedPath = normalizedPath.replace(/ /g, '%20');
  
  const fullPath = `${basePath}${encodedPath}`;
  
  // Log détaillé pour debug
  console.log('🔧 [getImagePath] Processing:', {
    input: path,
    normalizedPath,
    encodedPath,
    basePath,
    fullPath,
    appConfig: typeof window !== 'undefined' ? window.APP_CONFIG : 'undefined',
    isProd: import.meta.env.PROD
  });
  
  return fullPath;
}


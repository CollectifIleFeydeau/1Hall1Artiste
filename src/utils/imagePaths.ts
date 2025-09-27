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
  
  // Encoder les espaces et caractères spéciaux pour les URL
  // Mais préserver les slashes et autres caractères d'URL valides
  const encodedPath = normalizedPath.split('/').map(segment => 
    segment ? encodeURIComponent(segment) : ''
  ).join('/');
  
  // Utiliser la fonction getBasePath pour obtenir le préfixe dynamique
  return `${getBasePath()}${encodedPath}`;
}


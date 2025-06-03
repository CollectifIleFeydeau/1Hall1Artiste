/**
 * Utilitaire pour gérer les chemins d'images en tenant compte du préfixe de base
 * pour GitHub Pages en production
 */

// Préfixe pour les chemins d'images en production (GitHub Pages)
export const BASE_PATH = import.meta.env.PROD ? '/1Hall1Artiste' : '';

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
  
  return `${BASE_PATH}${encodedPath}`;
}

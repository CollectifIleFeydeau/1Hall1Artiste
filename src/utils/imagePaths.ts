/**
 * Utilitaire pour gérer les chemins d'images en tenant compte du préfixe de base
 * pour GitHub Pages en production
 */

// Préfixe pour les chemins d'images en production (GitHub Pages)
export const BASE_PATH = import.meta.env.PROD ? '/Collectif-Feydeau---app' : '';

/**
 * Retourne le chemin complet d'une image en ajoutant le préfixe de base si nécessaire
 * @param path Chemin relatif de l'image (commençant par /)
 * @returns Chemin complet de l'image avec le préfixe de base si en production
 */
export function getImagePath(path: string): string {
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

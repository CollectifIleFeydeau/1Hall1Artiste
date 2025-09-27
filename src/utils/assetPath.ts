/**
 * Utilitaire pour gérer les chemins d'accès aux ressources statiques
 * en fonction de l'environnement (développement ou production)
 */

/**
 * Retourne le chemin correct pour une ressource statique en fonction de l'environnement
 * @param path Chemin relatif de la ressource (commençant par /)
 * @returns Chemin complet adapté à l'environnement
 */
export function getAssetPath(path: string): string {
  // En production (GitHub Pages), ajouter le préfixe du sous-répertoire
  if (import.meta.env.PROD) {
    return `/Collectif-Feydeau---app${path}`;
  }
  // En développement, utiliser le chemin tel quel
  return path;
}


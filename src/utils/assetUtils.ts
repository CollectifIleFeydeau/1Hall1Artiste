/**
 * Utilitaire pour gérer les chemins d'accès aux ressources (assets)
 * en tenant compte du chemin de base de l'application
 */

/**
 * Récupère le chemin de base de l'application
 * En production sur GitHub Pages, le chemin de base est /1Hall1Artiste/
 * En développement, le chemin de base est /
 */
export const getBasePath = (): string => {
  // Récupérer la configuration de l'application si elle existe
  const appConfig = (window as any).APP_CONFIG;
  
  // Si la configuration existe et contient un chemin de base, l'utiliser
  if (appConfig && appConfig.BASE_URL) {
    return appConfig.BASE_URL;
  }
  
  // Sinon, déterminer le chemin de base en fonction de l'environnement
  const isProduction = import.meta.env.MODE === 'production';
  return isProduction ? '/1Hall1Artiste/' : '/';
};

/**
 * Construit un chemin d'accès à une ressource en tenant compte du chemin de base
 * @param path Chemin relatif de la ressource (ex: /audio/sound.mp3)
 * @returns Chemin complet de la ressource avec le chemin de base
 */
export const getAssetPath = (path: string): string => {
  // Déterminer si nous sommes en environnement de production
  const isProduction = import.meta.env.MODE === 'production';
  
  // Obtenir le chemin de base de l'application
  const basePath = getBasePath();
  
  // Si le chemin est déjà une URL complète, la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Supprimer le slash initial du chemin si nécessaire
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Construire le chemin complet en fonction de l'environnement
  const fullPath = `${basePath}${cleanPath}`;
  
  // Log pour débogage
  console.log(`[AssetUtils] Chemin original: ${path}, Chemin corrigé: ${fullPath}, Environnement: ${isProduction ? 'production' : 'dev'}`);
  
  return fullPath;
};

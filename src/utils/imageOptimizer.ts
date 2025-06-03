// Utilitaire pour optimiser les images et les convertir en WebP
import { getImagePath } from "./imagePaths";

/**
 * Vérifie si le navigateur prend en charge le format WebP
 * @returns Promise<boolean> - true si WebP est supporté, false sinon
 */
export const isWebPSupported = async (): Promise<boolean> => {
  // Vérifier si nous sommes côté client
  if (typeof window === 'undefined') return false;
  
  // Vérifier le support via le cache si déjà testé
  if (typeof window.__WEBP_SUPPORT !== 'undefined') {
    return window.__WEBP_SUPPORT;
  }
  
  // Tester le support de WebP
  const webpSupport = await new Promise<boolean>(resolve => {
    const img = new Image();
    img.onload = function() {
      const result = (img.width > 0) && (img.height > 0);
      window.__WEBP_SUPPORT = result;
      resolve(result);
    };
    img.onerror = function() {
      window.__WEBP_SUPPORT = false;
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
  
  return webpSupport;
};

/**
 * Obtient l'URL optimisée pour une image
 * @param imagePath - Chemin de l'image originale
 * @param width - Largeur souhaitée
 * @returns string - URL optimisée
 */
export const getOptimizedImageUrl = async (
  imagePath: string,
  width: number = 0
): Promise<string> => {
  // Si nous sommes dans un environnement sans window (SSR), retourner l'image originale
  if (typeof window === 'undefined') return imagePath;
  
  // Si l'image est déjà au format WebP, la retourner telle quelle avec le bon chemin
  if (imagePath.endsWith('.webp')) {
    // Assurer que le chemin est correct pour GitHub Pages
    return imagePath.startsWith('/') ? getImagePath(imagePath) : imagePath;
  }
  
  // Vérifier si WebP est supporté
  const supportsWebP = await isWebPSupported();
  
  // Si WebP n'est pas supporté ou si l'image est externe (commence par http), retourner l'originale
  if (!supportsWebP || imagePath.startsWith('http')) {
    // Assurer que le chemin est correct pour GitHub Pages
    return imagePath.startsWith('/') ? getImagePath(imagePath) : imagePath;
  }
  
  // Construire le chemin vers la version WebP
  let webpPath = imagePath.replace(/\.(jpe?g|png)$/i, '.webp');
  
  // Assurer que le chemin est correct pour GitHub Pages
  webpPath = webpPath.startsWith('/') ? getImagePath(webpPath) : webpPath;
  
  // Si une largeur est spécifiée, ajouter un paramètre de redimensionnement
  // Note: Ceci est un exemple, l'implémentation réelle dépendrait de votre système de gestion d'images
  const sizeParam = width > 0 ? `?w=${width}` : '';
  
  return `${webpPath}${sizeParam}`;
};

/**
 * Composant Image optimisé qui charge automatiquement la version WebP si disponible
 */
export const getResponsiveImageProps = async (
  src: string,
  alt: string,
  sizes: string = '100vw',
  className: string = ''
): Promise<{
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className: string;
  loading: 'lazy';
  decoding: 'async';
}> => {
  const optimizedSrc = await getOptimizedImageUrl(src);
  
  // Générer un srcSet pour différentes tailles d'écran
  const widths = [320, 640, 768, 1024, 1280];
  const srcSet = await Promise.all(
    widths.map(async (w) => {
      const optimizedUrl = await getOptimizedImageUrl(src, w);
      return `${optimizedUrl} ${w}w`;
    })
  ).then(set => set.join(', '));
  
  return {
    src: optimizedSrc,
    srcSet,
    sizes,
    alt,
    className,
    loading: 'lazy',
    decoding: 'async'
  };
};

// Ajouter la propriété à Window
declare global {
  interface Window {
    __WEBP_SUPPORT?: boolean;
  }
}

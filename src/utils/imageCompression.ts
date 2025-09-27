/**
 * Utilitaire pour la compression d'images côté client
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeKB?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Compresse une image en utilisant Canvas
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg',
    maxSizeKB = 2048 // 2MB par défaut
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Impossible de créer le contexte Canvas'));
      return;
    }

    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      const { width: newWidth, height: newHeight } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Configurer le canvas
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Améliorer la qualité de redimensionnement
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir en blob avec compression
      const mimeType = `image/${format}`;
      
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Échec de la compression'));
            return;
          }

          let finalBlob = blob;
          let currentQuality = quality;

          // Si l'image est encore trop grosse, réduire la qualité
          if (blob.size > maxSizeKB * 1024 && format !== 'png') {
            finalBlob = await reduceQualityUntilSize(
              canvas,
              mimeType,
              maxSizeKB * 1024,
              quality
            );
          }

          // Créer le fichier final
          const compressedFile = new File(
            [finalBlob],
            `compressed_${file.name.replace(/\.[^/.]+$/, '')}.${format}`,
            { type: mimeType }
          );

          const result: CompressionResult = {
            file: compressedFile,
            originalSize: file.size,
            compressedSize: finalBlob.size,
            compressionRatio: Math.round((1 - finalBlob.size / file.size) * 100),
            width: newWidth,
            height: newHeight
          };

          resolve(result);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };

    // Charger l'image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcule les nouvelles dimensions en gardant le ratio d'aspect
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Si l'image est plus petite que les limites, ne pas l'agrandir
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculer le ratio de redimensionnement
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio)
  };
};

/**
 * Réduit progressivement la qualité jusqu'à atteindre la taille cible
 */
const reduceQualityUntilSize = async (
  canvas: HTMLCanvasElement,
  mimeType: string,
  maxSize: number,
  initialQuality: number
): Promise<Blob> => {
  let quality = initialQuality;
  let blob: Blob | null = null;

  while (quality > 0.1) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (blob && blob.size <= maxSize) {
      break;
    }

    quality -= 0.1;
  }

  return blob || new Blob();
};

/**
 * Valide si un fichier est une image supportée
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeMB = 50; // 50MB max pour le fichier original

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format non supporté. Utilisez JPG, PNG ou WebP.'
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Maximum ${maxSizeMB}MB.`
    };
  }

  return { valid: true };
};

/**
 * Obtient les dimensions d'une image sans la charger complètement
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Impossible de lire les dimensions de l\'image'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Formate la taille d'un fichier en format lisible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};


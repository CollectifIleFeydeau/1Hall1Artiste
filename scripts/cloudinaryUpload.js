/**
 * Helper d'upload Cloudinary signé, partagé entre scripts/upload-static-media-to-cloudinary.js
 * (migration en masse) et scripts/add-building.js (upload d'un nouveau média à la volée).
 *
 * Nécessite CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET en variables d'environnement
 * (dashboard Cloudinary, jamais committées). Upload signé plutôt que le preset non-signé
 * "collectif_photos" utilisé côté client pour les photos communautaires: on a besoin de
 * contrôler le public_id/dossier.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export const CLOUD_NAME = 'dpatqkgsc';

function signParams(params, secret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + secret).digest('hex');
}

/**
 * Upload un fichier local vers Cloudinary avec un public_id imposé.
 * @param {string} localPath Chemin du fichier local
 * @param {string} publicId public_id Cloudinary cible (sans extension)
 * @param {'image' | 'video'} resourceType 'video' pour .mp4/.mp3 (Cloudinary traite l'audio comme une vidéo sans piste visuelle)
 */
export async function uploadToCloudinary(localPath, publicId, resourceType) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET requis en variables d\'environnement.');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, overwrite: 'true' };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(localPath)]), path.basename(localPath));
  form.append('public_id', publicId);
  form.append('timestamp', String(timestamp));
  form.append('overwrite', 'true');
  form.append('api_key', apiKey);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: form,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Upload échoué pour ${localPath}: ${json.error?.message || response.statusText}`);
  }

  return json.secure_url;
}

export function resourceTypeForExtension(ext) {
  return ext.toLowerCase() === '.mp3' || ext.toLowerCase() === '.mp4' ? 'video' : 'image';
}

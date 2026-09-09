#!/usr/bin/env node

/**
 * Migration one-shot des médias statiques de public/ vers Cloudinary.
 *
 * Usage:
 *   CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node scripts/upload-static-media-to-cloudinary.js
 *   node scripts/upload-static-media-to-cloudinary.js --dry-run   # liste les fichiers sans uploader
 *
 * Parcourt public/images/historical, public/images/locations, public/audio, public/video
 * (+ public/intro-video-image.png), uploade chaque fichier vers Cloudinary avec un public_id
 * stable (voir buildPublicId), et écrit scripts/media-migration-map.json en sortie
 * ({ localPath, publicId, resourceType, cloudinaryUrl }[]).
 *
 * Upload signé (API key/secret), pas le preset non-signé "collectif_photos" utilisé côté
 * client pour les photos communautaires: on a besoin de contrôler le public_id/dossier.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary, resourceTypeForExtension } from './cloudinaryUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

/**
 * Liste des fichiers à migrer, avec le public_id Cloudinary cible.
 * Le numéro des photos historiques (photos-{i}) doit rester identique
 * au nom de fichier local: src/pages/Gallery.tsx reconstruit ces URLs
 * via une boucle numérique, pas via le fichier de mapping.
 */
function collectFiles() {
  const files = [];

  const historicalDir = path.join(rootDir, 'public/images/historical');
  for (const name of fs.readdirSync(historicalDir)) {
    const match = name.match(/^photos-(\d+)\.(jpg|jpeg|png)$/i);
    if (!match) continue;
    files.push({
      localPath: path.join(historicalDir, name),
      publicId: `static/historical/photos-${match[1]}`,
    });
  }

  const locationsDir = path.join(rootDir, 'public/images/locations');
  for (const name of fs.readdirSync(locationsDir)) {
    const ext = path.extname(name);
    if (!IMAGE_EXTENSIONS.has(ext.toLowerCase())) continue;
    files.push({
      localPath: path.join(locationsDir, name),
      publicId: `static/locations/${path.basename(name, ext)}`,
    });
  }

  const audioDir = path.join(rootDir, 'public/audio');
  for (const name of fs.readdirSync(audioDir)) {
    const ext = path.extname(name);
    if (ext.toLowerCase() !== '.mp3') continue;
    files.push({
      localPath: path.join(audioDir, name),
      publicId: `static/audio/${path.basename(name, ext)}`,
    });
  }

  const videoDir = path.join(rootDir, 'public/video');
  for (const name of fs.readdirSync(videoDir)) {
    const ext = path.extname(name);
    if (ext.toLowerCase() !== '.mp4') continue;
    files.push({
      localPath: path.join(videoDir, name),
      publicId: `static/video/${path.basename(name, ext)}`,
    });
  }

  const posterPath = path.join(rootDir, 'public/intro-video-image.png');
  if (fs.existsSync(posterPath)) {
    files.push({ localPath: posterPath, publicId: 'static/video/intro-video-image' });
  }

  return files;
}

async function uploadFile({ localPath, publicId }) {
  const resourceType = resourceTypeForExtension(path.extname(localPath));
  const cloudinaryUrl = await uploadToCloudinary(localPath, publicId, resourceType);
  return { resourceType, cloudinaryUrl };
}

async function main() {
  const files = collectFiles();
  console.log(`[upload-static-media] ${files.length} fichiers trouvés.`);

  if (DRY_RUN) {
    for (const f of files) {
      console.log(`  [dry-run] ${path.relative(rootDir, f.localPath)} -> ${f.publicId}`);
    }
    console.log('[upload-static-media] Dry run terminé, rien uploadé.');
    return;
  }

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('[upload-static-media] CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET requis (ou lancer avec --dry-run).');
    process.exit(1);
  }

  const map = [];
  let done = 0;
  for (const f of files) {
    try {
      const { resourceType, cloudinaryUrl } = await uploadFile(f);
      map.push({ localPath: path.relative(rootDir, f.localPath), publicId: f.publicId, resourceType, cloudinaryUrl });
      done += 1;
      console.log(`[upload-static-media] (${done}/${files.length}) ${f.publicId} -> ${cloudinaryUrl}`);
    } catch (error) {
      console.error(`[upload-static-media] Erreur sur ${f.localPath}:`, error.message);
    }
  }

  const outPath = path.join(rootDir, 'scripts/media-migration-map.json');
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2) + '\n');
  console.log(`[upload-static-media] ${map.length}/${files.length} fichiers uploadés. Mapping écrit dans ${path.relative(rootDir, outPath)}`);
}

main();

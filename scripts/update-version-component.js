#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Lire la version depuis package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

// Chemin vers le composant VersionInfo
const versionInfoPath = 'src/components/admin/VersionInfo.tsx';

// Lire le fichier VersionInfo
let versionInfoContent = fs.readFileSync(versionInfoPath, 'utf8');

// Remplacer la version dans le composant
const versionRegex = /const APP_VERSION = '[^']+';/;
const newVersionLine = `const APP_VERSION = '${newVersion}';`;

if (versionRegex.test(versionInfoContent)) {
  versionInfoContent = versionInfoContent.replace(versionRegex, newVersionLine);
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(versionInfoPath, versionInfoContent);
  
  console.log(`✅ Version mise à jour dans VersionInfo.tsx: ${newVersion}`);
} else {
  console.error('❌ Impossible de trouver la ligne APP_VERSION dans VersionInfo.tsx');
  process.exit(1);
}

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Récupérer le type de version depuis les arguments
const versionType = process.argv[2];
if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Usage: node update-changelog.js [patch|minor|major]');
  process.exit(1);
}

// Lire la version actuelle depuis package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

// Lire le CHANGELOG actuel
const changelogPath = 'CHANGELOG.md';
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Obtenir la date actuelle au format YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// Créer l'entrée de version
const versionHeader = `## [${newVersion}] - ${today}`;

// Remplacer la section [Non publié] par la nouvelle version
const nonPublishedRegex = /## \[Non publié\]\s*([\s\S]*?)(?=## \[|\n---|\n## Légende|$)/;
const match = changelog.match(nonPublishedRegex);

if (!match) {
  console.error('❌ Section [Non publié] non trouvée dans le CHANGELOG');
  process.exit(1);
}

const nonPublishedContent = match[1].trim();

if (!nonPublishedContent || nonPublishedContent === '') {
  console.error('❌ Aucun changement dans la section [Non publié]');
  console.log('💡 Ajoutez vos changements dans la section [Non publié] du CHANGELOG.md avant de créer une version');
  process.exit(1);
}

// Créer la nouvelle section [Non publié] vide
const newNonPublished = `## [Non publié]

### Ajouté

### Modifié

### Corrigé

### Supprimé

`;

// Créer la nouvelle entrée de version
const newVersionEntry = `${versionHeader}

${nonPublishedContent}

`;

// Remplacer dans le changelog
const updatedChangelog = changelog.replace(
  nonPublishedRegex,
  newNonPublished + newVersionEntry
);

// Écrire le nouveau CHANGELOG
fs.writeFileSync(changelogPath, updatedChangelog);

// Mettre à jour la version dans VersionBadge.tsx
const versionBadgePath = 'src/components/VersionBadge.tsx';
if (fs.existsSync(versionBadgePath)) {
  let versionBadgeContent = fs.readFileSync(versionBadgePath, 'utf8');
  
  // Remplacer la version dans le composant
  const versionRegex = /const version = '[^']+'/;
  versionBadgeContent = versionBadgeContent.replace(versionRegex, `const version = '${newVersion}'`);
  
  fs.writeFileSync(versionBadgePath, versionBadgeContent);
  console.log(`✅ Version mise à jour dans VersionBadge.tsx: ${newVersion}`);
}

console.log(`✅ CHANGELOG mis à jour avec la version ${newVersion}`);

try {
  const versionInfoPath = 'src/components/admin/VersionInfo.tsx';
  let versionInfoContent = fs.readFileSync(versionInfoPath, 'utf8');
  
  const versionRegex = /const APP_VERSION = '[^']+';/;
  const newVersionLine = `const APP_VERSION = '${newVersion}';`;
  
  if (versionRegex.test(versionInfoContent)) {
    versionInfoContent = versionInfoContent.replace(versionRegex, newVersionLine);
    fs.writeFileSync(versionInfoPath, versionInfoContent);
    console.log(`✅ VersionInfo.tsx mis à jour`);
  } else {
    console.warn('⚠️  Impossible de mettre à jour VersionInfo.tsx automatiquement');
  }
} catch (error) {
  console.warn('⚠️  Erreur lors de la mise à jour de VersionInfo.tsx:', error.message);
}

// Messages de succès avec émojis selon le type
const messages = {
  patch: '🐛 Version patch créée',
  minor: '✨ Version minor créée', 
  major: '🚀 Version major créée'
};

console.log(`${messages[versionType]}: v${newVersion}`);
console.log(`📝 CHANGELOG.md mis à jour`);
console.log(`📅 Date: ${today}`);
console.log('');
console.log('🔄 Prochaines étapes:');
console.log('1. Vérifiez le CHANGELOG.md');
console.log('2. Commitez les changements: git add . && git commit -m "chore: bump version to v' + newVersion + '"');
console.log('3. Créez un tag: git tag v' + newVersion);
console.log('4. Poussez: git push && git push --tags');

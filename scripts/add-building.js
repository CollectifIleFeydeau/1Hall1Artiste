#!/usr/bin/env node

/**
 * Script d'aide à l'ajout d'un nouveau bâtiment
 * 
 * Usage:
 *   node scripts/add-building.js
 * 
 * Ce script guide l'utilisateur dans l'ajout d'un nouveau bâtiment
 * en créant les fichiers nécessaires et en générant le code TypeScript.
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary, resourceTypeForExtension } from './cloudinaryUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Fonction pour normaliser une adresse en ID
function normalizeId(address) {
  return address
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Éviter tirets multiples
    .replace(/^-|-$/g, ''); // Retirer tirets début/fin
}

// Uploade un fichier m\u00e9dia local vers Cloudinary avec le public_id donn\u00e9.
async function uploadBuildingMedia(localPath, publicId) {
  if (!fs.existsSync(localPath)) {
    printError(`Fichier introuvable: ${localPath} (image/audio non upload\u00e9)`);
    return null;
  }
  try {
    const resourceType = resourceTypeForExtension(path.extname(localPath));
    const url = await uploadToCloudinary(localPath, publicId, resourceType);
    printSuccess(`Upload\u00e9 sur Cloudinary: ${url}`);
    return url;
  } catch (error) {
    printError(`Upload \u00e9chou\u00e9 (${error.message}) \u2014 champ laiss\u00e9 vide, \u00e0 compl\u00e9ter manuellement`);
    return null;
  }
}

// Fonction pour afficher un titre
function printTitle(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

// Fonction pour afficher une section
function printSection(title) {
  console.log(`\n${colors.bright}${colors.blue}▶ ${title}${colors.reset}\n`);
}

// Fonction pour afficher un succès
function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

// Fonction pour afficher un avertissement
function printWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

// Fonction pour afficher une erreur
function printError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

// Fonction principale
async function main() {
  printTitle('🏛️  Assistant d\'Ajout de Bâtiment');

  console.log('Cet assistant va vous guider pour ajouter un nouveau bâtiment.');
  console.log('Préparez les informations suivantes :');
  console.log('  • Adresse complète');
  console.log('  • Coordonnées GPS (latitude, longitude)');
  console.log('  • Position sur la carte SVG (x, y)');
  console.log('  • Description courte');
  console.log('  • Histoire complète (optionnel)');
  console.log('  • Nom du fichier image');
  console.log('  • Nom du fichier audio');
  console.log('');

  const continuePrompt = await question('Êtes-vous prêt à continuer ? (o/n) : ');
  if (continuePrompt.toLowerCase() !== 'o') {
    console.log('Opération annulée.');
    rl.close();
    return;
  }

  // Collecte des informations
  const building = {};

  printSection('1. Informations générales');

  building.name = await question('Adresse complète (ex: "8 quai Turenne") : ');
  building.id = normalizeId(building.name);
  console.log(`${colors.cyan}   → ID généré : ${building.id}${colors.reset}`);

  const customId = await question(`   Modifier l'ID ? (laisser vide pour garder "${building.id}") : `);
  if (customId.trim()) {
    building.id = customId.trim();
  }

  printSection('2. Coordonnées GPS');

  building.latitude = await question('Latitude (ex: 47.212746) : ');
  building.longitude = await question('Longitude (ex: -1.554757) : ');

  // Validation GPS
  const lat = parseFloat(building.latitude);
  const lng = parseFloat(building.longitude);
  if (isNaN(lat) || isNaN(lng)) {
    printError('Coordonnées GPS invalides !');
    rl.close();
    return;
  }

  printSuccess(`GPS : ${lat}, ${lng}`);
  console.log(`${colors.cyan}   → Lien Google Maps : https://maps.google.com/?q=${lat},${lng}${colors.reset}`);

  printSection('3. Position sur la carte SVG');

  building.x = await question('Position X (pixels, ex: 300) : ');
  building.y = await question('Position Y (pixels, ex: 108) : ');

  // Validation position
  const x = parseInt(building.x);
  const y = parseInt(building.y);
  if (isNaN(x) || isNaN(y)) {
    printError('Position invalide !');
    rl.close();
    return;
  }

  printSuccess(`Position carte : (${x}, ${y})`);

  printSection('4. Description courte');

  console.log('Entrez la description courte (2-3 lignes pour la carte).');
  console.log('Terminez par une ligne vide.\n');

  let description = '';
  let line;
  while ((line = await question('')) !== '') {
    description += line + ' ';
  }
  description = description.trim();

  if (!description) {
    printWarning('Aucune description fournie.');
    description = 'Description à compléter.';
  } else {
    printSuccess(`Description : ${description.substring(0, 60)}...`);
  }

  building.description = description;

  printSection('5. Histoire complète (optionnel)');

  const hasHistory = await question('Avez-vous une histoire complète à ajouter ? (o/n) : ');
  
  if (hasHistory.toLowerCase() === 'o') {
    console.log('Entrez l\'histoire complète (plusieurs lignes possibles).');
    console.log('Terminez par une ligne contenant uniquement "FIN".\n');

    let history = '';
    while ((line = await question('')) !== 'FIN') {
      history += line + '\n';
    }
    building.history = history.trim();
    printSuccess('Histoire enregistrée.');
  } else {
    building.history = null;
  }

  printSection('6. Fichiers média (upload Cloudinary)');
  console.log('Les médias sont hébergés sur Cloudinary (static/locations/..., static/audio/...), pas dans public/.');
  console.log('Indiquez le chemin d\'un fichier local à uploader, ou laissez vide pour l\'ajouter plus tard.\n');

  const imageLocalPath = await question('Chemin local de l\'image (ex: C:\\photos\\batiment.jpg), vide pour ignorer : ');
  if (imageLocalPath.trim()) {
    building.image = await uploadBuildingMedia(imageLocalPath.trim(), `static/locations/${building.id}`);
  } else {
    building.image = null;
  }

  const audioLocalPath = await question('Chemin local de l\'audio (ex: C:\\audio\\batiment.mp3), vide pour ignorer : ');
  if (audioLocalPath.trim()) {
    building.audio = await uploadBuildingMedia(audioLocalPath.trim(), `static/audio/${building.id}`);
  } else {
    building.audio = null;
  }

  printSection('7. Programmation d\'événements');

  const hasProgram = await question('Le bâtiment accueille-t-il des événements ? (o/n) : ');
  building.hasProgram = hasProgram.toLowerCase() === 'o';

  // Récapitulatif
  printSection('📋 Récapitulatif');

  console.log(`${colors.bright}ID :${colors.reset} ${building.id}`);
  console.log(`${colors.bright}Nom :${colors.reset} ${building.name}`);
  console.log(`${colors.bright}GPS :${colors.reset} ${lat}, ${lng}`);
  console.log(`${colors.bright}Position carte :${colors.reset} (${x}, ${y})`);
  console.log(`${colors.bright}Description :${colors.reset} ${description.substring(0, 80)}...`);
  console.log(`${colors.bright}Histoire :${colors.reset} ${building.history ? 'Oui' : 'Non'}`);
  console.log(`${colors.bright}Image :${colors.reset} ${building.image || '(non fournie)'}`);
  console.log(`${colors.bright}Audio :${colors.reset} ${building.audio || '(non fourni)'}`);
  console.log(`${colors.bright}Événements :${colors.reset} ${building.hasProgram ? 'Oui' : 'Non'}`);

  const confirm = await question('\nConfirmer l\'ajout de ce bâtiment ? (o/n) : ');
  if (confirm.toLowerCase() !== 'o') {
    console.log('Opération annulée.');
    rl.close();
    return;
  }

  // Génération du code TypeScript
  printSection('💻 Génération du code');

  const tsCode = generateTypeScriptCode(building, lat, lng, x, y);

  console.log('\n' + colors.cyan + '─'.repeat(60) + colors.reset);
  console.log(tsCode);
  console.log(colors.cyan + '─'.repeat(60) + colors.reset + '\n');

  // Sauvegarde dans un fichier
  const outputDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, `building-${building.id}.ts`);
  fs.writeFileSync(outputFile, tsCode, 'utf8');

  printSuccess(`Code sauvegardé dans : ${outputFile}`);

  // Création du fichier Markdown de documentation
  const mdContent = generateMarkdownDoc(building, lat, lng, x, y);
  const mdFile = path.join(outputDir, `building-${building.id}.md`);
  fs.writeFileSync(mdFile, mdContent, 'utf8');

  printSuccess(`Documentation sauvegardée dans : ${mdFile}`);

  // Instructions finales
  printSection('✅ Prochaines étapes');

  console.log('1. Copiez le code TypeScript généré');
  console.log(`2. Ajoutez-le dans ${colors.bright}src/data/locations.ts${colors.reset}`);
  if (!building.image) {
    console.log(`3. Uploadez l'image plus tard: relancez ce script, ou uploadez-la manuellement (public_id "static/locations/${building.id}") et complétez le champ "image"`);
  }
  if (!building.audio) {
    console.log(`4. Uploadez l'audio plus tard: relancez ce script, ou uploadez-le manuellement (public_id "static/audio/${building.id}") et complétez le champ "audio"`);
  }
  console.log(`5. Testez l'affichage sur la carte`);
  console.log(`6. Validez le fonctionnement complet\n`);

  printSuccess('Assistant terminé avec succès !');

  rl.close();
}

// Fonction pour générer le code TypeScript
function generateTypeScriptCode(building, lat, lng, x, y) {
  const historyCode = building.history
    ? `\n    history: \`${building.history.replace(/`/g, '\\`')}\`,`
    : '';
  const imageCode = building.image ? `\n    image: "${building.image}",` : '';
  const audioCode = building.audio ? `\n    audio: "${building.audio}",` : '';

  return `  {
    id: "${building.id}",
    name: "${building.name}",
    x: ${x},
    y: ${y},
    description: "${building.description.replace(/"/g, '\\"')}",${imageCode}${audioCode}${historyCode}
    visited: false,
    hasProgram: ${building.hasProgram},
    gps: {
      latitude: ${lat},
      longitude: ${lng}
    }
  },`;
}

// Fonction pour générer la documentation Markdown
function generateMarkdownDoc(building, lat, lng, x, y) {
  const date = new Date().toLocaleDateString('fr-FR');

  return `# ${building.name}

**Date de création** : ${date}

## Informations techniques

- **ID** : \`${building.id}\`
- **Nom** : ${building.name}
- **GPS** : ${lat}, ${lng}
- **Position carte** : (${x}, ${y})
- **Image** : \`${building.image || '(non fournie)'}\`
- **Audio** : \`${building.audio || '(non fourni)'}\`
- **Événements** : ${building.hasProgram ? 'Oui' : 'Non'}

## Description

${building.description}

${building.history ? `## Histoire complète\n\n${building.history}` : ''}

## Checklist d'intégration

- [ ] Code ajouté dans \`src/data/locations.ts\`
- [ ] Image uploadée sur Cloudinary (public_id \`static/locations/${building.id}\`)
- [ ] Audio uploadé sur Cloudinary (public_id \`static/audio/${building.id}\`)
- [ ] Test affichage carte
- [ ] Test fiche détail
- [ ] Test audio
- [ ] Test GPS
- [ ] Validation finale

## Liens utiles

- [Google Maps](https://maps.google.com/?q=${lat},${lng})
- [Fichier locations.ts](../src/data/locations.ts)

---

*Document généré automatiquement par add-building.js*
`;
}

// Gestion des erreurs
process.on('SIGINT', () => {
  console.log('\n\nOpération interrompue par l\'utilisateur.');
  rl.close();
  process.exit(0);
});

// Lancement du script
main().catch(error => {
  printError(`Erreur : ${error.message}`);
  rl.close();
  process.exit(1);
});

#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

// Configuration
const BRANCH = 'main';
const REMOTE = 'origin';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Fonction pour logger avec couleurs
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}`)
};

// Interface readline pour les questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Fonction pour exécuter une commande
const exec = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result?.toString().trim();
  } catch (error) {
    if (!options.ignoreError) {
      log.error(`Erreur lors de l'exécution: ${command}`);
      log.error(error.message);
      process.exit(1);
    }
    return null;
  }
};

// Vérifier l'état du repository
const checkGitStatus = () => {
  log.step('Vérification de l\'état du repository...');
  
  // Vérifier si on est sur la bonne branche
  const currentBranch = exec('git branch --show-current', { silent: true });
  if (currentBranch !== BRANCH) {
    log.error(`Vous devez être sur la branche ${BRANCH}. Branche actuelle: ${currentBranch}`);
    process.exit(1);
  }
  
  // Vérifier s'il y a des changements non commitées
  const status = exec('git status --porcelain', { silent: true });
  if (status) {
    log.warning('Il y a des changements non commitées:');
    console.log(status);
    return false;
  }
  
  // Vérifier si on est à jour avec le remote
  exec('git fetch', { silent: true });
  const behind = exec('git rev-list --count HEAD..origin/main', { silent: true, ignoreError: true });
  if (behind && parseInt(behind) > 0) {
    log.error(`Votre branche locale est en retard de ${behind} commit(s). Faites un git pull d'abord.`);
    process.exit(1);
  }
  
  log.success('Repository prêt pour la release');
  return true;
};

// Vérifier le CHANGELOG
const checkChangelog = () => {
  log.step('Vérification du CHANGELOG...');
  
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const nonPublishedRegex = /## \[Non publié\]\s*([\s\S]*?)(?=## \[|\n---|\n## Légende|$)/;
  const match = changelog.match(nonPublishedRegex);
  
  if (!match) {
    log.error('Section [Non publié] non trouvée dans le CHANGELOG');
    return false;
  }
  
  const content = match[1].trim();
  if (!content || content === '' || !content.includes('- ')) {
    log.error('Aucun changement dans la section [Non publié] du CHANGELOG');
    log.info('Ajoutez vos changements avant de faire une release');
    return false;
  }
  
  log.success('CHANGELOG prêt avec des changements');
  return true;
};

// Afficher les changements à publier
const showChanges = () => {
  log.step('Changements à publier:');
  
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const nonPublishedRegex = /## \[Non publié\]\s*([\s\S]*?)(?=## \[|\n---|\n## Légende|$)/;
  const match = changelog.match(nonPublishedRegex);
  
  if (match) {
    console.log(colors.yellow + match[1].trim() + colors.reset);
  }
  console.log('');
};

// Fonction principale
const main = async () => {
  log.title('🚀 SCRIPT DE RELEASE AUTOMATIQUE 🚀');
  console.log('');
  
  try {
    // Vérifications préliminaires
    if (!checkGitStatus()) {
      const answer = await question('Voulez-vous continuer malgré les changements non commitées ? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        log.info('Release annulée');
        process.exit(0);
      }
    }
    
    if (!checkChangelog()) {
      log.error('CHANGELOG non prêt. Ajoutez vos changements et relancez le script.');
      process.exit(1);
    }
    
    // Afficher les changements
    showChanges();
    
    // Demander le type de version
    console.log('Types de version disponibles:');
    console.log('  1. 🐛 patch   - Corrections de bugs (1.3.0 → 1.3.1)');
    console.log('  2. ✨ minor   - Nouvelles fonctionnalités (1.3.0 → 1.4.0)');
    console.log('  3. 🚀 major   - Breaking changes (1.3.0 → 2.0.0)');
    console.log('');
    
    const versionChoice = await question('Choisissez le type de version (1/2/3): ');
    
    let versionType;
    switch (versionChoice) {
      case '1':
        versionType = 'patch';
        break;
      case '2':
        versionType = 'minor';
        break;
      case '3':
        versionType = 'major';
        break;
      default:
        log.error('Choix invalide');
        process.exit(1);
    }
    
    // Confirmation finale
    const confirm = await question(`\nÊtes-vous sûr de vouloir créer une version ${versionType} ? (y/N): `);
    if (confirm.toLowerCase() !== 'y') {
      log.info('Release annulée');
      process.exit(0);
    }
    
    console.log('');
    log.title(`DÉBUT DE LA RELEASE ${versionType.toUpperCase()}`);
    
    // 1. Incrémenter la version
    log.step(`Incrémentation de la version (${versionType})...`);
    exec(`npm run version:${versionType}`);
    
    // Récupérer la nouvelle version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const newVersion = packageJson.version;
    log.success(`Version incrémentée: v${newVersion}`);
    
    // 2. Commiter les changements
    log.step('Commit des changements de version...');
    exec('git add package.json CHANGELOG.md src/components/admin/VersionInfo.tsx');
    exec(`git commit -m "chore: bump version to v${newVersion}"`);
    log.success('Changements commitées');
    
    // 3. Créer le tag
    log.step('Création du tag...');
    exec(`git tag v${newVersion}`);
    log.success(`Tag v${newVersion} créé`);
    
    // 4. Pousser vers le remote
    log.step('Push vers le repository...');
    exec(`git push ${REMOTE} ${BRANCH}`);
    exec(`git push ${REMOTE} --tags`);
    log.success('Changements poussés vers le repository');
    
    // 5. Attendre le déploiement
    log.step('Déclenchement du déploiement automatique...');
    log.info('Le workflow GitHub Actions va maintenant:');
    log.info('  1. Builder l\'application');
    log.info('  2. Déployer sur GitHub Pages');
    log.info('  3. Rendre la nouvelle version disponible');
    
    console.log('');
    log.title('🎉 RELEASE TERMINÉE AVEC SUCCÈS ! 🎉');
    console.log('');
    log.success(`Version v${newVersion} créée et déployée`);
    log.info('URL de production: https://collectifilefeydeau.github.io/1Hall1Artiste/');
    log.info('Surveillez le workflow: https://github.com/CollectifIleFeydeau/1Hall1Artiste/actions');
    
  } catch (error) {
    log.error('Erreur durant la release:');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Gestion des arguments en ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Script de Release Automatique

Usage:
  node scripts/release.js

Ce script va:
  1. Vérifier l'état du repository Git
  2. Vérifier le CHANGELOG
  3. Demander le type de version (patch/minor/major)
  4. Incrémenter la version
  5. Commiter et taguer
  6. Pousser vers GitHub
  7. Déclencher le déploiement automatique

Prérequis:
  - Être sur la branche main
  - Avoir des changements dans la section [Non publié] du CHANGELOG
  - Repository propre (pas de changements non commitées)
  `);
  process.exit(0);
}

// Lancer le script
main();

# Plan de migration vers un déploiement unique

Ce document détaille le processus de migration du déploiement de l'application Collectif Feydeau vers un déploiement unique sur le dépôt `CollectifIleFeydeau/1Hall1Artiste`.

## Objectif

Simplifier la gestion du code et le déploiement en centralisant tout dans un seul dépôt GitHub et en ne déployant que sur une seule URL : `https://collectifilefeydeau.github.io/1Hall1Artiste/`.

## Étape préliminaire : Déplacement du code vers le répertoire parent

Avant de commencer la migration du déploiement, nous allons d'abord déplacer tout le code du sous-répertoire `Collectif-Feydeau---app` vers le répertoire parent `Collectif Feydeau -- app`.

1. **Sauvegarder l'état actuel** :
   ```bash
   # Créer une archive ZIP du code actuel
   cd "c:\Users\Julien Fritsch\Documents\GitHub"
   powershell Compress-Archive -Path "Collectif Feydeau -- app" -DestinationPath "backup-avant-deplacement-$(Get-Date -Format 'yyyyMMdd').zip"
   ```

2. **Déplacer les fichiers** :
   ```bash
   # Exécuter le script de déplacement
   cd "c:\Users\Julien Fritsch\Documents\GitHub\Collectif Feydeau -- app"
   powershell -ExecutionPolicy Bypass -File .\Collectif-Feydeau---app\deplacement-code.ps1
   ```

3. **Vérifier la structure** :
   - S'assurer que tous les fichiers ont été correctement déplacés
   - Vérifier que les chemins relatifs dans les fichiers ont été correctement mis à jour

## Sauvegarde préalable

Avant de commencer toute modification, effectuez ces étapes de sauvegarde :

1. **Créer une branche de sauvegarde dans les deux dépôts** :
   ```bash
   # Dans le dépôt personnel
   git checkout -b backup-avant-migration-unique
   git push origin backup-avant-migration-unique
   
   # Dans le dépôt du collectif
   git clone https://github.com/CollectifIleFeydeau/1Hall1Artiste.git
   cd 1Hall1Artiste
   git checkout -b backup-avant-migration-unique
   git push origin backup-avant-migration-unique
   ```

2. **Archiver le code actuel** :
   ```bash
   # Créer une archive ZIP du code actuel
   cd "c:\Users\Julien Fritsch\Documents\GitHub\Collectif Feydeau -- app"
   powershell Compress-Archive -Path "Collectif-Feydeau---app" -DestinationPath "backup-avant-migration-$(Get-Date -Format 'yyyyMMdd').zip"
   ```

3. **Sauvegarder les fichiers de build actuels** :
   ```bash
   # Copier le dossier dist actuel
   cd "c:\Users\Julien Fritsch\Documents\GitHub\Collectif Feydeau -- app\Collectif-Feydeau---app"
   npm run build
   xcopy /E /I dist dist-backup-$(date +%Y%m%d)
   ```

## Plan de migration étape par étape

### Étape 1 : Modifier la configuration

1. **Mettre à jour package.json** :
   - Modifier la propriété `homepage` pour pointer vers `https://collectifilefeydeau.github.io/1Hall1Artiste/`
   - Simplifier les scripts de déploiement en supprimant `deploy-collectif` et `deploy-all`
   - Modifier le script `deploy` pour déployer directement sur le dépôt du collectif

   ```json
   {
     "homepage": "https://collectifilefeydeau.github.io/1Hall1Artiste/",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist -r https://github.com/CollectifIleFeydeau/1Hall1Artiste.git -b gh-pages"
     }
   }
   ```

2. **Mettre à jour vite.config.ts** :
   - Modifier la propriété `base` pour utiliser `/1Hall1Artiste/` au lieu de `./`

   ```typescript
   export default defineConfig(({ mode }) => ({
     base: "/1Hall1Artiste/",
     // Reste de la configuration...
   }));
   ```

### Étape 2 : Tester localement

1. **Nettoyer les caches et les dépendances** :
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm -rf dist
   npm install
   ```

2. **Construire l'application avec la nouvelle configuration** :
   ```bash
   npm run build
   ```

3. **Prévisualiser l'application localement** :
   ```bash
   npm run preview
   ```

4. **Vérifier que tout fonctionne correctement** :
   - Vérifier que les chemins des ressources sont corrects (images, CSS, JS)
   - Vérifier que la navigation fonctionne
   - Vérifier que les fonctionnalités principales fonctionnent

### Étape 3 : Déployer vers le dépôt unique

1. **Configurer l'authentification Git si nécessaire** :
   ```bash
   git config --global user.name "Votre Nom"
   git config --global user.email "votre.email@example.com"
   ```

2. **Déployer l'application** :
   ```bash
   npm run deploy
   ```

3. **Vérifier le déploiement** :
   - Accéder à `https://collectifilefeydeau.github.io/1Hall1Artiste/`
   - Vérifier que toutes les fonctionnalités fonctionnent correctement
   - Vérifier que les ressources se chargent sans erreurs

### Étape 4 : Finaliser la migration

1. **Mettre à jour la documentation** :
   - Mettre à jour le README.md avec la nouvelle URL et le processus de déploiement simplifié
   - Mettre à jour tout autre document faisant référence aux anciennes URLs

2. **Communiquer le changement** :
   - Informer tous les membres du collectif du changement d'URL
   - Mettre à jour les liens sur les sites ou réseaux sociaux

## Plan de restauration en cas de problème

Si des problèmes surviennent après la migration, suivez ces étapes pour revenir à la configuration précédente :

### Option 0 : Restaurer après le déplacement du code

Si des problèmes surviennent immédiatement après le déplacement du code vers le répertoire parent :

1. **Restaurer à partir de l'archive ZIP** :
   ```bash
   # Supprimer le répertoire actuel
   cd "c:\Users\Julien Fritsch\Documents\GitHub"
   Remove-Item -Path "Collectif Feydeau -- app" -Recurse -Force
   
   # Extraire l'archive de sauvegarde
   Expand-Archive -Path "backup-avant-deplacement-*.zip" -DestinationPath "."
   ```

### Option 1 : Restaurer la configuration précédente

1. **Restaurer les fichiers de configuration** :
   ```bash
   # Restaurer package.json
   git checkout HEAD~1 -- package.json
   
   # Restaurer vite.config.ts
   git checkout HEAD~1 -- vite.config.ts
   ```

2. **Reconstruire et redéployer vers les deux dépôts** :
   ```bash
   npm run build
   npm run deploy
   npm run deploy-collectif
   ```

### Option 2 : Restaurer à partir de la branche de sauvegarde

1. **Revenir à la branche de sauvegarde** :
   ```bash
   git checkout backup-avant-migration-unique
   ```

2. **Réinstaller les dépendances et reconstruire** :
   ```bash
   npm install
   npm run build
   ```

3. **Redéployer vers les deux dépôts** :
   ```bash
   npm run deploy
   npm run deploy-collectif
   ```

### Option 3 : Restauration complète à partir de l'archive

1. **Restaurer le code à partir de l'archive ZIP** :
   ```bash
   # Extraire l'archive dans un dossier temporaire
   cd "c:\Users\Julien Fritsch\Documents\GitHub"
   powershell Expand-Archive -Path "backup-avant-migration-*.zip" -DestinationPath "Collectif-Feydeau-Restore"
   ```

2. **Remplacer le dossier actuel par la sauvegarde** :
   ```bash
   # Sauvegarder le dossier actuel au cas où
   mv "Collectif Feydeau -- app" "Collectif Feydeau -- app.bak"
   
   # Déplacer la restauration à la place
   mv "Collectif-Feydeau-Restore" "Collectif Feydeau -- app"
   ```

3. **Redéployer à partir de la sauvegarde** :
   ```bash
   cd "Collectif Feydeau -- app/Collectif-Feydeau---app"
   npm install
   npm run deploy
   npm run deploy-collectif
   ```

## Suivi post-migration

Après une semaine de fonctionnement avec la nouvelle configuration :

1. **Vérifier les statistiques d'utilisation** pour s'assurer qu'il n'y a pas de baisse significative
2. **Recueillir les retours des utilisateurs** sur d'éventuels problèmes
3. **Si tout fonctionne correctement**, envisager de supprimer les branches de sauvegarde

## Notes importantes

- **Tokens d'authentification** : Assurez-vous d'avoir les droits d'accès nécessaires pour déployer sur le dépôt du collectif
- **Redirections** : Envisagez de mettre en place une redirection depuis l'ancienne URL vers la nouvelle
- **Service Worker** : Si l'application utilise un service worker, assurez-vous qu'il est correctement configuré pour le nouveau chemin de base

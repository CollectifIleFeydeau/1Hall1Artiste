# Méthodes de déploiement - Collectif Feydeau App

## Déploiement manuel local

### Déploiement vers votre dépôt personnel
```bash
npm run deploy
```
Cette commande exécute automatiquement :
1. `npm run build` (build de l'application)
2. `gh-pages -d dist` (déploiement vers la branche gh-pages de votre dépôt personnel)

### Déploiement vers les deux dépôts
```bash
npm run deploy-all
```
Cette commande exécute séquentiellement :
1. `npm run fix-mime` (correction des problèmes MIME)
2. `npm run deploy` (déploiement vers votre dépôt personnel)
3. `npm run deploy-collectif` (déploiement vers le dépôt du collectif)

### Déploiement vers le dépôt du collectif uniquement
```bash
npm run deploy-collectif
```
Cette commande déploie directement vers le dépôt du collectif sans passer par votre dépôt personnel.

## Déploiement automatique via GitHub Actions

### Déploiement vers votre dépôt personnel
Le workflow `deploy.yml` se déclenche automatiquement à chaque push sur la branche `main`.

### Déploiement vers le dépôt du collectif
Le workflow `deploy-collectif.yml` se déclenche uniquement :

1. **Manuellement** : Via l'interface GitHub Actions
   - Aller dans l'onglet "Actions"
   - Sélectionner le workflow "Deploy to Collectif Repository"
   - Cliquer sur "Run workflow"

2. **Via un tag Git spécifique** : 
   ```bash
   git tag collectif-v1.0.0
   git push origin collectif-v1.0.0
   ```
   - Le tag doit commencer par `collectif-v`
   - Cette méthode permet de contrôler précisément quand déployer vers le dépôt du collectif

## Résolution des problèmes courants

### Erreurs MIME
Si vous rencontrez des erreurs MIME lors du déploiement, exécutez :
```bash
npm run fix-mime
```
Ce script corrige les types MIME en :
- Créant un fichier `.nojekyll`
- Créant un fichier `_headers` avec les types MIME appropriés
- Créant un fichier `.htaccess` pour les serveurs Apache
- Modifiant `index.html` pour remplacer les scripts de type module

### Erreurs d'authentification Git
Si vous rencontrez des erreurs d'authentification lors du déploiement vers le dépôt du collectif :
1. Vérifiez que le secret `ACCESS_TOKEN` est correctement configuré dans les paramètres du dépôt (Settings > Secrets and variables > Actions)
2. Assurez-vous que le token a les permissions nécessaires pour accéder au dépôt du collectif
3. Le token doit avoir les droits d'écriture sur le dépôt cible

### Analyse de l'erreur actuelle
L'erreur actuelle dans le workflow `deploy-collectif.yml` est :
```
The deploy-step encountered an error: The process '/usr/bin/git' failed with exit code 1
```

Causes possibles :
1. Le token d'accès n'a pas les permissions suffisantes pour le dépôt du collectif
2. Le format du nom du dépôt cible est incorrect
3. Problème de configuration Git dans l'environnement GitHub Actions

Solutions recommandées :
1. Vérifier et régénérer le token d'accès avec les bonnes permissions
2. Configurer explicitement l'identité Git dans le workflow
3. Utiliser le format complet de l'URL du dépôt cible
# 📦 Système de Versioning

Ce projet utilise un système de versioning automatique basé sur [Semantic Versioning](https://semver.org/lang/fr/).

## 🔢 Format de Version

Le format de version suit le pattern `MAJOR.MINOR.PATCH` :

- **MAJOR** (🚀) : Changements incompatibles avec les versions précédentes
- **MINOR** (✨) : Nouvelles fonctionnalités compatibles
- **PATCH** (🐛) : Corrections de bugs compatibles

## 🛠️ Utilisation

### Scripts NPM disponibles

```bash
# Afficher la version actuelle
npm run version:show

# Créer une version patch (1.3.0 → 1.3.1)
npm run version:patch

# Créer une version minor (1.3.0 → 1.4.0)
npm run version:minor

# Créer une version major (1.3.0 → 2.0.0)
npm run version:major
```

### Processus de versioning

1. **Ajoutez vos changements** dans la section `[Non publié]` du `CHANGELOG.md`
2. **Exécutez le script** de versioning approprié
3. **Vérifiez** les fichiers modifiés :
   - `package.json` (version mise à jour)
   - `CHANGELOG.md` (nouvelle entrée créée)
   - `src/components/admin/VersionInfo.tsx` (version mise à jour)
4. **Commitez et poussez** :
   ```bash
   git add .
   git commit -m "chore: bump version to v1.3.1"
   git tag v1.3.1
   git push && git push --tags
   ```

## 📝 CHANGELOG

Le fichier `CHANGELOG.md` suit le format [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) :

### Structure des sections

```markdown
## [Non publié]

### Ajouté
- ✨ Nouvelles fonctionnalités

### Modifié
- 🔧 Changements dans les fonctionnalités existantes

### Corrigé
- 🐛 Corrections de bugs

### Supprimé
- 🗑️ Fonctionnalités supprimées
```

### Émojis recommandés

- ✨ Nouvelle fonctionnalité
- 🐛 Correction de bug
- 🔧 Amélioration technique
- 🛡️ Sécurité
- 📱 Mobile/Responsive
- 🚀 Performance
- 🎨 Interface utilisateur
- 📊 Analytics/Stats
- 🔄 Synchronisation
- ❤️ Système de likes
- 🗑️ Suppression/Nettoyage
- 📝 Documentation
- 🧪 Tests
- ⚡ Rapidité/Optimisation
- 🌍 Global/CDN

## 🤖 Automatisation GitHub Actions

Le workflow `.github/workflows/version-and-deploy.yml` automatise :

### Déclenchement automatique (push sur main)

- Détecte les changements dans `CHANGELOG.md`
- Crée automatiquement une version patch
- Déploie sur GitHub Pages

### Déclenchement manuel (workflow_dispatch)

- Permet de choisir le type de version (patch/minor/major)
- Crée la version et déploie

### Processus automatique

1. **Détection** des changements dans `[Non publié]`
2. **Incrémentation** de la version
3. **Mise à jour** des fichiers (package.json, CHANGELOG.md, VersionInfo.tsx)
4. **Commit et tag** automatiques
5. **Build** de l'application
6. **Déploiement** sur GitHub Pages

## 📊 Interface Admin

L'onglet "📦 Version" dans l'interface admin affiche :

- Version actuelle avec type (patch/minor/major)
- Date de dernière mise à jour
- Environnement (développement/production)
- Liens vers CHANGELOG et repository
- Informations techniques

## 🔄 Workflow de Développement

### Pour une nouvelle fonctionnalité

1. Développez la fonctionnalité
2. Ajoutez dans `CHANGELOG.md` sous `### Ajouté`
3. Testez en local
4. Commitez : `git commit -m "feat: nouvelle fonctionnalité"`
5. Poussez : `git push`
6. Le workflow créera automatiquement une version patch

### Pour une version majeure/mineure

1. Préparez tous les changements
2. Complétez le `CHANGELOG.md`
3. Utilisez le workflow manuel sur GitHub :
   - Actions → Version & Deploy → Run workflow
   - Choisissez le type de version
4. Le déploiement se fait automatiquement

## 📁 Fichiers du Système

- `package.json` : Version principale du projet
- `CHANGELOG.md` : Journal des changements
- `scripts/update-changelog.js` : Script de mise à jour automatique
- `src/components/admin/VersionInfo.tsx` : Composant d'affichage de version
- `.github/workflows/version-and-deploy.yml` : Workflow d'automatisation
- `VERSIONING.md` : Cette documentation

## 🎯 Bonnes Pratiques

1. **Toujours** mettre à jour le CHANGELOG avant de créer une version
2. **Utiliser** les émojis pour une meilleure lisibilité
3. **Tester** en local avant de pousser
4. **Vérifier** que les liens et références fonctionnent
5. **Documenter** les breaking changes pour les versions majeures
6. **Garder** les descriptions courtes mais descriptives

## 🚨 Dépannage

### Le script de versioning échoue

- Vérifiez que la section `[Non publié]` existe dans `CHANGELOG.md`
- Assurez-vous qu'il y a du contenu dans cette section
- Vérifiez les permissions d'écriture sur les fichiers

### La version ne s'affiche pas dans l'admin

- Vérifiez que `VersionInfo.tsx` a été mis à jour
- Rechargez la page admin
- Vérifiez la console pour d'éventuelles erreurs

### Le workflow GitHub Actions échoue

- Vérifiez les permissions du token GitHub
- Consultez les logs du workflow
- Assurez-vous que tous les fichiers nécessaires existent

# 🚀 Scripts de Release

Ce dossier contient tous les scripts nécessaires pour automatiser le processus de release.

## 📋 Scripts Disponibles

### 🎯 Script Principal de Release

**`release.js`** - Script Node.js tout-en-un qui automatise complètement le processus de release.

#### Fonctionnalités :
- ✅ Vérification automatique de l'état Git (branche, changements, synchronisation)
- 📝 Validation du CHANGELOG (section [Non publié] avec contenu)
- 🎨 Interface interactive colorée avec choix du type de version
- 🔄 Processus complet : incrémentation → commit → tag → push
- 🚀 Déclenchement automatique du déploiement GitHub Actions

#### Usage :
```bash
# Mode interactif (recommandé)
node scripts/release.js

# Aide
node scripts/release.js --help
```

### 🪟 Scripts Windows

**`release.ps1`** - Version PowerShell native pour Windows
```powershell
# Mode interactif
.\release.ps1

# Direct avec type de version
.\release.ps1 patch
.\release.ps1 minor
.\release.ps1 major

# Aide
.\release.ps1 --help
```

**`release.bat`** - Version Batch pour compatibilité maximale Windows
```batch
# Double-clic ou depuis cmd
release.bat

# Avec argument
release.bat patch
```

### 🛠️ Scripts Utilitaires

**`update-changelog.js`** - Met à jour le CHANGELOG et la version
```bash
node scripts/update-changelog.js patch
node scripts/update-changelog.js minor  
node scripts/update-changelog.js major
```

**`update-version-component.js`** - Met à jour uniquement le composant VersionInfo
```bash
node scripts/update-version-component.js
```

## 🔄 Processus de Release

### 1. Préparation
- Développez vos fonctionnalités
- Ajoutez les changements dans `CHANGELOG.md` section `[Non publié]`
- Commitez tous vos changements de développement

### 2. Release
```bash
# Option 1: Script NPM (recommandé)
npm run release

# Option 2: Script direct
node scripts/release.js

# Option 3: Windows PowerShell
.\release.ps1

# Option 4: Windows Batch
release.bat
```

### 3. Automatique
Le script va :
1. 🔍 Vérifier l'état du repository
2. 📝 Valider le CHANGELOG
3. 🎯 Demander le type de version
4. ⬆️ Incrémenter la version
5. 💾 Commiter les changements
6. 🏷️ Créer le tag Git
7. 📤 Pousser vers GitHub
8. 🚀 Déclencher le déploiement

## 📊 Scripts NPM Disponibles

```bash
# Release complète (recommandé)
npm run release

# Versions spécifiques (si vous voulez éviter l'interactivité)
npm run release:patch   # 1.3.0 → 1.3.1
npm run release:minor   # 1.3.0 → 1.4.0  
npm run release:major   # 1.3.0 → 2.0.0

# Versioning seulement (sans Git)
npm run version:patch
npm run version:minor
npm run version:major
npm run version:show
```

## ✅ Vérifications Automatiques

Les scripts vérifient automatiquement :

### Git Status
- ✅ Branche courante = `main`
- ✅ Pas de changements non commitées (optionnel)
- ✅ Repository synchronisé avec `origin/main`

### CHANGELOG
- ✅ Fichier `CHANGELOG.md` existe
- ✅ Section `[Non publié]` présente
- ✅ Contenu dans la section (au moins une ligne avec `- `)

### Fichiers
- ✅ `package.json` accessible
- ✅ Composant `VersionInfo.tsx` modifiable
- ✅ Permissions d'écriture sur les fichiers

## 🎨 Types de Version

### 🐛 Patch (1.3.0 → 1.3.1)
- Corrections de bugs
- Améliorations mineures
- Pas de nouvelles fonctionnalités

### ✨ Minor (1.3.0 → 1.4.0)
- Nouvelles fonctionnalités
- Améliorations compatibles
- Pas de breaking changes

### 🚀 Major (1.3.0 → 2.0.0)
- Breaking changes
- Refonte majeure
- Incompatibilité avec versions précédentes

## 🔧 Configuration

### Variables Modifiables

Dans `release.js` :
```javascript
const BRANCH = 'main';        // Branche principale
const REMOTE = 'origin';      // Remote Git
```

### Personnalisation

Pour adapter les scripts à votre projet :
1. Modifiez les URLs GitHub dans les messages
2. Ajustez les vérifications selon vos besoins
3. Personnalisez les messages et couleurs

## 🚨 Dépannage

### Erreur "Branche incorrecte"
```bash
git checkout main
git pull origin main
```

### Erreur "Changements non commitées"
```bash
git add .
git commit -m "feat: vos changements"
```

### Erreur "CHANGELOG vide"
Ajoutez du contenu dans la section `[Non publié]` :
```markdown
## [Non publié]

### Ajouté
- ✨ Nouvelle fonctionnalité
```

### Erreur "Repository en retard"
```bash
git pull origin main
```

### Script bloqué
- Vérifiez les permissions d'exécution
- Assurez-vous que Node.js est installé
- Vérifiez que vous êtes dans le bon dossier

## 📝 Logs et Debug

Les scripts affichent des logs colorés détaillés :
- 🔄 **Cyan** : Étapes en cours
- ✅ **Vert** : Succès
- ❌ **Rouge** : Erreurs
- ⚠️ **Jaune** : Avertissements
- ℹ️ **Bleu** : Informations
- 🚀 **Magenta** : Titres importants

En cas de problème, lisez attentivement les messages d'erreur qui indiquent généralement la solution.

## 🎯 Bonnes Pratiques

1. **Toujours tester** en local avant la release
2. **Documenter** les changements dans le CHANGELOG
3. **Utiliser les émojis** pour une meilleure lisibilité
4. **Faire des releases fréquentes** (patch) plutôt que d'attendre
5. **Vérifier** le déploiement après la release
6. **Garder** les descriptions de changements courtes mais claires

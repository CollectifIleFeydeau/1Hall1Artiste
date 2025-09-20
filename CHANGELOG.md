# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

### Modifié

### Corrigé

### Supprimé

## [1.3.1] - 2025-09-20

### Ajouté
- 🚀 Script de release automatique tout-en-un (`release.js`, `release.ps1`, `release.bat`)
- 🔄 Automatisation complète : incrémentation → commit → tag → push → déploiement
- 🎯 Support multi-plateforme (Node.js, PowerShell, Batch)
- ✅ Vérifications automatiques (Git status, CHANGELOG, branche)
- 🎨 Interface colorée et interactive pour meilleure UX
- ⚙️ Configuration VSCode avec schémas JSON et extensions recommandées

### Corrigé
- 🐛 Erreur de schéma VSCode "vscode://schemas/mcp" dans package.json
- 🔧 Configuration JSON Schema pour validation correcte du package.json

## [1.3.0] - 2025-09-20

### Ajouté
- ✨ Interface admin avec statistiques de likes complète et responsive
- 📊 Dashboard statistiques avec métriques globales et top 5 des contributions
- 🔄 Bouton actualisation avec timestamp dans l'interface admin
- 📱 Design 100% responsive pour l'interface admin (flex-wrap adaptatif)
- 🎯 Compteur de likes affiché sous chaque contribution admin

### Corrigé
- 🐛 Onglets admin coupés sur petits écrans (passage de grid fixe à flex-wrap)
- 🔧 Gestion d'erreur avec fallback à 0 pour les compteurs de likes
- 📐 Layout flexible pour tous les composants admin

## [1.2.0] - 2025-09-19

### Ajouté
- ❤️ Système de likes révolutionnaire avec Firebase Realtime Database
- 🔄 Synchronisation temps réel multi-client (polling 5s)
- 👥 Support multi-utilisateur avec sessionId unique
- 📊 Statistiques globales des likes
- 🛡️ Prévention des double-likes
- 🎨 Composant LikeButton avec 2 variants (compact/full)
- ✨ Animations Framer Motion (scale, bounce)
- 🎯 Intégration complète dans la galerie communautaire

### Technique
- 🔥 Firebase Realtime Database: `collectif-feydeau-default-rtdb.europe-west1.firebasedatabase.app`
- 🛠️ Service `likesService.ts` avec fetch() pur
- 🪝 Hook `useLikes.ts` avec polling temps réel
- 📝 Types `likesTypes.ts` complets
- 🧪 Composant de test avec simulation multi-utilisateur

## [1.1.0] - 2025-09-18

### Révolution Architecture
- 🚀 **RÉVOLUTION MAJEURE**: Abandon complet du système GitHub au profit de Cloudinary + Firebase
- ⚡ Temps de synchronisation: **0 seconde** (vs 30-60 secondes avec GitHub)
- 🌍 CDN mondial Cloudinary pour performance optimale
- 🔄 Synchronisation multi-client parfaite et instantanée
- 🗑️ Suppression admin fonctionnelle et instantanée

### Ajouté
- ☁️ Service unifié `cloudinaryService.ts` (Cloudinary + Firebase)
- 🔥 Firebase Realtime Database pour métadonnées
- 📸 Upload direct vers Cloudinary CDN
- 🛡️ Système de modération via Firebase
- 📊 Table rase automatique au premier chargement

### Supprimé
- ❌ 4 workflows GitHub complexes et lents
- ❌ Système de synchronisation GitHub problématique
- ❌ Erreurs 404 fréquentes
- ❌ Maintenance complexe des workflows

## [1.0.2] - 2025-09-20

### Sécurité & Robustesse
- 🛡️ **AUDIT COMPLET DU CODE**: Correction de toutes les vulnérabilités critiques
- 🔒 Protection formatage de dates avec try-catch dans `SavedEvents.tsx`
- 🛠️ Sécurisation manipulations DOM dans `LocalImage.tsx` et `ShareButton.tsx`
- 🧹 Cleanup sécurisé des event listeners et memory leaks
- 📱 Corrections spécifiques pour mobile Android Chrome

### Corrigé
- 🐛 Erreur DOM `insertBefore` sur `/map` (mobile Android Chrome)
- 🐛 Erreur `Invalid time value` sur `/community` (timestamps malformés)
- 🔧 Protection des refs et vérifications `parentElement`
- 🛡️ Auto-recovery pour erreurs DOM avec rechargement automatique
- 🧪 Validation robuste des timestamps avec fallbacks gracieux

## [1.0.1] - 2025-06-18

### Corrigé
- 🐛 Navigation onboarding → carte bloquée (conflit entre localStorage et état React)
- 🔄 Synchronisation automatique localStorage avec polling et storage events
- 🗺️ Redirection automatique vers `/map` après completion onboarding
- 📝 Logs détaillés pour debugging navigation

### Ajouté
- 🧪 Fonction de test `resetOnboardingTest()` dans la console
- 📊 Surveillance localStorage avec `window.addEventListener('storage')`
- 🔄 Polling de synchronisation (100ms) pour détection changements

## [1.0.0] - 2025-06-18

### Ajouté
- 🎉 **PREMIÈRE VERSION STABLE**
- 📸 Système de galerie communautaire avec Cloudinary
- 🗺️ Carte interactive avec géolocalisation
- 📱 Interface responsive et moderne
- 🎵 Lecteur audio intégré
- 📅 Système de calendrier d'événements
- 👥 Contributions communautaires
- 🔐 Interface d'administration
- 📊 Système de monitoring d'erreurs
- 🌐 Support PWA et mode hors-ligne

### Technique
- ⚛️ React 18 + TypeScript + Vite
- 🎨 Tailwind CSS + Shadcn/ui
- ☁️ Cloudinary pour les images
- 🔥 Firebase pour les données temps réel
- 📧 EmailJS pour notifications
- 🚀 Déploiement GitHub Pages
- 📱 Design mobile-first responsive

---

## Légende des Émojis

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

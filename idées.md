
# Idées 

1. Gamifier / célébrer  ?
* Think about funny ways to celebrate the app user. For example, add a confetti animation when an event is saved for the first time or when all the locations have been marked as visited. Study the code, understand the journey, think about a list of proposals, and do them.

2. Get all the errors
* Think about how I can know when something is failing at the user side. Ideally, I would like to know when an error, page 404, is happening and get as much information as possible to understand the context. Study the code, understand the journey, think about a list of proposals, and do them.

3. Ajouter les horaires sur la vue programme / grossier les horaires sur l'ecran des évènements

4. Mettre à jour l'onboarding en expliquant plus les fonctionnalités

# Priorités actuelles (phase de test et optimisation)

## Priorités immédiates à faire 

1. **Test sur mobile** ⭐ (Priorité actuelle)
   - Tester l'application sur mobile pour vérifier le fonctionnement du mode hors ligne
   - Vérifier la réactivité et l'ergonomie sur différents appareils
   - Demander à Mathias si les artistes préfèrent leur email ou insta ou autre en contact

--------------------------
# Améliorations Potentielles 

## Améliorations Techniques

1. **Performance**
   - Utiliser l'API Intersection Observer pour charger les contenus uniquement lorsqu'ils sont visibles
   - Implémenter le code splitting pour réduire la taille du bundle initial

2. **Architecture**
   - Envisager une solution de gestion d'état plus robuste comme Redux
   - Implémenter un système de versionnement des données pour faciliter la résolution des conflits

## Fonctionnalités

1. **Carte interactive**
   - Ajouter des filtres visuels pour les différents types d'événements

2. **Sécurité et robustesse**
   - Renforcer les définitions de types et les interfaces pour une meilleure sécurité de type
   - Créer une couche API dédiée pour gérer la récupération et la manipulation des données externes
   - Mettre en place des tests unitaires et d'intégration pour assurer la fiabilité du code

## Optimisations complétées ✅

1. **Support hors ligne**
   - ✅ Implémentation d'un Service Worker pour mettre en cache les ressources statiques
   - ✅ Création d'une page de fallback pour le mode hors ligne
   - ✅ Ajout d'un indicateur de statut hors ligne
   - ✅ Correction du chemin du service worker pour le mode production

2. **Optimisation des images**
   - ✅ Création d'un composant OptimizedImage pour la conversion WebP et le chargement responsive
   - ✅ Mise à jour du composant AppImage pour utiliser les nouvelles optimisations
   - ✅ Standardisation des noms de fichiers d'images pour éviter les problèmes avec les caractères spéciaux

3. **Nettoyage du code**
   - ✅ Suppression des fichiers et composants inutilisés
   - ✅ Consolidation des composants d'animation (PageTransition et SwipeNavigation)

4. **Amélioration de la structure du routage**
   - ✅ Refactorisation du système de routage pour une meilleure maintenabilité
   - ✅ Implémentation d'une approche déclarative pour la configuration des routes

4. **Gestion des erreurs**
   - Améliorer la gestion des erreurs pour l'intégration HelloAsso
   - Ajouter des messages d'erreur conviviaux en cas de problème de connexion

4. **Tests de performance**
   - Vérifier les performances sur différents appareils et navigateurs
   - Optimiser les temps de chargement sur les connexions lentes



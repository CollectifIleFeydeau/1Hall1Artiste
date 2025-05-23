
# Idées 

# Priorités actuelles (phase de test et optimisation)


## Priorités immédiates à faire 

1. **Test sur mobile** ⭐ (Priorité actuelle)
   - Tester l'application sur mobile pour vérifier le fonctionnement du mode hors ligne
   - Vérifier la réactivité et l'ergonomie sur différents appareils
   - Demander à Mathias si les artistes préfèrent leur email ou insta ou autre en contact

--------------------------
# Améliorations Potentielles 

## Système de suivi d'erreurs


2. **Amélioration du suivi**
   * Ajouter des métadonnées supplémentaires (version de l'application, type d'appareil)
   * Catégoriser les erreurs par type et sévérité
   * Implémenter un système de déduplication des erreurs similaires

3. **Intégration avec d'autres services**
   * Ajouter des statistiques sur les erreurs les plus fréquentes


## Gamification

1. Compléter le système d'achievements existant
* Implémenter le déclenchement de l'achievement ALL_LOCATIONS_VISITED : Ajouter une vérification dans la fonction markLocationAsVisited pour débloquer cet achievement lorsque tous les lieux sont visités.
* Créer une page dédiée aux achievements : Permettre aux utilisateurs de consulter leurs réalisations débloquées et celles encore à débloquer.

2. Enrichir le système avec de nouveaux achievements
* Achievements liés à l'exploration :
   * FIRST_LOCATION_VISITED : Premier lieu visité
   * HALF_LOCATIONS_VISITED : 50% des lieux visités
   * WEEKEND_EXPLORER : Visiter des lieux pendant le week-end
* Achievements liés aux événements :
   * CONCERT_ENTHUSIAST : Sauvegarder 3 concerts
   * EXHIBITION_LOVER : Sauvegarder 3 expositions
   * COMPLETE_COLLECTION : Sauvegarder au moins un événement de chaque type
* Achievements liés à l'engagement :
   * SHARE_MASTER : Partager du contenu 3 fois
* FEEDBACK_PROVIDER : Donner un feedback sur l'application

3. Système de niveaux et progression
* Introduire un système de niveaux utilisateur :
   * Niveau 1 : Débutant (après avoir visité 1 lieu)
   * Niveau 2 : Explorateur (après avoir visité 3 lieux)
   * Niveau 3 : Guide (après avoir visité 5 lieux)
   * Niveau 4 : Expert (après avoir visité tous les lieux)
* Barre de progression : Afficher une barre de progression pour le niveau actuel dans l'interface principale.

4. Récompenses et avantages
* Badges personnalisés : Débloquer des badges visuels pour personnaliser le profil utilisateur.

5. Aspects sociaux et communautaires
* Classements : Créer un classement des "explorateurs" les plus actifs (optionnel et anonymisé).
* Partage social amélioré : Permettre de partager ses achievements sur les réseaux sociaux avec des visuels attrayants.

6. Amélioration de l'expérience utilisateur
* Notifications d'achievements : Améliorer les notifications visuelles lors du déblocage d'un achievement.
* Journal d'activité : Créer un historique des actions et achievements débloqués.
* Statistiques personnelles : Afficher des statistiques sur l'utilisation de l'application (nombre de visites, temps passé, etc.).

7. Implémentation technique
Pour mettre en œuvre ces améliorations, voici les principales modifications à apporter :

* Enrichir le service d'achievements :
   * Ajouter les nouveaux types d'achievements
   * Implémenter les fonctions de vérification pour chaque achievement
* Créer un service de progression :
   * Gérer les niveaux utilisateur
   * Calculer les points d'expérience
* Améliorer l'interface utilisateur :
   * Ajouter une page de profil avec les achievements
   * Intégrer les indicateurs de progression dans la navigation
* Ajouter des hooks de suivi :
   * Suivre les actions utilisateur pour déclencher les achievements
   * Mettre en place un système d'événements pour la progression

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

5. **Système d'onboarding**
   - Écran d'accueil pour les nouveaux utilisateurs
   - Affichage uniquement lors de la première visite

6. **Système de gamification** ✅
   - ✅ Achievements pour les premières actions (sauvegarder un événement, configurer une notification)
   - ✅ Animations de célébration (confettis) lors du déblocage d'achievements
   - ✅ Correction de l'affichage des confettis pour qu'ils apparaissent au-dessus des modales
   - ✅ Uniformisation de la sauvegarde d'événements depuis la carte et le programme

7. **Système de suivi d'erreurs**
   - Capture des erreurs via ErrorBoundary
   - Stockage local des erreurs dans localStorage
   - Envoi des erreurs par email via EmailJS
   - Vérification périodique et envoi automatique

8. Ajouter les horaires sur la vue programme / grossier les horaires sur l'ecran des évènements

9. Mettre à jour l'onboarding en expliquant plus les fonctionnalités


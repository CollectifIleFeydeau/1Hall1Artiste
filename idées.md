
# Idées 

# Priorités actuelles (phase de test et optimisation)

- corriger faute orthographique (foundation =>  fondation)
- tout les retours sur la carte doivent mettre le lieux en exergue
   * si le lieux a été visités, le mettre en exergue en vert plutôt qu'en orange
- rajouter Thomas et Matias et leur proposer
- idée : localisation et naviguation
- déplacer quelques lieux
- oter les confirmations d'action
- URL github "Feydeau"?
- tester avec firefox

## Priorités immédiates à faire 

1. **Test sur mobile** ⭐ (Priorité actuelle)
   - Tester l'application sur mobile pour vérifier le fonctionnement du mode hors ligne
   - Vérifier la réactivité et l'ergonomie sur différents appareils

2. **Mode hors-ligne amélioré**
   * Précharger automatiquement les détails des événements sauvegardés
   * Télécharger les cartes pour une utilisation hors-ligne

3. **Intégration avec les calendriers natifs**
   * Ajouter les événements sauvegardés directement au calendrier du téléphone
   * Synchroniser les rappels avec le système de notification natif

4. **Suivi et analyse**
   * Métadonnées enrichies (version, appareil)
   * Catégorisation des erreurs
   * Déduplication des erreurs similaires
   * Statistiques d'utilisation
--------------------------
## Améliorations en réflexion 

### 1. Enrichissement des contenus

* **Contenus audio et visuels**
   * Guides audio pour les lieux importants
   * Ambiances sonores historiques (port au 18e siècle)
   * Extraits musicaux des artistes participants
   * Galerie de photos historiques avec légendes explicatives

* **Éléments éducatifs**
   * Quiz sur l'histoire de l'Île Feydeau
   * Comparaisons avant/après des bâtiments
   * Parcours thématiques (architecture, histoire maritime)

### 2. Fonctionnalités utilisateur

* **Personnalisation**
   * Notes privées sur les événements et lieux
   * Exportation des notes en fin d'événement
   * Parcours personnalisés selon les intérêts

* **Interaction communautaire**
   * Partage de photos par les utilisateurs
   * Section témoignages pour chaque événement
   * Galerie communautaire des meilleurs moments
   * Système de feedback structuré

### 3. Gamification

* **Système d'achievements**
   * Implémenter ALL_LOCATIONS_VISITED dans markLocationAsVisited
   * Créer une page dédiée aux achievements
   * Nouveaux achievements liés à l'exploration (premier lieu, 50% des lieux, week-end)
   * Nouveaux achievements liés aux événements (concerts, expositions, collection complète)
   * Nouveaux achievements liés à l'engagement (partages, feedback)

* **Progression et récompenses**
   * Système de niveaux utilisateur (Débutant → Explorateur → Guide → Expert)
   * Barre de progression visuelle
   * Badges personnalisés débloquables
   * Classements anonymisés des explorateurs
   * Partage des réalisations sur réseaux sociaux

* **Expérience utilisateur**
   * Notifications visuelles améliorées pour les achievements
   * Journal d'activité et historique des réalisations
   * Statistiques personnelles (visites, temps passé, etc.)

* **Implémentation technique**
   * Enrichissement du service d'achievements
   * Création d'un service de progression
   * Amélioration de l'interface utilisateur
   * Mise en place de hooks de suivi des actions

### 5. Optimisations techniques

* **Performance**
   * Utilisation de l'API Intersection Observer pour le chargement conditionnel
   * Code splitting pour réduire la taille du bundle initial
   * Optimisation des images avec des noms de fichiers standardisés sans caractères spéciaux

* **Architecture**
   * Solution de gestion d'état plus robuste (Redux)
   * Système de versionnement des données
   * Refactorisation des composants pour une meilleure réutilisation

* **Sécurité et robustesse**
   * Définitions de types renforcées
   * Couche API dédiée pour la gestion des données
   * Tests unitaires et d'intégration
   * Gestion améliorée des erreurs

## Optimisations complétées ✅

1. **Support hors ligne**
   - Implémentation d'un Service Worker pour mettre en cache les ressources statiques
   - Création d'une page de fallback pour le mode hors ligne
   - Ajout d'un indicateur de statut hors ligne
   - Correction du chemin du service worker pour le mode production

2. **Optimisation des images**
   - Création d'un composant OptimizedImage pour la conversion WebP et le chargement responsive
   - Mise à jour du composant AppImage pour utiliser les nouvelles optimisations
   - Standardisation des noms de fichiers d'images pour éviter les problèmes avec les caractères spéciaux

3. **Nettoyage du code**
   - Suppression des fichiers et composants inutilisés
   - Consolidation des composants d'animation (PageTransition et SwipeNavigation)

4. **Amélioration de la structure du routage**
   - Refactorisation du système de routage pour une meilleure maintenabilité
   - Implémentation d'une approche déclarative pour la configuration des routes

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
   - Achievements pour les premières actions (sauvegarder un événement, configurer une notification)
   - Animations de célébration (confettis) lors du déblocage d'achievements
   - Correction de l'affichage des confettis pour qu'ils apparaissent au-dessus des modales
   - Uniformisation de la sauvegarde d'événements depuis la carte et le programme

7. **Système de suivi d'erreurs**
   - Capture des erreurs via ErrorBoundary
   - Stockage local des erreurs dans localStorage
   - Envoi des erreurs par email via EmailJS
   - Vérification périodique et envoi automatique

8. **Ajouter les horaires sur la vue programme / grossier les horaires sur l'ecran des évènements**

9. **Mettre à jour l'onboarding en expliquant plus les fonctionnalités**

10. **Horaire par défaut d'abord et précis à la demande**

11. **Mise à jour de la programmation** ✅
   - Mise à jour des emplacements des artistes selon la nouvelle programmation
   - Ajout d'Andry Shango Rajoelina à la liste des artistes
   - Déplacement de Clotilde Debar Zablocki au 15 allée Duguay Trouin
   - Suppression de l'Atelier Norg de la programmation

12. **Factorisation du code : coordonnées dans location, events et artistes, etc....**

13. **Depuis les enregistrements, on peux aller à l'évènement**
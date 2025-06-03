
# Toutes nouvelles idées 

icône de calendrier pour ajouter les rendez

appuyer sur les photos pour les voir en grand

# Priorités actuelles (phase de test et optimisation)

## Priorités immédiates à faire 

--------------------------
## Améliorations en réflexion 

### 1. Enrichissement des contenus

* **Présentation de chaque artiste**
  * Idée : 1 ligne ou 2 d'accroche se terminant par ... incitant au double tap.
    * En tapant sur cette phrase d'accroche le volet se déplie permettant une présentation plus complète de l'artiste.
    * Il faut éviter qu'un texte trop long apparaisse tout de suite pour permettre de voir le compte insta, des photos ou une vidéo YouTube.

* **Contenus audio et visuels**
  * Guides audio pour les lieux importants
   * Ambiances sonores historiques (port au 18e siècle)
Visit Google AI Studio, and select “Native Audio Generation”
Choose between “Single-speaker” for narrations or “Multi-speaker” for dialogues
Create your script, adding style instructions and selecting voices for each speaker

Click “Run” to generate your audio and download it for your projects!
   * Galerie de photos historiques avec légendes explicatives

* **Éléments éducatifs**
   * Quiz sur l'histoire de l'Île Feydeau

### 2. Fonctionnalités utilisateur

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

6. **Système de gamification** 
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

12. **Factorisation du code : coordonnées dans location, events et artistes, etc....**

13. **Depuis les enregistrements, on peux aller à l'évènement**

14. **Commenter les toasts d'action**

15. **Tous les retours sur la carte doivent mettre le lieux en exergue**
   - si le lieux a été visités, le mettre en exergue en vert plutôt qu'en orange

16. **Test sur mobile** 
   - Tester l'application sur mobile pour vérifier le fonctionnement du mode hors ligne
   - Vérifier la réactivité et l'ergonomie sur différents appareils

17. **Mode hors-ligne amélioré**
   - Précharger automatiquement les détails des événements sauvegardés
   - Les images des historiques des lieux
   - Télécharger les cartes pour une utilisation hors-ligne

18. **Suivi et analyse**
   * Capture unifiée des erreurs :
      * Quand une erreur se produit, elle est d'abord traitée par le nouveau système d'analyse (catégorisation, déduplication, métadonnées enrichies)
      * Puis automatiquement transmise au système EmailJS existant pour l'envoi par email
   * Synchronisation périodique :
      * Les deux systèmes se synchronisent toutes les 30 minutes
      * Cela garantit que toutes les erreurs sont correctement suivies et envoyées
   * Métadonnées enrichies :
      * Le système EmailJS reçoit maintenant des informations supplémentaires comme la catégorie d'erreur et l'empreinte digitale
      * Ces données supplémentaires facilitent le débogage et l'analyse des problèmes

19. **Location et naviguation**
   * Localiser l'utilisateur.
   * Guidage vers les points d'intérêt :
      * Afficher une flèche directionnelle qui indique la direction vers le point sélectionné
      * Montrer la distance en mètres jusqu'au point d'intérêt
      * Mettre à jour ces informations en temps réel lorsque l'utilisateur se déplace
   * Interface de navigation :
      * Ajouter un bouton "Me guider" sur la carte ou dans les détails d'un lieu
      * Lorsqu'un lieu est sélectionné, afficher un panneau de navigation en bas de l'écran
      * Inclure des instructions textuelles simples comme "Dirigez-vous vers le nord sur 50 mètres"
   * Indicateurs visuels :
      * Tracer une ligne ou un chemin sur la carte entre la position de l'utilisateur et le point d'intérêt
   * Indiquer gentiment si la personne est hors carte (ex: "Vous vous éloignez de l'Île Feydeau, dirigez-vous vers le sud-est pour y revenir").
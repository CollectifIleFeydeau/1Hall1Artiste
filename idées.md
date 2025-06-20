# Toutes nouvelles idées 


test


# Priorités actuelles (phase de test et optimisation)

## Priorités immédiates à faire 

   * rajouter les autres batîments : https://patrimonia.nantes.fr/lpav/index.html?data_id=dataSource_1-186bb733533-layer-1%3A475&views=Notice

* Tests de la galerie communautaire 
   * Tests à compléter:
      * Tests multi-navigateurs (Chrome, Firefox, Safari, Edge)
      * Tests sur mobile et différentes tailles d'écran
      * Tests de performance avec de nombreuses contributions
      * Tests de sécurité pour les URLs des images
      => Voir @galerie-communautaire-concept.md
      => Tests sur @plan-test-contributions.md

* Changer les immages de l'onboarding

* S'assurer que les stats de firebase marchent
=> Voir @ANALYTICS_TESTING_GUIDE.md

## Améliorations en réflexion 

### Navigation par chemins praticables
   - Implémentation d'un système de waypoints pour représenter les chemins réels sur l'île Feydeau
   - Algorithme A* pour calculer les itinéraires optimaux en suivant les rues et chemins
   - Interface utilisateur permettant de basculer entre navigation simple et navigation avancée
   - Visualisation des intersections et des points de passage sur la carte

### Gamification

* **Éléments éducatifs**
   * Quiz sur l'histoire de l'Île Feydeau

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

## Optimisations complétées 

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

5. **Gestion des erreurs**
   - Améliorer la gestion des erreurs pour l'intégration HelloAsso
   - Ajouter des messages d'erreur conviviaux en cas de problème de connexion

6. **Tests de performance**
   - Vérifier les performances sur différents appareils et navigateurs
   - Optimiser les temps de chargement sur les connexions lentes

7. **Système d'onboarding**
   - Écran d'accueil pour les nouveaux utilisateurs
   - Affichage uniquement lors de la première visite

8. **Système de gamification** 
   - Achievements pour les premières actions (sauvegarder un événement, configurer une notification)
   - Animations de célébration (confettis) lors du déblocage d'achievements
   - Correction de l'affichage des confettis pour qu'ils apparaissent au-dessus des modales
   - Uniformisation de la sauvegarde d'événements depuis la carte et le programme

9. **Système de suivi d'erreurs**
   - Capture des erreurs via ErrorBoundary
   - Stockage local des erreurs dans localStorage
   - Envoi des erreurs par email via EmailJS
   - Vérification périodique et envoi automatique

10. **Ajouter les horaires sur la vue programme / grossier les horaires sur l'ecran des évènements**

11. **Mettre à jour l'onboarding en expliquant plus les fonctionnalités**

12. **Horaire par défaut d'abord et précis à la demande**

13. **Factorisation du code : coordonnées dans location, events et artistes, etc....**

14. **Depuis les enregistrements, on peux aller à l'évènement**

15. **Commenter les toasts d'action**

16. **Tous les retours sur la carte doivent mettre le lieux en exergue**
   - si le lieux a été visités, le mettre en exergue en vert plutôt qu'en orange

17. **Test sur mobile** 
   - Tester l'application sur mobile pour vérifier le fonctionnement du mode hors ligne
   - Vérifier la réactivité et l'ergonomie sur différents appareils

18. **Mode hors-ligne amélioré**
   - Précharger automatiquement les détails des événements sauvegardés
   - Les images des historiques des lieux
   - Télécharger les cartes pour une utilisation hors-ligne

19. **Suivi et analyse**
   * Capture unifiée des erreurs :
      * Quand une erreur se produit, elle est d'abord traitée par le nouveau système d'analyse (catégorisation, déduplication, métadonnées enrichies)
      * Puis automatiquement transmise au système EmailJS existant pour l'envoi par email
   * Synchronisation périodique :
      * Les deux systèmes se synchronisent toutes les 30 minutes
      * Cela garantit que toutes les erreurs sont correctement suivies et envoyées
   * Métadonnées enrichies :
      * Le système EmailJS reçoit maintenant des informations supplémentaires comme la catégorie d'erreur et l'empreinte digitale
      * Ces données supplémentaires facilitent le débogage et l'analyse des problèmes

20. **Amélioration de la précision de localisation GPS**
   * Implémentation d'une transformation affine complète pour la conversion GPS :
      * Prise en compte de l'inclinaison réelle de l'île Feydeau sur la carte
      * Calcul précis des coefficients de transformation via résolution d'un système linéaire 3x3
      * Utilisation de la règle de Cramer pour résoudre le système d'équations
   * Amélioration de la précision du positionnement :
      * Utilisation des coordonnées GPS précises des quatre coins de l'île
      * Correction de l'orientation des points cardinaux sur la carte
      * Meilleure correspondance entre position GPS réelle et affichage sur la carte
   * Robustesse du système :
      * Mécanisme de fallback en cas d'impossibilité de résoudre le système affine
      * Tests de validation avec des points GPS connus

21. **Location et naviguation**
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

22. **Galerie de photos historiques**
   - Création d'une galerie pour les 165 photos historiques de l'Île Feydeau
   - Implémentation d'un carrousel fluide avec navigation tactile
   - Gestion des différents formats d'images (JPG, JPEG, PNG, etc.) avec fallback
   - Ajout d'un indicateur de progression et d'un mode plein écran
   - Intégration dans la navigation principale via une page intermédiaire "Galeries"
   - Tracking analytique des interactions utilisateur avec la galerie

23. **Refonte de la navigation**
   - Restructuration de la barre de navigation avec 6 éléments principaux
   - Création d'une page intermédiaire "Galeries" pour accéder aux différentes collections
   - Simplification de l'expérience utilisateur en rendant les fonctionnalités principales plus accessibles

24. **Intégration Firebase Analytics**
   - Implémentation complète du tracking d'événements avec Firebase Analytics
   - Création d'outils de débogage pour vérifier l'envoi des événements
   - Configuration du mode debug pour visualiser les événements en temps réel
   - Tracking des interactions utilisateur, vues de pages et événements personnalisés
   - Mise en place d'un système de diagnostic pour vérifier la configuration

25. **Améliorations pour la galerie communautaire**
   - Partage de photos par les utilisateurs / Galerie communautaire des meilleurs moments
   - Section témoignages pour les utilisateurs
   - Interface d'administration avec code PIN pour modération
   - Système de likes pour les contributions
   - Correction des problèmes identifiés:
      * Chemins d'images pour les exemples incorrects ou images manquantes
      * Améliorer la persistance des likes après fermeture du navigateur
      * S'assurer que les contributions supprimées ne réapparaissent pas
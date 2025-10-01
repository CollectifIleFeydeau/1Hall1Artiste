# Toutes nouvelles idées

# Priorités actuelles

### GESTION DES DONNEES

 le bouton bruitage quand on reclique dessus il ne s'éteint pas 
- [X] **rajouter les MP3** : 
- [ ] **rajouter les images** : 
  12 allée Duguay-Trouin / 22 rue Kervégan
  9-10 allée Duguay-Trouin / 16-18 rue Kervégan 
- [ ] **Mise à jour** : Récupérer les informations depuis Google sheet
- [ ] **Mise à jour** : Exporter les informations pour les copier sur OpenAgenda facilement
- [ ] **Images d'événements principaux** : 5-10 événements phares (400x300px, <50KB)

### "Carte au Trésor"

#### 🗺️ **Compteur en haut de la carte **
- [ ] **Compteur "X Visité, Y À découvrir"** : Style parchemin vintage en haut de la page Carte
- [ ] **Boutons "Localisation" et "Ambiance"** : Style cohérent avec le compteur et les bouger en haut
- [ ] **Intégration harmonieuse** : Même esthétique que le design system

#### 🎨 **Marqueurs de carte améliorés**
- [ ] **Rose des vents miniature** : Remplacer les cercles par des boussoles (bleu si visité, gris sinon)
<!-- - [ ] **Coffre au trésor** : Pour les lieux spéciaux ou événements importants / concerts ? -->
<!-- - [ ] **Pin stylisé** : Version "carte ancienne" du marqueur classique -->
<!-- - [ ] **Animation subtile** : Hover et états actifs avec transitions douces -->

#### 🏛️ **Fenêtres modales améliorées**
- [ ] **Rose des vents décorative** : Sous les titres des modales
- [ ] **Bordures dessinées à la main** : Contour irrégulier autour des modales
- [ ] **Boutons stylisés** : Sceaux de cire ou étiquettes de papier ancien
- [ ] **Contraste amélioré** : Meilleure lisibilité du texte sur fond parchemin
- [ ] **Éléments décoratifs subtils** : Sans nuire à la fonctionnalité

#### 🌊 **Représentation de l'eau améliorée**
- [ ] **Motifs de vagues traditionnels** : Dessinés à la main pour les zones d'eau
- [ ] **Lavis bleu aquarelle** : Avec fines lignes de vagues
- [ ] **Style "carte ancienne"** : Intégration harmonieuse avec l'esthétique générale

#### ✨ **Éléments décoratifs subtils**
- [ ] **Rose des vents détaillée** : Dans un coin de la carte principale
- [ ] **Bordures vieillis** : Taches de thé et bords déchirés
- [ ] **Motifs de lignes délicats** : Encadrement des zones importantes
- [ ] **Illustrations nautiques** : Ancres, navires, dans les espaces vides
- [ ] **Cadres décoratifs** : Pour mettre en valeur le contenu important

## Améliorations en réflexion

### Navigation par chemins praticables

- Implémentation d'un système de waypoints pour représenter les chemins réels sur l'île Feydeau
- Algorithme A\* pour calculer les itinéraires optimaux en suivant les rues et chemins
- Interface utilisateur permettant de basculer entre navigation simple et navigation avancée
- Visualisation des intersections et des points de passage sur la carte

### Gamification

- **Éléments éducatifs**

  - Quiz sur l'histoire de l'Île Feydeau
  - Chasse au trésor

- **Système d'achievements**

  - Implémenter ALL_LOCATIONS_VISITED dans markLocationAsVisited
  - Créer une page dédiée aux achievements
  - Nouveaux achievements liés à l'exploration (premier lieu, 50% des lieux, week-end)
  - Nouveaux achievements liés aux événements (concerts, expositions, collection complète)
  - Nouveaux achievements liés à l'engagement (partages, feedback)

- **Progression et récompenses**

  - Système de niveaux utilisateur (Débutant → Explorateur → Guide → Expert)
  - Barre de progression visuelle
  - Badges personnalisés débloquables
  - Classements anonymisés des explorateurs
  - Partage des réalisations sur réseaux sociaux

- **Expérience utilisateur**

  - Notifications visuelles améliorées pour les achievements
  - Journal d'activité et historique des réalisations
  - Statistiques personnelles (visites, temps passé, etc.)

- **Implémentation technique**
  - Enrichissement du service d'achievements
  - Création d'un service de progression
  - Amélioration de l'interface utilisateur
  - Mise en place de hooks de suivi des actions

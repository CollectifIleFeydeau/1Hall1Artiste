
--------------------------
# Priorités actuelles (phase de saisie d'événements et de contenus)

## Priorités immédiates à faire

0. **Correction de bug**
   - J'ai testé sur 2 navigateurs et le point n'est pas à la même place.

1. **Formulaire de saisie d'événements**
   - Créer un formulaire de saisie d'événements qui utilise le système de validation
   - Intégrer le formulaire à la page Admin

2. **Documentation**
   - Documenter les composants principaux et leur utilisation
   - Ajouter des commentaires explicatifs aux parties complexes du code

4. **Performance**
   - Optimiser les rendus avec React.memo pour les composants qui ne changent pas souvent

5. **Petits changements**
   - Changer le title de l'application en "Collectif Feydeau" au lieu de "island-f"

--------------------------
# Améliorations Potentielles (long terme)

## Améliorations Techniques

1. **Structure des données**
   - Implémenter un système de cache pour éviter de recharger les données inutilement

2. **Performance**
   - Implémenter le lazy loading pour les images de la carte
   - Utiliser l'API Intersection Observer pour charger les contenus uniquement lorsqu'ils sont visibles
   - Implémenter le code splitting pour réduire la taille initiale du bundle et améliorer les temps de chargement
   - Analyser et réduire la taille du bundle en supprimant les dépendances inutilisées

3. **Architecture**
   - Adopter une architecture modulaire avec des composants réutilisables
   - Séparer clairement la logique métier (services) de l'interface utilisateur (composants)
   - Créer un système de thèmes pour faciliter les changements d'apparence
   - Envisager une solution de gestion d'état plus robuste comme React Context ou Redux

## Expérience Utilisateur

1. **Interface**
   - Améliorer la navigation entre les différentes sections
   - Optimiser l'interface pour les appareils mobiles et tablettes
   - Remettre le mot de passe plus tard

3. **Support hors ligne**
   - Ajouter une fonctionnalité hors ligne basique pour permettre aux utilisateurs de consulter le contenu en cache
   - Mettre en place une gestion des erreurs plus robuste, notamment pour l'intégration HelloAsso

## Fonctionnalités

1. **Carte interactive**
   - Améliorer la fonctionnalité de la carte avec des fonctionnalités plus interactives
   - Envisager l'utilisation d'une bibliothèque de cartographie pour une expérience plus réaliste

2. **Sécurité et robustesse**
   - Renforcer les définitions de types et les interfaces pour une meilleure sécurité de type
   - Créer une couche API dédiée pour gérer la récupération et la manipulation des données externes
   - Mettre en place des tests unitaires et d'intégration pour assurer la fiabilité du code


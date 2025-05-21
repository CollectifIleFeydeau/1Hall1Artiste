--------------------------
# Priorités actuelles (phase de test et optimisation)

## Priorités immédiates à faire 

Demande
* la carte ne sont montre pas les expos présentes dans le programme

1. **Test sur mobile**
   - Demander à l'équipe de tester l'application sur leurs téléphones 
   - Demander à Mathias si les artistes préfèrent leur email ou insta ou autre en contact

2. **Performance**
   - Analyser et réduire la taille du bundle en supprimant les dépendances inutilisées
       - Taille du bundle : Le fichier JavaScript principal fait environ 672 KB (210 KB gzippé), ce qui est assez conséquent. 
       - Avertissement sur la taille des chunks : Vite recommande d'utiliser l'import dynamique ou de configurer manuellement les chunks pour améliorer les performances. C'est également aligné avec vos priorités de performance.
   - Implémenter le lazy loading pour les images de la carte

3. **Browserslist**
   - Avertissement sur Browserslist : Les données de compatibilité des navigateurs (caniuse-lite) sont un peu anciennes (7 mois). Ce n'est pas critique mais pourrait être mis à jour ultérieurement.

## Expérience Utilisateur

1. **Interface et Navigation**
   - Améliorer la navigation entre les différentes sections :
     - Implémenter un système de navigation par gestes (swipe) entre les pages principales
     - Créer des transitions animées plus fluides entre les pages
     - Mettre en place un historique de navigation personnalisé pour faciliter les retours en arrière
   - Remettre le mot de passe plus tard
   - Optimiser l'affichage des titres longs dans toutes les vues (cartes, détails, etc.)
   - Améliorer la cohérence visuelle entre les différentes pages

--------------------------
# Améliorations Potentielles 

## Améliorations Techniques

1. **Structure des données et synchronisation**
   - Options de synchronisation :
     - Polling périodique (simple mais moins efficace)
     - WebSockets pour une mise à jour instantanée (plus complexe mais plus réactif)
     - Service Worker pour gérer les mises à jour en arrière-plan
   - Ajouter un indicateur visuel lorsque des mises à jour sont disponibless

2. **Performance**
   - Utiliser l'API Intersection Observer pour charger les contenus uniquement lorsqu'ils sont visibles
   - Implémenter le code splitting pour réduire la taille initiale du bundle et améliorer les temps de chargement
   - Optimiser le stockage local pour éviter les problèmes de quota et améliorer les performances

3. **Architecture**
   - Adopter une architecture modulaire avec des composants réutilisables
   - Séparer clairement la logique métier (services) de l'interface utilisateur (composants)
   - Créer un système de thèmes pour faciliter les changements d'apparence
   - Envisager une solution de gestion d'état plus robuste comme React Context ou Redux
   - Implémenter un système de versionnement des données pour faciliter la résolution des conflits

## Expérience Utilisateur

1. **Support hors ligne**
   - Mettre en place une gestion des erreurs plus robuste, notamment pour l'intégration HelloAsso

## Fonctionnalités

1. **Carte interactive**
   - Améliorer la fonctionnalité de la carte avec des fonctionnalités plus interactives

2. **Sécurité et robustesse**
   - Renforcer les définitions de types et les interfaces pour une meilleure sécurité de type
   - Créer une couche API dédiée pour gérer la récupération et la manipulation des données externes
   - Mettre en place des tests unitaires et d'intégration pour assurer la fiabilité du code


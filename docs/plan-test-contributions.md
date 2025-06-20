# Plan de test complet pour la fonctionnalité de contribution

## 1. Préparation de l'environnement

- [x] Lancer l'application en mode live
- [x] Ouvrir deux navigateurs différents (ou un navigateur normal + un navigateur en mode incognito) pour simuler deux utilisateurs distincts
1. [x] Accéder à la page de contribution
2. [x] Soumettre une photo:
   - [x] Sélectionner une image
   - [x] Ajouter une description
   - [x] Ajouter un nom (optionnel)
   - [x] Soumettre
3. [x] Soumettre un témoignage:
   - [x] Écrire un texte
   - [x] Ajouter un nom (optionnel)
   - [x] Soumettre
4. [x] Vérifier que la contribution apparaît dans la galerie
5. [x] Vérifier que la contribution est visible par d'autres utilisateurs

## 2. Test d'affichage dans la galerie

1. [x] Accéder à la galerie communautaire
2. [x] Vérifier que les contributions soumises sont visibles
3. [x] Vérifier les filtres (photos, témoignages)
4. [x] Vérifier la pagination si implémentée

### Vue détaillée
1. [x] Cliquer sur une contribution pour l'ouvrir en détail
2. [x] Vérifier que toutes les informations sont correctement affichées:
   - [x] Image en pleine résolution pour les photos
   - [x] Texte complet pour les témoignages
   - [x] Nom d'affichage
   - [x] Date
   - [x] Nombre de likes

## 3. Test multi-utilisateurs

1. [x] Sur le navigateur 1, soumettre une contribution
2. [x] Sur le navigateur 2, rafraîchir la galerie et vérifier que la contribution est visible
3. [x] Ouvrir la même contribution sur deux navigateurs différents
4. [x] Vérifier que la même image s'affiche (✅ fonctionne)
5. [ ] Sur le navigateur 2, liker la contribution
6. [ ] Rafraîchir le navigateur 2 et vérifier que le like est visible
7. [ ] Rafraîchir le navigateur 1 et vérifier que le like persiste
8. [ ] Vérifier que le bouton like est désactivé ou indique que l'utilisateur a déjà liké
9. [ ] Tester la persistance des likes après fermeture/réouverture du navigateur

## 4. Test de fin d'onboarding

1. [x] Compléter entièrement l'onboarding
2. [x] Vérifier que la navigation vers la carte s'effectue automatiquement
3. [x] Tester depuis différents points d'entrée (première visite, retour utilisateur)

## 5. Test d'administration

1. [x] Accéder à l'interface d'administration (avec le code PIN)
2. [x] Vérifier que toutes les contributions sont listées
3. [x] Tester les filtres (photos, témoignages, en attente)
4. Pour chaque contribution:
   - [x] Vérifier que les détails sont correctement affichés
   - [x] Tester la suppression
   - [x] Vérifier que la contribution disparaît de la liste
5. [x] Rafraîchir la page et vérifier que les contributions supprimées ne réapparaissent pas
6. [x] Revenir à la galerie publique et vérifier que les contributions supprimées n'y apparaissent plus

## 6. Test de persistance

1. [x] Fermer complètement le navigateur
2. [x] Rouvrir l'application
3. [x] Vérifier que:
   - [x] Les contributions soumises sont toujours visibles
   - [x] Les likes sont conservés
   - [x] Les contributions supprimées ne réapparaissent pas

## 7. Test de compatibilité

1. [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
2. [ ] Tester sur mobile (réel ou émulé)
3. [ ] Tester avec différentes tailles d'écran

## 8. Test de performance

1. [ ] Soumettre plusieurs contributions à la suite
2. [ ] Vérifier les temps de chargement de la galerie avec beaucoup de contributions
3. [ ] Vérifier la réactivité de l'interface lors du chargement des images

## 9. Test de sécurité

1. [ ] Vérifier que les URLs des images sont correctement sécurisées

## Problèmes identifiés

### Problème 1: Suppression des contributions
- **Description**: La suppression depuis l'interface d'administration retourne des erreurs et les contributions réapparaissent après rafraîchissement
- **Statut**: ✅ **Résolu définitivement**
- **Date**: 19/06/2025
- **Détails**: 
  - **Phase 1** (16/06): Le Worker Cloudflare a été mis à jour pour gérer la suppression des issues GitHub via l'endpoint `/delete-issue`
  - **Phase 2** (19/06): Fix complet de la persistance des suppressions :
    - Modification de `deleteCommunityEntry` pour fermer automatiquement l'issue GitHub correspondante
    - Ajout de filtres dans la galerie pour exclure les entrées avec `moderation.status === "rejected"`
    - Ajout de filtres dans l'interface admin pour masquer les contributions supprimées
    - Optimisation du workflow GitHub Actions pour éviter les conflits lors de suppressions massives
    - **Résultat** : Les contributions supprimées disparaissent définitivement de tous les clients et ne réapparaissent plus jamais

### Problème 2: Images manquantes
- **Description**: Erreur 404 pour les images d'exemple (`https://collectifilefeydeau.github.io/1Hall1Artiste/images/example-image.jpg`)
- **Statut**: À corriger
- **Date**: 16/06/2025
- **Détails**: Les chemins d'images pour les exemples ne sont pas corrects ou les images n'existent pas

### Problème 3: Fin d'onboarding défaillante
- **Description**: L'onboarding ne se termine pas correctement, l'utilisateur reste bloqué sur la dernière slide au lieu d'être redirigé vers la carte
- **Statut**: Corrigé
- **Date**: 18/06/2025
- **Détails**: Simplification de la logique de navigation en supprimant les timeouts complexes et en utilisant une navigation directe avec `navigate('/map', { replace: true })`

### Problème 4: Bug lors de la contribution
- **Description**: Une erreur se produit lors de la soumission d'une contribution
- **Statut**: Corrigé
- **Date**: 18/06/2025
- **Détails**: Ajout de vérifications de sécurité dans le FileReader (`if (event.target && event.target.result)`) pour éviter l'erreur TypeError: Cannot read properties of undefined

### Problème 5: Synchronisation des likes défaillante
- **Description**: Les likes ne se synchronisent pas correctement entre les clients
- **Statut**: Corrigé
- **Date**: 18/06/2025
- **Détails**: 
  - Modification de la fonction `toggleLike` pour synchroniser avec le serveur via l'API Cloudflare Worker (`/like-issue`)
  - Mise en place d'un système de fallback local en cas d'échec de synchronisation
  - Les likes sont maintenant persistés sur GitHub et synchronisés entre tous les clients
  - Logs détaillés ajoutés pour le diagnostic

### Problème 6: Suppressions massives causent des conflits
- **Description**: La suppression de nombreuses contributions simultanément déclenche des workflows concurrents provoquant des conflits Git
- **Statut**: ✅ **Résolu**
- **Date**: 19/06/2025
- **Détails**: 
  - Optimisation du workflow `sync-entries.yml` avec `cancel-in-progress: true` 
  - Ajout d'un délai de 10 secondes pour regrouper les modifications
  - Évite les conflits lors de suppressions massives (test avec 75 suppressions simultanées réussi)

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
3. [ ] Sur le navigateur 2, liker la contribution
4. [ ] Sur le navigateur 1, rafraîchir et vérifier que le like est comptabilisé
5. [ ] Sur le navigateur 2, vérifier que le bouton like est désactivé ou indique que l'utilisateur a déjà liké

## 5. Test d'administration

1. [x] Accéder à l'interface d'administration (avec le code PIN)
2. [x] Vérifier que toutes les contributions sont listées
3. [ ] Tester les filtres (photos, témoignages, en attente)
4. Pour chaque contribution:
   - [x] Vérifier que les détails sont correctement affichés
   - [x] Tester la suppression
   - [ ] Vérifier que la contribution disparaît de la liste
5. [ ] Rafraîchir la page et vérifier que les contributions supprimées ne réapparaissent pas
6. [ ] Revenir à la galerie publique et vérifier que les contributions supprimées n'y apparaissent plus

## 6. Test de persistance

1. [x] Fermer complètement le navigateur
2. [x] Rouvrir l'application
3. [x] Vérifier que:
   - [x] Les contributions soumises sont toujours visibles
   - [ ] Les likes sont conservés
   - [ ] Les contributions supprimées ne réapparaissent pas

## 7. Test de compatibilité

1. [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
2. [ ] Tester sur mobile (réel ou émulé)
3. [ ] Tester avec différentes tailles d'écran

## 8. Test de performance

1. [ ] Soumettre plusieurs contributions à la suite
2. [ ] Vérifier les temps de chargement de la galerie avec beaucoup de contributions
3. [ ] Vérifier la réactivité de l'interface lors du chargement des images

## 9. Test de sécurité

1. [ ] Tenter d'accéder à l'interface d'administration sans le code PIN
2. [ ] Tenter d'injecter du code HTML/JavaScript dans les champs de texte
3. [ ] Vérifier que les URLs des images sont correctement sécurisées

## 10. Test de déploiement

1. [ ] Déployer l'application sur GitHub Pages
2. [ ] Répéter les tests 2 à 6 sur l'environnement de production
3. [ ] Vérifier que les chemins d'images fonctionnent correctement
4. [ ] Vérifier que l'API proxy fonctionne correctement pour la soumission et la suppression

## Problèmes identifiés

### Problème 1: Suppression des contributions
- **Description**: La suppression depuis l'interface d'administration retourne des erreurs et les contributions réapparaissent après rafraîchissement
- **Statut**: Partiellement corrigé (localStorage), mais erreur 400 avec le Worker Cloudflare
- **Date**: 16/06/2025
- **Détails**: La suppression locale fonctionne mais l'API retourne une erreur 400 (Bad Request) lors de l'appel à `https://github-contribution-proxy.collectifilefeydeau.workers.dev/delete-issue`

### Problème 2: Images manquantes
- **Description**: Erreur 404 pour les images d'exemple (`https://collectifilefeydeau.github.io/1Hall1Artiste/images/example-image.jpg`)
- **Statut**: À corriger
- **Date**: 16/06/2025
- **Détails**: Les chemins d'images pour les exemples ne sont pas corrects ou les images n'existent pas

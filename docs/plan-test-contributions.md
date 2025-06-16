# Plan de test complet pour la fonctionnalité de contribution

## 1. Préparation de l'environnement

- [x] Lancer l'application en mode live
- [x] Ouvrir deux navigateurs différents (ou un navigateur normal + un navigateur en mode incognito) pour simuler deux utilisateurs distincts
- [x] Préparer quelques images de test (tailles et formats variés)
- [x] Préparer quelques textes de témoignages

## 2. Test de soumission de contributions

### Photos
1. [x] Accéder à la page de contribution
2. [x] Sélectionner "Photo" comme type de contribution
3. [x] Remplir le formulaire avec:
   - [x] Nom d'affichage
   - [x] Description
   - [x] Sélectionner une image
4. [x] Soumettre et vérifier:
   - [ ] Message de confirmation
   - [ ] Redirection vers la galerie
   - [ ] Présence de la nouvelle contribution dans la galerie

### Témoignages
1. [ ] Accéder à la page de contribution
2. [ ] Sélectionner "Témoignage" comme type de contribution
3. [ ] Remplir le formulaire avec:
   - [ ] Nom d'affichage
   - [ ] Texte du témoignage
4. [ ] Soumettre et vérifier les mêmes points que pour les photos

### Cas limites
1. [ ] Tester avec une image très grande (>5MB)
2. [ ] Tester avec un témoignage très long
3. [ ] Tester avec des caractères spéciaux dans les champs texte
4. [ ] Tester sans remplir les champs obligatoires

## 3. Test de visualisation

### Galerie principale
1. [ ] Vérifier que les nouvelles contributions apparaissent dans la galerie
2. [ ] Vérifier le tri (par date, par popularité)
3. [ ] Vérifier les filtres (photos, témoignages)
4. [ ] Vérifier la pagination si implémentée

### Vue détaillée
1. [ ] Cliquer sur une contribution pour l'ouvrir en détail
2. [ ] Vérifier que toutes les informations sont correctement affichées:
   - [ ] Image en pleine résolution pour les photos
   - [ ] Texte complet pour les témoignages
   - [ ] Nom d'affichage
   - [ ] Date
   - [ ] Nombre de likes

## 4. Test multi-utilisateurs

1. [ ] Sur le navigateur 1, soumettre une contribution
2. [ ] Sur le navigateur 2, rafraîchir la galerie et vérifier que la contribution est visible
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

1. [ ] Fermer complètement le navigateur
2. [ ] Rouvrir l'application
3. [ ] Vérifier que:
   - [ ] Les contributions soumises sont toujours visibles
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

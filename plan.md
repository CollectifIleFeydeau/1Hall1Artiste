# Plan pour corriger la contribution de photos

## Notes
- Le problème initial semblait être une erreur CORS, masquant probablement une erreur 404 (Not Found).
- Le frontend (`collectif-feydeau.github.io`) appelait l'API backend (`collectif-feydeau-api.netlify.app`).
- **Changement majeur :** Netlify a été retiré du projet. Les contributions sont maintenant gérées directement via l'API GitHub.
- **Solution implémentée :** Modification du service communautaire pour envoyer les images directement à l'API GitHub en les convertissant en base64 et en les incluant dans le corps des issues GitHub.

## Liste des tâches
- [x] Analyser le code des fonctions pour comprendre comment les réponses sont construites.
- [x] **Frontend:** Localiser la configuration de l'URL de base de l'API et la méthode d'envoi des images.
- [x] **Backend:** Modifier les fonctions pour gérer correctement les téléversements de fichiers.
- [x] **Transition vers GitHub API:** Adapter le code pour utiliser directement l'API GitHub au lieu de Netlify.
    - [x] Modifier la fonction `uploadImage` pour convertir les images en base64 et les inclure dans les issues GitHub.
    - [x] Modifier la fonction `submitContribution` pour créer des issues GitHub avec les métadonnées appropriées.
- [ ] Corriger les erreurs de syntaxe restantes dans le code.
- [ ] Déployer les modifications.
- [ ] Tester la fonctionnalité de contribution de photos.

## Objectif actuel
Corriger les erreurs de syntaxe restantes dans le code et finaliser les modifications pour permettre la contribution de photos via l'API GitHub.

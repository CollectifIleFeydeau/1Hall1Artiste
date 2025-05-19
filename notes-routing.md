# Notes sur le routage React pour GitHub Pages

## Problème
GitHub Pages ne gère pas nativement les applications SPA (Single Page Application) avec des routes personnalisées, ce qui provoque des erreurs 404 lorsque l'utilisateur rafraîchit la page ou accède directement à une URL autre que la racine.

## Solutions possibles

### 1. Utiliser HashRouter (au lieu de BrowserRouter)
- **Fonctionnement** : Utilise des URL avec des fragments (#) pour simuler des routes (ex: `/#/about` au lieu de `/about`)
- **Avantages** :
  - Fonctionne immédiatement sur GitHub Pages sans configuration supplémentaire
  - Ne nécessite pas de redirection côté serveur
- **Inconvénients** :
  - URLs moins élégantes avec le symbole #
  - Peut poser des problèmes avec certains outils d'analyse

### 2. Utiliser BrowserRouter avec une page 404.html personnalisée
- **Fonctionnement** : Rediriger toutes les requêtes 404 vers la page principale avec des paramètres d'URL
- **Étapes** :
  1. Créer un fichier `404.html` qui redirige vers index.html avec l'URL d'origine en paramètre
  2. Ajouter un script dans `index.html` qui récupère l'URL d'origine et redirige vers la bonne route
- **Avantages** :
  - URLs propres sans #
  - Meilleure expérience utilisateur
- **Inconvénients** :
  - Configuration plus complexe
  - Redirection visible lors du chargement initial

### 3. Utiliser un fichier _redirects (pour Netlify) ou .htaccess (pour Apache)
- Ne fonctionne pas sur GitHub Pages qui n'offre pas cette fonctionnalité

## Recommandation
Pour GitHub Pages, la solution la plus simple et fiable est d'utiliser HashRouter. Si les URLs propres sont essentielles, il faudrait envisager d'héberger l'application sur une plateforme comme Netlify ou Vercel qui gèrent nativement les SPA.

## Implémentation actuelle
L'application utilise actuellement BrowserRouter, ce qui explique les erreurs 404 sur GitHub Pages. Le passage à HashRouter devrait résoudre ce problème.

## Références
- [React Router Documentation](https://reactrouter.com/en/main)
- [GitHub Pages SPA Workaround](https://github.com/rafgraph/spa-github-pages)

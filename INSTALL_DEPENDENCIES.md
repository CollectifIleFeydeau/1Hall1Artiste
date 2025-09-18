# 📦 Installation des nouvelles dépendances

## Commandes à exécuter :

```bash
# Installer react-swipeable pour la navigation tactile
npm install react-swipeable@^7.0.1

# Vérifier l'installation
npm list react-swipeable
```

## Alternative si problème :

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
npm install react-swipeable@^7.0.1
```

## Vérification :

Après installation, ces erreurs devraient disparaître :
- `Cannot find module 'react-swipeable'`
- Erreurs TypeScript dans EntryDetail.tsx

## Types inclus :

react-swipeable inclut ses propres types TypeScript, pas besoin d'installer @types/react-swipeable.

# Guide de centrage en CSS pour l'application Collectif Feydeau

## Méthode fiable pour centrer parfaitement des éléments

### 1. Centrage absolu avec transform

```css
.element-parent {
  position: relative; /* Établit un contexte de positionnement */
}

.element-a-centrer {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

Cette méthode fonctionne parfaitement pour tout type d'élément, quelle que soit sa taille.

### 2. Centrage avec Flexbox

```css
.conteneur-flex {
  display: flex;
  justify-content: center; /* Centrage horizontal */
  align-items: center;     /* Centrage vertical */
}
```

Idéal pour les conteneurs avec un ou plusieurs enfants.

### 3. Centrage avec Grid

```css
.conteneur-grid {
  display: grid;
  place-items: center; /* Centrage horizontal et vertical */
}
```

Très efficace pour des layouts plus complexes.

## Application dans notre code

Pour les marqueurs sur la carte (comme dans UserLocation.tsx), toujours utiliser :

```jsx
<div 
  className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
>
  {/* Contenu du marqueur */}
</div>
```

## Erreurs courantes à éviter

1. Ne pas utiliser seulement `margin: auto` pour le centrage vertical
2. Éviter les combinaisons complexes de marges négatives
3. Ne pas mélanger différentes approches de centrage dans le même composant

## Test rapide de centrage

Pour vérifier qu'un élément est bien centré, vous pouvez temporairement lui ajouter une bordure :

```css
border: 1px solid red;
```

Cela permet de visualiser facilement si l'élément est correctement centré par rapport à son conteneur.

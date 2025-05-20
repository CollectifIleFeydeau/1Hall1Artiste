# Documentation des Composants

Ce document fournit une documentation détaillée des composants principaux de l'application Collectif Feydeau.

## EventDetails

**Fichier**: `/src/components/EventDetails.tsx`

**Description**: Composant qui affiche les détails d'un événement dans une boîte de dialogue modale. Permet de voir les informations complètes d'un événement, de le sauvegarder et de le partager.

**Utilisation**:
```tsx
<EventDetails 
  event={selectedEvent}
  isOpen={!!selectedEvent}
  onClose={() => setSelectedEvent(null)}
  source="map"
/>
```

**Props**:
- `event`: L'événement à afficher (type `Event` ou `null`)
- `isOpen`: Booléen qui indique si la boîte de dialogue est ouverte
- `onClose`: Fonction appelée lors de la fermeture de la boîte de dialogue
- `source`: Source de l'ouverture ('map', 'program' ou 'saved')

**Fonctionnalités**:
- Affichage des détails de l'événement (titre, artiste, lieu, date, description)
- Sauvegarde/suppression de l'événement
- Partage de l'événement via l'API Web Share
- Navigation vers la carte avec mise en évidence du lieu de l'événement

## Map

**Fichier**: `/src/pages/Map.tsx`

**Description**: Page principale avec la carte interactive des événements et lieux. Permet de visualiser les événements sur une carte et d'accéder à leurs détails.

**Utilisation**:
```tsx
<Route path="/map" element={<PageTransition><Map /></PageTransition>} />
```

**Fonctionnalités**:
- Affichage d'une carte interactive avec les lieux des événements
- Filtrage des événements par jour et catégorie
- Vue détaillée d'un lieu avec la liste des événements associés
- Navigation vers les détails d'un événement
- Marquage des lieux comme visités

## BottomNavigation

**Fichier**: `/src/components/BottomNavigation.tsx`

**Description**: Barre de navigation inférieure présente sur toutes les pages. Permet de naviguer entre les différentes sections de l'application.

**Utilisation**:
```tsx
<BottomNavigation />
```

**Fonctionnalités**:
- Navigation vers les pages principales (Map, Program, SavedEvents, Donate, About)
- Indication visuelle de la page active
- Optimisé pour l'utilisation mobile avec des zones de toucher suffisamment grandes

## LoadingIndicator

**Fichier**: `/src/components/LoadingIndicator.tsx`

**Description**: Indicateur de chargement pour les opérations longues. Affiche un spinner et un message de chargement.

**Utilisation**:
```tsx
<LoadingIndicator size="medium" text="Chargement..." fullScreen={true} />
```

**Props**:
- `size`: Taille du spinner ('small', 'medium', 'large')
- `color`: Couleur du spinner
- `fullScreen`: Booléen qui indique si l'indicateur doit être affiché en plein écran
- `text`: Texte à afficher sous le spinner

## OptimizedImage

**Fichier**: `/src/components/OptimizedImage.tsx`

**Description**: Composant d'image optimisé pour le mobile. Utilise WebP si disponible, charge les images de manière paresseuse et affiche un indicateur de chargement.

**Utilisation**:
```tsx
<OptimizedImage 
  src="/images/event.jpg"
  alt="Description de l'image"
  className="rounded-lg"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false}
/>
```

**Props**:
- `src`: URL de l'image
- `alt`: Texte alternatif
- `className`: Classes CSS additionnelles
- `sizes`: Tailles responsives pour le srcSet
- `width`: Largeur de l'image
- `height`: Hauteur de l'image
- `priority`: Booléen qui indique si l'image doit être chargée en priorité
- `objectFit`: Style d'ajustement de l'image ('cover', 'contain', etc.)

## AccessibleButton

**Fichier**: `/src/components/AccessibleButton.tsx`

**Description**: Bouton amélioré pour l'accessibilité. Offre un meilleur contraste et des zones de toucher plus grandes pour les appareils mobiles.

**Utilisation**:
```tsx
<AccessibleButton
  variant="outline"
  size="lg"
  enhancedContrast={true}
  touchFriendly={true}
  onClick={() => handleClick()}
>
  Texte du bouton
</AccessibleButton>
```

**Props**:
- Toutes les props du composant Button
- `enhancedContrast`: Booléen qui indique si le contraste doit être amélioré
- `touchFriendly`: Booléen qui indique si le bouton doit être optimisé pour le toucher

## LoadingContext

**Fichier**: `/src/contexts/LoadingContext.tsx`

**Description**: Contexte React pour gérer l'état de chargement global de l'application. Permet d'afficher un indicateur de chargement depuis n'importe quel composant.

**Utilisation**:
```tsx
// Dans un composant
const { startLoading, stopLoading } = useLoading();

// Pour démarrer le chargement
startLoading("Chargement des données...");

// Pour arrêter le chargement
stopLoading();
```

**Fonctionnalités**:
- Gestion centralisée de l'état de chargement
- Affichage d'un indicateur de chargement plein écran
- Personnalisation du message de chargement

## CacheManager

**Fichier**: `/src/utils/cacheManager.ts`

**Description**: Gestionnaire de cache pour stocker les données fréquemment utilisées. Améliore les performances en évitant les requêtes répétitives.

**Utilisation**:
```tsx
// Définir une valeur dans le cache
cacheManager.set("events", eventsData, 30 * 60 * 1000); // 30 minutes

// Récupérer une valeur du cache
const events = cacheManager.get("events");

// Récupérer ou générer une valeur
const events = await cacheManager.getOrSet(
  "events",
  async () => await fetchEvents(),
  30 * 60 * 1000
);
```

**Fonctionnalités**:
- Mise en cache des données avec expiration
- Récupération des données du cache ou génération si absentes
- Nettoyage automatique des entrées expirées

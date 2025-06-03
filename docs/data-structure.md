# Structure des données de l'application Collectif Feydeau

Ce document décrit la structure des données utilisée dans l'application Collectif Feydeau, notamment la relation entre les événements et les lieux.

## Événements et Lieux

### Structure des Événements (`events.ts`)

Un événement est défini par les propriétés suivantes :

- `id`: Identifiant unique de l'événement
- `artistId`: Identifiant de l'artiste associé à l'événement
- `title`: Titre de l'événement
- `description`: Description détaillée de l'événement
- `time`: Horaires de l'événement (ex: "10h00 - 18h00, samedi et dimanche")
- `days`: Jours de la semaine où l'événement a lieu (ex: ["samedi", "dimanche"])
- `locationId`: Identifiant du lieu où se déroule l'événement

Les propriétés suivantes sont ajoutées dynamiquement à partir des données de l'artiste :

- `artistName`: Nom de l'artiste
- `type`: Type d'événement ("exposition" ou "concert")
- `artistBio`: Biographie de l'artiste
- `contact`: Informations de contact de l'artiste
- `image`: Image associée à l'artiste (optionnel)
- `email`: Email de l'artiste (optionnel, pour les concerts)

### Structure des Lieux (`locations.ts`)

Un lieu est défini par les propriétés suivantes :

- `id`: Identifiant unique du lieu
- `name`: Nom du lieu (ex: "10 quai Turenne")
- `x`: Coordonnée X sur la carte
- `y`: Coordonnée Y sur la carte
- `description`: Description du lieu (optionnel)
- `history`: Historique du lieu (optionnel)

## Relations entre Événements et Lieux

- Chaque événement est associé à un lieu via la propriété `locationId`
- Le nom du lieu peut être récupéré dynamiquement à l'aide de la fonction `getLocationNameById(locationId)`
- Les événements associés à un lieu peuvent être récupérés à l'aide de la fonction `getEventsByLocationId(locationId)`

## Fonctions utilitaires

### Dans `locations.ts`

- `getLocations()`: Retourne la liste de tous les lieux
- `getLocationNameById(locationId)`: Retourne le nom d'un lieu à partir de son ID

### Dans `events.ts`

- `getEventsByLocation(locationName)`: Retourne les événements associés à un lieu spécifique
- `getArtistById(artistId)`: Retourne les informations d'un artiste à partir de son ID

### Dans `dataService.ts`

- `getEventsByLocationId(locationId)`: Retourne les événements associés à un lieu à partir de son ID
- `getLocationIdForEvent(event)`: Retourne l'ID du lieu associé à un événement

## Bonnes pratiques

1. **Éviter la redondance des données**
   - Les événements ne stockent que l'ID du lieu, pas son nom ou ses coordonnées
   - Les lieux ne stockent pas la liste des événements qui s'y déroulent

2. **Utiliser les fonctions utilitaires**
   - Toujours utiliser `getLocationNameById` pour obtenir le nom d'un lieu
   - Utiliser `getEventsByLocationId` pour obtenir les événements d'un lieu

3. **Maintenir la cohérence des données**
   - S'assurer que chaque `locationId` dans un événement correspond à un lieu existant
   - Utiliser les tests unitaires pour vérifier la cohérence des données

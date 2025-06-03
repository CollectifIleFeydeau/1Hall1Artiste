# Carte des Composants Principaux

Ce document sert de référence rapide pour naviguer dans le code de l'application Collectif Feydeau. Il répertorie les composants principaux, leur emplacement et leur utilisation.

## Pages Principales

| Composant | Chemin | Description |
|-----------|--------|-------------|
| `Map` | `/src/pages/Map.tsx` | Page principale avec la carte interactive des événements et lieux |
| `Program` | `/src/pages/Program.tsx` | Affiche le programme des événements par jour et catégorie |
| `SavedEvents` | `/src/pages/SavedEvents.tsx` | Liste des événements sauvegardés par l'utilisateur |
| `About` | `/src/pages/About.tsx` | Informations sur l'association et l'équipe |
| `Donate` | `/src/pages/Donate.tsx` | Page pour faire un don à l'association |
| `LocationHistory` | `/src/pages/LocationHistory.tsx` | Historique et détails des lieux |

## Composants UI

| Composant | Chemin | Description |
|-----------|--------|-------------|
| `EventDetails` | `/src/components/EventDetails.tsx` | Affiche les détails d'un événement dans une boîte de dialogue |
| `BottomNavigation` | `/src/components/BottomNavigation.tsx` | Barre de navigation inférieure présente sur toutes les pages |
| `ShareButton` | `/src/components/ShareButton.tsx` | Bouton pour partager un contenu via l'API Web Share |
| `LoadingIndicator` | `/src/components/LoadingIndicator.tsx` | Indicateur de chargement pour les opérations longues |
| `OptimizedImage` | `/src/components/OptimizedImage.tsx` | Composant d'image optimisé pour le mobile (WebP, lazy loading) |
| `AccessibleButton` | `/src/components/AccessibleButton.tsx` | Bouton amélioré pour l'accessibilité (contraste, taille) |
| `Dialog` | `/src/components/ui/dialog.tsx` | Composant de boîte de dialogue modal |

## Utilitaires

| Utilitaire | Chemin | Description |
|------------|--------|-------------|
| `cacheManager` | `/src/utils/cacheManager.ts` | Gestionnaire de cache pour stocker les données fréquemment utilisées |
| `imageOptimizer` | `/src/utils/imageOptimizer.ts` | Utilitaires pour optimiser les images (conversion WebP, redimensionnement) |
| `savedEvents` | `/src/services/savedEvents.ts` | Gestion des événements sauvegardés (localStorage) |
| `analytics` | `/src/services/analytics.ts` | Suivi des interactions utilisateur et statistiques |
| `errorHandling` | `/src/utils/errorHandling.ts` | Système de gestion des erreurs |

## Contextes

| Contexte | Chemin | Description |
|----------|--------|-------------|
| `LoadingContext` | `/src/contexts/LoadingContext.tsx` | Gestion globale de l'état de chargement |

## Données

| Fichier | Chemin | Description |
|---------|--------|-------------|
| `events.ts` | `/src/data/events.ts` | Données des événements (concerts, expositions, etc.) |
| `locations.ts` | `/src/data/locations.ts` | Données des lieux (coordonnées, descriptions) |
| `team.ts` | `/src/data/team.ts` | Informations sur les membres de l'équipe |
| `presentation.ts` | `/src/data/presentation.ts` | Textes de présentation pour l'exposition collective |

## Flux de Navigation

1. **Entrée dans l'application**:
   - Première visite → `Onboarding` → `Map`
   - Visites suivantes → `Map`

2. **Navigation principale** (via `BottomNavigation`):
   - `Map` ↔ `Program` ↔ `SavedEvents` ↔ `Donate` ↔ `About`

3. **Détails d'un événement**:
   - Depuis `Map` → `EventDetails` (modal)
   - Depuis `Program` → `EventDetails` (modal)
   - Depuis `SavedEvents` → `EventDetails` (modal)

4. **Détails d'un lieu**:
   - Depuis `Map` → Vue détaillée du lieu (dans la même page)
   - Depuis la vue détaillée → `LocationHistory` (page séparée)

## Optimisations Mobile

Les composants suivants ont été optimisés pour l'affichage mobile:
- `EventDetails` - Défilement vertical et boutons adaptés
- `Map` - Vue détaillée des lieux avec défilement
- `About` - Affichage responsive des membres de l'équipe
- `Donate` - Prévention du défilement horizontal

## Recherche de Code

Pour retrouver rapidement un composant ou une fonctionnalité:
1. Consultez ce document pour identifier le fichier concerné
2. Utilisez la recherche dans le code avec des termes spécifiques
3. Les composants principaux sont documentés avec des commentaires JSDoc

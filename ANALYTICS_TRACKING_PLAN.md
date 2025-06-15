# Plan de Tracking Analytics - Collectif Île Feydeau

Ce document détaille le plan complet d'implémentation de Firebase Analytics dans l'application du Collectif Île Feydeau. Il sert de référence pour tous les développeurs travaillant sur le projet.

## Architecture générale

L'application utilise Firebase Analytics pour suivre les interactions utilisateur à travers un service centralisé (`firebaseAnalytics.ts`) et un hook React (`useAnalytics`).

### Composants principaux
- **Service Firebase Analytics** : Initialisation et méthodes de tracking
- **Hook useAnalytics** : Accès simplifié aux fonctions de tracking dans les composants React
- **Fonctions de tracking spécialisées** : Pour différents types d'événements (navigation, média, erreurs, etc.)

## Événements par page/composant

### Map.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'map'`
- **Interactions avec les marqueurs** : 
  - `map_marker_click` (id_marqueur, nom_marqueur)
  - `map_marker_details_view` (id_marqueur, nom_marqueur)
- **Filtres et recherche** :
  - `map_filter_used` (type_filtre, valeur_filtre)
  - `map_search_performed` (terme_recherche, nb_resultats)
- **Géolocalisation** :
  - `map_geolocation_status` (status: 'enabled', 'denied', 'unavailable')
  - `map_user_location_shown` (precision)

### Program.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'program'`
- **Détails d'événements** : 
  - `program_event_details_view` (id_evenement, nom_evenement, categorie)
- **Sauvegarde d'événements** :
  - `program_event_saved` (id_evenement, nom_evenement)
  - `program_event_unsaved` (id_evenement, nom_evenement)
- **Filtres** :
  - `program_filter_used` (type_filtre: 'date', 'category', etc., valeur_filtre)

### SavedEvents.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'saved'`
- **Interactions** :
  - `saved_event_viewed` (id_evenement, nom_evenement)
  - `saved_event_removed` (id_evenement, nom_evenement)
  - `saved_events_count` (nombre_evenements)

### CommunityGallery.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'community'`
- **Interactions photos** :
  - `community_photo_viewed` (id_photo, auteur)
  - `community_photo_liked` (id_photo, auteur)
  - `community_photo_shared` (id_photo, plateforme_partage)
- **Upload** (si disponible) :
  - `community_photo_upload_start` (taille_fichier, type_fichier)
  - `community_photo_upload_complete` (id_photo, temps_upload)
  - `community_photo_upload_error` (code_erreur, message_erreur)

### HistoricalGallery.tsx
- **Vues de page** : `historical_gallery_opened`
- **Interactions photos** :
  - `historical_photo_viewed` (id_photo, index)
  - `historical_fullscreen_toggled` (status: 'entered', 'exited')
  - `historical_gallery_navigation` (direction: 'next', 'previous', index_photo)

### About.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'about'`
- **Liens externes** :
  - `about_external_link_click` (url, nom_lien)
- **Sections consultées** :
  - `about_section_viewed` (nom_section)

### Donate.tsx
- **Vues de page** : `navigation_page_view` avec paramètre `page_name: 'donate'`
- **Interactions** :
  - `donate_button_click` (montant, methode_paiement)
  - `donate_process_started` (montant)
  - `donate_process_completed` (montant, methode_paiement)
  - `donate_process_abandoned` (etape_abandon, montant)

### Analytics.tsx
- **Vues de page** : `analytics_dashboard` via `analytics.trackFeatureUse`
- **Interactions** :
  - `analytics_export` via `analytics.trackFeatureUse`

### Onboarding.tsx
- **Progression** :
  - `onboarding_slide_view` (slide_index, slide_name)
  - `onboarding_skip` (from_slide_index)
  - `onboarding_complete`
- **Vidéo** :
  - `media_interaction` (type: 'video', action: 'play', media_id, media_name)
  - `media_interaction` (type: 'video', action: 'pause', media_id, media_name, current_time)
  - `media_interaction` (type: 'video', action: 'ended', media_id, media_name, duration)
- **Navigation** :
  - `swipe` (direction: 'left'|'right', from_slide, to_slide)

## Fonctionnalités générales

### Navigation
- **Changements de page** : `navigation_page_view` (automatique via useAnalytics)
- **Navigation par gestes** : `navigation_swipe` (direction, page_source, page_destination)
- **Menu de navigation** : `navigation_menu_item_click` (item_name)

### Média
- **Vidéo** :
  - `media_interaction` (type: 'video', action: 'play'|'pause'|'ended', media_id, media_name)
- **Audio** :
  - `media_interaction` (type: 'audio', action: 'play'|'pause'|'ended', media_id, media_name)

### Erreurs
- **Erreurs applicatives** : `error_occurred` (code_erreur, message, composant)
- **Erreurs réseau** : `network_error` (url, code_http, message)
- **Erreurs utilisateur** : `user_error` (type_erreur, message, action_utilisateur)

### Performance
- **Temps de chargement** : `performance_timing` (composant, temps_ms)
- **Mémoire** : `performance_memory` (usage_mb)
- **Mode hors-ligne** : `offline_mode_activated` (raison)

### Utilisateur
- **Préférences** : `user_preference_changed` (preference, valeur)
- **Succès/Achievements** : `achievement_unlocked` (id_achievement, nom)
- **Sessions** : 
  - `session_start` (timestamp, device_info)
  - `session_end` (duree_session, pages_visitees)

## Bonnes pratiques d'implémentation

1. **Utiliser le hook useAnalytics** dans chaque composant :
   ```typescript
   const analytics = useAnalytics();
   
   // Dans useEffect pour les vues de page (automatique)
   // Pour les interactions utilisateur
   const handleClick = () => {
     analytics.trackEvent('button_click', { button_name: 'submit' });
   };
   ```

2. **Catégoriser les événements** pour faciliter l'analyse :
   - navigation
   - interaction
   - media
   - error
   - performance
   - user
   - onboarding
   - feature

3. **Standardiser les noms d'événements** :
   - Utiliser des noms descriptifs en snake_case
   - Format : `[categorie]_[action]` (ex: `map_marker_click`)
   - Éviter les noms trop génériques

4. **Paramètres d'événements** :
   - Toujours inclure des paramètres pertinents
   - Inclure des timestamps pour les événements importants
   - Limiter à 25 paramètres maximum (limite Firebase)

5. **Suivi des conversions** :
   - Définir des événements de conversion clés (ex: `onboarding_complete`, `donate_process_completed`)
   - Configurer ces événements comme conversions dans Firebase

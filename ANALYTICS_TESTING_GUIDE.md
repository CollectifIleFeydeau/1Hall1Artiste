# Guide de test de Firebase Analytics

Ce document explique comment tester et vérifier que l'intégration de Firebase Analytics fonctionne correctement dans l'application du Collectif Île Feydeau.

## Prérequis

1. Avoir accès au projet Firebase (console Firebase)
2. Avoir l'application en cours d'exécution (mode développement)

## Étapes de vérification

### 1. Vérifier l'initialisation de Firebase

L'initialisation de Firebase Analytics devrait se produire au démarrage de l'application. Pour vérifier que cela fonctionne :

```bash
# Lancer l'application en mode développement avec la console ouverte
npm start
```

Dans la console du navigateur, vous devriez voir des messages de log indiquant que Firebase a été initialisé avec succès.

### 2. Tester les événements de navigation

1. Naviguez entre différentes pages de l'application
2. Chaque navigation devrait déclencher un événement `navigation_page_view`
3. Vérifiez dans la console du navigateur (si les logs de développement sont activés) ou dans la console Firebase

### 3. Tester les événements spécifiques

#### Test de l'Onboarding

1. Accédez à la page d'onboarding
2. Jouez la vidéo et vérifiez les événements `media_interaction` avec action 'play'
3. Mettez la vidéo en pause et vérifiez les événements `media_interaction` avec action 'pause'
4. Laissez la vidéo se terminer et vérifiez les événements `media_interaction` avec action 'ended'
5. Naviguez entre les slides et vérifiez les événements `onboarding_slide_view`
6. Terminez l'onboarding et vérifiez l'événement `onboarding_complete`

#### Test de la galerie historique

1. Accédez à la galerie historique
2. Vérifiez l'événement `historical_gallery_opened`
3. Visualisez différentes photos et vérifiez les événements `historical_photo_viewed`
4. Activez le mode plein écran et vérifiez l'événement `historical_fullscreen_toggled`

### 4. Vérification dans la console Firebase

Pour vérifier que les événements sont bien enregistrés dans Firebase :

1. Connectez-vous à la [console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur "Analytics"
4. Allez dans "DebugView" pour voir les événements en temps réel (pendant le développement)
5. Ou consultez "Events" pour voir les événements agrégés

> **Note** : Il peut y avoir un délai de quelques minutes avant que les événements n'apparaissent dans la console Firebase.

### 5. Activer le mode Debug pour Firebase Analytics

Pour un débogage plus précis, vous pouvez activer le mode Debug de Firebase Analytics :

#### Dans l'application :
1. Accédez à la route `/#/debug-analytics` pour ouvrir le débogueur
2. Utilisez les boutons pour envoyer des événements de test
3. Activez le mode debug Firebase ou gtag selon vos besoins
4. Vérifiez les événements dans la console Firebase DebugView

#### Via URL :
Ajoutez les paramètres suivants à l'URL :
- `firebase_debug=true` - Active le mode debug Firebase
- `debug_mode=true` - Active le mode debug général
- `gtm_debug=x` - Active le mode debug Google Tag Manager

#### Sur Chrome :
1. Installez l'extension "Google Analytics Debugger"
2. Activez l'extension
3. Rechargez votre application

#### Sur Android :
```bash
adb shell setprop debug.firebase.analytics.app com.votreapp.package
```

#### Sur iOS :
Ajoutez `-FIRDebugEnabled` comme argument de lancement dans Xcode.

## Résolution des problèmes courants

### Les événements n'apparaissent pas dans la console Firebase

- Vérifiez que Firebase est correctement initialisé
- Assurez-vous que le bon ID de projet Firebase est utilisé
- Vérifiez qu'il n'y a pas d'erreurs dans la console du navigateur
- Attendez quelques minutes (délai de traitement Firebase)

### Erreurs dans la console du navigateur

- Vérifiez que toutes les dépendances Firebase sont installées
- Assurez-vous que la configuration Firebase est correcte
- Vérifiez que les appels aux méthodes de tracking sont corrects

## Validation complète

Pour valider complètement l'intégration, créez un parcours de test qui couvre tous les événements définis dans le plan de tracking. Documentez les résultats et assurez-vous que chaque événement est correctement enregistré avec ses paramètres.

## Outils de débogage intégrés

### AnalyticsDebugger

L'application intègre un outil de débogage accessible via la route `/#/debug-analytics`. Cet outil permet de :

- Envoyer manuellement des événements de test
- Activer/désactiver les différents modes de débogage
- Ajouter les paramètres de débogage à l'URL
- Exécuter des diagnostics sur la configuration Firebase
- Visualiser les logs des événements envoyés

### Utilitaire de diagnostic

L'utilitaire `analytics-diagnostics.ts` vérifie :

- Le support de Firebase Analytics dans l'environnement
- L'initialisation et la validité de la configuration Firebase
- La présence des paramètres de débogage dans l'URL
- Le statut de la collecte de données
- La disponibilité de `window.gtag`
- Les bloqueurs potentiels (bloqueurs de publicités, restrictions de cookies, etc.)

### Utilitaire force-sender

L'utilitaire `analytics-force-sender.ts` permet de forcer l'envoi d'événements via plusieurs canaux :

- Firebase Analytics SDK (`logEvent`)
- Service AnalyticsService via `trackEvent`
- Appel direct à gtag
- Google Tag Manager via `dataLayer`
- LocalStorage pour le débogage

## Outils externes utiles

- [Firebase Analytics Debugview](https://console.firebase.google.com/project/_/analytics/debugview)
- [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-by-google/kejbdjndbnbjgmefkgdddjlbokphdefk)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

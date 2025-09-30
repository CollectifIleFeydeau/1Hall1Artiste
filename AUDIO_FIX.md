# Correction du système audio en production

## Problèmes identifiés (30/09/2025)

### 1. Bouton "Ambiance" non fonctionnel
**Symptôme** : Le bouton "Ambiance" sur la page `/map` affichait uniquement un toast "Fonctionnalité à venir" au lieu d'activer le son d'ambiance.

**Cause** : Le bouton n'utilisait pas le composant `AudioActivator` existant qui gère le son d'ambiance (`Port-marchand.mp3`).

**Solution** : Remplacement du bouton basique par le composant `<AudioActivator />` avec callbacks analytics.

### 2. Audio guides non fonctionnels en production
**Symptôme** : Les boutons "Audio guide" dans les fiches de bâtiments ne jouaient pas les fichiers audio en production (GitHub Pages).

**Cause** : 
- Création d'un élément `<audio>` basique sans gestion des chemins de production
- Les chemins audio n'étaient pas préfixés avec `/1Hall1Artiste` pour GitHub Pages
- Pas d'utilisation du service `audioGuideService` robuste

**Solution** : 
- Utilisation du service `audioGuideService.play()` avec gestion d'erreurs
- Détection de l'environnement et préfixage des chemins audio
- Ajout d'analytics pour tracker l'utilisation

## Fichiers modifiés

### 1. `src/pages/Map.tsx`
**Changement** : Remplacement du bouton "Ambiance" par le composant `AudioActivator`

```tsx
// Avant
<button onClick={() => toast({ title: "Ambiance", description: "Fonctionnalité à venir..." })}>
  Ambiance
</button>

// Après
<AudioActivator 
  onAudioEnabled={() => {
    analytics.trackFeatureUse('ambiance_toggle', { enabled: true });
    logger.info('Son d\'ambiance activé');
  }}
  onAudioDisabled={() => {
    analytics.trackFeatureUse('ambiance_toggle', { enabled: false });
    logger.info('Son d\'ambiance désactivé');
  }}
/>
```

### 2. `src/components/LocationDetailsModern.tsx`
**Changements** :
- Import du service `audioGuideService`
- Gestion des chemins audio pour production
- Utilisation du service robuste avec gestion d'erreurs

```tsx
// Avant
<button onClick={() => {
  const audio = new Audio(location.audio);
  audio.play().catch(console.error);
}}>
  Audio guide
</button>

// Après
<button onClick={() => {
  const audioPath = window.location.hostname.includes('github.io')
    ? `/1Hall1Artiste${location.audio}`
    : location.audio;
  
  audioGuideService.play(audioPath, location.name).catch(error => {
    console.error('Erreur lors de la lecture de l\'audio guide:', error);
  });
  
  analytics.trackFeatureUse('audio_guide_play', { 
    location_id: location.id,
    location_name: location.name 
  });
}}>
  Audio guide
</button>
```

## Fichiers audio disponibles

### Son d'ambiance
- `/audio/Port-marchand.mp3` (5.7 MB) - Son d'ambiance du port marchand

### Audio guides des bâtiments
- `/audio/4-cours-Olivier-de-Clisson.mp3` - Maison Jules Verne
- `/audio/8-quai-turenne.mp3` - 8 Quai Turenne
- `/audio/9-quai-Turenne.mp3` - 9 Quai Turenne
- `/audio/10-quai-Turenne.mp3` - 10 Quai Turenne
- `/audio/11-allee-duguay-trouin.mp3` - 11 Allée Duguay-Trouin
- `/audio/15-allee-duguay-trouin.mp3` - 15 Allée Duguay-Trouin
- `/audio/16-allee-duguay-trouin.mp3` - 16 Allée Duguay-Trouin
- `/audio/17-rue-Kervegan.mp3` - 17 Rue Kervégan
- `/audio/32-rue-kervegan.mp3` - 32 Rue Kervégan
- `/audio/rue-duguayclin.mp3` - Rue Duguay-Clin

## Services utilisés

### AudioActivator
- Composant React pour le son d'ambiance
- Gère l'état global de l'audio entre les pages
- Sauvegarde la préférence utilisateur dans localStorage
- Détection automatique de l'environnement (dev/prod)

### audioGuideService
- Service singleton pour les audio guides
- Gestion robuste des erreurs (MEMORY[18144355])
- Timeout de 10 secondes
- Cleanup automatique des ressources
- Event listeners complets pour tous les états audio

## Tests à effectuer

1. **Son d'ambiance** :
   - [ ] Cliquer sur "Ambiance" sur la page `/map`
   - [ ] Vérifier que le son démarre
   - [ ] Vérifier que le bouton change d'état (actif/inactif)
   - [ ] Naviguer vers une autre page et revenir
   - [ ] Vérifier que l'état est conservé

2. **Audio guides** :
   - [ ] Ouvrir une fiche de bâtiment avec audio
   - [ ] Cliquer sur "Audio guide"
   - [ ] Vérifier que l'audio démarre
   - [ ] Ouvrir une autre fiche pendant la lecture
   - [ ] Vérifier que le premier audio s'arrête

3. **Production (GitHub Pages)** :
   - [ ] Tester sur `collectifilefeydeau.github.io/1Hall1Artiste`
   - [ ] Vérifier les chemins audio avec DevTools Network
   - [ ] Confirmer que les fichiers se chargent (pas de 404)

## Références

- MEMORY[18144355] : Corrections audio critiques précédentes
- MEMORY[9f2f5a01] : Audit proactif des vulnérabilités
- Service `audioGuideService.ts` : Gestion robuste des audio guides
- Composant `AudioActivator.tsx` : Gestion du son d'ambiance

## Status

✅ **CORRIGÉ** - Prêt pour déploiement et test en production

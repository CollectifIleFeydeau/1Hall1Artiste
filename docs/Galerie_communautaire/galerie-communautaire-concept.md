# Galerie Communautaire Interactive - Concept et Implémentation

## Concept global

Une plateforme intégrée permettant aux visiteurs de partager leurs expériences des événements du Collectif Feydeau à travers des photos et témoignages, sans barrière d'authentification, créant ainsi une mémoire collective visuelle et narrative de l'île.

## Architecture technique

### Stockage des données sur GitHub Pages

GitHub Pages étant un service d'hébergement statique, nous utiliserons les approches suivantes pour simuler une base de données dynamique:

#### 1. Stockage JSON + Actions GitHub

**Principe:**
- Utiliser des fichiers JSON comme "base de données" statique
- Mettre en place un workflow GitHub Actions qui:
  - Reçoit les nouvelles contributions via une API basée sur GitHub
  - Met à jour les fichiers JSON
  - Déclenche un nouveau déploiement

**Structure:**
```
/data/
  community-content.json     # Contient toutes les contributions
  featured-content.json      # Contient les contenus mis en avant
```

{{ ... }}

### Implémentation via GitHub Actions

```typescript
// Fonction GitHub Actions pour la modération simplifiée
export async function moderateContent(content, imageUrl) {
  try {
    let isApproved = true;
    let reason = '';
    
    if (content) {
      // Modération de texte par mots-clés
      const forbiddenWords = ['mot1', 'mot2', 'mot3']; // Liste à compléter
      
      const containsForbiddenWord = forbiddenWords.some(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsForbiddenWord) {
        isApproved = false;
        reason = 'Le texte contient des mots inappropriés';
      }
    } 
    else if (imageUrl) {
      // Pour les images, on approuve automatiquement
      // La modération manuelle se fera par la suite
      isApproved = true;
    }
    
    return {
      status: isApproved ? 'approved' : 'rejected',
      reason: reason
    };
  } catch (error) {
    console.error('Erreur de modération:', error);
    return { status: 'pending', reason: 'Erreur technique' };
  }
}
```

{{ ... }}

## État d'avancement de l'implémentation (Mise à jour : 12/06/2025)

### Fonctionnalités implémentées 

1. **Interface utilisateur**
   - Page principale de la galerie communautaire avec onglets "Galerie" et "Contribuer"
   - Affichage des entrées en grille avec filtres par type (photos/témoignages)
   - Vue détaillée des entrées avec informations complètes
   - Formulaire de contribution pour photos et témoignages
   - Intégration du menu de navigation du bas

2. **Gestion des données**
   - Stockage local des contributions via localStorage en mode développement
   - Persistance des images en base64 dans localStorage
   - Système de likes avec stockage local des entrées aimées
   - Service communityService entièrement mis à jour pour utiliser l'API GitHub en production

3. **Backend et API GitHub**
   - Workflow GitHub Actions complet pour la soumission, récupération et modération des contributions
   - Workflow GitHub Actions pour traiter automatiquement les contributions en attente (toutes les 6 heures ou sur déclenchement manuel)
   - Stockage des images optimisées sur GitHub via commits automatisés
   - Système de tokens d'authentification pour sécuriser les accès API

{{ ... }}

### Problèmes résolus récemment 

- Mise en place complète du workflow GitHub Actions pour la gestion des contributions
- Implémentation du workflow GitHub Actions pour le traitement automatique des contributions
- Intégration du service communityService avec l'API GitHub
- Correction des erreurs TypeScript dans les types et interfaces
- Configuration de GitHub Pages pour le déploiement continu
- Correction de la redirection depuis le bouton "Partager un souvenir" dans EventDetails.tsx (12/06/2025)
- Amélioration de la gestion des images dans localStorage (12/06/2025)

{{ ... }}

## Annexes : historique de développement et synthèse

## Résumé de la conversation et de l'implémentation (Juin 2025)

La fonctionnalité de galerie communautaire interactive a été développée en suivant les étapes ci-dessous, en s'appuyant sur une architecture React/Vite (frontend), GitHub Actions (traitement des contributions et stockage sur GitHub Pages).

### 1. Mise en place initiale & tests
- Frontend React/Vite, backend GitHub Actions, workflow GitHub.
- Stockage localStorage fonctionnel, mais les appels API et GitHub Actions non déclenchés en mode dev.

### 2. Basculer en mode API en dev
- Ajout du flag `VITE_USE_API` pour forcer l'utilisation de l'API en dev.
- Adaptation de `communityService.ts` pour respecter ce flag.

### 3. Dépendances & configuration
- Résolution des conflits de lockfile, installation des dépendances manquantes.
- Configuration des ports et création de `.env.local`.

### 4. Debug des fonctions GitHub Actions
- Problèmes avec les modules ES/CJS.
- Adaptation du code pour fonctionner avec GitHub Actions.

{{ ... }}

### 7. Prêt pour la production
- Ajout d'une logique dans les workflows GitHub Actions pour simuler le succès en dev (pas de token GitHub) et utiliser l'API GitHub en prod.
- Création de `public/data/pending-contributions.json` pour éviter les 404 à la première contribution.
- Commit et push de tous les changements sur GitHub.

{{ ... }}

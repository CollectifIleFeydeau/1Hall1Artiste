# Assets et Éléments Manquants - UI Redesign

## 🖼️ Images d'Événements Requises

### Structure de dossiers recommandée :
```
public/
├── events/
│   ├── concerts/
│   │   ├── clarine-julienne.jpg
│   │   ├── aperto.jpg
│   │   ├── quatuor-liger.jpg
│   │   ├── ensemble-vocal-eva.jpg
│   │   ├── variabilis.jpg
│   │   └── semaphore-omega.jpg
│   ├── expositions/
│   │   ├── bruno-barbier.jpg
│   │   ├── alain-gremillet.jpg
│   │   ├── jerome-gourdon.jpg
│   │   ├── nadege-hameau.jpg
│   │   ├── pauline-crusson.jpg
│   │   ├── marie-husson.jpg
│   │   ├── clotilde-debar-zablocki.jpg
│   │   ├── malou-tual.jpg
│   │   ├── gael-caudoux.jpg
│   │   ├── atelier-norg.jpg
│   │   ├── jerome-luneau.jpg
│   │   ├── andry-shango-rajoelina.jpg
│   │   ├── jocelyn-prouff.jpg
│   │   ├── emmanuelle-boisson.jpg
│   │   ├── catherine-clement.jpg
│   │   ├── mostapha-rouine.jpg
│   │   ├── elizaveta-vodyanova.jpg
│   │   └── fabienne-choyau.jpg
│   └── defaults/
│       ├── concert-default.jpg
│       ├── exposition-default.jpg
│       └── placeholder.jpg
```

### Spécifications techniques des images :

#### Images d'événements principales :
- **Format** : JPG (optimisé) ou WebP
- **Dimensions** : 300x300px (ratio 1:1 carré)
- **Poids** : < 30KB par image
- **Qualité** : 80-85% (balance qualité/poids)
- **Nommage** : `nom-artiste-slug.jpg` (minuscules, tirets)
- **Source prioritaire** : Instagram des artistes

#### Éléments décoratifs **NOUVEAUX** :
- **Pinceaux (expositions)** : SVG transparent 60x60px, opacité 25%
- **Notes de musique (concerts)** : SVG transparent 60x60px, opacité 25%
- **Motifs de fond de page** : Pattern SVG répétable, couleur #f8f4f0
- **Textures de cards** : CSS gradients subtils ou images 1x1px répétables
{{ ... }}
### Variables CSS à ajouter :
```css
/* Nouvelles couleurs basées sur la maquette */
:root {
  /* Fonds */
  --bg-page: #f5f4f0;
  --bg-card: #ffffff;
  --bg-card-hover: #f8f9fa;
  
  /* Bordures */
  --border-light: #e9ecef;
  --border-medium: #dee2e6;
  
  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.1);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.15);
  --shadow-hover: 0 8px 24px rgba(0,0,0,0.2);
  
  /* Rayons de bordure */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Espacements */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typographie */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

### Classes utilitaires à créer :
```css
/* Cards */
.card-modern {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.card-modern:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

/* Badges de catégorie */
.badge-concert {
  background: var(--orange-primary);
  color: white;
}

.badge-exposition {
  background: var(--blue-primary);
  color: white;
}

/* Onglets */
.tab-active {
  background: var(--blue-primary);
  color: white;
}

.tab-inactive {
  background: transparent;
  color: var(--text-secondary);
}
```

## 🔧 Composants à Développer

### 1. ImageWithFallback Component
**Fichier** : `src/components/ui/ImageWithFallback.tsx`

**Fonctionnalités** :
- Chargement progressif des images
- Fallback automatique si image manquante
- Placeholder pendant le chargement
- Support WebP avec fallback JPG
- Lazy loading intégré

### 2. EventImage Component  
**Fichier** : `src/components/EventImage.tsx`

**Fonctionnalités** :
- Gestion spécifique des images d'événements
- Fallback par type (concert/exposition)
- Optimisation automatique
- Alt text généré automatiquement

### 3. CategoryBadge Component
**Fichier** : `src/components/ui/CategoryBadge.tsx`

**Fonctionnalités** :
- Badge coloré par catégorie
- Icône intégrée
- Variantes de taille
- Animation hover

### 4. TabNavigation Component
**Fichier** : `src/components/ui/TabNavigation.tsx`

**Fonctionnalités** :
- Navigation par onglets réutilisable
- Animation de transition
- Support clavier
- Indicateur d'onglet actif

## 📱 Adaptations Mobile Spécifiques

### Breakpoints à définir :
```css
/* Mobile first approach */
:root {
  --mobile-sm: 320px;
  --mobile-md: 375px;
  --mobile-lg: 414px;
  --tablet: 768px;
  --desktop: 1024px;
  --desktop-lg: 1440px;
}
```

### Adaptations EventCard mobile :
- Image ratio ajusté pour mobile
- Texte plus grand pour lisibilité
- Boutons plus espacés (44px minimum)
- Gestures touch optimisés

### Navigation mobile :
- Bottom navigation conservée
- Onglets avec scroll horizontal si nécessaire
- Animations optimisées pour mobile

## 🎯 Contenu Manquant

### Textes et descriptions :
- [ ] **Descriptions courtes** pour les cards (50-80 caractères)
- [ ] **Descriptions longues** pour les détails (200-300 mots)
- [ ] **Alt text** pour toutes les images
- [ ] **Métadonnées SEO** pour chaque événement

### Informations événements :
- [ ] **Durée** des événements (si applicable)
- [ ] **Prix** ou "Gratuit" 
- [ ] **Niveau de difficulté** (si applicable)
- [ ] **Tags/mots-clés** pour filtrage avancé

## 🔍 Optimisations Performance

### Images :
- [ ] **Compression** : Utiliser imagemin ou équivalent
- [ ] **Formats modernes** : WebP avec fallback JPG
- [ ] **Lazy loading** : Intersection Observer API
- [ ] **Responsive images** : srcset pour différentes tailles

### CSS :
- [ ] **Critical CSS** : Inline pour le above-the-fold
- [ ] **CSS splitting** : Par composant si nécessaire
- [ ] **Purge CSS** : Supprimer les styles inutilisés

### JavaScript :
- [ ] **Code splitting** : Lazy loading des composants
- [ ] **Bundle analysis** : Vérifier la taille des bundles
- [ ] **Tree shaking** : Éliminer le code mort

## 🧪 Assets de Test

### Images de test :
- [ ] **Images de différentes tailles** pour tester la responsivité
- [ ] **Images corrompues** pour tester les fallbacks
- [ ] **Images très lourdes** pour tester le lazy loading
- [ ] **Images avec ratios différents** pour tester l'adaptation

### Données de test :
- [ ] **Événements sans image** pour tester les fallbacks
- [ ] **Titres très longs** pour tester la troncature
- [ ] **Descriptions vides** pour tester les cas limites
- [ ] **Nombreux événements** pour tester les performances

## 📋 Checklist de Validation

### Avant développement :
- [ ] Toutes les images d'événements fournies
- [ ] Images de fallback créées
- [ ] Variables CSS définies
- [ ] Spécifications validées

### Pendant développement :
- [ ] Tests sur différents appareils
- [ ] Validation des performances
- [ ] Tests d'accessibilité
- [ ] Validation cross-browser

### Après développement :
- [ ] Audit Lighthouse complet
- [ ] Tests utilisateur
- [ ] Validation finale du design
- [ ] Documentation mise à jour

## 🚀 Priorisation des Assets

### Priorité HAUTE (bloquant) :
1. **Images de fallback** (concert-default.jpg, exposition-default.jpg)
2. **Variables CSS** du design system
3. **Images des événements principaux** (5-10 événements phares)

### Priorité MOYENNE :
1. **Images de tous les événements**
2. **Composants UI réutilisables**
3. **Optimisations performance**

### Priorité BASSE :
1. **Images WebP/AVIF**
2. **Animations avancées**
3. **Features expérimentales**

## 💡 Recommandations

### Pour les images :
- Commencer avec des images de qualité moyenne pour les tests
- Optimiser progressivement selon les retours
- Prévoir un système de gestion d'assets à long terme

### Pour le développement :
- Implémenter d'abord les fallbacks
- Tester sur mobile en priorité
- Valider l'accessibilité à chaque étape

### Pour la maintenance :
- Documenter le processus d'ajout d'images
- Créer des scripts d'optimisation automatique
- Prévoir la montée en charge des assets

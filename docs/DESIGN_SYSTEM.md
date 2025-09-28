# 🎨 DESIGN SYSTEM UNIFIÉ - COLLECTIF ÎLE FEYDEAU

## 📋 **SOMMAIRE**
1. [🎨 Guide de style](#-guide-de-style)
   - [Boutons d'interface](#-boutons-dinterface)
   - [Typographie](#-typographie)
   - [Couleurs](#-palette-de-couleurs)
2. [🔧 Variables CSS & Classes](#-variables-css--classes)
   - [Variables de design](#variables-de-design)
   - [Classes utilitaires](#classes-utilitaires)
3. [🧩 Composants](#-composants)
   - [Composants existants](#composants-existants)
   - [Composants à développer](#composants-à-développer)
4. [📱 Responsive & Mobile](#-responsive--mobile)
5. [🔍 Accessibilité](#-accessibilité)
6. [🖼️ Assets & Images](#-assets--images)
7. [📐 Règles d'implémentation](#-règles-dimplémentation)

---

## 🎨 **GUIDE DE STYLE**

### 🎯 **Boutons d'interface**

#### Styles de base
```css
/* Boutons d'icône inactifs */
.btn-icon {
  @apply w-10 h-10 flex items-center justify-center rounded-full
         border-2 bg-white/70 border-gray-300 text-gray-600
         hover:border-amber-500 hover:text-amber-500
         transition-colors duration-200;
}

/* Boutons d'icône actifs */
.btn-icon-active {
  @apply bg-amber-50 border-amber-500 text-amber-600;
}

/* Variantes spéciales */
.btn-like-active {
  @apply bg-red-50 border-red-500 text-red-500;
}

.btn-save-active {
  @apply bg-amber-50 border-amber-500 text-amber-600;
}
```

#### Tailles standardisées
| Type | Taille | Usage |
|------|--------|-------|
| Normal | `w-10 h-10` | Headers, modaux |
| Compact | `w-8 h-8` | Espace limité |
| Grand | `w-12 h-12` | Actions principales |
| Icônes | `h-5 w-5` | Pour boutons de 10x10 |

#### Règles d'utilisation
- ✅ Utiliser les composants partagés (`LikeButton`, `ShareButton`)
- ❌ Ne pas créer de boutons personnalisés sans validation
- 🎨 Couleur de survol : `hover:border-amber-500 hover:text-amber-500`
- ⚡ Transition : `transition-colors duration-200`

### ✒️ **Typographie**
- **Titres** : `font-serif text-2xl font-bold text-[#1a2138]`
- **Sous-titres** : `text-sm text-amber-700`
- **Corps de texte** : `text-base text-gray-700`
- **Texte secondaire** : `text-sm text-gray-500`

### 🎨 **Palette de couleurs**
| Utilisation | Couleur | Classe |
|-------------|---------|--------|
| Primaire | Bleu foncé | `#1a2138` |
| Secondaire | Ambre | `#f59e0b` |
| Succès | Vert | `#10b981` |
| Avertissement | Orange | `#f59e0b` |
| Erreur | Rouge | `#ef4444` |
| Texte principal | Gris foncé | `#1f2937` |
| Texte secondaire | Gris | `#6b7280` |

---

## 🔧 **VARIABLES CSS & CLASSES**

### Variables de design
```css
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

### Classes utilitaires

#### Cards
```css
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
```

#### Badges de catégorie
```css
.badge-concert {
  background: var(--orange-primary);
  color: white;
}

.badge-exposition {
  background: var(--blue-primary);
  color: white;
}
```

#### Onglets
```css
.tab-active {
  background: var(--blue-primary);
  color: white;
}

.tab-inactive {
  background: transparent;
  color: var(--text-secondary);
}
```

---

## 🧩 **COMPOSANTS**

### Composants existants

#### 🏢 **Fiches Bâtiments**

**Structure recommandée :**
```jsx
<LocationDetailsModern>
  {/* En-tête avec boutons d'action */}
  <Header>
    <Title>Nom du bâtiment</Title>
    <Subtitle>Adresse</Subtitle>
    <ButtonGroup>
      <LikeButton />
      <ShareButton />
      <CloseButton />
    </ButtonGroup>
  </Header>

  {/* Contenu principal */}
  <Content>
    <Section>
      <h3>Description</h3>
      <p>Texte descriptif...</p>
    </Section>

    <Section>
      <h3>Événements à venir</h3>
      <EventList />
    </Section>
  </Content>

  {/* Actions principales */}
  <ActionBar>
    <Button>Histoire</Button>
    <Button>Audio guide</Button>
    <Button>Témoignages</Button>
    <Button variant="secondary">Retour</Button>
  </ActionBar>
</LocationDetailsModern>
```

**Règles de style :**
- **Fond** : `bg-amber-50/95 backdrop-blur-sm`
- **Ombre** : `shadow-2xl`
- **Espacement** : `p-6` (contenu principal)
- **Boutons header** : `w-10 h-10` sans bordure ni fond
- **Boutons d'action** : `h-12 border-2 border-[#1a2138]`

#### 🎭 **Cartes Événements**

**Structure recommandée :**
```jsx
<EventCard>
  <Image src="/events/event.jpg" alt="Événement" />
  <DateBadge>27 SEP</DateBadge>

  <Content>
    <h3>Nom de l'événement</h3>
    <p className="text-sm text-gray-600">Lieu • 18h30</p>

    <Tags>
      <Tag>Concert</Tag>
      <Tag>Gratuit</Tag>
    </Tags>

    <Button>En savoir plus</Button>
  </Content>
</EventCard>
```

### Composants à développer

#### 1. ImageWithFallback Component
**Fichier** : `src/components/ui/ImageWithFallback.tsx`

**Fonctionnalités :**
- Chargement progressif des images
- Fallback automatique si image manquante
- Placeholder pendant le chargement
- Support WebP avec fallback JPG
- Lazy loading intégré

#### 2. EventImage Component
**Fichier** : `src/components/EventImage.tsx`

**Fonctionnalités :**
- Gestion spécifique des images d'événements
- Fallback par type (concert/exposition)
- Optimisation automatique
- Alt text généré automatiquement

#### 3. CategoryBadge Component
**Fichier** : `src/components/ui/CategoryBadge.tsx`

**Fonctionnalités :**
- Badge coloré par catégorie
- Icône intégrée
- Variantes de taille
- Animation hover

#### 4. TabNavigation Component
**Fichier** : `src/components/ui/TabNavigation.tsx`

**Fonctionnalités :**
- Navigation par onglets réutilisable
- Animation de transition
- Support clavier
- Indicateur d'onglet actif

---

## 📱 **RESPONSIVE & MOBILE**

### Points de rupture
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Comportements
- **Mobile** : Pleine largeur, espacement réduit
- **Tablette** : Grille 2 colonnes pour les listes
- **Desktop** : Mise en page complète avec barre latérale

### Breakpoints détaillés
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

### Adaptations mobile spécifiques
- Texte plus grand pour lisibilité
- Boutons plus espacés (44px minimum)
- Gestures touch optimisés

### Navigation mobile :
- Bottom navigation conservée
- Onglets avec scroll horizontal si nécessaire
- Animations optimisées pour mobile

---

## 🔍 **ACCESSIBILITÉ**

### Principes clés
- **Contraste** : Minimum 4.5:1 pour le texte
- **Navigation** : Accessible au clavier (tabindex)
- **ARIA** : Attributs pour les composants interactifs
- **Texte alternatif** : Pour toutes les images
- **Focus visible** : Toujours visible pour la navigation au clavier

### Vérifications
- [ ] Test avec lecteur d'écran
- [ ] Navigation au clavier complète
- [ ] Contraste des couleurs validé
- [ ] Taille de texte adaptable

---

## 🖼️ **ASSETS & IMAGES**

### Structure de dossiers recommandée
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

### Spécifications techniques des images

#### Images d'événements principales
- **Format** : JPG (optimisé) ou WebP
- **Dimensions** : 300x300px (ratio 1:1 carré)
- **Poids** : < 30KB par image
- **Qualité** : 80-85% (balance qualité/poids)
- **Nommage** : `nom-artiste-slug.jpg` (minuscules, tirets)

#### Éléments décoratifs
- **Pinceaux (expositions)** : SVG transparent 60x60px, opacité 25%
- **Notes de musique (concerts)** : SVG transparent 60x60px, opacité 25%
- **Motifs de fond de page** : Pattern SVG répétable, couleur #f8f4f0
- **Textures de cards** : CSS gradients subtils ou images 1x1px répétables

---

## 📐 **RÈGLES D'IMPLÉMENTATION**

### 1. Cohérence visuelle FINALE
- ✅ **Fond parchemin historique** : `bg-amber-50/95 backdrop-blur-sm`
- ✅ **Ombre portée** : `shadow-2xl` pour profondeur
- ✅ **Pas de liseré** sur le modal principal
- ✅ **Sections épurées** : fond gris clair (bg-gray-50) uniquement si nécessaire
- ✅ **Boutons header uniformes** : 40x40px, sans bordure, sans fond, icônes gris foncé

### 2. Cohérence fonctionnelle FINALE
- ✅ **4 boutons header identiques** : Like, Save, Share, Close
- ✅ **Informations pratiques** : Sans fond, avec icônes grises
- ✅ **Actions principales uniformes** : Boutons HTML simples avec styles identiques
- ✅ **Structure 2x2** : Première ligne (actions), deuxième ligne (Témoignage/Retour)
- ✅ **Boutons d'action** : Liseré bleu foncé `border-2 border-[#1a2138]`
- ✅ **Bouton Retour** : Fond bleu `bg-[#1a2138]` comme ailleurs dans l'app

### 3. Cohérence d'interaction FINALE
- ✅ **Transitions fluides** : `transition-colors` sur tous les boutons
- ✅ **Hover cohérent** : Bleu foncé pour actions, bleu plus foncé pour retour
- ✅ **Tooltips uniformes** : Même style et comportement
- ✅ **Fermeture cohérente** : X en haut à droite, bouton Retour en bas

### 4. Système de couleurs
```css
/* Couleurs principales */
--primary-dark: #1a2138      /* Titres, texte important */
--primary-orange: #ff7a45    /* Concerts, actions principales */
--primary-blue: #4a5d94      /* Expositions, éléments secondaires */
--amber-primary: #f59e0b     /* Bordures, accents */
--amber-light: #fef3c7       /* Fonds, highlights */

/* Couleurs fonctionnelles */
--success: #10b981           /* Validations, états positifs */
--warning: #f59e0b           /* Alertes, attention */
--error: #ef4444             /* Erreurs, suppressions */
--gray-text: #6b7280         /* Texte secondaire */
```

### 5. Typographie hiérarchisée
```css
/* Hiérarchie des titres */
.title-primary    { font-size: 1.5rem; font-weight: bold; color: #1a2138; font-family: serif; }
.title-secondary  { font-size: 1.125rem; font-weight: 600; color: #1a2138; }
.subtitle         { font-size: 0.875rem; font-weight: 500; color: #f59e0b; }
.body-text        { font-size: 0.875rem; color: #6b7280; line-height: 1.5; }
.caption          { font-size: 0.75rem; color: #9ca3af; }
```

### 6. Système de boutons
```css
/* Boutons d'action principaux */
.btn-primary      { bg: #1a2138; color: white; border-radius: 9999px; }
.btn-secondary    { bg: #f59e0b; color: white; border-radius: 9999px; }
.btn-outline      { border: 2px solid #1a2138; color: #1a2138; bg: transparent; }

/* Boutons d'icône */
.btn-icon         { width: 40px; height: 40px; border-radius: 50%; }
.btn-icon-active  { bg: #fef3c7; border: 2px solid #f59e0b; color: #f59e0b; }
.btn-icon-inactive{ bg: white/70; border: 2px solid #d1d5db; color: #6b7280; }
```

### 7. Espacement rythmé
```css
/* Système d'espacement cohérent */
.spacing-xs  { margin: 0.5rem; }   /* 8px */
.spacing-sm  { margin: 0.75rem; }  /* 12px */
.spacing-md  { margin: 1rem; }     /* 16px */
.spacing-lg  { margin: 1.5rem; }   /* 24px */
.spacing-xl  { margin: 2rem; }     /* 32px */
.spacing-2xl { margin: 3rem; }     /* 48px */
```

### 8. Layout responsive
```css
/* Grille adaptative */
.layout-mobile   { padding: 1rem; max-width: 100vw; }
.layout-tablet   { padding: 1.5rem; max-width: 90vw; }
.layout-desktop  { padding: 2rem; max-width: 80vw; max-width: 28rem; }
```

---

## 🎯 **STRUCTURES FINALES VALIDÉES**

### **Événements :**
```
┌─────────────────────────────────────┐
│ TITRE ÉVÉNEMENT      [❤️] [🔖] [↗] [✕] │
│ Nom artiste • Type événement        │
├─────────────────────────────────────┤
│ 📅 14h00-19h00, samedi et dimanche │
│ 📍 8 quai Turenne                   │
├─────────────────────────────────────┤
│ Description artiste (sans fond)     │
├─────────────────────────────────────┤
│ Contact & Réseaux (fond gris)       │
│ Photos/Vidéos (fond gris)           │
│ Instagram widget (sans fond)        │
├─────────────────────────────────────┤
│ [Situer]     [Sauver]              │
│ [Témoignage] [Retour]              │
└─────────────────────────────────────┘
```

### **Lieux :**
```
┌─────────────────────────────────────┐
│ NOM DU LIEU          [❤️] [🔖] [↗] [✕] │
│ Île Feydeau, Nantes                 │
├─────────────────────────────────────┤
│ Description du lieu (sans fond)     │
├─────────────────────────────────────┤
│ Événements à cet endroit (fond gris)│
│ • Événement 1            [🔖]      │
│ • Événement 2            [🔖]      │
├─────────────────────────────────────┤
│ [Histoire]   [Audio guide]         │
│ [Témoignage] [Retour]              │
│   │
└─────────────────────────────────────┘
```

---

## ✅ **CHECKLIST DE VALIDATION FINALE**

### **Implémentation terminée :**
- ✅ **EventDetailsModern** : Conforme au design system unifié
- ✅ **LocationDetailsModern** : Conforme au design system unifié
- ✅ **Cohérence visuelle** : Fond parchemin, boutons uniformes
- ✅ **Cohérence fonctionnelle** : Structure 2x2, actions identiques
- ✅ **Boutons uniformisés** : HTML simples avec styles identiques
- ✅ **Responsive design** : Adaptation mobile/desktop
- ✅ **Accessibilité** : Tooltips, contrastes, navigation clavier

### **Prochaines étapes possibles :**
1. **Composants réutilisables** : `ImageWithFallback`, `CategoryBadge`, `TabNavigation`
2. **Optimisations performance** : Lazy loading, WebP, code splitting
3. **Tests utilisateur** : Validation de l'expérience unifiée

---

*Ce document unique contient tout le design system de l'application Collectif Île Feydeau. Il doit être suivi pour maintenir la cohérence visuelle et fonctionnelle de l'application.*

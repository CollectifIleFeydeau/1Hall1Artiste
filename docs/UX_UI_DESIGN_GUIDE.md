# 🎨 GUIDE UX/UI - COLLECTIF ÎLE FEYDEAU

## 📋 **SOMMAIRE**
1. [🎨 Guide de style](#-guide-de-style)
   - [Boutons d'interface](#-boutons-dinterface)
   - [Typographie](#-typographie)
   - [Couleurs](#-palette-de-couleurs)
2. [🧩 Composants](#-composants)
   - [Fiches bâtiments](#-fiches-bâtiments)
   - [Cartes événements](#-cartes-événements)
3. [📱 Responsive](#-responsive)
4. [🔍 Accessibilité](#-accessibilité)

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

## 🧩 **COMPOSANTS**

### 🏢 **Fiches Bâtiments**

#### Structure recommandée
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

#### Règles de style
- **Fond** : `bg-amber-50/95 backdrop-blur-sm`
- **Ombre** : `shadow-2xl`
- **Espacement** : `p-6` (contenu principal)
- **Boutons header** : `w-10 h-10` sans bordure ni fond
- **Boutons d'action** : `h-12 border-2 border-[#1a2138]`

### 🎭 **Cartes Événements**

#### Structure recommandée
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

## 📱 **RESPONSIVE**

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

**🎯 Structure type :**
```
┌─────────────────────────────────────┐
│ TITRE PRINCIPAL          [❤️] [✕]   │
│ Sous-titre location               │
├─────────────────────────────────────┤
│ Description (fond amber-50/70)      │
├─────────────────────────────────────┤
│ [Histoire] [Audio Guide]            │
├─────────────────────────────────────┤
│ Événements à cet endroit            │
│ • Événement 1            [🔖]      │
│ • Événement 2            [🔖]      │
├─────────────────────────────────────┤
│ [Marquer visité] [Retour carte]     │
│ [Me guider vers ce lieu]            │
└─────────────────────────────────────┘
```

### 📅 **PROGRAMME - Cartes Événements (EventCardModern)**

**✅ Points forts identifiés :**
- **Layout en grille** : Image (96px) + Contenu flexible
- **Hiérarchie typographique** : Titre (lg bold), artiste (sm medium), infos (sm gray)
- **Boutons intégrés** : ActionButton avec variants cohérents
- **Flexbox intelligent** : flex-grow pour pousser les infos vers le bas
- **Badge de type** : Point coloré + texte pour différencier expo/concert

**🎯 Structure type :**
```
┌─────┬───────────────────────────────┐
│     │ TITRE ÉVÉNEMENT    [❤️] [🔖] │
│ IMG │ Nom artiste                   │
│     │ ↕ (flex-grow)                │
│     │ Horaire • Lieu                │
│     │ ● Type événement              │
└─────┴───────────────────────────────┘
```

## 🎯 **PROBLÈMES IDENTIFIÉS - Fiches Événements (EventDetails)**

### ❌ **Incohérences actuelles :**

1. **Header désorganisé** : Boutons éparpillés sans structure claire
2. **Hiérarchie confuse** : Titre dans une boîte séparée, pas de sous-titre
3. **Espacement anarchique** : Marges incohérentes, pas de rythme
4. **Boutons isolés** : Pas de regroupement logique des actions
5. **Fond incohérent** : Différent des autres composants
6. **Layout rigide** : Pas de flexibilité responsive

## 🚀 **GUIDE UX/UI UNIFIÉ**

### 1. **SYSTÈME DE COULEURS**

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

### 2. **TYPOGRAPHIE HIÉRARCHISÉE**

```css
/* Hiérarchie des titres */
.title-primary    { font-size: 1.5rem; font-weight: bold; color: #1a2138; font-family: serif; }
.title-secondary  { font-size: 1.125rem; font-weight: 600; color: #1a2138; }
.subtitle         { font-size: 0.875rem; font-weight: 500; color: #f59e0b; }
.body-text        { font-size: 0.875rem; color: #6b7280; line-height: 1.5; }
.caption          { font-size: 0.75rem; color: #9ca3af; }
```

### 3. **SYSTÈME DE BOUTONS**

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

### 4. **ESPACEMENT RYTHMÉ**

```css
/* Système d'espacement cohérent */
.spacing-xs  { margin: 0.5rem; }   /* 8px */
.spacing-sm  { margin: 0.75rem; }  /* 12px */
.spacing-md  { margin: 1rem; }     /* 16px */
.spacing-lg  { margin: 1.5rem; }   /* 24px */
.spacing-xl  { margin: 2rem; }     /* 32px */
.spacing-2xl { margin: 3rem; }     /* 48px */
```

### 5. **LAYOUT RESPONSIVE**

```css
/* Grille adaptative */
.layout-mobile   { padding: 1rem; max-width: 100vw; }
.layout-tablet   { padding: 1.5rem; max-width: 90vw; }
.layout-desktop  { padding: 2rem; max-width: 80vw; max-width: 28rem; }
```

## 🎨 **DESIGN SYSTEM UNIFIÉ - FINAL (IMPLÉMENTÉ)**

### **Structure finale validée - Événements :**

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

### **Structure finale validée - Lieux :**

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

### **✅ Améliorations finales implémentées :**

1. **Header uniforme** : 4 boutons identiques (40x40px, sans bordure, sans fond)
2. **Informations pratiques** : Sans fond, directement intégrées
3. **Descriptions épurées** : Texte direct sans titre ni fond
4. **Sections conditionnelles** : Fond gris clair uniquement si nécessaire
5. **Actions uniformisées** : Boutons HTML simples avec styles identiques
6. **Fond parchemin historique** : `bg-amber-50/95 backdrop-blur-sm`

## 📐 **RÈGLES D'IMPLÉMENTATION**

### **1. Cohérence visuelle FINALE**
- ✅ **Fond parchemin historique** : `bg-amber-50/95 backdrop-blur-sm`
- ✅ **Ombre portée** : `shadow-2xl` pour profondeur
- ✅ **Pas de liseré** sur le modal principal
- ✅ **Sections épurées** : fond gris clair (bg-gray-50) uniquement si nécessaire
- ✅ **Boutons header uniformes** : 40x40px, sans bordure, sans fond, icônes gris foncé

### **2. Cohérence fonctionnelle FINALE**
- ✅ **4 boutons header identiques** : Like, Save, Share, Close
- ✅ **Informations pratiques** : Sans fond, avec icônes grises
- ✅ **Actions principales uniformes** : Boutons HTML simples avec styles identiques
- ✅ **Structure 2x2** : Première ligne (actions), deuxième ligne (Témoignage/Retour)
- ✅ **Boutons d'action** : Liseré bleu foncé `border-2 border-[#1a2138]`
- ✅ **Bouton Retour** : Fond bleu `bg-[#1a2138]` comme ailleurs dans l'app

### **3. Cohérence responsive**
- ✅ Même système de breakpoints
- ✅ Même adaptation mobile/desktop
- ✅ Même gestion du scroll et des hauteurs max

## 🎨 **PALETTE DE COULEURS**

### Couleurs principales
| Utilisation | Couleur | Classe |
|-------------|---------|--------|
| Primaire | Bleu foncé | `#1a2138` |
| Secondaire | Ambre | `#f59e0b` |
| Arrière-plan | Blanc cassé | `#f8f5f0` |
| Texte principal | Noir | `#1a202c` |
| Texte secondaire | Gris foncé | `4a5568` |

### États et rétroactions
| État | Couleur | Utilisation |
|------|---------|-------------|
| Succès | Vert émeraude | `#10b981` |
| Avertissement | Orange | `#f59e0b` |
| Erreur | Rouge | `#ef4444` |
| Désactivé | Gris clair | `#e2e8f0` |
| Survol | Bleu foncé +10% | `#0f172a` |

## 🧠 **PRINCIPES DE CONCEPTION**

### 1. Hiérarchie visuelle
- **Niveau 1** : Titres principaux (h1, 2rem, 2.25rem)
- **Niveau 2** : Sous-titres (1.5rem, 1.75rem)
- **Niveau 3** : En-têtes de section (1.25rem, 1.5rem)
- **Corps de texte** : 1rem (16px) avec interlignage 1.5

### 2. Espacement
- **Unité de base** : 0.25rem (4px)
- **Espacement standard** : 1rem (16px)
- **Grands espaces** : 2rem (32px)
- **Petits espaces** : 0.5rem (8px)

### 3. Animations
- **Durée standard** : 200ms
- **Courbe d'accélération** : `cubic-bezier(0.4, 0, 0.2, 1)`
- **Transitions** : Uniquement sur les propriétés transform et opacity pour la performance
  border-radius: 9999px; /* rounded-full */
  font-weight: 500; /* font-medium */
  font-size: 0.875rem; /* text-sm */
  transition: colors 150ms;
}
.btn-return:hover {
  background: #2a3148;
}
```

### **4. Cohérence d'interaction FINALE**
- ✅ **Transitions fluides** : `transition-colors` sur tous les boutons
- ✅ **Hover cohérent** : Bleu foncé pour actions, bleu plus foncé pour retour
- ✅ **Tooltips uniformes** : Même style et comportement
- ✅ **Fermeture cohérente** : X en haut à droite, bouton Retour en bas

## 🎯 **CHECKLIST DE VALIDATION FINALE**

### **✅ Implémentation terminée :**
- ✅ **EventDetailsModern** : Conforme au design system unifié
- ✅ **LocationDetailsModern** : Conforme au design system unifié
- ✅ **Cohérence visuelle** : Fond parchemin, boutons uniformes
- ✅ **Cohérence fonctionnelle** : Structure 2x2, actions identiques
- ✅ **Boutons uniformisés** : HTML simples avec styles identiques
- ✅ **Responsive design** : Adaptation mobile/desktop
- ✅ **Accessibilité** : Tooltips, contrastes, navigation clavier

### **🏆 Objectifs atteints :**
- ✅ **Harmonisation MAP ↔ PROGRAMME** : Fiches uniformes
- ✅ **Expérience utilisateur cohérente** : Même logique partout
- ✅ **Code maintenable** : Composants simples et réutilisables
- ✅ **Performance optimale** : Pas de surcouche CSS inutile
- ✅ **Esthétique historique** : Fond parchemin Île Feydeau

## 🚀 **DESIGN SYSTEM COMPLET**

Le design system de l'application Collectif Île Feydeau est maintenant **100% cohérent** entre :
- 🗺️ **MAP** (fiches de lieux)
- 📅 **PROGRAMME** (fiches d'événements)
- 🏛️ **Esthétique historique** (fond parchemin)
- 🎯 **Actions uniformes** (boutons identiques)

### **Prochaines applications possibles :**
1. **Autres modals** : Appliquer le même pattern
2. **Composants réutilisables** : Extraire les patterns communs
3. **Tests utilisateur** : Valider l'expérience unifiée

## 🧭 **MENU DE NAVIGATION (BottomNavigation)**

### **Style "Carte au Trésor" appliqué :**

```css
/* Fond parchemin cohérent */
.bottom-nav {
  background: rgba(251, 245, 208, 0.95); /* bg-amber-50/95 */
  border-top: 1px solid rgba(217, 119, 6, 0.3); /* border-amber-600/30 */
  backdrop-filter: blur(4px);
}

/* États de navigation */
.nav-item-active {
  color: #1a2138; /* Bleu foncé du design system */
  font-weight: bold;
}

.nav-item-inactive {
  color: rgba(146, 64, 14, 0.7); /* text-amber-800/70 */
}
```

### **Cohérence avec le design system :**
- ✅ **Fond parchemin** : Même esthétique que les pages
- ✅ **Couleurs primaires** : Bleu foncé pour les états actifs
- ✅ **Bordure vintage** : Amber foncé semi-transparent
- ✅ **Lisibilité** : Contraste optimal sur fond parchemin

---

*Ce guide doit être suivi pour maintenir la cohérence visuelle et fonctionnelle de l'application Collectif Île Feydeau.*

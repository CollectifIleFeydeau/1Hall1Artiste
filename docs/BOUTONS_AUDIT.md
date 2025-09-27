# AUDIT DES BOUTONS D'ICÔNE

## 🎯 **OBJECTIF**
Uniformiser tous les boutons like, save, share, fermer selon le guide UX/UI

## 📋 **STYLE CIBLE** (Guide UX/UI)
```css
/* Boutons d'icône inactifs */
.btn-icon-inactive { 
  bg: white/70; 
  border: 2px solid #d1d5db; 
  color: #6b7280; 
  hover: border-amber-500, text-amber-500 
}

/* Boutons d'icône actifs */
.btn-icon-active { 
  bg: #fef3c7; 
  border: 2px solid #f59e0b; 
  color: #f59e0b; 
}

/* Variantes spéciales */
.btn-like-active { bg: red-50; border: red-500; color: red-500 }
.btn-save-active { bg: amber-50; border: amber-500; color: amber-500 }
```

## 🔍 **INVENTAIRE DES BOUTONS À CORRIGER**

### ✅ **DÉJÀ CORRIGÉS**
1. **LocationDetailsModern.tsx** - Boutons header (like, save, share, close) ✅
2. **LocationDetailsModern.tsx** - Boutons événements (save) ✅ 
3. **LikeButton.tsx** - Variant "icon" ✅
4. **EventDetailsModern.tsx** - Boutons header (save, share, close) ✅
5. **Gallery.tsx** - Bouton fermer modal ✅
6. **EventCard.tsx** - Bouton save ✅
7. **Dialog.tsx** - Bouton fermer générique ✅
8. **EventDetailsModern.tsx** - Bouton like uniformisé ✅
9. **ui/sheet.tsx** - Bouton fermer générique ✅
10. **LocationHistory.tsx** - Boutons header (retour et fermer) ✅
11. **Gallery.tsx** - Bouton retour uniformisé ✅

### 🔄 **À CORRIGER**

#### **1. PAGES PRINCIPALES**
- [x] **Map.tsx** - Boutons dans les overlays/modals (traité via `LocationDetailsModern.tsx` et `EventDetailsModern.tsx`)
- [ ] **Community.tsx** - Boutons d'interaction (N/A: page dédiée non trouvée, gérer via `Gallery.tsx` et composants communauté)
- [x] **LocationHistory.tsx** - Boutons header (retour et fermer uniformisés)

#### **2. COMPOSANTS ÉVÉNEMENTS**
- [ ] **ProgramCard.tsx** - Boutons save/like (N/A: composant non présent. Utilisation actuelle: `EventCard.tsx` et `EventCardModern.tsx`)

#### **3. COMPOSANTS COMMUNAUTÉ**
- [x] **EntryDetail.tsx** - Bouton fermer uniformisé
- [x] **ContributionForm.tsx** - Bouton fermer géré par `Gallery.tsx` (conforme)
- [x] **GalleryGrid.tsx** - Boutons sur les items (utilise `LikeButton` variant compact/icon)

#### **4. COMPOSANTS UI GÉNÉRIQUES**
- [x] **Dialog.tsx** - Bouton fermer (uniformisé + correction JSX)
- [x] **ShareButton.tsx** - Style du bouton (uniformisé)

#### **5. AUTRES COMPOSANTS**
- [x] **AudioGuidePlayer.tsx** - Boutons contrôle (contrôles media spécifiques, cohérents)
- [x] **BottomNavigation.tsx** - Boutons d'icône (cohérents avec le thème)

## 📝 **PLAN D'ACTION**
1. Rechercher tous les boutons d'icône
2. Identifier les patterns actuels
3. Appliquer le style uniforme
4. Tester la cohérence visuelle
5. Mettre à jour ce document

## 🎨 **TAILLES STANDARDISÉES**
- **Boutons normaux** : `w-10 h-10` (headers, modals)
- **Grands boutons** : `w-12 h-12` (actions principales)

## ⚡ **STATUT**
- **Démarré** : 27/09/2025 12:45
- **Dernière MAJ** : 27/09/2025 16:54
- **Progression** : 100% des composants vérifiés et conformes 
- **Priorité** : haute (cohérence UX critique)

## 🔒 **RÈGLE DE CONCEPTION**
- Remplacer les `LikeButtonSimple` inline par le composant partagé `LikeButton` (variant "icon") ou un wrapper commun pour éviter les divergences.

## 🎯 **RÉSULTATS OBTENUS**
- ✅ **Style uniforme** appliqué sur tous les boutons principaux
- ✅ **LikeButtonSimple** replaced by `LikeButton` (variant "icon") in EventDetailsModern.tsx
- ✅ **Hover effects** harmonisés (amber au survol)
- ✅ **Tailles appropriées** selon contexte (8px, 10px, 12px)
- ✅ **Erreurs JSX** corrigées dans dialog.tsx

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
  - Reçoit les nouvelles contributions via une API serverless
  - Met à jour les fichiers JSON
  - Déclenche un nouveau déploiement

**Structure:**
```
/data/
  community-content.json     # Contient toutes les contributions
  featured-content.json      # Contient les contenus mis en avant
```

**Format du fichier JSON:**
```json
{
  "entries": [
    {
      "id": "entry123",
      "type": "photo",
      "imageUrl": "https://github.com/CollectifIleFeydeau/community-content/raw/main/images/entry123.jpg",
      "thumbnailUrl": "https://github.com/CollectifIleFeydeau/community-content/raw/main/thumbnails/entry123.jpg",
      "eventId": "concert-2025-06-15",
      "locationId": "8-quai-turenne",
      "displayName": "Julie D.",
      "description": "Magnifique concert de harpe!",
      "timestamp": "2025-06-15T19:30:00Z",
      "likes": 12,
      "moderationStatus": "approved"
    },
    {
      "id": "entry124",
      "type": "testimonial",
      "eventId": "exposition-2025-05-20",
      "displayName": "Marc L.",
      "content": "Une exposition qui m'a profondément touché, les œuvres résonnent avec l'histoire du lieu.",
      "timestamp": "2025-05-21T14:20:00Z",
      "likes": 8,
      "moderationStatus": "approved",
      "associatedPhotoId": "entry127"
    }
  ]
}
```

#### 2. Stockage des images

- **Options**:
  1. **GitHub LFS** (Large File Storage) pour les images dans le même dépôt
  2. **Cloudinary** (service gratuit jusqu'à certaines limites) avec API simple
  3. **ImgBB** ou services similaires avec API pour upload anonyme

## Modération de contenu

> **Note importante (Juin 2025)**: La modération par LLM initialement prévue n'est pas implémentée dans la version actuelle. Nous utilisons pour le moment une approche simplifiée de modération manuelle ou par règles simples.

### Approche actuelle

1. **Modération simplifiée pour les textes:**
   - Filtrage basique par mots-clés pour le contenu inapproprié
   - Validation manuelle par les administrateurs pour les cas ambigus
   - Possibilité pour les utilisateurs de signaler du contenu problématique

2. **Vérification des images:**
   - Validation des formats et tailles d'images
   - Modération manuelle par les administrateurs
   - Système de signalement par la communauté

### Implémentation via API serverless

```typescript
// Fonction serverless pour la modération simplifiée
export async function moderateContent(req, res) {
  const { type, content, imageUrl } = req.body;
  
  try {
    let isApproved = true;
    let reason = '';
    
    if (type === 'testimonial') {
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
    else if (type === 'photo') {
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

## Système sans authentification

### Identification légère

Pour permettre l'interaction sans authentification tout en limitant les abus:

1. **Identifiants de session:**
   - Générer un ID de session stocké en localStorage
   - Utiliser cet ID pour associer les contributions et les likes d'un même "utilisateur"

2. **Pseudo optionnel:**
   - Permettre aux utilisateurs de saisir un nom d'affichage
   - Stocker ce nom en localStorage pour le réutiliser

3. **Protection contre les abus:**
   - Limiter le nombre de contributions par session/IP
   - Implémenter un système de captcha pour les actions répétitives
   - Utiliser des timestamps pour détecter les soumissions anormalement rapides

```typescript
// Service de gestion des sessions anonymes
class AnonymousSessionService {
  private static SESSION_ID_KEY = 'community_session_id';
  private static DISPLAY_NAME_KEY = 'community_display_name';
  
  static getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_ID_KEY);
    
    if (!sessionId) {
      sessionId = this.generateUniqueId();
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  }
  
  static getDisplayName(): string {
    return localStorage.getItem(this.DISPLAY_NAME_KEY) || 'Visiteur anonyme';
  }
  
  static setDisplayName(name: string): void {
    localStorage.setItem(this.DISPLAY_NAME_KEY, name);
  }
  
  private static generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
```

## Système de likes

### Implémentation côté client

```typescript
class LikeService {
  private static LIKES_KEY = 'community_liked_entries';
  
  static async toggleLike(entryId: string): Promise<boolean> {
    const sessionId = AnonymousSessionService.getOrCreateSessionId();
    const likedEntries = this.getLikedEntries();
    
    // Vérifier si déjà liké
    const hasLiked = likedEntries.includes(entryId);
    
    if (hasLiked) {
      // Retirer le like
      this.removeLike(entryId);
      await this.sendLikeUpdate(entryId, false, sessionId);
      return false;
    } else {
      // Ajouter le like
      this.addLike(entryId);
      await this.sendLikeUpdate(entryId, true, sessionId);
      return true;
    }
  }
  
  static getLikedEntries(): string[] {
    const likesJson = localStorage.getItem(this.LIKES_KEY) || '[]';
    return JSON.parse(likesJson);
  }
  
  static isEntryLiked(entryId: string): boolean {
    return this.getLikedEntries().includes(entryId);
  }
  
  private static addLike(entryId: string): void {
    const likes = this.getLikedEntries();
    if (!likes.includes(entryId)) {
      likes.push(entryId);
      localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
    }
  }
  
  private static removeLike(entryId: string): void {
    const likes = this.getLikedEntries().filter(id => id !== entryId);
    localStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));
  }
  
  private static async sendLikeUpdate(entryId: string, isLiking: boolean, sessionId: string): Promise<void> {
    const endpoint = 'https://api.collectif-feydeau.org/like';
    
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          action: isLiking ? 'add' : 'remove',
          sessionId
        })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du like:', error);
      // Stocker l'action pour synchronisation ultérieure
      this.queueOfflineAction(entryId, isLiking);
    }
  }
}
```

## Interface utilisateur intégrée

### Composants principaux

1. **Galerie communautaire globale:**
   - Vue en grille avec filtres (événement, date, popularité)
   - Alternance fluide entre photos et témoignages
   - Indicateurs visuels de popularité (nombre de likes)

2. **Section dans chaque page d'événement:**
   - Affichage des contributions liées à l'événement spécifique
   - Bouton d'ajout de contribution contextuel

3. **Formulaire de contribution unifié:**
   - Choix du type (photo ou témoignage)
   - Champs adaptés selon le type
   - Option de lier à un événement/lieu
   - Saisie optionnelle du nom d'affichage

## Page de test dans l'administration

Pour valider la faisabilité technique du concept avant le déploiement complet, nous proposons de créer une page de test dans la section d'administration de l'application.

### Objectifs de la page de test

1. **Valider le stockage JSON sur GitHub Pages**
2. **Tester la modération LLM**
3. **Vérifier le système de likes sans authentification**
4. **Évaluer les performances d'upload et affichage des images**

### Fonctionnalités de la page de test

#### 1. Test de création et mise à jour des fichiers JSON

- Interface pour créer manuellement un fichier JSON de test
- Bouton pour déclencher une mise à jour via GitHub API
- Affichage du statut et des logs de l'opération

#### 2. Test de la modération LLM

- Formulaire de soumission de texte pour tester la modération
- Upload d'image pour tester la modération visuelle
- Affichage des résultats bruts de l'API de modération
- Statistiques sur les taux d'approbation/rejet

#### 3. Test du système de likes

- Simulation de plusieurs sessions utilisateur
- Interface pour ajouter/retirer des likes
- Visualisation de la synchronisation entre localStorage et fichier JSON
- Test de concurrence et de limites

#### 4. Test de performance des images

- Upload d'images de différentes tailles
- Mesure du temps de traitement (redimensionnement, compression)
- Test de chargement de la galerie avec différents nombres d'images
- Évaluation de la consommation mémoire

### Implémentation technique de la page de test

```typescript
// Route pour la page de test dans l'administration
const CommunityFeatureTestPage: React.FC = () => {
  // États pour les différents tests
  const [jsonTestStatus, setJsonTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [moderationTestResults, setModerationTestResults] = useState<any[]>([]);
  const [likeTestSessions, setLikeTestSessions] = useState<string[]>([]);
  const [imageTestResults, setImageTestResults] = useState<any[]>([]);
  
  // Test de création/mise à jour JSON
  const runJsonTest = async () => {
    setJsonTestStatus('loading');
    try {
      // Créer un fichier JSON de test
      const testData = {
        entries: [
          {
            id: `test_${Date.now()}`,
            type: 'testimonial',
            displayName: 'Test User',
            content: 'Ceci est un test de la galerie communautaire',
            timestamp: new Date().toISOString(),
            likes: 0,
            moderationStatus: 'approved'
          }
        ]
      };
      
      // Tester l'API GitHub pour la mise à jour
      const result = await testGitHubJsonUpdate('test-community-content.json', testData);
      
      setJsonTestStatus(result ? 'success' : 'error');
    } catch (error) {
      console.error('Erreur lors du test JSON', error);
      setJsonTestStatus('error');
    }
  };
  
  // Test de modération LLM
  const runModerationTest = async (content: string, imageFile?: File) => {
    try {
      // Tester la modération de texte
      const textResult = await testLLMModeration(content);
      
      // Tester la modération d'image si fournie
      let imageResult = null;
      if (imageFile) {
        const imageUrl = await uploadTestImage(imageFile);
        imageResult = await testImageModeration(imageUrl);
      }
      
      setModerationTestResults([
        ...moderationTestResults,
        {
          timestamp: new Date().toISOString(),
          content,
          textResult,
          imageResult
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du test de modération', error);
    }
  };
  
  // Autres fonctions de test...
  
  return (
    <div className="admin-test-page">
      <h1>Test des fonctionnalités de la galerie communautaire</h1>
      
      {/* Section de test JSON */}
      <section>
        <h2>Test du stockage JSON</h2>
        <button 
          onClick={runJsonTest}
          disabled={jsonTestStatus === 'loading'}
        >
          Lancer le test
        </button>
        <div className="status">
          Statut: {jsonTestStatus === 'idle' ? 'En attente' : 
                  jsonTestStatus === 'loading' ? 'En cours...' :
                  jsonTestStatus === 'success' ? 'Succès' : 'Échec'}
        </div>
      </section>
      
      {/* Section de test de modération */}
      <section>
        <h2>Test de la modération LLM</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          runModerationTest(
            formData.get('content') as string,
            formData.get('image') as File
          );
        }}>
          <textarea name="content" placeholder="Texte à modérer"></textarea>
          <input type="file" name="image" accept="image/*" />
          <button type="submit">Tester la modération</button>
        </form>
        
        <div className="results">
          <h3>Résultats des tests de modération</h3>
          {moderationTestResults.map((result, index) => (
            <div key={index} className="test-result">
              <p>Test #{index + 1} - {new Date(result.timestamp).toLocaleString()}</p>
              <p>Contenu: {result.content}</p>
              <p>Résultat texte: {result.textResult?.status}</p>
              {result.imageResult && (
                <p>Résultat image: {result.imageResult?.status}</p>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Autres sections de test... */}
    </div>
  );
};
```

### Métriques à collecter pendant les tests

1. **Performance**
   - Temps de chargement des données JSON
   - Temps de traitement des images
   - Utilisation mémoire du navigateur

2. **Fiabilité**
   - Taux de succès des mises à jour GitHub
   - Stabilité de la modération LLM
   - Persistance des likes entre sessions

3. **Limites**
   - Nombre maximum d'entrées JSON gérables
   - Taille maximale pratique des images
   - Fréquence maximale des mises à jour

### Procédure de test recommandée

1. **Tests unitaires** de chaque composant technique
2. **Tests d'intégration** des différents services
3. **Test de charge** avec simulation de multiples utilisateurs
4. **Test utilisateur** avec un petit groupe de bêta-testeurs

Les résultats de ces tests permettront d'affiner l'implémentation finale et d'identifier les éventuels points de blocage avant le déploiement de la fonctionnalité complète.

## État d'avancement de l'implémentation (Mise à jour : 12/06/2025)

### Fonctionnalités implémentées ✅

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
   - Service communityService entièrement mis à jour pour utiliser l'API serverless en production

3. **Backend et API serverless**
   - API serverless Netlify complète pour la soumission, récupération et modération des contributions
   - Workflow GitHub Actions pour traiter automatiquement les contributions en attente (toutes les 6 heures ou sur déclenchement manuel)
   - Stockage des images optimisées sur GitHub via commits automatisés
   - Système de tokens d'authentification pour sécuriser les accès API

4. **Composants techniques**
   - Composant LocalImage pour gérer l'affichage des images stockées localement
   - Service de modération simplifié
   - Intégration avec le service de session anonyme
   - Script Node.js pour le traitement des images (redimensionnement, optimisation) avec sharp

5. **Contribution contextuelle**
   - Service complet de gestion du contexte de contribution (contextualContributionService)
   - Bouton "Partager un souvenir" dans la page de détail d'événement
   - Pré-remplissage des champs du formulaire en fonction du contexte
   - Enrichissement des données soumises avec le contexte
   - Affichage du contexte dans le formulaire de contribution

### Fonctionnalités restant à implémenter ⏳

1. **Tests d'intégration**
   - Tester intégralement le workflow GitHub Actions et le script de traitement des contributions
   - Valider la persistance des images sur GitHub et leur affichage dans l'application
   - Vérifier la robustesse du système en conditions réelles

2. **Contribution contextuelle**
   - Implémenter le bouton "Partager un souvenir" dans la page LocationHistory
   - Ajouter un filtre dans la galerie pour afficher les contributions par événement ou lieu
   - Créer des vues dédiées pour les contributions liées à un événement/lieu spécifique

3. **Améliorations UX**
   - Ajouter des animations et transitions plus fluides
   - Optimiser le chargement et l'affichage des images
   - Améliorer la gestion des erreurs et les retours utilisateur
   - Ajouter des indicateurs de progression lors des uploads d'images

4. **Déploiement et monitoring**
   - Configurer les variables d'environnement en production (GITHUB_TOKEN, API_TOKEN)
   - Mettre en place un système de monitoring des appels API
   - Préparer la documentation utilisateur finale

### Problèmes résolus récemment 🔧

- Mise en place complète de l'API serverless Netlify pour la gestion des contributions
- Implémentation du workflow GitHub Actions pour le traitement automatique des contributions
- Intégration du service communityService avec l'API serverless
- Correction des erreurs TypeScript dans les types et interfaces
- Configuration de Netlify pour les fonctions serverless et les redirections API
- Correction de la redirection depuis le bouton "Partager un souvenir" dans EventDetails.tsx (12/06/2025)
- Amélioration de la gestion des images dans localStorage (12/06/2025)

## Améliorations techniques récentes

### Gestion intelligente des images dans localStorage

Pour résoudre les problèmes de quota dépassé et d'images manquantes dans le localStorage, nous avons implémenté une stratégie de gestion intelligente :

#### 1. Nettoyage intelligent du localStorage

```typescript
async function cleanupOldImages(requiredSpace?: number, imagesToPreserve: string[] = []): Promise<boolean> {
  // Estimation de la taille actuelle utilisée
  // Suppression progressive des images les plus anciennes
  // Préservation d'images spécifiques
  // Nettoyage uniquement si l'utilisation dépasse 80% de la capacité
}
```

#### 2. Redimensionnement adaptatif des images

- Qualité et dimensions ajustées en fonction de la taille de l'image
- Compression progressive pour les images volumineuses
- Dernier recours avec qualité très réduite si nécessaire

#### 3. Gestion améliorée des erreurs dans le composant LocalImage

- Tentative de récupération depuis le cache du navigateur
- Affichage d'une image de secours en cas d'échec
- Gestion des erreurs de chargement avec fallback progressif

Ces améliorations permettent de résoudre les erreurs "Image non trouvée dans localStorage" et "ERR_FILE_NOT_FOUND" tout en optimisant l'utilisation de l'espace de stockage disponible.

## Plan de tests manuels d'intégration

### 1. Test du workflow de contribution depuis un événement
- [x] Ouvrir la page de détail d'un événement
- [x] Cliquer sur le bouton "Partager un souvenir"
- [x] Vérifier que vous êtes redirigé vers la page de contribution (/community/contribute)
- [x] Vérifier que le contexte de l'événement est correctement pré-rempli
- [x] Soumettre une contribution (photo ou témoignage)
- [x] Vérifier que la contribution apparaît dans la galerie

### 2. Test du workflow de contribution depuis un lieu
- [x] Ouvrir la page d'historique d'un lieu
- [x] Cliquer sur le bouton "Partager un souvenir de ce lieu"
- [x] Vérifier que vous êtes redirigé vers la page de contribution
- [x] Vérifier que le contexte du lieu est correctement pré-rempli
- [x] Soumettre une contribution
- [x] Vérifier que la contribution apparaît dans la galerie

### 3. Test du workflow GitHub Actions
- [ ] Soumettre une contribution
- [ ] Vérifier dans les logs GitHub Actions que le workflow est déclenché
- [ ] Vérifier que l'image est correctement stockée sur GitHub
- [ ] Vérifier que les données JSON sont mises à jour
- [ ] Vérifier que la contribution apparaît dans la galerie après déploiement

### 3bis. Test des améliorations de gestion d'images dans localStorage
- [ ] Ouvrir la console du navigateur pour surveiller les logs
- [ ] Soumettre plusieurs contributions avec des images de différentes tailles
- [ ] Vérifier dans les logs que le nettoyage intelligent du localStorage fonctionne ("[FileService] Nettoyage préventif du localStorage")
- [ ] Vérifier que les images sont correctement redimensionnées selon leur taille d'origine
- [ ] Forcer un dépassement de quota en soumettant de très grosses images
- [ ] Vérifier que le système gère correctement cette situation en supprimant les images les plus anciennes
- [ ] Vérifier que les images importantes (préservées) ne sont pas supprimées
- [ ] Fermer l'application et la rouvrir pour vérifier que les images sont toujours accessibles
- [ ] Vérifier que les images manquantes affichent correctement l'image de secours

### 4. Test de la persistance des images
- [ ] Soumettre une contribution avec image
- [ ] Vérifier que l'image est correctement affichée dans la galerie
- [ ] Vérifier que l'image reste accessible après avoir fermé et rouvert l'application
- [ ] Vérifier que l'image est correctement redimensionnée (version originale et miniature)

### 5. Test des likes
- [ ] Aimer une contribution
- [ ] Vérifier que le compteur de likes augmente
- [ ] Vérifier que votre like est persistant (après rechargement)
- [ ] Retirer votre like
- [ ] Vérifier que le compteur diminue

### 6. Test de la modération
- [ ] Soumettre une contribution avec du contenu approprié
- [ ] Vérifier qu'elle est approuvée automatiquement
- [ ] Soumettre une contribution avec un mot interdit
- [ ] Vérifier qu'elle est rejetée ou mise en attente de modération
- [ ] Vérifier le processus de modération manuelle (si implémenté)

### 7. Test des filtres et de l'affichage contextuel
- [ ] Vérifier que les filtres par type (photo/témoignage) fonctionnent
- [ ] Vérifier que les contributions liées à un événement sont correctement filtrables
- [ ] Vérifier que les contributions liées à un lieu sont correctement filtrables
- [ ] Tester la navigation entre les différentes vues de la galerie

# Annexes : historique de développement et synthèse

## Résumé de la conversation et de l'implémentation (Juin 2025)

La fonctionnalité de galerie communautaire interactive a été développée en suivant les étapes ci-dessous, en s'appuyant sur une architecture React/Vite (frontend), Netlify Functions (API serverless), et GitHub Actions (traitement des contributions et stockage sur GitHub Pages).

### 1. Mise en place initiale & tests
- Frontend React/Vite, backend Netlify Functions, workflow GitHub.
- Stockage localStorage fonctionnel, mais les appels API et GitHub Actions non déclenchés en mode dev.

### 2. Basculer en mode API en dev
- Ajout du flag `VITE_USE_API` pour forcer l'utilisation de l'API en dev.
- Adaptation de `communityService.ts` pour respecter ce flag.

### 3. Dépendances & configuration
- Résolution des conflits de lockfile, installation des dépendances manquantes pour les fonctions Netlify, correction des problèmes ES module/CommonJS.
- Configuration des ports Netlify/Vite, création de `.env.local`.

### 4. Debug des fonctions serverless
- Problèmes avec `middy` (middleware) à cause des modules ES/CJS.
- Suppression de `middy`, gestion manuelle du CORS et parsing du body.
- Renommage des fonctions en `.cjs` pour éviter les warnings.

### 5. Parsing FormData
- Le frontend envoyait du FormData, le backend attendait du JSON : champs indéfinis et erreurs 400.
- Intégration de `busboy` pour parser le FormData côté fonction serverless.

### 6. Unification du démarrage dev
- Création/MAJ de `start-dev.bat` et `start-dev.ps1` pour automatiser le nettoyage, la libération des ports, la suppression du cache, et le lancement de Netlify Dev + Vite.
- Installation globale de Netlify CLI pour éviter les prompts répétés.

### 7. Prêt pour la production
- Ajout d'une logique dans `submit-contribution.cjs` pour simuler le succès en dev (pas de token GitHub) et utiliser l'API GitHub en prod.
- Création de `public/data/pending-contributions.json` pour éviter les 404 à la première contribution.
- Commit et push de tous les changements sur GitHub.

### 8. Tests finaux
- Après corrections, soumission d'une photo/témoignage et affichage dans la galerie OK.
- HTTP 201 sur succès, UI affiche la nouvelle contribution (placeholder si image manquante).
- Suggestions d'amélioration : fallback image, messages d'erreur, documentation, déploiement prod.

### Points restants / prochaines étapes
- En dev, les images ne sont pas uploadées (champ file ignoré), donc "Image non disponible".
- En prod, vérifier la variable `GITHUB_TOKEN` sur Netlify et tester le workflow complet.
- Améliorer l'UX pour les erreurs et fallback image, documenter le workflow pour les mainteneurs.

---

## Extrait de log de soumission de contribution (mode développement)

```
File field image received but ignored in production function
FormData parsed successfully: {
  type: 'photo',
  displayName: 'Anonyme',
  sessionId: 'mbtxx333k9gklrqnuv',
  eventId: 'expo-emmanuelle-boisson',
  locationId: 'quai-turenne-8',
  contextType: 'event',
  contextId: 'expo-emmanuelle-boisson'
}
Données extraites: {
  type: 'photo',
  displayName: 'Anonyme',
  sessionId: 'mbtxx333k9gklrqnuv',
  eventId: 'expo-emmanuelle-boisson',
  locationId: 'quai-turenne-8'
}
Mode développement - contribution stockée localement uniquement
Response with status 201 in 106 ms.
```

---

## Plan de tests manuels d'intégration (rappel)

### 1. Test du workflow de contribution depuis un événement
- [x] Ouvrir la page de détail d'un événement
- [x] Cliquer sur le bouton "Partager un souvenir"
- [x] Vérifier que vous êtes redirigé vers la page de contribution (/community/contribute)
- [x] Vérifier que le contexte de l'événement est correctement pré-rempli
- [x] Soumettre une contribution (photo ou témoignage)
- [x] Vérifier que la contribution apparaît dans la galerie

### 2. Test du workflow de contribution depuis un lieu
- [x] Ouvrir la page d'historique d'un lieu
- [x] Cliquer sur le bouton "Partager un souvenir de ce lieu"
- [x] Vérifier que vous êtes redirigé vers la page de contribution
- [x] Vérifier que le contexte du lieu est correctement pré-rempli
- [x] Soumettre une contribution
- [x] Vérifier que la contribution apparaît dans la galerie

### 3. Test du workflow GitHub Actions
- [ ] Soumettre une contribution
- [ ] Vérifier dans les logs GitHub Actions que le workflow est déclenché
- [ ] Vérifier que l'image est correctement stockée sur GitHub
- [ ] Vérifier que les données JSON sont mises à jour
- [ ] Vérifier que la contribution apparaît dans la galerie après déploiement

### 3bis. Test des améliorations de gestion d'images dans localStorage
- [ ] Ouvrir la console du navigateur pour surveiller les logs
- [ ] Soumettre plusieurs contributions avec des images de différentes tailles
- [ ] Vérifier dans les logs que le nettoyage intelligent du localStorage fonctionne ("[FileService] Nettoyage préventif du localStorage")
- [ ] Vérifier que les images sont correctement redimensionnées selon leur taille d'origine
- [ ] Forcer un dépassement de quota en soumettant de très grosses images
- [ ] Vérifier que le système gère correctement cette situation en supprimant les images les plus anciennes
- [ ] Vérifier que les images importantes (préservées) ne sont pas supprimées
- [ ] Fermer l'application et la rouvrir pour vérifier que les images sont toujours accessibles
- [ ] Vérifier que les images manquantes affichent correctement l'image de secours

### 4. Test de la persistance des images
- [ ] Soumettre une contribution avec image
- [ ] Vérifier que l'image est correctement affichée dans la galerie
- [ ] Vérifier que l'image reste accessible après avoir fermé et rouvert l'application
- [ ] Vérifier que l'image est correctement redimensionnée (version originale et miniature)

### 5. Test des likes
- [ ] Aimer une contribution
- [ ] Vérifier que le compteur de likes augmente
- [ ] Vérifier que votre like est persistant (après rechargement)
- [ ] Retirer votre like
- [ ] Vérifier que le compteur diminue

### 6. Test de la modération
- [ ] Soumettre une contribution avec du contenu approprié
- [ ] Vérifier qu'elle est approuvée automatiquement
- [ ] Soumettre une contribution avec un mot interdit
- [ ] Vérifier qu'elle est rejetée ou mise en attente de modération
- [ ] Vérifier le processus de modération manuelle (si implémenté)

### 7. Test des filtres et de l'affichage contextuel
- [ ] Vérifier que les filtres par type (photo/témoignage) fonctionnent
- [ ] Vérifier que les contributions liées à un événement sont correctement filtrables
- [ ] Vérifier que les contributions liées à un lieu sont correctement filtrables
- [ ] Tester la navigation entre les différentes vues de la galerie

---

Pour toute évolution ou maintenance, se référer à cette annexe pour comprendre l'historique, les choix techniques, et les points d'attention restants.

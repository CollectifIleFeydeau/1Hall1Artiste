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

## Modération par LLM

### Faisabilité et approche

Un LLM peut assurer une première couche de modération automatisée, particulièrement efficace pour:

1. **Détection de contenu inapproprié dans les textes:**
   - Langage offensant ou discriminatoire
   - Contenu à caractère sexuel explicite
   - Informations personnelles (emails, téléphones)
   - Spam ou publicités

2. **Analyse d'images (via modèles multimodaux):**
   - Détection de contenu explicite
   - Identification d'images hors-sujet
   - Repérage de texte inapproprié dans les images

### Implémentation via API serverless

```typescript
// Fonction serverless pour la modération
export async function moderateContent(req, res) {
  const { type, content, imageUrl } = req.body;
  
  // Configuration de l'API LLM
  const llmConfig = {
    model: "gpt-4o",
    temperature: 0.1,
    max_tokens: 100
  };
  
  try {
    let moderationResult;
    
    if (type === 'testimonial') {
      // Modération de texte
      const prompt = `
        Modère le témoignage suivant pour un site culturel familial.
        Réponds uniquement par "APPROVED" ou "REJECTED", suivi d'une raison courte si rejeté.
        
        Témoignage: "${content}"
      `;
      
      moderationResult = await callLLMAPI(prompt, llmConfig);
    } 
    else if (type === 'photo' && imageUrl) {
      // Modération d'image via modèle multimodal
      const prompt = `
        Analyse cette image et détermine si elle est appropriée pour un site culturel familial.
        Vérifie: contenu explicite, violence, publicité, hors-sujet.
        Réponds uniquement par "APPROVED" ou "REJECTED", suivi d'une raison courte si rejeté.
      `;
      
      moderationResult = await callMultimodalLLMAPI(prompt, imageUrl, llmConfig);
    }
    
    // Traiter le résultat
    const isApproved = moderationResult.toLowerCase().startsWith('approved');
    const reason = moderationResult.split(':')[1]?.trim() || '';
    
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

/**
 * Fonction de test pour récupérer les entrées communautaires
 */
exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gestion des requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('[community-entries] Fonction appelée avec méthode:', event.httpMethod);
    
    if (event.httpMethod === 'GET') {
      // Retourner des données de test
      const testData = {
        lastUpdated: new Date().toISOString(),
        entries: [
          {
            id: 'test-entry-1',
            type: 'testimonial',
            displayName: 'Test User',
            content: 'Ceci est un témoignage de test depuis l\'API Netlify !',
            createdAt: new Date().toISOString(),
            likes: 5,
            isLikedByCurrentUser: false
          }
        ]
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(testData)
      };
    }

    // Méthode non supportée
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };

  } catch (error) {
    console.error('[community-entries] Erreur:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur serveur', 
        message: error.message 
      })
    };
  }
}; 
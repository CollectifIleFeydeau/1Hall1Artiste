/**
 * Fonction de test pour la modération de contenu
 */
const moderateContent = async (event, context) => {
  try {
    console.log('Moderate content called with:', event.httpMethod);
    console.log('Body received:', event.body);

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

    // Vérifier la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Méthode non autorisée' }),
      };
    }

    // Parser le body
    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (e) {
      body = {};
    }

    // Extraire les données
    const { type, content, entryId } = body;

    console.log('Modération demandée pour:', { type, entryId });

    // Modération simplifiée
    let status = 'approved';
    let message = 'Contenu approuvé';

    // Vérification basique pour les témoignages
    if (type === 'testimonial' && content) {
      const forbiddenWords = ['spam', 'interdit', 'inapproprié'];
      const containsForbidden = forbiddenWords.some(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsForbidden) {
        status = 'rejected';
        message = 'Contenu contient des mots inappropriés';
      }
    }

    const result = {
      entryId,
      status,
      message
    };

    console.log('Résultat modération:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Erreur dans moderate-content:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur serveur lors de la modération',
        details: error.message
      }),
    };
  }
};

// Exporter la fonction 
exports.handler = moderateContent;
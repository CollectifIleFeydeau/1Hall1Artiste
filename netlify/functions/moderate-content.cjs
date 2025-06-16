const busboy = require('busboy');
const { Buffer } = require('buffer');

/**
 * Parse FormData using busboy
 */
function parseFormData(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    
    // Check if it's actually FormData
    if (!event.headers['content-type'] || !event.headers['content-type'].includes('multipart/form-data')) {
      // Fallback for non-FormData requests
      try {
        if (typeof event.body === 'string') {
          // Try JSON first
          try {
            resolve(JSON.parse(event.body));
            return;
          } catch (e) {
            // Try URL-encoded
            const urlParams = new URLSearchParams(event.body);
            const data = {};
            for (const [key, value] of urlParams.entries()) {
              data[key] = value;
            }
            resolve(data);
            return;
          }
        }
        resolve(event.body || {});
      } catch (e) {
        resolve({});
      }
      return;
    }

    const bb = busboy({ 
      headers: event.headers,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });
    
    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });
    
    bb.on('file', (fieldname, file, info) => {
      console.log(`File field ${fieldname} received: ${info.filename}, mimetype: ${info.mimeType}`);
      
      if (fieldname === 'image') {
        // Traiter le fichier image
        const chunks = [];
        
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fields[fieldname] = buffer.toString('base64');
          console.log(`Image reçue et convertie en base64 (${Math.round(buffer.length / 1024)} Ko)`);
        });
      } else {
        // Pour les autres champs de type fichier, ignorer
        file.resume();
      }
    });
    
    bb.on('finish', () => {
      console.log('FormData parsed successfully:', fields);
      resolve(fields);
    });
    
    bb.on('error', (err) => {
      console.error('Error parsing FormData:', err);
      reject(err);
    });
    
    // Convert base64 body back to buffer and write to busboy
    try {
      const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
      bb.end(bodyBuffer);
    } catch (err) {
      console.error('Error processing body:', err);
      reject(err);
    }
  });
}

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

    // Parser le body avec FormData
    const body = await parseFormData(event);

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
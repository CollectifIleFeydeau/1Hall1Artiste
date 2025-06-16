const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const { v4: uuidv4 } = require('uuid');
// Removed middy dependencies - using manual CORS and body parsing
const { Buffer } = require('buffer');
const busboy = require('busboy');

// Configuration
const config = {
  owner: 'CollectifIleFeydeau',
  repo: '1Hall1Artiste',
  branch: 'main',
  dataPath: 'public/data/pending-contributions.json',
  imagesPath: 'public/images/community',
};

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
 * Fonction principale pour recevoir les contributions
 */
const submitContribution = async (event, context) => {
  try {
    console.log('Submit contribution called with:', event.httpMethod);
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
    console.log('Données extraites:', {
      type: body.type,
      displayName: body.displayName,
      sessionId: body.sessionId,
      eventId: body.eventId,
      locationId: body.locationId
    });

    // Extraire les données de la contribution
    const { type, content, displayName, sessionId, image, eventId, locationId, contextType, contextId } = body;

    // Valider les données
    if (!type || !displayName || !sessionId) {
      console.log('Validation failed - missing required fields:', { type, displayName, sessionId });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Données incomplètes' }),
      };
    }

    // Valider le type de contribution
    if (type !== 'photo' && type !== 'testimonial') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Type de contribution invalide' }),
      };
    }

    // Valider le contenu selon le type
    if (type === 'testimonial' && !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Contenu requis pour un témoignage' }),
      };
    }

    // Générer un ID unique pour la contribution
    const contributionId = `entry-${uuidv4()}`;

    // Préparer les données de la contribution
    const contribution = {
      id: contributionId,
      type,
      displayName,
      sessionId,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    // Ajouter les données spécifiques selon le type
    if (type === 'testimonial') {
      contribution.content = content;
    }

    // Ajouter les données contextuelles si présentes
    if (eventId) contribution.eventId = eventId;
    if (locationId) contribution.locationId = locationId;
    if (contextType) contribution.contextType = contextType;
    if (contextId) contribution.contextId = contextId;

    // Vérifier si on est en mode développement (pas de token GitHub)
    const isDevelopment = !process.env.GITHUB_TOKEN;
    
    if (isDevelopment) {
      console.log('Mode développement - contribution stockée localement uniquement');
      // En développement, on simule le succès sans appeler GitHub
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'Contribution soumise avec succès (mode développement)',
          contribution,
          development: true,
        }),
      };
    }

    // Mode production : utiliser l'API GitHub
    console.log('Mode production - utilisation de l\'API GitHub');
    
    // Initialiser Octokit avec l'authentification GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Traiter l'image si présente (pour les contributions de type photo)
    if (type === 'photo' && image) {
      // L'image est envoyée en base64
      const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Image, 'base64');

      // Générer un nom de fichier unique
      const fileName = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const imagePath = `${config.imagesPath}/${fileName}`;

      // Télécharger l'image sur GitHub
      await octokit.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path: imagePath,
        message: `Add image for contribution ${contributionId}`,
        content: imageBuffer.toString('base64'),
        branch: config.branch,
      });

      // Ajouter l'URL de l'image à la contribution
      contribution.imageUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${imagePath}`;
    }

    // Récupérer les contributions en attente existantes
    let pendingContributions = [];
    try {
      const { data } = await octokit.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: config.dataPath,
        ref: config.branch,
      });

      const content = Buffer.from(data.content, 'base64').toString();
      const parsedData = JSON.parse(content);
      pendingContributions = parsedData.contributions || [];
    } catch (error) {
      // Si le fichier n'existe pas, on continue avec un tableau vide
      if (error.status !== 404) {
        console.error('Erreur lors de la récupération des contributions:', error);
      }
    }

    // Ajouter la nouvelle contribution
    pendingContributions.push(contribution);

    // Mettre à jour le fichier des contributions en attente
    await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: config.dataPath,
      message: `Add contribution ${contributionId}`,
      content: Buffer.from(JSON.stringify({ 
        lastUpdated: new Date().toISOString(),
        contributions: pendingContributions 
      }, null, 2)).toString('base64'),
      branch: config.branch,
      ...(await getFileInfo(octokit, config.dataPath)),
    });

    // Déclencher le workflow GitHub Actions pour traiter les contributions
    await triggerWorkflow(octokit);

    console.log('Contribution created successfully:', contributionId);

    // Retourner la contribution créée
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Contribution soumise avec succès',
        contribution,
      }),
    };
  } catch (error) {
    console.error('Erreur lors de la soumission de la contribution:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Erreur serveur lors de la soumission de la contribution' }),
    };
  }
};

/**
 * Récupère les informations d'un fichier (sha) pour la mise à jour
 */
async function getFileInfo(octokit, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: config.branch,
    });
    return { sha: data.sha };
  } catch (error) {
    // Si le fichier n'existe pas, on retourne un objet vide
    return {};
  }
}

/**
 * Déclenche le workflow GitHub Actions pour traiter les contributions
 */
async function triggerWorkflow(octokit) {
  try {
    await octokit.repos.createDispatchEvent({
      owner: config.owner,
      repo: config.repo,
      event_type: 'new-contribution',
    });
    console.log('Workflow GitHub Actions déclenché avec succès');
  } catch (error) {
    console.error('Erreur lors du déclenchement du workflow:', error);
  }
}

// Exporter la fonction 
exports.handler = submitContribution;

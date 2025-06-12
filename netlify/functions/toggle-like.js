const { Octokit } = require('@octokit/rest');
const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const jsonBodyParser = require('@middy/http-json-body-parser');
const { Buffer } = require('buffer');

// Configuration
const config = {
  owner: 'CollectifIleFeydeau',
  repo: 'community-content',
  branch: 'main',
  dataPath: 'public/data/community-content.json',
};

/**
 * Fonction pour ajouter ou retirer un like sur une contribution
 */
const toggleLike = async (event) => {
  try {
    // Vérifier la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Méthode non autorisée' }),
      };
    }

    // Extraire les données
    const { entryId, action, sessionId } = event.body;

    // Valider les données
    if (!entryId || !action || !sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Données incomplètes' }),
      };
    }

    // Valider l'action
    if (action !== 'like' && action !== 'unlike') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Action invalide' }),
      };
    }

    // Initialiser Octokit avec l'authentification GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Récupérer les données communautaires
    let communityData;
    let fileSha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: config.dataPath,
        ref: config.branch,
      });

      fileSha = data.sha;
      const content = Buffer.from(data.content, 'base64').toString();
      communityData = JSON.parse(content);
    } catch (error) {
      console.error('Erreur lors de la récupération des données communautaires:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erreur serveur lors de la récupération des données' }),
      };
    }

    // Trouver l'entrée à mettre à jour
    const entryIndex = communityData.entries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Entrée non trouvée' }),
      };
    }

    // Mettre à jour le nombre de likes
    const entry = communityData.entries[entryIndex];
    
    // Initialiser les likes si nécessaire
    if (!entry.likes) entry.likes = 0;
    if (!entry.likedBy) entry.likedBy = [];
    
    // Vérifier si l'utilisateur a déjà aimé cette entrée
    const alreadyLiked = entry.likedBy.includes(sessionId);
    
    if (action === 'like' && !alreadyLiked) {
      entry.likes += 1;
      entry.likedBy.push(sessionId);
    } else if (action === 'unlike' && alreadyLiked) {
      entry.likes = Math.max(0, entry.likes - 1);
      entry.likedBy = entry.likedBy.filter(id => id !== sessionId);
    }
    
    // Mettre à jour l'entrée
    communityData.entries[entryIndex] = entry;
    
    // Mettre à jour la date de dernière modification
    communityData.lastUpdated = new Date().toISOString();

    // Sauvegarder les données mises à jour
    await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: config.dataPath,
      message: `Update likes for entry ${entryId}`,
      content: Buffer.from(JSON.stringify(communityData, null, 2)).toString('base64'),
      sha: fileSha,
      branch: config.branch,
    });

    // Retourner l'entrée mise à jour
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Like ${action === 'like' ? 'ajouté' : 'retiré'} avec succès`,
        entry: {
          ...entry,
          isLikedByCurrentUser: action === 'like',
        },
      }),
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du like:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur lors de la mise à jour du like' }),
    };
  }
};

// Exporter la fonction avec les middlewares
exports.handler = middy(toggleLike)
  .use(jsonBodyParser())
  .use(cors());

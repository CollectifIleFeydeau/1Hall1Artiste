const { Octokit } = require('@octokit/rest');
const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const { Buffer } = require('buffer');

// Configuration
const config = {
  owner: 'CollectifIleFeydeau',
  repo: 'community-content',
  branch: 'main',
  dataPath: 'pending-contributions.json',
};

/**
 * Fonction pour récupérer les contributions en attente
 */
const getPendingContributions = async (event) => {
  try {
    // Vérifier l'authentification (token dans les headers)
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token !== process.env.API_TOKEN) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Non autorisé' }),
      };
    }

    // Initialiser Octokit avec l'authentification GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Récupérer les contributions en attente
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        contributions: pendingContributions,
      }),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contributions en attente:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur lors de la récupération des contributions' }),
    };
  }
};

// Exporter la fonction avec les middlewares
exports.handler = middy(getPendingContributions)
  .use(cors());

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
  dataPath: 'pending-contributions.json',
};

/**
 * Fonction pour marquer des contributions comme traitées
 */
const markContributionsProcessed = async (event) => {
  try {
    // Vérifier la méthode HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Méthode non autorisée' }),
      };
    }

    // Vérifier l'authentification (token dans les headers)
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token !== process.env.API_TOKEN) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Non autorisé' }),
      };
    }

    // Extraire les IDs des contributions à marquer comme traitées
    const { contributionIds } = event.body;

    // Valider les données
    if (!contributionIds || !Array.isArray(contributionIds) || contributionIds.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Liste d\'IDs de contributions invalide' }),
      };
    }

    // Initialiser Octokit avec l'authentification GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Récupérer les contributions en attente
    let pendingContributions = [];
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
      const parsedData = JSON.parse(content);
      pendingContributions = parsedData.contributions || [];
    } catch (error) {
      // Si le fichier n'existe pas, il n'y a rien à marquer comme traité
      if (error.status === 404) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Aucune contribution en attente à traiter',
            processedCount: 0,
          }),
        };
      }
      
      console.error('Erreur lors de la récupération des contributions:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erreur serveur lors de la récupération des contributions' }),
      };
    }

    // Filtrer les contributions qui ne sont pas dans la liste à marquer comme traitées
    const remainingContributions = pendingContributions.filter(
      contribution => !contributionIds.includes(contribution.id)
    );

    // Calculer le nombre de contributions traitées
    const processedCount = pendingContributions.length - remainingContributions.length;

    // Mettre à jour le fichier des contributions en attente
    await octokit.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: config.dataPath,
      message: `Mark ${processedCount} contributions as processed`,
      content: Buffer.from(JSON.stringify({ 
        lastUpdated: new Date().toISOString(),
        contributions: remainingContributions 
      }, null, 2)).toString('base64'),
      sha: fileSha,
      branch: config.branch,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `${processedCount} contributions marquées comme traitées`,
        processedCount,
      }),
    };
  } catch (error) {
    console.error('Erreur lors du marquage des contributions comme traitées:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur lors du marquage des contributions' }),
    };
  }
};

// Exporter la fonction avec les middlewares
exports.handler = middy(markContributionsProcessed)
  .use(jsonBodyParser())
  .use(cors());

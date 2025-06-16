/**
 * Proxy sécurisé pour l'API GitHub - Collectif Feydeau
 * 
 * Ce Worker sert de proxy entre le frontend et l'API GitHub pour créer des issues
 * sans exposer le token d'authentification GitHub dans le code client.
 */

// Interface pour l'environnement avec le token GitHub
interface Env {
  GITHUB_TOKEN: string;
}

// Interface pour les données de contribution
interface ContributionData {
  title: string;
  body: string;
  labels?: string[];
}

// Interface pour les données de suppression d'issue
interface DeleteIssueData {
  issueNumber: string;
}

export default {
  // Fonction principale qui traite toutes les requêtes
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log(`Requête reçue: ${request.method} ${request.url}`);
    
    // Définir les en-têtes CORS pour toutes les réponses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    };

    // Gérer les requêtes OPTIONS (preflight CORS)
    if (request.method === "OPTIONS") {
      console.log("Traitement d'une requête OPTIONS (preflight CORS)");
      return new Response(null, {
        status: 204, // No Content
        headers: corsHeaders
      });
    }

    // Vérifier que c'est une requête POST
    if (request.method !== "POST") {
      return new Response("Méthode non autorisée", { 
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      console.log("Traitement d'une requête POST");
      
      // Déterminer le type d'opération en fonction de l'URL
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Récupérer les données de la requête
      const requestData = await request.json();
      let githubResponse;
      
      // Traiter les différents types de requêtes
      if (path === "/delete-issue") {
        // Suppression d'une issue
        const deleteData = requestData as DeleteIssueData;
        
        // Valider les données
        if (!deleteData.issueNumber) {
          return new Response("Données invalides: numéro d'issue requis", { 
            status: 400,
            headers: corsHeaders
          });
        }
        
        console.log(`Suppression de l'issue GitHub #${deleteData.issueNumber}`);
        
        // Préparer la requête vers l'API GitHub pour fermer l'issue
        githubResponse = await fetch(
          `https://api.github.com/repos/CollectifIleFeydeau/community-content/issues/${deleteData.issueNumber}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/vnd.github.v3+json",
              "Authorization": `token ${env.GITHUB_TOKEN}`,
              "User-Agent": "Cloudflare-Worker-CollectifFeydeau"
            },
            body: JSON.stringify({
              state: "closed"
            })
          }
        );
      } else {
        // Création d'une issue (comportement par défaut)
        const data = requestData as ContributionData;
        
        // Valider les données
        if (!data.title || !data.body) {
          return new Response("Données invalides: titre et corps requis", { 
            status: 400,
            headers: corsHeaders
          });
        }

        console.log(`Création d'une issue GitHub: ${data.title}`);
        
        // Préparer la requête vers l'API GitHub
        githubResponse = await fetch(
          "https://api.github.com/repos/CollectifIleFeydeau/community-content/issues",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/vnd.github.v3+json",
              "Authorization": `token ${env.GITHUB_TOKEN}`,
              "User-Agent": "Cloudflare-Worker-CollectifFeydeau"
            },
            body: JSON.stringify({
              title: data.title,
              body: data.body,
              labels: data.labels || []
            })
          }
        );
      }

      // Récupérer la réponse de GitHub
      const githubData = await githubResponse.json();
      console.log(`Réponse de GitHub: ${githubResponse.status}`);
      
      // Retourner la réponse avec les en-têtes CORS
      return new Response(JSON.stringify(githubData), {
        status: githubResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error: unknown) {
      // Gérer les erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`Erreur: ${errorMessage}`);
      return new Response(`Erreur: ${errorMessage}`, { 
        status: 500,
        headers: corsHeaders
      });
    }
  },
};


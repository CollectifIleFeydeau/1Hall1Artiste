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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Gérer les requêtes OPTIONS pour CORS
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // Vérifier que c'est une requête POST
    if (request.method !== "POST") {
      return new Response("Méthode non autorisée", { status: 405 });
    }

    try {
      // Récupérer les données de la requête
      const data = await request.json() as ContributionData;
      
      // Valider les données
      if (!data.title || !data.body) {
        return new Response("Données invalides: titre et corps requis", { status: 400 });
      }

      // Préparer la requête vers l'API GitHub
      const githubResponse = await fetch(
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

      // Récupérer la réponse de GitHub
      const githubData = await githubResponse.json();
      
      // Retourner la réponse avec les en-têtes CORS
      return new Response(JSON.stringify(githubData), {
        status: githubResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } catch (error: unknown) {
      // Gérer les erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return new Response(`Erreur: ${errorMessage}`, { status: 500 });
    }
  },
};

// Fonction pour gérer les requêtes CORS preflight
function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

/**
 * Worker de test minimal pour le CORS - Collectif Feydeau
 * 
 * Ce Worker est un test minimal qui ne fait que répondre avec des en-têtes CORS appropriés
 * pour isoler les problèmes de CORS des autres aspects du code.
 */

export default {
  // Fonction principale qui traite toutes les requêtes
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
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

    // Pour toute autre requête, renvoyer un message de succès simple
    console.log("Traitement d'une requête standard");
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Worker de test CORS fonctionnel",
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  },
};


import React, { useState, useEffect } from 'react';
import { analytics } from '../services/firebaseAnalytics';
import { EventCategory, EventAction } from '../services/firebaseAnalytics';
import { sendTestEvent } from './firebaseDebug';
import { sendGtagTestEvent } from './gtag-debug';
import { runAndLogDiagnostics } from './analytics-diagnostics';

/**
 * Composant de débogage pour Firebase Analytics
 * Permet d'envoyer des événements de test pour vérifier le fonctionnement de DebugView
 */
export default function AnalyticsDebugger() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<string>('firebase'); // 'firebase' ou 'gtag'
  const [urlParams, setUrlParams] = useState<string>('');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [runningDiagnostic, setRunningDiagnostic] = useState<boolean>(false);
  
  // Effet pour vérifier les paramètres d'URL au chargement
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = [];
    
    if (url.searchParams.has('firebase_debug')) {
      params.push('firebase_debug=true');
    }
    
    if (url.searchParams.has('gtm_debug')) {
      params.push('gtm_debug=x');
    }
    
    if (url.searchParams.has('debug_mode')) {
      params.push('debug_mode=true');
    }
    
    setUrlParams(params.join(', ') || 'Aucun paramètre de debug détecté');
    
    // Ajouter un message initial au log
    logEvent('Debugger initialisé');
  }, []);
  
  const logEvent = (message: string) => {
    setEventLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  const handleSendTestEvent = () => {
    if (debugMode === 'firebase') {
      sendTestEvent();
      logEvent('Événement de test Firebase envoyé');
    } else {
      sendGtagTestEvent();
      logEvent('Événement de test Gtag envoyé');
    }
  };
  
  const handleSendPageView = () => {
    analytics.trackPageView('/debug-page', 'Page de débogage');
    logEvent('Événement page_view envoyé via Firebase Analytics');
    
    // Envoyer aussi via gtag si ce mode est sélectionné
    if (debugMode === 'gtag' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Page de débogage',
        page_path: '/debug-page',
        debug_mode: true
      });
      logEvent('Événement page_view envoyé via Gtag');
    }
  };
  
  const handleSendOnboardingComplete = () => {
    analytics.trackOnboarding(EventAction.ONBOARDING_COMPLETE, {
      total_slides_viewed: 5,
      completion_time: new Date().toISOString()
    });
    logEvent('Événement onboarding_complete envoyé');
  };
  
  const handleSendMapInteraction = () => {
    analytics.trackMapInteraction(EventAction.MAP_LOAD, {
      map_type: 'debug',
      load_time: 1200
    });
    logEvent('Événement map_load envoyé');
  };
  
  const handleSendCustomEvent = () => {
    analytics.trackEvent(
      EventCategory.FEATURE, 
      EventAction.FEATURE_USE, 
      { feature_name: 'analytics_debugger', custom_param: 'test_value' }
    );
    logEvent('Événement personnalisé feature_feature_use envoyé');
  };
  
  // Fonction pour ajouter ou mettre à jour les paramètres d'URL
  const addDebugParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('firebase_debug', 'true');
    url.searchParams.set('debug_mode', 'true');
    url.searchParams.set('gtm_debug', 'x');
    window.history.replaceState({}, document.title, url.toString());
    
    setUrlParams('firebase_debug=true, debug_mode=true, gtm_debug=x');
    logEvent('Paramètres de debug ajoutés à l\'URL');
  };
  
  // Fonction pour vider les logs
  const clearLogs = () => {
    setEventLog([]);
    logEvent('Logs effacés');
  };
  
  // Fonction pour exécuter le diagnostic
  const handleRunDiagnostic = async () => {
    setRunningDiagnostic(true);
    logEvent('Démarrage du diagnostic...');
    
    try {
      const diagnosticResult = await runAndLogDiagnostics();
      setDiagnosticResults(diagnosticResult);
      logEvent(`Diagnostic terminé: ${diagnosticResult.summary.success} succès, ${diagnosticResult.summary.failure} problèmes`);
    } catch (error) {
      logEvent(`Erreur lors du diagnostic: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-3xl mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Debugger</h1>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold mb-2">État du débogage</h2>
        <div className="text-sm">
          <p><span className="font-medium">Mode:</span> {debugMode === 'firebase' ? 'Firebase Analytics' : 'Google Tag Manager'}</p>
          <p><span className="font-medium">Paramètres URL:</span> {urlParams}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Mode de débogage</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setDebugMode('firebase')}
            className={`px-3 py-1 rounded ${debugMode === 'firebase' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Firebase Analytics
          </button>
          <button 
            onClick={() => setDebugMode('gtag')}
            className={`px-3 py-1 rounded ${debugMode === 'gtag' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Google Tag (gtag)
          </button>
        </div>
        
        <div className="mt-3">
          <button
            onClick={handleRunDiagnostic}
            disabled={runningDiagnostic}
            className={`w-full py-2 px-4 rounded ${runningDiagnostic ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white flex items-center justify-center`}
          >
            {runningDiagnostic ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exécution du diagnostic...
              </>
            ) : 'Exécuter le diagnostic'}
          </button>
        </div>
      </div>
      
      {diagnosticResults && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Résultats du diagnostic</h2>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span>Tests réussis:</span>
              <span className="font-medium text-green-600">{diagnosticResults.summary.success} / {diagnosticResults.summary.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Problèmes détectés:</span>
              <span className={`font-medium ${diagnosticResults.summary.failure > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {diagnosticResults.summary.failure}
              </span>
            </div>
            
            {diagnosticResults.summary.failure > 0 && (
              <div className="mt-2 text-xs text-red-600">
                Des problèmes ont été détectés. Consultez la console du navigateur pour plus de détails.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={handleSendTestEvent}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Envoyer événement de test
        </button>
        
        <button 
          onClick={handleSendPageView}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Simuler page_view
        </button>
        
        <button 
          onClick={handleSendOnboardingComplete}
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
        >
          Simuler onboarding_complete
        </button>
        
        <button 
          onClick={handleSendMapInteraction}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
        >
          Simuler map_load
        </button>
        
        <button 
          onClick={handleSendCustomEvent}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Envoyer événement personnalisé
        </button>
        
        <button 
          onClick={addDebugParams}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
        >
          Ajouter paramètres debug à l'URL
        </button>
      </div>
      
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Journal des événements</h2>
          <button 
            onClick={clearLogs}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Effacer
          </button>
        </div>
        <div className="h-48 overflow-y-auto text-sm">
          {eventLog.length === 0 ? (
            <p className="text-gray-500 italic">Aucun événement envoyé</p>
          ) : (
            <ul className="space-y-1">
              {eventLog.map((log, index) => (
                <li key={index} className="border-b border-gray-100 pb-1">{log}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold">Instructions:</h3>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>Assurez-vous que l'URL contient les paramètres de debug (<code>?firebase_debug=true</code>)</li>
          <li>Ouvrez la console Firebase &gt; Analytics &gt; DebugView</li>
          <li>Ouvrez également Google Analytics &gt; Rapports &gt; Temps réel</li>
          <li>Cliquez sur les boutons ci-dessus pour envoyer des événements de test</li>
          <li>Vérifiez que les événements apparaissent dans DebugView ou dans les rapports temps réel</li>
          <li>Si rien n'apparaît, essayez de changer de mode (Firebase/Gtag) et réessayez</li>
        </ol>
        
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-semibold">Résolution de problèmes:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Vérifiez que vous n'avez pas de bloqueur de publicités actif</li>
            <li>Utilisez Chrome plutôt qu'un autre navigateur</li>
            <li>Vérifiez que la configuration Firebase est correcte</li>
            <li>Consultez la console du navigateur pour voir les erreurs éventuelles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


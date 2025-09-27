/**
 * Test en temps réel pour Google Analytics
 * Permet de vérifier si les événements sont envoyés immédiatement
 */

import { analytics, EventCategory, EventAction } from '../services/firebaseAnalytics';
import { getFirebaseAnalytics } from '../services/firebaseConfig';
import { runAndLogDiagnostics } from './analytics-diagnostics';

/**
 * Vérifie l'état de Google Analytics
 */
export const checkAnalyticsStatus = async () => {
  console.group('🔍 Diagnostic Google Analytics');
  
  // Vérifier l'instance Firebase Analytics
  const analyticsInstance = getFirebaseAnalytics();
  console.log('🔥 Instance Firebase Analytics:', analyticsInstance ? '✅ Initialisée' : '❌ Non initialisée');
  
  // Vérifier les variables d'environnement
  console.log('🔑 Variables d\'environnement:');
  console.log('  - VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Définie' : '❌ Manquante');
  console.log('  - Mode DEV:', import.meta.env.DEV ? '✅ Activé' : '❌ Désactivé');
  
  // Vérifier le mode debug
  const debugParams = new URLSearchParams(window.location.search);
  const hasDebugParam = debugParams.has('firebase_debug') || debugParams.has('gtm_debug');
  console.log('🐛 Mode debug:', hasDebugParam ? '✅ Activé' : '❌ Désactivé');
  
  // Exécuter le diagnostic complet
  console.log('🔍 Exécution du diagnostic complet...');
  const diagnostics = await runAndLogDiagnostics();
  
  console.groupEnd();
  return {
    analyticsInstance: !!analyticsInstance,
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    debugMode: hasDebugParam,
    diagnostics
  };
};

/**
 * Teste l'envoi d'événements en temps réel
 */
export const testAnalyticsRealTime = async () => {
  console.group('🔴 Test Google Analytics Temps Réel');
  
  // Vérifier d'abord l'état d'Analytics
  const status = await checkAnalyticsStatus();
  if (!status.analyticsInstance) {
    console.error('❌ Analytics non initialisé, impossible de continuer');
    console.groupEnd();
    return null;
  }
  
  const timestamp = new Date().toISOString();
  const testId = Math.random().toString(36).substring(7);
  
  console.log(`🚀 Envoi d'événements de test (ID: ${testId})`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  
  // Test 1: Page view
  try {
    analytics.trackPageView('/test-realtime', `Test Temps Réel ${testId}`);
    console.log('✅ 1. Page view envoyé');
  } catch (error) {
    console.error('❌ 1. Erreur page view:', error);
  }
  
  // Test 2: Interaction utilisateur
  try {
    analytics.trackInteraction(EventAction.CLICK, 'test-realtime-button', {
      test_id: testId,
      timestamp: timestamp,
      realtime_test: true
    });
    console.log('✅ 2. Interaction envoyée');
  } catch (error) {
    console.error('❌ 2. Erreur interaction:', error);
  }
  
  // Test 3: Événement personnalisé
  try {
    analytics.trackEvent(EventCategory.FEATURE, EventAction.FEATURE_USE, {
      feature_name: 'realtime_analytics_test',
      test_id: testId,
      timestamp: timestamp,
      user_agent: navigator.userAgent.substring(0, 50)
    });
    console.log('✅ 3. Événement personnalisé envoyé');
  } catch (error) {
    console.error('❌ 3. Erreur événement personnalisé:', error);
  }
  
  // Test 4: Événement communautaire
  try {
    analytics.trackCommunityInteraction(EventAction.VIEW, {
      content_type: 'realtime_test',
      test_id: testId,
      timestamp: timestamp
    });
    console.log('✅ 4. Événement communautaire envoyé');
  } catch (error) {
    console.error('❌ 4. Erreur événement communautaire:', error);
  }
  
  console.log('');
  console.log('📊 Pour vérifier en temps réel:');
  console.log('1. Ouvrez Google Analytics 4: https://analytics.google.com/');
  console.log('2. Sélectionnez la propriété Collectif Feydeau');
  console.log('3. Allez dans Rapports > Temps réel > Vue d\'ensemble');
  console.log(`4. Cherchez les événements avec test_id: ${testId}`);
  console.log('5. Les événements devraient apparaître dans les 10-60 secondes');
  console.log('6. Si rien n\'apparaît, vérifiez la configuration avec checkAnalyticsStatus()');
  
  console.groupEnd();
  
  return testId;
};

/**
 * Lance une série de tests espacés dans le temps
 */
export const testAnalyticsRealTimeSequence = async () => {
  console.log('🔄 Démarrage de la séquence de tests temps réel...');
  
  // Test immédiat
  const testId1 = await testAnalyticsRealTime();
  
  // Test après 10 secondes
  setTimeout(async () => {
    console.log('⏰ Test après 10 secondes...');
    await testAnalyticsRealTime();
  }, 10000);
  
  // Test après 30 secondes
  setTimeout(async () => {
    console.log('⏰ Test après 30 secondes...');
    await testAnalyticsRealTime();
  }, 30000);
  
  // Test après 1 minute
  setTimeout(async () => {
    console.log('⏰ Test après 1 minute...');
    await testAnalyticsRealTime();
  }, 60000);
  
  return testId1;
};

/**
 * Expose les fonctions de test dans la console pour utilisation manuelle
 */
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).checkAnalyticsStatus = checkAnalyticsStatus;
  (window as any).testAnalyticsRealTime = testAnalyticsRealTime;
  (window as any).testAnalyticsRealTimeSequence = testAnalyticsRealTimeSequence;
  
  console.log('🔧 Fonctions de test Analytics disponibles:');
  console.log('- checkAnalyticsStatus() : Vérifier l\'installation');
  console.log('- testAnalyticsRealTime() : Test unique');
  console.log('- testAnalyticsRealTimeSequence() : Séquence de tests');
}


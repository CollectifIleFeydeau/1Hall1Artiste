/**
 * Utilitaire de diagnostic pour Firebase Analytics
 * Permet de vérifier si la configuration est correcte et si les événements peuvent être envoyés
 */

import { getFirebaseAnalytics } from '../services/firebaseConfig';
import { getFirebaseApp } from '../services/firebaseConfig';
import { getAnalytics, isSupported, setAnalyticsCollectionEnabled } from 'firebase/analytics';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Vérifie si Firebase Analytics est correctement configuré
 */
export const runAnalyticsDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  try {
    // 1. Vérifier si Analytics est supporté dans cet environnement
    const supported = await isSupported();
    results.push({
      success: supported,
      message: supported 
        ? "Firebase Analytics est supporté dans cet environnement" 
        : "Firebase Analytics n'est PAS supporté dans cet environnement"
    });
    
    if (!supported) {
      return results;
    }
    
    // 2. Vérifier si Firebase est initialisé
    const app = getFirebaseApp();
    const isFirebaseInitialized = !!app;
    results.push({
      success: isFirebaseInitialized,
      message: isFirebaseInitialized 
        ? "Firebase est correctement initialisé" 
        : "Firebase n'est PAS initialisé"
    });
    
    if (!isFirebaseInitialized) {
      return results;
    }
    
    // 3. Vérifier la configuration Firebase
    const config = app ? app.options : {};
    const hasMeasurementId = !!config.measurementId;
    results.push({
      success: hasMeasurementId,
      message: hasMeasurementId 
        ? "MeasurementId est configuré" 
        : "MeasurementId est MANQUANT dans la configuration",
      details: {
        measurementId: config.measurementId || "Non défini",
        apiKey: config.apiKey ? "Configuré" : "Non configuré",
        projectId: config.projectId || "Non défini"
      }
    });
    
    // 4. Vérifier si Analytics peut être initialisé
    let analytics = null;
    try {
      if (app) {
        analytics = getAnalytics(app);
      } else {
        console.warn('Firebase non initialisé, impossible d\'utiliser Analytics');
      }
      results.push({
        success: !!analytics,
        message: !!analytics 
          ? "Analytics a été initialisé avec succès" 
          : "Échec de l'initialisation d'Analytics"
      });
    } catch (error) {
      results.push({
        success: false,
        message: "Erreur lors de l'initialisation d'Analytics",
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      return results;
    }
    
    // 5. Vérifier les paramètres de debug dans l'URL
    const url = new URL(window.location.href);
    const hasFirebaseDebug = url.searchParams.has('firebase_debug');
    const hasDebugMode = url.searchParams.has('debug_mode');
    const hasGtmDebug = url.searchParams.has('gtm_debug');
    
    results.push({
      success: hasFirebaseDebug || hasDebugMode || hasGtmDebug,
      message: (hasFirebaseDebug || hasDebugMode || hasGtmDebug)
        ? "Paramètres de debug détectés dans l'URL" 
        : "Aucun paramètre de debug dans l'URL",
      details: {
        firebase_debug: hasFirebaseDebug ? "Présent" : "Absent",
        debug_mode: hasDebugMode ? "Présent" : "Absent",
        gtm_debug: hasGtmDebug ? "Présent" : "Absent"
      }
    });
    
    // 6. Vérifier si la collecte de données est activée
    try {
      // Activer la collecte pour le test
      setAnalyticsCollectionEnabled(analytics, true);
      results.push({
        success: true,
        message: "La collecte de données Analytics est activée"
      });
    } catch (error) {
      results.push({
        success: false,
        message: "Erreur lors de l'activation de la collecte de données",
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }
    
    // 7. Vérifier si window.gtag est disponible (pour le mode debug)
    const hasGtag = typeof window.gtag === 'function';
    results.push({
      success: hasGtag,
      message: hasGtag 
        ? "La fonction gtag est disponible" 
        : "La fonction gtag n'est PAS disponible"
    });
    
    // 8. Vérifier les bloqueurs potentiels
    const potentialBlockers = checkForBlockers();
    results.push({
      success: potentialBlockers.length === 0,
      message: potentialBlockers.length === 0
        ? "Aucun bloqueur potentiel détecté"
        : `${potentialBlockers.length} bloqueur(s) potentiel(s) détecté(s)`,
      details: { blockers: potentialBlockers }
    });
    
  } catch (error) {
    results.push({
      success: false,
      message: "Erreur lors du diagnostic",
      details: { error: error instanceof Error ? error.message : String(error) }
    });
  }
  
  return results;
};

/**
 * Vérifie la présence potentielle de bloqueurs
 */
function checkForBlockers(): string[] {
  const blockers: string[] = [];
  
  // Vérifier si des extensions de blocage courantes sont détectées
  if (document.getElementById('adblock-detector') || 
      document.getElementById('ublock-detector') ||
      document.getElementById('adblock-notice')) {
    blockers.push("Bloqueur de publicités détecté");
  }
  
  // Vérifier si les cookies sont bloqués
  try {
    document.cookie = "testcookie=1; SameSite=Lax; Secure";
    if (document.cookie.indexOf("testcookie=") === -1) {
      blockers.push("Les cookies sont bloqués");
    }
  } catch (e) {
    blockers.push("Erreur lors du test des cookies");
  }
  
  // Vérifier si localStorage est disponible
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    blockers.push("localStorage n'est pas disponible");
  }
  
  // Vérifier si le navigateur est en mode privé/incognito (peut affecter certains trackers)
  // Note: Ces API sont spécifiques à certains navigateurs et nécessitent des types personnalisés
  interface FileSystem {
    root: any;
  }
  
  interface FileError {
    code: number;
  }
  
  type RequestFileSystemCallback = (fs: FileSystem) => void;
  type ErrorCallback = (err: FileError) => void;
  
  interface RequestFileSystemFunction {
    (type: number, size: number, successCallback: RequestFileSystemCallback, errorCallback?: ErrorCallback): void;
  }
  
  // Définir les constantes manquantes
  const TEMPORARY = 0;
  
  // Utiliser des cast de type pour accéder aux API non standard
  const requestFS = ((window as any).RequestFileSystem || (window as any).webkitRequestFileSystem) as RequestFileSystemFunction | undefined;
  
  if (requestFS) {
    try {
      requestFS(TEMPORARY, 100, 
        () => {}, // Rien à faire si ce n'est pas en mode privé
        () => { blockers.push("Navigation privée détectée"); }
      );
    } catch (e) {
      // Ignorer les erreurs, cette vérification est optionnelle
    }
  }
  
  return blockers;
}

/**
 * Exécute le diagnostic et affiche les résultats dans la console
 */
export const runAndLogDiagnostics = async () => {
  console.group('🔍 Diagnostic Firebase Analytics');
  console.log('Démarrage du diagnostic...');
  
  const results = await runAnalyticsDiagnostics();
  
  let successCount = 0;
  let failureCount = 0;
  
  results.forEach((result, index) => {
    if (result.success) {
      successCount++;
      console.log(`✅ ${index + 1}. ${result.message}`);
    } else {
      failureCount++;
      console.warn(`❌ ${index + 1}. ${result.message}`);
    }
    
    if (result.details) {
      console.log('  Détails:', result.details);
    }
  });
  
  console.log(`\nRésultat: ${successCount} succès, ${failureCount} problèmes`);
  
  if (failureCount > 0) {
    console.log('\nRecommandations:');
    console.log('1. Vérifiez que la configuration Firebase est correcte');
    console.log('2. Assurez-vous que les paramètres de debug sont présents dans l\'URL');
    console.log('3. Désactivez les bloqueurs de publicités');
    console.log('4. Utilisez Chrome pour les tests');
    console.log('5. Vérifiez que le measurementId correspond à votre projet Google Analytics');
  }
  
  console.groupEnd();
  
  return {
    results,
    summary: {
      total: results.length,
      success: successCount,
      failure: failureCount
    }
  };
};


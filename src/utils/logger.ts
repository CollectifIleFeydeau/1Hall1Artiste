/**
 * Utilitaire de journalisation pour l'application
 * Permet de centraliser et formater les logs pour faciliter le débogage
 * Version améliorée avec capture des erreurs non gérées et interface visuelle
 */

// Niveaux de log disponibles
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Configuration des couleurs pour les différents niveaux de log
const LOG_COLORS = {
  info: '#4a5d94',  // Bleu de l'application
  warn: '#ff7a45',  // Orange de l'application
  error: '#e53935', // Rouge
  debug: '#2e7d32'  // Vert
};

// Stockage des logs pour l'interface visuelle
interface LogEntry {
  timestamp: string;
  module: string;
  message: string;
  level: LogLevel;
  data?: any;
}

// Tableau pour stocker les logs récents
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 100;

/**
 * Fonction de journalisation avec formatage et préfixe
 * @param module Nom du module/composant qui génère le log
 * @param message Message à journaliser
 * @param level Niveau de log (info, warn, error, debug)
 * @param data Données supplémentaires à journaliser
 */
export function log(
  module: string,
  message: string,
  level: LogLevel = 'info',
  data?: any
) {
  // Filtrer tous les logs indésirables
  if (level === 'info') {
    // Liste complète des motifs à filtrer
    const blacklistedPatterns = [
      'Rendu du marqueur utilisateur',
      'Position utilisateur mise à jour',
      'Position utilisateur mise à jour sur la carte',
      'redimensionné',
      'Marqueur utilisateur',
      'Rendu du marqueur',
      'Position utilisateur'
    ];
    
    // Vérifier si le message contient l'un des motifs à filtrer
    const shouldFilter = blacklistedPatterns.some(pattern => 
      message.includes(pattern) || 
      (data && JSON.stringify(data).includes(pattern))
    );
    
    // Ne pas filtrer les logs d'éloignement
    if (shouldFilter && !message.includes('Toast d\'éloignement')) {
      // Ignorer ces logs pour réduire le bruit dans la console
      return;
    }
  }
  
  const now = new Date();
  const timestamp = now.toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${module}]`;
  
  const style = `color: ${LOG_COLORS[level]}; font-weight: bold`;
  
  // Ajouter au stockage des logs
  logHistory.push({
    timestamp: now.toISOString(),
    module,
    message,
    level,
    data
  });
  
  // Limiter la taille de l'historique
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
  
  // Afficher dans la console
  switch (level) {
    case 'info':
      console.log(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'warn':
      console.warn(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'error':
      console.error(`%c${prefix} ${message}`, style, data ? data : '');
      break;
    case 'debug':
      console.debug(`%c${prefix} ${message}`, style, data ? data : '');
      break;
  }
}

/**
 * Crée un logger spécifique à un module
 * @param moduleName Nom du module pour lequel créer un logger
 */
export function createLogger(moduleName: string) {
  return {
    info: (message: string, data?: any) => log(moduleName, message, 'info', data),
    warn: (message: string, data?: any) => log(moduleName, message, 'warn', data),
    error: (message: string, data?: any) => log(moduleName, message, 'error', data),
    debug: (message: string, data?: any) => log(moduleName, message, 'debug', data)
  };
}

/**
 * Récupère l'historique des logs pour l'affichage
 */
export function getLogHistory() {
  return [...logHistory];
}

/**
 * Efface l'historique des logs
 */
export function clearLogHistory() {
  logHistory.length = 0;
}

/**
 * Initialise les gestionnaires d'erreurs globaux
 * À appeler dans le composant racine de l'application
 */
export function initErrorHandlers() {
  // Capturer les erreurs non gérées
  window.onerror = (message, source, lineno, colno, error) => {
    log('GlobalErrorHandler', `Erreur non gérée: ${message}`, 'error', { source, lineno, colno, error });
    return false; // Permet à l'erreur de se propager à la console du navigateur
  };

  // Capturer les rejets de promesses non gérés
  window.onunhandledrejection = (event) => {
    log('GlobalErrorHandler', 'Promesse rejetée non gérée', 'error', { reason: event.reason });
  };

  log('Logger', 'Gestionnaires d\'erreurs globaux initialisés', 'info');
}

/**
 * Composant pour afficher les logs dans l'interface
 * Peut être importé et utilisé dans un composant React
 */
export function createLogViewer() {
  // Créer un conteneur principal pour le visualiseur de logs
  const container = document.createElement('div');
  container.id = 'log-viewer-container';
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.right = '0';
  container.style.width = '500px';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  container.style.color = 'white';
  container.style.zIndex = '9999';
  container.style.display = 'none';
  container.style.borderRadius = '8px 0 0 0';
  container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  container.style.fontFamily = 'monospace';
  container.style.fontSize = '12px';
  
  // Créer une barre d'outils pour les actions
  const toolbar = document.createElement('div');
  toolbar.style.display = 'flex';
  toolbar.style.justifyContent = 'space-between';
  toolbar.style.padding = '8px';
  toolbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
  toolbar.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  toolbar.style.borderRadius = '8px 0 0 0';
  
  // Titre
  const title = document.createElement('div');
  title.textContent = 'Console de logs';
  title.style.fontWeight = 'bold';
  
  // Boutons d'action
  const actions = document.createElement('div');
  
  // Bouton pour effacer les logs
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Effacer';
  clearButton.style.marginRight = '8px';
  clearButton.style.padding = '2px 8px';
  clearButton.style.backgroundColor = '#ff7a45';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '4px';
  clearButton.style.color = 'white';
  clearButton.style.cursor = 'pointer';
  
  // Bouton pour copier les logs
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copier';
  copyButton.style.marginRight = '8px';
  copyButton.style.padding = '2px 8px';
  copyButton.style.backgroundColor = '#4a5d94';
  copyButton.style.border = 'none';
  copyButton.style.borderRadius = '4px';
  copyButton.style.color = 'white';
  copyButton.style.cursor = 'pointer';
  
  // Bouton pour fermer
  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.style.padding = '2px 8px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  closeButton.style.borderRadius = '4px';
  closeButton.style.color = 'white';
  closeButton.style.cursor = 'pointer';
  
  // Ajouter les boutons au conteneur d'actions
  actions.appendChild(clearButton);
  actions.appendChild(copyButton);
  actions.appendChild(closeButton);
  
  // Ajouter titre et actions à la barre d'outils
  toolbar.appendChild(title);
  toolbar.appendChild(actions);
  
  // Conteneur pour les logs
  const logViewerElement = document.createElement('div');
  logViewerElement.id = 'log-viewer';
  logViewerElement.style.height = '400px';
  logViewerElement.style.overflow = 'auto';
  logViewerElement.style.padding = '10px';
  
  // Filtres pour les logs
  const filters = document.createElement('div');
  filters.style.padding = '8px';
  filters.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
  filters.style.display = 'flex';
  filters.style.gap = '8px';
  
  // Créer des filtres pour chaque niveau de log
  const levels = ['info', 'warn', 'error', 'debug'];
  const filterButtons: {[key: string]: HTMLButtonElement} = {};
  
  levels.forEach(level => {
    const button = document.createElement('button');
    button.textContent = level.toUpperCase();
    button.dataset.level = level;
    button.style.padding = '2px 8px';
    button.style.backgroundColor = LOG_COLORS[level as LogLevel];
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.opacity = '1';
    
    filterButtons[level] = button;
    filters.appendChild(button);
  });
  
  // Assembler le conteneur principal
  container.appendChild(toolbar);
  container.appendChild(filters);
  container.appendChild(logViewerElement);
  
  // Créer un bouton pour afficher/masquer les logs
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Logs';
  toggleButton.style.position = 'fixed';
  toggleButton.style.left = '5px';
  toggleButton.style.bottom = '80px';
  toggleButton.style.zIndex = '9000';
  toggleButton.style.padding = '3px 6px';
  toggleButton.style.backgroundColor = 'rgba(74, 93, 148, 0.8)';
  toggleButton.style.color = 'white';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '4px';
  toggleButton.style.cursor = 'pointer';
  toggleButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
  toggleButton.style.fontSize = '10px';
  toggleButton.style.opacity = '0.8';
  toggleButton.style.transition = 'opacity 0.3s ease';
  
  // Ajouter un effet de survol pour rendre le bouton plus visible
  toggleButton.onmouseover = () => {
    toggleButton.style.opacity = '1';
  };
  toggleButton.onmouseout = () => {
    toggleButton.style.opacity = '0.8';
  };
  
  // Ajouter les éléments au DOM
  document.body.appendChild(container);
  document.body.appendChild(toggleButton);
  
  // État des filtres actifs
  const activeFilters = new Set(levels);
  
  // Gérer les filtres
  levels.forEach(level => {
    const button = filterButtons[level];
    button.addEventListener('click', () => {
      if (activeFilters.has(level)) {
        activeFilters.delete(level);
        button.style.opacity = '0.5';
      } else {
        activeFilters.add(level);
        button.style.opacity = '1';
      }
      updateLogDisplay();
    });
  });
  
  // Gérer l'effacement des logs
  clearButton.addEventListener('click', () => {
    clearLogHistory();
    updateLogDisplay();
    console.log('[LogViewer] Logs effacés');
  });
  
  // Gérer la copie des logs
  copyButton.addEventListener('click', () => {
    // Obtenir tous les logs filtrés
    const logs = getLogHistory()
      .filter(entry => activeFilters.has(entry.level))
      .map(entry => {
        const time = entry.timestamp.split('T')[1].split('.')[0];
        let logText = `[${time}][${entry.module}] ${entry.message}`;
        
        // Ajouter les données si disponibles
        if (entry.data) {
          logText += '\n  ' + JSON.stringify(entry.data, null, 2).replace(/\n/g, '\n  ');
        }
        
        return logText;
      })
      .join('\n');
    
    // Utiliser une méthode plus simple pour copier le texte
    const textArea = document.createElement('textarea');
    textArea.value = logs;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      const success = document.execCommand('copy');
      
      if (success) {
        // Afficher une confirmation visuelle
        copyButton.textContent = 'Copié !';
        copyButton.style.backgroundColor = '#2e7d32'; // Vert
        console.log('[LogViewer] Logs copiés dans le presse-papier');
      } else {
        copyButton.textContent = 'Erreur !';
        copyButton.style.backgroundColor = '#d32f2f'; // Rouge
        console.error('[LogViewer] Échec de la copie des logs');
      }
    } catch (error) {
      copyButton.textContent = 'Erreur !';
      copyButton.style.backgroundColor = '#d32f2f'; // Rouge
      console.error('[LogViewer] Erreur lors de la copie des logs', error);
    } finally {
      document.body.removeChild(textArea);
      
      // Rétablir le texte original après un court délai
      setTimeout(() => {
        copyButton.textContent = 'Copier';
        copyButton.style.backgroundColor = '#4a5d94';
      }, 1500);
    }
  });
  
  // Gérer la fermeture
  closeButton.addEventListener('click', () => {
    container.style.display = 'none';
  });
  
  // Gérer l'affichage/masquage des logs
  toggleButton.addEventListener('click', () => {
    const isVisible = container.style.display === 'block';
    container.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      // Faire défiler vers le bas lorsqu'on ouvre
      logViewerElement.scrollTop = logViewerElement.scrollHeight;
    }
  });
  
  // Fonction pour mettre à jour l'affichage des logs
  function updateLogDisplay() {
    const logs = getLogHistory();
    logViewerElement.innerHTML = '';
    
    // Créer un conteneur pour les logs sélectionnables
    const logsText = document.createElement('pre');
    logsText.style.margin = '0';
    logsText.style.whiteSpace = 'pre-wrap';
    logsText.style.userSelect = 'text';
    
    // Filtrer et afficher les logs
    logs
      .filter(entry => activeFilters.has(entry.level))
      .forEach((entry) => {
        const logLine = document.createElement('div');
        logLine.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
        logLine.style.padding = '3px 0';
        logLine.style.color = LOG_COLORS[entry.level];
        
        const time = entry.timestamp.split('T')[1].split('.')[0];
        logLine.textContent = `[${time}][${entry.module}] ${entry.message}`;
        
        // Ajouter des informations supplémentaires si disponibles
        if (entry.data) {
          const dataText = document.createElement('div');
          dataText.style.paddingLeft = '20px';
          dataText.style.fontSize = '11px';
          dataText.style.color = 'rgba(255, 255, 255, 0.7)';
          dataText.textContent = JSON.stringify(entry.data, null, 2);
          logLine.appendChild(dataText);
        }
        
        logsText.appendChild(logLine);
      });
    
    logViewerElement.appendChild(logsText);
    
    // Faire défiler vers le bas
    logViewerElement.scrollTop = logViewerElement.scrollHeight;
  }
  
  // Mettre à jour l'affichage toutes les secondes
  setInterval(updateLogDisplay, 1000);
  
  // Exposer l'API publique
  return {
    show: () => { 
      container.style.display = 'block'; 
      logViewerElement.scrollTop = logViewerElement.scrollHeight;
    },
    hide: () => { container.style.display = 'none'; },
    toggle: () => {
      const isVisible = container.style.display === 'block';
      container.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        logViewerElement.scrollTop = logViewerElement.scrollHeight;
      }
    },
    clear: () => {
      clearLogHistory();
      updateLogDisplay();
    }
  };
}

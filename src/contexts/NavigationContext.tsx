import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NavigationContext');

// Définir le type pour un élément d'historique
interface HistoryEntry {
  path: string;
  state: any;
  timestamp: number;
  title?: string;
}

// Définir l'interface du contexte de navigation
interface NavigationContextType {
  history: HistoryEntry[];
  currentIndex: number;
  goBack: () => void;
  goForward: () => void;
  navigateTo: (path: string, state?: any, title?: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  getPreviousPath: () => string | null;
}

// Créer le contexte
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Nombre maximum d'entrées d'historique à conserver
const MAX_HISTORY_LENGTH = 20;

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour l'historique et l'index actuel
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  
  // Déterminer si on peut naviguer en avant ou en arrière
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;
  
  // Initialiser l'historique avec la page actuelle lors du chargement
  useEffect(() => {
    const initialEntry: HistoryEntry = {
      path: location.pathname,
      state: location.state,
      timestamp: Date.now()
    };
    
    setHistory([initialEntry]);
    setCurrentIndex(0);
    
    logger.info('Historique de navigation initialisé', { path: location.pathname });
  }, []);
  
  // Mettre à jour l'historique lorsque la location change
  useEffect(() => {
    // Ignorer les changements lors de l'initialisation
    if (history.length === 0) return;
    
    // Vérifier si nous naviguons via goBack/goForward ou via une nouvelle navigation
    const isHistoryNavigation = history.some(entry => 
      entry.path === location.pathname && 
      JSON.stringify(entry.state) === JSON.stringify(location.state)
    );
    
    if (!isHistoryNavigation) {
      // Nouvelle navigation, ajouter à l'historique
      const newEntry: HistoryEntry = {
        path: location.pathname,
        state: location.state,
        timestamp: Date.now()
      };
      
      // Supprimer les entrées après l'index actuel (comme un navigateur)
      const newHistory = [...history.slice(0, currentIndex + 1), newEntry];
      
      // Limiter la taille de l'historique
      const trimmedHistory = newHistory.length > MAX_HISTORY_LENGTH 
        ? newHistory.slice(newHistory.length - MAX_HISTORY_LENGTH) 
        : newHistory;
      
      setHistory(trimmedHistory);
      setCurrentIndex(trimmedHistory.length - 1);
      
      logger.info('Nouvelle entrée ajoutée à l\'historique', { 
        path: location.pathname, 
        historyLength: trimmedHistory.length 
      });
    }
  }, [location, history, currentIndex]);
  
  // Fonction pour naviguer en arrière
  const goBack = () => {
    if (canGoBack) {
      const prevEntry = history[currentIndex - 1];
      navigate(prevEntry.path, { state: prevEntry.state });
      setCurrentIndex(currentIndex - 1);
      
      logger.info('Navigation arrière', { to: prevEntry.path });
    } else {
      logger.warn('Tentative de navigation arrière impossible');
    }
  };
  
  // Fonction pour naviguer en avant
  const goForward = () => {
    if (canGoForward) {
      const nextEntry = history[currentIndex + 1];
      navigate(nextEntry.path, { state: nextEntry.state });
      setCurrentIndex(currentIndex + 1);
      
      logger.info('Navigation avant', { to: nextEntry.path });
    } else {
      logger.warn('Tentative de navigation avant impossible');
    }
  };
  
  // Fonction pour naviguer vers une nouvelle page
  const navigateTo = (path: string, state?: any, title?: string) => {
    navigate(path, { state });
    
    // L'historique sera mis à jour via l'effet useEffect qui surveille location
    logger.info('Navigation vers', { path, hasState: !!state });
  };
  
  // Fonction pour obtenir le chemin précédent
  const getPreviousPath = (): string | null => {
    if (currentIndex > 0) {
      return history[currentIndex - 1].path;
    }
    return null;
  };
  
  // Valeur du contexte
  const contextValue: NavigationContextType = {
    history,
    currentIndex,
    goBack,
    goForward,
    navigateTo,
    canGoBack,
    canGoForward,
    getPreviousPath
  };
  
  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de navigation
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error('useNavigation doit être utilisé à l\'intérieur d\'un NavigationProvider');
  }
  
  return context;
};

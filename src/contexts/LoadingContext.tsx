import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingIndicator } from '@/components/LoadingIndicator';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {}
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Chargement...');
  
  // Démarrer le chargement avec un texte optionnel
  const startLoading = useCallback((text?: string) => {
    if (text) setLoadingText(text);
    setIsLoading(true);
  }, []);
  
  // Arrêter le chargement
  const stopLoading = useCallback(() => {
    setIsLoading(false);
    // Réinitialiser le texte par défaut après un court délai
    setTimeout(() => {
      setLoadingText('Chargement...');
    }, 300);
  }, []);
  
  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <LoadingIndicator fullScreen text={loadingText} />}
    </LoadingContext.Provider>
  );
};


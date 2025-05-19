import React, { createContext, useContext, useState, useEffect } from 'react';
type ReactNode = React.ReactNode;

export interface SettingsContextType {
  mapFirstExperience: boolean;
  toggleMapFirstExperience: () => void;
}

const SettingsContext = createContext<SettingsContextType>({ 
  mapFirstExperience: false,
  toggleMapFirstExperience: () => {}
});

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  // Load settings from localStorage or use defaults
  const [mapFirstExperience, setMapFirstExperience] = useState<boolean>(() => {
    const saved = localStorage.getItem('mapFirstExperience');
    return saved ? JSON.parse(saved) : false;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('mapFirstExperience', JSON.stringify(mapFirstExperience));
  }, [mapFirstExperience]);

  const toggleMapFirstExperience = () => {
    setMapFirstExperience(prev => !prev);
  };

  const value = {
    mapFirstExperience,
    toggleMapFirstExperience
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  return context;
}

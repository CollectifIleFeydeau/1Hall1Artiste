// Déclaration des types globaux pour l'application

interface AppConfig {
  BASE_URL: string;
}

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
}

export {};


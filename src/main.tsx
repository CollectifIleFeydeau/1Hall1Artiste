import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css'
import './styles/responsive.css'
import { initErrorHandlingSystem } from './utils/errorHandling'

// Filtrer les logs indésirables dans la console
if (process.env.NODE_ENV !== 'test') {
  // Sauvegarder les fonctions originales de la console
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  
  // Remplacer console.log pour filtrer les messages indésirables
  console.log = function(...args) {
    // Vérifier si le message contient des chaînes à filtrer
    const messageStr = args.join(' ');
    
    // Filtrer les logs liés à la position utilisateur et au rendu du marqueur
    if (messageStr.includes('Rendu du marqueur utilisateur') ||
        messageStr.includes('Position utilisateur mise à jour') ||
        messageStr.includes('Position utilisateur mise à jour sur la carte')) {
      // Ignorer ces logs
      return;
    }
    
    // Appeler la fonction originale pour les autres logs
    originalConsoleLog.apply(console, args);
  };
  
  // Remplacer console.info pour filtrer les messages indésirables
  console.info = function(...args) {
    // Vérifier si le message contient des chaînes à filtrer
    const messageStr = args.join(' ');
    
    // Filtrer les logs liés à la position utilisateur et au rendu du marqueur
    if (messageStr.includes('Rendu du marqueur utilisateur') ||
        messageStr.includes('Position utilisateur mise à jour') ||
        messageStr.includes('Position utilisateur mise à jour sur la carte')) {
      // Ignorer ces logs
      return;
    }
    
    // Appeler la fonction originale pour les autres logs
    originalConsoleInfo.apply(console, args);
  };
}

// Initialiser le système de gestion des erreurs
initErrorHandlingSystem();

createRoot(document.getElementById("root")!).render(<App />);

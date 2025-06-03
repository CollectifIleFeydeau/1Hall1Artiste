import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css'
import './styles/responsive.css'
import { initErrorHandlingSystem } from './utils/errorHandling'

// La gestion des logs est maintenant gérée par le système de logging centralisé
// dans utils/logger.ts

// Initialiser le système de gestion des erreurs
initErrorHandlingSystem();

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css'
import { initErrorHandlingSystem } from './utils/errorHandling'

// Initialiser le système de gestion des erreurs
initErrorHandlingSystem();

createRoot(document.getElementById("root")!).render(<App />);

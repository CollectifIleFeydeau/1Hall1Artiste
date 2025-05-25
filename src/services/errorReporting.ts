import emailjs from '@emailjs/browser';
import { getStoredErrors, clearStoredErrors } from './errorTracking';

// Configuration EmailJS
const EMAIL_SERVICE_ID = 'your_service_id'; // À remplacer par votre ID de service
const EMAIL_TEMPLATE_ID = 'your_template_id'; // À remplacer par votre ID de modèle
const EMAIL_USER_ID = 'your_user_id'; // À remplacer par votre ID utilisateur

/**
 * Initialiser EmailJS
 * À appeler au démarrage de l'application
 */
export const initErrorReporting = (): void => {
  emailjs.init(EMAIL_USER_ID);
};

/**
 * Envoyer les erreurs stockées par email
 * @returns Promise<boolean> - true si l'envoi a réussi, false sinon
 */
export const sendErrorsToEmail = async (): Promise<boolean> => {
  try {
    const errors = getStoredErrors();
    if (errors.length === 0) {
      console.log('Aucune erreur à envoyer');
      return true;
    }
    
    console.log(`Envoi de ${errors.length} erreurs par email`);
    
    // Préparer les données pour le modèle d'email
    const templateParams = {
      errors_json: JSON.stringify(errors, null, 2),
      error_count: errors.length,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      app_version: '1.0.0', // À mettre à jour avec la version de votre application
      app_name: 'Collectif Feydeau'
    };
    
    // Envoyer l'email
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    );
    
    if (response.status === 200) {
      console.log('Erreurs envoyées avec succès');
      clearStoredErrors();
      return true;
    } else {
      throw new Error(`Erreur lors de l'envoi: ${response.text}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des erreurs par email:', error);
    return false;
  }
};

/**
 * Vérifier et envoyer les erreurs automatiquement
 * À appeler périodiquement ou lors d'événements spécifiques
 */
export const checkAndSendErrors = async (): Promise<void> => {
  const errors = getStoredErrors();
  
  // Envoyer les erreurs si leur nombre dépasse un certain seuil
  if (errors.length >= 5) {
    await sendErrorsToEmail();
  }
};

import { toast as showToast } from "@/components/ui/use-toast";
import type { ToastActionElement } from "@/components/ui/toast";
import { createLogger } from "@/utils/logger";

// Créer un logger dédié pour les toasts
const logger = createLogger('ToastService');

// Types pour les toasts
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastOptions = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: ToastActionElement;
  source?: string; // Composant ou fonction qui a déclenché le toast
  context?: Record<string, any>; // Contexte supplémentaire pour le logging
};

/**
 * Service centralisé pour la gestion des toasts
 * Permet de logger systématiquement les toasts et leurs conditions d'apparition
 */
class ToastService {
  /**
   * Affiche un toast et le log
   */
  show(options: ToastOptions): void {
    const { title, description, variant = 'default', duration, action, source, context } = options;
    
    // Déterminer le type de toast en fonction du variant
    const toastType: ToastType = variant === 'destructive' ? 'error' : 'info';
    
    // Afficher le toast
    showToast({
      title,
      description,
      variant,
      duration,
      action
    });
    
    // Logger le toast avec son contexte
    this.logToast(title, toastType, description, source, context);
  }
  
  /**
   * Affiche un toast de succès
   */
  success(options: Omit<ToastOptions, 'variant'>): void {
    this.show({
      ...options,
      variant: 'default'
    });
  }
  
  /**
   * Affiche un toast d'erreur
   */
  error(options: Omit<ToastOptions, 'variant'>): void {
    this.show({
      ...options,
      variant: 'destructive'
    });
  }
  
  /**
   * Affiche un toast d'information sur la localisation
   */
  location(options: Omit<ToastOptions, 'source'>): void {
    this.show({
      ...options,
      source: 'LocationService'
    });
  }
  
  /**
   * Log un toast dans la console
   * Désactivation des logs systématiques pour réduire le bruit dans la console
   * Seuls les toasts de type error sont loggés pour faciliter le débogage
   */
  private logToast(
    message: string,
    type: ToastType,
    description?: string,
    source?: string,
    context?: Record<string, any>
  ): void {
    // Ne logger que les toasts d'erreur pour réduire le bruit dans la console
    if (type === 'error') {
      const logMessage = `Toast [${type}]: ${message}${description ? ` - ${description}` : ''}`;
      const logContext = {
        source: source || 'Unknown',
        ...context
      };
      logger.warn(logMessage, logContext);
    }
    // Les autres types de toasts (info, success, warning) ne génèrent plus de logs
  }
}

// Exporter une instance unique du service
export const toastService = new ToastService();


import React from 'react';
import { captureError } from '@/services/errorTracking';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Composant qui capture les erreurs dans ses composants enfants
 * et affiche un composant de secours en cas d'erreur
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State;
  props: Props;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Capturer l'erreur avec notre service de suivi
    captureError(error, this.props.componentName, {
      componentStack: errorInfo.componentStack
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Afficher le composant de secours ou un message d'erreur par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">
            Une erreur est survenue
          </h3>
          <p className="mt-2 text-sm text-red-700">
            Nous sommes désolés, une erreur inattendue s'est produite. 
            L'équipe technique a été informée et travaille à résoudre le problème.
          </p>
          <button
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200"
            onClick={() => {
              try {
                if (window.location && window.location.reload) {
                  window.location.reload();
                } else {
                  window.location.href = window.location.origin + window.location.pathname;
                }
              } catch (error) {
                console.error('[ErrorBoundary] Error reloading page:', error);
                // Fallback: essayer de naviguer vers la page d'accueil
                try {
                  window.location.href = '/';
                } catch (fallbackError) {
                  console.error('[ErrorBoundary] Fallback navigation failed:', fallbackError);
                }
              }
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

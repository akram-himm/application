import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour le state pour afficher l'UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logger l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Sauvegarder les détails de l'erreur
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Sauvegarder l'erreur dans localStorage pour debug
    try {
      const errorLog = {
        message: error.toString(),
        stack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      };
      
      // Récupérer les erreurs existantes
      const existingErrors = JSON.parse(localStorage.getItem('app_error_log') || '[]');
      existingErrors.push(errorLog);
      
      // Garder seulement les 10 dernières erreurs
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      
      localStorage.setItem('app_error_log', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  handleReset = () => {
    // Réinitialiser l'état et recharger la page
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.reload();
  };

  handleResetState = () => {
    // Réinitialiser sans recharger
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback en cas d'erreur
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9] flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-8">
              {/* Icône d'erreur */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h1 className="text-2xl font-bold text-[#1E1F22] text-center mb-4">
                Oops! Quelque chose s'est mal passé
              </h1>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6">
                L'application a rencontré une erreur inattendue. 
                Vos données sont en sécurité. Vous pouvez essayer de continuer ou recharger la page.
              </p>

              {/* Détails de l'erreur (mode développement) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer text-sm text-gray-600 font-medium mb-2">
                    Détails techniques (pour les développeurs)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded">
                      {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                        <pre>{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleResetState}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Essayer de continuer
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Recharger la page
                </button>
              </div>

              {/* Compteur d'erreurs */}
              {this.state.errorCount > 1 && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Cette erreur s'est produite {this.state.errorCount} fois pendant cette session
                </p>
              )}
            </div>

            {/* Message d'aide */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Si le problème persiste, essayez de :
              </p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1">
                <li>• Vider le cache de votre navigateur</li>
                <li>• Redémarrer l'application</li>
                <li>• Vérifier votre connexion internet</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Si pas d'erreur, afficher les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;
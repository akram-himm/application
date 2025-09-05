import React, { useState, useEffect } from 'react';
import autoSaveService from '../../services/autoSave';

const SaveIndicator = () => {
  const [status, setStatus] = useState('idle');
  const [lastSave, setLastSave] = useState(null);

  useEffect(() => {
    // Écouter les changements de statut
    const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'saved') {
        setLastSave(autoSaveService.getTimeSinceLastSave());
      }
    };

    autoSaveService.addStatusListener(handleStatusChange);

    // Mettre à jour le temps depuis la dernière sauvegarde
    const interval = setInterval(() => {
      setLastSave(autoSaveService.getTimeSinceLastSave());
    }, 10000); // Toutes les 10 secondes

    return () => {
      autoSaveService.removeStatusListener(handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  // Ne rien afficher si idle
  if (status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        );
      case 'saved':
        return (
          <svg className="w-4 h-4 text-green-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"/>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Sauvegarde...';
      case 'saved':
        return lastSave ? `Sauvegardé il y a ${lastSave}` : 'Sauvegardé';
      case 'error':
        return 'Erreur de sauvegarde';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'saved':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusColor()} transition-all duration-300 ${
        status === 'saved' ? 'opacity-90' : 'opacity-100'
      }`}
    >
      {getStatusIcon()}
      <span className="text-xs font-medium">{getStatusText()}</span>
    </div>
  );
};

export default SaveIndicator;
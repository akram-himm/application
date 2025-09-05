import React, { useEffect } from 'react';
import Card from './Card';

/**
 * Composant Modal réutilisable
 * @param {boolean} isOpen - État d'ouverture de la modal
 * @param {function} onClose - Fonction de fermeture
 * @param {string} title - Titre de la modal
 * @param {React.ReactNode} children - Contenu de la modal
 * @param {string} size - Taille de la modal (small, medium, large)
 * @param {boolean} showCloseButton - Afficher le bouton de fermeture
 * @param {string} className - Classes CSS additionnelles
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  className = '',
  ...props
}) => {
  // Gérer la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Tailles prédéfinies
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-xl',
    large: 'max-w-3xl',
    xlarge: 'max-w-5xl',
    full: 'max-w-7xl'
  };

  const sizeClass = sizes[size] || sizes.medium;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <Card
          variant="large"
          className={`relative w-full ${sizeClass} transform transition-all ${className}`}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-6">
              {title && (
                <h2 className="text-2xl font-bold text-[#1E1F22]">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="modal-content">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Variante pour les confirmations
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmButtonClass = 'bg-blue-500 hover:bg-blue-600 text-white',
  ...props 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="small"
      {...props}
    >
      <div className="space-y-6">
        <p className="text-gray-700">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Variante pour les alertes
export const AlertModal = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  buttonText = 'OK',
  ...props
}) => {
  const types = {
    info: { icon: 'ℹ️', color: 'text-blue-500' },
    success: { icon: '✅', color: 'text-green-500' },
    warning: { icon: '⚠️', color: 'text-amber-500' },
    error: { icon: '❌', color: 'text-red-500' }
  };

  const config = types[type] || types.info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
      {...props}
    >
      <div className="text-center space-y-4">
        <div className={`text-5xl ${config.color}`}>{config.icon}</div>
        {title && <h3 className="text-xl font-semibold text-[#1E1F22]">{title}</h3>}
        <p className="text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
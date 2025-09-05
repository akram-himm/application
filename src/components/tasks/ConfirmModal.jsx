import React from 'react';
import ReactDOM from 'react-dom';

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
  if (!show) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  // Utiliser un portail pour rendre dans body
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={handleCancel}
      />
      
      {/* Modal - toujours centré dans la viewport */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm mx-4">
        <p className="text-white mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
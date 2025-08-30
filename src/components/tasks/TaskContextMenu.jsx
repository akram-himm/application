import React, { useEffect, useRef } from 'react';

const TaskContextMenu = ({ 
  show, 
  x, 
  y, 
  onEdit, 
  onDelete, 
  onMove,
  onClose,
  moveToText 
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
        // Restaurer le focus sur un input
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="Ajouter"]');
          if (input) input.focus();
        }, 50);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
        setTimeout(() => {
          const input = document.querySelector('input[placeholder*="Ajouter"]');
          if (input) input.focus();
        }, 50);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
      style={{ 
        left: x, 
        top: y,
        minWidth: '200px'
      }}
    >
      {/* Éditer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-3"
      >
        <span className="text-lg">✏️</span>
        <span>Éditer</span>
      </button>
      
      {/* Séparateur */}
      <div className="h-px bg-gray-700/50" />
      
      {/* Supprimer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full px-4 py-3 text-left text-gray-200 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-3"
      >
        <span className="text-lg">🗑️</span>
        <span>Supprimer</span>
      </button>
      
      {/* Séparateur */}
      <div className="h-px bg-gray-700/50" />
      
      {/* Déplacer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMove();
        }}
        className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-3"
      >
        <span className="text-lg">📋</span>
        <span>{moveToText}</span>
      </button>
    </div>
  );
};

export default TaskContextMenu;
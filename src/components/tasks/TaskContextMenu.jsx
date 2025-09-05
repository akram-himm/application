import React, { useEffect, useRef, useState } from 'react';

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
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  useEffect(() => {
    if (show && menuRef.current) {
      const menu = menuRef.current;
      const menuWidth = menu.offsetWidth || 200;
      const menuHeight = menu.offsetHeight || 150;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const margin = 20;
      
      // Position par défaut : coin supérieur droit du menu sous le curseur
      let newX = x - menuWidth;  // Menu à gauche du curseur
      let newY = y;               // Aligné avec le curseur
      
      // Si pas de place à gauche, mettre à droite
      if (newX < margin) {
        newX = x;
      }
      
      // Si pas de place en bas, mettre au-dessus
      if (newY + menuHeight > windowHeight - margin) {
        newY = y - menuHeight;
      }
      
      // Vérifications finales
      newX = Math.max(margin, Math.min(newX, windowWidth - menuWidth - margin));
      newY = Math.max(margin, Math.min(newY, windowHeight - menuHeight - margin));
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [show, x, y]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
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
      className="fixed z-[100] bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
      style={{ 
        left: `${adjustedPosition.x}px`, 
        top: `${adjustedPosition.y}px`,
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
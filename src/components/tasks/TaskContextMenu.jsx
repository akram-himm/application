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
      
      // Position par défaut : coin supérieur droit du menu au niveau du curseur
      let newX = x - menuWidth;  // Menu à gauche du curseur
      let newY = y;               // Coin supérieur au niveau du curseur
      
      // Si pas de place à gauche, mettre à droite
      if (newX < margin) {
        newX = x;
      }
      
      // Si pas de place en bas, mettre au-dessus
      if (newY + menuHeight > windowHeight - margin) {
        newY = y - menuHeight;
      }
      
      // Vérifications finales des limites
      newX = Math.max(margin, Math.min(newX, windowWidth - menuWidth - margin));
      newY = Math.max(margin, Math.min(newY, windowHeight - menuHeight - margin));
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [show, x, y]);

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
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-150 ease-out"
      style={{ 
        left: adjustedPosition.x + 'px', 
        top: adjustedPosition.y + 'px',
        minWidth: '200px',
        transformOrigin: x > window.innerWidth / 2 ? 'top right' : 'top left',
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0.95)'
      }}
    >
      {/* Éditer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
        </svg>
        <span>Éditer</span>
      </button>
      
      {/* Séparateur */}
      <div className="h-px bg-gray-200" />
      
      {/* Supprimer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
        </svg>
        <span>Supprimer</span>
      </button>
      
      {/* Séparateur */}
      <div className="h-px bg-gray-200" />
      
      {/* Déplacer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMove();
        }}
        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          <path d="M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM1 7.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z"/>
        </svg>
        <span>{moveToText}</span>
      </button>
    </div>
  );
};

export default TaskContextMenu;
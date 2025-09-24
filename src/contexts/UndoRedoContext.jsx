import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

const UndoRedoContext = createContext();

export const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
};

export const UndoRedoProvider = ({ children }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fonction pour sauvegarder une action dans l'historique
  const saveAction = useCallback((action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); // Vider la pile de redo quand une nouvelle action est faite
  }, []);

  // Fonction d'annulation générique
  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    // Exécuter la fonction d'annulation de l'action
    if (lastAction.undo) {
      lastAction.undo();
    }

    // Ajouter à la pile de redo
    setRedoStack(prev => [...prev, lastAction]);

    // Afficher notification
    setNotificationMessage(lastAction.description ? `Annulé : ${lastAction.description}` : 'Action annulée');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);

    return true;
  }, [undoStack]);

  // Fonction de refaire
  const redo = useCallback(() => {
    if (redoStack.length === 0) return false;

    const actionToRedo = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    // Exécuter la fonction de redo de l'action
    if (actionToRedo.redo) {
      actionToRedo.redo();
    }

    // Remettre dans la pile d'undo
    setUndoStack(prev => [...prev, actionToRedo]);

    // Afficher notification
    setNotificationMessage(actionToRedo.description ? `Refait : ${actionToRedo.description}` : 'Action refaite');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);

    return true;
  }, [redoStack]);

  // Vider les piles
  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Écouter les raccourcis clavier globalement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const value = {
    undoStack,
    redoStack,
    saveAction,
    undo,
    redo,
    clearHistory,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}

      {/* Notification globale */}
      {showNotification && ReactDOM.createPortal(
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100000] animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>{notificationMessage}</span>
          </div>
        </div>,
        document.body
      )}
    </UndoRedoContext.Provider>
  );
};
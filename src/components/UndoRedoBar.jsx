import React from 'react';
import { useUndoRedo } from '../contexts/UndoRedoContext';

const UndoRedoBar = () => {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full border border-gray-200 shadow-sm p-1 z-[9999]">
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`p-2 rounded-md text-sm font-medium transition-all ${
          canUndo
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Annuler (Ctrl+Z)"
      >
        <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" transform="scale(-1, 1) translate(-16, 0)"/>
        </svg>
      </button>
      <div className="w-px h-6 bg-gray-200"></div>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`p-2 rounded-md text-sm font-medium transition-all ${
          canRedo
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Refaire (Ctrl+Y)"
      >
        <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308c-.12.1-.12.284 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
        </svg>
      </button>
    </div>
  );
};

export default UndoRedoBar;
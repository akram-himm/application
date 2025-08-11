import React from 'react';

const ColumnSelectorModal = ({ availableColumns, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-5 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white/81 font-semibold text-lg mb-4">Ajouter une colonne</h3>
        
        <div className="space-y-3">
          {availableColumns.map(column => (
            <button
              key={column.id}
              onClick={() => onSelect(column.id)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.055] hover:bg-white/[0.08] border border-white/[0.094] rounded-lg text-white/81 transition-all duration-150 group"
            >
              <span className="text-2xl">{column.icon}</span>
              <div className="text-left">
                <div className="font-medium">{column.label}</div>
                <div className="text-xs text-white/46 group-hover:text-white/60">
                  {column.id === 'assignee' ? 'Attribuer les tâches' : 'Suivre la progression'}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2.5 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-lg text-sm font-medium hover:bg-white/[0.08] hover:text-white/60 transition-all duration-150"
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

export default ColumnSelectorModal;
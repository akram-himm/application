import React, { useState, useEffect } from 'react';

const CustomOptionsModal = ({ type, options, onSave, onClose }) => {
  const [localOptions, setLocalOptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#3B82F6');
  
  useEffect(() => {
    // Retirer le bouton "+" des options existantes
    setLocalOptions(options.filter(opt => !opt.isAddButton));
  }, [options]);
  
  const handleAdd = () => {
    const newOption = {
      id: `custom-${Date.now()}`,
      name: `Nouveau ${type === 'status' ? 'statut' : 'priorité'}`,
      color: '#3B82F6'
    };
    setLocalOptions([...localOptions, newOption]);
    setEditingId(newOption.id);
    setEditingName(newOption.name);
    setEditingColor(newOption.color);
  };
  
  const handleEdit = (option) => {
    setEditingId(option.id);
    setEditingName(option.name);
    setEditingColor(option.color);
  };
  
  const handleSaveEdit = () => {
    setLocalOptions(localOptions.map(opt => 
      opt.id === editingId 
        ? { ...opt, name: editingName, color: editingColor }
        : opt
    ));
    setEditingId(null);
  };
  
  const handleDelete = (id) => {
    // Ne pas supprimer les options par défaut
    const defaultIds = ['not-started', 'in-progress', 'completed', 'low', 'medium', 'high'];
    if (!defaultIds.includes(id)) {
      setLocalOptions(localOptions.filter(opt => opt.id !== id));
    }
  };
  
  const handleSave = () => {
    // Sauvegarder les options sans le bouton "+"
    onSave(localOptions);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white/81 mb-4">
          Gérer les {type === 'status' ? 'statuts' : 'priorités'}
        </h2>
        
        <div className="space-y-3 mb-4">
          {localOptions.map(option => (
            <div key={option.id} className="flex items-center gap-2">
              {editingId === option.id ? (
                <>
                  <input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded text-sm hover:bg-white/[0.08] transition-colors"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <div 
                    className="w-8 h-8 rounded border border-white/[0.094]"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="flex-1 text-white/81 text-sm">{option.name}</span>
                  <button
                    onClick={() => handleEdit(option)}
                    className="px-2 py-1 text-white/46 hover:text-white/81 transition-colors"
                  >
                    ✏️
                  </button>
                  {!['not-started', 'in-progress', 'completed', 'low', 'medium', 'high'].includes(option.id) && (
                    <button
                      onClick={() => handleDelete(option.id)}
                      className="px-2 py-1 text-red-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        <button
          onClick={handleAdd}
          className="w-full mb-4 px-3 py-2 bg-white/[0.055] hover:bg-white/[0.08] border border-white/[0.094] rounded text-white/81 text-sm transition-all duration-150"
        >
          + Ajouter {type === 'status' ? 'un statut' : 'une priorité'}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-[rgb(35,131,226)] text-white rounded text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomOptionsModal;
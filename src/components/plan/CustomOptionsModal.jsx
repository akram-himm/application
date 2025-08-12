import React, { useState, useEffect } from 'react';

const CustomOptionsModal = ({ type, options, onSave, onClose }) => {
  const [localOptions, setLocalOptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#3B82F6');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Couleurs prédéfinies pour faciliter le choix
  const presetColors = [
    '#EF4444', // Rouge
    '#F97316', // Orange
    '#F59E0B', // Ambre
    '#EAB308', // Jaune
    '#84CC16', // Lime
    '#22C55E', // Vert
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#0EA5E9', // Sky
    '#3B82F6', // Bleu
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#A855F7', // Purple
    '#D946EF', // Fuchsia
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#6B7280', // Gris
  ];
  
  useEffect(() => {
    setLocalOptions(options || []);
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
    if (!editingName.trim()) return;
    
    setLocalOptions(localOptions.map(opt => 
      opt.id === editingId 
        ? { ...opt, name: editingName.trim(), color: editingColor }
        : opt
    ));
    setEditingId(null);
    setEditingName('');
    setEditingColor('#3B82F6');
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#3B82F6');
    setShowColorPicker(false);
  };
  
  const handleDelete = (id) => {
    // Ne pas supprimer les options par défaut
    const defaultIds = ['not-started', 'in-progress', 'completed', 'low', 'medium', 'high'];
    if (!defaultIds.includes(id)) {
      setLocalOptions(localOptions.filter(opt => opt.id !== id));
    }
  };
  
  const handleSave = () => {
    onSave(localOptions);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && editingId) {
      handleSaveEdit();
    }
    if (e.key === 'Escape' && editingId) {
      handleCancelEdit();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div 
        className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 w-[450px] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-white/81 mb-5">
          Gérer les {type === 'status' ? 'statuts' : 'priorités'}
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-2 mb-5 max-h-[400px] pr-2">
          {localOptions.map(option => {
            const isDefault = ['not-started', 'in-progress', 'completed', 'low', 'medium', 'high'].includes(option.id);
            
            return (
              <div key={option.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                {editingId === option.id ? (
                  <>
                    {/* Color Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-10 h-10 rounded-md border-2 border-white/20 cursor-pointer hover:border-white/40 transition-colors"
                        style={{ backgroundColor: editingColor }}
                      />
                      
                      {showColorPicker && (
                        <div className="absolute top-12 left-0 z-10 bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-3 shadow-xl">
                          <div className="grid grid-cols-6 gap-1.5 mb-3">
                            {presetColors.map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setEditingColor(color);
                                  setShowColorPicker(false);
                                }}
                                className="w-8 h-8 rounded border-2 border-transparent hover:border-white/40 transition-colors"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={editingColor}
                            onChange={(e) => setEditingColor(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Name Input */}
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 bg-white/[0.055] border border-white/20 rounded-md text-white/81 text-sm focus:outline-none focus:border-[rgb(35,131,226)] focus:bg-white/[0.08]"
                      placeholder={`Nom du ${type === 'status' ? 'statut' : 'priorité'}`}
                      autoFocus
                    />
                    
                    {/* Actions */}
                    <button
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      title="Sauvegarder"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 0 1 1.06 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-md hover:bg-white/[0.08] transition-colors"
                      title="Annuler"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Color Display */}
                    <div 
                      className="w-10 h-10 rounded-md border border-white/[0.094] shadow-sm"
                      style={{ backgroundColor: option.color }}
                    />
                    
                    {/* Name */}
                    <span className="flex-1 text-white/81 text-sm font-medium">
                      {option.name}
                      {isDefault && (
                        <span className="ml-2 text-xs text-white/30">(par défaut)</span>
                      )}
                    </span>
                    
                    {/* Actions */}
                    <button
                      onClick={() => handleEdit(option)}
                      className="p-1.5 text-white/46 hover:text-white/81 hover:bg-white/[0.055] rounded transition-all"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                      </svg>
                    </button>
                    
                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                          <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="w-full mb-5 px-4 py-2.5 bg-white/[0.055] hover:bg-white/[0.08] border border-white/[0.094] rounded-lg text-white/81 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
          </svg>
          Ajouter {type === 'status' ? 'un statut' : 'une priorité'}
        </button>
        
        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-lg text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-[rgb(35,131,226)] text-white rounded-lg text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomOptionsModal;
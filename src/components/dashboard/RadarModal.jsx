import React, { useState, useEffect } from 'react';

const RadarModal = ({ isOpen, onClose, onSave, editingRadar }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: ''
  });

  useEffect(() => {
    if (editingRadar) {
      setFormData({
        name: editingRadar.name || '',
        icon: editingRadar.icon || '',
        description: editingRadar.description || ''
      });
    } else {
      setFormData({
        name: '',
        icon: '',
        description: ''
      });
    }
  }, [editingRadar]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Veuillez entrer un nom pour le radar');
      return;
    }

    const radarData = {
      ...formData,
      icon: formData.icon || '📊',
      description: formData.description || 'Nouveau domaine à suivre'
    };

    if (!editingRadar) {
      radarData.id = formData.name.toLowerCase().replace(/\s+/g, '-');
      radarData.subjects = [];
      radarData.progress = 0;
    }

    onSave(radarData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 w-full max-w-[400px] shadow-2xl">
        <h2 className="text-xl font-semibold text-white/81 mb-5">
          {editingRadar ? 'Modifier le radar' : 'Nouveau radar'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Développement Web"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Icône
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ex: 💻"
              maxLength={2}
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description courte"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
            />
          </div>
          
          <div className="flex gap-2 mt-6 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-md text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-[rgb(35,131,226)] text-white rounded-md text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150"
            >
              {editingRadar ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RadarModal;
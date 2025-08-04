import React, { useState, useEffect } from 'react';

const SubjectModal = ({ isOpen, onClose, onSave, editingSubject }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: 0
  });

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name || '',
        value: editingSubject.value || 0
      });
    } else {
      setFormData({
        name: '',
        value: 0
      });
    }
  }, [editingSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Veuillez entrer un nom pour la matière');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-xl p-6 w-full max-w-[400px] shadow-2xl animate-scaleIn">
        <h2 className="text-xl font-semibold text-white/81 mb-5">
          {editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
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
              placeholder="Ex: Informatique"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Progression (%)
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
              min="0"
              max="100"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
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
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;
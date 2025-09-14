import React, { useState, useEffect, useRef } from 'react';
import { uniformStyles } from '../../styles/uniformStyles';

const SubjectModal = ({ isOpen, onClose, onSave, editingSubject }) => {
  const [formData, setFormData] = useState({
    name: '',
    value: 50 // Valeur par défaut à 50% pour éviter l'empilement au centre
  });
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingSubject) {
      setFormData({
        name: editingSubject.name || '',
        value: editingSubject.value || 50
      });
    } else {
      setFormData({
        name: '',
        value: 50
      });
    }
  }, [editingSubject]);

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Veuillez entrer un nom pour la matière');
      return;
    }

    onSave(formData);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={uniformStyles.modal.darkOverlay + ' animate-fadeIn'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={uniformStyles.modal.darkContainer + ' animate-scaleIn'}>
        <h2 className={uniformStyles.modal.darkTitle}>
          {editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={uniformStyles.modal.darkLabel}>
              Nom
            </label>
            <input
              ref={inputRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mathématiques"
              className={uniformStyles.modal.darkInput}
              maxLength={30}
            />
          </div>
          
          <div className="mb-4">
            <label className={uniformStyles.modal.darkLabel}>
              Progression initiale (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                min="0"
                max="100"
                step="10"
                className="flex-1 h-2 bg-white/[0.055] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(35,131,226) 0%, rgb(35,131,226) ${formData.value}%, rgba(255,255,255,0.055) ${formData.value}%, rgba(255,255,255,0.055) 100%)`
                }}
              />
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                min="0"
                max="100"
                className={'w-16 px-2 py-1 text-center ' + uniformStyles.modal.darkInput}
              />
            </div>
            <p className="text-xs text-white/46 mt-2">
              Conseil : Utilisez une valeur supérieure à 0 pour éviter l'empilement au centre
            </p>
          </div>
          
          <div className="flex gap-2 mt-6 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={uniformStyles.modal.darkButtonCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={uniformStyles.modal.darkButtonSubmit}
            >
              {editingSubject ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;
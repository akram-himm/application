import React, { useState, useEffect } from 'react';
import { uniformStyles } from '../../styles/uniformStyles';

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
      className={uniformStyles.modal.darkOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={uniformStyles.modal.darkContainer}>
        <h2 className={uniformStyles.modal.darkTitle}>
          {editingRadar ? 'Modifier le radar' : 'Nouveau radar'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={uniformStyles.modal.darkLabel}>
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Développement Web"
              className={uniformStyles.modal.darkInput}
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className={uniformStyles.modal.darkLabel}>
              Icône
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ex: 💻"
              maxLength={2}
              className={uniformStyles.modal.darkInput}
            />
          </div>
          
          <div className="mb-4">
            <label className={uniformStyles.modal.darkLabel}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description courte"
              className={uniformStyles.modal.darkInput}
            />
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
              {editingRadar ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RadarModal;
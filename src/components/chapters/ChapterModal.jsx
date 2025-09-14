import React, { useState, useEffect } from 'react';
import { uniformStyles } from '../../styles/uniformStyles';

const ChapterModal = ({ isOpen, onClose, onSave, editingItem, editingType }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    priority: 'medium',
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    if (isOpen) {
      if (editingType === 'chapter' && editingItem) {
        setFormData({
          name: editingItem.name,
          icon: '',
          priority: 'medium',
          startDate: '',
          endDate: ''
        });
      } else if (editingType === 'subtopic' && editingItem?.subtopic) {
        setFormData({
          name: editingItem.subtopic.name,
          icon: editingItem.subtopic.icon || '',
          priority: editingItem.subtopic.priority || 'medium',
          startDate: editingItem.subtopic.startDate || '',
          endDate: editingItem.subtopic.endDate || ''
        });
      } else {
        setFormData({
          name: '',
          icon: '',
          priority: 'medium',
          startDate: '',
          endDate: ''
        });
      }
    }
  }, [isOpen, editingItem, editingType]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };
  
  if (!isOpen) return null;
  
  const isChapter = editingType === 'chapter';
  const isEditing = isChapter ? !!editingItem : !!editingItem?.subtopic;
  
  return (
    <div 
      className={uniformStyles.modal.darkOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={uniformStyles.modal.darkContainer}>
        <h2 className={uniformStyles.modal.darkTitle}>
          {isEditing ? 'Modifier' : 'Nouveau'} {isChapter ? 'chapitre' : 'sous-chapitre'}
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
              placeholder={isChapter ? 'Ex: Algèbre' : 'Ex: Équations du second degré'}
              className={uniformStyles.modal.darkInput}
              autoFocus
            />
          </div>
          
          {!isChapter && (
            <>
              <div className="mb-4">
                <label className={uniformStyles.modal.darkLabel}>
                  Icône
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ex: 📐"
                  maxLength={2}
                  className={uniformStyles.modal.darkInput}
                />
              </div>
              
              <div className="mb-4">
                <label className={uniformStyles.modal.darkLabel}>
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
                >
                  <option value="low">Pas de panique</option>
                  <option value="medium">Important</option>
                  <option value="high">Très important</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className={uniformStyles.modal.darkLabel}>
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
                />
              </div>
              
              <div className="mb-4">
                <label className={uniformStyles.modal.darkLabel}>
                  Date limite
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
                />
              </div>
            </>
          )}
          
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
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterModal;
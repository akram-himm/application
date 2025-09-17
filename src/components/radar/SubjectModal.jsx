import React, { useState, useEffect, useRef, useContext } from 'react';
import { uniformStyles } from '../../styles/uniformStyles';
import { AppContext } from '../../contexts/AppContext';
import { useParams } from 'react-router-dom';

const SubjectModal = ({ isOpen, onClose, onSave, editingSubject }) => {
  const { radars } = useContext(AppContext);
  const { radarId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    value: 0 // Valeur par défaut à 0% pour les nouvelles matières
  });
  const [duplicateError, setDuplicateError] = useState('');

  const inputRef = useRef(null);

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

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Vérifier les doublons en temps réel
  useEffect(() => {
    if (formData.name.trim() && !editingSubject) {
      const radar = radars.find(r => r.id === radarId);
      if (radar && radar.subjects) {
        const duplicate = radar.subjects.find(s =>
          s.name.toLowerCase() === formData.name.trim().toLowerCase()
        );
        if (duplicate) {
          setDuplicateError(`Une matière "${duplicate.name}" existe déjà`);
        } else {
          setDuplicateError('');
        }
      }
    } else if (editingSubject && formData.name.trim()) {
      const radar = radars.find(r => r.id === radarId);
      if (radar && radar.subjects) {
        const duplicate = radar.subjects.find(s =>
          s.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          s.id !== editingSubject.id
        );
        if (duplicate) {
          setDuplicateError(`Une matière "${duplicate.name}" existe déjà`);
        } else {
          setDuplicateError('');
        }
      }
    } else {
      setDuplicateError('');
    }
  }, [formData.name, radars, radarId, editingSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() === '') {
      alert('Veuillez entrer un nom pour la matière');
      return;
    }

    if (duplicateError) {
      return; // Ne pas soumettre si doublon
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
      className={uniformStyles.modal.darkOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={uniformStyles.modal.darkContainer}>
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
              className={`${uniformStyles.modal.darkInput} ${duplicateError ? 'border-red-500' : ''}`}
              maxLength={30}
            />
            {duplicateError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {duplicateError}
              </p>
            )}
          </div>

          {/* Suppression du champ de progression initiale - la valeur sera toujours 0 */}
          {editingSubject && (
            <div className="mb-6">
              <label className={uniformStyles.modal.darkLabel}>
                Progression actuelle (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(107, 114, 128) 0%, rgb(107, 114, 128) ${formData.value}%, rgb(229, 231, 235) ${formData.value}%, rgb(229, 231, 235) 100%)`
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
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={uniformStyles.modal.darkButtonCancel}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`${uniformStyles.modal.darkButtonSubmit} ${duplicateError ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!!duplicateError}
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
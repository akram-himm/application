import React, { useState, useEffect } from 'react';

const TaskModal = ({ isOpen, onClose, onSave, editingTask, radars, taskType, selectedDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    progress: 0,
    tag: null,
    // Pour tâches quotidiennes
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    // Pour tâches hebdomadaires
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        ...formData,
        ...editingTask
      });
    } else {
      // Réinitialiser pour une nouvelle tâche
      setFormData({
        name: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        progress: 0,
        tag: null,
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: '09:00',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  }, [editingTask, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Le nom de la tâche est requis');
      return;
    }
    onSave(formData);
  };

  const handleRadarChange = (radarId) => {
    const radar = radars.find(r => r.id === radarId);
    if (radar) {
      setFormData({
        ...formData,
        tag: {
          radar: radarId,
          subject: null
        }
      });
    } else {
      setFormData({
        ...formData,
        tag: null
      });
    }
  };

  const handleSubjectChange = (subjectId) => {
    if (formData.tag) {
      setFormData({
        ...formData,
        tag: {
          ...formData.tag,
          subject: subjectId
        }
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return '#6bcf7f';
      case 'in-progress': return '#4a9ff5';
      case 'todo': return '#ff6b6b';
      default: return '#6c757d';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 px-8 py-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white/90">
            {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {taskType === 'daily' ? 'Tâche quotidienne' : 'Tâche hebdomadaire'}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nom de la tâche */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white/70">
              Nom de la tâche *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder-white/30 focus:outline-none focus:border-[rgb(35,131,226)] focus:bg-white/10 transition-all"
              placeholder="Ex: Révision du code principal"
              autoFocus
            />
          </div>

          {/* Ligne de statut et priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                style={{
                  borderLeft: `4px solid ${getStatusColor(formData.status)}`
                }}
              >
                <option value="todo">À faire</option>
                <option value="in-progress">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                style={{
                  borderLeft: `4px solid ${getPriorityColor(formData.priority)}`
                }}
              >
                <option value="low">🟢 Faible</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🔴 Haute</option>
              </select>
            </div>
          </div>

          {/* Dates selon le type */}
          {taskType === 'daily' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                />
              </div>
            </div>
          )}

          {/* Assignation et progression */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Responsable
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder-white/30 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                placeholder="Nom du responsable"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Progression ({formData.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, rgb(35,131,226) 0%, rgb(35,131,226) ${formData.progress}%, rgba(255,255,255,0.1) ${formData.progress}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
          </div>

          {/* Liaison avec un radar */}
          {radars.length > 0 && (
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Lier à un radar (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.tag?.radar || ''}
                  onChange={(e) => handleRadarChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                >
                  <option value="">Aucun radar</option>
                  {radars.map(radar => (
                    <option key={radar.id} value={radar.id}>
                      {radar.icon} {radar.name}
                    </option>
                  ))}
                </select>

                {formData.tag?.radar && (
                  <select
                    value={formData.tag?.subject || ''}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 focus:outline-none focus:border-[rgb(35,131,226)] transition-all"
                  >
                    <option value="">Aucune matière</option>
                    {radars
                      .find(r => r.id === formData.tag.radar)
                      ?.subjects?.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium text-white/70">
              Description (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/90 placeholder-white/30 focus:outline-none focus:border-[rgb(35,131,226)] transition-all resize-none"
              rows="3"
              placeholder="Détails supplémentaires..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg transition-all font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[rgb(35,131,226)] hover:bg-[rgb(28,104,181)] text-white rounded-lg transition-all font-medium"
            >
              {editingTask ? 'Mettre à jour' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
import React, { useState, useEffect } from 'react';

const TaskModal = ({ isOpen, onClose, onSave, editingTask, currentView, selectedDay }) => {
  const [formData, setFormData] = useState({
    name: '',
    customName: '',
    status: 'todo',
    priority: 'medium',
    tag: null,
    day: selectedDay || 'monday'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name || '',
        customName: editingTask.customName || '',
        status: editingTask.status || 'todo',
        priority: editingTask.priority || 'medium',
        tag: editingTask.tag || null,
        day: editingTask.day || selectedDay || 'monday'
      });
    } else {
      setFormData({
        name: '',
        customName: '',
        status: 'todo',
        priority: 'medium',
        tag: null,
        day: selectedDay || 'monday'
      });
    }
  }, [editingTask, selectedDay]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() && !formData.customName.trim()) {
      alert('Veuillez entrer un nom pour la tâche');
      return;
    }

    const taskData = {
      ...formData,
      name: formData.name || formData.customName,
      date: getDateForDay(formData.day),
      completed: formData.status === 'done'
    };

    onSave(taskData);
  };

  const getDateForDay = (day) => {
    if (currentView === 'daily') {
      return new Date().toISOString();
    }

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = days.indexOf(day);
    const daysUntilTarget = (targetDay - todayDay + 7) % 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toISOString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 w-full max-w-[500px] shadow-2xl">
        <h2 className="text-xl font-semibold text-white/81 mb-5">
          {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Nom de la tâche
            </label>
            <input
              type="text"
              value={formData.customName || formData.name}
              onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
              placeholder="Ex: Réviser le chapitre 3"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
              autoFocus
            />
          </div>
          
          {currentView === 'weekly' && (
            <div className="mb-4">
              <label className="block mb-2 text-white/46 text-sm font-medium">
                Jour
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
              >
                <option value="monday">Lundi</option>
                <option value="tuesday">Mardi</option>
                <option value="wednesday">Mercredi</option>
                <option value="thursday">Jeudi</option>
                <option value="friday">Vendredi</option>
                <option value="saturday">Samedi</option>
                <option value="sunday">Dimanche</option>
              </select>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
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

export default TaskModal;
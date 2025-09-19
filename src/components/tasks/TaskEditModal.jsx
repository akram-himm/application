import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const TaskEditModal = ({ 
  show, 
  task, 
  onSave, 
  onClose,
  isWeekly = false 
}) => {
  const { radars } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    status: 'À faire',
    priority: 'Pas de panique',
    date: '',
    time: '',
    startDate: '',
    endDate: '',
    radar: '',
    subject: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        status: task.status || 'À faire',
        priority: task.priority || 'Pas de panique',
        date: task.date || new Date().toISOString().split('T')[0],
        time: task.time || '09:00',
        startDate: task.startDate || new Date().toISOString().split('T')[0],
        endDate: task.endDate || new Date().toISOString().split('T')[0],
        radar: task.radar || '',
        subject: task.subject || ''
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedTask = {
      ...task,
      name: formData.name,
      status: formData.status,
      priority: formData.priority,
      radar: formData.radar,
      subject: formData.subject
    };

    if (isWeekly) {
      updatedTask.startDate = formData.startDate;
      updatedTask.endDate = formData.endDate;
      updatedTask.time = formData.time;
    } else {
      updatedTask.date = formData.date;
      updatedTask.time = formData.time;
    }

    onSave(updatedTask);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop avec blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal avec effet glass */}
      <div className="relative bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-xl font-semibold text-white">
            Éditer la tâche
          </h3>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nom de la tâche */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la tâche
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Entrez le nom de la tâche"
              required
            />
          </div>
          
          {/* Statut et Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="À faire" className="bg-gray-800 text-white">À faire</option>
                <option value="En cours" className="bg-gray-800 text-white">En cours</option>
                <option value="Terminé" className="bg-gray-800 text-white">Terminé</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Pas de panique" className="bg-gray-800 text-white">Pas de panique</option>
                <option value="Important" className="bg-gray-800 text-white">Important</option>
                <option value="Très important" className="bg-gray-800 text-white">Très important</option>
              </select>
            </div>
          </div>
          
          {/* Dates */}
          {isWeekly ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}
          
          {/* Heure */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Heure
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Sélection Radar/Matière */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Radar
              </label>
              <select
                value={formData.radar || ''}
                onChange={(e) => {
                  setFormData({...formData, radar: e.target.value, subject: ''});
                }}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="" className="bg-gray-800 text-white">Aucun radar</option>
                {radars.map(radar => (
                  <option key={radar.id} value={radar.id} className="bg-gray-800 text-white">
                    {radar.icon} {radar.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Matière
              </label>
              <select
                value={formData.subject || ''}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                disabled={!formData.radar}
              >
                <option value="" className="bg-gray-800 text-white">Aucune matière</option>
                {formData.radar && radars
                  .find(r => r.id === formData.radar)
                  ?.subjects?.map(subject => (
                    <option key={subject.id} value={subject.id} className="bg-gray-800 text-white">
                      {subject.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
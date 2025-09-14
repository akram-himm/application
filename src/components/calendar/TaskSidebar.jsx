import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import TaskAutocomplete from '../tasks/TaskAutocomplete';

const TaskSidebar = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedTask, 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  onAddTask,
  onNavigateToWeek 
}) => {
  const { radars } = useContext(AppContext);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filtrer les tâches pour la date sélectionnée
  const dayTasks = selectedDate ? tasks.filter(task => {
    const taskDate = task.date || task.startDate;
    if (!taskDate || taskDate === '-') return false;
    // Formater la date sélectionnée en format local YYYY-MM-DD
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${month}-${day}`;
    return taskDate === selectedDateStr;
  }) : [];

  // Réinitialiser quand on change de date
  useEffect(() => {
    setSelectedTaskId(null);
    setEditingTask(null);
    setShowAddForm(false);
    setSelectedTasks([]);
    setSelectMode(false);
    setShowDeleteConfirm(false);
  }, [selectedDate]);

  // Si une tâche est sélectionnée depuis l'extérieur
  useEffect(() => {
    if (selectedTask) {
      setSelectedTaskId(selectedTask.id);
    }
  }, [selectedTask]);

  const currentTask = selectedTaskId ? dayTasks.find(t => t.id === selectedTaskId) : null;

  // Gérer la modification
  const handleEdit = (task) => {
    setEditingTask(task.id);
    setFormData({
      name: task.name || '',
      status: task.status || 'À faire',
      priority: task.priority || 'Normal',
      time: task.time || '',
      endTime: task.endTime || '',
      description: task.description || '',
      color: task.color || '#3b82f6',
      radar: task.radar || null,
      radarName: task.radarName || null,
      subject: task.subject || null,
      subjectName: task.subjectName || null
    });
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    if (editingTask) {
      const task = tasks.find(t => t.id === editingTask);
      // Formater la date en format local YYYY-MM-DD sans conversion UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      onUpdateTask({
        ...task,
        ...formData,
        date: dateStr,
        startDate: dateStr
      });
      setEditingTask(null);
    } else if (showAddForm) {
      // Définir les valeurs par défaut si non renseignées
      // Formater la date en format local YYYY-MM-DD sans conversion UTC
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const newTask = {
        name: formData.name || '',
        description: formData.description || '',
        status: formData.status || 'À faire',
        priority: formData.priority || 'Normal',
        time: formData.time || '-', // Si pas d'heure, mettre un tiret
        endTime: formData.endTime || '',
        date: dateStr,
        startDate: dateStr,
        type: 'daily', // Toujours 'daily' pour que les tâches apparaissent dans To-Do
        color: formData.color || '#9ca3af', // Inclure la couleur (RGB 156,163,175)
        radar: formData.radar || null,
        radarName: formData.radarName || null,
        subject: formData.subject || null,
        subjectName: formData.subjectName || null
      };
      
      onAddTask(newTask);
      setShowAddForm(false);
      setFormData({});
    }
  };

  // Gérer la soumission du formulaire d'ajout avec autocomplete
  const handleAutocompleteSubmit = (taskData) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const newTask = {
      ...taskData,
      description: formData.description || '',
      status: formData.status || 'À faire',
      priority: formData.priority || 'Normal',
      time: formData.time || '-',
      endTime: formData.endTime || '',
      date: dateStr,
      startDate: dateStr,
      type: 'daily',
      color: formData.color || '#9ca3af'
    };
    
    onAddTask(newTask);
    setShowAddForm(false);
    setFormData({});
  };

  // Annuler les modifications
  const handleCancel = () => {
    setEditingTask(null);
    setShowAddForm(false);
    setFormData({});
  };

  // Naviguer vers la vue hebdomadaire
  const handleViewWeek = () => {
    if (onNavigateToWeek) {
      onNavigateToWeek(selectedDate);
      onClose();
    }
  };

  // Gérer la sélection/désélection de tâches
  const handleTaskSelect = (taskId) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // Sélectionner/désélectionner toutes les tâches
  const handleSelectAll = () => {
    if (selectedTasks.length === dayTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(dayTasks.map(t => t.id));
    }
  };

  // Supprimer les tâches sélectionnées
  const handleDeleteSelected = () => {
    selectedTasks.forEach(taskId => {
      onDeleteTask(taskId);
    });
    setSelectedTasks([]);
    setSelectMode(false);
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dialogue de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer {selectedTasks.length} tâche{selectedTasks.length > 1 ? 's' : ''} ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteSelected}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300">
      {/* En-tête */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-800">
            {selectedDate ? selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            }) : 'Détails'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {dayTasks.length} tâche{dayTasks.length > 1 ? 's' : ''} pour ce jour
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bouton voir dans la semaine */}
      {onNavigateToWeek && (
        <div className="px-6 py-3 border-b border-gray-100">
          <button
            onClick={handleViewWeek}
            className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Voir dans la vue hebdomadaire
          </button>
        </div>
      )}

      {/* Contenu */}
      <div className="p-6 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
        {/* Si on édite une tâche */}
        {editingTask ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Modifier la tâche</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                <TaskAutocomplete
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  onSubmit={(taskData) => {
                    setFormData({ 
                      ...formData, 
                      name: taskData.name,
                      radar: taskData.radar || formData.radar,
                      radarName: taskData.radarName || formData.radarName,
                      subject: taskData.subject || formData.subject,
                      subjectName: taskData.subjectName || formData.subjectName
                    });
                  }}
                  radars={radars}
                  placeholder="Nom de la tâche"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="Pas de panique">Pas de panique</option>
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Très important">Très important</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : selectedTaskId && currentTask ? (
          /* Vue détaillée d'une tâche */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedTaskId(null)}
                className="p-1 hover:bg-gray-100 rounded flex items-center gap-2 text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste
              </button>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-800">{currentTask.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentTask.status === 'Terminé' ? 'bg-green-100 text-green-700' :
                  currentTask.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {currentTask.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentTask.priority === 'Très important' ? 'bg-red-100 text-red-700' :
                  currentTask.priority === 'Important' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {currentTask.priority}
                </span>
              </div>
            </div>

            {currentTask.time && currentTask.time !== '-' && (
              <div>
                <p className="text-sm text-gray-500">Horaire</p>
                <p className="text-gray-700">
                  {currentTask.time}
                  {currentTask.endTime && ` - ${currentTask.endTime}`}
                </p>
              </div>
            )}

            {currentTask.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{currentTask.description}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleEdit(currentTask)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => {
                  onDeleteTask(currentTask.id);
                  setSelectedTaskId(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          /* Liste des tâches du jour */
          <div className="space-y-4">
            {/* Barre d'actions */}
            {dayTasks.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                {selectMode ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === dayTasks.length && dayTasks.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        {selectedTasks.length} sélectionné{selectedTasks.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {selectedTasks.length > 0 && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Supprimer ({selectedTasks.length})
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectMode(false);
                          setSelectedTasks([]);
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600">{dayTasks.length} tâche{dayTasks.length > 1 ? 's' : ''}</span>
                    <button
                      onClick={() => setSelectMode(true)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Sélectionner
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Bouton ajouter une tâche */}
            {!showAddForm && !selectMode && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  // Initialiser avec les valeurs par défaut
                  setFormData({
                    name: '',
                    description: '',
                    status: 'À faire',
                    priority: 'Normal',
                    time: '',
                    endTime: '',
                    color: '#9ca3af'
                  });
                }}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Ajouter une tâche
              </button>
            )}

            {/* Formulaire d'ajout */}
            {showAddForm && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <TaskAutocomplete
                    value={formData.name || ''}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    onSubmit={(taskData) => {
                      // Si on appuie sur Entrée avec du texte, on ajoute directement la tâche
                      if (taskData.name) {
                        handleAutocompleteSubmit(taskData);
                      }
                    }}
                    radars={radars}
                    placeholder="Nom de la tâche"
                  />
                </div>
                
                <textarea
                  placeholder="Description (optionnel)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    placeholder="Heure début"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                  <input
                    type="time"
                    placeholder="Heure fin"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.status || 'À faire'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="À faire">À faire</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                  
                  <select
                    value={formData.priority || 'Normal'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    <option value="Pas de panique">Pas de panique</option>
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Très important">Très important</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Couleur:</label>
                  <input
                    type="color"
                    value={formData.color || '#9ca3af'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">{formData.color || '#9ca3af'}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des tâches */}
            {dayTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${selectMode ? '' : 'cursor-pointer'} ${
                  selectMode && selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (selectMode) {
                    handleTaskSelect(task.id);
                  } else {
                    setSelectedTaskId(task.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => handleTaskSelect(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{task.name}</h4>
                    {task.time && task.time !== '-' && (
                      <p className="text-sm text-gray-500 mt-1">
                        {task.time}
                        {task.endTime && ` - ${task.endTime}`}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.status === 'Terminé' ? 'bg-green-100 text-green-700' :
                    task.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}

            {dayTasks.length === 0 && !showAddForm && (
              <div className="text-center py-8 text-gray-400">
                <p>Aucune tâche pour ce jour</p>
                <p className="text-sm mt-2">Cliquez sur le + pour en ajouter une</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default TaskSidebar;
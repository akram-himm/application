import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import notionApiService from './notionApiService';
import { uniformStyles } from '../styles/uniformStyles';

// Composant pour une carte de tâche draggable
const DraggableTaskCard = ({ task, onUpdateTask, onDeleteTask, onEditClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status) => {
    const colors = {
      'À faire': 'border-gray-300 bg-gray-50',
      'En cours': 'border-blue-300 bg-blue-50',
      'Terminé': 'border-green-300 bg-green-50',
      'En attente': 'border-yellow-300 bg-yellow-50'
    };
    return colors[status] || 'border-gray-300 bg-gray-50';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'Urgent': '🔴',
      'Important': '🟠',
      'Normal': '🔵',
      'Pas de panique': '⚪'
    };
    return icons[priority] || '⚪';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border-2 ${getStatusColor(task.status)} cursor-move shadow-sm hover:shadow-md transition-all`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-800 line-clamp-2">{task.name}</h4>
        </div>
        <span className="text-lg ml-2" title={task.priority}>
          {getPriorityIcon(task.priority)}
        </span>
      </div>

      {task.time && task.time !== '-' && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{task.time}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const statuses = ['À faire', 'En cours', 'Terminé', 'En attente'];
            const currentIndex = statuses.indexOf(task.status);
            const nextIndex = (currentIndex + 1) % statuses.length;
            onUpdateTask({ ...task, status: statuses[nextIndex] });
          }}
          className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-70"
        >
          {task.status}
        </button>

        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(task);
            }}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            className="p-1 hover:bg-red-50 rounded"
          >
            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal d'édition
const EditModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task || {});

  useEffect(() => {
    setEditedTask(task || {});
  }, [task]);

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Modifier la tâche</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={editedTask.name || ''}
              onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
              className={uniformStyles.input.default}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className={uniformStyles.input.default}
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={editedTask.startDate || editedTask.date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value, date: e.target.value })}
                className={uniformStyles.input.default}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={editedTask.endDate || editedTask.startDate || editedTask.date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
                className={uniformStyles.input.default}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                value={editedTask.time === '-' ? '' : editedTask.time || ''}
                onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value || '-' })}
                className={uniformStyles.input.default}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={editedTask.type || 'daily'}
                onChange={(e) => setEditedTask({ ...editedTask, type: e.target.value })}
                className={uniformStyles.input.default}
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={editedTask.status || 'À faire'}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                className={uniformStyles.input.default}
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={editedTask.priority || 'Normal'}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className={uniformStyles.input.default}
              >
                <option value="Urgent">Urgent</option>
                <option value="Important">Important</option>
                <option value="Normal">Normal</option>
                <option value="Pas de panique">Pas de panique</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={uniformStyles.button.secondary}
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(editedTask)}
            className={uniformStyles.button.primary}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal du calendrier Notion
const NotionCalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month
  const [editingTask, setEditingTask] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Plus besoin de configuration ici, le serveur proxy gère tout

  // Capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialiser la connexion Notion
  useEffect(() => {
    initializeNotion();
  }, []);

  const initializeNotion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const verified = await notionApiService.verifyConnection();
      if (verified) {
        setIsConnected(true);
        await loadTasks();
      } else {
        throw new Error('Connexion impossible');
      }
    } catch (err) {
      console.error('Erreur de connexion à Notion:', err);
      setError('Impossible de se connecter à Notion. Assurez-vous que le serveur proxy est démarré.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les tâches depuis Notion
  const loadTasks = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const notionTasks = await notionApiService.getTasks();
      const formattedTasks = notionTasks.map((task, index) => ({
        ...task,
        id: task.notionId || `task-${Date.now()}-${index}`,
        order: index
      }));
      setTasks(formattedTasks);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
      setError('Erreur lors du chargement des tâches');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchroniser avec Notion
  const syncWithNotion = async () => {
    if (!isConnected) {
      setError('Non connecté à Notion');
      return;
    }

    setSyncStatus('syncing');
    try {
      await loadTasks();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      console.error('Erreur de synchronisation:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  // Obtenir les jours de la semaine actuelle
  const getWeekDays = useCallback(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  }, [currentDate]);

  // Obtenir les jours du mois actuel
  const getMonthDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1));

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 1) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break; // Maximum 6 semaines
    }

    return days;
  }, [currentDate]);

  // Filtrer les tâches pour une date donnée
  const getTasksForDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (task.date === dateStr) return true;
      if (task.startDate && task.endDate) {
        return dateStr >= task.startDate && dateStr <= task.endDate;
      }
      if (task.startDate === dateStr) return true;
      return false;
    });
  }, [tasks]);

  // Navigation dans le calendrier
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);

    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    if (viewMode === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else if (viewMode === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    }

    setCurrentDate(newDate);
  };

  // Ajouter une tâche pour une date spécifique
  const handleAddTaskForDate = async (date) => {
    const newTask = {
      name: 'Nouvelle tâche',
      status: 'À faire',
      priority: 'Normal',
      date: date.toISOString().split('T')[0],
      time: '-',
      type: 'daily'
    };

    try {
      const notionId = await notionApiService.createTask(newTask);
      const taskWithId = {
        ...newTask,
        id: notionId,
        notionId: notionId,
        order: tasks.length
      };
      setTasks([...tasks, taskWithId]);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la tâche:', err);
      setError('Erreur lors de l\'ajout de la tâche');
    }
  };

  // Mettre à jour une tâche
  const handleUpdateTask = async (updatedTask) => {
    try {
      if (updatedTask.notionId) {
        await notionApiService.updateTask(updatedTask.notionId, updatedTask);
      }
      setTasks(tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la tâche:', err);
      setError('Erreur lors de la mise à jour de la tâche');
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      if (taskToDelete.notionId) {
        await notionApiService.deleteTask(taskToDelete.notionId);
      }
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Erreur lors de la suppression de la tâche:', err);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  // Gérer le drag and drop entre les jours
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const targetDate = over.id;

    if (targetDate && targetDate.startsWith('day-')) {
      const dateStr = targetDate.replace('day-', '');
      const task = tasks.find(t => t.id === taskId);

      if (task) {
        const updatedTask = {
          ...task,
          date: dateStr,
          startDate: dateStr
        };
        handleUpdateTask(updatedTask);
      }
    }
  };

  // Sauvegarder les modifications du modal
  const handleSaveEdit = async (updatedTask) => {
    await handleUpdateTask(updatedTask);
    setEditingTask(null);
  };

  // Obtenir le titre selon le mode de vue
  const getViewTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }

    const weekDays = getWeekDays();
    const start = weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const weekDays = viewMode === 'week' ? getWeekDays() : [];
  const monthDays = viewMode === 'month' ? getMonthDays() : [];

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* En-tête */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Calendrier Notion</h1>
          <p className={uniformStyles.text.pageSubtitle}>
            Planifiez vos tâches synchronisées avec Notion
          </p>
        </div>

        {/* Statut de connexion et contrôles */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connecté à Notion' : 'Non connecté à Notion'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sélecteur de vue */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mois
                </button>
              </div>

              <button
                onClick={syncWithNotion}
                disabled={!isConnected || syncStatus === 'syncing'}
                className={`${uniformStyles.button.secondary} flex items-center gap-2`}
              >
                <svg
                  className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncStatus === 'syncing' ? 'Synchronisation...' :
                 syncStatus === 'success' ? 'Synchronisé ✓' :
                 syncStatus === 'error' ? 'Erreur ✗' : 'Synchroniser'}
              </button>
            </div>
          </div>
        </div>

        {/* Afficher les erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Navigation du calendrier */}
        <div className={`${uniformStyles.card.default} ${uniformStyles.card.padding} mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('prev')}
                className={uniformStyles.button.icon}
                title={viewMode === 'week' ? 'Semaine précédente' : 'Mois précédent'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => handleNavigate('today')}
                className={uniformStyles.button.secondary}
              >
                Aujourd'hui
              </button>

              <button
                onClick={() => handleNavigate('next')}
                className={uniformStyles.button.icon}
                title={viewMode === 'week' ? 'Semaine suivante' : 'Mois suivant'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <h2 className="text-lg font-medium text-gray-800">
              {getViewTitle()}
            </h2>

            <span className="text-sm text-gray-500">
              {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Vue calendrier */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {isLoading ? (
            <div className={`${uniformStyles.card.default} p-8 text-center text-gray-500`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Chargement des tâches...
            </div>
          ) : viewMode === 'week' ? (
            // Vue semaine
            <div className={uniformStyles.card.default}>
              <div className="grid grid-cols-7 gap-2 p-4">
                {weekDays.map((day, index) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const dayTasks = getTasksForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      id={`day-${dateStr}`}
                      className={`min-h-[400px] border rounded-lg p-3 ${
                        isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="mb-3 sticky top-0 bg-inherit z-10">
                        <div className="font-medium text-sm text-gray-700">
                          {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day.getDate()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddTaskForDate(day)}
                        className="w-full mb-2 py-1 px-2 text-xs text-gray-500 hover:bg-gray-100 rounded border border-dashed border-gray-300"
                      >
                        + Ajouter
                      </button>

                      <div className="space-y-2">
                        <SortableContext
                          items={dayTasks.map(t => t.id)}
                          strategy={horizontalListSortingStrategy}
                        >
                          {dayTasks.map((task) => (
                            <DraggableTaskCard
                              key={task.id}
                              task={task}
                              onUpdateTask={handleUpdateTask}
                              onDeleteTask={handleDeleteTask}
                              onEditClick={setEditingTask}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Vue mois
            <div className={uniformStyles.card.default}>
              <div className="p-4">
                {/* En-têtes des jours */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille des jours */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, index) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayTasks = getTasksForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={index}
                        id={`day-${dateStr}`}
                        className={`min-h-[120px] border rounded-lg p-2 ${
                          isToday ? 'bg-blue-50 border-blue-300' :
                          isCurrentMonth ? 'bg-white border-gray-200' :
                          'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' :
                            isCurrentMonth ? 'text-gray-900' :
                            'text-gray-400'
                          }`}>
                            {day.getDate()}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-1 rounded">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        {isCurrentMonth && (
                          <button
                            onClick={() => handleAddTaskForDate(day)}
                            className="w-full py-0.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            +
                          </button>
                        )}

                        <div className="space-y-1 mt-1">
                          {dayTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className="text-xs p-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer truncate"
                              onClick={() => setEditingTask(task)}
                            >
                              {task.time !== '-' && (
                                <span className="text-gray-500 mr-1">{task.time}</span>
                              )}
                              {task.name}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayTasks.length - 3} autre{dayTasks.length - 3 > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DndContext>

        {/* Modal d'édition */}
        {editingTask && (
          <EditModal
            task={editingTask}
            onSave={handleSaveEdit}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NotionCalendarView;
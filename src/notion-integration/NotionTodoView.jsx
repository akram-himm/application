import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import notionApiService from './notionApiService';
import { uniformStyles } from '../styles/uniformStyles';

// Composant pour une ligne draggable du tableau
const SortableRow = ({ task, onUpdateTask, onDeleteTask, onEditClick }) => {
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

  const handleStatusChange = () => {
    const statuses = ['À faire', 'En cours', 'Terminé', 'En attente'];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onUpdateTask({ ...task, status: statuses[nextIndex] });
  };

  const handlePriorityChange = () => {
    const priorities = ['Urgent', 'Important', 'Normal', 'Pas de panique'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    onUpdateTask({ ...task, priority: priorities[nextIndex] });
  };

  const getStatusColor = (status) => {
    const colors = {
      'À faire': 'bg-gray-100 text-gray-700',
      'En cours': 'bg-blue-100 text-blue-700',
      'Terminé': 'bg-green-100 text-green-700',
      'En attente': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Urgent': 'bg-red-100 text-red-700',
      'Important': 'bg-orange-100 text-orange-700',
      'Normal': 'bg-blue-100 text-blue-700',
      'Pas de panique': 'bg-gray-100 text-gray-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
    >
      <td className="px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <span className="text-gray-800">{task.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleStatusChange}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(task.status)}`}
        >
          {task.status}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handlePriorityChange}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${getPriorityColor(task.priority)}`}
        >
          {task.priority}
        </button>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {task.time || '-'}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {task.date || '-'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditClick(task)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Modifier"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1 hover:bg-red-50 rounded"
            title="Supprimer"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editedTask.date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
                className={uniformStyles.input.default}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input
                type="time"
                value={editedTask.time === '-' ? '' : editedTask.time || ''}
                onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value || '-' })}
                className={uniformStyles.input.default}
              />
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

// Composant principal
const NotionTodoView = () => {
  const [tasks, setTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

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

  // Ajouter une tâche
  const handleAddTask = async () => {
    if (!newTaskName.trim()) return;

    const newTask = {
      name: newTaskName,
      status: 'À faire',
      priority: 'Normal',
      date: new Date().toISOString().split('T')[0],
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
      setNewTaskName('');
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

  // Gérer le drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Mettre à jour l'ordre
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  // Sauvegarder les modifications du modal
  const handleSaveEdit = async (updatedTask) => {
    await handleUpdateTask(updatedTask);
    setEditingTask(null);
  };

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(task =>
      task.name?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* En-tête */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Todo Notion</h1>
          <p className={uniformStyles.text.pageSubtitle}>
            Gérez vos tâches synchronisées avec Notion
          </p>
        </div>

        {/* Statut de connexion */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connecté à Notion' : 'Non connecté à Notion'}
              </span>
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

        {/* Afficher les erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Barre de recherche et ajout */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Ajouter une nouvelle tâche..."
              className={`flex-1 ${uniformStyles.input.default}`}
              disabled={!isConnected}
            />
            <button
              onClick={handleAddTask}
              disabled={!isConnected || !newTaskName.trim()}
              className={uniformStyles.button.primary}
            >
              Ajouter
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une tâche..."
              className={`w-full pl-10 ${uniformStyles.input.default}`}
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tableau des tâches */}
        <div className={uniformStyles.card.default}>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Chargement des tâches...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'Aucune tâche trouvée' : 'Aucune tâche. Ajoutez-en une pour commencer!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tâche
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={filteredTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredTasks.map((task) => (
                        <SortableRow
                          key={task.id}
                          task={task}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={handleDeleteTask}
                          onEditClick={setEditingTask}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </tbody>
              </table>
            </div>
          )}
        </div>

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

export default NotionTodoView;
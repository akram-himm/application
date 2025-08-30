import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import DraggableTable from '../components/tasks/DraggableTable';
import TaskContextMenu from '../components/tasks/TaskContextMenu';
import TaskEditModal from '../components/tasks/TaskEditModal';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmModal from '../components/tasks/ConfirmModal';

const PlanView = () => {
  const { tasks, addTask, updateTask, deleteTask, radars } = useContext(AppContext);
  
  // États
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    radar: 'all',
    subject: 'all'
  });
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    task: null,
    isWeekly: false
  });
  const [editModal, setEditModal] = useState({
    show: false,
    task: null,
    isWeekly: false
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    taskToDelete: null
  });

  // Filtrer les tâches selon tous les critères
  const applyFilters = (taskList) => {
    let filtered = taskList;
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.radar !== 'all') {
      filtered = filtered.filter(task => task.radar === filters.radar);
    }
    
    if (filters.subject !== 'all') {
      filtered = filtered.filter(task => task.subject === filters.subject);
    }
    
    return filtered;
  };

  const dailyTasks = applyFilters(
    tasks.filter(task => !task.type || task.type === 'daily')
  ).sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const weeklyTasks = applyFilters(
    tasks.filter(task => task.type === 'weekly')
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Colonnes pour les tableaux
  const dailyColumns = [
    { key: 'name', label: 'Tâche' },
    { key: 'tag', label: 'Radar/Matière' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Heure' }
  ];

  const weeklyColumns = [
    { key: 'name', label: 'Tâche' },
    { key: 'tag', label: 'Radar/Matière' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'startDate', label: 'Début' },
    { key: 'endDate', label: 'Fin' },
    { key: 'time', label: 'Heure' }
  ];

  // Gestion des tâches quotidiennes
  const handleAddDailyTask = (taskData) => {
    // Si c'est une string (ancien comportement)
    if (typeof taskData === 'string') {
      const newTask = {
        name: taskData,
        type: 'daily',
        status: 'À faire',
        priority: 'Pas de panique',
        date: new Date().toISOString().split('T')[0],
        time: '09:00'
      };
      addTask(newTask);
    } else {
      // Nouveau comportement avec radar/matière
      const newTask = {
        name: taskData.name,
        type: 'daily',
        status: 'À faire',
        priority: 'Pas de panique',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        radar: taskData.radar || null,
        radarName: taskData.radarName || null,
        subject: taskData.subject || null,
        subjectName: taskData.subjectName || null
      };
      addTask(newTask);
    }
  };

  const handleUpdateDailyTasks = (newTasks) => {
    // Mettre à jour l'ordre de chaque tâche
    newTasks.forEach((task, index) => {
      updateTask({ ...task, order: index });
    });
  };

  // Gestion des tâches hebdomadaires
  const handleAddWeeklyTask = (taskData) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Si c'est une string (ancien comportement)
    if (typeof taskData === 'string') {
      const newTask = {
        name: taskData,
        type: 'weekly',
        status: 'À faire',
        priority: 'Pas de panique',
        startDate: today,
        endDate: today,
        time: '09:00'
      };
      addTask(newTask);
    } else {
      // Nouveau comportement avec radar/matière
      const newTask = {
        name: taskData.name,
        type: 'weekly',
        status: 'À faire',
        priority: 'Pas de panique',
        startDate: today,
        endDate: today,
        time: '09:00',
        radar: taskData.radar || null,
        radarName: taskData.radarName || null,
        subject: taskData.subject || null,
        subjectName: taskData.subjectName || null
      };
      addTask(newTask);
    }
  };

  const handleUpdateWeeklyTasks = (newTasks) => {
    // Mettre à jour l'ordre de chaque tâche
    newTasks.forEach((task, index) => {
      updateTask({ ...task, order: index });
    });
  };

  // Double-clic désactivé - on utilise l'édition inline maintenant
  const handleDoubleClick = (task, cellIndex, isWeekly) => {
    // Ne rien faire - l'édition inline gère tout
  };

  // Gestion du menu contextuel
  const handleContextMenu = (e, task, isWeekly) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      task,
      isWeekly
    });
  };

  // Actions du menu contextuel
  const handleEdit = () => {
    setEditModal({
      show: true,
      task: contextMenu.task,
      isWeekly: contextMenu.isWeekly
    });
    setContextMenu({ ...contextMenu, show: false });
  };

  const handleDelete = () => {
    // Fermer le menu et ouvrir le modal de confirmation
    setContextMenu({ ...contextMenu, show: false });
    setConfirmModal({
      show: true,
      taskToDelete: contextMenu.task
    });
  };

  // Gérer la confirmation de suppression
  const handleConfirmDelete = () => {
    if (confirmModal.taskToDelete) {
      deleteTask(confirmModal.taskToDelete.id);
    }
    setConfirmModal({ show: false, taskToDelete: null });
  };

  // Gérer l'annulation de suppression
  const handleCancelDelete = () => {
    setConfirmModal({ show: false, taskToDelete: null });
  };

  const handleMove = () => {
    const task = contextMenu.task;
    const updatedTask = { ...task };
    
    if (contextMenu.isWeekly) {
      // Déplacer vers quotidien
      updatedTask.type = 'daily';
      updatedTask.date = task.startDate || new Date().toISOString().split('T')[0];
      delete updatedTask.startDate;
      delete updatedTask.endDate;
    } else {
      // Déplacer vers hebdomadaire
      updatedTask.type = 'weekly';
      updatedTask.startDate = task.date || new Date().toISOString().split('T')[0];
      updatedTask.endDate = task.date || new Date().toISOString().split('T')[0];
      delete updatedTask.date;
    }
    
    updateTask(updatedTask);
    setContextMenu({ ...contextMenu, show: false });
  };

  // Sauvegarder les modifications du modal
  const handleSaveEdit = (updatedTask) => {
    updateTask(updatedTask);
    setEditModal({ show: false, task: null, isWeekly: false });
  };

  // Raccourci clavier Ctrl+Enter pour ajouter une tâche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleAddDailyTask('Nouvelle tâche');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Effet de fond subtil */}
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900/20 via-transparent to-neutral-800/20 pointer-events-none" />
      
      <div className="relative p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gestion des Tâches
          </h1>
          <p className="text-gray-400">
            Organisez vos tâches quotidiennes et hebdomadaires
          </p>
        </div>

        {/* Filtres */}
        <TaskFilters 
          filters={filters}
          onFiltersChange={setFilters}
          radars={radars}
        />

        {/* Tableaux */}
        <div className="space-y-8">
          {/* Tâches du jour */}
          <DraggableTable
            key="daily-table"
            title="Tâches du jour"
            tasks={dailyTasks}
            columns={dailyColumns}
            onUpdateTasks={handleUpdateDailyTasks}
            onAddTask={handleAddDailyTask}
            onUpdateTask={updateTask}
            onDoubleClick={(task, cellIndex) => handleDoubleClick(task, cellIndex, false)}
            onContextMenu={(e, task) => handleContextMenu(e, task, false)}
          />

          {/* Tâches de la semaine */}
          <DraggableTable
            key="weekly-table"
            title="Tâches de la semaine"
            tasks={weeklyTasks}
            columns={weeklyColumns}
            onUpdateTasks={handleUpdateWeeklyTasks}
            onAddTask={handleAddWeeklyTask}
            onUpdateTask={updateTask}
            onDoubleClick={(task, cellIndex) => handleDoubleClick(task, cellIndex, true)}
            onContextMenu={(e, task) => handleContextMenu(e, task, true)}
          />
        </div>

        {/* Indicateurs d'aide */}
        <div className="mt-8 text-center space-y-2">
          <div className="text-sm text-gray-500">
            💡 <strong>Double-clic</strong> sur le nom pour éditer | <strong>Clic</strong> sur statut/priorité pour changer
          </div>
          <div className="text-sm text-gray-500">
            ⚡ <strong>Ctrl+Enter</strong> pour ajouter une tâche | <strong>Clic droit</strong> pour plus d'options
          </div>
        </div>
      </div>

      {/* Menu contextuel */}
      <TaskContextMenu
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMove={handleMove}
        onClose={() => setContextMenu({ ...contextMenu, show: false })}
        moveToText={contextMenu.isWeekly ? 'Déplacer vers quotidien' : 'Déplacer vers hebdomadaire'}
      />

      {/* Modal d'édition */}
      <TaskEditModal
        show={editModal.show}
        task={editModal.task}
        isWeekly={editModal.isWeekly}
        onSave={handleSaveEdit}
        onClose={() => setEditModal({ show: false, task: null, isWeekly: false })}
      />

      {/* Modal de confirmation */}
      <ConfirmModal
        show={confirmModal.show}
        message="Êtes-vous sûr de vouloir supprimer cette tâche ?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default PlanView;
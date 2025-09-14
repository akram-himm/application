import React, { useState, useContext, useEffect, memo, useCallback, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import DraggableTable from '../components/tasks/DraggableTable';
import TaskContextMenu from '../components/tasks/TaskContextMenu';
import TaskEditModal from '../components/tasks/TaskEditModal';
import TaskFilters from '../components/tasks/TaskFilters';
import ConfirmModal from '../components/tasks/ConfirmModal';
import { uniformStyles } from '../styles/uniformStyles';
import { initTaskRotation, isRotationBlocked, setRotationBlocked, forceRotation } from '../services/taskRotationService';

const PlanView = memo(() => {
  const { tasks, addTask, updateTask, deleteTask, radars, setTasks } = useContext(AppContext);
  
  // Vérifier si on doit inverser les styles
  const altStyle = new URLSearchParams(window.location.search).get('alt') === 'true';
  
  // État pour le blocage de rotation
  const [rotationBlocked, setRotationBlockedState] = useState(isRotationBlocked());
  
  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Filtrer les tâches selon tous les critères - Optimisé avec useCallback
  const applyFilters = useCallback((taskList) => {
    let filtered = taskList;
    
    // Filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => {
        // Rechercher dans le nom et la description
        const inName = task.name?.toLowerCase().includes(query);
        const inDescription = task.description?.toLowerCase().includes(query);
        return inName || inDescription;
      });
    }
    
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
  }, [filters, searchQuery]);

  // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayStr = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Optimiser le calcul des tâches filtrées avec useMemo
  // Afficher seulement les tâches du jour actuel, routines ou sans date
  const dailyTasks = useMemo(() => {
    const todayStr = getTodayStr();
    return applyFilters(
      tasks.filter(task => {
        // Tâches routine (toujours visibles)
        if (task.type === 'routine') {
          return true;
        }
        // Tâches sans date (tâches To-Do classiques)
        if (!task.date || task.date === '-') {
          return task.type === 'today' || !task.type || task.type === 'daily';
        }
        // Tâches avec date = aujourd'hui
        return task.date === todayStr && (task.type === 'today' || task.type === 'planned' || !task.type || task.type === 'daily');
      })
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tasks, applyFilters, getTodayStr]);
  
  const weeklyTasks = useMemo(() => {
    const todayStr = getTodayStr();
    return applyFilters(
      tasks.filter(task => {
        if (task.type !== 'weekly') return false;
        // Pour les tâches weekly, vérifier si aujourd'hui est dans la période
        if (!task.startDate || task.startDate === '-') return true;
        const endDate = task.endDate || task.startDate;
        return task.startDate <= todayStr && endDate >= todayStr;
      })
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [tasks, applyFilters, getTodayStr]);

  // Colonnes pour les tableaux
  const dailyColumns = [
    { key: 'name', label: 'Tâche' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'time', label: 'Heure' },
    { key: 'date', label: 'Date' }
  ];

  const weeklyColumns = [
    { key: 'name', label: 'Tâche' },
    { key: 'status', label: 'Statut' },
    { key: 'priority', label: 'Priorité' },
    { key: 'startDate', label: 'Début' },
    { key: 'endDate', label: 'Fin' },
    { key: 'time', label: 'Heure' }
  ];

  // Gestion des tâches quotidiennes
  const handleAddDailyTask = (taskData) => {
    const todayStr = getTodayStr();
    
    // Si c'est une string (ancien comportement)
    if (typeof taskData === 'string') {
      const newTask = {
        name: taskData,
        type: 'today', // Par défaut type 'today'
        status: 'À faire',
        priority: 'Pas de panique',
        date: todayStr,
        time: '-'
      };
      addTask(newTask);
    } else {
      // Nouveau comportement avec type spécifié
      const newTask = {
        name: taskData.name,
        type: taskData.type || 'today', // Utiliser le type fourni ou 'today' par défaut
        status: 'À faire',
        priority: 'Pas de panique',
        date: taskData.type === 'routine' ? '-' : todayStr, // Pas de date pour les routines
        time: taskData.time || '-',
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
    const todayStr = getTodayStr();
    
    // Si c'est une string (ancien comportement)
    if (typeof taskData === 'string') {
      const newTask = {
        name: taskData,
        type: 'weekly',
        status: 'À faire',
        priority: 'Pas de panique',
        startDate: todayStr, // Date du jour par défaut
        endDate: todayStr,   // Date du jour par défaut
        time: '-'
      };
      addTask(newTask);
    } else {
      // Nouveau comportement - préserver toutes les propriétés de taskData
      const newTask = {
        type: 'weekly',
        status: 'À faire',
        priority: 'Pas de panique',
        startDate: todayStr, // Date du jour par défaut
        endDate: todayStr,   // Date du jour par défaut
        time: '-',
        radar: null,
        radarName: null,
        subject: null,
        subjectName: null,
        ...taskData // Écraser avec les vraies valeurs de taskData
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
    
    // Utiliser nativeEvent pour avoir les vraies coordonnées
    const event = e.nativeEvent || e;
    
    setContextMenu({
      show: true,
      x: event.clientX || e.clientX,
      y: event.clientY || e.clientY,
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
    const taskToDelete = contextMenu.task;
    
    // Fermer le menu immédiatement
    setContextMenu({ show: false, x: 0, y: 0, task: null, isWeekly: false });
    
    // Petit délai pour éviter le clignotement
    setTimeout(() => {
      setConfirmModal({
        show: true,
        taskToDelete: taskToDelete
      });
    }, 100);
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

  // Initialiser le système de rotation automatique
  useEffect(() => {
    if (setTasks) {
      const cleanup = initTaskRotation(tasks, setTasks);
      return cleanup; // Nettoyer l'intervalle au démontage
    }
  }, []); // Initialiser une seule fois au montage

  // Gérer le changement du blocage de rotation
  const handleToggleRotationBlock = () => {
    const newState = !rotationBlocked;
    setRotationBlocked(newState);
    setRotationBlockedState(newState);
  };

  // Forcer la rotation manuellement
  const handleForceRotation = () => {
    if (setTasks) {
      forceRotation(tasks, setTasks);
    }
  };

  // useEffect(() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   });
  //   
  //   // Les marquer comme transférées pour éviter les boucles infinies
  //   tasksToTransfer.forEach(task => {
  //     if (!dailyTasks.find(dt => dt.originalWeeklyId === task.id)) {
  //       const dailyTask = {
  //         ...task,
  //         type: 'daily',
  //         originalWeeklyId: task.id,
  //         autoTransfer: false
  //       };
  //       addTask(dailyTask);
  //     }
  //   });
  // }, []);

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
    <div className={altStyle ? uniformStyles.layout.pageAlt : uniformStyles.layout.page}>
      {/* Effet de fond subtil - supprimé car le gradient est sur le body */}
      
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* En-tête avec contrôles de rotation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={uniformStyles.text.pageTitle}>Plan de travail</h1>
              <p className={uniformStyles.text.pageSubtitle}>Gérez vos tâches quotidiennes et organisez votre agenda</p>
            </div>
            
            {/* Contrôles de rotation automatique */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Rotation automatique à minuit</label>
                <button
                  onClick={handleToggleRotationBlock}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !rotationBlocked ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    !rotationBlocked ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-xs text-gray-500">
                  {rotationBlocked ? 'Bloquée' : 'Active'}
                </span>
              </div>
              
              <button
                onClick={handleForceRotation}
                className={uniformStyles.button.secondary}
                title="Forcer la rotation maintenant"
              >
                🔄 Rotation manuelle
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et Filtres */}
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une tâche..."
              className={"w-full pl-10 pr-10 " + uniformStyles.input.default}
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Filtres */}
          <TaskFilters 
            filters={filters}
            onFiltersChange={setFilters}
            radars={radars}
          />
        </div>

        {/* Tableau des tâches du jour */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Tâches du jour</h2>
            {searchQuery && (
              <span className="text-sm text-gray-500">
                {dailyTasks.length} résultat{dailyTasks.length > 1 ? 's' : ''} trouvé{dailyTasks.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <DraggableTable
            key="daily-table"
            title=""
            tasks={dailyTasks}
            columns={dailyColumns}
            onUpdateTasks={handleUpdateDailyTasks}
            onAddTask={handleAddDailyTask}
            onUpdateTask={updateTask}
            onDoubleClick={(task, cellIndex) => handleDoubleClick(task, cellIndex, false)}
            onContextMenu={(e, task) => handleContextMenu(e, task, false)}
            onDeleteTasks={deleteTask}
          />
        </div>

        {/* Indicateurs d'aide */}
        <div className="mt-8 text-center space-y-2">
          <div className="text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            <strong>Double-clic</strong> sur le nom pour éditer | <strong>Clic</strong> sur statut/priorité pour changer
          </div>
          <div className="text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            <strong>Ctrl+Enter</strong> pour ajouter une tâche | <strong>Clic droit</strong> pour plus d'options
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
});

PlanView.displayName = 'PlanView';

export default PlanView;

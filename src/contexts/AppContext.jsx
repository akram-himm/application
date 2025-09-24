import React, { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { loadRadars, saveRadars, loadTasks, saveTasks } from '../services/localStorage';
import { debounce } from '../utils/debounce';
import autoSaveService from '../services/autoSave';
import { addToHistory, isDayArchived } from '../services/historyService';

export const AppContext = createContext();

const initialState = {
  radars: loadRadars(),
  tasks: loadTasks()
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_RADARS':
      return { ...state, radars: action.payload };
      
    case 'ADD_RADAR':
      return { ...state, radars: [...state.radars, action.payload] };
      
    case 'UPDATE_RADAR':
      return {
        ...state,
        radars: state.radars.map(radar =>
          radar.id === action.payload.id ? action.payload : radar
        )
      };
      
    case 'DELETE_RADAR':
      return {
        ...state,
        radars: state.radars.filter(radar => radar.id !== action.payload)
      };
      
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
      
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fonction pour recharger les données du workspace
  const reloadWorkspaceData = useCallback(() => {
    const newRadars = loadRadars();
    const newTasks = loadTasks();
    dispatch({ type: 'SET_RADARS', payload: newRadars });
    dispatch({ type: 'SET_TASKS', payload: newTasks });
  }, []);

  // Créer des versions "debounced" des fonctions de sauvegarde
  // Cela évite de sauvegarder trop souvent (attend 500ms après le dernier changement)
  const debouncedSaveRadars = useMemo(
    () => debounce(saveRadars, 500),
    []
  );

  const debouncedSaveTasks = useMemo(
    () => debounce(saveTasks, 500),
    []
  );

  // Fonction de sauvegarde manuelle pour l'auto-save
  const performManualSave = useCallback(() => {
    const radarsSuccess = saveRadars(state.radars);
    const tasksSuccess = saveTasks(state.tasks);
    return radarsSuccess && tasksSuccess;
  }, [state.radars, state.tasks]);

  // Initialiser le système de sauvegarde automatique
  useEffect(() => {
    // Initialiser avec une sauvegarde toutes les 30 secondes
    autoSaveService.init(performManualSave, 30000);

    // Ajouter le callback pour les sauvegardes
    autoSaveService.addSaveCallback(performManualSave);

    // Cleanup
    return () => {
      autoSaveService.stop();
    };
  }, [performManualSave]);

  // Écouter les changements de workspace pour recharger les données
  useEffect(() => {
    const handleWorkspaceChange = (event) => {
      // Recharger les données du nouveau workspace
      reloadWorkspaceData();
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);

    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, [reloadWorkspaceData]);

  // Sauvegarder les radars quand ils changent (avec debounce)
  useEffect(() => {
    debouncedSaveRadars(state.radars);
  }, [state.radars, debouncedSaveRadars]);

  // Sauvegarder les tâches quand elles changent (avec debounce)
  useEffect(() => {
    debouncedSaveTasks(state.tasks);
  }, [state.tasks, debouncedSaveTasks]);
  
  // Fonction pour archiver les tâches du jour précédent
  const archivePreviousDayTasks = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Vérifier si ce jour a déjà été archivé
    if (!isDayArchived(yesterday)) {
      // Récupérer les tâches d'hier (type daily uniquement)
      const yesterdayTasks = state.tasks.filter(task => {
        if (task.type !== 'daily' && task.type !== undefined) return false;
        
        if (task.date) {
          try {
            const taskDate = new Date(task.date);
            // Vérifier que la date est valide
            if (isNaN(taskDate.getTime())) {
              return false;
            }
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.toISOString().split('T')[0] === yesterdayStr;
          } catch (error) {
            console.warn('Invalid date in task:', task.date);
            return false;
          }
        }
        return false;
      });
      
      // S'il y a des tâches à archiver
      if (yesterdayTasks.length > 0) {
        addToHistory(yesterday, yesterdayTasks);
        console.log(`Archived ${yesterdayTasks.length} tasks from ${yesterdayStr}`);
      }
    }
  }, [state.tasks]);
  
  // Vérifier à minuit pour archiver les tâches du jour
  useEffect(() => {
    // Calculer le temps jusqu'à minuit
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Timer pour minuit
    const midnightTimer = setTimeout(() => {
      archivePreviousDayTasks();
      
      // Configurer un intervalle quotidien après le premier déclenchement
      const dailyInterval = setInterval(archivePreviousDayTasks, 24 * 60 * 60 * 1000);
      
      // Nettoyer l'intervalle lors du démontage
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    // Archiver immédiatement les jours passés non archivés
    archivePreviousDayTasks();
    
    // Cleanup
    return () => clearTimeout(midnightTimer);
  }, [archivePreviousDayTasks]);

  // Actions pour les radars - Optimisées avec useCallback
  const addRadar = useCallback((radar) => {
    dispatch({ type: 'ADD_RADAR', payload: radar });
  }, []);

  const updateRadar = useCallback((radar) => {
    dispatch({ type: 'UPDATE_RADAR', payload: radar });
  }, []);

  const deleteRadar = useCallback((radarId) => {
    dispatch({ type: 'DELETE_RADAR', payload: radarId });
  }, []);

  // Actions pour les tâches - Optimisées avec useCallback
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  }, []);

  const updateTask = useCallback((task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  }, []);
  
  // Fonction pour forcer la sauvegarde immédiate (sans debounce)
  const updateTaskImmediate = useCallback((task) => {
    console.log('🔄 [AppContext] updateTaskImmediate appelé:', task.id, task.name);
    
    // Mettre à jour le state
    dispatch({ type: 'UPDATE_TASK', payload: task });
    
    // Récupérer les tâches actuelles depuis le localStorage
    // pour éviter les problèmes de synchronisation avec state.tasks
    const currentTasks = loadTasks();
    const updatedTasks = currentTasks.map(t => 
      t.id === task.id ? task : t
    );
    
    // Sauvegarder immédiatement dans localStorage
    saveTasks(updatedTasks);
    console.log('✅ [AppContext] Tâche sauvegardée immédiatement');
    
    // Annuler le debounce en cours pour éviter l'écrasement
    if (debouncedSaveTasks.cancel) {
      debouncedSaveTasks.cancel();
    }
  }, [debouncedSaveTasks]);

  const deleteTask = useCallback((taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, []);

  // Fonction pour obtenir les tâches d'un jour spécifique - Optimisée avec useCallback
  const getTasksByDate = useCallback((date) => {
    const targetDate = new Date(date).toDateString();
    return state.tasks.filter(task => {
      const taskDate = new Date(task.date).toDateString();
      return taskDate === targetDate;
    });
  }, [state.tasks]);

  // Fonction pour obtenir les tâches de la semaine - Optimisée avec useCallback
  const getWeeklyTasks = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return state.tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  }, [state.tasks]);

  const setRadars = useCallback((radars) => {
    dispatch({ type: 'SET_RADARS', payload: radars });
  }, []);

  const setTasks = useCallback((tasks) => {
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }, []);

  // Optimiser la valeur du contexte avec useMemo
  // Cela évite de recréer l'objet à chaque render
  const value = useMemo(
    () => ({
      radars: state.radars,
      tasks: state.tasks,
      addRadar,
      updateRadar,
      deleteRadar,
      setRadars,
      setTasks,
      addTask,
      updateTask,
      updateTaskImmediate,
      deleteTask,
      getTasksByDate,
      getWeeklyTasks
    }),
    [
      state.radars,
      state.tasks,
      addRadar,
      updateRadar,
      deleteRadar,
      setRadars,
      setTasks,
      addTask,
      updateTask,
      updateTaskImmediate,
      deleteTask,
      getTasksByDate,
      getWeeklyTasks
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
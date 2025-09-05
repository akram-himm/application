import React, { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { loadRadars, saveRadars, loadTasks, saveTasks } from '../services/localStorage';
import { debounce } from '../utils/debounce';
import autoSaveService from '../services/autoSave';

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

  // Sauvegarder les radars quand ils changent (avec debounce)
  useEffect(() => {
    debouncedSaveRadars(state.radars);
  }, [state.radars, debouncedSaveRadars]);

  // Sauvegarder les tâches quand elles changent (avec debounce)
  useEffect(() => {
    debouncedSaveTasks(state.tasks);
  }, [state.tasks, debouncedSaveTasks]);

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
      addTask,
      updateTask,
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
      addTask,
      updateTask,
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
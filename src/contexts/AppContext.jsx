import React, { createContext, useReducer, useEffect } from 'react';
import { loadRadars, saveRadars, loadTasks, saveTasks } from '../services/localStorage';

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

  // Sauvegarder les radars quand ils changent
  useEffect(() => {
    saveRadars(state.radars);
  }, [state.radars]);

  // Sauvegarder les tâches quand elles changent
  useEffect(() => {
    saveTasks(state.tasks);
  }, [state.tasks]);

  // Actions pour les radars
  const addRadar = (radar) => {
    dispatch({ type: 'ADD_RADAR', payload: radar });
  };

  const updateRadar = (radar) => {
    dispatch({ type: 'UPDATE_RADAR', payload: radar });
  };

  const deleteRadar = (radarId) => {
    dispatch({ type: 'DELETE_RADAR', payload: radarId });
  };

  // Actions pour les tâches
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const deleteTask = (taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  // Fonction pour obtenir les tâches d'un jour spécifique
  const getTasksByDate = (date) => {
    const targetDate = new Date(date).toDateString();
    return state.tasks.filter(task => {
      const taskDate = new Date(task.date).toDateString();
      return taskDate === targetDate;
    });
  };

  // Fonction pour obtenir les tâches de la semaine
  const getWeeklyTasks = () => {
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
  };

  const value = {
    radars: state.radars,
    tasks: state.tasks,
    addRadar,
    updateRadar,
    deleteRadar,
    addTask,
    updateTask,
    deleteTask,
    getTasksByDate,
    getWeeklyTasks
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
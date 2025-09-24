/**
 * Service de gestion de l'historique des tâches
 */

import { getCurrentWorkspace } from './workspaceService';

// Obtenir la clé de stockage dynamique en fonction du workspace actuel
const getHistoryKey = () => {
  const workspace = getCurrentWorkspace();
  if (!workspace || !workspace.dataKeys) {
    return 'gestion_history'; // Clé par défaut pour la compatibilité
  }
  return workspace.dataKeys.history || 'gestion_history';
};

const MAX_HISTORY_DAYS = 365; // Garder 1 an d'historique

/**
 * Structure de l'historique:
 * {
 *   date: '2024-01-15', // Format ISO de la date
 *   tasks: [...],        // Tâches de ce jour
 *   stats: {             // Statistiques du jour
 *     total: 5,
 *     completed: 3,
 *     byPriority: {...},
 *     byRadar: {...}
 *   }
 * }
 */

// Charger l'historique depuis localStorage
export const loadHistory = () => {
  try {
    const HISTORY_KEY = getHistoryKey();
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
      const history = JSON.parse(data);
      // Nettoyer les entrées trop anciennes
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
      
      return history.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    }
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    return [];
  }
};

// Sauvegarder l'historique dans localStorage
export const saveHistory = (history) => {
  try {
    const HISTORY_KEY = getHistoryKey();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    return false;
  }
};

// Ajouter une entrée à l'historique
export const addToHistory = (date, tasks) => {
  const history = loadHistory();
  const dateStr = date.toISOString().split('T')[0];
  
  // Vérifier si une entrée existe déjà pour cette date
  const existingIndex = history.findIndex(entry => entry.date === dateStr);
  
  // Calculer les statistiques
  const stats = calculateDayStats(tasks);
  
  const newEntry = {
    date: dateStr,
    tasks: tasks,
    stats: stats,
    timestamp: new Date().toISOString()
  };
  
  if (existingIndex !== -1) {
    // Mettre à jour l'entrée existante
    history[existingIndex] = newEntry;
  } else {
    // Ajouter une nouvelle entrée
    history.push(newEntry);
  }
  
  // Trier par date décroissante
  history.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Sauvegarder
  saveHistory(history);
  
  return newEntry;
};

// Calculer les statistiques d'une journée
const calculateDayStats = (tasks) => {
  const stats = {
    total: tasks.length,
    completed: 0,
    byPriority: {},
    byRadar: {},
    byStatus: {}
  };
  
  tasks.forEach(task => {
    // Par statut
    if (task.status === 'Terminé') {
      stats.completed++;
    }
    stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
    
    // Par priorité
    const priority = task.priority || 'Normal';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    
    // Par radar
    if (task.radarName) {
      stats.byRadar[task.radarName] = (stats.byRadar[task.radarName] || 0) + 1;
    }
  });
  
  stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  return stats;
};

// Obtenir l'historique d'une période spécifique
export const getHistoryForPeriod = (startDate, endDate) => {
  const history = loadHistory();
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return history.filter(entry => {
    return entry.date >= start && entry.date <= end;
  });
};

// Obtenir les statistiques globales
export const getGlobalStats = () => {
  const history = loadHistory();
  const stats = {
    totalDays: history.length,
    totalTasks: 0,
    totalCompleted: 0,
    averagePerDay: 0,
    bestDay: null,
    currentStreak: 0,
    longestStreak: 0
  };
  
  if (history.length === 0) return stats;
  
  // Calculer les totaux
  history.forEach(entry => {
    stats.totalTasks += entry.stats.total;
    stats.totalCompleted += entry.stats.completed;
    
    // Meilleur jour
    if (!stats.bestDay || entry.stats.completed > stats.bestDay.completed) {
      stats.bestDay = {
        date: entry.date,
        completed: entry.stats.completed
      };
    }
  });
  
  stats.averagePerDay = Math.round(stats.totalTasks / history.length);
  stats.completionRate = stats.totalTasks > 0 
    ? Math.round((stats.totalCompleted / stats.totalTasks) * 100) 
    : 0;
  
  // Calculer les séries (streaks)
  let currentStreak = 0;
  let tempStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Trier par date croissante pour calculer les séries
  const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sortedHistory.forEach((entry, index) => {
    if (entry.stats.completed > 0) {
      if (index === 0 || isConsecutiveDay(sortedHistory[index - 1].date, entry.date)) {
        tempStreak++;
        if (entry.date === today || isYesterday(entry.date)) {
          currentStreak = tempStreak;
        }
      } else {
        stats.longestStreak = Math.max(stats.longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      stats.longestStreak = Math.max(stats.longestStreak, tempStreak);
      tempStreak = 0;
    }
  });
  
  stats.longestStreak = Math.max(stats.longestStreak, tempStreak);
  stats.currentStreak = currentStreak;
  
  return stats;
};

// Vérifier si deux dates sont consécutives
const isConsecutiveDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Vérifier si une date est hier
const isYesterday = (dateStr) => {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

// Vérifier si un jour a été archivé
export const isDayArchived = (date) => {
  const history = loadHistory();
  const dateStr = date.toISOString().split('T')[0];
  return history.some(entry => entry.date === dateStr);
};

// Nettoyer l'historique (supprimer les entrées trop anciennes)
export const cleanHistory = () => {
  const history = loadHistory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
  
  const cleanedHistory = history.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
  
  if (cleanedHistory.length !== history.length) {
    saveHistory(cleanedHistory);
    console.log(`Nettoyage de l'historique: ${history.length - cleanedHistory.length} entrées supprimées`);
  }
  
  return cleanedHistory;
};

// Exporter l'historique en JSON
export const exportHistory = () => {
  const history = loadHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportName = `history_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportName);
  linkElement.click();
};

// Importer l'historique depuis un fichier JSON
export const importHistory = (jsonString) => {
  try {
    const importedHistory = JSON.parse(jsonString);
    
    // Valider la structure
    if (!Array.isArray(importedHistory)) {
      throw new Error('Format invalide: l\'historique doit être un tableau');
    }
    
    // Fusionner avec l'historique existant
    const currentHistory = loadHistory();
    const mergedHistory = [...currentHistory];
    
    importedHistory.forEach(entry => {
      const existingIndex = mergedHistory.findIndex(e => e.date === entry.date);
      if (existingIndex === -1) {
        mergedHistory.push(entry);
      }
    });
    
    // Trier et sauvegarder
    mergedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveHistory(mergedHistory);
    
    return { success: true, imported: importedHistory.length };
  } catch (error) {
    console.error('Erreur lors de l\'import de l\'historique:', error);
    return { success: false, error: error.message };
  }
};
const STORAGE_KEYS = {
  RADARS: 'gestion_radars',
  TASKS: 'gestion_tasks',
  BACKUP_RADARS: 'gestion_radars_backup',
  BACKUP_TASKS: 'gestion_tasks_backup'
};

// Fonction utilitaire pour créer une backup
const createBackup = (key, data) => {
  try {
    const backupKey = key === STORAGE_KEYS.RADARS ? STORAGE_KEYS.BACKUP_RADARS : STORAGE_KEYS.BACKUP_TASKS;
    localStorage.setItem(backupKey, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error creating backup:', error);
  }
};

// Fonction pour restaurer depuis une backup
const restoreFromBackup = (key) => {
  try {
    const backupKey = key === STORAGE_KEYS.RADARS ? STORAGE_KEYS.BACKUP_RADARS : STORAGE_KEYS.BACKUP_TASKS;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      const { data } = JSON.parse(backup);
      return data;
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
  }
  return null;
};

// Radars
export const loadRadars = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RADARS);
    if (data) {
      const parsed = JSON.parse(data);
      // Vérifier que les données sont valides
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    // Ne PAS restaurer automatiquement depuis la backup
    // Cela empêche les radars supprimés de réapparaître
    return [];
  } catch (error) {
    console.error('Error loading radars:', error);
    // Ne PAS restaurer automatiquement depuis la backup en cas d'erreur
    return [];
  }
};

export const saveRadars = (radars) => {
  try {
    // Validation des données
    if (!Array.isArray(radars)) {
      throw new Error('Radars must be an array');
    }
    
    // Créer une backup avant de sauvegarder
    const currentData = localStorage.getItem(STORAGE_KEYS.RADARS);
    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        if (parsed && parsed.length > 0) {
          createBackup(STORAGE_KEYS.RADARS, parsed);
        }
      } catch (e) {
        // Ignorer si les données actuelles sont corrompues
      }
    }
    
    // Sauvegarder les nouvelles données
    localStorage.setItem(STORAGE_KEYS.RADARS, JSON.stringify(radars));
    return true;
  } catch (error) {
    console.error('Error saving radars:', error);
    
    // Si l'erreur est due à un quota dépassé
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Clearing old data...');
      // Essayer de nettoyer les vieilles données
      try {
        localStorage.removeItem(STORAGE_KEYS.BACKUP_RADARS);
        localStorage.setItem(STORAGE_KEYS.RADARS, JSON.stringify(radars));
        return true;
      } catch (retryError) {
        console.error('Failed to save after clearing backup:', retryError);
      }
    }
    return false;
  }
};

// Tasks
export const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (data) {
      const parsed = JSON.parse(data);
      // Vérifier que les données sont valides
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    // Ne PAS restaurer automatiquement depuis la backup
    // Cela empêche les tâches supprimées de réapparaître
    return [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    // Ne PAS restaurer automatiquement depuis la backup en cas d'erreur
    return [];
  }
};

export const saveTasks = (tasks) => {
  try {
    // Validation des données
    if (!Array.isArray(tasks)) {
      throw new Error('Tasks must be an array');
    }
    
    // Créer une backup avant de sauvegarder
    const currentData = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (currentData) {
      try {
        const parsed = JSON.parse(currentData);
        if (parsed && parsed.length > 0) {
          createBackup(STORAGE_KEYS.TASKS, parsed);
        }
      } catch (e) {
        // Ignorer si les données actuelles sont corrompues
      }
    }
    
    // Sauvegarder les nouvelles données
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    
    // Si l'erreur est due à un quota dépassé
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Clearing old data...');
      // Essayer de nettoyer les vieilles données
      try {
        localStorage.removeItem(STORAGE_KEYS.BACKUP_TASKS);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return true;
      } catch (retryError) {
        console.error('Failed to save after clearing backup:', retryError);
      }
    }
    return false;
  }
};

// Clear all data
export const clearAllData = () => {
  try {
    // Supprimer les données principales
    localStorage.removeItem(STORAGE_KEYS.RADARS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    // Supprimer les backups
    localStorage.removeItem(STORAGE_KEYS.BACKUP_RADARS);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_TASKS);
    // Supprimer toutes les autres données de l'application
    localStorage.removeItem('gestion_history');
    localStorage.removeItem('gestion_calendar');
    localStorage.removeItem('gestion_settings');
    localStorage.removeItem('gestion_subjects');
    localStorage.removeItem('pages');
    localStorage.removeItem('page_contents');
    localStorage.removeItem('task_rotation_blocked');
    localStorage.removeItem('last_task_rotation');

    // Supprimer toutes les clés qui pourraient être liées à l'application
    Object.keys(localStorage).forEach(key => {
      if (key.includes('gestion_') || key.includes('radar') || key.includes('subject') || key.startsWith('page_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Fonction pour restaurer manuellement depuis le backup (si vraiment nécessaire)
export const manualRestoreFromBackup = (type) => {
  if (type === 'radars') {
    const backup = restoreFromBackup(STORAGE_KEYS.RADARS);
    if (backup) {
      saveRadars(backup);
      return true;
    }
  } else if (type === 'tasks') {
    const backup = restoreFromBackup(STORAGE_KEYS.TASKS);
    if (backup) {
      saveTasks(backup);
      return true;
    }
  }
  return false;
};

// Export/Import functionality
export const exportData = () => {
  try {
    const data = {
      radars: loadRadars(),
      tasks: loadTasks(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.radars) {
      saveRadars(data.radars);
    }
    if (data.tasks) {
      saveTasks(data.tasks);
    }
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
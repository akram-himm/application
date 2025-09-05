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
    // Essayer de restaurer depuis la backup
    const backup = restoreFromBackup(STORAGE_KEYS.RADARS);
    if (backup) {
      console.warn('Restored radars from backup');
      return backup;
    }
    return [];
  } catch (error) {
    console.error('Error loading radars, attempting backup restore:', error);
    // Essayer de restaurer depuis la backup
    const backup = restoreFromBackup(STORAGE_KEYS.RADARS);
    return backup || [];
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
    // Essayer de restaurer depuis la backup
    const backup = restoreFromBackup(STORAGE_KEYS.TASKS);
    if (backup) {
      console.warn('Restored tasks from backup');
      return backup;
    }
    return [];
  } catch (error) {
    console.error('Error loading tasks, attempting backup restore:', error);
    // Essayer de restaurer depuis la backup
    const backup = restoreFromBackup(STORAGE_KEYS.TASKS);
    return backup || [];
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
    localStorage.removeItem(STORAGE_KEYS.RADARS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
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
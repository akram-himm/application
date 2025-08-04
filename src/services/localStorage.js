const STORAGE_KEYS = {
  RADARS: 'gestion_radars',
  TASKS: 'gestion_tasks'
};

// Radars
export const loadRadars = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RADARS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading radars:', error);
    return [];
  }
};

export const saveRadars = (radars) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RADARS, JSON.stringify(radars));
  } catch (error) {
    console.error('Error saving radars:', error);
  }
};

// Tasks
export const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
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
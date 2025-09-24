/**
 * Service de gestion des workspaces (espaces de travail)
 * Permet de créer, gérer et basculer entre plusieurs workspaces comme dans Notion
 */

const WORKSPACE_STORAGE_KEY = 'app_workspaces';
const CURRENT_WORKSPACE_KEY = 'app_current_workspace';

// Structure d'un workspace
const createWorkspace = (name, icon = '🏢', color = 'blue') => {
  const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  // Utiliser l'ID du workspace pour garantir l'unicité des clés
  const uniqueId = workspaceId.replace('ws_', '');

  const workspace = {
    id: workspaceId,
    name,
    icon,
    color,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    settings: {
      theme: 'light',
      language: 'fr'
    },
    members: [],
    isPersonal: true,
    // Chaque workspace a ses propres données avec des clés vraiment uniques
    dataKeys: {
      radars: `radars_${uniqueId}`,
      tasks: `tasks_${uniqueId}`,
      pages: `pages_${uniqueId}`,
      history: `history_${uniqueId}`,
      notes: `notes_${uniqueId}`,
      trash: `trash_${uniqueId}`,
      akram: `akram_${uniqueId}`,
      radarnotes: `radarnotes_${uniqueId}`
    }
  };

  // Initialiser les données vides pour le nouveau workspace
  localStorage.setItem(workspace.dataKeys.radars, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.tasks, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.pages, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.history, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.notes, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.trash, JSON.stringify([]));
  localStorage.setItem(workspace.dataKeys.akram, JSON.stringify({
    penalties: [],
    settings: { penaltyDays: 3, penaltyValue: 5 }
  }));
  localStorage.setItem(workspace.dataKeys.radarnotes, JSON.stringify({}));

  return workspace;
};

// Obtenir tous les workspaces
export const getAllWorkspaces = () => {
  try {
    const stored = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!stored) {
      // Créer un workspace par défaut si aucun n'existe
      const defaultWorkspace = createWorkspace('Mon Workspace', '🏠');
      saveWorkspaces([defaultWorkspace]);
      setCurrentWorkspace(defaultWorkspace.id);
      return [defaultWorkspace];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors du chargement des workspaces:', error);
    return [];
  }
};

// Sauvegarder les workspaces
const saveWorkspaces = (workspaces) => {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaces));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des workspaces:', error);
    return false;
  }
};

// Obtenir le workspace actuel
export const getCurrentWorkspace = () => {
  try {
    const currentId = localStorage.getItem(CURRENT_WORKSPACE_KEY);
    if (!currentId) {
      const workspaces = getAllWorkspaces();
      if (workspaces.length > 0) {
        setCurrentWorkspace(workspaces[0].id);
        return workspaces[0];
      }
      return null;
    }

    const workspaces = getAllWorkspaces();
    const current = workspaces.find(ws => ws.id === currentId);

    if (!current && workspaces.length > 0) {
      // Si le workspace actuel n'existe plus, sélectionner le premier
      setCurrentWorkspace(workspaces[0].id);
      return workspaces[0];
    }

    return current;
  } catch (error) {
    console.error('Erreur lors de la récupération du workspace actuel:', error);
    return null;
  }
};

// Définir le workspace actuel
export const setCurrentWorkspace = (workspaceId) => {
  try {
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);

    // Mettre à jour lastAccessed
    const workspaces = getAllWorkspaces();
    const updated = workspaces.map(ws =>
      ws.id === workspaceId
        ? { ...ws, lastAccessed: new Date().toISOString() }
        : ws
    );
    saveWorkspaces(updated);

    // Déclencher un événement pour notifier le changement
    window.dispatchEvent(new CustomEvent('workspaceChanged', {
      detail: { workspaceId }
    }));

    return true;
  } catch (error) {
    console.error('Erreur lors du changement de workspace:', error);
    return false;
  }
};

// Créer un nouveau workspace
export const createNewWorkspace = (name, icon = '🏢', color = 'blue') => {
  try {
    const newWorkspace = createWorkspace(name, icon, color);
    const workspaces = getAllWorkspaces();
    workspaces.push(newWorkspace);
    saveWorkspaces(workspaces);
    return newWorkspace;
  } catch (error) {
    console.error('Erreur lors de la création du workspace:', error);
    return null;
  }
};

// Mettre à jour un workspace
export const updateWorkspace = (workspaceId, updates) => {
  try {
    const workspaces = getAllWorkspaces();
    const index = workspaces.findIndex(ws => ws.id === workspaceId);

    if (index === -1) return false;

    workspaces[index] = {
      ...workspaces[index],
      ...updates,
      id: workspaces[index].id // Empêcher la modification de l'ID
    };

    saveWorkspaces(workspaces);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du workspace:', error);
    return false;
  }
};

// Supprimer un workspace
export const deleteWorkspace = (workspaceId) => {
  try {
    const workspaces = getAllWorkspaces();

    // Empêcher la suppression s'il ne reste qu'un workspace
    if (workspaces.length <= 1) {
      console.warn('Impossible de supprimer le dernier workspace');
      return false;
    }

    const filtered = workspaces.filter(ws => ws.id !== workspaceId);
    saveWorkspaces(filtered);

    // Si c'était le workspace actuel, basculer vers un autre
    const currentId = localStorage.getItem(CURRENT_WORKSPACE_KEY);
    if (currentId === workspaceId && filtered.length > 0) {
      setCurrentWorkspace(filtered[0].id);
    }

    // Supprimer les données associées au workspace
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace && workspace.dataKeys) {
      Object.values(workspace.dataKeys).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Impossible de supprimer ${key}:`, e);
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du workspace:', error);
    return false;
  }
};

// Dupliquer un workspace
export const duplicateWorkspace = (workspaceId, newName) => {
  try {
    const workspaces = getAllWorkspaces();
    const original = workspaces.find(ws => ws.id === workspaceId);

    if (!original) return null;

    const duplicated = createWorkspace(
      newName || `${original.name} (copie)`,
      original.icon,
      original.color
    );

    // Copier les settings
    duplicated.settings = { ...original.settings };

    // Copier les données si nécessaire
    if (original.dataKeys) {
      Object.entries(original.dataKeys).forEach(([key, storageKey]) => {
        try {
          const data = localStorage.getItem(storageKey);
          if (data) {
            localStorage.setItem(duplicated.dataKeys[key], data);
          }
        } catch (e) {
          console.warn(`Impossible de copier ${key}:`, e);
        }
      });
    }

    workspaces.push(duplicated);
    saveWorkspaces(workspaces);

    return duplicated;
  } catch (error) {
    console.error('Erreur lors de la duplication du workspace:', error);
    return null;
  }
};

// Obtenir les données d'un workspace spécifique
export const getWorkspaceData = (dataType) => {
  const workspace = getCurrentWorkspace();
  if (!workspace || !workspace.dataKeys) return null;

  const storageKey = workspace.dataKeys[dataType];
  if (!storageKey) return null;

  try {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération des ${dataType}:`, error);
    return null;
  }
};

// Sauvegarder les données d'un workspace spécifique
export const saveWorkspaceData = (dataType, data) => {
  const workspace = getCurrentWorkspace();
  if (!workspace || !workspace.dataKeys) return false;

  const storageKey = workspace.dataKeys[dataType];
  if (!storageKey) return false;

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des ${dataType}:`, error);
    return false;
  }
};

// Liste d'icônes disponibles pour les workspaces
export const WORKSPACE_ICONS = [
  '🏠', '🏢', '🏭', '🏗️', '🏛️', '🏪', '🏬', '🏦',
  '📚', '💼', '🎯', '🚀', '💡', '🔬', '🎨', '🎮',
  '📊', '📈', '📉', '💰', '💸', '🏆', '🎖️', '🏅',
  '🌟', '⭐', '✨', '🔥', '💎', '🎯', '🎪', '🎭'
];

// Liste de couleurs disponibles
export const WORKSPACE_COLORS = [
  { name: 'blue', value: '#2383E2' },
  { name: 'green', value: '#22C55E' },
  { name: 'purple', value: '#9333EA' },
  { name: 'red', value: '#EF4444' },
  { name: 'yellow', value: '#FDB36C' },
  { name: 'pink', value: '#EC4899' },
  { name: 'indigo', value: '#6366F1' },
  { name: 'gray', value: '#6B7280' }
];

// Initialiser les workspaces au chargement
export const initializeWorkspaces = () => {
  const workspaces = getAllWorkspaces();
  if (workspaces.length === 0) {
    const defaultWorkspace = createWorkspace('Mon Workspace', '🏠');
    saveWorkspaces([defaultWorkspace]);
    setCurrentWorkspace(defaultWorkspace.id);
  }
};
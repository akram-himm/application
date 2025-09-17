// Service de gestion de la corbeille
const TRASH_KEY = 'app_trash';

// Charger la corbeille depuis localStorage
export const loadTrash = () => {
  try {
    const trash = localStorage.getItem(TRASH_KEY);
    return trash ? JSON.parse(trash) : [];
  } catch (error) {
    console.error('Erreur lors du chargement de la corbeille:', error);
    return [];
  }
};

// Sauvegarder la corbeille dans localStorage
export const saveTrash = (trash) => {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la corbeille:', error);
    return false;
  }
};

// Ajouter un élément à la corbeille
export const addToTrash = (item) => {
  const trash = loadTrash();
  const trashedItem = {
    ...item,
    trashedAt: new Date().toISOString(),
    id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  trash.unshift(trashedItem); // Ajouter au début pour avoir les plus récents en premier

  // Limiter la taille de la corbeille à 100 éléments
  if (trash.length > 100) {
    trash.splice(100);
  }

  saveTrash(trash);
  return trashedItem;
};

// Restaurer un élément de la corbeille
export const restoreFromTrash = (itemId) => {
  const trash = loadTrash();
  const itemIndex = trash.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return null;
  }

  const [restoredItem] = trash.splice(itemIndex, 1);
  saveTrash(trash);

  // Retirer les métadonnées de la corbeille
  delete restoredItem.trashedAt;
  const originalId = restoredItem.originalId || restoredItem.id.replace(/^trash-.*-/, '');
  restoredItem.id = originalId;
  delete restoredItem.originalId;

  return restoredItem;
};

// Supprimer définitivement un élément de la corbeille
export const deleteFromTrash = (itemId) => {
  const trash = loadTrash();
  const newTrash = trash.filter(item => item.id !== itemId);
  saveTrash(newTrash);
  return true;
};

// Vider complètement la corbeille
export const emptyTrash = () => {
  saveTrash([]);
  return true;
};

// Obtenir le nombre d'éléments dans la corbeille
export const getTrashCount = () => {
  const trash = loadTrash();
  return trash.length;
};

// Nettoyer automatiquement les éléments de plus de 30 jours
export const cleanOldTrashItems = () => {
  const trash = loadTrash();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newTrash = trash.filter(item => {
    const trashedDate = new Date(item.trashedAt);
    return trashedDate > thirtyDaysAgo;
  });

  if (newTrash.length !== trash.length) {
    saveTrash(newTrash);
  }

  return trash.length - newTrash.length; // Nombre d'éléments supprimés
};
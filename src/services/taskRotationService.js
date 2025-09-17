/**
 * Service de rotation automatique des tâches à minuit
 * Déplace les tâches du jour vers l'historique et charge les tâches du jour suivant
 */

import { addToHistory } from './historyService';

// Clé pour stocker l'état du blocage
const ROTATION_BLOCKED_KEY = 'task_rotation_blocked';
const LAST_ROTATION_KEY = 'last_task_rotation';

// Vérifier si la rotation est bloquée
export const isRotationBlocked = () => {
  return localStorage.getItem(ROTATION_BLOCKED_KEY) === 'true';
};

// Activer/désactiver le blocage de rotation
export const setRotationBlocked = (blocked) => {
  localStorage.setItem(ROTATION_BLOCKED_KEY, blocked ? 'true' : 'false');
};

// Obtenir la dernière date de rotation
export const getLastRotationDate = () => {
  const lastRotation = localStorage.getItem(LAST_ROTATION_KEY);
  return lastRotation ? new Date(lastRotation) : null;
};

// Sauvegarder la date de dernière rotation
export const setLastRotationDate = (date) => {
  localStorage.setItem(LAST_ROTATION_KEY, date.toISOString());
};

// Vérifier si on doit faire une rotation (nouveau jour)
export const shouldRotate = () => {
  if (isRotationBlocked()) {
    console.log('🔒 Rotation bloquée par l\'utilisateur');
    return false;
  }

  const now = new Date();
  const lastRotation = getLastRotationDate();
  
  if (!lastRotation) {
    // Première utilisation
    return true;
  }
  
  // Vérifier si on est passé à un nouveau jour
  const lastDay = lastRotation.toDateString();
  const currentDay = now.toDateString();
  
  return lastDay !== currentDay;
};

// Effectuer la rotation des tâches
export const rotateTasks = (tasks, updateTasks, isManualRotation = false) => {
  if (!shouldRotate() && !isManualRotation) {
    return false;
  }

  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  console.log('🔄 Rotation des tâches en cours...');

  // Formater les dates en YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const yesterdayStr = formatDate(yesterday);
  const todayStr = formatDate(now);

  // Séparer les tâches
  const yesterdayTasks = [];
  const todayTasks = [];
  const futureTasks = [];
  const tasksWithoutDate = [];
  const routineTasks = [];

  tasks.forEach(task => {
    // Les tâches routine sont spéciales
    if (task.type === 'routine') {
      routineTasks.push(task);
      return;
    }

    const taskDate = task.date || task.startDate;

    if (!taskDate || taskDate === '-') {
      // Tâches sans date restent dans To-Do
      tasksWithoutDate.push(task);
    } else if (taskDate === yesterdayStr) {
      // Tâches d'hier -> historique seulement si "Fait"
      if (task.status === 'Fait' || task.status === 'done' || task.status === 'terminé') {
        yesterdayTasks.push(task);
      } else {
        // Les tâches non terminées d'hier restent visibles
        todayTasks.push(task);
      }
    } else if (taskDate === todayStr) {
      // Tâches d'aujourd'hui -> restent visibles
      todayTasks.push(task);
    } else if (taskDate > todayStr) {
      // Tâches futures -> gardées pour plus tard
      futureTasks.push(task);
    } else {
      // Tâches anciennes (avant hier) -> historique seulement si "Fait"
      if (task.status === 'Fait' || task.status === 'done' || task.status === 'terminé') {
        yesterdayTasks.push(task);
      } else {
        // Les tâches non terminées restent visibles
        todayTasks.push(task);
      }
    }
  });
  
  // Archiver seulement les tâches terminées dans l'historique
  // Sauf les routines qui sont recréées chaque jour
  const tasksToArchive = yesterdayTasks.filter(t => t.type !== 'routine');
  if (tasksToArchive.length > 0) {
    addToHistory(yesterday, tasksToArchive);
    console.log(`📦 ${tasksToArchive.length} tâche(s) terminée(s) archivée(s) dans l'historique`);
  }
  
  // Créer les nouvelles copies des routines pour aujourd'hui
  const newRoutineTasks = routineTasks.map(routine => ({
    ...routine,
    id: `${routine.id}_${todayStr}`, // ID unique pour chaque jour
    date: todayStr,
    status: 'À faire' // Réinitialiser le statut
  }));
  
  // Mettre à jour la liste des tâches
  // Garder les tâches d'aujourd'hui, futures, sans date, routines originales et nouvelles routines
  const newTaskList = [
    ...todayTasks,
    ...futureTasks,
    ...tasksWithoutDate,
    ...routineTasks, // Garder les routines originales
    ...newRoutineTasks // Ajouter les nouvelles copies pour aujourd'hui
  ];
  
  // Mettre à jour les tâches via le contexte
  if (updateTasks) {
    updateTasks(newTaskList);
  }
  
  // Marquer la rotation comme effectuée
  setLastRotationDate(now);
  
  console.log('✅ Rotation terminée');
  console.log(`   - ${yesterdayTasks.length} tâche(s) archivée(s)`);
  console.log(`   - ${todayTasks.length} tâche(s) du jour affichée(s)`);
  console.log(`   - ${tasksWithoutDate.length} tâche(s) sans date conservée(s)`);
  
  return true;
};

// Initialiser le système de rotation (à appeler au démarrage)
export const initTaskRotation = (tasks, updateTasks) => {
  // Vérifier immédiatement au démarrage
  if (shouldRotate()) {
    rotateTasks(tasks, updateTasks, false);
  }

  // Vérifier toutes les minutes si on doit faire une rotation
  const checkInterval = setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Vérifier à minuit pile (00:00)
    if (hours === 0 && minutes === 0) {
      console.log('⏰ Minuit ! Vérification de rotation...');
      rotateTasks(tasks, updateTasks, false);
    }
  }, 60000); // Vérifier toutes les minutes
  
  // Retourner la fonction pour arrêter l'intervalle si nécessaire
  return () => clearInterval(checkInterval);
};

// Forcer une rotation manuelle (pour les tests ou besoins spécifiques)
export const forceRotation = (tasks, updateTasks) => {
  const wasBlocked = isRotationBlocked();

  // Débloquer temporairement
  setRotationBlocked(false);

  // Réinitialiser la dernière date pour forcer la rotation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  setLastRotationDate(yesterday);

  // Effectuer la rotation avec le flag manuel
  const result = rotateTasks(tasks, updateTasks, true);

  // Restaurer l'état de blocage
  setRotationBlocked(wasBlocked);

  return result;
};
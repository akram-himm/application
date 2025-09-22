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

  console.log('🔄 Rotation des tâches en cours...');

  // Formater les dates en YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(now);

  // Calculer le nombre de jours manqués depuis la dernière rotation
  const lastRotation = getLastRotationDate();
  let daysMissed = 0;

  if (lastRotation) {
    const timeDiff = now.getTime() - lastRotation.getTime();
    daysMissed = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  }

  console.log(`📅 Jours manqués depuis la dernière rotation: ${daysMissed}`);

  // Créer un objet pour organiser les tâches par date pour l'archivage
  const tasksToArchiveByDate = {};

  // D'abord, traiter chaque jour manqué (du plus ancien au plus récent)
  if (daysMissed > 1) {
    for (let i = daysMissed - 1; i >= 1; i--) {
      const missedDate = new Date(now);
      missedDate.setDate(missedDate.getDate() - i);
      const missedDateStr = formatDate(missedDate);

      // Initialiser le tableau pour cette date
      tasksToArchiveByDate[missedDateStr] = {
        date: missedDate,
        tasks: []
      };
    }
  }

  // Séparer les tâches
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
    } else if (taskDate === todayStr) {
      // Tâches d'aujourd'hui -> restent visibles
      todayTasks.push(task);
    } else if (taskDate > todayStr) {
      // Tâches futures -> gardées pour plus tard
      futureTasks.push(task);
    } else {
      // Tâches anciennes -> archiver avec leur date correcte
      // Si la date existe dans notre map, l'utiliser, sinon créer une nouvelle entrée
      if (!tasksToArchiveByDate[taskDate]) {
        const taskDateObj = new Date(taskDate + 'T00:00:00');
        tasksToArchiveByDate[taskDate] = {
          date: taskDateObj,
          tasks: []
        };
      }
      tasksToArchiveByDate[taskDate].tasks.push(task);
    }
  });

  // Archiver chaque jour avec ses tâches respectives
  let totalArchived = 0;
  Object.values(tasksToArchiveByDate).forEach(({ date, tasks: tasksForDate }) => {
    // Filtrer les routines
    const nonRoutineTasks = tasksForDate.filter(t => t.type !== 'routine');
    if (nonRoutineTasks.length > 0) {
      addToHistory(date, nonRoutineTasks);
      console.log(`📦 ${nonRoutineTasks.length} tâche(s) du ${formatDate(date)} archivée(s)`);
      totalArchived += nonRoutineTasks.length;
    }
  });

  // Gérer les routines pour chaque jour manqué
  const allRoutineTasks = [];

  // Si on a manqué des jours, créer les routines pour chaque jour manqué
  if (daysMissed > 1) {
    for (let i = daysMissed - 1; i >= 1; i--) {
      const missedDate = new Date(now);
      missedDate.setDate(missedDate.getDate() - i);
      const missedDateStr = formatDate(missedDate);

      // Créer les routines pour ce jour manqué et les archiver immédiatement
      const missedRoutines = routineTasks.map(routine => ({
        ...routine,
        id: `${routine.id}_${missedDateStr}`,
        date: missedDateStr,
        status: 'Non fait' // Marquer comme non fait car le jour est passé
      }));

      // Archiver ces routines manquées
      if (missedRoutines.length > 0) {
        addToHistory(missedDate, missedRoutines);
        console.log(`📝 ${missedRoutines.length} routine(s) du ${missedDateStr} archivée(s) comme non faite(s)`);
      }
    }
  }

  // Créer les nouvelles copies des routines pour aujourd'hui seulement
  const newRoutineTasks = routineTasks.map(routine => ({
    ...routine,
    id: `${routine.id}_${todayStr}`, // ID unique pour chaque jour
    date: todayStr,
    status: 'À faire' // Réinitialiser le statut pour aujourd'hui
  }));

  // Mettre à jour la liste des tâches
  // Garder uniquement les tâches pertinentes pour aujourd'hui
  const newTaskList = [
    ...todayTasks,
    ...futureTasks,
    ...tasksWithoutDate,
    ...routineTasks, // Garder les routines originales (templates)
    ...newRoutineTasks // Ajouter les nouvelles copies pour aujourd'hui
  ];
  
  // Mettre à jour les tâches via le contexte
  if (updateTasks) {
    updateTasks(newTaskList);
  }
  
  // Marquer la rotation comme effectuée
  setLastRotationDate(now);
  console.log('✅ Rotation terminée');
  console.log(`   - ${totalArchived} tâche(s) archivée(s) au total`);
  console.log(`   - ${todayTasks.length} tâche(s) du jour affichée(s)`);
  console.log(`   - ${tasksWithoutDate.length} tâche(s) sans date conservée(s)`);
  if (daysMissed > 1) {
    console.log(`   - ${daysMissed - 1} jour(s) manqué(s) traité(s)`);
  }
  
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
  console.log('🔄 Rotation manuelle déclenchée');

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Formater les dates en YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(now);
  const yesterdayStr = formatDate(yesterday);

  // Filtrer les tâches d'aujourd'hui à archiver
  const todayTasks = tasks.filter(task => {
    const taskDate = task.date || task.startDate;
    return taskDate === todayStr && task.type !== 'routine';
  });

  // Ajouter les tâches d'aujourd'hui à l'historique avec la date d'aujourd'hui
  // (elles apparaîtront dans l'historique comme des tâches du jour actuel)
  if (todayTasks.length > 0) {
    addToHistory(now, todayTasks);
    console.log(`📦 ${todayTasks.length} tâche(s) d'aujourd'hui archivée(s) dans l'historique`);
  }

  // Retirer les tâches d'aujourd'hui de la liste actuelle
  const remainingTasks = tasks.filter(task => {
    const taskDate = task.date || task.startDate;
    // Retirer les tâches d'aujourd'hui qui ont été archivées
    if (taskDate === todayStr && task.type !== 'routine') {
      return false;
    }
    // Garder les tâches futures, sans date, ou routines
    return true;
  });

  // Mettre à jour les tâches
  if (updateTasks) {
    updateTasks(remainingTasks);
    console.log(`✅ Rotation manuelle terminée - ${remainingTasks.length} tâche(s) restante(s)`);
  }

  // Marquer la rotation comme effectuée
  setLastRotationDate(now);

  return true;
};
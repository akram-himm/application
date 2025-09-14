import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';

const MonthlyCalendar = ({ tasks, currentDate, onDayClick, onAddTask, onTaskClick, onDeleteTask }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Obtenir les jours du mois
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay() || 7; // Lundi = 1, Dimanche = 7
    
    const days = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 2; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isNextMonth: true
      });
    }
    
    return days;
  }, [currentDate]);

  // Obtenir les tâches pour un jour donné
  const getTasksForDay = (date) => {
    // Formater la date en format local YYYY-MM-DD sans conversion UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return tasks.filter(task => {
      const taskDate = task.date || task.startDate;
      if (!taskDate || taskDate === '-') return false;
      return taskDate === dateStr;
    });
  };

  // Gérer le clic sur un jour
  const handleDayClick = (day) => {
    if (day.isCurrentMonth) {
      onDayClick(day.date);
    }
  };

  // Gérer l'ajout de tâche
  const handleAddClick = (e, day) => {
    e.stopPropagation();
    if (day.isCurrentMonth && onAddTask) {
      onAddTask(day.date);
    }
  };

  // Gérer le clic droit
  const handleContextMenu = (e, day) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!day.isCurrentMonth) return;
    
    const dayTasks = getTasksForDay(day.date);
    if (dayTasks.length === 0) return;
    
    // Obtenir la position exacte du carré cliqué
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Position centrée sous le carré
    const menuWidth = 200;
    const leftPosition = rect.left + (rect.width / 2) - (menuWidth / 2);
    const topPosition = rect.bottom + 5;
    
    setContextMenu({
      x: leftPosition,
      y: topPosition,
      day: day,
      tasks: dayTasks
    });
  };

  // Fermer le menu contextuel
  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Supprimer toutes les tâches du jour
  const handleDeleteAllTasks = () => {
    if (contextMenu && contextMenu.tasks) {
      setShowDeleteConfirm(contextMenu);
      closeContextMenu();
    }
  };

  // Confirmer la suppression
  const confirmDeleteAll = () => {
    if (showDeleteConfirm && showDeleteConfirm.tasks) {
      showDeleteConfirm.tasks.forEach(task => {
        if (onDeleteTask) {
          onDeleteTask(task.id);
        }
      });
      setShowDeleteConfirm(null);
    }
  };

  // Fermer le menu contextuel quand on clique ailleurs
  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div>
      {/* En-tête avec les jours de la semaine */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => {
          const dayTasks = getTasksForDay(day.date);
          const hasEvents = dayTasks.length > 0;
          
          return (
            <div
              key={index}
              className={`
                relative min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                ${day.isCurrentMonth 
                  ? 'bg-white hover:bg-gray-50 border-gray-200' 
                  : 'bg-gray-50 border-gray-100 opacity-50'}
                ${day.isToday ? 'ring-2 ring-blue-400 border-blue-400' : ''}
                ${hoveredDay === index ? 'shadow-md' : ''}
              `}
              onClick={() => handleDayClick(day)}
              onContextMenu={(e) => handleContextMenu(e, day)}
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Numéro du jour */}
              <div className="flex items-start justify-between mb-1">
                <span className={`text-sm font-medium ${
                  day.isToday ? 'text-blue-600' : 
                  day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </span>
                
                {/* Bouton + pour ajouter une tâche */}
                {day.isCurrentMonth && hoveredDay === index && (
                  <button
                    onClick={(e) => handleAddClick(e, day)}
                    className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Indicateurs de tâches */}
              {hasEvents && (
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className={`text-xs p-1 rounded truncate relative ${
                        task.status === 'Terminé' 
                          ? 'bg-green-100 text-green-700' 
                          : task.status === 'En cours'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                      title={`${task.name}${task.radarName ? ` - ${task.radarName}${task.subjectName ? ' › ' + task.subjectName : ''}` : ''}`}
                    >
                      {/* Indicateur de radar - petit point bleu */}
                      {task.radarName && (
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1" />
                      )}
                      {task.time && task.time !== '-' && (
                        <span className="font-medium mr-1">{task.time}</span>
                      )}
                      {task.name}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 3} autres
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Menu contextuel - Rendu avec un portail pour éviter les problèmes de positionnement */}
      {contextMenu && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            left: Math.max(10, Math.min(contextMenu.x, window.innerWidth - 210)),
            top: Math.min(contextMenu.y, window.innerHeight - 100),
            zIndex: 1000
          }}
          className="bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
        >
          <button
            onClick={handleDeleteAllTasks}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer toutes les tâches ({contextMenu.tasks.length})
          </button>
        </div>,
        document.body
      )}

      {/* Dialogue de confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-1">
              Voulez-vous supprimer toutes les tâches du{' '}
              <strong>
                {showDeleteConfirm.day.date.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </strong> ?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {showDeleteConfirm.tasks.length} tâche{showDeleteConfirm.tasks.length > 1 ? 's' : ''} seront supprimées.
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer tout
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;
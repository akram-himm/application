import React, { useState, useMemo } from 'react';

const WeeklyCalendarGrid = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('#9ca3af');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#9ca3af');
  const [eventStatus, setEventStatus] = useState('À faire');
  const [eventDescription, setEventDescription] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  // Obtenir les jours de la semaine actuelle
  const getWeekDays = () => {
    const week = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6h à 23h

  // Organiser les tâches par jour et heure
  const tasksByDayAndHour = useMemo(() => {
    const organized = {};
    
    tasks.forEach(task => {
      // Support pour startDate (tâches hebdomadaires) et date (autres tâches)
      const taskDate = task.startDate || task.date;
      if (!taskDate || taskDate === '-' || !task.time || task.time === '-') return;
      
      const date = new Date(taskDate);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const hour = parseInt(task.time.split(':')[0]);
      
      if (!organized[dayKey]) organized[dayKey] = {};
      if (!organized[dayKey][hour]) organized[dayKey][hour] = [];
      
      organized[dayKey][hour].push(task);
    });
    
    return organized;
  }, [tasks]);

  // Gérer le début du glisser
  const handleMouseDown = (date, hour) => {
    setIsDragging(true);
    const dateStr = date.toISOString().split('T')[0];
    setDragStart({ date: dateStr, hour, dayIndex: date.getDay() });
    setDragEnd({ date: dateStr, hour, dayIndex: date.getDay() });
  };

  // Gérer le mouvement pendant le glisser
  const handleMouseEnter = (date, hour) => {
    if (isDragging && dragStart) {
      const dateStr = date.toISOString().split('T')[0];
      setDragEnd({ date: dateStr, hour, dayIndex: date.getDay() });
    }
  };

  // Gérer la fin du glisser
  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd) {
      // Calculer l'heure de début et de fin
      const startHour = Math.min(dragStart.hour, dragEnd.hour);
      const endHour = Math.max(dragStart.hour, dragEnd.hour) + 1;
      
      // Utiliser la date du début de la sélection
      const selectedDate = dragStart.date;
      
      setNewEvent({
        date: selectedDate,
        time: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`
      });
      
      setEventTitle('');
      setEventColor('#9ca3af');
      setEventStatus('À faire');
      setEventDescription('');
      setShowModal(true);
    }
    
    // Réinitialiser l'état du glisser
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Sauvegarder la nouvelle tâche
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;
    
    const newTask = {
      name: eventTitle,
      type: 'weekly',
      status: eventStatus,
      priority: 'Normal',
      startDate: newEvent.date,
      endDate: newEvent.date,
      time: newEvent.time,
      endTime: newEvent.endTime,
      color: eventColor,
      description: eventDescription
    };
    
    onAddTask(newTask);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEventTitle('');
    setEventColor('#9ca3af');
    setTempColor('#9ca3af');
    setEventStatus('À faire');
    setEventDescription('');
    setNewEvent(null);
    setShowColorPicker(false);
    setSelectedCell(null);
  };

  // Gérer le clic sur une tâche existante
  const handleTaskClick = (e, task) => {
    e.stopPropagation();
    // Édition de la tâche
    console.log('Task clicked:', task);
  };

  // Gérer le clic droit sur une tâche
  const handleTaskContextMenu = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Voulez-vous supprimer cette tâche ?')) {
      onDeleteTask(task.id);
    }
  };

  // Vérifier si une cellule est dans la sélection
  const isCellInSelection = (date, hour) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Vérifier si c'est le même jour
    if (dragStart.date !== dateStr) return false;
    
    // Vérifier si l'heure est dans la plage sélectionnée
    const minHour = Math.min(dragStart.hour, dragEnd.hour);
    const maxHour = Math.max(dragStart.hour, dragEnd.hour);
    
    return hour >= minHour && hour <= maxHour;
  };

  // Convertir couleur hex en rgba
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Navigation dans les semaines
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="p-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <style>{`
        /* Style simple et propre */
        .calendar-grid {
          font-family: inherit;
          background: transparent;
        }
        
        /* Lignes de 30 minutes */
        .half-hour-line {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(156, 163, 175, 0.2);
          pointer-events: none;
        }
        
        /* Événements style Google Calendar */
        .calendar-event {
          backdrop-filter: blur(4px);
          border-width: 1px;
          border-left-width: 3px !important;
          border-radius: 0.375rem;
          padding: 0;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.15s;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .calendar-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10 !important;
        }
      `}</style>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNextWeek}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
        <div className="text-sm font-medium text-gray-700">
          {weekDays[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] bg-white/70 rounded-xl shadow-sm ring-1 ring-gray-200">
          {/* En-tête avec les jours */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-center text-xs font-medium text-gray-500">
              {/* Cellule vide pour l'alignement */}
            </div>
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`p-3 text-center border-l-2 border-gray-300 ${
                    isToday ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className={`text-xl font-semibold mt-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille horaire */}
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b-2 border-gray-200 last:border-b-0">
                {/* Colonne des heures */}
                <div className="relative p-2 text-right pr-6 text-xs font-medium text-gray-500">
                  <div className="absolute -top-2 right-6">
                    {`${hour.toString().padStart(2, '0')}:00`}
                  </div>
                </div>
                
                {/* Cellules pour chaque jour */}
                {weekDays.map((day, dayIndex) => {
                  const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
                  const tasksAtHour = tasksByDayAndHour[dayKey]?.[hour] || [];
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isInSelection = isCellInSelection(day, hour);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`relative min-h-[115px] p-1 border-l-2 border-gray-300 hover:bg-gray-50/50 cursor-pointer select-none ${
                        isToday ? 'bg-blue-50/20' : ''
                      } ${isInSelection ? 'bg-blue-200/50 border-blue-400' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(day, hour);
                      }}
                      onMouseEnter={() => handleMouseEnter(day, hour)}
                      onMouseUp={handleMouseUp}
                    >
                      {tasksAtHour.map((task, taskIndex) => {
                        const statusIcon = task.status === 'Terminé' ? '✓' : task.status === 'En cours' ? '•' : null;
                        
                        return (
                          <div
                            key={taskIndex}
                            className="calendar-event relative mb-1 p-2 cursor-pointer"
                            style={{
                              backgroundColor: task.color ? hexToRgba(task.color, 0.2) : 'rgba(156, 163, 175, 0.15)',
                              borderColor: task.color || '#9ca3af',
                              borderLeftColor: task.color || '#9ca3af',
                              color: task.color || 'rgb(75, 85, 99)'
                            }}
                            onClick={(e) => handleTaskClick(e, task)}
                            onContextMenu={(e) => handleTaskContextMenu(e, task)}
                          >
                            {/* Affichage par défaut du nom et de l'heure */}
                            <div className="text-xs font-medium truncate">
                              {task.name}
                            </div>
                            <div className="text-xs opacity-70 mt-0.5">
                              {task.time}
                            </div>
                            
                            {/* Icône de statut transparente en bas à droite */}
                            {statusIcon && (
                              <div className="absolute bottom-1 right-2 text-xs" style={{ color: 'rgba(107, 114, 128, 0.5)' }}>
                                {statusIcon}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Ligne de 30 minutes */}
                      <div className="half-hour-line"></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de création de tâche */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-96 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nouvelle tâche</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Nom de la tâche */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la tâche
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le nom de la tâche"
                autoFocus
              />
            </div>

            {/* Couleur et Statut sur la même ligne */}
            <div className="mb-4 flex gap-4">
              {/* Couleur */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempColor(eventColor);
                      setShowColorPicker(!showColorPicker);
                    }}
                    className="w-full h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: eventColor }}
                  >
                    <span className="text-white text-xs font-medium drop-shadow">
                      {eventColor}
                    </span>
                  </button>
                  
                  {showColorPicker && (
                    <div 
                      className="absolute top-12 right-0 z-[100] p-3 bg-white rounded-lg shadow-xl border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="color"
                        value={tempColor}
                        onChange={(e) => setTempColor(e.target.value)}
                        className="w-32 h-32 cursor-pointer"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setShowColorPicker(false);
                            setTempColor(eventColor);
                          }}
                          className="flex-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => {
                            setEventColor(tempColor);
                            setShowColorPicker(false);
                          }}
                          className="flex-1 px-2 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
                        >
                          Confirmer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statut */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Ajoutez une description..."
              />
            </div>

            {/* Heure et date */}
            <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div>📅 {new Date(newEvent?.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <div>🕐 {newEvent?.time} - {newEvent?.endTime}</div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={!eventTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Créer la tâche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarGrid;
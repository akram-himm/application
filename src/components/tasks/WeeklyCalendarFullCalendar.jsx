import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

const WeeklyCalendarFullCalendar = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('#9ca3af');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#9ca3af');
  const [eventStatus, setEventStatus] = useState('À faire');
  const [eventDescription, setEventDescription] = useState('');

  // Convertir les tâches en événements FullCalendar
  const events = tasks
    .filter(task => {
      const hasDate = (task.startDate && task.startDate !== '-') || (task.date && task.date !== '-');
      const hasTime = task.time && task.time !== '-';
      return hasDate && hasTime;
    })
    .map(task => {
      const taskDate = task.startDate || task.date;
      const taskEndDate = task.endDate || task.date;
      
      return {
        id: task.id,
        title: task.name,
        start: `${taskDate}T${task.time}:00`,
        end: task.endTime ? `${taskEndDate}T${task.endTime}:00` : `${taskEndDate}T${addHour(task.time)}:00`,
        backgroundColor: task.color ? hexToRgba(task.color, 0.2) : 'rgba(156, 163, 175, 0.15)',
        borderColor: task.color ? hexToRgba(task.color, 0.5) : 'rgba(156, 163, 175, 0.4)',
        textColor: task.color || 'rgb(75, 85, 99)',
        extendedProps: { 
          task,
          status: task.status,
          description: task.description 
        }
      };
    });
    
  // Fonction pour ajouter une heure à un temps donné
  function addHour(time) {
    const [hours, minutes] = time.split(':');
    const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
    return `${newHours}:${minutes}`;
  }

  // Convertir couleur hex en rgba avec opacité
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Gérer la sélection d'un créneau
  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      start: selectInfo.start,
      end: selectInfo.end,
      startStr: selectInfo.startStr,
      endStr: selectInfo.endStr
    });
    
    setEventTitle('');
    setEventColor('#9ca3af');
    setEventStatus('À faire');
    setEventDescription('');
    setShowModal(true);
    
    // Désélectionner après ouverture du modal
    selectInfo.view.calendar.unselect();
  };

  // Gérer le clic sur un événement
  const handleEventClick = (clickInfo) => {
    const task = clickInfo.event.extendedProps.task;
    if (confirm(`Voulez-vous supprimer "${task.name}" ?`)) {
      onDeleteTask(task.id);
    }
  };

  // Gérer le déplacement d'un événement
  const handleEventDrop = (dropInfo) => {
    const task = dropInfo.event.extendedProps.task;
    const newDate = dropInfo.event.start.toISOString().split('T')[0];
    const newTime = dropInfo.event.start.toTimeString().slice(0, 5);
    
    onUpdateTask({
      ...task,
      startDate: newDate,
      endDate: newDate,
      time: newTime
    });
  };

  // Gérer le redimensionnement d'un événement
  const handleEventResize = (resizeInfo) => {
    const task = resizeInfo.event.extendedProps.task;
    const endTime = resizeInfo.event.end.toTimeString().slice(0, 5);
    
    onUpdateTask({
      ...task,
      endTime: endTime
    });
  };

  // Sauvegarder la nouvelle tâche
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) return;
    
    const startDate = new Date(newEvent.start);
    const endDate = new Date(newEvent.end);
    
    const newTask = {
      name: eventTitle,
      type: 'weekly',
      status: eventStatus,
      priority: 'Normal',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      time: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
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
  };

  return (
    <div className="p-4 ml-8">
      <style>{`
        /* Style minimal pour FullCalendar */
        .fc {
          font-family: inherit;
          background: transparent;
        }
        
        /* Fond général */
        .fc-theme-standard .fc-scrollgrid {
          background-color: rgba(249, 250, 251, 0.3);
          border: 1px solid rgba(156, 163, 175, 0.3);
          border-radius: 0.5rem;
        }
        
        /* En-tête des jours */
        .fc .fc-col-header-cell {
          padding: 0.75rem 0.5rem;
          background: rgba(243, 244, 246, 0.5);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        
        /* Lignes des heures */
        .fc .fc-timegrid-slot {
          height: 2.5rem;
        }
        
        .fc .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        /* Zone de sélection */
        .fc-highlight {
          background: rgba(59, 130, 246, 0.3) !important;
        }
        
        /* Événements */
        .fc-event {
          border-left-width: 3px !important;
          border-radius: 0.375rem;
          padding: 0;
          font-size: 0.75rem;
        }
      `}</style>
      
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        headerToolbar={false}
        height="auto"
        slotMinTime="06:00"
        slotMaxTime="22:00"
        slotDuration="00:30"
        slotLabelInterval="01:00"
        snapDuration="00:15"
        allDaySlot={false}
        expandRows={true}
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        weekends={true}
        firstDay={1}
        eventContent={(eventInfo) => {
          const status = eventInfo.event.extendedProps.status;
          const statusIcon = status === 'Terminé' ? '✓' : status === 'En cours' ? '•' : null;
          return (
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              padding: '2px 4px'
            }}>
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: '500',
                color: eventInfo.event.textColor || 'rgb(75, 85, 99)'
              }}>
                {eventInfo.event.title}
              </div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: eventInfo.event.textColor || 'rgb(75, 85, 99)',
                opacity: '0.7',
                marginTop: '1px'
              }}>
                {eventInfo.timeText}
              </div>
              
              {statusIcon && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '2px', 
                  right: '4px', 
                  fontSize: '0.65rem',
                  color: 'rgba(107, 114, 128, 0.5)',
                  fontWeight: 'normal'
                }}>
                  {statusIcon}
                </div>
              )}
            </div>
          );
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
      />

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
            {newEvent && (
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <div>📅 {new Date(newEvent.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                <div>🕐 {new Date(newEvent.start).toTimeString().slice(0, 5)} - {new Date(newEvent.end).toTimeString().slice(0, 5)}</div>
              </div>
            )}

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

export default WeeklyCalendarFullCalendar;
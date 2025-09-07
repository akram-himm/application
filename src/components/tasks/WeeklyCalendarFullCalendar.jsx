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
        backgroundColor: task.color ? hexToRgba(task.color, 0.15) : 'rgba(156, 163, 175, 0.15)',
        borderColor: task.color || '#9ca3af',
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
    <div className="p-4">
      <style>{`
        /* Style neumorphique pour FullCalendar */
        .fc {
          font-family: inherit;
          background: transparent;
        }
        
        /* Conteneur principal du calendrier - Style neumorphique */
        .fc-theme-standard .fc-scrollgrid {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 18px 18px 36px rgba(0,0,0,0.08), -10px -10px 28px rgba(255,255,255,0.60);
        }
        
        /* En-tête des jours - Style sérieux avec ombre intérieure */
        .fc .fc-col-header {
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .fc .fc-col-header-cell {
          padding: 0.5rem 0.5rem 1.5rem 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: #1F2937;
          text-align: center;
          border-right: 3px solid rgba(229, 231, 235, 0.5) !important;
          border-bottom: 1px solid rgba(229, 231, 235, 0.4) !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .fc .fc-col-header-cell:last-child {
          border-right: none !important;
        }
        
        .fc .fc-col-header-cell-cushion {
          color: #1F2937;
        }
        
        /* Aujourd'hui - mise en évidence subtile */
        .fc .fc-day-today .fc-col-header-cell-cushion {
          color: #2383E2;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(35, 131, 226, 0.2);
        }
        
        .fc .fc-day-today {
          background: linear-gradient(180deg, 
            rgba(35, 131, 226, 0.03) 0%, 
            rgba(35, 131, 226, 0.08) 100%
          ) !important;
        }
        
        /* Colonne des heures - Style professionnel */
        .fc .fc-timegrid-axis {
          width: 60px !important;
          padding-right: 12px;
          text-align: right;
          background: rgba(249, 250, 251, 0.5);
          border-right: 1px solid rgba(229, 231, 235, 0.4) !important;
        }
        
        /* Style des heures */
        .fc .fc-timegrid-slot-label {
          font-size: 0.8rem;
          color: #6B7280;
          font-weight: 500;
          vertical-align: top;
          padding-top: 0;
          line-height: 1;
        }
        
        /* Alignement des heures avec les lignes */
        .fc .fc-timegrid-slot-label-frame {
          text-align: right;
          vertical-align: top;
        }
        
        .fc .fc-timegrid-slot-label-cushion {
          position: relative;
          top: -0.6rem;
          display: inline-block;
        }
        
        /* Fix pour la première heure (06:00) */
        .fc .fc-timegrid-slots tr:first-child .fc-timegrid-slot-label-cushion {
          top: -0.8rem;
        }
        
        /* Lignes horizontales des heures - visibles mais subtiles */
        .fc .fc-timegrid-slot {
          height: 3rem;
          border-bottom: 1px solid rgba(229, 231, 235, 0.25) !important;
        }
        
        /* Lignes plus marquées toutes les heures */
        .fc .fc-timegrid-slot-minor {
          border-bottom: 1px dotted rgba(229, 231, 235, 0.2) !important;
        }
        
        /* Bordures verticales entre les colonnes */
        .fc .fc-timegrid-col {
          border-right: 3px solid rgba(229, 231, 235, 0.90) !important;
        }
        
        .fc .fc-timegrid-col:last-child {
          border-right: none !important;
        }
        
        /* Ligne de l'heure actuelle */
        .fc .fc-timegrid-now-indicator-line {
          border: none;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(239, 68, 68, 0.8) 10%, 
            rgba(239, 68, 68, 0.8) 90%, 
            transparent 100%
          );
          height: 2px;
        }
        
        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #EF4444;
        }
        
        /* Zone de sélection */
        .fc-highlight {
          background: rgba(59, 130, 246, 0.15) !important;
          border: 1px solid rgba(59, 130, 246, 0.25) !important;
          border-radius: 0 !important;
        }
        
        /* Miroir de sélection (utilisé avec selectMirror) */
        .fc .fc-timegrid-event-harness-inset .fc-timegrid-event.fc-event-mirror,
        .fc .fc-timegrid-event.fc-event-mirror {
          background: rgba(59, 130, 246, 0.15) !important;
          border: 2px solid rgba(59, 130, 246, 0.4) !important;
          border-radius: 0 !important;
          opacity: 0.8;
        }
        
        /* Zone de sélection temporaire */
        .fc .fc-timegrid-col-events .fc-event-main {
          border-radius: 0 !important;
        }
        
        /* Événements - Style glassmorphism avec ligne colorée */
        .fc-event {
          backdrop-filter: blur(10px) saturate(120%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(120%) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 0 !important;
          padding: 2px !important;
          font-size: 0.8rem;
          position: relative;
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.07),
            inset 0 0 0 1px rgba(255, 255, 255, 0.15);
          transition: all 0.2s ease;
          overflow: visible !important;
        }
        
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 12px 40px 0 rgba(31, 38, 135, 0.1),
            inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          z-index: 10 !important;
        }
        
        /* Corps du calendrier */
        .fc .fc-timegrid-body {
          background: rgba(255, 255, 255, 0.4);
        }
        
        /* Amélioration du contraste pour les slots */
        .fc .fc-timegrid-slots {
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(249, 250, 251, 0.3) 100%
          );
        }
        
        /* Bordure principale du calendrier */
        .fc-scrollgrid {
          border: 1px solid rgba(229, 231, 235, 0.5) !important;
        }
        
        /* Effet de profondeur pour les cellules */
        .fc .fc-timegrid-col-frame {
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.5) 0%, 
            rgba(255, 255, 255, 0.2) 100%
          );
        }
        
        /* Style pour les weekends - légèrement différent */
        .fc .fc-day-sat,
        .fc .fc-day-sun {
          background: rgba(249, 250, 251, 0.3);
        }
        
        /* Amélioration de la lisibilité */
        .fc-event-title {
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }
        
        .fc-event-time {
          font-size: 0.7rem;
          opacity: 0.9;
        }
        
        /* Ombre pour le conteneur principal */
        .fc-view-harness {
          border-radius: 1.25rem;
          overflow: hidden;
        }
        
        /* Ajustement des paddings */
        .fc-timegrid-axis-cushion {
          padding: 4px 0;
        }
        
        /* Style pour la barre de défilement si visible */
        .fc-scrollgrid-section-body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .fc-scrollgrid-section-body::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        .fc-scrollgrid-section-body::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .fc-scrollgrid-section-body::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
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
        selectMirror={false}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        weekends={true}
        firstDay={1}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
        dayHeaderContent={(arg) => {
          const date = arg.date;
          const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
          const dayNumber = date.getDate();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '2px'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600',
                color: isToday ? '#2383E2' : '#1F2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {dayName}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: isToday ? '#2383E2' : '#9CA3AF',
                fontWeight: isToday ? '500' : '400'
              }}>
                {dayNumber}
              </div>
            </div>
          );
        }}
        eventContent={(eventInfo) => {
          const status = eventInfo.event.extendedProps.status;
          const statusIcon = status === 'Terminé' ? '✓' : status === 'En cours' ? '•' : null;
          const borderColor = eventInfo.event.borderColor;
          
          return (
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              paddingLeft: '6px'
            }}>
              {/* Ligne verticale colorée */}
              <div style={{
                position: 'absolute',
                left: '-1px',
                top: '-2px',
                bottom: '-2px',
                width: '3.5px',
                backgroundColor: borderColor,
                borderRadius: '0'
              }} />
              
              <div style={{ 
                fontSize: '0.75rem', 
                fontWeight: '500',
                color: eventInfo.event.textColor || 'rgb(75, 85, 99)',
                marginLeft: '4px'
              }}>
                {eventInfo.event.title}
              </div>
              <div style={{ 
                fontSize: '0.65rem', 
                color: eventInfo.event.textColor || 'rgb(75, 85, 99)',
                opacity: '0.7',
                marginTop: '1px',
                marginLeft: '4px'
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
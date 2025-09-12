import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

const WeeklyCalendarFullCalendar = React.memo(({ tasks, onAddTask, onUpdateTask, onDeleteTask, currentDate }) => {
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('#9ca3af');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#9ca3af');
  const [eventStatus, setEventStatus] = useState('À faire');
  const [eventDescription, setEventDescription] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, time: null, show: false });
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  
  // Refs pour gérer le drag et le throttling
  const isDragging = useRef(false);
  const rafRef = useRef(null);
    
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
    setSelectedTask(task);
    setEditedTask({...task});
    setShowTaskDetails(true);
    setIsEditingTask(false);
    
    // Calculer la position de la fenêtre de détails relative au calendrier
    const eventElement = clickInfo.el;
    if (!eventElement) return;
    
    const rect = eventElement.getBoundingClientRect();
    
    // Obtenir la position du conteneur parent (calendrier)
    const calendarContainer = eventElement.closest('.p-4');
    const containerRect = calendarContainer ? calendarContainer.getBoundingClientRect() : { left: 0, top: 0 };
    
    const windowWidth = window.innerWidth;
    const detailsWidth = 320;
    const detailsHeight = 450;
    
    // Position relative au conteneur du calendrier
    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;
    const relativeRight = rect.right - containerRect.left;
    
    // Position horizontale - directement à côté de la tâche
    let xPosition;
    
    // Vérifier d'abord s'il y a de la place à droite
    if (rect.right + detailsWidth + 10 < windowWidth) {
      // Place à droite
      xPosition = relativeRight + 8;
    } else {
      // Pas de place à droite, mettre à gauche
      xPosition = relativeLeft - detailsWidth - 8;
      
      // Si ça sort à gauche, forcer à droite
      if (xPosition < 0) {
        xPosition = relativeRight + 8;
      }
    }
    
    // Position verticale - centrer par rapport à la tâche (relative au conteneur)
    let yPosition = relativeTop + (rect.height / 2);
    
    setDetailsPosition({ x: xPosition, y: yPosition });
  };

  // Gérer la sauvegarde des modifications
  const handleSaveTaskEdit = () => {
    onUpdateTask(editedTask);
    setSelectedTask(editedTask);
    setIsEditingTask(false);
  };

  // Gérer le clic droit sur un événement
  const handleEventContextMenu = (e, task) => {
    e.preventDefault();
    if (confirm(`Voulez-vous supprimer "${task.name}" ?`)) {
      onDeleteTask(task.id);
      setShowTaskDetails(false);
      setSelectedTask(null);
    }
  };


  // Gérer le déplacement d'un événement
  const handleEventDrop = (dropInfo) => {
    console.log('🎯 EventDrop déclenché!', {
      id: dropInfo.event.id,
      oldStart: dropInfo.oldEvent.start?.toISOString(),
      newStart: dropInfo.event.start?.toISOString(),
      delta: dropInfo.delta
    });
    
    const task = dropInfo.event.extendedProps.task;
    const newDate = dropInfo.event.start.toISOString().split('T')[0];
    const newTime = dropInfo.event.start.toTimeString().slice(0, 5);
    
    // Calculer l'heure de fin si elle existe
    let endTime = null;
    if (dropInfo.event.end) {
      endTime = dropInfo.event.end.toTimeString().slice(0, 5);
    }
    
    const updatedTask = {
      ...task,
      id: task.id, // Préserver l'ID
      startDate: newDate,
      endDate: newDate,
      date: newDate,
      time: newTime,
      endTime: endTime || task.endTime
    };
    
    console.log('📝 Mise à jour de la tâche:', updatedTask);
    
    // Mise à jour via le callback parent
    onUpdateTask(updatedTask);
  };

  // Gérer le redimensionnement d'un événement
  const handleEventResize = useCallback((resizeInfo) => {
    const task = resizeInfo.event.extendedProps.task;
    const endTime = resizeInfo.event.end.toTimeString().slice(0, 5);
    
    const updatedTask = {
      ...task,
      id: task.id, // S'assurer que l'ID est préservé
      endTime: endTime
    };
    
    console.log('📝 Redimensionnement de la tâche:', updatedTask);
    
    // Mise à jour via le callback parent (qui gère maintenant la persistance immédiate)
    onUpdateTask(updatedTask);
  }, [onUpdateTask]);

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

  // Gérer le mouvement de la souris sur le calendrier avec throttling
  const handleMouseMove = (e) => {
    // NE PAS mettre à jour pendant un drag
    if (isDragging.current) {
      return;
    }
    
    // Throttle avec requestAnimationFrame
    if (rafRef.current) return;
    
    // Capturer les valeurs nécessaires avant requestAnimationFrame
    const clientX = e.clientX;
    const clientY = e.clientY;
    const currentTarget = e.currentTarget;
    
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      
      // Vérifier que nous avons toujours le currentTarget
      if (!currentTarget) {
        return;
      }
      
      // Chercher le calendrier FullCalendar dans le DOM
      const fullCalendar = currentTarget.querySelector('.fc');
      if (!fullCalendar) {
        return;
      }
      
      // Trouver la grille des heures
      const timeGrid = fullCalendar.querySelector('.fc-timegrid-slots');
      if (!timeGrid) {
        return;
      }
      
      const timeGridRect = timeGrid.getBoundingClientRect();
      const relativeY = clientY - timeGridRect.top;
      
      // Calculer l'heure précise en fonction de la position Y
      const slotHeight = 48; // 3rem = 48px (hauteur d'un slot de 30 minutes)
      const minutesPerPixel = 30 / slotHeight; // Combien de minutes par pixel
      const totalMinutes = relativeY * minutesPerPixel; // Total des minutes depuis 6h00
      
      if (relativeY >= 0 && totalMinutes <= 960) { // 960 minutes = 16 heures (de 6h à 22h)
        const startHour = 6; // Commence à 6h
        const hours = Math.floor(totalMinutes / 60) + startHour;
        const minutes = Math.floor(totalMinutes % 60);
        
        // Arrondir aux 5 minutes les plus proches
        const roundedMinutes = Math.round(minutes / 5) * 5;
        const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
        const finalHours = roundedMinutes === 60 ? hours + 1 : hours;
        
        const timeString = `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
        
        // Utiliser les coordonnées globales de la souris pour position: fixed
        setMousePosition({
          x: clientX,
          y: clientY,
          time: timeString,
          show: true
        });
      }
    });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0, time: null, show: false });
  };
  
  // Cleanup pour requestAnimationFrame
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Référence pour accéder à l'API FullCalendar
  const calendarRef = useRef(null);
  
  // Mémoriser la liste des événements pour éviter les re-renders inutiles
  const events = useMemo(() => {
    return tasks
      .filter(task => {
        const hasDate = (task.startDate && task.startDate !== '-') || (task.date && task.date !== '-');
        const hasTime = task.time && task.time !== '-';
        return hasDate && hasTime;
      })
      .map(task => {
        const taskDate = task.startDate || task.date;
        const taskEndDate = task.endDate || task.date;
        
        const adjustOpacity = (color) => {
          if (!color) return 0.15;
          const hex = color.replace('#', '');
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5 ? 0.25 : 0.15;
        };

        return {
          id: String(task.id),
          title: task.name,
          start: `${taskDate}T${task.time}:00`,
          end: task.endTime ? `${taskEndDate}T${task.endTime}:00` : `${taskEndDate}T${addHour(task.time)}:00`,
          backgroundColor: task.color ? hexToRgba(task.color, adjustOpacity(task.color)) : 'rgba(75, 85, 99, 0.18)',
          borderColor: task.color || '#374151',
          textColor: task.color || 'rgb(31, 41, 55)',
          extendedProps: { 
            task,
            status: task.status,
            description: task.description 
          }
        };
      });
  }, [tasks]); // Recalculer seulement si tasks change
  
  // Naviguer vers la date actuelle quand currentDate change
  useEffect(() => {
    if (currentDate && calendarRef.current) {
      // Utiliser setTimeout pour éviter le warning flushSync
      const timeoutId = setTimeout(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.gotoDate(currentDate);
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentDate]);

  // Gérer la fermeture avec Escape et clic extérieur
  useEffect(() => {
    if (!showTaskDetails) return;

    // Fermer avec Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowTaskDetails(false);
        setSelectedTask(null);
        setIsEditingTask(false);
      }
    };

    // Fermer en cliquant en dehors
    const handleClickOutside = (e) => {
      const detailsWindow = document.querySelector('.task-details-window');
      if (detailsWindow && !detailsWindow.contains(e.target)) {
        // Vérifier que ce n'est pas un clic sur une tâche
        if (!e.target.closest('.fc-event')) {
          setShowTaskDetails(false);
          setSelectedTask(null);
          setIsEditingTask(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTaskDetails]);

  return (
    <div className="p-4 relative">
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        {/* Indicateur d'heure qui suit la souris - rendu via un portail */}
        {mousePosition.show && mousePosition.time && !showModal && ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: 'translate(-50%, -100%) translateY(-5px)',
              backgroundColor: 'rgba(75, 85, 99, 0.95)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: '600',
              pointerEvents: 'none',
              zIndex: 99999,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            {mousePosition.time}
          </div>,
          document.body
        )}
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
        
        /* Événements - Style glassmorphism léger avec ombres subtiles */
        .fc-event {
          backdrop-filter: blur(8px) saturate(120%) !important;
          -webkit-backdrop-filter: blur(8px) saturate(120%) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 0 !important;
          padding: 2px !important;
          font-size: 0.8rem;
          position: relative;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          overflow: visible !important;
        }
        
        .fc-event:hover {
          transform: translateY(-1px);
          backdrop-filter: blur(10px) saturate(140%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(140%) !important;
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.12),
            0 2px 4px rgba(0, 0, 0, 0.08);
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
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={frLocale}
          headerToolbar={false}
          height="auto"
          slotMinTime="06:00"
          slotMaxTime="22:00"
          slotDuration="00:30"
          slotLabelInterval="01:00"
          snapDuration="00:05"
          selectMinDistance={0}
          allDaySlot={false}
          expandRows={true}
          nowIndicator={true}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={false}
          eventStartEditable={true}
          eventDurationEditable={true}
          events={events}
          dragRevertDuration={0}
          dragScroll={true}
          unselectAuto={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDragStart={() => { 
            isDragging.current = true;
            console.log('🏁 Drag started, blocking mouse updates');
          }}
          eventDragStop={() => { 
            isDragging.current = false;
            console.log('🎯 Drag stopped, re-enabling mouse updates');
          }}
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
          const description = eventInfo.event.extendedProps.description;
          const borderColor = eventInfo.event.borderColor;
          const task = eventInfo.event.extendedProps.task;
          
          // Calculer la hauteur de l'événement
          const eventEl = eventInfo.el;
          const eventHeight = eventEl ? eventEl.offsetHeight : 100;
          const isSmall = eventHeight < 40; // Si moins de 40px, considéré comme petit
          
          // Extraire les deux premiers mots de la description
          const getDescriptionPreview = (desc) => {
            if (!desc || desc.trim() === '') return null;
            const words = desc.trim().split(/\s+/);
            return words.slice(0, 2).join(' ');
          };
          
          const descPreview = getDescriptionPreview(description);
          
          return (
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%', 
                paddingLeft: '6px',
                paddingRight: '20px' // Espace pour l'icône
              }}
            >
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
              
              {/* Afficher le contenu seulement si l'événement n'est pas trop petit */}
              {!isSmall ? (
                <>
                  {/* Heure en premier */}
                  <div style={{ 
                    fontSize: '0.65rem', 
                    color: eventInfo.event.textColor || 'rgb(31, 41, 55)',
                    opacity: '0.85',
                    marginLeft: '4px',
                    fontWeight: '600'
                  }}>
                    {eventInfo.timeText}
                  </div>
                  
                  {/* Nom de la tâche avec ellipsis */}
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500',
                    color: eventInfo.event.textColor || 'rgb(31, 41, 55)',
                    marginLeft: '4px',
                    marginTop: '1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 25px)'
                  }}>
                    {eventInfo.event.title}
                  </div>
                  
                  {/* Description avec ellipsis simple - seulement si assez de place */}
                  {description && description.trim() !== '' && eventHeight > 60 && (
                    <div style={{ 
                      fontSize: '0.6rem', 
                      color: eventInfo.event.textColor || 'rgb(31, 41, 55)',
                      opacity: '0.65',
                      marginLeft: '4px',
                      marginTop: '2px',
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 'calc(100% - 25px)'
                    }}>
                      {description}
                    </div>
                  )}
                </>
              ) : (
                /* Pour les petits événements, afficher seulement un point ou rien */
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  fontSize: '0.5rem',
                  opacity: '0.5'
                }}>
                  •
                </div>
              )}
              
              {/* Icône de statut - Style Notion */}
              {status === 'En cours' && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-2px',      // Changé de top à bottom pour être en bas
                  right: '1px',    
                  fontSize: '0.8rem',
                  color: 'rgba(0, 0, 0, 0.55)', // Plus transparent (0.25)
                  fontWeight: '400'
                }}>
                  ⏱
                </div>
              )}
              {status === 'Terminé' && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-2px',      // Changé de top à bottom pour être en bas
                  right: '3px',    
                  fontSize: '0.9rem',
                  color: 'rgba(0, 0, 0, 0.35)', // Plus transparent (0.25)
                  fontWeight: '400'
                }}>
                  ✔
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
      </div>

      {/* Modal de création de tâche */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            if (!showColorPicker) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white/90 backdrop-blur-md rounded-2xl w-[420px] shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] ring-1 ring-gray-200/50"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: `4px solid ${eventColor}`
            }}
          >
            {/* En-tête avec couleur */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Nouvelle tâche</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
            
              {/* Nom de la tâche */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la tâche
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Entrez le nom de la tâche"
                  autoFocus
                />
              </div>

              {/* Statut et Couleurs sur la même ligne */}
              <div className="mb-5 flex gap-4 items-start">
                {/* Statut à gauche */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="À faire" className="text-gray-900">À faire</option>
                    <option value="En cours" className="text-gray-900">En cours</option>
                    <option value="Terminé" className="text-gray-900">Terminé</option>
                  </select>
                </div>

                {/* Couleurs à droite */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Cercles de couleur prédéfinies */}
                    <button
                      onClick={() => setEventColor('#9CA3AF')}
                      className={`w-8 h-8 rounded-full bg-gray-400 hover:scale-110 transition-transform ${eventColor === '#9CA3AF' ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    />
                    <button
                      onClick={() => setEventColor('#FB923C')}
                      className={`w-8 h-8 rounded-full bg-orange-400 hover:scale-110 transition-transform ${eventColor === '#FB923C' ? 'ring-2 ring-offset-2 ring-orange-400' : ''}`}
                    />
                    <button
                      onClick={() => setEventColor('#EF4444')}
                      className={`w-8 h-8 rounded-full bg-red-500 hover:scale-110 transition-transform ${eventColor === '#EF4444' ? 'ring-2 ring-offset-2 ring-red-500' : ''}`}
                    />
                    
                    {/* Bouton stylo pour couleur personnalisée */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempColor(eventColor);
                        setShowColorPicker(!showColorPicker);
                      }}
                      className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors ml-2"
                    >
                      ✏️
                    </button>
                    
                    {/* Carré de couleur actuelle */}
                    <div 
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: eventColor }}
                    />
                  </div>
                  
                  {/* Panneau de sélection de couleur */}
                  {showColorPicker && (
                    <div 
                      className="absolute mt-2 z-[100] p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200"
                      style={{ top: '100%', right: '0' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="color"
                        value={eventColor}
                        onChange={(e) => {
                          setEventColor(e.target.value);
                          setTempColor(e.target.value);
                        }}
                        className="w-32 h-32 cursor-pointer rounded"
                      />
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500 mb-2">La couleur sera appliquée directement</p>
                        <button
                          onClick={() => setShowColorPicker(false)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors text-gray-700"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Ajoutez une description..."
                />
              </div>

              {/* Heure et date */}
              {newEvent && (
                <div className="mb-5 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500">📅</span>
                    <span className="text-gray-700">{new Date(newEvent.start).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🕐</span>
                    <span className="text-gray-700">{new Date(newEvent.start).toTimeString().slice(0, 5)} - {new Date(newEvent.end).toTimeString().slice(0, 5)}</span>
                  </div>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!showColorPicker) {
                      setShowModal(false);
                      resetForm();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!eventTitle.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                >
                  Créer la tâche
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fenêtre de détails - sans portail pour qu'elle reste relative au calendrier */}
      {showTaskDetails && selectedTask && (
        <div 
          className="task-details-window absolute bg-white/95 backdrop-blur-md rounded-2xl w-[320px] shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] z-50 transition-all duration-200 ease-out max-h-[450px] overflow-y-auto"
          style={{
            borderLeft: `4px solid ${selectedTask.color || '#9CA3AF'}`,
            left: `${detailsPosition.x}px`,
            top: `${detailsPosition.y - 225}px`  // Centrer verticalement
          }}
        >
          {/* En-tête */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-200/50">
            <div className="flex items-start justify-between">
              {isEditingTask ? (
                <input
                  type="text"
                  value={editedTask.name}
                  onChange={(e) => setEditedTask({...editedTask, name: e.target.value})}
                  className="text-base font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1 mr-2"
                  autoFocus
                />
              ) : (
                <h3 className="text-base font-semibold text-gray-800 pr-2">{selectedTask.name}</h3>
              )}
              <button
                onClick={() => {
                  setShowTaskDetails(false);
                  setSelectedTask(null);
                  setIsEditingTask(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Contenu */}
          <div className="p-5 space-y-4">
            {/* Statut */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">État:</span>
              {isEditingTask ? (
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({...editedTask, status: e.target.value})}
                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900"
                >
                  <option value="À faire">À faire</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              ) : (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedTask.status === 'Terminé' ? 'bg-green-100 text-green-700' :
                  selectedTask.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {selectedTask.status}
                </span>
              )}
            </div>
            
            {/* Date et heure */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">📅</span>
                <span className="text-gray-700 text-sm">
                  {new Date(selectedTask.startDate || selectedTask.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">🕐</span>
                <span className="text-gray-700 text-sm">
                  {selectedTask.time} {selectedTask.endTime && `- ${selectedTask.endTime}`}
                </span>
              </div>
            </div>
            
            {/* Description */}
            <div className="pt-2">
              <p className="text-gray-500 text-xs mb-1">Description</p>
              {isEditingTask ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-900 resize-none"
                  rows="3"
                  placeholder="Ajouter une description..."
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedTask.description || <span className="text-gray-400 italic">Pas de description</span>}
                </p>
              )}
            </div>
            
            {/* Couleur */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm">Couleur:</span>
              {isEditingTask ? (
                <input
                  type="color"
                  value={editedTask.color || '#9CA3AF'}
                  onChange={(e) => setEditedTask({...editedTask, color: e.target.value})}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: selectedTask.color || '#9CA3AF' }}
                />
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-5 pb-4 pt-2 border-t border-gray-100/50">
            <div className="flex gap-2">
              {isEditingTask ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingTask(false);
                      setEditedTask({...selectedTask});
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveTaskEdit}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Enregistrer
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingTask(true)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Voulez-vous supprimer "${selectedTask.name}" ?`)) {
                        onDeleteTask(selectedTask.id);
                        setShowTaskDetails(false);
                        setSelectedTask(null);
                      }
                    }}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

WeeklyCalendarFullCalendar.displayName = 'WeeklyCalendarFullCalendar';

export default WeeklyCalendarFullCalendar;
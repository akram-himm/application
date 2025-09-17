import React, { useState, useContext, useCallback, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import WeeklyCalendarFullCalendar from '../components/tasks/WeeklyCalendarFullCalendar';
import MonthlyCalendar from '../components/calendar/MonthlyCalendar';
import YearlyCalendar from '../components/calendar/YearlyCalendar';
import TaskSidebar from '../components/calendar/TaskSidebar';
import { uniformStyles } from '../styles/uniformStyles';

const CalendarView = () => {
  const { tasks, addTask, updateTask, updateTaskImmediate, deleteTask } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month, year
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Filtrer uniquement les tâches de type weekly ou avec dates
  const calendarTasks = useMemo(() => {
    return tasks.filter(task => {
      // Inclure les tâches weekly
      if (task.type === 'weekly') return true;
      
      // Inclure les tâches daily (sans heure obligatoire)
      if (task.type === 'daily') return true;
      
      // Inclure les tâches avec des dates valides
      const hasValidDate = (task.startDate && task.startDate !== '-') || 
                          (task.date && task.date !== '-');
      
      // Pour la vue calendrier, on accepte les tâches avec ou sans heure
      return hasValidDate;
    });
  }, [tasks]);
  
  // Gérer l'ajout de tâche depuis le calendrier
  const handleAddCalendarTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      type: 'daily', // Utiliser 'daily' pour que les tâches apparaissent dans To-Do
      status: taskData.status || 'À faire',
      priority: taskData.priority || 'Normal',
      color: taskData.color || '#9ca3af'
    };
    addTask(newTask);
  }, [addTask]);
  
  // Gérer la mise à jour avec persistance immédiate
  const handleUpdateCalendarTask = useCallback((updatedTask) => {
    console.log('📅 [CalendarView] Mise à jour de la tâche:', updatedTask.id, updatedTask.name);
    
    // S'assurer que l'ID est préservé
    const taskToUpdate = {
      ...updatedTask,
      id: updatedTask.id,
      type: updatedTask.type || 'weekly'
    };
    
    // Utiliser la fonction immédiate qui sauvegarde sans debounce
    if (updateTaskImmediate) {
      updateTaskImmediate(taskToUpdate);
      console.log('✅ [CalendarView] Tâche sauvegardée immédiatement');
    } else {
      // Fallback si updateTaskImmediate n'est pas disponible
      updateTask(taskToUpdate);
    }
  }, [updateTask, updateTaskImmediate]);
  
  // Navigation dans le calendrier
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    
    if (viewMode === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else if (viewMode === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else if (viewMode === 'year') {
      if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else if (direction === 'next') {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
    }
    
    setCurrentDate(newDate);
  };
  
  // Gérer le clic sur un jour (vue mensuelle)
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setSidebarOpen(true);
  };
  
  // Gérer le clic sur un mois (vue annuelle)
  const handleMonthClick = (date) => {
    setCurrentDate(date);
    setViewMode('month');
  };
  
  // Gérer le clic sur une tâche
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };
  
  // Naviguer vers la vue hebdomadaire avec une date spécifique
  const handleNavigateToWeek = (date) => {
    setCurrentDate(date);
    setViewMode('week');
  };
  
  // Gérer l'ajout de tâche depuis le calendrier mensuel
  const handleQuickAddTask = (date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setSidebarOpen(true);
  };
  
  // Obtenir les dates de la semaine actuelle
  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek,
      end: endOfWeek
    };
  };
  
  const weekRange = getWeekRange();
  
  // Obtenir le titre selon le mode de vue
  const getViewTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'year') {
      return currentDate.getFullYear().toString();
    }
    // Pas de titre pour la vue semaine
    return '';
  };
  
  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Calendrier</h1>
          <p className={uniformStyles.text.pageSubtitle}>Planifiez et organisez vos tâches de la semaine</p>
        </div>
        
        {/* Barre de navigation du calendrier */}
        <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding + ' mb-6'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('prev')}
                className={uniformStyles.button.icon}
                title={viewMode === 'week' ? 'Semaine précédente' : viewMode === 'month' ? 'Mois précédent' : 'Année précédente'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => handleNavigate('today')}
                className={uniformStyles.button.secondary}
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={() => handleNavigate('next')}
                className={uniformStyles.button.icon}
                title={viewMode === 'week' ? 'Semaine suivante' : viewMode === 'month' ? 'Mois suivant' : 'Année suivante'}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {(viewMode === 'month' || viewMode === 'year') && (
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-800">
                  {getViewTitle()}
                </h2>
              </div>
            )}
            
            <div className="flex items-center gap-4">

              {/* Sélecteur de vue */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'week' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setViewMode('year')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'year' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Année
                </button>
              </div>
              
              <span className="text-sm text-gray-500">
                {calendarTasks.length} tâche{calendarTasks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        {/* Vue du calendrier selon le mode */}
        <div className="rounded-2xl overflow-hidden">
          {viewMode === 'week' && (
            <WeeklyCalendarFullCalendar
              tasks={calendarTasks}
              onAddTask={handleAddCalendarTask}
              onUpdateTask={handleUpdateCalendarTask}
              onDeleteTask={deleteTask}
              currentDate={currentDate}
            />
          )}
          
          {viewMode === 'month' && (
            <div className="p-6">
              <MonthlyCalendar
                tasks={calendarTasks}
                currentDate={currentDate}
                onDayClick={handleDayClick}
                onAddTask={handleQuickAddTask}
                onTaskClick={handleTaskClick}
                onDeleteTask={deleteTask}
              />
            </div>
          )}
          
          {viewMode === 'year' && (
            <div className="p-6">
              <YearlyCalendar
                tasks={calendarTasks}
                currentDate={currentDate}
                onMonthClick={handleMonthClick}
              />
            </div>
          )}
        </div>
        
        {/* Barre latérale des détails */}
        <TaskSidebar
          isOpen={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
            setSelectedDate(null);
            setSelectedTask(null);
          }}
          selectedDate={selectedDate}
          selectedTask={selectedTask}
          tasks={calendarTasks}
          onUpdateTask={updateTaskImmediate || updateTask}
          onDeleteTask={deleteTask}
          onAddTask={addTask}
          onNavigateToWeek={handleNavigateToWeek}
        />
        
      </div>
    </div>
  );
};

export default CalendarView;
import React, { useState, useContext, useCallback, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import WeeklyCalendarFullCalendar from '../components/tasks/WeeklyCalendarFullCalendar';

const CalendarView = () => {
  const { tasks, addTask, updateTask, deleteTask } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filtrer uniquement les tâches de type weekly ou avec dates
  const calendarTasks = useMemo(() => {
    return tasks.filter(task => {
      // Inclure les tâches weekly
      if (task.type === 'weekly') return true;
      
      // Inclure les tâches avec des dates valides
      const hasValidDate = (task.startDate && task.startDate !== '-') || 
                          (task.date && task.date !== '-');
      const hasValidTime = task.time && task.time !== '-';
      
      return hasValidDate && hasValidTime;
    });
  }, [tasks]);
  
  // Gérer l'ajout de tâche depuis le calendrier
  const handleAddCalendarTask = useCallback((taskData) => {
    const newTask = {
      ...taskData,
      type: 'weekly',
      status: taskData.status || 'À faire',
      priority: taskData.priority || 'Normal'
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
    
    // Mettre à jour via le contexte
    updateTask(taskToUpdate);
    
    // Forcer la persistance immédiate dans localStorage
    // pour éviter les problèmes de synchronisation
    const allTasks = JSON.parse(localStorage.getItem('gestion_tasks') || '[]');
    const taskIndex = allTasks.findIndex(t => 
      t.id === taskToUpdate.id || String(t.id) === String(taskToUpdate.id)
    );
    
    if (taskIndex !== -1) {
      allTasks[taskIndex] = taskToUpdate;
      localStorage.setItem('gestion_tasks', JSON.stringify(allTasks));
      console.log('✅ [CalendarView] Tâche sauvegardée dans localStorage');
    }
  }, [updateTask]);
  
  // Navigation dans le calendrier
  const handleNavigate = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate(newDate);
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
  
  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto p-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-800">Calendrier</h1>
          <p className="text-sm text-gray-500 mt-1">Planifiez et organisez vos tâches de la semaine</p>
        </div>
        
        {/* Barre de navigation du calendrier */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavigate('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Semaine précédente"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => handleNavigate('today')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
              
              <button
                onClick={() => handleNavigate('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Semaine suivante"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-800">
                {weekRange.start.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-sm text-gray-500">
                Semaine du {weekRange.start.getDate()} au {weekRange.end.getDate()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {calendarTasks.length} tâche{calendarTasks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        {/* Calendrier hebdomadaire */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <WeeklyCalendarFullCalendar
            tasks={calendarTasks}
            onAddTask={handleAddCalendarTask}
            onUpdateTask={handleUpdateCalendarTask}
            onDeleteTask={deleteTask}
            currentDate={currentDate}
          />
        </div>
        
        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-xl font-light text-gray-800 mt-1">{calendarTasks.length}</p>
              </div>
              <div className="text-2xl text-gray-400">📋</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">À faire</p>
                <p className="text-xl font-light text-orange-600 mt-1">
                  {calendarTasks.filter(t => t.status === 'À faire').length}
                </p>
              </div>
              <div className="text-2xl text-orange-500">⏳</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">En cours</p>
                <p className="text-xl font-light text-blue-600 mt-1">
                  {calendarTasks.filter(t => t.status === 'En cours').length}
                </p>
              </div>
              <div className="text-2xl text-blue-500">🔄</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Terminées</p>
                <p className="text-xl font-light text-green-600 mt-1">
                  {calendarTasks.filter(t => t.status === 'Terminé').length}
                </p>
              </div>
              <div className="text-2xl text-green-500">✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
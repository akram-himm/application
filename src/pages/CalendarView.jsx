import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const CalendarView = () => {
  const { tasks, addTask, updateTask, deleteTask } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', time: '', priority: 'medium' });
  
  // Charger les tâches de la semaine depuis localStorage (pour compatibilité)
  const [weeklyTasks, setWeeklyTasks] = useState(() => {
    const saved = localStorage.getItem('weeklyTasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Obtenir le premier jour du mois
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  
  // Obtenir le nombre de jours dans le mois
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Obtenir le jour de la semaine (0-6)
  const getDayOfWeek = (date) => {
    return date.getDay();
  };

  // Vérifier si une date est dans la semaine en cours
  const isInCurrentWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  };
  
  // Jours de la semaine
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  // Navigation entre les mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  // Sauvegarder les tâches dans localStorage
  useEffect(() => {
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
  }, [weeklyTasks]);
  
  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const days = [];
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startDayOfWeek = getDayOfWeek(firstDay);
    
    // Jours du mois précédent
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i)
      });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i)
      });
    }
    
    return days;
  };
  
  // Vérifier si une date est aujourd'hui
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Vérifier si une date est sélectionnée
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Obtenir les tâches pour une date donnée
  const getTasksForDate = (date) => {
    return weeklyTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };
  
  // Ajouter une nouvelle tâche
  const handleAddTask = () => {
    if (newTask.name.trim() && selectedDay) {
      // Convertir les priorités du calendrier vers le format des tâches
      const priorityMap = {
        'low': 'Pas de panique',
        'medium': 'Important',
        'high': 'Très important'
      };

      // Si la date est dans la semaine en cours, créer une tâche hebdomadaire
      if (isInCurrentWeek(selectedDay)) {
        const weeklyTask = {
          id: Date.now(),
          name: newTask.name,
          type: 'weekly',
          status: 'À faire',
          priority: priorityMap[newTask.priority] || 'Pas de panique',
          startDate: selectedDay.toISOString().split('T')[0],
          endDate: '-',  // Date fin vide par défaut
          time: newTask.time || '-',
          fromCalendar: true // Marqueur pour identifier que ça vient du calendrier
        };
        addTask(weeklyTask); // Ajouter au contexte global
      }
      
      // Toujours ajouter à la liste locale du calendrier
      const calendarTask = {
        id: Date.now(),
        name: newTask.name,
        time: newTask.time,
        priority: newTask.priority,
        date: selectedDay.toISOString()
      };
      setWeeklyTasks([...weeklyTasks, calendarTask]);
      
      setNewTask({ name: '', time: '', priority: 'medium' });
      setShowTaskModal(false);
    }
  };
  
  // Supprimer une tâche
  const handleDeleteTask = (taskId) => {
    // Supprimer de la liste locale
    setWeeklyTasks(weeklyTasks.filter(task => task.id !== taskId));
    
    // Supprimer aussi du contexte global si la tâche existe
    const globalTask = tasks.find(t => t.id === taskId && t.fromCalendar);
    if (globalTask) {
      deleteTask(taskId);
    }
  };
  
  // Obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Header héro premium */}
        <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-8">
          <h1 className="text-[40px] font-bold tracking-tight text-[#1E1F22]">Calendrier</h1>
          <p className="text-gray-600 mt-3 text-lg">Organisez vos <span className="text-blue-500 font-semibold">événements et tâches</span></p>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-[#1E1F22] min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-sm transition-all duration-150"
          >
            Aujourd'hui
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {daysOfWeek.map(day => (
              <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 grid-rows-6 h-[calc(100%-49px)]">
            {calendarDays.map((dayInfo, index) => {
              const tasks = getTasksForDate(dayInfo.date);
              const isCurrentMonth = dayInfo.isCurrentMonth;
              const isTodayDate = isToday(dayInfo.date);
              const isSelectedDate = isSelected(dayInfo.date);
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(dayInfo.date);
                    setSelectedDay(dayInfo.date);
                    if (isCurrentMonth) {
                      setShowTaskModal(true);
                    }
                  }}
                  className={`relative border-r border-b border-gray-200 p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    !isCurrentMonth ? 'bg-gray-100/50' : ''
                  } ${isSelectedDate ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate 
                      ? 'text-white bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-[#1E1F22]' 
                        : 'text-gray-400'
                  }`}>
                    {dayInfo.day}
                  </div>
                  
                  {/* Tasks preview */}
                  <div className="space-y-1 mt-2">
                    {tasks.slice(0, 3).map((task, taskIndex) => (
                      <div
                        key={task.id}
                        className="group relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-xs text-gray-700 hover:bg-blue-100 transition-colors">
                          <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="truncate flex-1">{task.name}</span>
                          {task.time && (
                            <span className="text-gray-500 text-[10px]">{task.time}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3 text-red-400" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-[10px] text-gray-500 px-1.5">
                        +{tasks.length - 3} autres...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Task Modal */}
      {showTaskModal && selectedDay && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center" onClick={() => setShowTaskModal(false)}>
          <div 
            className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-2xl p-6 w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1E1F22] mb-4">
              Ajouter une tâche - {selectedDay.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1E1F22] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Réunion équipe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure (optionnel)</label>
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1E1F22] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1E1F22] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-[#1E1F22] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
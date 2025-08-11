import React, { useState, useEffect } from 'react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', time: '', priority: 'medium' });
  
  // Charger les tâches de la semaine depuis localStorage
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
  
  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startDayOfWeek = getDayOfWeek(firstDay);
    
    const days = [];
    
    // Jours du mois précédent
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i)
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day)
      });
    }
    
    return days;
  };
  
  // Vérifier si c'est aujourd'hui
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Vérifier si c'est la date sélectionnée
  const isSelected = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  // Obtenir les tâches pour une date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weeklyTasks.filter(task => task.date === dateStr);
  };
  
  // Ajouter une tâche
  const handleAddTask = () => {
    if (newTask.name.trim()) {
      const task = {
        id: Date.now(),
        name: newTask.name,
        date: selectedDay.toISOString().split('T')[0],
        time: newTask.time,
        priority: newTask.priority,
        status: 'todo',
        completed: false
      };
      
      const updatedTasks = [...weeklyTasks, task];
      setWeeklyTasks(updatedTasks);
      localStorage.setItem('weeklyTasks', JSON.stringify(updatedTasks));
      
      setNewTask({ name: '', time: '', priority: 'medium' });
      setShowTaskModal(false);
    }
  };
  
  // Supprimer une tâche
  const handleDeleteTask = (taskId) => {
    const updatedTasks = weeklyTasks.filter(t => t.id !== taskId);
    setWeeklyTasks(updatedTasks);
    localStorage.setItem('weeklyTasks', JSON.stringify(updatedTasks));
  };
  
  // Obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="h-full bg-[rgb(25,25,25)] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgb(47,47,47)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white/81">Calendrier</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-white/[0.055] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-white/81 min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-white/[0.055] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/[0.055] text-white/81 rounded-lg hover:bg-white/[0.08] transition-colors"
          >
            Aujourd'hui
          </button>
        </div>
      </header>
      
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        <div className="h-full bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
            {daysOfWeek.map(day => (
              <div key={day} className="px-4 py-3 text-center text-sm font-medium text-white/60">
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
                  className={`relative border-r border-b border-[rgb(47,47,47)] p-2 cursor-pointer transition-all hover:bg-white/[0.02] ${
                    !isCurrentMonth ? 'bg-black/20' : ''
                  } ${isSelectedDate ? 'bg-white/[0.055]' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate 
                      ? 'text-white bg-[rgb(35,131,226)] w-7 h-7 rounded-full flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-white/81' 
                        : 'text-white/30'
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
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.055] rounded text-xs text-white/70 hover:bg-white/[0.08] transition-colors">
                          <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`} />
                          <span className="truncate flex-1">{task.name}</span>
                          {task.time && (
                            <span className="text-white/40 text-[10px]">{task.time}</span>
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
                      <div className="text-[10px] text-white/40 px-1.5">
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
            className="bg-[rgb(37,37,37)] border border-white/10 rounded-xl shadow-xl p-6 w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white/81 mb-4">
              Ajouter une tâche - {selectedDay.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-white/60 text-sm">Nom de la tâche</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="Ex: Réunion équipe"
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2 text-white/60 text-sm">Heure</label>
                  <input
                    type="time"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block mb-2 text-white/60 text-sm">Priorité</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 bg-white/[0.055] text-white/60 rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-lg hover:bg-[rgb(28,104,181)] transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
            
            {/* Liste des tâches existantes pour ce jour */}
            {getTasksForDate(selectedDay).length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/60 mb-3">Tâches existantes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getTasksForDate(selectedDay).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-white/[0.03] rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="text-sm text-white/70">{task.name}</span>
                        {task.time && (
                          <span className="text-xs text-white/40">{task.time}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
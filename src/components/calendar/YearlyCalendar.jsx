import React, { useMemo } from 'react';

const YearlyCalendar = ({ tasks, currentDate, onMonthClick }) => {
  const year = currentDate.getFullYear();
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calculer les statistiques pour chaque mois
  const monthsData = useMemo(() => {
    return months.map((monthName, monthIndex) => {
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0);
      
      // Filtrer les tâches du mois
      const monthTasks = tasks.filter(task => {
        const taskDate = task.date || task.startDate;
        if (!taskDate || taskDate === '-') return false;
        
        const date = new Date(taskDate);
        return date >= monthStart && date <= monthEnd;
      });

      // Compter par statut
      const completed = monthTasks.filter(t => t.status === 'Terminé').length;
      const inProgress = monthTasks.filter(t => t.status === 'En cours').length;
      const todo = monthTasks.filter(t => t.status === 'À faire').length;
      
      // Générer les jours du mois
      const days = [];
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      const startingDayOfWeek = firstDay.getDay() || 7;
      
      // Remplir avec des jours vides au début
      for (let i = 1; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Ajouter les jours du mois
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, monthIndex, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => {
          const taskDate = task.date || task.startDate;
          return taskDate === dateStr;
        });
        
        days.push({
          day,
          hasEvents: dayTasks.length > 0,
          taskCount: dayTasks.length,
          isToday: date.toDateString() === new Date().toDateString()
        });
      }
      
      return {
        name: monthName,
        index: monthIndex,
        total: monthTasks.length,
        completed,
        inProgress,
        todo,
        days,
        isCurrentMonth: monthIndex === new Date().getMonth() && year === new Date().getFullYear()
      };
    });
  }, [tasks, year]);

  // Obtenir l'intensité de couleur basée sur le nombre de tâches
  const getIntensity = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-300';
    if (count === 3) return 'bg-blue-400';
    if (count === 4) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {monthsData.map((month) => (
        <div
          key={month.index}
          className={`bg-white rounded-xl shadow-sm border ${
            month.isCurrentMonth ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
          } p-4 cursor-pointer hover:shadow-md transition-all`}
          onClick={() => onMonthClick(new Date(year, month.index, 1))}
        >
          {/* En-tête du mois */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">{month.name}</h3>
            <span className="text-xs text-gray-500">{month.total} tâches</span>
          </div>

          {/* Mini calendrier */}
          <div className="mb-3">
            <div className="grid grid-cols-7 gap-0.5 text-xs">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center text-gray-400 text-[10px] pb-1">
                  {day}
                </div>
              ))}
              {month.days.map((day, i) => (
                <div
                  key={i}
                  className={`
                    aspect-square flex items-center justify-center text-[10px] rounded-sm
                    ${day === null ? '' : 
                      day.isToday ? 'bg-blue-500 text-white font-bold' :
                      day.hasEvents ? getIntensity(day.taskCount) + ' text-white' : 
                      'bg-gray-50 text-gray-400'}
                  `}
                >
                  {day?.day || ''}
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques du mois */}
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">{month.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">{month.inProgress}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">{month.todo}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YearlyCalendar;
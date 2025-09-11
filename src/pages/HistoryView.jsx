import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const HistoryView = () => {
  const { tasks } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('overview'); // overview, week, day
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [visibleMonths, setVisibleMonths] = useState(3); // Nombre de mois visibles
  
  // Icônes minimalistes style Monday.com
  const icons = {
    chart: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    calendar: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    check: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    arrow: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )
  };
  
  // Obtenir la date du début de la semaine (lundi)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  
  // Obtenir le numéro de semaine
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  };
  
  // Calculer les métriques pour une période donnée
  const calculateMetrics = (startDate, endDate) => {
    const filteredTasks = tasks.filter(task => {
      if (task.status !== 'Terminé') return false;
      const taskDate = task.completedDate || task.date || task.startDate;
      if (!taskDate || taskDate === '-') return false;
      
      const d = new Date(taskDate);
      return d >= startDate && d <= endDate;
    });
    
    const byCategory = {};
    filteredTasks.forEach(task => {
      const category = task.radarName || 'Autres';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    return {
      total: filteredTasks.length,
      tasks: filteredTasks,
      byCategory
    };
  };
  
  // Obtenir toutes les semaines pour l'affichage
  const allWeeks = useMemo(() => {
    const weeks = [];
    const now = new Date();
    const weeksToShow = visibleMonths * 4; // Approximativement 4 semaines par mois
    
    for (let i = 0; i < weeksToShow; i++) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekStart = getWeekStart(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const metrics = calculateMetrics(weekStart, weekEnd);
      const weekNum = getWeekNumber(weekDate);
      
      weeks.push({
        id: weekNum,
        startDate: weekStart,
        endDate: weekEnd,
        monthYear: weekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        weekNumber: parseInt(weekNum.split('-W')[1]),
        metrics,
        isCurrent: i === 0
      });
    }
    
    return weeks;
  }, [tasks, visibleMonths]);
  
  // Données pour le graphique des 4 dernières semaines
  const last4Weeks = allWeeks.slice(0, 4);
  const maxValue = Math.max(...last4Weeks.map(w => w.metrics.total), 10);
  
  // Regrouper les semaines par mois
  const weeksByMonth = useMemo(() => {
    const grouped = {};
    allWeeks.forEach(week => {
      if (!grouped[week.monthYear]) {
        grouped[week.monthYear] = [];
      }
      grouped[week.monthYear].push(week);
    });
    return grouped;
  }, [allWeeks]);
  
  // Calculer la performance d'une semaine (pour l'intensité)
  const getWeekIntensity = (total) => {
    if (total >= 25) return 'opacity-100';
    if (total >= 15) return 'opacity-75';
    if (total >= 8) return 'opacity-50';
    if (total > 0) return 'opacity-30';
    return 'opacity-10';
  };
  
  // Vue hebdomadaire détaillée
  const WeekView = ({ week }) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(week.startDate);
      dayDate.setDate(dayDate.getDate() + i);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayMetrics = calculateMetrics(dayDate, dayEnd);
      days.push({
        date: dayDate,
        dayName: dayDate.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dayNumber: dayDate.getDate(),
        metrics: dayMetrics
      });
    }
    
    const maxDayValue = Math.max(...days.map(d => d.metrics.total), 5);
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
        <div className="mb-8">
          <h3 className="text-xl font-light text-gray-700">
            Semaine {week.weekNumber}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {week.startDate.toLocaleDateString('fr-FR')} → {week.endDate.toLocaleDateString('fr-FR')}
          </p>
        </div>
        
        {/* Graphique des jours */}
        <div className="mb-10">
          <div className="h-48 flex items-end justify-between gap-3">
            {days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gray-600 rounded-sm hover:bg-gray-700 transition-all cursor-pointer relative group"
                  style={{ 
                    height: `${(day.metrics.total / maxDayValue) * 100}%`,
                    minHeight: day.metrics.total > 0 ? '24px' : '2px'
                  }}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedView('day');
                  }}
                >
                  {day.metrics.total > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-light text-gray-600">
                      {day.metrics.total}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500 text-center">
                  <div className="font-normal">{day.dayName.slice(0, 3)}</div>
                  <div className="text-gray-400 text-[10px]">{day.dayNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Répartition par catégorie - Style minimal */}
        <div className="border-t border-gray-100 pt-8">
          <h4 className="text-sm font-light text-gray-500 mb-6 uppercase tracking-wider">Répartition</h4>
          <div className="space-y-3">
            {Object.entries(week.metrics.byCategory).map(([category, count]) => {
              const percentage = week.metrics.total > 0 ? Math.round((count / week.metrics.total) * 100) : 0;
              return (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">{category}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gray-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 w-12 text-right">{percentage}%</div>
                  <div className="text-xs text-gray-400">({count})</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Vue journalière avec liste des tâches
  const DayView = ({ day }) => {
    const dayTasks = day.metrics.tasks;
    
    const getPriorityStyle = (priority) => {
      switch(priority) {
        case 'Très important': return 'text-gray-700 font-medium';
        case 'Important': return 'text-gray-700';
        default: return 'text-gray-400';
      }
    };
    
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
        <div className="mb-8">
          <h3 className="text-xl font-light text-gray-700">
            {day.dayName}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {day.date.toLocaleDateString('fr-FR')} · {dayTasks.length} tâche{dayTasks.length > 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Liste des tâches - Style minimal */}
        <div className="space-y-2">
          {dayTasks.length > 0 ? (
            dayTasks.map((task, index) => (
              <div key={index} className="group flex items-center gap-4 py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-gray-400">
                  {icons.check}
                </div>
                <div className="flex-1">
                  <div className="text-gray-700">{task.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.radarName && (
                      <span className="text-xs text-gray-400">
                        {task.radarName}
                        {task.subjectName && ` · ${task.subjectName}`}
                      </span>
                    )}
                    {task.time && task.time !== '-' && (
                      <span className="text-xs text-gray-400">{task.time}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3 opacity-20">○</div>
              <p>Aucune tâche ce jour</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb minimal */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => setSelectedView('overview')}
              className={`${selectedView === 'overview' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              Historique
            </button>
            {selectedView !== 'overview' && (
              <>
                <span className="text-gray-300">{icons.arrow}</span>
                <button 
                  onClick={() => setSelectedView('week')}
                  className={`${selectedView === 'week' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  S{selectedWeek?.weekNumber}
                </button>
              </>
            )}
            {selectedView === 'day' && (
              <>
                <span className="text-gray-300">{icons.arrow}</span>
                <span className="text-gray-700">
                  {selectedDay?.dayName}
                </span>
              </>
            )}
          </nav>
        </div>
        
        {/* Titre de la page */}
        <div className="mb-10">
          <h1 className="text-3xl font-light text-gray-700 tracking-tight">Historique</h1>
          <p className="text-gray-400 mt-2 text-sm">Analyse de votre progression</p>
        </div>
        
        {/* Vue principale */}
        {selectedView === 'overview' && (
          <>
            {/* Graphique des 4 dernières semaines - Glass effect */}
            <div className="bg-white/50 backdrop-blur-md rounded-xl border border-gray-200/50 p-8 mb-10 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-gray-400">{icons.chart}</span>
                <h2 className="text-lg font-light text-gray-700">Mois en cours</h2>
              </div>
              <div className="h-56 flex items-end justify-between gap-6">
                {last4Weeks.map((week, index) => {
                  const height = maxValue > 0 ? (week.metrics.total / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gray-600 hover:bg-gray-700 rounded-sm transition-all cursor-pointer relative group"
                        style={{ 
                          height: `${height}%`, 
                          minHeight: week.metrics.total > 0 ? '30px' : '2px'
                        }}
                        onClick={() => {
                          setSelectedWeek(week);
                          setSelectedView('week');
                        }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                          <span className="text-gray-600 font-light">{week.metrics.total}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        S{week.weekNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Grille des semaines passées - Style minimal */}
            <div className="space-y-10">
              {Object.entries(weeksByMonth).map(([monthYear, monthWeeks]) => (
                <div key={monthYear}>
                  {/* Séparateur avec nom du mois */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <h3 className="text-xs font-light text-gray-400 uppercase tracking-widest px-4">
                      {monthYear}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  
                  {/* Grille de semaines */}
                  <div className="grid grid-cols-4 gap-4">
                    {monthWeeks.map(week => {
                      const intensity = getWeekIntensity(week.metrics.total);
                      
                      return (
                        <div
                          key={week.id}
                          onClick={() => {
                            setSelectedWeek(week);
                            setSelectedView('week');
                          }}
                          className={`bg-gray-600 ${intensity} rounded-lg p-6 cursor-pointer hover:opacity-100 transition-all group`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/60 font-light">S{week.weekNumber}</span>
                            {week.isCurrent && (
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                          </div>
                          <div className="text-2xl font-light text-white">{week.metrics.total}</div>
                          <div className="text-xs text-white/40 mt-1">tâches</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bouton pour charger plus - Style minimal */}
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleMonths(visibleMonths + 3)}
                className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-700 transition-colors border border-gray-300 rounded-lg hover:border-gray-400"
              >
                Afficher plus
              </button>
            </div>
          </>
        )}
        
        {/* Vue hebdomadaire */}
        {selectedView === 'week' && selectedWeek && (
          <WeekView week={selectedWeek} />
        )}
        
        {/* Vue journalière */}
        {selectedView === 'day' && selectedDay && (
          <DayView day={selectedDay} />
        )}
      </div>
    </div>
  );
};

export default HistoryView;
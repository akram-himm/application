import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { uniformStyles } from '../styles/uniformStyles';
import { exportHistory, importHistory } from '../services/historyService';

const HistoryView = () => {
  const { tasks } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('overview'); // overview, week, day
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [visibleMonths, setVisibleMonths] = useState(3); // Nombre de mois visibles
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const fileInputRef = useRef(null);
  
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
  
  // Calculer les métriques pour une période donnée (inclut toutes les tâches)
  const calculateMetrics = (startDate, endDate) => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = task.date || task.startDate;
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
  
  // Obtenir toutes les semaines à partir de la semaine actuelle du mois en cours
  const allWeeks = useMemo(() => {
    const weeks = [];
    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Si on est en septembre, commencer à partir de la semaine actuelle seulement
    // Si on est dans un autre mois, inclure toutes les semaines depuis septembre
    let startingWeek;
    if (currentMonth === 8 && currentYear === 2025) { // Septembre 2025
      // On est toujours en septembre, commencer à partir de la semaine actuelle
      startingWeek = new Date(currentWeekStart);
    } else {
      // On est dans un mois après septembre, inclure tout depuis septembre
      const septemberStart = new Date(2025, 8, 1);
      startingWeek = getWeekStart(septemberStart);
    }
    
    // Générer toutes les semaines depuis le point de départ jusqu'à la semaine actuelle
    let weekDate = new Date(startingWeek);
    while (weekDate <= currentWeekStart) {
      const weekStart = new Date(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const metrics = calculateMetrics(weekStart, weekEnd);
      const weekNum = getWeekNumber(weekStart);
      
      // Calculer le numéro de semaine dans le mois
      let weekOfMonth = 1;
      if (currentMonth === 8 && currentYear === 2025) {
        // Pour septembre 2025, on commence à la semaine 2
        const week37Start = new Date(2025, 8, 8);
        if (weekStart >= week37Start) {
          const weeksSince37 = Math.floor((weekStart - week37Start) / (7 * 24 * 60 * 60 * 1000));
          weekOfMonth = 2 + weeksSince37; // Commence à 2 pour septembre
        }
      } else {
        // Pour les autres mois, calculer normalement
        const firstOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
        const firstWeekOfMonth = getWeekStart(firstOfMonth);
        weekOfMonth = Math.floor((weekStart - firstWeekOfMonth) / (7 * 24 * 60 * 60 * 1000)) + 1;
      }
      
      weeks.push({
        id: weekNum,
        startDate: weekStart,
        endDate: weekEnd,
        monthYear: weekStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        weekNumber: parseInt(weekNum.split('-W')[1]),
        weekOfMonth: weekOfMonth,
        metrics,
        isCurrent: weekStart.getTime() === currentWeekStart.getTime()
      });
      
      // Passer à la semaine suivante
      weekDate.setDate(weekDate.getDate() + 7);
    }
    
    // Inverser l'ordre pour avoir le plus récent en premier
    return weeks.reverse();
  }, [tasks]);
  
  // Données pour le graphique des semaines du mois actuel
  const currentWeek = allWeeks.find(w => w.isCurrent) || allWeeks[0];
  const monthWeeks = useMemo(() => {
    if (!currentWeek) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weeks = [];
    
    // Pour septembre 2025, commencer à partir de la semaine 2 (semaine 37)
    // Pour les autres mois, commencer à partir de la semaine 1
    let startWeek;
    if (currentMonth === 8 && currentYear === 2025) {
      // Septembre 2025 - commencer à la semaine 37 (2e semaine de septembre)
      const week37Start = new Date(2025, 8, 8); // 8 septembre = début semaine 37
      startWeek = getWeekStart(week37Start);
    } else {
      // Autres mois - commencer au début du mois
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      startWeek = getWeekStart(firstDayOfMonth);
    }
    
    // Générer les semaines pour le graphique
    // Pour septembre : seulement 3 semaines (2, 3, 4)
    // Pour les autres mois : 4 semaines (1, 2, 3, 4)
    const maxWeeks = (currentMonth === 8 && currentYear === 2025) ? 3 : 4;
    
    for (let i = 0; i < maxWeeks; i++) {
      const weekDate = new Date(startWeek);
      weekDate.setDate(weekDate.getDate() + (i * 7));
      
      // Ne pas dépasser le mois actuel
      if (weekDate.getMonth() !== currentMonth) break;
      
      const weekStart = new Date(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const metrics = calculateMetrics(weekStart, weekEnd);
      const isCurrent = weekStart.getTime() === currentWeek.startDate.getTime();
      
      weeks.push({
        weekOfMonth: i + 1, // Toujours commencer à 1
        total: metrics.total,
        completed: metrics.tasks.filter(t => t.status === 'Terminé').length,
        isCurrent,
        startDate: weekStart,
        endDate: weekEnd
      });
    }
    
    return weeks;
  }, [currentWeek, tasks]);
  
  // Calculer la valeur max avec un arrondi pour une meilleure échelle
  const actualMax = Math.max(...monthWeeks.map(w => w.total), 1);
  const maxValue = Math.ceil(actualMax / 5) * 5 || 10; // Arrondir au multiple de 5 supérieur
  
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

  // Gérer l'export de toutes les données
  const handleExportAll = () => {
    // Créer un objet avec toutes les données
    const exportData = {
      tasks: tasks,
      history: localStorage.getItem('gestion_history') ? JSON.parse(localStorage.getItem('gestion_history')) : [],
      radars: localStorage.getItem('gestion_radars') ? JSON.parse(localStorage.getItem('gestion_radars')) : [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    // Convertir en JSON et télécharger
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `backup_complet_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  // Gérer l'import des données
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Sauvegarder les données importées
        if (importedData.tasks) {
          localStorage.setItem('gestion_tasks', JSON.stringify(importedData.tasks));
        }
        if (importedData.history) {
          localStorage.setItem('gestion_history', JSON.stringify(importedData.history));
        }
        if (importedData.radars) {
          localStorage.setItem('gestion_radars', JSON.stringify(importedData.radars));
        }
        
        setShowImportSuccess(true);
        setTimeout(() => {
          setShowImportSuccess(false);
          window.location.reload(); // Recharger pour appliquer les changements
        }, 2000);
      } catch (error) {
        alert('Erreur lors de l\'import : fichier invalide');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Réinitialiser l'input
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
      <div className={uniformStyles.card.default + ' p-8'}>
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
        
        {/* Résumé de performance - Focus sur les radars */}
        <div className="border-t border-gray-100 pt-8">
          <h4 className="text-sm font-light text-gray-500 mb-6 uppercase tracking-wider">Performance de la Semaine</h4>
          
          {/* Taux de complétion global */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Taux de complétion global</span>
              <span className="text-2xl font-light text-gray-700">
                {Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.total, 1)) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.total, 1)) * 100) >= 70 ? 'bg-green-500' :
                  Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.total, 1)) * 100) >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.total, 1)) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Répartition par radar/domaine - Visualisation améliorée */}
          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-6">Répartition par domaine (Radar)</h5>
            <div className="space-y-3">
              {Object.entries(week.metrics.byCategory).length > 0 ? (
                Object.entries(week.metrics.byCategory)
                  .sort((a, b) => b[1] - a[1]) // Trier par nombre de tâches décroissant
                  .map(([radar, count]) => {
                    const total = week.metrics.total;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    // Définir les styles par domaine avec icônes
                    const getRadarStyle = (name) => {
                      const styles = {
                        'Études': { 
                          gradient: 'from-purple-500 to-purple-600',
                          bg: 'bg-purple-50',
                          text: 'text-purple-700',
                          icon: '📚'
                        },
                        'Sport': { 
                          gradient: 'from-green-500 to-green-600',
                          bg: 'bg-green-50',
                          text: 'text-green-700',
                          icon: '🏃'
                        },
                        'Projets': { 
                          gradient: 'from-blue-500 to-blue-600',
                          bg: 'bg-blue-50',
                          text: 'text-blue-700',
                          icon: '💼'
                        },
                        'Personnel': { 
                          gradient: 'from-pink-500 to-pink-600',
                          bg: 'bg-pink-50',
                          text: 'text-pink-700',
                          icon: '🏠'
                        },
                        'Travail': { 
                          gradient: 'from-orange-500 to-orange-600',
                          bg: 'bg-orange-50',
                          text: 'text-orange-700',
                          icon: '💻'
                        },
                        'Santé': { 
                          gradient: 'from-red-500 to-red-600',
                          bg: 'bg-red-50',
                          text: 'text-red-700',
                          icon: '❤️'
                        },
                        'Social': { 
                          gradient: 'from-indigo-500 to-indigo-600',
                          bg: 'bg-indigo-50',
                          text: 'text-indigo-700',
                          icon: '👥'
                        },
                        'Loisirs': { 
                          gradient: 'from-teal-500 to-teal-600',
                          bg: 'bg-teal-50',
                          text: 'text-teal-700',
                          icon: '🎮'
                        },
                        'Autres': { 
                          gradient: 'from-gray-500 to-gray-600',
                          bg: 'bg-gray-50',
                          text: 'text-gray-700',
                          icon: '📌'
                        }
                      };
                      return styles[name] || styles['Autres'];
                    };
                    
                    const style = getRadarStyle(radar);
                    
                    return (
                      <div key={radar} className="relative">
                        <div className="flex items-center gap-4">
                          {/* Icône et nom */}
                          <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-xl">{style.icon}</span>
                          </div>
                          
                          {/* Contenu principal */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium ${style.text}`}>{radar}</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-light text-gray-700">{percentage}</span>
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                            
                            {/* Barre de progression */}
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${style.gradient} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3 opacity-20">📊</div>
                  <p className="text-sm">Aucun domaine défini pour cette semaine</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Vue journalière avec liste des tâches (toutes les tâches)
  const DayView = ({ day }) => {
    const dayTasks = day.metrics.tasks;
    const completedTasks = dayTasks.filter(t => t.status === 'Terminé');
    const pendingTasks = dayTasks.filter(t => t.status === 'À faire');
    const inProgressTasks = dayTasks.filter(t => t.status === 'En cours');
    
    const getPriorityStyle = (priority) => {
      switch(priority) {
        case 'Très important': return 'bg-red-100 text-red-700 font-medium';
        case 'Important': return 'bg-orange-100 text-orange-700';
        case 'Normal': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-50 text-gray-500';
      }
    };
    
    const getStatusIcon = (status) => {
      switch(status) {
        case 'Terminé': return '✓';
        case 'En cours': return '⏱';
        case 'À faire': return '○';
        default: return '•';
      }
    };
    
    const getStatusStyle = (status) => {
      switch(status) {
        case 'Terminé': return 'text-green-600 bg-green-50';
        case 'En cours': return 'text-blue-600 bg-blue-50';
        case 'À faire': return 'text-gray-500 bg-gray-50';
        default: return 'text-gray-400 bg-gray-50';
      }
    };
    
    return (
      <div className={uniformStyles.card.default + ' p-8'}>
        <div className="mb-8">
          <h3 className="text-xl font-light text-gray-700">
            {day.dayName}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-400">
              {day.date.toLocaleDateString('fr-FR')}
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-green-600">{completedTasks.length} terminées</span>
              <span className="text-blue-600">{inProgressTasks.length} en cours</span>
              <span className="text-gray-500">{pendingTasks.length} à faire</span>
            </div>
          </div>
        </div>
        
        {/* Résumé rapide */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-light text-gray-700">{dayTasks.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-light text-green-600">{completedTasks.length}</div>
            <div className="text-xs text-gray-500">Complétées</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-light text-blue-600">
              {dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500">Taux</div>
          </div>
        </div>
        
        {/* Liste des tâches organisée par statut */}
        <div className="space-y-4">
          {dayTasks.length > 0 ? (
            <>
              {/* Tâches terminées */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-2">Terminées ({completedTasks.length})</h4>
                  <div className="space-y-2">
                    {completedTasks.map((task, index) => (
                      <div key={`completed-${index}`} className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getStatusStyle(task.status)}`}>
                          {getStatusIcon(task.status)}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-gray-700 line-through">{task.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.radarName && (
                              <span className="text-xs text-gray-500">
                                {task.radarName}
                              </span>
                            )}
                            {task.time && task.time !== '-' && (
                              <span className="text-xs text-gray-400">{task.time}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tâches en cours */}
              {inProgressTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-2">En cours ({inProgressTasks.length})</h4>
                  <div className="space-y-2">
                    {inProgressTasks.map((task, index) => (
                      <div key={`progress-${index}`} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getStatusStyle(task.status)}`}>
                          {getStatusIcon(task.status)}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-gray-700">{task.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.radarName && (
                              <span className="text-xs text-gray-500">
                                {task.radarName}
                              </span>
                            )}
                            {task.time && task.time !== '-' && (
                              <span className="text-xs text-gray-400">{task.time}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tâches à faire */}
              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-2">À faire ({pendingTasks.length})</h4>
                  <div className="space-y-2">
                    {pendingTasks.map((task, index) => (
                      <div key={`pending-${index}`} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getStatusStyle(task.status)}`}>
                          {getStatusIcon(task.status)}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm text-gray-700">{task.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.radarName && (
                              <span className="text-xs text-gray-500">
                                {task.radarName}
                              </span>
                            )}
                            {task.time && task.time !== '-' && (
                              <span className="text-xs text-gray-400">{task.time}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
    <div className="min-h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]">
      {/* Notification de succès d'import */}
      {showImportSuccess && (
        <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-gray-200 z-50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-light">Données importées avec succès</span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* En-tête avec breadcrumb et boutons export/import */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
            
            {/* Boutons Export/Import */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAll}
                className={'flex items-center gap-1.5 ' + uniformStyles.button.primary}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="font-light">Exporter</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className={'flex items-center gap-1.5 ' + uniformStyles.button.primary}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-light">Importer</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        {/* Titre de la page */}
        <div className="mb-10">
          <h1 className="text-3xl font-light text-gray-700 tracking-tight">Historique</h1>
          <p className="text-gray-400 mt-2 text-sm">Analyse de votre progression</p>
        </div>
        
        {/* Vue principale */}
        {selectedView === 'overview' && (
          <>
            {/* Graphique des semaines du mois - Design amélioré */}
            <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm ring-1 ring-gray-200/50 shadow-xl p-6 mb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{icons.chart}</span>
                  <h2 className="text-lg font-medium text-gray-800 capitalize">
                    {currentWeek?.monthYear}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-gray-400 text-xs">{icons.progress}</span>
                  <span>Progression mensuelle</span>
                </div>
              </div>
              
              {/* Graphique avec axe Y */}
              <div className="flex gap-3">
                {/* Axe Y - Pourcentages */}
                <div className="flex flex-col justify-between h-40 text-right pr-2">
                  <span className="text-[10px] text-gray-400">100%</span>
                  <span className="text-[10px] text-gray-400">75%</span>
                  <span className="text-[10px] text-gray-400">50%</span>
                  <span className="text-[10px] text-gray-400">25%</span>
                  <span className="text-[10px] text-gray-400">0%</span>
                </div>
                
                {/* Barres du graphique */}
                <div className="flex-1 relative">
                  {/* Conteneur avec hauteur fixe pour aligner avec l'axe Y */}
                  <div className="h-40 relative">
                    {/* Lignes de grille horizontales */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="h-px bg-gray-200/50"></div>
                      <div className="h-px bg-gray-200/50"></div>
                      <div className="h-px bg-gray-200/50"></div>
                      <div className="h-px bg-gray-200/50"></div>
                      <div className="h-px bg-gray-200/50"></div>
                    </div>
                    
                    {/* Barres alignées en bas */}
                    <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between gap-4">
                    {monthWeeks.map((week, index) => {
                      const completionRate = week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0;
                      const height = completionRate; // Hauteur basée sur le pourcentage de complétion
                      
                      // Symbole selon le taux de complétion
                      const getSymbol = () => {
                        if (week.total === 0) return '○';
                        if (completionRate >= 80) return '★';
                        if (completionRate >= 60) return '●';
                        if (completionRate >= 40) return '◐';
                        return '○';
                      };
                      
                      return (
                        <div key={index} className="flex-1 relative">
                          {/* Barre avec valeur */}
                          <div className="relative h-full flex flex-col justify-end">
                            {/* Valeur au-dessus de la barre */}
                            <div className="absolute bottom-full mb-1 left-0 right-0 text-center">
                              <span className="text-xs text-gray-500">{getSymbol()}</span>
                              {completionRate > 0 && (
                                <span className="block text-sm font-semibold text-gray-700">{completionRate}%</span>
                              )}
                            </div>
                            
                            {/* Barre */}
                            <div 
                              className={`w-full ${
                                week.isCurrent 
                                  ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-md' 
                                  : 'bg-gradient-to-t from-gray-500 to-gray-400'
                              } hover:opacity-90 rounded-t-lg transition-all cursor-pointer`}
                              style={{ 
                                height: `${(height / 100) * 160}px`, 
                                minHeight: week.total > 0 ? '10px' : '2px'
                              }}
                              onClick={() => {
                                const fullWeek = allWeeks.find(w => 
                                  w.startDate.getTime() === week.startDate.getTime()
                                );
                                if (fullWeek) {
                                  setSelectedWeek(fullWeek);
                                  setSelectedView('week');
                                }
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                  
                  {/* Numéros de semaine en dessous */}
                  <div className="flex justify-between gap-4 mt-3">
                    {monthWeeks.map((week, index) => (
                      <div key={index} className="flex-1 text-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${
                          week.isCurrent 
                            ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-200' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {week.weekOfMonth}
                        </div>
                        {week.isCurrent && (
                          <div className="text-[10px] text-blue-600 mt-1 font-medium">
                            En cours
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Légende */}
              <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-center gap-6 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">○</span>
                  <span className="text-gray-500">Vide</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">◐</span>
                  <span className="text-gray-500">En progrès</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">●</span>
                  <span className="text-gray-500">Bon</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">★</span>
                  <span className="text-gray-500">Excellent</span>
                </div>
              </div>
            </div>
            
            {/* Liste des semaines organisées par mois */}
            <div className="space-y-8">
              {/* Grouper les semaines par mois */}
              {(() => {
                const weeksByMonth = {};
                allWeeks.forEach(week => {
                  const monthKey = week.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                  if (!weeksByMonth[monthKey]) weeksByMonth[monthKey] = [];
                  weeksByMonth[monthKey].push(week);
                });
                
                return Object.entries(weeksByMonth).map(([monthName, monthWeeks]) => (
                  <div key={monthName}>
                    {/* Titre du mois */}
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-700 capitalize">
                        {monthName}
                      </h3>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    
                    <div className="space-y-3">
                      {monthWeeks.map((week, index) => {
                        const completionRate = week.metrics.tasks ? 
                          Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.tasks.length, 1)) * 100) : 0;
                        
                        return (
                          <div
                            key={week.id}
                            onClick={() => {
                              setSelectedWeek(week);
                              setSelectedView('week');
                            }}
                            className={uniformStyles.card.hover + ' p-3 cursor-pointer group relative'}
                          >
                            {/* Badge En cours */}
                            {week.isCurrent && (
                              <div className="absolute top-2 right-3">
                                <span className="text-[10px] text-blue-600 font-medium">● En cours</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Cercle avec pourcentage intégré */}
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                                    <span className="text-xs font-bold text-gray-700">{completionRate}%</span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-600 font-medium">Semaine {week.weekOfMonth || week.weekNumber}</span>
                                    <div className="text-[10px] text-gray-500">
                                      {week.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - 
                                      {week.endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Flèche */}
                              <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-sm">
                                {icons.arrow}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            {/* Bouton pour charger plus - Style clair */}
            <div className="mt-12 text-center">
              <button
                onClick={() => setVisibleMonths(visibleMonths + 3)}
                className={uniformStyles.button.primary + ' px-6 py-3'}
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
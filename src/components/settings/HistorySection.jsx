import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { uniformStyles } from '../../styles/uniformStyles';
import { loadHistory } from '../../services/historyService';

const HistorySection = () => {
  const { tasks, radars, setTasks } = useContext(AppContext);
  const [historyData, setHistoryData] = useState([]);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [weekToDelete, setWeekToDelete] = useState(null);
  const [deleteMode, setDeleteMode] = useState('data'); // 'data' ou 'all'
  const fileInputRef = useRef(null);

  useEffect(() => {
    const history = loadHistory();
    setHistoryData(history);
  }, []);


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

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
  };

  const calculateMetrics = (startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let allTasks = [...tasks];

    historyData.forEach(entry => {
      if (entry.tasks && Array.isArray(entry.tasks)) {
        allTasks = [...allTasks, ...entry.tasks];
      }
    });

    const filteredTasks = allTasks.filter(task => {
      const taskDate = task.date || task.startDate;
      if (!taskDate || taskDate === '-') return false;

      const d = new Date(taskDate);
      d.setHours(12, 0, 0, 0);
      return d >= start && d <= end;
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

  const allWeeks = useMemo(() => {
    const weeks = [];
    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingWeek = getWeekStart(firstDayOfMonth);

    let weekDate = new Date(startingWeek);
    while (weekDate <= currentWeekStart) {
      const weekStart = new Date(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const metrics = calculateMetrics(weekStart, weekEnd);
      const weekNum = getWeekNumber(weekStart);

      const firstOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
      const firstWeekOfMonth = getWeekStart(firstOfMonth);
      const weekOfMonth = Math.floor((weekStart - firstWeekOfMonth) / (7 * 24 * 60 * 60 * 1000)) + 1;

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

      weekDate.setDate(weekDate.getDate() + 7);
    }

    return weeks.reverse();
  }, [tasks, historyData]);

  const currentWeek = allWeeks.find(w => w.isCurrent) || allWeeks[0];
  const monthWeeks = useMemo(() => {
    if (!currentWeek) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weeks = [];

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startWeek = getWeekStart(firstDayOfMonth);
    const maxWeeks = 4;

    for (let i = 0; i < maxWeeks; i++) {
      const weekDate = new Date(startWeek);
      weekDate.setDate(weekDate.getDate() + (i * 7));

      if (weekDate.getMonth() !== currentMonth) break;

      const weekStart = new Date(weekDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const metrics = calculateMetrics(weekStart, weekEnd);
      const isCurrent = weekStart.getTime() === currentWeek.startDate.getTime();

      weeks.push({
        weekOfMonth: i + 1,
        total: metrics.total,
        completed: metrics.tasks.filter(t => t.status === 'Terminé').length,
        isCurrent,
        startDate: weekStart,
        endDate: weekEnd
      });
    }

    return weeks;
  }, [currentWeek, tasks]);

  const actualMax = Math.max(...monthWeeks.map(w => w.total), 1);
  const maxValue = Math.ceil(actualMax / 5) * 5 || 10;

  const handleExportAll = () => {
    const exportData = {
      tasks: tasks,
      history: localStorage.getItem('gestion_history') ? JSON.parse(localStorage.getItem('gestion_history')) : [],
      radars: localStorage.getItem('gestion_radars') ? JSON.parse(localStorage.getItem('gestion_radars')) : [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `backup_complet_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

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
          window.location.reload();
        }, 2000);
      } catch (error) {
        alert('Erreur lors de l\'import : fichier invalide');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleDeleteWeekData = (week, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWeekToDelete(week);
    setDeleteMode('data'); // Par défaut, supprimer seulement les données
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWeekData = () => {
    if (!weekToDelete) return;

    const startDate = new Date(weekToDelete.startDate);
    const endDate = new Date(weekToDelete.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (deleteMode === 'data') {
      // Supprimer seulement les données (tâches) de la semaine
      const filteredTasks = tasks.filter(task => {
        const taskDate = task.date || task.startDate;
        if (!taskDate || taskDate === '-') return true;

        const d = new Date(taskDate);
        d.setHours(12, 0, 0, 0);
        return !(d >= startDate && d <= endDate);
      });

      // Mettre à jour les tâches
      setTasks(filteredTasks);
    } else if (deleteMode === 'all') {
      // Supprimer complètement la semaine de l'historique
      const filteredTasks = tasks.filter(task => {
        const taskDate = task.date || task.startDate;
        if (!taskDate || taskDate === '-') return true;

        const d = new Date(taskDate);
        d.setHours(12, 0, 0, 0);
        return !(d >= startDate && d <= endDate);
      });

      // Mettre à jour les tâches
      setTasks(filteredTasks);

      // Mettre à jour l'historique
      const updatedHistory = historyData.filter(entry => {
        if (!entry.date) return true;
        const entryDate = new Date(entry.date);
        return !(entryDate >= startDate && entryDate <= endDate);
      });

      setHistoryData(updatedHistory);
      localStorage.setItem('gestion_history', JSON.stringify(updatedHistory));
    }

    setShowDeleteConfirm(false);
    setWeekToDelete(null);
    setDeleteMode('data');
    setSelectedView('overview');
  };

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

        <div className="mb-10">
          <div className="h-48 flex items-end justify-between gap-3">
            {days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center gap-1">
                  {day.metrics.total > 0 && (
                    <span className="text-xs font-light text-gray-600">
                      {day.metrics.total}
                    </span>
                  )}
                  <div
                    className="w-full bg-gray-600 rounded-sm hover:bg-gray-700 transition-all cursor-pointer"
                    style={{
                      height: `${(day.metrics.total / maxDayValue) * 144}px`,
                      minHeight: day.metrics.total > 0 ? '20px' : '4px'
                    }}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedView('day');
                    }}
                  />
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <div className="font-normal">{day.dayName.slice(0, 3)}</div>
                    <div className="text-gray-400 text-[10px]">{day.dayNumber}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h4 className="text-sm font-light text-gray-500 mb-6 uppercase tracking-wider">Performance de la Semaine</h4>

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

          <div>
            <h5 className="text-sm font-medium text-gray-600 mb-6">Répartition par domaine</h5>
            <div className="space-y-3">
              {Object.entries(week.metrics.byCategory).length > 0 ? (
                Object.entries(week.metrics.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([radar, count]) => {
                    const total = week.metrics.total;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div key={radar} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{radar}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-10 text-right">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Aucun domaine défini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DayView = ({ day }) => {
    const dayTasks = day.metrics.tasks;
    const completedTasks = dayTasks.filter(t => t.status === 'Terminé');
    const pendingTasks = dayTasks.filter(t => t.status === 'À faire');
    const inProgressTasks = dayTasks.filter(t => t.status === 'En cours');
    const notDoneTasks = dayTasks.filter(t => t.status === 'Non fait');

    const getPriorityStyle = (priority) => {
      switch(priority) {
        case 'Très important':
        case 'Haute':
          return 'bg-red-100 text-red-700 border-red-300';
        case 'Important':
        case 'Moyenne':
          return 'bg-orange-100 text-orange-700 border-orange-300';
        case 'Normal':
        case 'Normale':
          return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'Basse':
          return 'bg-gray-100 text-gray-600 border-gray-300';
        default:
          return 'bg-gray-50 text-gray-500 border-gray-200';
      }
    };

    const getPriorityIcon = (priority) => {
      switch(priority) {
        case 'Très important':
        case 'Haute':
          return '🔴';
        case 'Important':
        case 'Moyenne':
          return '🟠';
        case 'Normal':
        case 'Normale':
          return '🔵';
        case 'Basse':
          return '⚪';
        default:
          return '⚪';
      }
    };

    const getStatusIcon = (status) => {
      switch(status) {
        case 'Terminé': return '✅';
        case 'En cours': return '🔄';
        case 'À faire': return '⭕';
        case 'Non fait': return '❌';
        default: return '⚪';
      }
    };

    const getStatusStyle = (status) => {
      switch(status) {
        case 'Terminé': return 'text-green-700 bg-green-100 border-green-300';
        case 'En cours': return 'text-blue-700 bg-blue-100 border-blue-300';
        case 'À faire': return 'text-gray-600 bg-gray-100 border-gray-300';
        case 'Non fait': return 'text-red-700 bg-red-100 border-red-300';
        default: return 'text-gray-500 bg-gray-50 border-gray-200';
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

        <div className="space-y-4">
          {dayTasks && dayTasks.length > 0 ? (
            <>
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-3 font-medium">Terminées ({completedTasks.length})</h4>
                  <div className="space-y-2">
                    {completedTasks.map((task, index) => (
                      <div key={`completed-${index}`} className="bg-white rounded-lg border border-green-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getStatusIcon(task.status)}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 line-through mb-2">{task.name}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                <span className="font-medium">Statut:</span> {task.status}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                <span>{getPriorityIcon(task.priority)}</span>
                                <span className="font-medium">Priorité:</span> {task.priority || 'Non définie'}
                              </span>
                              {task.radarName && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                                  <span>🎯</span> {task.radarName}
                                </span>
                              )}
                              {task.time && task.time !== '-' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                  <span>🕐</span> {task.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inProgressTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-3 font-medium">En cours ({inProgressTasks.length})</h4>
                  <div className="space-y-2">
                    {inProgressTasks.map((task, index) => (
                      <div key={`progress-${index}`} className="bg-white rounded-lg border border-blue-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getStatusIcon(task.status)}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 mb-2">{task.name}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                <span className="font-medium">Statut:</span> {task.status}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                <span>{getPriorityIcon(task.priority)}</span>
                                <span className="font-medium">Priorité:</span> {task.priority || 'Non définie'}
                              </span>
                              {task.radarName && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                                  <span>🎯</span> {task.radarName}
                                </span>
                              )}
                              {task.time && task.time !== '-' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                  <span>🕐</span> {task.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-3 font-medium">À faire ({pendingTasks.length})</h4>
                  <div className="space-y-2">
                    {pendingTasks.map((task, index) => (
                      <div key={`pending-${index}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getStatusIcon(task.status)}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 mb-2">{task.name}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                <span className="font-medium">Statut:</span> {task.status}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                <span>{getPriorityIcon(task.priority)}</span>
                                <span className="font-medium">Priorité:</span> {task.priority || 'Non définie'}
                              </span>
                              {task.radarName && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                                  <span>🎯</span> {task.radarName}
                                </span>
                              )}
                              {task.time && task.time !== '-' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                  <span>🕐</span> {task.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notDoneTasks.length > 0 && (
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-3 font-medium">Non fait ({notDoneTasks.length})</h4>
                  <div className="space-y-2">
                    {notDoneTasks.map((task, index) => (
                      <div key={`notdone-${index}`} className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">{getStatusIcon(task.status)}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800 mb-2 opacity-75">{task.name}</div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                                <span className="font-medium">Statut:</span> {task.status}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getPriorityStyle(task.priority)}`}>
                                <span>{getPriorityIcon(task.priority)}</span>
                                <span className="font-medium">Priorité:</span> {task.priority || 'Non définie'}
                              </span>
                              {task.radarName && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                                  <span>🎯</span> {task.radarName}
                                </span>
                              )}
                              {task.time && task.time !== '-' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                                  <span>🕐</span> {task.time}
                                </span>
                              )}
                            </div>
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
              <p>Aucune tâche ce jour</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
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

      {showDeleteConfirm && weekToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Options de suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Semaine {weekToDelete.weekNumber} ({weekToDelete.metrics.total} tâche(s))
              <br />
              <span className="text-xs text-gray-500 mt-1 block">
                {weekToDelete.startDate.toLocaleDateString('fr-FR')} - {weekToDelete.endDate.toLocaleDateString('fr-FR')}
              </span>
            </p>

            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  value="data"
                  checked={deleteMode === 'data'}
                  onChange={(e) => setDeleteMode(e.target.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">Supprimer les données uniquement</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Supprime les {weekToDelete.metrics.total} tâche(s) mais conserve la semaine dans l'historique
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-red-200 hover:bg-red-50 cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  value="all"
                  checked={deleteMode === 'all'}
                  onChange={(e) => setDeleteMode(e.target.value)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-red-700">Supprimer complètement la semaine</div>
                  <div className="text-xs text-red-600 mt-0.5">
                    Supprime définitivement toutes les données et retire la semaine de l'historique
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setWeekToDelete(null);
                  setDeleteMode('data');
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteWeekData}
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  deleteMode === 'all'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {deleteMode === 'all' ? 'Supprimer tout' : 'Supprimer les données'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setSelectedView('overview')}
            className={`${selectedView === 'overview' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            Vue d'ensemble
          </button>
          {selectedView !== 'overview' && (
            <>
              <span className="text-gray-300">{icons.arrow}</span>
              <button
                onClick={() => setSelectedView('week')}
                className={`${selectedView === 'week' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                Semaine {selectedWeek?.weekOfMonth}
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className={'flex items-center gap-1.5 ' + uniformStyles.button.primary}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span className="text-xs">Exporter</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={'flex items-center gap-1.5 ' + uniformStyles.button.primary}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xs">Importer</span>
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

      {selectedView === 'overview' && (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm ring-1 ring-gray-200/50 shadow-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">{icons.chart}</span>
                <h2 className="text-lg font-medium text-gray-800 capitalize">
                  Activité du mois
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400">💡 Clic droit pour supprimer</span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-4">
              {monthWeeks.map((week, index) => {
                const completionRate = week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center gap-1">
                      {completionRate > 0 && (
                        <span className="text-xs font-light text-gray-600">
                          {completionRate}%
                        </span>
                      )}
                      <div
                        className={`w-full ${week.isCurrent ? 'bg-blue-500' : 'bg-gray-300'} rounded-sm hover:opacity-80 transition-all cursor-pointer`}
                        style={{
                          height: `${(week.total / maxValue) * 144}px`,
                          minHeight: week.total > 0 ? '20px' : '4px'
                        }}
                        title={`Semaine ${week.weekOfMonth}: ${week.total} tâches (${completionRate}% complété) - Clic droit pour supprimer`}
                        onClick={() => {
                          const fullWeek = allWeeks.find(w =>
                            Math.abs(w.startDate.getTime() - week.startDate.getTime()) < 1000
                          );
                          if (fullWeek) {
                            setSelectedWeek(fullWeek);
                            setSelectedView('week');
                          }
                        }}
                        onContextMenu={(e) => {
                          const fullWeek = allWeeks.find(w =>
                            Math.abs(w.startDate.getTime() - week.startDate.getTime()) < 1000
                          );
                          if (fullWeek) {
                            handleDeleteWeekData(fullWeek, e);
                          }
                        }}
                      />
                      <span className={`text-xs ${week.isCurrent ? 'text-blue-500 font-medium' : 'text-gray-500'} mt-2`}>
                        S{week.weekOfMonth}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            {(() => {
              const weeksByMonth = {};
              allWeeks.forEach(week => {
                const monthKey = week.startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                if (!weeksByMonth[monthKey]) weeksByMonth[monthKey] = [];
                weeksByMonth[monthKey].push(week);
              });

              return Object.entries(weeksByMonth).map(([monthName, monthWeeks]) => (
                <div key={monthName}>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 opacity-50"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {monthName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {monthWeeks.map((week, weekIndex) => {
                      const completionRate = week.metrics.tasks ?
                        Math.round((week.metrics.tasks.filter(t => t.status === 'Terminé').length / Math.max(week.metrics.tasks.length, 1)) * 100) : 0;

                      return (
                        <div
                          key={week.id}
                          className={uniformStyles.card.hover + ' p-3 cursor-pointer group relative'}
                          onClick={() => {
                            setSelectedWeek(week);
                            setSelectedView('week');
                          }}
                          onContextMenu={(e) => handleDeleteWeekData(week, e)}
                          title="Clic gauche pour voir les détails - Clic droit pour supprimer"
                        >
                          {week.isCurrent && (
                            <div className="absolute top-2 right-3">
                              <span className="text-[10px] text-blue-600 font-medium">● En cours</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                                  <span className="text-xs font-bold text-gray-700">{completionRate}%</span>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-600 font-medium">Semaine {week.weekOfMonth}</span>
                                  <div className="text-[10px] text-gray-500">
                                    {week.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} -
                                    {week.endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  </div>
                                </div>
                              </div>
                            </div>

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
        </>
      )}

      {selectedView === 'week' && selectedWeek && (
        <WeekView week={selectedWeek} />
      )}

      {selectedView === 'day' && selectedDay && (
        <DayView day={selectedDay} />
      )}
    </div>
  );
};

export default HistorySection;
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';

const DashboardView = () => {
  const { tasks, radars } = useContext(AppContext);
  const [historicalData, setHistoricalData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  
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
  
  // Calculer les métriques de la semaine actuelle
  const currentWeekMetrics = useMemo(() => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Filtrer les tâches de cette semaine
    const weekTasks = tasks.filter(task => {
      if (task.status !== 'Terminé') return false;
      
      // Utiliser completedDate si disponible, sinon date ou startDate
      const taskDate = task.completedDate || task.date || task.startDate;
      if (!taskDate || taskDate === '-') return false;
      
      const d = new Date(taskDate);
      return d >= weekStart && d <= weekEnd;
    });
    
    // Calculer les métriques par catégorie
    const byCategory = {};
    let totalTasks = weekTasks.length;
    
    weekTasks.forEach(task => {
      const category = task.radarName || 'Autres';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    // Calculer les pourcentages
    const categoryPercentages = {};
    Object.keys(byCategory).forEach(cat => {
      categoryPercentages[cat] = {
        count: byCategory[cat],
        percentage: totalTasks > 0 ? Math.round((byCategory[cat] / totalTasks) * 100) : 0
      };
    });
    
    return {
      total: totalTasks,
      byCategory: categoryPercentages,
      weekNumber: getWeekNumber(now)
    };
  }, [tasks]);
  
  // Charger les données historiques
  useEffect(() => {
    const stored = localStorage.getItem('weeklyMetrics');
    if (stored) {
      setHistoricalData(JSON.parse(stored));
    }
  }, []);
  
  // Sauvegarder les métriques de la semaine actuelle
  useEffect(() => {
    if (currentWeekMetrics.total > 0) {
      const stored = localStorage.getItem('weeklyMetrics') || '{}';
      const data = JSON.parse(stored);
      
      data[currentWeekMetrics.weekNumber] = {
        total: currentWeekMetrics.total,
        byCategory: currentWeekMetrics.byCategory,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('weeklyMetrics', JSON.stringify(data));
      setHistoricalData(data);
    }
  }, [currentWeekMetrics]);
  
  // Obtenir les 4 dernières semaines de données
  const last4WeeksData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekNum = getWeekNumber(weekDate);
      
      if (i === 0) {
        // Semaine actuelle
        weeks.push({
          week: 'Cette semaine',
          shortLabel: 'Cette sem.',
          total: currentWeekMetrics.total,
          isCurrent: true
        });
      } else {
        // Semaines précédentes
        const data = historicalData[weekNum];
        weeks.push({
          week: i === 1 ? 'Semaine dernière' : `Il y a ${i} sem`,
          shortLabel: i === 1 ? 'Sem. dern.' : `-${i} sem`,
          total: data ? data.total : 0,
          isCurrent: false
        });
      }
    }
    
    return weeks;
  }, [historicalData, currentWeekMetrics]);
  
  // Calculer la tendance
  const trend = useMemo(() => {
    if (last4WeeksData.length < 2) return null;
    
    const current = last4WeeksData[3].total;
    const previous = last4WeeksData[2].total;
    const diff = current - previous;
    
    if (diff > 0) {
      return { direction: 'up', value: diff, percentage: previous > 0 ? Math.round((diff / previous) * 100) : 100 };
    } else if (diff < 0) {
      return { direction: 'down', value: Math.abs(diff), percentage: previous > 0 ? Math.round((Math.abs(diff) / previous) * 100) : 0 };
    } else {
      return { direction: 'stable', value: 0, percentage: 0 };
    }
  }, [last4WeeksData]);
  
  // Obtenir la valeur max pour l'échelle du graphique
  const maxValue = Math.max(...last4WeeksData.map(w => w.total), 10);
  
  // Couleurs pour les catégories
  const categoryColors = {
    'Études': { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
    'Travail': { bg: 'bg-gradient-to-br from-amber-400 to-amber-600', text: 'text-amber-600', light: 'bg-amber-50' },
    'Sport': { bg: 'bg-gradient-to-br from-red-400 to-red-600', text: 'text-red-600', light: 'bg-red-50' },
    'Personnel': { bg: 'bg-gradient-to-br from-green-400 to-green-600', text: 'text-green-600', light: 'bg-green-50' },
    'Autres': { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', text: 'text-purple-600', light: 'bg-purple-50' }
  };
  
  const getCategoryStyle = (category) => {
    return categoryColors[category] || categoryColors['Autres'];
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header avec gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-500">Suivez votre progression semaine après semaine</p>
          </div>
        </div>
        
        {/* Cards principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card principale - Graphique */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance hebdomadaire</h2>
                <p className="text-gray-500 mt-1">Nombre de tâches complétées</p>
              </div>
              {trend && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  trend.direction === 'up' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
                  trend.direction === 'down' ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200' :
                  'bg-gray-50 text-gray-700 border border-gray-200'
                }`}>
                  <span className="text-2xl">
                    {trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️'}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">
                      {trend.direction === 'up' ? `+${trend.value}` : 
                       trend.direction === 'down' ? `-${trend.value}` : 
                       '0'}
                    </span>
                    {trend.percentage > 0 && (
                      <span className="text-xs opacity-75">{trend.percentage}%</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Graphique moderne */}
            <div className="relative h-64">
              {/* Grille de fond */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-xs text-gray-400 w-8 text-right mr-2">
                      {Math.round(maxValue * (1 - i / 4))}
                    </span>
                    <div className="flex-1 border-t border-gray-100" />
                  </div>
                ))}
              </div>
              
              {/* Barres */}
              <div className="absolute inset-0 flex items-end justify-between px-10">
                {last4WeeksData.map((week, index) => {
                  const height = maxValue > 0 ? (week.total / maxValue) * 100 : 0;
                  const isHovered = hoveredBar === index;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex-1 mx-2 flex flex-col items-center justify-end h-full"
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip au survol */}
                      {isHovered && (
                        <div className="absolute -top-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                          {week.total} tâches
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                        </div>
                      )}
                      
                      {/* Barre avec gradient */}
                      <div className="relative w-full">
                        <div 
                          className={`w-full rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                            week.isCurrent 
                              ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200' 
                              : 'bg-gradient-to-t from-gray-300 to-gray-200'
                          } ${isHovered ? 'transform -translate-y-1' : ''}`}
                          style={{ 
                            height: `${height * 2.2}px`,
                            minHeight: week.total > 0 ? '30px' : '0'
                          }}
                        >
                          {/* Effet de brillance */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                          
                          {/* Valeur dans la barre */}
                          {week.total > 0 && (
                            <div className="absolute inset-x-0 top-2 text-center">
                              <span className={`font-bold text-lg ${week.isCurrent ? 'text-white' : 'text-gray-700'}`}>
                                {week.total}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Labels des semaines */}
            <div className="flex justify-between px-10 mt-4">
              {last4WeeksData.map((week, index) => (
                <div key={index} className="flex-1 mx-2 text-center">
                  <span className={`text-sm font-medium ${
                    week.isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {week.shortLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Card statistiques rapides */}
          <div className="space-y-6">
            {/* Total de la semaine */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Cette semaine</span>
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-4xl font-bold mb-1">{currentWeekMetrics.total}</div>
              <div className="text-blue-100 text-sm">tâches complétées</div>
            </div>
            
            {/* Meilleure catégorie */}
            {Object.keys(currentWeekMetrics.byCategory).length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 font-medium">Top catégorie</span>
                  <span className="text-2xl">🏆</span>
                </div>
                {(() => {
                  const topCategory = Object.entries(currentWeekMetrics.byCategory)
                    .sort((a, b) => b[1].count - a[1].count)[0];
                  const style = getCategoryStyle(topCategory[0]);
                  
                  return (
                    <div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.light} ${style.text} font-medium`}>
                        {topCategory[0]}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {topCategory[1].count} tâches
                      </div>
                      <div className="text-gray-500 text-sm">{topCategory[1].percentage}% du total</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
        
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Répartition par domaine</h2>
          
          {Object.keys(currentWeekMetrics.byCategory).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(currentWeekMetrics.byCategory).map(([category, data]) => {
                const style = getCategoryStyle(category);
                
                return (
                  <div 
                    key={category} 
                    className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Cercle de progression */}
                    <div className="relative mx-auto w-20 h-20 mb-4">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-100"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="url(#gradient-${category})"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - data.percentage / 100)}`}
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id={`gradient-${category}`}>
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{data.count}</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-gray-900 mb-1">{category}</div>
                      <div className="text-sm text-gray-500">{data.percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg">Aucune donnée cette semaine</p>
              <p className="text-gray-400 mt-2">Complétez des tâches pour voir vos statistiques</p>
            </div>
          )}
        </div>
        
        {/* Message motivant moderne */}
        {currentWeekMetrics.total > 0 && trend && (
          <div className="mt-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-2xl" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center border border-gray-100">
              <p className="text-xl font-medium text-gray-800">
                {trend.direction === 'up' ? '🚀 Excellente progression ! Vous êtes sur la bonne voie.' :
                 trend.direction === 'down' ? '💪 Chaque semaine est une nouvelle opportunité. Continuez !' :
                 '⭐ Constance et régularité, la recette du succès !'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Animation CSS pour l'effet shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
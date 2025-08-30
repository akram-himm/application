import React, { useState } from 'react';

const TaskFilters = ({ filters, onFiltersChange, radars }) => {
  const [showFilters, setShowFilters] = useState(false);

  const priorities = [
    { value: 'Pas de panique', color: 'bg-sky-600' },
    { value: 'Important', color: 'bg-red-600' },
    { value: 'Très important', color: 'bg-violet-600' }
  ];

  const statuses = [
    { value: 'À faire', color: 'bg-gray-600' },
    { value: 'En cours', color: 'bg-blue-600' },
    { value: 'Terminé', color: 'bg-green-600' }
  ];

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters };
    
    if (type === 'priority') {
      newFilters.priority = filters.priority === value ? 'all' : value;
    } else if (type === 'status') {
      newFilters.status = filters.status === value ? 'all' : value;
    } else if (type === 'radar') {
      newFilters.radar = filters.radar === value ? 'all' : value;
      newFilters.subject = 'all'; // Reset subject when radar changes
    } else if (type === 'subject') {
      newFilters.subject = filters.subject === value ? 'all' : value;
    }
    
    onFiltersChange(newFilters);
  };

  const getSelectedRadar = () => {
    return radars.find(r => r.id === filters.radar);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
      >
        🔍 Filtres {showFilters ? '▲' : '▼'}
      </button>
      
      {showFilters && (
        <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
          {/* Filtre par priorité */}
          <div>
            <span className="text-sm font-medium text-gray-400 block mb-2">Priorité:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, priority: 'all'})}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filters.priority === 'all' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                Toutes
              </button>
              {priorities.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleFilterChange('priority', p.value)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filters.priority === p.value 
                      ? `${p.color} text-white` 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <span className="text-sm font-medium text-gray-400 block mb-2">Statut:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, status: 'all'})}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filters.status === 'all' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                Tous
              </button>
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleFilterChange('status', s.value)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filters.status === s.value 
                      ? `${s.color} text-white` 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {s.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par radar */}
          <div>
            <span className="text-sm font-medium text-gray-400 block mb-2">Radar:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, radar: 'all', subject: 'all'})}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filters.radar === 'all' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                Tous
              </button>
              {radars.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleFilterChange('radar', r.id)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filters.radar === r.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {r.icon} {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par matière (si un radar est sélectionné) */}
          {filters.radar !== 'all' && getSelectedRadar()?.subjects?.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-400 block mb-2">Matière:</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onFiltersChange({...filters, subject: 'all'})}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filters.subject === 'all' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  Toutes
                </button>
                {getSelectedRadar().subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleFilterChange('subject', s.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      filters.subject === s.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
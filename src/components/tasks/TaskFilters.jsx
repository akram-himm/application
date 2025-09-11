import React, { useState } from 'react';

const TaskFilters = ({ filters, onFiltersChange, radars }) => {
  const [showFilters, setShowFilters] = useState(false);

  const priorities = [
    { value: 'Pas de panique', color: '#94A3B8' },
    { value: 'Important', color: '#3B82F6' },
    { value: 'Très important', color: '#EF4444' }
  ];

  const statuses = [
    { value: 'À faire', color: '#FCD34D' },
    { value: 'En cours', color: '#3B82F6' },
    { value: 'Terminé', color: '#10B981' }
  ];

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters };
    
    if (type === 'priority') {
      newFilters.priority = filters.priority === value ? 'all' : value;
    } else if (type === 'status') {
      newFilters.status = filters.status === value ? 'all' : value;
    } else if (type === 'radar') {
      newFilters.radar = filters.radar === value ? 'all' : value;
      newFilters.subject = 'all';
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
        className="px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md text-sm text-gray-700 transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filtres
        {(filters.priority !== 'all' || filters.status !== 'all' || filters.radar !== 'all') && (
          <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
            {[filters.priority !== 'all', filters.status !== 'all', filters.radar !== 'all'].filter(Boolean).length}
          </span>
        )}
      </button>
      
      {showFilters && (
        <div className="mt-4 p-6 rounded-xl bg-white/70 backdrop-blur-md border border-gray-200/50 shadow-lg space-y-5">
          {/* Filtre par priorité */}
          <div>
            <span className="text-sm font-semibold text-gray-700 block mb-3">Priorité</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, priority: 'all'})}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                  filters.priority === 'all' 
                    ? 'bg-gray-800/90 text-white shadow-md' 
                    : 'bg-white/60 text-gray-600 border border-gray-200/50 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                Toutes
              </button>
              {priorities.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleFilterChange('priority', p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm hover:shadow-md ${
                    filters.priority === p.value ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{
                    backgroundColor: filters.priority === p.value 
                      ? p.color 
                      : `${p.color}20`,
                    borderWidth: '1px',
                    borderColor: `${p.color}50`
                  }}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <span className="text-sm font-semibold text-gray-700 block mb-3">Statut</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, status: 'all'})}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                  filters.status === 'all' 
                    ? 'bg-gray-800/90 text-white shadow-md' 
                    : 'bg-white/60 text-gray-600 border border-gray-200/50 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                Tous
              </button>
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleFilterChange('status', s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm hover:shadow-md ${
                    filters.status === s.value ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{
                    backgroundColor: filters.status === s.value 
                      ? s.color 
                      : `${s.color}20`,
                    borderWidth: '1px',
                    borderColor: `${s.color}50`
                  }}
                >
                  {s.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par radar */}
          <div>
            <span className="text-sm font-semibold text-gray-700 block mb-3">Radar</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, radar: 'all', subject: 'all'})}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                  filters.radar === 'all' 
                    ? 'bg-gray-800/90 text-white shadow-md' 
                    : 'bg-white/60 text-gray-600 border border-gray-200/50 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                Tous
              </button>
              {radars.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleFilterChange('radar', r.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm hover:shadow-md ${
                    filters.radar === r.id 
                      ? 'bg-blue-500/90 text-white' 
                      : 'bg-blue-500/10 text-gray-700 border border-blue-500/30'
                  }`}
                >
                  {r.icon} {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par matière */}
          {filters.radar !== 'all' && getSelectedRadar()?.subjects?.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-700 block mb-3">Matière</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onFiltersChange({...filters, subject: 'all'})}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                    filters.subject === 'all' 
                      ? 'bg-gray-800/90 text-white shadow-md' 
                      : 'bg-white/60 text-gray-600 border border-gray-200/50 hover:bg-white/80 hover:shadow-sm'
                  }`}
                >
                  Toutes
                </button>
                {getSelectedRadar().subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleFilterChange('subject', s.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm shadow-sm hover:shadow-md ${
                      filters.subject === s.id 
                        ? 'bg-purple-500/90 text-white' 
                        : 'bg-purple-500/10 text-gray-700 border border-purple-500/30'
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
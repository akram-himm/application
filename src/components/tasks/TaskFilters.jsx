import React, { useState } from 'react';

const TaskFilters = ({ filters, onFiltersChange, radars }) => {
  const [showFilters, setShowFilters] = useState(false);

  const priorities = [
    { value: 'Pas de panique', color: '#9CA3AF' },
    { value: 'Important', color: '#3B82F6' },
    { value: 'Très important', color: '#EF4444' }
  ];

  const statuses = [
    { value: 'À faire', color: '#6B7280' },
    { value: 'En cours', color: '#3B82F6' },
    { value: 'Terminé', color: '#6B7280' }
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
        className="px-3 py-1.5 rounded-full bg-white/70 border border-gray-200 shadow-sm hover:shadow text-sm text-gray-700 transition-all"
      >
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
        Filtres
      </button>
      
      {showFilters && (
        <div className="space-y-4 p-6 bg-white/70 ring-1 ring-gray-200 rounded-2xl shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] mt-4">
          {/* Filtre par priorité */}
          <div>
            <span className="text-sm font-medium text-[#6B7280] block mb-2">Priorité :</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, priority: 'all'})}
                className={`px-3 py-1 rounded-full border text-sm transition-all ${
                  filters.priority === 'all' 
                    ? 'bg-[#1E1F22]/90 text-white border-[#1E1F22]' 
                    : 'bg-white border-[#E4E7EB] text-[#6B7280] hover:bg-[#EFF2F6]'
                }`}
              >
                Toutes
              </button>
              {priorities.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleFilterChange('priority', p.value)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all`}
                  style={{
                    backgroundColor: filters.priority === p.value ? p.color : '#FFFFFF',
                    color: filters.priority === p.value ? 'white' : '#6B7280',
                    borderColor: filters.priority === p.value ? p.color : '#E4E7EB'
                  }}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <span className="text-sm font-medium text-[#6B7280] block mb-2">Statut :</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, status: 'all'})}
                className={`px-3 py-1 rounded-full border text-sm transition-all ${
                  filters.status === 'all' 
                    ? 'bg-[#1E1F22]/90 text-white border-[#1E1F22]' 
                    : 'bg-white border-[#E4E7EB] text-[#6B7280] hover:bg-[#EFF2F6]'
                }`}
              >
                Tous
              </button>
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => handleFilterChange('status', s.value)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all`}
                  style={{
                    backgroundColor: filters.status === s.value ? s.color : '#FFFFFF',
                    color: filters.status === s.value ? 'white' : '#6B7280',
                    borderColor: filters.status === s.value ? s.color : '#E4E7EB'
                  }}
                >
                  {s.value}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par radar */}
          <div>
            <span className="text-sm font-medium text-[#6B7280] block mb-2">Radar :</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onFiltersChange({...filters, radar: 'all', subject: 'all'})}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  filters.radar === 'all' 
                    ? 'bg-[#1E1F22]/90 text-white border border-[#1E1F22]' 
                    : 'bg-white/70 text-[#6B7280] border border-gray-200 hover:bg-white/90'
                }`}
              >
                Tous
              </button>
              {radars.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleFilterChange('radar', r.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    filters.radar === r.id 
                      ? 'bg-blue-500 text-white border border-blue-500' 
                      : 'bg-white/70 text-[#6B7280] border border-gray-200 hover:bg-white/90'
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
              <span className="text-sm font-medium text-[#6B7280] block mb-2">Matière :</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onFiltersChange({...filters, subject: 'all'})}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    filters.subject === 'all' 
                      ? 'bg-[#1E1F22]/90 text-white border border-[#1E1F22]' 
                      : 'bg-white/70 text-[#6B7280] border border-gray-200 hover:bg-white/90'
                  }`}
                >
                  Toutes
                </button>
                {getSelectedRadar().subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleFilterChange('subject', s.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      filters.subject === s.id 
                        ? 'bg-blue-500 text-white border border-blue-500' 
                        : 'bg-white/70 text-[#6B7280] border border-gray-200 hover:bg-white/90'
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
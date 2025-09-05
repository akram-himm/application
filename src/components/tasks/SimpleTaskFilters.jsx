import React, { useState } from 'react';
import Card from '../ui/Card';

const SimpleTaskFilters = ({ filters, onFiltersChange, radars, onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

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

  const hasActiveFilters = () => {
    return filters.priority !== 'all' || 
           filters.status !== 'all' || 
           filters.radar !== 'all' || 
           filters.subject !== 'all';
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Barre de recherche et bouton filtres */}
      <div className="flex gap-3">
        {/* Recherche simple */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 16 16" 
            fill="currentColor"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </div>

        {/* Bouton Filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-1.5 rounded-full border shadow-sm hover:shadow text-sm transition-all ${
            hasActiveFilters() 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'bg-white/70 border-gray-200 text-gray-700'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Filtres
          {hasActiveFilters() && (
            <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {[
                filters.priority !== 'all',
                filters.status !== 'all',
                filters.radar !== 'all',
                filters.subject !== 'all'
              ].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>
      
      {/* Filtres */}
      {showFilters && (
        <Card className="space-y-4">
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

          {/* Filtre par matière */}
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
        </Card>
      )}
    </div>
  );
};

export default SimpleTaskFilters;
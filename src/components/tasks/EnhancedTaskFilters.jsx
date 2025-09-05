import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';

const EnhancedTaskFilters = ({ 
  filters, 
  onFiltersChange, 
  radars, 
  totalTasks, 
  filteredTasksCount 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order'); // order, name, date, priority

  const priorities = [
    { value: 'Pas de panique', color: '#9CA3AF', order: 1 },
    { value: 'Important', color: '#3B82F6', order: 2 },
    { value: 'Très important', color: '#EF4444', order: 3 }
  ];

  const statuses = [
    { value: 'À faire', color: '#FBB924' },
    { value: 'En cours', color: '#3B82F6' },
    { value: 'Terminé', color: '#22C55E' }
  ];

  const dateFilters = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'tomorrow', label: 'Demain' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'overdue', label: 'En retard' },
    { value: 'no-date', label: 'Sans date' }
  ];

  const sortOptions = [
    { value: 'order', label: 'Ordre manuel' },
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'name-desc', label: 'Nom (Z-A)' },
    { value: 'date', label: 'Date (proche)' },
    { value: 'date-desc', label: 'Date (lointaine)' },
    { value: 'priority', label: 'Priorité (haute)' },
    { value: 'priority-desc', label: 'Priorité (basse)' },
    { value: 'status', label: 'Statut' }
  ];

  // Mettre à jour les filtres avec recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: searchTerm,
        dateFilter,
        sortBy
      });
    }, 300); // Debounce de 300ms pour la recherche

    return () => clearTimeout(timer);
  }, [searchTerm, dateFilter, sortBy]);

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setSortBy('order');
    onFiltersChange({
      priority: 'all',
      status: 'all',
      radar: 'all',
      subject: 'all',
      search: '',
      dateFilter: 'all',
      sortBy: 'order'
    });
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || 
           dateFilter !== 'all' || 
           sortBy !== 'order' ||
           filters.priority !== 'all' || 
           filters.status !== 'all' || 
           filters.radar !== 'all' || 
           filters.subject !== 'all';
  };

  const getSelectedRadar = () => {
    return radars.find(r => r.id === filters.radar);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Barre de recherche et boutons principaux */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Recherche */}
        <div className="flex-1 min-w-[300px] relative">
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 16 16" 
            fill="currentColor"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Filtre par date */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {dateFilters.map(df => (
            <option key={df.value} value={df.value} className="text-gray-900">{df.label}</option>
          ))}
        </select>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option disabled className="text-gray-500">Trier par...</option>
          {sortOptions.map(so => (
            <option key={so.value} value={so.value} className="text-gray-900">{so.label}</option>
          ))}
        </select>

        {/* Bouton Filtres avancés */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg bg-white/70 border border-gray-200 shadow-sm hover:shadow text-sm font-medium transition-all ${
            hasActiveFilters() ? 'text-blue-600 border-blue-300' : 'text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75zm3 5A.75.75 0 0 1 4.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 7.75zm0 5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75z"/>
            </svg>
            Filtres
            {hasActiveFilters() && (
              <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {[
                  searchTerm !== '',
                  dateFilter !== 'all',
                  sortBy !== 'order',
                  filters.priority !== 'all',
                  filters.status !== 'all',
                  filters.radar !== 'all',
                  filters.subject !== 'all'
                ].filter(Boolean).length}
              </span>
            )}
          </span>
        </button>

        {/* Effacer tous les filtres */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Effacer tout
          </button>
        )}

        {/* Compteur de résultats */}
        {filteredTasksCount !== undefined && (
          <div className="text-sm text-gray-600">
            {filteredTasksCount === totalTasks ? (
              <span>{totalTasks} tâche{totalTasks > 1 ? 's' : ''}</span>
            ) : (
              <span>
                {filteredTasksCount} / {totalTasks} tâche{totalTasks > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filtres avancés */}
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

export default EnhancedTaskFilters;
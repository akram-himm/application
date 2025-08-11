import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, tableType, radars, customStatuses, customPriorities, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    priority: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    time: '',
    assignee: '',
    tag: null
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        status: task.status || customStatuses[0]?.id || '',
        priority: task.priority || customPriorities[0]?.id || '',
        date: task.date || new Date().toISOString().split('T')[0],
        endDate: task.endDate || '',
        time: task.time || '',
        assignee: task.assignee || '',
        tag: task.tag || null
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: customStatuses[0]?.id || '',
        priority: customPriorities[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        endDate: '',
        time: '',
        assignee: '',
        tag: null
      });
    }
  }, [task, customStatuses, customPriorities]);

  // Gestion de l'autocomplete
  const handleNameChange = (value) => {
    setFormData({ ...formData, name: value });
    
    if (value.length > 0) {
      const suggestions = [];
      
      // Rechercher dans les radars et matières
      radars.forEach(radar => {
        if (radar.name.toLowerCase().includes(value.toLowerCase())) {
          suggestions.push({
            type: 'radar',
            id: radar.id,
            name: radar.name,
            icon: radar.icon,
            radar: radar
          });
        }
        
        radar.subjects?.forEach(subject => {
          if (subject.name.toLowerCase().includes(value.toLowerCase())) {
            suggestions.push({
              type: 'subject',
              id: subject.id,
              name: subject.name,
              path: `${radar.name} > ${subject.name}`,
              radar: radar,
              subject: subject
            });
          }
        });
      });
      
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'radar') {
      setFormData({
        ...formData,
        name: suggestion.name,
        tag: {
          type: 'radar',
          radarId: suggestion.radar.id,
          radarName: suggestion.radar.name
        }
      });
    } else if (suggestion.type === 'subject') {
      setFormData({
        ...formData,
        name: suggestion.name,
        tag: {
          type: 'subject',
          radarId: suggestion.radar.id,
          radarName: suggestion.radar.name,
          subjectId: suggestion.subject.id,
          path: suggestion.path
        }
      });
    }
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pas de validation bloquante - on sauve directement
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 w-full max-w-[500px] shadow-2xl">
        <h2 className="text-xl font-semibold text-white/81 mb-5">
          {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Nom de la tâche
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (formData.name.length > 0) {
                  handleNameChange(formData.name);
                }
              }}
              placeholder="Ex: Réviser le chapitre 3 ou tapez 'bac' pour suggestions"
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150"
              autoFocus
            />
            
            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}-${index}`}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-white/[0.055] transition-colors flex items-center gap-2"
                  >
                    {suggestion.type === 'radar' && (
                      <>
                        <span className="text-lg">{suggestion.icon}</span>
                        <span className="text-white/81">{suggestion.name}</span>
                        <span className="text-xs text-white/46 ml-auto">Radar</span>
                      </>
                    )}
                    {suggestion.type === 'subject' && (
                      <>
                        <span className="text-white/81">{suggestion.name}</span>
                        <span className="text-xs text-white/46 ml-auto">{suggestion.path}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Affichage du tag sélectionné */}
          {formData.tag && (
            <div className="mb-4 px-3 py-2 bg-white/[0.055] rounded-md flex items-center justify-between">
              <span className="text-sm text-white/60">
                Lié à : {formData.tag.type === 'radar' ? formData.tag.radarName : formData.tag.path}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tag: null })}
                className="text-white/30 hover:text-white/60"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-white/46 text-sm font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Détails de la tâche..."
              className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 placeholder-white/46 focus:outline-none focus:border-white/20 transition-all duration-150 resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-white/46 text-sm font-medium">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
              >
                {customStatuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-white/46 text-sm font-medium">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
              >
                {customPriorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-white/46 text-sm font-medium">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
              />
            </div>
            
            {tableType === 'weekly' && (
              <div>
                <label className="block mb-2 text-white/46 text-sm font-medium">
                  Date limite
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
                />
              </div>
            )}
            
            {tableType === 'daily' && (
              <div>
                <label className="block mb-2 text-white/46 text-sm font-medium">
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 focus:outline-none focus:border-white/20 transition-all duration-150"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.055] text-white/46 border border-white/[0.094] rounded-md text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-md text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150"
            >
              {task ? 'Sauvegarder' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
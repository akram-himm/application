import React, { useState, useEffect, useRef } from 'react';

const TaskAutocomplete = ({ 
  value, 
  onChange, 
  onSubmit,
  radars,
  placeholder 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // -1 = aucune sélection
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Générer les suggestions basées sur l'entrée
  const generateSuggestions = (input) => {
    if (!input || input.trim() === '') {
      return [];
    }

    const searchTerm = input.toLowerCase();
    const results = [];

    // Chercher dans les radars et matières
    radars.forEach(radar => {
      // Si le nom du radar contient le terme de recherche
      if (radar.name.toLowerCase().includes(searchTerm)) {
        // Ajouter le radar seul
        results.push({
          type: 'radar',
          label: `${radar.icon} ${radar.name}`,
          value: input,
          taskName: input,
          radarId: radar.id,
          radarName: radar.name
        });
      }

      // Chercher dans les matières
      radar.subjects?.forEach(subject => {
        if (subject.name.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'subject',
            label: `${radar.icon} ${radar.name} › ${subject.name}`,
            value: input,
            taskName: input,
            radarId: radar.id,
            radarName: radar.name,
            subjectId: subject.id,
            subjectName: subject.name
          });
        }
      });

      // Si le texte entier correspond à un radar ou matière, suggérer aussi
      if (input.toLowerCase().includes(radar.name.toLowerCase())) {
        // Suggérer les matières de ce radar
        radar.subjects?.forEach(subject => {
          if (!results.some(r => r.subjectId === subject.id)) {
            results.push({
              type: 'subject',
              label: `${radar.icon} ${radar.name} › ${subject.name}`,
              value: input,
              taskName: input,
              radarId: radar.id,
              radarName: radar.name,
              subjectId: subject.id,
              subjectName: subject.name
            });
          }
        });
      }
    });

    return results.slice(0, 6); // Limiter à 6 suggestions
  };

  // Mettre à jour les suggestions quand l'input change
  useEffect(() => {
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.trim().length > 0);
    setSelectedIndex(-1); // Reset la sélection
  }, [value, radars]);

  // Gérer la sélection d'une suggestion
  const handleSelectSuggestion = (suggestion) => {
    // Créer l'objet tâche avec les infos radar/matière
    const taskData = {
      name: suggestion.taskName,
      radar: suggestion.radarId || null,
      radarName: suggestion.radarName || null,
      subject: suggestion.subjectId || null,
      subjectName: suggestion.subjectName || null
    };

    onChange(''); // Réinitialiser l'input
    onSubmit(taskData);
    setShowSuggestions(false);
  };

  // Gérer le clavier
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        // Soumettre sans tag
        onSubmit({ name: value.trim() });
        onChange('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          if (prev < suggestions.length - 1) return prev + 1;
          return prev;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          if (prev > -1) return prev - 1;
          return -1;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          // Une suggestion est sélectionnée
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else if (value.trim()) {
          // Aucune sélection, soumettre sans tag
          onSubmit({ name: value.trim() });
          onChange('');
          setShowSuggestions(false);
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Fermer les suggestions au clic dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-gray-600 placeholder-gray-500 outline-none focus:text-gray-900"
        autoComplete="off"
      />
      
      {/* Liste des suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute bottom-full left-0 w-full mb-1 bg-white border border-gray-200 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] overflow-hidden z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`
                px-3 py-2.5 cursor-pointer transition-all
                ${index === selectedIndex 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{suggestion.label}</span>
                {suggestion.type === 'none' && (
                  <span className="text-xs text-gray-500">Sans tag</span>
                )}
                {suggestion.type === 'radar' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">Radar</span>
                )}
                {suggestion.type === 'subject' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-500 rounded">Matière</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskAutocomplete;
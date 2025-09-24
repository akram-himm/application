import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import * as pageService from '../services/pageService';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { tasks, radars } = useContext(AppContext);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Recherche dans les pages fixes
    const fixedPages = [
      { id: 'dashboard', name: 'Tableau de bord', path: '/', icon: '📊', type: 'page' },
      { id: 'improvements', name: 'Progression', path: '/improvements', icon: '📈', type: 'page' },
      { id: 'todo', name: 'To do', path: '/plan', icon: '✅', type: 'page' },
      { id: 'calendar', name: 'Calendrier', path: '/calendar', icon: '📅', type: 'page' },
      { id: 'notes', name: 'Notes', path: '/notes', icon: '📝', type: 'page' },
      { id: 'trash', name: 'Corbeille', path: '/trash', icon: '🗑️', type: 'page' },
      { id: 'settings', name: 'Paramètres', path: '/settings', icon: '⚙️', type: 'page' }
    ];

    fixedPages.forEach(page => {
      if (page.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          ...page,
          match: 'title'
        });
      }
    });

    // Recherche dans les pages personnalisées
    const customPages = pageService.getAllPages().filter(p => !p.fixed);
    customPages.forEach(page => {
      if (page.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          ...page,
          type: 'page',
          match: 'title'
        });
      }
    });

    // Recherche dans les radars
    radars.forEach(radar => {
      if (radar.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: radar.id,
          name: radar.name,
          path: `/radar/${radar.id}`,
          icon: '🎯',
          type: 'radar',
          match: 'title'
        });
      }

      // Recherche dans les sujets des radars
      if (radar.subjects) {
        radar.subjects.forEach(subject => {
          if (subject.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: subject.id,
              name: `${radar.name} › ${subject.name}`,
              path: `/radar/${radar.id}/subject/${subject.id}`,
              icon: '📖',
              type: 'subject',
              match: 'title'
            });
          }
        });
      }
    });

    // Recherche dans les tâches
    tasks.forEach(task => {
      if (task.name && task.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: task.id,
          name: task.name,
          path: '/plan',
          icon: '📋',
          type: 'task',
          match: 'content',
          description: task.description || ''
        });
      } else if (task.description && task.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: task.id,
          name: task.name || 'Tâche sans nom',
          path: '/plan',
          icon: '📋',
          type: 'task',
          match: 'content',
          description: task.description
        });
      }
    });

    // Limiter à 20 résultats
    setSearchResults(results.slice(0, 20));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(searchResults[selectedIndex]);
    }
  };

  const handleResultClick = (result) => {
    navigate(result.path);
    onClose();
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'page':
        return 'Page';
      case 'radar':
        return 'Radar';
      case 'subject':
        return 'Sujet';
      case 'task':
        return 'Tâche';
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 z-[2000] flex items-start justify-center pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-[600px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher dans les pages, radars, tâches..."
              className="w-full pl-10 pr-4 py-2 text-lg text-gray-700 placeholder-gray-400 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-sm">Aucun résultat pour "{searchQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          )}

          {searchResults.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 flex items-start gap-3 transition-all duration-20 border-l-2 ${
                index === selectedIndex
                  ? 'bg-gray-50 border-l-blue-500'
                  : 'hover:bg-gray-50 border-l-transparent'
              }`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{result.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{result.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {getTypeLabel(result.type)}
                  </span>
                </div>
                {result.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {result.description}
                  </p>
                )}
              </div>
              {index === selectedIndex && (
                <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  ↵
                </kbd>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="p-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd>
                ouvrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">esc</kbd>
                fermer
              </span>
            </div>
            <span>{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
import React, { useState, useEffect, useRef } from 'react';

const COMMANDS = [
  // Texte
  { type: 'text', label: 'Texte', icon: '📝', shortcut: 'text', description: 'Paragraphe simple' },
  { type: 'heading1', label: 'Titre 1', icon: 'H1', shortcut: 'h1', description: 'Gros titre' },
  { type: 'heading2', label: 'Titre 2', icon: 'H2', shortcut: 'h2', description: 'Titre moyen' },
  { type: 'heading3', label: 'Titre 3', icon: 'H3', shortcut: 'h3', description: 'Petit titre' },

  // Listes
  { type: 'bullet', label: 'Liste à puces', icon: '•', shortcut: 'bullet', description: 'Liste simple' },
  { type: 'numbered', label: 'Liste numérotée', icon: '1.', shortcut: 'number', description: 'Liste ordonnée' },
  { type: 'todo', label: 'To-do', icon: '☐', shortcut: 'todo', description: 'Case à cocher' },

  // Blocs spéciaux
  { type: 'toggle', label: 'Toggle', icon: '▶', shortcut: 'toggle', description: 'Section repliable' },
  { type: 'quote', label: 'Citation', icon: '"', shortcut: 'quote', description: 'Bloc de citation' },
  { type: 'divider', label: 'Séparateur', icon: '—', shortcut: 'divider', description: 'Ligne horizontale' },
  { type: 'callout', label: 'Callout', icon: '💡', shortcut: 'callout', description: 'Boîte colorée',
    properties: { emoji: '💡', type: 'info' } },
  { type: 'code', label: 'Code', icon: '</>', shortcut: 'code', description: 'Bloc de code' }
];

const SlashMenu = ({ position, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Focus sur l'input au montage
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filtrer les commandes
  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filtered = COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.shortcut.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower)
    );
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [search]);

  // Gérer le clavier
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        onClose();
        break;

      default:
        break;
    }
  };

  // Fermer au clic dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Calculer la position pour éviter le débordement
  const menuStyle = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 50
  };

  // Ajuster si le menu dépasse
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${position.y - rect.height}px`;
      }
      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${position.x - rect.width}px`;
      }
    }
  }, [position]);

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 overflow-hidden flex flex-col"
    >
      {/* Barre de recherche */}
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher une commande..."
          className="w-full px-3 py-1.5 text-sm bg-gray-50 rounded-md outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste des commandes */}
      <div className="overflow-y-auto flex-1">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((cmd, index) => (
            <button
              key={cmd.type}
              onClick={() => onSelect(cmd)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-gray-50' : ''
              }`}
            >
              {/* Icône */}
              <div className="w-8 h-8 flex items-center justify-center text-lg">
                {cmd.icon.length > 2 ? (
                  <span className="text-sm font-mono text-gray-500">{cmd.icon}</span>
                ) : (
                  <span>{cmd.icon}</span>
                )}
              </div>

              {/* Texte */}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">{cmd.label}</div>
                <div className="text-xs text-gray-500">{cmd.description}</div>
              </div>

              {/* Raccourci */}
              <div className="text-xs text-gray-400 font-mono">
                /{cmd.shortcut}
              </div>
            </button>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            Aucune commande trouvée
          </div>
        )}
      </div>

      {/* Footer avec aide */}
      <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↑↓</kbd> Naviguer
        </span>
        <span className="inline-flex items-center gap-1 ml-3">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">↵</kbd> Sélectionner
        </span>
        <span className="inline-flex items-center gap-1 ml-3">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">ESC</kbd> Fermer
        </span>
      </div>
    </div>
  );
};

export default SlashMenu;
import React, { useState, useEffect } from 'react';

const SlashMenu = ({ position, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const commands = [
    // Blocs Basiques
    { icon: 'Aa', label: 'Text', type: 'text', shortcut: 'Just start typing', category: 'basic' },
    { icon: 'H1', label: 'Heading 1', type: 'heading1', shortcut: '# + space', category: 'basic' },
    { icon: 'H2', label: 'Heading 2', type: 'heading2', shortcut: '## + space', category: 'basic' },
    { icon: 'H3', label: 'Heading 3', type: 'heading3', shortcut: '### + space', category: 'basic' },

    // Listes
    { icon: '•', label: 'Bulleted list', type: 'bullet_list', shortcut: '- + space', category: 'list' },
    { icon: '1.', label: 'Numbered list', type: 'numbered_list', shortcut: '1. + space', category: 'list' },
    { icon: '☐', label: 'To-do list', type: 'todo', shortcut: '[] + space', category: 'list' },
    { icon: '▶', label: 'Toggle list', type: 'toggle', shortcut: '> + space', category: 'list' },

    // Blocs Avancés
    { icon: '"', label: 'Quote', type: 'quote', shortcut: '" + space', category: 'advanced' },
    { icon: '—', label: 'Divider', type: 'divider', shortcut: '---', category: 'advanced' },
    { icon: '💡', label: 'Callout', type: 'callout', shortcut: '', category: 'advanced' },
    { icon: '</>', label: 'Code', type: 'code', shortcut: '```', category: 'advanced' },
  ];

  const filteredCommands = searchTerm
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  // Grouper les commandes par catégorie
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <div
      className="slash-menu"
      style={{
        left: position.x + 'px',
        top: position.y + 'px'
      }}
    >
      {Object.entries(groupedCommands).map(([category, cmds]) => (
        <div key={category}>
          <div className="slash-menu-header">
            {category.toUpperCase().replace('_', ' ')}
          </div>
          <div className="slash-menu-items">
            {cmds.map((cmd, index) => {
              const globalIndex = filteredCommands.indexOf(cmd);
              return (
                <button
                  key={cmd.type}
                  className={`slash-menu-item ${
                    globalIndex === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => onSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                >
                  <span className="item-icon">{cmd.icon}</span>
                  <span className="item-label">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="item-shortcut">{cmd.shortcut}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlashMenu;
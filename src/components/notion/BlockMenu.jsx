import React, { useRef, useEffect } from 'react';

const BLOCK_TYPES = [
  { type: 'text', label: 'Texte', icon: '📝' },
  { type: 'heading1', label: 'Titre 1', icon: 'H1' },
  { type: 'heading2', label: 'Titre 2', icon: 'H2' },
  { type: 'heading3', label: 'Titre 3', icon: 'H3' },
  { type: 'bullet', label: 'Liste à puces', icon: '•' },
  { type: 'numbered', label: 'Liste numérotée', icon: '1.' },
  { type: 'todo', label: 'To-do', icon: '☐' },
  { type: 'toggle', label: 'Toggle', icon: '▶' },
  { type: 'quote', label: 'Citation', icon: '"' },
  { type: 'code', label: 'Code', icon: '</>' },
  { type: 'callout', label: 'Callout', icon: '💡' }
];

const BlockMenu = ({ blockId, blockType, onDelete, onDuplicate, onTransform, onClose }) => {
  const menuRef = useRef(null);

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

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-50 overflow-hidden"
    >
      {/* Actions rapides */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => {
            onDuplicate(blockId);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Dupliquer
        </button>

        <button
          onClick={() => {
            onDelete(blockId);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer
        </button>
      </div>

      {/* Transformer en */}
      <div className="p-1">
        <div className="px-2 py-1 text-xs text-gray-500 font-medium">Transformer en</div>
        <div className="max-h-48 overflow-y-auto">
          {BLOCK_TYPES.filter(t => t.type !== blockType).map(type => (
            <button
              key={type.type}
              onClick={() => {
                onTransform(blockId, type.type);
                onClose();
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-6 text-center">
                {type.icon.length > 2 ? (
                  <span className="text-xs font-mono text-gray-500">{type.icon}</span>
                ) : (
                  type.icon
                )}
              </span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlockMenu;
import React, { useState } from 'react';

const NewPageModal = ({ isOpen, onClose, onCreate }) => {
  const [pageName, setPageName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📄');

  // Emojis suggérés (comme Notion)
  const suggestedEmojis = ['📄', '📝', '📋', '📊', '💡', '🎯', '📚', '✨', '🎨', '🚀', '💼', '📌'];

  const handleCreate = () => {
    if (pageName.trim()) {
      const newPage = {
        id: Date.now().toString(),
        name: pageName,
        icon: selectedEmoji,
        content: { blocks: [] }, // Contenu BlockNote vide
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: `/page/${pageName.toLowerCase().replace(/\s+/g, '-')}`
      };
      onCreate(newPage);
      setPageName('');
      setSelectedEmoji('📄');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[400px] p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Sélection d'emoji */}
        <div className="mb-4">
          <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 block">
            Icône
          </label>
          <div className="grid grid-cols-6 gap-2">
            {suggestedEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-10 h-10 rounded hover:bg-gray-100 flex items-center justify-center text-xl transition-all duration-20 ${
                  selectedEmoji === emoji ? 'bg-gray-100 ring-2 ring-gray-300' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Nom de la page */}
        <div className="mb-6">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Sans titre"
            className="w-full text-2xl font-light text-gray-800 border-none outline-none placeholder-gray-400"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pageName.trim()) {
                handleCreate();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-all duration-20"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!pageName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-20"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPageModal;
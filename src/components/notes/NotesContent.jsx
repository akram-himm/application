import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import BlockNoteEditor from '../BlockNoteEditor/BlockNoteEditor';
import { getIcon } from '../icons/SvgIcons';

const NotesContent = () => {
  const { notes, saveNote, deleteNote, createNote } = useContext(AppContext);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categories, setCategories] = useState(['Tous', 'Idées', 'Tâches', 'Projets', 'Notes', 'Archive']);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extractTextFromBlocks(note.content).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [notes, selectedCategory, searchQuery]);

  const extractTextFromBlocks = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return '';

    const lines = [];

    blocks.forEach((block) => {
      if (block.content) {
        if (Array.isArray(block.content)) {
          const lineText = block.content
            .map(item => item.text || '')
            .join('')
            .trim();
          if (lineText) lines.push(lineText);
        } else if (typeof block.content === 'string') {
          const trimmed = block.content.trim();
          if (trimmed) lines.push(trimmed);
        }
      }
    });

    return lines.join("\n");
  };

  const handleCreateNote = () => {
    const newNote = createNote();
    setSelectedNote(newNote);
  };

  const handleSaveNote = (content) => {
    if (selectedNote) {
      saveNote(selectedNote.id, {
        ...selectedNote,
        content,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  if (selectedNote) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            {getIcon('arrow-left', 'w-5 h-5')}
            <span>Retour</span>
          </button>
          <button
            onClick={() => handleDeleteNote(selectedNote.id)}
            className="text-red-500 hover:text-red-700"
          >
            {getIcon('delete', 'w-5 h-5')}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <BlockNoteEditor
            initialContent={selectedNote.content}
            onChange={handleSaveNote}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      {/* Barre de recherche et filtres */}
      <div className="mb-6">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              {getIcon('search', 'w-5 h-5')}
            </span>
          </div>
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            {getIcon('plus', 'w-5 h-5')}
            <span>Nouvelle note</span>
          </button>
        </div>

        {/* Catégories */}
        <div className="flex gap-2 items-center flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
          {showNewCategory ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Nouvelle catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
                autoFocus
              />
              <button onClick={handleAddCategory} className="text-green-500 hover:text-green-600">
                {getIcon('check', 'w-4 h-4')}
              </button>
              <button onClick={() => setShowNewCategory(false)} className="text-red-500 hover:text-red-600">
                {getIcon('close', 'w-4 h-4')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              + Catégorie
            </button>
          )}
        </div>
      </div>

      {/* Grille de notes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredNotes.map(note => {
          const preview = extractTextFromBlocks(note.content);
          const lines = preview.split('\n');
          const firstLine = lines[0] || 'Note vide';
          const remainingLines = lines.slice(1, 4).join('\n');

          return (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="aspect-square bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col border border-gray-200"
            >
              <div className="flex justify-center mb-3">
                <span className="text-3xl">
                  {getIcon(note.icon || 'note', 'w-8 h-8 text-gray-600')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-2 line-clamp-1">
                {firstLine}
              </h3>
              <p className="text-sm text-gray-600 text-center line-clamp-3 flex-1">
                {remainingLines}
              </p>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucune note trouvée</p>
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Créer une note
          </button>
        </div>
      )}
    </div>
  );
};

NotesContent.displayName = 'Notes';
NotesContent.icon = 'note';
NotesContent.description = 'Gestionnaire de notes';

export default NotesContent;
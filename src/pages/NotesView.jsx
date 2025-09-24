import React, { useState, useEffect } from "react";
import { Plus, FileText, X } from "lucide-react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUndoRedo } from '../contexts/UndoRedoContext';

// Formater la date simplifié
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Si c'est aujourd'hui
  if (date.toDateString() === today.toDateString()) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Today ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // Si c'est hier
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Sinon afficher la date courte
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Extraire le texte du contenu BlockNote avec sauts de ligne
const extractTextFromBlocks = (blocks) => {
  if (!blocks || !Array.isArray(blocks)) return "";

  let lines = [];
  for (const block of blocks) {
    let blockText = "";
    if (block.content) {
      if (typeof block.content === 'string') {
        blockText = block.content;
      } else if (Array.isArray(block.content)) {
        for (const item of block.content) {
          if (item.text) {
            blockText += item.text;
          }
        }
      }
    }
    if (blockText) lines.push(blockText);
  }
  return lines.join("\n");
};

// Icônes SVG disponibles
const iconsList = {
  document: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
  ),
  book: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M18,22A2,2 0 0,0 20,20V4C20,2.89 19.1,2 18,2H12V9L9.5,7.5L7,9V2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18Z"/>
    </svg>
  ),
  note: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M14,10V4.5L19.5,10M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V9L15,3H5Z"/>
    </svg>
  ),
  folder: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
    </svg>
  ),
  star: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
    </svg>
  ),
  check: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
    </svg>
  ),
  lightbulb: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
    </svg>
  ),
  heart: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
    </svg>
  ),
  rocket: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.81,14.12L5.64,11.29L8.17,10.79C11.39,6.41 17.55,4.22 19.78,4.22C19.78,6.45 17.59,12.61 13.21,15.83L12.71,18.36L9.88,21.19L9.17,17.66C7.76,17.66 7.76,17.66 7.05,16.95C6.34,16.24 6.34,16.24 6.34,14.83L2.81,14.12M5.64,16.95L7.05,18.36L4.39,21.03H2.97V19.61L5.64,16.95M4.22,15.54L5.46,15.71L3,18.16V16.74L4.22,15.54M8.29,18.54L8.46,19.78L7.26,21H5.84L8.29,18.54M13,9.5A1.5,1.5 0 0,0 11.5,11A1.5,1.5 0 0,0 13,12.5A1.5,1.5 0 0,0 14.5,11A1.5,1.5 0 0,0 13,9.5Z"/>
    </svg>
  ),
  bell: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,22A2,2 0 0,0 14,20H10A2,2 0 0,0 12,22M18,16V11C18,7.93 16.36,5.36 13.5,4.68V4A1.5,1.5 0 0,0 12,2.5A1.5,1.5 0 0,0 10.5,4V4.68C7.63,5.36 6,7.92 6,11V16L4,18V19H20V18L18,16Z"/>
    </svg>
  ),
  pin: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
    </svg>
  ),
  flag: (
    <svg fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z"/>
    </svg>
  )
};

// Carré de note avec icône
const NoteSquare = ({ note, onClick }) => {
  const previewText = extractTextFromBlocks(note.content?.blocks);
  const IconComponent = iconsList[note.iconType] || iconsList.document;

  return (
    <div
      onClick={() => onClick(note)}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer overflow-hidden aspect-square flex flex-col"
    >
      {/* Zone de contenu preview avec icône */}
      <div className="flex-1 p-4 bg-gray-50 relative">
        {/* Icône en haut à droite */}
        <div className="absolute top-3 right-3 text-gray-400">
          <div className="w-5 h-5">
            {React.cloneElement(IconComponent, { className: 'w-full h-full' })}
          </div>
        </div>

        {/* Texte de preview avec sauts de ligne */}
        <p className="text-sm text-gray-700 line-clamp-5 pr-8 whitespace-pre-wrap">
          {previewText || "Cliquez pour éditer..."}
        </p>
      </div>

      {/* Zone d'info en bas */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
          {note.title || "Sans titre"}
        </h3>
        <div className="flex items-center justify-between text-xs">
          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded">
            {note.category || "Note"}
          </span>
          <span className="text-gray-500">
            {formatDate(note.displayDate || note.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Vue modale style Notion
const NoteModal = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(note?.iconType || 'document');
  const [category, setCategory] = useState(note?.category || 'Note');
  const [displayDate, setDisplayDate] = useState(note?.displayDate || note?.createdAt || new Date().toISOString());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Charger les catégories personnalisées depuis localStorage
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('note_categories');
    return saved ? JSON.parse(saved) : ['Note', 'Idea', 'Task', 'Project', 'Meeting'];
  });

  // Sauvegarder les catégories
  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem('note_categories', JSON.stringify(newCategories));
  };

  // Ajouter une nouvelle catégorie
  const handleAddCategory = () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      const updatedCategories = [...categories, newCategoryInput.trim()];
      saveCategories(updatedCategories);
      setCategory(newCategoryInput.trim());
      setNewCategoryInput("");
      setShowNewCategoryInput(false);
      setShowCategoryDropdown(false);
    }
  };

  const editor = useCreateBlockNote({
    initialContent: note?.content?.blocks || undefined,
  });

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showIconMenu && !e.target.closest('.icon-menu-container')) {
        setShowIconMenu(false);
      }
      if (showCategoryDropdown && !e.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
        setShowNewCategoryInput(false);
        setNewCategoryInput("");
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showIconMenu, showCategoryDropdown]);

  const handleSave = () => {
    const blocks = editor.document;
    onSave({
      ...note,
      title,
      iconType: selectedIcon,
      category,
      displayDate,
      content: { blocks },
      edited: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  // Icônes avec taille pour modal
  const modalIcons = Object.entries(iconsList).reduce((acc, [key, icon]) => {
    acc[key] = React.cloneElement(icon, { className: 'w-20 h-20' });
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleSave} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        {/* Header avec bouton fermer et options */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Sélection de catégorie personnalisable */}
          <div className="relative category-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryDropdown(!showCategoryDropdown);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1"
            >
              <span>{category}</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5H7z"/>
              </svg>
            </button>

            {showCategoryDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[150px] z-50">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${
                      category === cat ? 'bg-gray-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <div className="border-t border-gray-100 mt-1 pt-1">
                  {!showNewCategoryInput ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewCategoryInput(true);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span>Ajouter</span>
                    </button>
                  ) : (
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCategory();
                          }
                        }}
                        placeholder="Nouvelle catégorie"
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-0"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sélection de date */}
          <input
            type="date"
            value={displayDate.split('T')[0]}
            onChange={(e) => setDisplayDate(new Date(e.target.value).toISOString())}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 border-none rounded-lg outline-none cursor-pointer hover:bg-gray-200"
          />

          <button
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Zone principale */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Icône AU-DESSUS du titre */}
            <div className="mb-6">
              <div className="relative mb-4 icon-menu-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIconMenu(!showIconMenu);
                  }}
                  className="w-24 h-24 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors text-gray-500"
                  title="Choisir une icône"
                >
                  {modalIcons[selectedIcon]}
                </button>

                {/* Menu de sélection d'icônes */}
                {showIconMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(iconsList).map(([key, icon]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedIcon(key);
                            setShowIconMenu(false);
                          }}
                          className="w-12 h-12 hover:bg-gray-100 rounded flex items-center justify-center text-gray-600"
                        >
                          {React.cloneElement(icon, { className: 'w-6 h-6' })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Titre style Notion */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New page"
                className="w-full text-5xl font-bold text-gray-200 border-none outline-none placeholder-gray-200 bg-transparent focus:text-gray-700 focus:outline-none focus:ring-0"
                autoFocus
              />
            </div>

            {/* Éditeur */}
            <div className="min-h-[500px]">
              <BlockNoteView
                editor={editor}
                theme="light"
                className="min-h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
export default function NotesView() {
  const { currentWorkspace } = useWorkspace();
  const { saveAction } = useUndoRedo();
  const [notes, setNotes] = useState([]);
  const [modalNote, setModalNote] = useState(null);

  // Stockage
  const getStorageKey = (workspaceId) => `notes_${workspaceId}`;

  // Charger les notes
  useEffect(() => {
    if (currentWorkspace) {
      const storageKey = getStorageKey(currentWorkspace.id);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    }
  }, [currentWorkspace]);

  // Sauvegarder les notes
  useEffect(() => {
    if (currentWorkspace && notes.length > 0) {
      const storageKey = getStorageKey(currentWorkspace.id);
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, currentWorkspace]);

  // Créer une nouvelle note
  const handleCreateNote = () => {
    const newNote = {
      id: Math.random().toString(36).slice(2),
      title: "",
      iconType: "document",
      category: "Note",
      displayDate: new Date().toISOString(),
      content: { blocks: [] },
      createdAt: new Date().toISOString(),
      edited: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const previousNotes = [...notes];
    setNotes([newNote, ...notes]);

    // Sauvegarder dans l'historique undo
    saveAction({
      description: 'Nouvelle note créée',
      undo: () => setNotes(previousNotes),
      redo: () => setNotes([newNote, ...notes])
    });

    // Ouvrir en modal
    setModalNote(newNote);
  };

  // Sauvegarder les modifications
  const handleSaveNote = (updatedNote) => {
    setNotes(notes.map(n =>
      n.id === updatedNote.id ? updatedNote : n
    ));
  };

  // Ouvrir une note (modal par défaut)
  const handleOpenNote = (note) => {
    setModalNote(note);
  };

  return (
    <>
      {/* Vue liste avec carrés */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-light text-gray-900">Notes</h1>

            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle note</span>
            </button>
          </div>

          {/* Grille de carrés */}
          {notes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {notes.map((note) => (
                <NoteSquare
                  key={note.id}
                  note={note}
                  onClick={handleOpenNote}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p className="mb-4">Aucune note</p>
              <button
                onClick={handleCreateNote}
                className="text-blue-500 hover:text-blue-600"
              >
                Créer votre première note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vue modale */}
      {modalNote && (
        <NoteModal
          note={modalNote}
          onClose={() => setModalNote(null)}
          onSave={handleSaveNote}
        />
      )}
    </>
  );
}
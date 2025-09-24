import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Clock, X, Upload } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUndoRedo } from '../contexts/UndoRedoContext';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";

// Formater la date
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${month} ${day}, ${year} ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Modal pour éditer un élément d'historique style Notion
const HistoryModal = ({ item, onClose, onSave }) => {
  const [title, setTitle] = useState(item?.title || "");
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(item?.iconType || 'calendar');

  const editor = useCreateBlockNote({
    initialContent: item?.content ?
      [{type: "paragraph", content: [{type: "text", text: item.content}]}] :
      undefined,
  });

  const handleSave = () => {
    const blocks = editor.document;
    const textContent = blocks[0]?.content?.[0]?.text || "";

    onSave({
      ...item,
      title,
      iconType: selectedIcon,
      content: textContent,
      date: new Date().toISOString()
    });
    onClose();
  };

  // Icônes SVG disponibles
  const icons = {
    calendar: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V8H19V19Z"/>
      </svg>
    ),
    clock: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
      </svg>
    ),
    archive: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3,3H21V7H3V3M4,8H20V21H4V8M9.5,11A0.5,0.5 0 0,0 9,11.5V13H15V11.5A0.5,0.5 0 0,0 14.5,11H9.5Z"/>
      </svg>
    ),
    folder: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
      </svg>
    ),
    document: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    ),
    bookmark: (
      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
      </svg>
    )
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleSave} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        {/* Header simple avec bouton fermer */}
        <div className="absolute top-4 right-4 z-10">
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
              <div className="relative mb-4">
                <button
                  onClick={() => setShowIconMenu(!showIconMenu)}
                  className="w-24 h-24 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors text-gray-500"
                  title="Choisir une icône"
                >
                  {icons[selectedIcon]}
                </button>

                {/* Menu de sélection d'icônes */}
                {showIconMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(icons).map(([key, icon]) => (
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
                placeholder="History Item"
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

// Carte d'historique style image.png
const HistoryCard = ({ item, onClick }) => (
  <div
    onClick={() => onClick(item)}
    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
  >
    {/* Zone de contenu preview */}
    <div className="p-6 min-h-[180px] bg-gray-50">
      <p className="text-gray-700 text-sm line-clamp-4">
        {item.content || item.description || "Aucun contenu"}
      </p>
    </div>

    {/* Zone d'info en bas */}
    <div className="px-6 py-4 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-4 h-4 text-gray-400" />
        <h3 className="font-medium text-gray-900">
          {item.title || "Sans titre"}
        </h3>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {item.category && (
          <span className="px-2 py-1 bg-green-50 text-green-600 rounded">
            {item.category}
          </span>
        )}
        <span className="text-gray-500">
          {formatDate(item.date || item.createdAt || new Date().toISOString())}
        </span>
      </div>
    </div>
  </div>
);

export default function HistoryView() {
  const { currentWorkspace } = useWorkspace();
  const { saveAction } = useUndoRedo();
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [modalItem, setModalItem] = useState(null);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    if (currentWorkspace) {
      // Simuler des données d'historique
      const mockHistory = [
        {
          id: '1',
          title: 'la fac',
          content: "c'est le contenue de la page, c'est juste un test\nici c'est juste un test",
          category: 'Fleeting',
          date: new Date().toISOString(),
          iconType: 'document',
          type: 'History'
        },
        {
          id: '2',
          title: 'Meeting notes',
          content: 'Discussion about project timeline and deliverables. Key decisions were made regarding the architecture.',
          category: 'Permanent',
          date: new Date(Date.now() - 86400000).toISOString(),
          iconType: 'calendar',
          type: 'History'
        },
        {
          id: '3',
          title: 'Task list',
          content: '1. Review code\n2. Update documentation\n3. Deploy to staging\n4. Run tests',
          category: 'Task',
          date: new Date(Date.now() - 172800000).toISOString(),
          iconType: 'clock',
          type: 'History'
        },
        {
          id: '4',
          title: 'Project ideas',
          content: 'New feature proposals for Q2. Focus on user experience improvements and performance optimization.',
          category: 'Idea',
          date: new Date(Date.now() - 259200000).toISOString(),
          iconType: 'folder',
          type: 'History'
        },
      ];

      // Charger depuis localStorage si disponible
      const storageKey = `history_${currentWorkspace.id}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        setHistoryItems(JSON.parse(stored));
      } else {
        setHistoryItems(mockHistory);
        localStorage.setItem(storageKey, JSON.stringify(mockHistory));
      }
    }
  }, [currentWorkspace]);

  // Filtrer par période
  const filterByPeriod = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (selectedPeriod) {
      case 'today':
        return items.filter(item => new Date(item.date) >= today);
      case 'week':
        return items.filter(item => new Date(item.date) >= week);
      case 'month':
        return items.filter(item => new Date(item.date) >= month);
      default:
        return items;
    }
  };

  const filteredItems = filterByPeriod(historyItems);

  const handleCardClick = (item) => {
    setModalItem(item);
  };

  const handleSaveItem = (updatedItem) => {
    const previousItems = [...historyItems];
    const newItems = historyItems.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );

    setHistoryItems(newItems);

    // Sauvegarder dans localStorage
    if (currentWorkspace) {
      const storageKey = `history_${currentWorkspace.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    }

    // Ajouter à l'historique undo/redo
    saveAction({
      description: 'Modification d\'un élément d\'historique',
      undo: () => {
        setHistoryItems(previousItems);
        if (currentWorkspace) {
          const storageKey = `history_${currentWorkspace.id}`;
          localStorage.setItem(storageKey, JSON.stringify(previousItems));
        }
      },
      redo: () => {
        setHistoryItems(newItems);
        if (currentWorkspace) {
          const storageKey = `history_${currentWorkspace.id}`;
          localStorage.setItem(storageKey, JSON.stringify(newItems));
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Historique</h1>
            <p className="text-sm text-gray-500 mt-1">
              Retrouvez tous vos éléments archivés
            </p>
          </div>

          {/* Filtre de période */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedPeriod === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedPeriod === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Ce mois
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 text-sm text-gray-500">
          {filteredItems.length} élément{filteredItems.length > 1 ? 's' : ''}
          {selectedPeriod !== 'all' && ' (filtre actif)'}
        </div>

        {/* Grid de cartes */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Calendar className="w-12 h-12 mb-4" />
            <p>Aucun élément dans l'historique</p>
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {modalItem && (
        <HistoryModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}
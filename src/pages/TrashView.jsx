import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useToast } from '../components/Toast';
import { uniformStyles } from '../styles/uniformStyles';
import Card from '../components/ui/Card';
import {
  loadTrash,
  restoreFromTrash,
  deleteFromTrash,
  emptyTrash,
  cleanOldTrashItems
} from '../services/trashService';
import { restorePage } from '../services/pageService';

const TrashView = () => {
  const { radars, updateRadar } = useContext(AppContext);
  const [trashItems, setTrashItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, subjects, tasks, pages
  const toast = useToast();

  // Charger la corbeille au montage
  useEffect(() => {
    loadTrashItems();
    // Nettoyer les anciens éléments (plus de 30 jours)
    const deletedCount = cleanOldTrashItems();
    if (deletedCount > 0) {
      console.log(`${deletedCount} ancien(s) élément(s) supprimé(s) automatiquement`);
    }
  }, []);

  const loadTrashItems = () => {
    const trash = loadTrash();
    setTrashItems(trash);
  };

  // Filtrer les éléments selon le type
  const filteredItems = trashItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'subjects') return item.type === 'subject';
    if (filter === 'tasks') return item.type === 'task';
    if (filter === 'pages') return item.type === 'page';
    return true;
  });

  // Restaurer un élément
  const handleRestore = (item) => {
    if (item.type === 'subject' && item.radarId) {
      // Restaurer une matière dans son radar
      const radar = radars.find(r => r.id === item.radarId);
      if (radar) {
        const restoredSubject = restoreFromTrash(item.id);
        if (restoredSubject) {
          // Enlever les propriétés de corbeille
          delete restoredSubject.type;
          delete restoredSubject.radarId;
          delete restoredSubject.radarName;

          const updatedSubjects = [...(radar.subjects || []), restoredSubject];
          updateRadar({ ...radar, subjects: updatedSubjects });

          toast.success(`Matière "${restoredSubject.name}" restaurée dans le radar "${radar.name}"`);
          loadTrashItems();
        }
      } else {
        toast.error('Le radar d\'origine n\'existe plus');
      }
    } else if (item.type === 'page') {
      // Restaurer une page personnalisée
      const restoredItem = restoreFromTrash(item.id);
      if (restoredItem) {
        const restoredPage = restorePage(restoredItem);
        toast.success(`Page "${restoredPage.name}" restaurée`);
        loadTrashItems();
      }
    }
    // TODO: Gérer la restauration des tâches
  };

  // Supprimer définitivement un élément
  const handleDelete = (item) => {
    if (confirm(`Supprimer définitivement "${item.name}" ? Cette action est irréversible.`)) {
      deleteFromTrash(item.id);
      toast.success('Élément supprimé définitivement');
      loadTrashItems();
    }
  };

  // Restaurer plusieurs éléments
  const handleRestoreSelected = () => {
    let restoredCount = 0;
    selectedItems.forEach(itemId => {
      const item = trashItems.find(t => t.id === itemId);
      if (item) {
        handleRestore(item);
        restoredCount++;
      }
    });
    setSelectedItems([]);
    if (restoredCount > 0) {
      toast.success(`${restoredCount} élément(s) restauré(s)`);
    }
  };

  // Supprimer plusieurs éléments
  const handleDeleteSelected = () => {
    if (confirm(`Supprimer définitivement ${selectedItems.length} élément(s) ? Cette action est irréversible.`)) {
      selectedItems.forEach(itemId => {
        deleteFromTrash(itemId);
      });
      toast.success(`${selectedItems.length} élément(s) supprimé(s) définitivement`);
      setSelectedItems([]);
      loadTrashItems();
    }
  };

  // Vider la corbeille
  const handleEmptyTrash = () => {
    if (confirm('Vider complètement la corbeille ? Cette action est irréversible.')) {
      emptyTrash();
      toast.success('Corbeille vidée');
      loadTrashItems();
    }
  };

  // Formater la date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      }
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Sélectionner/désélectionner un élément
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Sélectionner tout
  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* En-tête */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Corbeille</h1>
          <p className={uniformStyles.text.pageSubtitle}>
            Consultez vos éléments supprimés
          </p>
        </div>

        {/* Barre d'actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            {/* Filtres */}
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tout ({trashItems.length})
            </button>
            <button
              onClick={() => setFilter('subjects')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'subjects'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Matières ({trashItems.filter(i => i.type === 'subject').length})
            </button>
            <button
              onClick={() => setFilter('tasks')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'tasks'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tâches ({trashItems.filter(i => i.type === 'task').length})
            </button>
            <button
              onClick={() => setFilter('pages')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'pages'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pages ({trashItems.filter(i => i.type === 'page').length})
            </button>
          </div>

          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={handleRestoreSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8.5 1.5A1.5 1.5 0 0 0 7 3v1.293L2.646 8.646a.5.5 0 0 0 .708.708L7 5.707V13a.5.5 0 0 0 1 0V5.707l3.646 3.647a.5.5 0 0 0 .708-.708L8 4.293V3a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 1 0v-.5A2.5 2.5 0 0 0 8.5 1.5z" />
                  </svg>
                  Restaurer ({selectedItems.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                  </svg>
                  Supprimer ({selectedItems.length})
                </button>
              </>
            )}
            {trashItems.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                </svg>
                Vider la corbeille
              </button>
            )}
          </div>
        </div>

        {/* Sélectionner tout */}
        {filteredItems.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length}
                onChange={selectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                Sélectionner tout ({filteredItems.length})
              </span>
            </label>
          </div>
        )}

        {/* Liste des éléments */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="text-center py-20">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">La corbeille est vide</p>
              <p className="text-gray-500 text-sm mt-2">Les éléments supprimés apparaîtront ici</p>
            </Card>
          ) : (
            filteredItems.map(item => (
              <Card
                key={item.id}
                variant="hover"
                padding="medium"
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleItemSelection(item.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleItemSelection(item.id);
                    }}
                    className="rounded border-gray-300"
                  />

                  {/* Icône selon le type */}
                  <div className="flex-shrink-0">
                    {item.type === 'subject' ? (
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM6 6.5C6 7.328 6.672 8 7.5 8h1c.828 0 1.5-.672 1.5-1.5V4.5a1 1 0 1 1 2 0V6l.003.041a3 3 0 0 1 2.742 2.713A1.993 1.993 0 0 0 16 10.5a2 2 0 0 1-2 2h-.581a5.998 5.998 0 0 1-.484 1.166l.41.41a2 2 0 0 1-2.83 2.83l-.41-.41A5.998 5.998 0 0 1 8.94 17H7.06a5.998 5.998 0 0 1-1.166-.484l-.41.41a2 2 0 1 1-2.83-2.83l.41-.41A5.998 5.998 0 0 1 2.58 12.5H2a2 2 0 0 1-2-2 1.993 1.993 0 0 0 1.255-1.746A3 3 0 0 1 3.997 6.041L4 6V4.5a1 1 0 0 1 2 0V6.5z" />
                      </svg>
                    ) : item.type === 'page' ? (
                      <span className="text-lg">{item.icon || '📝'}</span>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V9.5A2.5 2.5 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25zM11 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-5.5 9.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                      </svg>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.type === 'subject' && item.radarName && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.radarName}
                        </span>
                      )}
                      {item.type === 'page' && (
                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-0.5 rounded">
                          Page personnalisée
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Supprimé {formatDate(item.trashedAt)}
                      </span>
                      {item.type === 'subject' && item.value !== undefined && (
                        <span className="text-xs text-gray-500">
                          Progression: {item.value}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(item);
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Restaurer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.5 1.5A1.5 1.5 0 0 0 7 3v1.293L2.646 8.646a.5.5 0 0 0 .708.708L7 5.707V13a.5.5 0 0 0 1 0V5.707l3.646 3.647a.5.5 0 0 0 .708-.708L8 4.293V3a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 1 0v-.5A2.5 2.5 0 0 0 8.5 1.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer définitivement"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Message d'information */}
        {trashItems.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Les éléments dans la corbeille sont conservés pendant 30 jours</p>
            <p>après leur suppression avant d'être définitivement effacés.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashView;
import React, { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { uniformStyles } from '../styles/uniformStyles';
import ConfirmModal from '../components/tasks/ConfirmModal';
import { clearAllData } from '../services/localStorage';
import HistorySection from '../components/settings/HistorySection';

const Settings = () => {
  const { radars, tasks } = useContext(AppContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const fileInputRef = React.useRef(null);
  const [activeTab, setActiveTab] = useState('general'); // general, history

  // Définir les pages disponibles
  const availablePages = [
    { id: 'radars', name: 'Radars & Améliorations', icon: '🎯', description: 'Tous les radars et leurs matières' },
    { id: 'tasks', name: 'Tâches (To-Do)', icon: '📋', description: 'Toutes les tâches quotidiennes et hebdomadaires' },
    { id: 'history', name: 'Historique', icon: '📊', description: 'Historique complet des tâches archivées' },
    { id: 'calendar', name: 'Calendrier', icon: '📅', description: 'Événements et tâches planifiées' },
    { id: 'pages', name: 'Pages personnalisées', icon: '📄', description: 'Notes et pages créées' },
    { id: 'settings', name: 'Paramètres système', icon: '⚙️', description: 'Préférences et configurations' }
  ];

  // Calculer les statistiques
  const stats = {
    radars: radars?.length || 0,
    subjects: radars?.reduce((sum, r) => sum + (r.subjects?.length || 0), 0) || 0,
    tasks: tasks?.length || 0,
    history: JSON.parse(localStorage.getItem('gestion_history') || '[]').length,
    pages: JSON.parse(localStorage.getItem('pages') || '[]').length
  };

  const handleOpenDeleteModal = () => {
    setSelectedPages([]);
    setShowSelectionModal(true);
  };

  const handleTogglePage = (pageId) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleConfirmSelection = () => {
    if (selectedPages.length === 0) {
      alert('Veuillez sélectionner au moins une page à supprimer');
      return;
    }
    setShowSelectionModal(false);
    setShowDeleteModal(true);
  };

  const handleDeleteData = () => {
    // Supprimer les données sélectionnées
    selectedPages.forEach(pageId => {
      switch(pageId) {
        case 'radars':
          // D'abord, récupérer les IDs des radars existants
          let radarIds = [];
          try {
            const radarsData = localStorage.getItem('gestion_radars');
            if (radarsData) {
              const radars = JSON.parse(radarsData);
              radarIds = radars.map(r => r.id);
            }
          } catch (e) {
            console.error('Erreur lors de la lecture des radars:', e);
          }

          // Liste complète de toutes les clés possibles pour les radars
          const radarKeys = [
            'gestion_radars',
            'gestion_radars_backup',
            'gestion_subjects',
            'radars',
            'subjects'
          ];

          // Supprimer toutes les clés explicites
          radarKeys.forEach(key => localStorage.removeItem(key));

          // Supprimer toutes les clés qui pourraient contenir des données de radar
          Object.keys(localStorage).forEach(key => {
            const lowerKey = key.toLowerCase();

            // Supprimer les clés qui contiennent des mots-clés
            if (lowerKey.includes('radar') ||
                lowerKey.includes('subject') ||
                lowerKey.includes('matiere')) {
              localStorage.removeItem(key);
            }

            // Supprimer les clés spécifiques à chaque radar (kanban, notion, etc.)
            radarIds.forEach(radarId => {
              if (key.includes(radarId)) {
                localStorage.removeItem(key);
              }
            });

            // Supprimer toutes les clés kanban et notion
            if (key.startsWith('kanban-') ||
                key.startsWith('kanban-tasks-') ||
                key.startsWith('notion-content-') ||
                key.startsWith('page_content_chapters-')) {
              // Vérifier si c'est lié à un radar
              let isRadarRelated = false;
              radarIds.forEach(radarId => {
                if (key.includes(radarId)) {
                  isRadarRelated = true;
                }
              });

              // Si c'est lié à un radar connu, supprimer
              if (isRadarRelated) {
                localStorage.removeItem(key);
              }

              // Sinon, si le pattern contient "bac" ou d'autres indices, supprimer aussi
              if (key.includes('bac') || key.includes('-pc') || key.includes('-math') || key.includes('-anglais')) {
                localStorage.removeItem(key);
              }
            }
          });
          break;

        case 'tasks':
          const taskKeys = [
            'gestion_tasks',
            'gestion_tasks_backup',
            'tasks',
            'task_rotation_blocked',
            'last_task_rotation'
          ];

          taskKeys.forEach(key => localStorage.removeItem(key));

          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('task') ||
                key.toLowerCase().includes('tache')) {
              localStorage.removeItem(key);
            }
          });
          break;

        case 'history':
          localStorage.removeItem('gestion_history');
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('history') ||
                key.toLowerCase().includes('historique')) {
              localStorage.removeItem(key);
            }
          });
          break;

        case 'calendar':
          localStorage.removeItem('gestion_calendar');
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('calendar') ||
                key.toLowerCase().includes('calendrier')) {
              localStorage.removeItem(key);
            }
          });
          break;

        case 'pages':
          localStorage.removeItem('pages');
          localStorage.removeItem('page_contents');
          // Supprimer toutes les clés liées aux pages
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('page_') ||
                key.toLowerCase().includes('notion') ||
                key.toLowerCase().includes('page')) {
              localStorage.removeItem(key);
            }
          });
          break;

        case 'settings':
          localStorage.removeItem('gestion_settings');
          localStorage.removeItem('task_rotation_blocked');
          localStorage.removeItem('last_task_rotation');
          Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('setting') ||
                key.toLowerCase().includes('parametre')) {
              localStorage.removeItem(key);
            }
          });
          break;
      }
    });

    // Si tout est sélectionné, effacer vraiment TOUT
    if (selectedPages.length === availablePages.length) {
      // Effacer absolument tout le localStorage de l'application
      const keysToKeep = []; // Mettre ici les clés à garder si nécessaire
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
    }

    setShowDeleteModal(false);
    // Forcer le rechargement complet de la page pour réinitialiser le contexte
    window.location.reload();
  };

  // Gérer l'export de toutes les données
  const handleExportAll = () => {
    const exportData = {
      tasks: tasks,
      history: localStorage.getItem('gestion_history') ? JSON.parse(localStorage.getItem('gestion_history')) : [],
      radars: radars,
      pages: localStorage.getItem('pages') ? JSON.parse(localStorage.getItem('pages')) : [],
      calendar: localStorage.getItem('gestion_calendar') ? JSON.parse(localStorage.getItem('gestion_calendar')) : [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportName = `backup_complet_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };

  // Gérer l'import des données
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.tasks) {
          localStorage.setItem('gestion_tasks', JSON.stringify(importedData.tasks));
        }
        if (importedData.history) {
          localStorage.setItem('gestion_history', JSON.stringify(importedData.history));
        }
        if (importedData.radars) {
          localStorage.setItem('gestion_radars', JSON.stringify(importedData.radars));
        }
        if (importedData.pages) {
          localStorage.setItem('pages', JSON.stringify(importedData.pages));
        }
        if (importedData.calendar) {
          localStorage.setItem('gestion_calendar', JSON.stringify(importedData.calendar));
        }

        setShowImportSuccess(true);
        setTimeout(() => {
          setShowImportSuccess(false);
          window.location.reload();
        }, 2000);
      } catch (error) {
        alert('Erreur lors de l\'import : fichier invalide');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-4xl mx-auto p-8">
        {/* En-tête */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Paramètres</h1>
          <p className={uniformStyles.text.pageSubtitle}>Gérez vos préférences et vos données</p>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Général
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Historique
          </button>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'general' ? (
          <>
            {/* Section Export/Import */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Sauvegarde et restauration</h2>
              <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportAll}
                    className={'flex items-center gap-2 ' + uniformStyles.button.primary}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Exporter toutes les données
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={'flex items-center gap-2 ' + uniformStyles.button.primary}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Importer des données
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section Danger Zone */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-medium text-red-600 mb-4">Zone dangereuse</h2>
              <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding + ' border-red-200'}>
                <h3 className="text-base font-medium text-gray-700 mb-2">Supprimer des données</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Supprimez définitivement les données sélectionnées de l'application. Cette action est irréversible.
                </p>
                <button
                  onClick={handleOpenDeleteModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer des données
                </button>
              </div>
            </div>
          </>
        ) : (
          <HistorySection />
        )}
      </div>

      {/* Message de succès d'import */}
      {showImportSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          ✓ Import réussi ! Rechargement...
        </div>
      )}

      {/* Modal de sélection */}
      {showSelectionModal && (
        <div className={uniformStyles.modal.darkOverlay}>
          <div className={uniformStyles.modal.darkContainer + ' max-w-2xl'}>
            <h2 className={uniformStyles.modal.darkTitle}>Sélectionner les données à supprimer</h2>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {availablePages.map(page => (
                <label
                  key={page.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPages.includes(page.id)}
                    onChange={() => handleTogglePage(page.id)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{page.icon}</span>
                      <span className="text-white/90 font-medium">{page.name}</span>
                    </div>
                    <p className="text-white/60 text-sm mt-1">{page.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedPages(selectedPages.length === availablePages.length ? [] : availablePages.map(p => p.id))}
                className="text-white/60 hover:text-white/90 text-sm transition-colors"
              >
                {selectedPages.length === availablePages.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSelectionModal(false)}
                  className={uniformStyles.modal.darkButtonCancel}
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                  disabled={selectedPages.length === 0}
                >
                  Continuer ({selectedPages.length} sélectionné{selectedPages.length > 1 ? 's' : ''})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation finale */}
      <ConfirmModal
        show={showDeleteModal}
        message={`Êtes-vous sûr de vouloir supprimer les données de ${selectedPages.length} page${selectedPages.length > 1 ? 's' : ''} ? Cette action est irréversible !`}
        onConfirm={handleDeleteData}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Settings;
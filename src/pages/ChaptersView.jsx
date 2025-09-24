import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import SimpleKanban from '../components/kanban/SimpleKanban';
import BlockNoteEditorComponent from '../components/BlockNoteEditor/BlockNoteEditor';
import { uniformStyles } from '../styles/uniformStyles';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  const [kanbanTasks, setKanbanTasks] = useState(null); // null pour indiquer qu'on n'a pas encore chargé
  const [showKanban, setShowKanban] = useState(() => {
    // Charger la préférence depuis localStorage
    const savedPref = localStorage.getItem(`show-kanban-${radarId}-${subjectId}`);
    return savedPref !== 'false'; // Par défaut true
  });

  // Récupérer les données du radar et de la matière
  const radar = radars.find(r => r.id === radarId);
  const subject = radar?.subjects?.find(s => s.id === subjectId);

  // Charger les tâches du Kanban depuis localStorage
  useEffect(() => {
    if (subjectId && radarId) {
      const savedKey = `kanban-tasks-${radarId}-${subjectId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setKanbanTasks(parsed);
        } catch (e) {
          console.error('Erreur de chargement des tâches:', e);
          setKanbanTasks(null);
        }
      } else {
        setKanbanTasks(null); // Pas de données sauvegardées
      }
    }
  }, [subjectId, radarId]);

  // Sauvegarder les tâches du Kanban
  const saveKanbanTasks = (tasks) => {
    const savedKey = `kanban-tasks-${radarId}-${subjectId}`;
    localStorage.setItem(savedKey, JSON.stringify(tasks));
    setKanbanTasks(tasks);
  };

  // Basculer l'affichage du Kanban
  const toggleKanban = () => {
    const newState = !showKanban;
    setShowKanban(newState);
    localStorage.setItem(`show-kanban-${radarId}-${subjectId}`, newState.toString());
  };

  // Gérer l'ajout d'une tâche depuis l'éditeur Notion vers le Kanban
  const handleAddToKanban = (task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Déterminer la colonne en fonction du statut
    const column = task.status === 'todo' ? 'not-started' :
                  task.status === 'in-progress' ? 'in-progress' :
                  task.status === 'done' ? 'done' : 'not-started';

    // S'assurer que kanbanTasks a la bonne structure
    const currentTasks = kanbanTasks || {
      'not-started': [],
      'in-progress': [],
      'done': []
    };

    const updatedTasks = {
      ...currentTasks,
      [column]: [...(currentTasks[column] || []), newTask]
    };

    saveKanbanTasks(updatedTasks);

    // Afficher une notification de succès (optionnel)
    console.log('Tâche ajoutée au Kanban:', newTask);
  };

  // Gérer la sauvegarde du contenu de l'éditeur
  const handleEditorSave = (blocks) => {
    // Ici on pourrait sauvegarder dans le contexte global ou faire une API call
    console.log('Contenu sauvegardé pour', subject?.name, ':', blocks.length, 'blocs');

    // Optionnel: mettre à jour le radar avec le contenu
    if (updateRadar) {
      const updatedSubject = {
        ...subject,
        notionContent: blocks,
        lastModified: new Date().toISOString()
      };

      const updatedRadar = {
        ...radar,
        subjects: radar.subjects.map(s =>
          s.id === subjectId ? updatedSubject : s
        )
      };

      // updateRadar(updatedRadar); // Décommenter si vous voulez sauvegarder dans le contexte
    }
  };

  if (!radar || !subject) {
    return (
      <div className={uniformStyles.layout.page + ' flex items-center justify-center'}>
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            {!radar ? 'Radar non trouvé' : 'Matière non trouvée'}
          </div>
          <button
            onClick={() => navigate('/improvements')}
            className={uniformStyles.button.secondary}
          >
            Retour aux radars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={uniformStyles.layout.page}>
      <div className="px-6 py-4">
        {/* Titre de la page avec navigation */}
        <div className={uniformStyles.pageHeader.container + ' px-6'}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button
              onClick={() => navigate('/improvements')}
              className="hover:text-gray-700"
            >
              Radars
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/radar/${radarId}`)}
              className="hover:text-gray-700"
            >
              {radar.name}
            </button>
            <span>/</span>
            <span className="text-gray-700 font-medium">{subject.name}</span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className={uniformStyles.text.pageTitle}>
                {subject?.name || 'Chapitres'}
              </h1>
              <p className={uniformStyles.text.pageSubtitle}>
                Organisez vos chapitres et suivez votre progression
              </p>
            </div>

            {/* Bouton pour basculer le Kanban */}
            <button
              onClick={toggleKanban}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                showKanban
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              title={showKanban ? 'Masquer le Kanban' : 'Afficher le Kanban'}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showKanban ? (
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                ) : (
                  <>
                    <rect x="3" y="7" width="7" height="10" rx="1"/>
                    <rect x="14" y="5" width="7" height="12" rx="1"/>
                  </>
                )}
              </svg>
              {showKanban ? 'Masquer Kanban' : 'Afficher Kanban'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Kanban et Éditeur */}
      <div className="max-w-[1400px] mx-auto px-6 pb-32">
        {/* Section Kanban - Conditionnellement affichée */}
        {showKanban && (
          <div className="mb-8 p-6 animate-fadeIn">
            <SimpleKanban
              subjectId={subjectId}
              radarId={radarId}
            />
          </div>
        )}

        {/* Section Éditeur BlockNote */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z" />
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
              </svg>
              Plan détaillé de la matière
            </h2>
            <div className="text-sm text-gray-500">
              Créez votre carte complète des chapitres
            </div>
          </div>

          <BlockNoteEditorComponent
            pageId={`chapters-${radarId}-${subjectId}`}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChaptersView;
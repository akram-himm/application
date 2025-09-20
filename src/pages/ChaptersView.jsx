import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
// import SimpleKanban from '../components/chapters/SimpleKanban';
// import NotionEditor from '../components/NotionEditor/Editor';
import { uniformStyles } from '../styles/uniformStyles';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  const [kanbanTasks, setKanbanTasks] = useState(null); // null pour indiquer qu'on n'a pas encore chargé

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

          <h1 className={uniformStyles.text.pageTitle}>
            {subject?.name || 'Chapitres'}
          </h1>
          <p className={uniformStyles.text.pageSubtitle}>
            Organisez vos chapitres et suivez votre progression
          </p>
        </div>
      </div>

      {/* Main Content - Kanban et Éditeur */}
      <div className="max-w-[1400px] mx-auto px-6 pb-32 space-y-8">
        {/* Section Kanban - directement sans conteneur */}
        {/* <SimpleKanban
          tasks={kanbanTasks}
          onTasksChange={saveKanbanTasks}
          subjectId={subjectId}
          radarId={radarId}
        /> */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Le composant Kanban a été temporairement désactivé pendant la migration vers BlockNote.</p>
        </div>

        {/* Section Éditeur Notion */}
        <div>
          <div className="flex items-center justify-between mb-4">
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

          {/* <NotionEditor
            subjectId={subjectId}
            radarId={radarId}
            subjectName={subject.name}
            onSave={handleEditorSave}
            onAddToKanban={handleAddToKanban}
          /> */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600">L'éditeur a été temporairement désactivé pendant la migration vers BlockNote.</p>
          </div>
        </div>

        {/* Section d'aide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            Comment utiliser cette page efficacement
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
                Dans l'éditeur (carte de la matière) :
              </h4>
              <ul className="space-y-1 ml-4">
                <li>• Listez tous vos chapitres avec #</li>
                <li>• Ajoutez des sous-sections avec ## et ###</li>
                <li>• Utilisez [] pour les points à maîtriser</li>
                <li>• Organisez avec Tab pour indenter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
                </svg>
                Dans le Kanban (suivi de progression) :
              </h4>
              <ul className="space-y-1 ml-4">
                <li>• Envoyez les chapitres depuis l'éditeur avec →<svg className="w-3 h-3 inline" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                </svg></li>
                <li>• Déplacez les cartes entre les colonnes</li>
                <li>• "À faire" → "En cours" → "Terminé"</li>
                <li>• Suivez votre avancement en temps réel</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-blue-700 italic flex items-start gap-1">
              <svg className="w-3 h-3 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <span>Astuce : Commencez par créer votre plan complet dans l'éditeur,
              puis envoyez progressivement les chapitres vers le Kanban au fur et à mesure
              que vous les étudiez.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersView;
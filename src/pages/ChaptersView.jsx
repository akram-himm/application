import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import SimpleKanban from '../components/chapters/SimpleKanban';
import NotionEditor from '../components/NotionEditor/Editor';
import { uniformStyles } from '../styles/uniformStyles';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  const [kanbanTasks, setKanbanTasks] = useState([]);

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
          setKanbanTasks(JSON.parse(saved));
        } catch (e) {
          console.error('Erreur de chargement des tâches:', e);
        }
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
      status: task.status || 'todo',
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...kanbanTasks, newTask];
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
              {radar.icon} {radar.name}
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
        {/* Section Kanban */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📊 Tableau de progression
            </h2>
            <span className="text-sm text-gray-500">
              {kanbanTasks.length} tâche{kanbanTasks.length > 1 ? 's' : ''}
            </span>
          </div>

          <SimpleKanban
            tasks={kanbanTasks}
            onTasksChange={saveKanbanTasks}
            subjectId={subjectId}
            radarId={radarId}
          />
        </div>

        {/* Section Éditeur Notion */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              📝 Plan détaillé de la matière
            </h2>
            <div className="text-sm text-gray-500">
              Créez votre carte complète des chapitres
            </div>
          </div>

          <NotionEditor
            subjectId={subjectId}
            radarId={radarId}
            subjectName={subject.name}
            onSave={handleEditorSave}
            onAddToKanban={handleAddToKanban}
          />
        </div>

        {/* Section d'aide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            💡 Comment utiliser cette page efficacement
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">📝 Dans l'éditeur (carte de la matière) :</h4>
              <ul className="space-y-1 ml-4">
                <li>• Listez tous vos chapitres avec #</li>
                <li>• Ajoutez des sous-sections avec ## et ###</li>
                <li>• Utilisez [] pour les points à maîtriser</li>
                <li>• Organisez avec Tab pour indenter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">📊 Dans le Kanban (suivi de progression) :</h4>
              <ul className="space-y-1 ml-4">
                <li>• Envoyez les chapitres depuis l'éditeur avec →📋</li>
                <li>• Déplacez les cartes entre les colonnes</li>
                <li>• "À faire" → "En cours" → "Terminé"</li>
                <li>• Suivez votre avancement en temps réel</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-blue-700 italic">
              💡 Astuce : Commencez par créer votre plan complet dans l'éditeur,
              puis envoyez progressivement les chapitres vers le Kanban au fur et à mesure
              que vous les étudiez.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersView;
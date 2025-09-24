import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { AkramContext } from '../contexts/AkramContext';
import RadarChart from '../components/radar/RadarChart';
import { BarChart, DonutChart, LineChart, VerticalBarChart } from '../components/charts/ChartTypes';
import AkramControl from '../components/radar/AkramControl';
import FloatingAlert from '../components/radar/FloatingAlert';
import SubjectModal from '../components/radar/SubjectModal';
import ConfirmModal from '../components/tasks/ConfirmModal';
import { uniformStyles } from '../styles/uniformStyles';
import { addToTrash } from '../services/trashService';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import { DatabaseBlock } from '../components/BlockNote/DatabaseBlock';
import { getWorkspaceData, saveWorkspaceData } from '../services/workspaceService';

const VisualizationView = () => {
  const { radarId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar, deleteRadar } = useContext(AppContext);
  const { penalties } = useContext(AkramContext);

  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  const [chartType, setChartType] = useState('radar'); // Type de graphique sélectionné
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: '',
    onConfirm: null
  });
  const [viewMode, setViewMode] = useState('both'); // 'chart', 'notes', 'both'
  const [editorContent, setEditorContent] = useState(null);

  // Types de graphiques par défaut avec icônes SVG
  const defaultChartTypes = [
    {
      id: 'radar',
      name: 'Radar',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      )
    },
    {
      id: 'verticalBar',
      name: 'Barres verticales',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="10" width="4" height="10"/>
          <rect x="10" y="4" width="4" height="16"/>
          <rect x="16" y="7" width="4" height="13"/>
        </svg>
      )
    },
    {
      id: 'bar',
      name: 'Barres horizontales',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="5" width="16" height="3"/>
          <rect x="4" y="10.5" width="13" height="3"/>
          <rect x="4" y="16" width="10" height="3"/>
        </svg>
      )
    },
    {
      id: 'donut',
      name: 'Anneau',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="5"/>
        </svg>
      )
    },
    {
      id: 'line',
      name: 'Lignes',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,6 15,12 9,5 6,10 2,8"/>
        </svg>
      )
    }
  ];

  // Charger les types de graphiques depuis le localStorage ou utiliser les types par défaut
  const loadChartTypes = () => {
    const savedTypes = localStorage.getItem(`chartTypes_${radarId}`);
    if (savedTypes) {
      try {
        const parsedTypes = JSON.parse(savedTypes);
        // Récupérer les objets complets avec les icônes SVG
        return parsedTypes.map(typeId => defaultChartTypes.find(t => t.id === typeId)).filter(Boolean);
      } catch (e) {
        return defaultChartTypes;
      }
    }
    return defaultChartTypes;
  };

  const [availableChartTypes, setAvailableChartTypes] = useState(loadChartTypes());
  const [chartTypeContextMenu, setChartTypeContextMenu] = useState({ show: false, x: 0, y: 0, chartType: null });

  // Système d'annulation (undo/redo)
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showUndoNotification, setShowUndoNotification] = useState(false);

  const radar = radars.find(r => r.id === radarId);

  // Créer l'instance de l'éditeur BlockNote - temporairement sans blocs custom
  const editor = useCreateBlockNote({
    initialContent: editorContent,
    // blockSpecs: {
    //   database: DatabaseBlock,
    // },
  });

  useEffect(() => {
    if (!radar) {
      navigate('/');
    }
  }, [radar, navigate]);

  // Charger le type de graphique sauvegardé
  useEffect(() => {
    if (radar && radar.chartType) {
      setChartType(radar.chartType);
    }
  }, [radar]);

  // Charger le contenu de l'éditeur pour ce radar
  useEffect(() => {
    if (radarId) {
      const radarNotes = getWorkspaceData('radarnotes') || {};
      if (radarNotes[radarId]) {
        setEditorContent(radarNotes[radarId]);
      }
    }
  }, [radarId]);

  // Sauvegarder le contenu de l'éditeur
  const saveEditorContent = () => {
    if (editor && radarId) {
      const content = editor.document;
      const radarNotes = getWorkspaceData('radarnotes') || {};
      radarNotes[radarId] = content;
      saveWorkspaceData('radarnotes', radarNotes);
    }
  };

  // Sauvegarder automatiquement toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      saveEditorContent();
    }, 2000);

    return () => clearInterval(interval);
  }, [editor, radarId]);

  // Écouter les raccourcis clavier pour undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  if (!radar) return null;

  const subjects = radar.subjects || [];
  const progress = calculateProgress();

  function calculateProgress() {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subject) => {
      let value = subject.value;
      const penalty = penalties.find(p => p.subjectId === subject.id);
      if (penalty) {
        value = Math.max(0, value - penalty.penaltyValue);
      }
      return sum + value;
    }, 0);
    return Math.round(total / subjects.length);
  }

  // Sauvegarder le type de graphique sélectionné
  const handleChartTypeChange = (type) => {
    // Vérifier si le type existe encore dans les types disponibles
    if (availableChartTypes.find(t => t.id === type)) {
      setChartType(type);
      updateRadar({ ...radar, chartType: type });
    } else if (availableChartTypes.length > 0) {
      // Si le type n'existe plus, sélectionner le premier disponible
      setChartType(availableChartTypes[0].id);
      updateRadar({ ...radar, chartType: availableChartTypes[0].id });
    }
  };

  // Fonction générique pour sauvegarder l'état avant une action
  const saveToUndoStack = (action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); // Vider la pile de redo quand une nouvelle action est faite
  };

  // Fonction d'annulation
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    switch (lastAction.type) {
      case 'removeChartType':
        // Restaurer le type de graphique supprimé
        const restoredTypes = [...availableChartTypes];
        restoredTypes.splice(lastAction.index, 0, lastAction.chartType);
        setAvailableChartTypes(restoredTypes);
        localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify(restoredTypes.map(t => t.id)));

        // Restaurer le viewMode si nécessaire
        if (lastAction.previousViewMode) {
          setViewMode(lastAction.previousViewMode);
        }

        // Ajouter à la pile de redo
        setRedoStack(prev => [...prev, lastAction]);

        // Afficher notification
        setShowUndoNotification(true);
        setTimeout(() => setShowUndoNotification(false), 2000);
        break;

      case 'removeAllChartTypes':
        // Restaurer tous les types de graphiques
        setAvailableChartTypes(lastAction.previousTypes);
        localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify(lastAction.previousTypes.map(t => t.id)));
        setViewMode(lastAction.previousViewMode);
        setRedoStack(prev => [...prev, lastAction]);

        setShowUndoNotification(true);
        setTimeout(() => setShowUndoNotification(false), 2000);
        break;

      case 'addSubject':
        // Supprimer la matière ajoutée
        const updatedSubjects = subjects.filter(s => s.id !== lastAction.subject.id);
        updateRadar({ ...radar, subjects: updatedSubjects });
        setRedoStack(prev => [...prev, lastAction]);

        setShowUndoNotification(true);
        setTimeout(() => setShowUndoNotification(false), 2000);
        break;

      case 'deleteSubject':
        // Restaurer la matière supprimée
        const subjectsWithRestored = [...subjects];
        subjectsWithRestored.splice(lastAction.index, 0, lastAction.subject);
        updateRadar({ ...radar, subjects: subjectsWithRestored });
        setRedoStack(prev => [...prev, lastAction]);

        setShowUndoNotification(true);
        setTimeout(() => setShowUndoNotification(false), 2000);
        break;

      case 'editSubject':
        // Restaurer l'ancienne valeur de la matière
        const subjectsWithOldValue = subjects.map(s =>
          s.id === lastAction.subject.id ? lastAction.previousSubject : s
        );
        updateRadar({ ...radar, subjects: subjectsWithOldValue });
        setRedoStack(prev => [...prev, lastAction]);

        setShowUndoNotification(true);
        setTimeout(() => setShowUndoNotification(false), 2000);
        break;
    }
  };

  // Fonction de refaire (redo)
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const actionToRedo = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    switch (actionToRedo.type) {
      case 'removeChartType':
        // Re-supprimer le type de graphique
        const typesAfterRemove = availableChartTypes.filter(t => t.id !== actionToRedo.chartType.id);
        setAvailableChartTypes(typesAfterRemove);
        localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify(typesAfterRemove.map(t => t.id)));

        if (typesAfterRemove.length === 0) {
          setViewMode('notes');
        }

        setUndoStack(prev => [...prev, actionToRedo]);
        break;

      case 'removeAllChartTypes':
        // Re-supprimer tous les types
        setAvailableChartTypes([]);
        localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify([]));
        setViewMode('notes');
        setUndoStack(prev => [...prev, actionToRedo]);
        break;

      case 'addSubject':
        // Re-ajouter la matière
        updateRadar({ ...radar, subjects: [...subjects, actionToRedo.subject] });
        setUndoStack(prev => [...prev, actionToRedo]);
        break;

      case 'deleteSubject':
        // Re-supprimer la matière
        const subjectsAfterDelete = subjects.filter(s => s.id !== actionToRedo.subject.id);
        updateRadar({ ...radar, subjects: subjectsAfterDelete });
        setUndoStack(prev => [...prev, actionToRedo]);
        break;

      case 'editSubject':
        // Re-appliquer la modification
        const subjectsAfterEdit = subjects.map(s =>
          s.id === actionToRedo.subject.id ? actionToRedo.subject : s
        );
        updateRadar({ ...radar, subjects: subjectsAfterEdit });
        setUndoStack(prev => [...prev, actionToRedo]);
        break;
    }
  };

  // Fonction pour supprimer un type de graphique
  const handleRemoveChartType = (typeId) => {
    const chartTypeToRemove = availableChartTypes.find(t => t.id === typeId);
    const indexToRemove = availableChartTypes.findIndex(t => t.id === typeId);

    // Sauvegarder l'action dans l'historique
    saveToUndoStack({
      type: 'removeChartType',
      chartType: chartTypeToRemove,
      index: indexToRemove,
      previousViewMode: viewMode
    });

    const newTypes = availableChartTypes.filter(t => t.id !== typeId);
    setAvailableChartTypes(newTypes);

    // Sauvegarder dans localStorage
    localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify(newTypes.map(t => t.id)));

    // Si on supprime le type actuellement sélectionné
    if (chartType === typeId && newTypes.length > 0) {
      setChartType(newTypes[0].id);
    }

    // Si on n'a plus de types, passer en mode notes uniquement
    if (newTypes.length === 0) {
      setViewMode('notes');
    }

    setChartTypeContextMenu({ show: false, x: 0, y: 0, chartType: null });
  };

  // Gérer automatiquement le viewMode si aucun type de graphique n'est disponible
  useEffect(() => {
    if (availableChartTypes.length === 0 && viewMode === 'chart') {
      setViewMode('notes');
    }
  }, [availableChartTypes, viewMode]);

  const handleAddSubject = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleEditSubject = () => {
    if (selectedSubjectIndex !== null) {
      setEditingSubject(subjects[selectedSubjectIndex]);
      setModalOpen(true);
      setContextMenu({ show: false, x: 0, y: 0 });
    }
  };

  const handleDeleteSubject = () => {
    if (selectedSubjectIndex !== null) {
      setConfirmModal({
        show: true,
        message: 'Êtes-vous sûr de vouloir supprimer cette matière ?',
        onConfirm: () => {
          const subjectToDelete = subjects[selectedSubjectIndex];

          // Sauvegarder l'action dans l'historique
          saveToUndoStack({
            type: 'deleteSubject',
            subject: subjectToDelete,
            index: selectedSubjectIndex
          });

          // Ajouter la matière à la corbeille avec les informations du radar
          addToTrash({
            ...subjectToDelete,
            type: 'subject',
            radarId: radar.id,
            radarName: radar.name,
            originalId: subjectToDelete.id
          });

          // Supprimer la matière du radar
          const newSubjects = subjects.filter((_, index) => index !== selectedSubjectIndex);
          updateRadar({ ...radar, subjects: newSubjects });
          setContextMenu({ show: false, x: 0, y: 0 });
          setConfirmModal({ show: false, message: '', onConfirm: null });
        }
      });
    }
  };

  const handleTogglePause = () => {
    if (selectedSubjectIndex !== null) {
      const subject = subjects[selectedSubjectIndex];
      const now = new Date();
      const periodMs = 4 * 24 * 60 * 60 * 1000; // 3 jours complets + 1 = 4 jours total

      let newSubjects;
      if (!subject.isPaused) {
        // PAUSER : Calculer le temps restant avant pénalité
        const lastProgressDate = new Date(subject.lastProgress);
        const timeSinceProgress = now - lastProgressDate;
        const remainingTime = periodMs - timeSinceProgress;
        // Calculer les jours complets restants
        const remainingDays = Math.max(0, Math.floor(remainingTime / (24 * 60 * 60 * 1000)));

        newSubjects = subjects.map((s, index) => {
          if (index === selectedSubjectIndex) {
            return {
              ...s,
              isPaused: true,
              pausedAt: now.toISOString(),
              remainingDaysBeforePenalty: remainingDays
            };
          }
          return s;
        });
      } else {
        // REPRENDRE : Recalculer la date de dernière progression
        // Garder le même nombre de jours restants qu'au moment de la pause
        const remainingMs = (subject.remainingDaysBeforePenalty || 0) * 24 * 60 * 60 * 1000;
        const newLastProgress = new Date(now.getTime() - (periodMs - remainingMs));

        newSubjects = subjects.map((s, index) => {
          if (index === selectedSubjectIndex) {
            return {
              ...s,
              isPaused: false,
              pausedAt: null,
              remainingDaysBeforePenalty: null,
              lastProgress: newLastProgress.toISOString() // Ajuster la date
            };
          }
          return s;
        });
      }

      updateRadar({ ...radar, subjects: newSubjects });
      setContextMenu({ show: false, x: 0, y: 0 });
    }
  };

  const handleSaveSubject = (subjectData) => {
    let newSubjects;

    // Sauvegarder l'action dans l'historique
    if (editingSubject) {
      const previousSubject = subjects.find(s => s.id === editingSubject.id);
      saveToUndoStack({
        type: 'editSubject',
        subject: subjectData,
        previousSubject: previousSubject
      });
    } else {
      saveToUndoStack({
        type: 'addSubject',
        subject: subjectData
      });
    }

    if (editingSubject) {
      newSubjects = subjects.map(subject => {
        if (subject.id === editingSubject.id) {
          // Si la valeur a changé (progression), mettre à jour la date et stocker l'ancienne valeur
          const hasProgressed = subjectData.value > subject.value;
          return {
            ...subject,
            ...subjectData,
            lastProgress: hasProgressed ? new Date().toISOString() : subject.lastProgress,
            lastProgressValue: hasProgressed ? subjectData.value : subject.lastProgressValue,
            // Stocker l'historique des pénalités appliquées
            appliedPenalties: hasProgressed ? 0 : (subject.appliedPenalties || 0),
            // Conserver l'état de pause si existant
            isPaused: subject.isPaused || false,
            pausedAt: subject.pausedAt || null,
            remainingDaysBeforePenalty: subject.remainingDaysBeforePenalty || null
          };
        }
        return subject;
      });
    } else {
      const newSubject = {
        ...subjectData,
        id: subjectData.name.toLowerCase().replace(/\s+/g, '-'),
        max: 100,
        lastProgress: new Date().toISOString(),
        lastProgressValue: subjectData.value, // Stocker la valeur initiale
        appliedPenalties: 0, // Aucune pénalité au départ
        isPaused: false, // Non pausé par défaut
        pausedAt: null,
        remainingDaysBeforePenalty: null
      };
      newSubjects = [...subjects, newSubject];
    }

    updateRadar({ ...radar, subjects: newSubjects });
    setModalOpen(false);
  };

  const handleSubjectClick = (index) => {
    if (subjects[index]) {
      navigate(`/radar/${radarId}/subject/${subjects[index].id}`);
    }
  };

  const handleContextMenu = (e, index) => {
    // Vérifier si e est un vrai événement ou un objet avec clientX/clientY
    if (e && e.preventDefault && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setSelectedSubjectIndex(index);

    // Calculer la position en tenant compte du menu et de la fenêtre
    const menuWidth = 200; // largeur approximative du menu
    const menuHeight = 200; // hauteur approximative du menu
    const x = e.clientX || e.x;
    const y = e.clientY || e.y;

    // Ajuster si le menu dépasse les bords de la fenêtre
    const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
    const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

    setContextMenu({
      show: true,
      x: adjustedX,
      y: adjustedY
    });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0 });
      }
      if (chartTypeContextMenu.show) {
        setChartTypeContextMenu({ show: false, x: 0, y: 0, chartType: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show, chartTypeContextMenu.show]);

  // Sélectionner le composant de graphique approprié
  const renderChart = () => {
    const chartProps = {
      subjects,
      hoveredSubject,
      onHoverSubject: setHoveredSubject,
      onSelectSubject: handleSubjectClick,
      onContextMenu: handleContextMenu
    };

    switch (chartType) {
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'verticalBar':
        return <VerticalBarChart {...chartProps} />;
      case 'donut':
        return <DonutChart {...chartProps} />;
      case 'line':
        return <LineChart {...chartProps} />;
      case 'radar':
      default:
        return <RadarChart {...chartProps} />;
    }
  };

  return (
    <div className={uniformStyles.layout.page}>
      <div className="w-full h-full">
        {/* Header fixe en haut */}
        <div className="px-8 py-4 bg-white border-b border-gray-200">
          {/* Titre de la page avec navigation */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button
              onClick={() => navigate('/improvements')}
              className="hover:text-gray-700"
            >
              Visualisations
            </button>
            <span>/</span>
            <span className="text-gray-700 font-medium">{radar?.name || 'Visualisation'}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {radar?.name || 'Visualisation'}
                </h1>
                <p className="text-sm text-gray-500">
                  {radar?.description || 'Suivez votre progression dans ce domaine'}
                </p>
              </div>
              {/* Boutons Undo/Redo */}
              <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`p-2 rounded-md text-sm font-medium transition-all ${
                    undoStack.length > 0
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Annuler (Ctrl+Z)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" transform="scale(-1, 1) translate(-16, 0)"/>
                  </svg>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`p-2 rounded-md text-sm font-medium transition-all ${
                    redoStack.length > 0
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Refaire (Ctrl+Y)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308c-.12.1-.12.284 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                  </svg>
                </button>
              </div>
            </div>
            {/* Sélecteur de vue - Affiché seulement s'il y a des types de graphiques disponibles */}
            {availableChartTypes.length > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'chart'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Diagramme uniquement"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18 9l-5 5-4-4-6 6"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('notes')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'notes'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Notes uniquement"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('both')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'both'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Vue combinée"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="h-[calc(100vh-140px)] overflow-hidden">
          {/* Vue Diagramme uniquement */}
          {viewMode === 'chart' && availableChartTypes.length > 0 && (
            <div className="h-full overflow-y-auto p-8">
            {/* Sélecteur de type de graphique et bouton d'action */}
            <div className="flex justify-between items-center mb-6">
              {/* Sélecteur de type de graphique */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                {availableChartTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleChartTypeChange(type.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setChartTypeContextMenu({
                        show: true,
                        x: e.clientX,
                        y: e.clientY,
                        chartType: type.id
                      });
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      chartType === type.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={`${type.name} (clic droit pour options)`}
                  >
                    {type.icon}
                  </button>
                ))}
              </div>

              {/* Bouton d'action */}
              <button
                onClick={handleAddSubject}
                className={'flex items-center gap-2 ' + uniformStyles.button.primary}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
                </svg>
                Ajouter une matière
              </button>
            </div>

            {/* Graphique sélectionné */}
            <div className="relative animate-fadeIn">
              {renderChart()}
            </div>

            {/* Floating Alert */}
            <FloatingAlert />

            {/* Akram Control */}
            <AkramControl />
            </div>
          )}

          {/* Vue Notes uniquement */}
          {viewMode === 'notes' && (
            <div className="h-full bg-white">
              <div className="h-full flex flex-col">
                {/* Header de l'éditeur */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Notes et annotations pour {radar?.name}</h3>
                  {availableChartTypes.length === 0 && (
                    <button
                      onClick={() => {
                        setAvailableChartTypes(defaultChartTypes);
                        localStorage.removeItem(`chartTypes_${radarId}`);
                        setViewMode('both');
                      }}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                      </svg>
                      Restaurer les graphiques
                    </button>
                  )}
                </div>
                {/* Éditeur BlockNote en pleine page */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <BlockNoteView
                    editor={editor}
                    theme="light"
                    className="min-h-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vue combinée (côte à côte) */}
          {viewMode === 'both' && availableChartTypes.length > 0 && (
            <div className="h-full flex">
              {/* Partie gauche : Graphiques */}
              <div className="w-1/2 overflow-y-auto p-8 border-r border-gray-200">
                {/* Sélecteur de type de graphique et bouton d'action */}
                <div className="flex justify-between items-center mb-6">
                  {/* Sélecteur de type de graphique - Utilisation de availableChartTypes */}
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                    {availableChartTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleChartTypeChange(type.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setChartTypeContextMenu({
                            show: true,
                            x: e.clientX,
                            y: e.clientY,
                            chartType: type.id
                          });
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          chartType === type.id
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={`${type.name} (clic droit pour options)`}
                      >
                        {type.icon}
                      </button>
                    ))}
                  </div>

                  {/* Bouton d'action */}
                  <button
                    onClick={handleAddSubject}
                    className={'flex items-center gap-2 ' + uniformStyles.button.primary}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
                    </svg>
                    Ajouter une matière
                  </button>
                </div>

                {/* Graphique sélectionné */}
                <div className="relative animate-fadeIn">
                  {renderChart()}
                </div>

                {/* Floating Alert */}
                <FloatingAlert />

                {/* Akram Control */}
                <AkramControl />
              </div>

              {/* Partie droite : Éditeur BlockNote */}
              <div className="w-1/2 bg-white overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Header de l'éditeur */}
                  <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700">Notes et annotations</h3>
                  </div>

                  {/* Éditeur BlockNote */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <BlockNoteView
                      editor={editor}
                      theme="light"
                      className="h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Context Menu - Rendered with Portal */}
        {contextMenu.show && ReactDOM.createPortal(
          <div
            className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              zIndex: 99999
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleEditSubject}
              className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-3"
            >
              <span className="text-lg">✏️</span>
              <span>Modifier</span>
            </button>

            <div className="h-px bg-gray-700/50" />

            <button
              onClick={handleTogglePause}
              className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-3"
            >
              {selectedSubjectIndex !== null && subjects[selectedSubjectIndex]?.isPaused ? (
                <>
                  <span className="text-lg">▶️</span>
                  <span>Reprendre</span>
                </>
              ) : (
                <>
                  <span className="text-lg">⏸️</span>
                  <span>Mettre en pause</span>
                </>
              )}
            </button>

            <div className="h-px bg-gray-700/50" />

            <button
              onClick={handleDeleteSubject}
              className="w-full px-4 py-3 text-left text-gray-200 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-3"
            >
              <span className="text-lg">🗑️</span>
              <span>Supprimer</span>
            </button>
          </div>,
          document.body
        )}

        {/* Subject Modal */}
        {modalOpen && (
          <SubjectModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveSubject}
            editingSubject={editingSubject}
          />
        )}

        {/* Modal de confirmation */}
        <ConfirmModal
          show={confirmModal.show}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
        />

        {/* Menu contextuel pour les types de graphiques */}
        {chartTypeContextMenu.show && ReactDOM.createPortal(
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]"
            style={{
              left: `${chartTypeContextMenu.x}px`,
              top: `${chartTypeContextMenu.y}px`,
              zIndex: 99999
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleRemoveChartType(chartTypeContextMenu.chartType)}
              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
              </svg>
              <span>Supprimer ce type</span>
            </button>

            {availableChartTypes.length > 1 && (
              <>
                <div className="h-px bg-gray-200"></div>
                <button
                  onClick={() => {
                    // Sauvegarder l'action dans l'historique
                    saveToUndoStack({
                      type: 'removeAllChartTypes',
                      previousTypes: availableChartTypes,
                      previousViewMode: viewMode
                    });

                    setAvailableChartTypes([]);
                    // Sauvegarder dans localStorage
                    localStorage.setItem(`chartTypes_${radarId}`, JSON.stringify([]));
                    setViewMode('notes');
                    setChartTypeContextMenu({ show: false, x: 0, y: 0, chartType: null });
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-13zm1.5 2h10v10H3V3z"/>
                  </svg>
                  <span>Supprimer tous les types</span>
                </button>
              </>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* Notification d'annulation */}
      {showUndoNotification && ReactDOM.createPortal(
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[100000] animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
            </svg>
            <span>Action annulée</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default VisualizationView;
import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { AkramContext } from '../contexts/AkramContext';
import RadarChart from '../components/radar/RadarChart';
import AkramControl from '../components/radar/AkramControl';
import FloatingAlert from '../components/radar/FloatingAlert';
import SubjectModal from '../components/radar/SubjectModal';
import { uniformStyles } from '../styles/uniformStyles';

const RadarView = () => {
  const { radarId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  const { penalties } = useContext(AkramContext);
  
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null);
  
  const radar = radars.find(r => r.id === radarId);
  
  useEffect(() => {
    if (!radar) {
      navigate('/');
    }
  }, [radar, navigate]);
  
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
    if (selectedSubjectIndex !== null && confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      const newSubjects = subjects.filter((_, index) => index !== selectedSubjectIndex);
      updateRadar({ ...radar, subjects: newSubjects });
      setContextMenu({ show: false, x: 0, y: 0 });
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
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);
  
  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Titre de la page avec navigation */}
        <div className={uniformStyles.pageHeader.container}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button
              onClick={() => navigate('/improvements')}
              className="hover:text-gray-700"
            >
              Radars
            </button>
            <span>/</span>
            <span className="text-gray-700 font-medium">{radar?.name || 'Radar'}</span>
          </div>
          <h1 className={uniformStyles.text.pageTitle}>
            {radar?.name || 'Radar'}
          </h1>
          <p className={uniformStyles.text.pageSubtitle}>
            {radar?.description || 'Suivez votre progression dans ce domaine'}
          </p>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-end mb-6">
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
      
        {/* Radar Chart */}
        <div className="relative animate-fadeIn">
        <RadarChart
          subjects={subjects}
          hoveredSubject={hoveredSubject}
          onHoverSubject={setHoveredSubject}
          onSelectSubject={handleSubjectClick}
          onContextMenu={handleContextMenu}
        />
      </div>
      
      {/* Floating Alert */}
      <FloatingAlert />
      
      {/* Akram Control */}
      <AkramControl />
      
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
      </div>
    </div>
  );
};

export default RadarView;
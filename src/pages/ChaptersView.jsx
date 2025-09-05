import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import ChaptersTable from '../components/chapters/ChaptersTable';
import ChaptersKanban from '../components/chapters/ChaptersKanban';
import ChapterModal from '../components/chapters/ChapterModal';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  
  const [currentView, setCurrentView] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [chapters, setChapters] = useState([]);
  
  // Récupérer les données du radar et de la matière
  const radar = radars.find(r => r.id === radarId);
  const subject = radar?.subjects?.find(s => s.id === subjectId);
  
  useEffect(() => {
    if (subject?.chapters) {
      setChapters(subject.chapters);
    } else {
      // Données initiales si pas de chapitres
      setChapters([
        {
          id: 'analyse',
          name: 'Analyse',
          enabled: true,
          subtopics: [
            { 
              id: 'fonctions', 
              name: 'Étude de fonctions', 
              icon: '📊', 
              status: 'done',
              priority: 'medium',
              startDate: '2024-01-15',
              endDate: '2024-02-01',
              percentage: 25 
            },
            { 
              id: 'suites', 
              name: 'Les suites', 
              icon: '🔢', 
              status: 'done',
              priority: 'low',
              startDate: '2024-02-01',
              endDate: '2024-02-15',
              percentage: 25 
            }
          ]
        },
        {
          id: 'geometrie',
          name: 'Géométrie',
          enabled: true,
          subtopics: [
            { 
              id: 'espace', 
              name: 'Géométrie dans l\'espace', 
              icon: '📐', 
              status: 'done',
              priority: 'low',
              startDate: '2024-01-20',
              endDate: '2024-02-10',
              percentage: 25 
            },
            { 
              id: 'vecteurs', 
              name: 'Vecteurs et produit scalaire', 
              icon: '🎯', 
              status: 'not-started',
              priority: 'high',
              startDate: '',
              endDate: '2024-02-20',
              percentage: 25 
            }
          ]
        }
      ]);
    }
  }, [subject]);
  
  // Sauvegarder les chapitres
  const saveChapters = (newChapters) => {
    setChapters(newChapters);
    
    // Mettre à jour dans le contexte global
    const updatedRadar = { ...radar };
    const subjectIndex = updatedRadar.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex !== -1) {
      updatedRadar.subjects[subjectIndex].chapters = newChapters;
      updateRadar(updatedRadar);
    }
  };
  
  // Calculer la progression totale
  const calculateTotalProgress = () => {
    let totalProgress = 0;
    let enabledChapters = 0;
    
    chapters.forEach(chapter => {
      if (chapter.enabled) {
        let chapterProgress = 0;
        chapter.subtopics.forEach(subtopic => {
          if (subtopic.status === 'done') {
            chapterProgress += subtopic.percentage;
          }
        });
        totalProgress += chapterProgress;
        enabledChapters++;
      }
    });
    
    return enabledChapters > 0 ? Math.round(totalProgress / enabledChapters) : 0;
  };
  
  const progress = calculateTotalProgress();
  
  // Gestion du modal
  const openAddChapterModal = () => {
    setEditingItem(null);
    setEditingType('chapter');
    setModalOpen(true);
  };
  
  const openAddSubtopicModal = (chapterId) => {
    setEditingItem({ chapterId });
    setEditingType('subtopic');
    setModalOpen(true);
  };
  
  const openEditChapterModal = (chapter) => {
    setEditingItem(chapter);
    setEditingType('chapter');
    setModalOpen(true);
  };
  
  const openEditSubtopicModal = (chapterId, subtopic) => {
    setEditingItem({ chapterId, subtopic });
    setEditingType('subtopic');
    setModalOpen(true);
  };
  
  const handleSaveItem = (data) => {
    const newChapters = [...chapters];
    
    if (editingType === 'chapter') {
      if (editingItem) {
        // Éditer un chapitre
        const index = newChapters.findIndex(c => c.id === editingItem.id);
        if (index !== -1) {
          newChapters[index].name = data.name;
        }
      } else {
        // Ajouter un chapitre
        const newId = data.name.toLowerCase().replace(/\s+/g, '-');
        newChapters.push({
          id: newId,
          name: data.name,
          enabled: true,
          subtopics: []
        });
      }
    } else if (editingType === 'subtopic') {
      const chapterIndex = newChapters.findIndex(c => c.id === editingItem.chapterId);
      if (chapterIndex !== -1) {
        if (editingItem.subtopic) {
          // Éditer un sous-chapitre
          const subtopicIndex = newChapters[chapterIndex].subtopics.findIndex(
            s => s.id === editingItem.subtopic.id
          );
          if (subtopicIndex !== -1) {
            newChapters[chapterIndex].subtopics[subtopicIndex] = {
              ...newChapters[chapterIndex].subtopics[subtopicIndex],
              ...data
            };
          }
        } else {
          // Ajouter un sous-chapitre
          const newId = data.name.toLowerCase().replace(/\s+/g, '-');
          newChapters[chapterIndex].subtopics.push({
            id: newId,
            ...data,
            status: 'not-started',
            percentage: 0
          });
          
          // Recalculer les pourcentages
          const subtopics = newChapters[chapterIndex].subtopics;
          const newPercentage = Math.floor(100 / subtopics.length);
          subtopics.forEach((s, index) => {
            if (index === subtopics.length - 1) {
              s.percentage = 100 - (newPercentage * (subtopics.length - 1));
            } else {
              s.percentage = newPercentage;
            }
          });
        }
      }
    }
    
    saveChapters(newChapters);
    setModalOpen(false);
  };
  
  const handleDeleteChapter = (chapterId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et tous ses sous-chapitres ?')) {
      const newChapters = chapters.filter(c => c.id !== chapterId);
      saveChapters(newChapters);
    }
  };
  
  const handleDeleteSubtopic = (chapterId, subtopicId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sous-chapitre ?')) {
      const newChapters = [...chapters];
      const chapterIndex = newChapters.findIndex(c => c.id === chapterId);
      
      if (chapterIndex !== -1) {
        newChapters[chapterIndex].subtopics = newChapters[chapterIndex].subtopics.filter(
          s => s.id !== subtopicId
        );
        
        // Recalculer les pourcentages
        const subtopics = newChapters[chapterIndex].subtopics;
        if (subtopics.length > 0) {
          const newPercentage = Math.floor(100 / subtopics.length);
          subtopics.forEach((s, index) => {
            if (index === subtopics.length - 1) {
              s.percentage = 100 - (newPercentage * (subtopics.length - 1));
            } else {
              s.percentage = newPercentage;
            }
          });
        }
        
        saveChapters(newChapters);
      }
    }
  };
  
  const handleUpdateChapter = (chapterId, updates) => {
    const newChapters = [...chapters];
    const index = newChapters.findIndex(c => c.id === chapterId);
    if (index !== -1) {
      newChapters[index] = { ...newChapters[index], ...updates };
      saveChapters(newChapters);
    }
  };
  
  const handleUpdateSubtopic = (chapterId, subtopicId, updates) => {
    const newChapters = [...chapters];
    const chapterIndex = newChapters.findIndex(c => c.id === chapterId);
    
    if (chapterIndex !== -1) {
      const subtopicIndex = newChapters[chapterIndex].subtopics.findIndex(
        s => s.id === subtopicId
      );
      if (subtopicIndex !== -1) {
        newChapters[chapterIndex].subtopics[subtopicIndex] = {
          ...newChapters[chapterIndex].subtopics[subtopicIndex],
          ...updates
        };
        saveChapters(newChapters);
      }
    }
  };
  
  if (!radar || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9] flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/radar/${radarId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.78 12.78a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06L6.56 8l4.22 4.22a.75.75 0 0 1 0 1.06z" />
              </svg>
              Retour
            </button>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-[#1E1F22] mb-2">{subject.name}</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">Progression: {progress}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="flex bg-gray-100 border border-gray-200 rounded-md p-0.5">
              <button
                className={`px-2 py-1 rounded flex items-center gap-1 text-sm transition-all duration-150 ${
                  currentView === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setCurrentView('table')}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3.5v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-11a1 1 0 0 0-1 1zm1 2h11v6h-11v-6zm0-1v-1h3.75v1H2.5zm4.75 0v-1h7.25v1H7.25z" />
                </svg>
                Tableau
              </button>
              <button
                className={`px-2 py-1 rounded flex items-center gap-1 text-sm transition-all duration-150 ${
                  currentView === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setCurrentView('kanban')}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2A1.5 1.5 0 0 1 7 3.5v9A1.5 1.5 0 0 1 5.5 14h-2A1.5 1.5 0 0 1 2 12.5v-9zm7 0A1.5 1.5 0 0 1 10.5 2h2A1.5 1.5 0 0 1 14 3.5v5a1.5 1.5 0 0 1-1.5 1.5h-2A1.5 1.5 0 0 1 9 8.5v-5zM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-2zm7 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-2z" />
                </svg>
                Kanban
              </button>
            </div>
            
            <button
              onClick={openAddChapterModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-md transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>
      </header>
      
      {/* Search Bar */}
      <div className="px-6 py-4 max-w-[1000px] mx-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6.5 11.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-1.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm5.03 1.53a6.5 6.5 0 1 1 1.06-1.06l2.69 2.69a.75.75 0 0 1-1.06 1.06l-2.69-2.69z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher des chapitres ou sous-chapitres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/70 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-6 pb-6">
        {currentView === 'table' ? (
          <ChaptersTable
            chapters={chapters}
            searchQuery={searchQuery}
            onToggleChapter={handleUpdateChapter}
            onUpdateSubtopic={handleUpdateSubtopic}
            onEditChapter={openEditChapterModal}
            onDeleteChapter={handleDeleteChapter}
            onEditSubtopic={openEditSubtopicModal}
            onDeleteSubtopic={handleDeleteSubtopic}
            onAddSubtopic={openAddSubtopicModal}
          />
        ) : (
          <ChaptersKanban
            chapters={chapters}
            onUpdateSubtopic={handleUpdateSubtopic}
          />
        )}
      </div>
      
      {/* Modal */}
      {modalOpen && (
        <ChapterModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveItem}
          editingItem={editingItem}
          editingType={editingType}
        />
      )}
    </div>
  );
};

export default ChaptersView;
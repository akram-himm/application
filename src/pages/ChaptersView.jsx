import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import ChaptersKanban from '../components/chapters/ChaptersKanban';
import ChapterModal from '../components/chapters/ChapterModal';
import { uniformStyles } from '../styles/uniformStyles';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);
  
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
      <div className="px-6 py-4">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container + ' px-6'}>
          <h1 className={uniformStyles.text.pageTitle}>{subject?.name || 'Chapitres'}</h1>
          <p className={uniformStyles.text.pageSubtitle}>Organisez vos chapitres et sous-chapitres</p>
        </div>
        
        {/* Bouton d'action */}
        <div className="flex justify-end">
          <button
            onClick={openAddChapterModal}
            className={'flex items-center gap-2 ' + uniformStyles.button.primary}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
            </svg>
            Ajouter un chapitre
          </button>
        </div>
      </div>
      
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
            className={'w-full pl-9 pr-4 ' + uniformStyles.input.default}
          />
        </div>
      </div>
      
      {/* Main Content - Kanban seulement */}
      <div className="max-w-[1200px] mx-auto px-6 pb-6">
        <ChaptersKanban
          chapters={chapters}
          onUpdateSubtopic={handleUpdateSubtopic}
        />
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
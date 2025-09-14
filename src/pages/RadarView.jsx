import React, { useState, useContext, useEffect } from 'react';
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
  
  const handleSaveSubject = (subjectData) => {
    let newSubjects;
    
    if (editingSubject) {
      newSubjects = subjects.map(subject =>
        subject.id === editingSubject.id ? 
          { ...subject, ...subjectData, lastProgress: new Date().toISOString() } : 
          subject
      );
    } else {
      const newSubject = {
        ...subjectData,
        id: subjectData.name.toLowerCase().replace(/\s+/g, '-'),
        max: 100,
        lastProgress: new Date().toISOString()
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
    setContextMenu({
      show: true,
      x: e.clientX || e.x,
      y: e.clientY || e.y
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
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container}>
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
            Nouvelle matière
          </button>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
            <RadarChart
              subjects={subjects}
              hoveredSubject={hoveredSubject}
              onHoverSubject={setHoveredSubject}
              onSelectSubject={handleSubjectClick}
              onContextMenu={handleContextMenu}
            />
          </div>
          
          {/* Liste des matières */}
          <div className={uniformStyles.card.default + ' ' + uniformStyles.card.padding}>
            <h2 className="text-lg font-light text-gray-700 mb-4">Matières</h2>
            <div className="space-y-3">
              {subjects.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Aucune matière ajoutée</p>
              ) : (
                subjects.map((subject, index) => {
                  const penalty = penalties.find(p => p.subjectId === subject.id);
                  const actualValue = penalty ? Math.max(0, subject.value - penalty.penaltyValue) : subject.value;
                  
                  return (
                    <div
                      key={subject.id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      onClick={() => handleSubjectClick(index)}
                      onContextMenu={(e) => handleContextMenu(e, index)}
                      onMouseEnter={() => setHoveredSubject(index)}
                      onMouseLeave={() => setHoveredSubject(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                        <span className="text-sm font-semibold text-gray-800">{actualValue}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${actualValue}%` }}
                        />
                      </div>
                      {penalty && (
                        <p className="text-xs text-red-500 mt-1">Pénalité: -{penalty.penaltyValue}%</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      
      {/* Floating Alert */}
      <FloatingAlert />
      
      {/* Akram Control */}
      <AkramControl />
      
      {/* Context Menu - Style professionnel */}
      {contextMenu.show && (
        <div
          className="fixed z-[100] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditSubject}
            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-3 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Modifier</span>
          </button>

          <div className="h-px bg-gray-200" />

          <button
            onClick={handleDeleteSubject}
            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-3 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Supprimer</span>
          </button>
        </div>
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
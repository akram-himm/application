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

        {/* Section des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">Progression globale</p>
                <p className="text-2xl font-light text-blue-900">{progress}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium mb-1">Matières actives</p>
                <p className="text-2xl font-light text-green-900">{subjects.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium mb-1">Objectif atteint</p>
                <p className="text-2xl font-light text-purple-900">
                  {subjects.filter(s => s.value >= 80).length}/{subjects.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action et filtres */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              Tout
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              En cours
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
              Complété
            </button>
          </div>
          
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
      
        {/* Contenu principal avec radar et liste */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar Chart - 2/3 de l'espace */}
          <div className="lg:col-span-2">
            <RadarChart
              subjects={subjects}
              hoveredSubject={hoveredSubject}
              onHoverSubject={setHoveredSubject}
              onSelectSubject={handleSubjectClick}
              onContextMenu={handleContextMenu}
            />
          </div>
          
          {/* Liste des matières - 1/3 de l'espace */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Détail des matières</h3>
            {subjects.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
                </svg>
                <p className="text-gray-500 text-sm">Aucune matière ajoutée</p>
                <p className="text-gray-400 text-xs mt-1">Cliquez sur "Ajouter une matière" pour commencer</p>
              </div>
            ) : (
              subjects.map((subject, index) => {
                const penalty = penalties.find(p => p.subjectId === subject.id);
                const actualValue = penalty ? Math.max(0, subject.value - penalty.penaltyValue) : subject.value;
                
                return (
                  <div
                    key={subject.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-150/50 rounded-xl p-4 transition-all cursor-pointer border border-gray-200/50"
                    onClick={() => handleSubjectClick(index)}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                    onMouseEnter={() => setHoveredSubject(index)}
                    onMouseLeave={() => setHoveredSubject(null)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                      <span className="text-lg font-light text-gray-900">{actualValue}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${actualValue}%` }}
                      />
                    </div>
                    {penalty && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12a1 1 0 110-2 1 1 0 010 2zm0-3a1 1 0 01-1-1V5a1 1 0 012 0v4a1 1 0 01-1 1z"/>
                        </svg>
                        Pénalité: -{penalty.penaltyValue}%
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      
      {/* Floating Alert */}
      <FloatingAlert />
      
      {/* Akram Control */}
      <AkramControl />
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-[100] bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
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
            onClick={handleDeleteSubject}
            className="w-full px-4 py-3 text-left text-gray-200 hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-3"
          >
            <span className="text-lg">🗑️</span>
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
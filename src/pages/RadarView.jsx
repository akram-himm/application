import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { AkramContext } from '../contexts/AkramContext';
import RadarChart from '../components/radar/RadarChart';
import AkramControl from '../components/radar/AkramControl';
import FloatingAlert from '../components/radar/FloatingAlert';
import SubjectModal from '../components/radar/SubjectModal';

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
    <div className="min-h-screen bg-[rgb(25,25,25)]">
      {/* Navigation */}
      <nav className="p-5 flex items-center gap-2 text-sm text-white/46">
        <button onClick={() => navigate('/')} className="hover:text-white/81 transition-colors">
          Tableau de bord
        </button>
        <span>/</span>
        <span className="text-white/81">{radar.name}</span>
      </nav>
      
      {/* Header */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{radar.icon}</span>
          <h1 className="text-3xl font-bold text-white/81">{radar.name}</h1>
        </div>
        <p className="text-white/46">{radar.description}</p>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 bg-white/[0.055] rounded-sm overflow-hidden">
            <div
              className="h-full bg-[rgb(35,131,226)] rounded-sm transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-base font-medium text-white/81">{progress}%</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="absolute top-5 right-5 flex gap-2 z-50">
        <button
          onClick={handleAddSubject}
          className="flex items-center gap-1.5 px-3 py-2 bg-[rgb(35,131,226)] text-white rounded-lg text-sm font-medium transition-all duration-150 hover:bg-[rgb(28,104,181)]"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
          </svg>
          Ajouter
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
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-[rgb(37,37,37)]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 shadow-2xl z-[300] animate-scaleIn"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEditSubject}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/81 rounded-md transition-all duration-150 hover:bg-white/[0.08]"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
            </svg>
            Modifier
          </button>
          <button
            onClick={handleDeleteSubject}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/81 rounded-md transition-all duration-150 hover:bg-white/[0.08]"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
              <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
            </svg>
            Supprimer
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
  );
};

export default RadarView;
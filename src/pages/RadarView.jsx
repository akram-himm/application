import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { AkramContext } from '../contexts/AkramContext';
import RadarChart from '../components/radar/RadarChart';
import AkramControl from '../components/radar/AkramControl';
import FloatingAlert from '../components/radar/FloatingAlert';
import SubjectModal from '../components/radar/SubjectModal';
import { HeaderCard } from '../components/ui/Card';

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
    <div className="min-h-screen bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate('/')} className="hover:text-blue-500 transition-colors">
            Tableau de bord
          </button>
          <span>/</span>
          <button onClick={() => navigate('/improvements')} className="hover:text-blue-500 transition-colors">
            Améliorations
          </button>
          <span>/</span>
          <span className="text-[#1E1F22] font-medium">{radar.name}</span>
        </nav>
      
        {/* Header héro premium */}
        <HeaderCard className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{radar.icon}</span>
            <div>
              <h1 className="text-[40px] font-bold tracking-tight text-[#1E1F22]">{radar.name}</h1>
              <p className="text-gray-600 mt-2">{radar.description}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-lg font-bold text-blue-500">{progress}%</span>
          </div>
        </HeaderCard>
      
        {/* Actions */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddSubject}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-sm transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
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
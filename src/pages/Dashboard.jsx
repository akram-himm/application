import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import RadarModal from '../components/dashboard/RadarModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { radars, addRadar, updateRadar, deleteRadar } = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRadar, setEditingRadar] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedCard(e.target);
    setDraggedIndex(index);
    e.target.classList.add('opacity-40');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40');
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    document.querySelectorAll('.drop-indicator').forEach(el => {
      el.classList.remove('active');
    });
    setDraggedCard(null);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const card = e.target.closest('.radar-card');
    if (!card || card === draggedCard) return;
    
    const rect = card.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const currentIndex = parseInt(card.getAttribute('data-index'));
    
    // Clear all indicators first
    document.querySelectorAll('.drop-indicator').forEach(el => {
      el.classList.remove('active');
    });
    
    // Show appropriate indicator
    if (e.clientX < midpoint) {
      card.querySelector('.drop-indicator.left')?.classList.add('active');
      setDropTargetIndex(currentIndex);
    } else {
      card.querySelector('.drop-indicator.right')?.classList.add('active');
      setDropTargetIndex(currentIndex + 1);
    }
  };

  const handleDragEnter = (e) => {
    const card = e.target.closest('.radar-card');
    if (card && card !== draggedCard) {
      card.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    const card = e.target.closest('.radar-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.classList.remove('drag-over');
      card.querySelectorAll('.drop-indicator').forEach(el => {
        el.classList.remove('active');
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex !== null && dropTargetIndex !== null && draggedIndex !== dropTargetIndex) {
      const newRadars = [...radars];
      const draggedRadar = newRadars[draggedIndex];
      newRadars.splice(draggedIndex, 1);
      
      let adjustedIndex = dropTargetIndex;
      if (draggedIndex < dropTargetIndex) {
        adjustedIndex--;
      }
      
      newRadars.splice(adjustedIndex, 0, draggedRadar);
      
      // Update all radars to trigger re-render
      newRadars.forEach((radar, index) => {
        updateRadar({ ...radar, order: index });
      });
    }
  };

  const openModal = (radar = null) => {
    setEditingRadar(radar);
    setModalOpen(true);
  };

  const handleSaveRadar = (radarData) => {
    if (editingRadar) {
      updateRadar({ ...editingRadar, ...radarData });
    } else {
      addRadar(radarData);
    }
    setModalOpen(false);
    setEditingRadar(null);
  };

  const handleDeleteRadar = (e, radarId) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce radar ?')) {
      deleteRadar(radarId);
    }
  };

  const handleEditRadar = (e, radar) => {
    e.stopPropagation();
    openModal(radar);
  };

  const navigateToRadar = (radarId) => {
    navigate(`/radar/${radarId}`);
  };

  const navigateToPlan = () => {
    navigate('/plan');
  };

  const calculateRadarProgress = (radar) => {
    if (!radar.subjects || radar.subjects.length === 0) return 0;
    const totalProgress = radar.subjects.reduce((sum, subject) => sum + subject.value, 0);
    return Math.round(totalProgress / radar.subjects.length);
  };

  return (
    <div className="min-h-screen bg-[rgb(25,25,25)]">
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-white/81 mb-2">Tableau de bord</h1>
          <p className="text-white/46 text-base">Gérez vos différents domaines de vie</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center mb-6 gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
            </svg>
            Nouveau radar
          </button>
          
          <button
            onClick={navigateToPlan}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 text-sm font-medium hover:bg-white/[0.08] transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5v1h10v-1A1.5 1.5 0 0 0 11.5 2h-7zM13 5.5H3v7A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-7zM4.5 1A2.5 2.5 0 0 0 2 3.5v9A2.5 2.5 0 0 0 4.5 15h7a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 11.5 1h-7z" />
            </svg>
            Plan
          </button>
        </div>

        {/* Radar Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 relative">
          {radars.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="text-white/30 text-center">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-lg mb-4">Aucun radar créé pour le moment</p>
                <button
                  onClick={() => openModal()}
                  className="px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-md hover:bg-[rgb(28,104,181)] transition-colors duration-150"
                >
                  Créer votre premier radar
                </button>
              </div>
            </div>
          ) : (
            radars.map((radar, index) => (
              <div
                key={radar.id}
                data-index={index}
                className="radar-card bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg p-6 cursor-move transition-all duration-150 relative hover:bg-[rgb(45,45,45)] hover:translate-y-[-2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => navigateToRadar(radar.id)}
              >
                {/* Drop indicators */}
                <div className="drop-indicator left absolute top-0 left-[-8px] w-[3px] h-full bg-[rgb(35,131,226)] opacity-0 transition-opacity duration-150 pointer-events-none z-10" />
                <div className="drop-indicator right absolute top-0 right-[-8px] w-[3px] h-full bg-[rgb(35,131,226)] opacity-0 transition-opacity duration-150 pointer-events-none z-10" />
                
                {/* Card Actions */}
                <div className="card-actions absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity duration-150">
                  <button
                    onClick={(e) => handleEditRadar(e, radar)}
                    className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteRadar(e, radar.id)}
                    className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                      <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                    </svg>
                  </button>
                </div>

                {/* Card Content */}
                <div className="w-12 h-12 mb-4 flex items-center justify-center text-[32px] bg-white/[0.055] rounded-lg">
                  {radar.icon}
                </div>
                <h3 className="text-lg font-semibold text-white/81 mb-2">{radar.name}</h3>
                <p className="text-sm text-white/46 mb-4">{radar.description}</p>
                
                <div className="flex gap-6 pt-4 border-t border-white/[0.094]">
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-white/81">{calculateRadarProgress(radar)}%</div>
                    <div className="text-xs text-white/46 mt-0.5">Progression</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-white/81">{radar.subjects?.length || 0}</div>
                    <div className="text-xs text-white/46 mt-0.5">Catégories</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <RadarModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingRadar(null);
          }}
          onSave={handleSaveRadar}
          editingRadar={editingRadar}
        />
      )}
    </div>
  );
};

export default Dashboard;
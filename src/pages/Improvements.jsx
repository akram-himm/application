import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import RadarModal from '../components/dashboard/RadarModal';

const Improvements = () => {
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
    
    document.querySelectorAll('.drop-indicator').forEach(el => {
      el.classList.remove('active');
    });
    
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
    if (draggedIndex === null || dropTargetIndex === null || draggedIndex === dropTargetIndex) return;
    
    const newRadars = [...radars];
    const [removed] = newRadars.splice(draggedIndex, 1);
    
    const insertIndex = dropTargetIndex > draggedIndex ? dropTargetIndex - 1 : dropTargetIndex;
    newRadars.splice(insertIndex, 0, removed);
    
    // Ici vous devriez appeler une fonction pour réorganiser les radars
    // Par exemple: reorderRadars(newRadars);
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

  const calculateRadarProgress = (radar) => {
    if (!radar.subjects || radar.subjects.length === 0) return 0;
    const totalProgress = radar.subjects.reduce((sum, subject) => sum + subject.value, 0);
    return Math.round(totalProgress / radar.subjects.length);
  };

  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Header héro premium */}
        <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-8">
          <h1 className="text-[40px] font-bold tracking-tight text-[#1E1F22]">Améliorations</h1>
          <p className="text-gray-600 mt-3 text-lg">Gérez vos <span className="text-blue-500 font-semibold">différents domaines</span> de vie</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center mb-6 gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 shadow-sm transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
            </svg>
            Nouveau radar
          </button>
        </div>

        {/* Radar Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {radars.length === 0 ? (
            <div className="col-span-full text-center py-20 rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)]">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg font-medium">Aucun radar créé</p>
              <p className="text-gray-500 text-sm mt-2">Créez votre premier radar pour commencer</p>
            </div>
          ) : (
            radars.map((radar, index) => (
              <div
                key={radar.id}
                data-index={index}
                className="radar-card relative rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-6 cursor-pointer transition-all duration-150 hover:bg-white/90 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.1),_-12px_-12px_32px_rgba(255,255,255,0.7)]"
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
                <div className="drop-indicator left absolute left-0 top-0 bottom-0 w-1 bg-[rgb(35,131,226)] opacity-0 transition-opacity duration-150"></div>
                <div className="drop-indicator right absolute right-0 top-0 bottom-0 w-1 bg-[rgb(35,131,226)] opacity-0 transition-opacity duration-150"></div>
                
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={(e) => handleEditRadar(e, radar)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteRadar(e, radar.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                      <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                    </svg>
                  </button>
                </div>

                {/* Card Content */}
                <div className="w-12 h-12 mb-4 flex items-center justify-center text-[32px] bg-blue-50 rounded-xl">
                  {radar.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#1E1F22] mb-2">{radar.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{radar.description}</p>
                
                <div className="flex gap-6 pt-4 border-t border-gray-200">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-blue-500">{calculateRadarProgress(radar)}%</div>
                    <div className="text-xs text-gray-500 mt-0.5">Progression</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-[#1E1F22]">{radar.subjects?.length || 0}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Catégories</div>
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

export default Improvements;
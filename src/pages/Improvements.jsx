import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import RadarModal from '../components/dashboard/RadarModal';
import Card from '../components/ui/Card';
import { uniformStyles } from '../styles/uniformStyles';

const Improvements = () => {
  const navigate = useNavigate();
  const { radars, addRadar, updateRadar, deleteRadar, setRadars } = useContext(AppContext);
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
    
    // Réorganiser les radars
    reorderRadars(newRadars);
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

  const reorderRadars = (newRadars) => {
    setRadars(newRadars);
  };

  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Améliorations</h1>
          <p className={uniformStyles.text.pageSubtitle}>Gérez vos domaines d'amélioration et de progression</p>
        </div>
        
        {/* Bouton d'action */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => openModal()}
            className={'flex items-center gap-2 ' + uniformStyles.button.primary}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
            </svg>
            Nouveau radar
          </button>
        </div>

        {/* Radar Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {radars.length === 0 ? (
            <Card className="col-span-full text-center py-20">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg font-medium">Aucun radar créé</p>
              <p className="text-gray-500 text-sm mt-2">Créez votre premier radar pour commencer</p>
            </Card>
          ) : (
            radars.map((radar, index) => (
              <Card
                key={radar.id}
                data-index={index}
                variant="hover"
                padding="medium"
                className="radar-card relative cursor-pointer h-[280px]"
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
                <div className="absolute top-4 right-4 flex gap-1 z-10">
                  <button
                    onClick={(e) => handleEditRadar(e, radar)}
                    className={uniformStyles.button.icon}
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteRadar(e, radar.id)}
                    className={uniformStyles.button.icon}
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                      <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                    </svg>
                  </button>
                </div>

                {/* Card Content - Professional Business Style */}
                <div className="flex flex-col h-full">
                  {/* Header with icon and name */}
                  <div className="flex items-start gap-3 mb-6">
                    {/* Icon on the left */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>

                    {/* Name and metadata */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {radar.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500">
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">
                          {radar.subjects?.length || 0} matières
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="flex-grow flex flex-col justify-center">
                    {/* Large progress display */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-light text-gray-900">
                          {calculateRadarProgress(radar)}
                        </span>
                        <span className="text-lg text-gray-400">%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Progression moyenne
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-3">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gray-800 h-2 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${calculateRadarProgress(radar)}%` }}
                        />
                      </div>

                      {/* Quick stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span className="font-medium text-gray-700">{calculateRadarProgress(radar)}% atteint</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Dernière mise à jour: Aujourd'hui
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Actif" />
                    </div>
                  </div>
                </div>
              </Card>
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
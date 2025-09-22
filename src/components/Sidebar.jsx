import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import ConfirmModal from './tasks/ConfirmModal';
import * as pageService from '../services/pageService';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { radars } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customPages, setCustomPages] = useState([]);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('📝');
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // Vérifier si on doit inverser les styles
  const altStyle = new URLSearchParams(window.location.search).get('alt') === 'true';

  // Charger les pages personnalisées
  useEffect(() => {
    try {
      const pages = pageService.getAllPages();
      const custom = pages.filter(p => !p.fixed);
      setCustomPages(custom);
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      setCustomPages([]);
    }
  }, []);

  const handleCreatePage = () => {
    if (newPageName.trim()) {
      try {
        const newPage = pageService.createPage(newPageName.trim(), newPageIcon);
        navigate(newPage.path);
        setNewPageName('');
        setNewPageIcon('📝');
        setShowNewPageModal(false);
        // Recharger les pages
        const pages = pageService.getAllPages();
        const custom = pages.filter(p => !p.fixed);
        setCustomPages(custom);
      } catch (error) {
        console.error('Erreur lors de la création de la page:', error);
      }
    }
  };

  const initialMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      path: '/',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 1H1v14h5V1zm9 0h-5v5h5V1zm0 9h-5v5h5v-5z" opacity="0.9"/>
        </svg>
      )
    },
    { 
      id: 'progression', 
      label: 'Progression', 
      path: '/improvements', 
      accent: true,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
        </svg>
      )
    },
    { 
      id: 'todo', 
      label: 'To do', 
      path: '/plan',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
          <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
        </svg>
      )
    },
    { 
      id: 'calendar', 
      label: 'Calendrier', 
      path: '/calendar',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
      )
    },
    {
      id: 'notes',
      label: 'Notes',
      path: '/notes',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z" />
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
        </svg>
      )
    }
  ];

  // État pour stocker l'ordre des menus
  const [menuItems, setMenuItems] = useState(() => {
    // Charger l'ordre depuis localStorage
    const saved = localStorage.getItem('sidebar-menu-order');
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved);
        // Réorganiser les items selon l'ordre sauvegardé
        return savedOrder.map(id => initialMenuItems.find(item => item.id === id)).filter(Boolean);
      } catch (e) {
        return initialMenuItems;
      }
    }
    return initialMenuItems;
  });

  // Sauvegarder l'ordre dans localStorage
  useEffect(() => {
    const order = menuItems.map(item => item.id);
    localStorage.setItem('sidebar-menu-order', JSON.stringify(order));
  }, [menuItems]);

  // Gestion du drag & drop
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newItems = [...menuItems];
    const draggedContent = newItems[draggedItem];

    // Enlever l'élément de sa position actuelle
    newItems.splice(draggedItem, 1);

    // L'insérer à sa nouvelle position
    newItems.splice(dropIndex, 0, draggedContent);

    setMenuItems(newItems);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const toggleRadar = (radarId) => {
    setExpandedRadars(prev => ({
      ...prev,
      [radarId]: !prev[radarId]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isRadarActive = (radarId) => {
    return location.pathname.includes(`/radar/${radarId}`);
  };

  return (
    <aside className={`${isCollapsed ? 'w-[50px]' : 'w-[260px]'} h-screen ${altStyle ? 'bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]' : 'bg-gradient-to-b from-[#E9E9E9] via-[#F4F4F4] to-[#F9F9F9]'} flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/70">
        {!isCollapsed && (
          <h2 className="text-[#1E1F22] font-light tracking-wide">Gestion Desktop</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-[#EFF2F6] rounded-md transition-colors"
        >
          <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 16 16" fill="currentColor">
            <path d={isCollapsed ? 
              "M6.5 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" :
              "M2.5 2.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"
            } />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {/* Menu principal */}
        <div className="px-2 mb-4">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                handleDragStart(e, index);
                // Créer une image de prévisualisation personnalisée
                const dragPreview = document.createElement('div');
                dragPreview.style.position = 'absolute';
                dragPreview.style.top = '-1000px';
                dragPreview.style.backgroundColor = 'white';
                dragPreview.style.padding = '8px 12px';
                dragPreview.style.borderRadius = '8px';
                dragPreview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                dragPreview.style.fontSize = '14px';
                dragPreview.style.color = '#374151';
                dragPreview.textContent = item.label;
                document.body.appendChild(dragPreview);
                e.dataTransfer.setDragImage(dragPreview, 0, 0);
                setTimeout(() => document.body.removeChild(dragPreview), 0);
              }}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative ${dragOverIndex === index ? 'opacity-50' : ''} ${draggedItem === index ? 'opacity-30' : ''}`}
              style={{ cursor: draggedItem === index ? 'grabbing' : 'default' }}
            >
              {dragOverIndex === index && (
                <div className="absolute inset-x-0 -top-0.5 h-0.5 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive(item.path)
                    ? 'text-blue-500 bg-white/80 shadow-sm ring-1 ring-gray-200 font-medium focus:ring-2 focus:ring-blue-200'
                    : 'text-gray-600 hover:bg-white/60'
                } ${draggedItem === index ? 'cursor-grabbing' : 'cursor-pointer'}`}
              >
                {/* Icône de drag (visible au hover) */}
                <div className="absolute left-0 opacity-0 hover:opacity-100 transition-opacity cursor-grab">
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor" className="text-gray-400">
                    <circle cx="2" cy="2" r="1" />
                    <circle cx="2" cy="6" r="1" />
                    <circle cx="2" cy="10" r="1" />
                    <circle cx="6" cy="2" r="1" />
                    <circle cx="6" cy="6" r="1" />
                    <circle cx="6" cy="10" r="1" />
                  </svg>
                </div>
                <span className={isActive(item.path) ? 'text-blue-500' : 'text-gray-400'}>{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div className="mx-4 border-t border-gray-200/70 mb-4"></div>

        {/* Pages personnalisées */}
        {customPages.length > 0 && (
          <div className="px-2 mb-4">
            {!isCollapsed && (
              <div className="px-2 mb-2">
                <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">Pages</span>
              </div>
            )}
            {customPages.map(page => (
              <div
                key={page.id}
                className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  location.pathname === page.path
                    ? 'bg-[#F0F4FF] text-[#2B5CE6]'
                    : 'hover:bg-[#F3F4F6] text-[#6B7280]'
                }`}
                onClick={() => navigate(page.path)}
              >
                <span className="text-base">{page.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="text-sm flex-1">{page.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          show: true,
                          message: `Êtes-vous sûr de vouloir supprimer "${page.name}" ?`,
                          onConfirm: () => {
                            try {
                              pageService.deletePage(page.id);
                              const pages = pageService.getAllPages();
                              const custom = pages.filter(p => !p.fixed);
                              setCustomPages(custom);
                              if (location.pathname === page.path) {
                                navigate('/');
                              }
                            } catch (error) {
                              console.error('Erreur lors de la suppression:', error);
                            }
                            setConfirmModal({ show: false, message: '', onConfirm: null });
                          }
                        });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/80 rounded"
                    >
                      <svg className="w-3.5 h-3.5 text-[#EF4444]" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bouton nouvelle page */}
        <div className="px-2 mb-4">
          <button
            onClick={() => setShowNewPageModal(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-150 hover:bg-[#F3F4F6] text-[#9CA3AF]"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
            </svg>
            {!isCollapsed && <span className="text-sm">Nouvelle page</span>}
          </button>
        </div>

        {/* Radars */}
        <div className="px-2">
          <div className="flex items-center justify-between px-2 mb-2">
            {!isCollapsed && (
              <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Radars</span>
            )}
          </div>
          
          {radars.map(radar => (
            <div key={radar.id}>
              <div
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all duration-150 ${
                  isRadarActive(radar.id)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-[#6B7280] hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <button
                  onClick={() => toggleRadar(radar.id)}
                  className="p-0.5 hover:bg-[#EFF2F6] rounded"
                >
                  <svg 
                    className={`w-3 h-3 transition-transform ${expandedRadars[radar.id] ? 'rotate-90' : ''}`} 
                    viewBox="0 0 16 16" 
                    fill="currentColor"
                  >
                    <path d="M5.5 4a.5.5 0 0 0 0 .707L8.293 7.5 5.5 10.293a.5.5 0 0 0 .707.707l3.147-3.146a.5.5 0 0 0 0-.708L6.207 4a.5.5 0 0 0-.707 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate(`/radar/${radar.id}`)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 2a6 6 0 0 1 5.2 3H10L8 8 6 5H2.8A6 6 0 0 1 8 2zm-6 6a6 6 0 0 1 .1-1H5l2 3v4.9A6 6 0 0 1 2 8zm6 6a6 6 0 0 0 5-2.7V11l-2-3-2 3v3zm6-6a6 6 0 0 1-.8 2.9L11 8l2-3h.9a6 6 0 0 1 .1 1z" opacity="0.9"/>
                  </svg>
                  {!isCollapsed && <span>{radar.name}</span>}
                </button>
              </div>
              
              {/* Matières du radar */}
              {!isCollapsed && expandedRadars[radar.id] && radar.subjects && (
                <div className="ml-6 mt-1">
                  {radar.subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => navigate(`/radar/${radar.id}/subject/${subject.id}`)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-all duration-150 ${
                        location.pathname === `/radar/${radar.id}/subject/${subject.id}`
                          ? 'bg-[#F9FAFB] text-[#1E1F22]'
                          : 'text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-[#6B7280]'
                      }`}
                    >
                      <span className="w-1 h-1 bg-[#9CA3AF] rounded-full"></span>
                      <span>{subject.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200/70 space-y-2">
        {/* Corbeille */}
        <button
          onClick={() => navigate('/trash')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-white/80 rounded-md text-sm ring-1 ring-gray-200/60 shadow-sm transition-all">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
          </svg>
          {!isCollapsed && <span>Corbeille</span>}
        </button>
        {/* Paramètres */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-white/80 rounded-md text-sm ring-1 ring-gray-200/60 shadow-sm transition-all">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
          {!isCollapsed && <span>Paramètres</span>}
        </button>
      </div>

      {/* Modal nouvelle page */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h2 className="text-xl font-semibold text-[#1E1F22] mb-4">Nouvelle page</h2>

            {/* Sélecteur d'emoji */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Icône</label>
              <div className="grid grid-cols-6 gap-2">
                {['📝', '📄', '📋', '📌', '🗂️', '📁', '📊', '💡', '🎯', '⭐', '🔥', '🚀'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewPageIcon(emoji)}
                    className={`p-2 text-2xl rounded-lg hover:bg-[#F3F4F6] transition-colors ${
                      newPageIcon === emoji ? 'bg-[#F0F4FF] ring-2 ring-[#2B5CE6]' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom de la page */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Nom</label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Ma nouvelle page"
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B5CE6] focus:border-[#2B5CE6] outline-none placeholder-gray-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewPageModal(false);
                  setNewPageName('');
                  setNewPageIcon('📝');
                }}
                className="px-4 py-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageName.trim()}
                className="px-4 py-2 bg-[#2B5CE6] text-white rounded-lg hover:bg-[#1E40AF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
      <ConfirmModal
        show={confirmModal.show}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
      />
    </aside>
  );
};

export default Sidebar;

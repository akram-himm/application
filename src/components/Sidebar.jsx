import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import ConfirmModal from './tasks/ConfirmModal';
import WorkspaceModal from './WorkspaceModal';
import SearchModal from './SearchModal';
import NewPageModal from './NewPageModal';
import * as pageService from '../services/pageService';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { radars } = useContext(AppContext);
  const {
    workspaces,
    currentWorkspace,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  } = useWorkspace();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRadars, setExpandedRadars] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customPages, setCustomPages] = useState([]);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // États pour les workspaces
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

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

  // Fermer le dropdown workspace quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showWorkspaceDropdown && !e.target.closest('.workspace-dropdown-container')) {
        setShowWorkspaceDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showWorkspaceDropdown]);

  const handleCreatePage = (pageData) => {
    try {
      const newPage = pageService.createPage(pageData.name, pageData.icon, pageData.content);
      // Recharger les pages
      const pages = pageService.getAllPages();
      const custom = pages.filter(p => !p.fixed);
      setCustomPages(custom);
      // Naviguer vers la nouvelle page
      navigate(newPage.path);
      setShowNewPageModal(false);
    } catch (error) {
      console.error('Erreur lors de la création de la page:', error);
    }
  };

  // Pages fixes avec style moderne
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
    const saved = localStorage.getItem('sidebar-menu-order');
    if (saved) {
      try {
        const savedOrder = JSON.parse(saved);
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

  // Utiliser useEffect pour Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Gestion du drag & drop pour les menus
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

  // Gestion des workspaces
  const handleCreateWorkspace = (data) => {
    const newWs = createWorkspace(data.name, data.icon, data.color);
    if (newWs) {
      setShowWorkspaceModal(false);
    }
  };

  const handleEditWorkspace = (data) => {
    if (editingWorkspace) {
      updateWorkspace(editingWorkspace.id, data);
      setEditingWorkspace(null);
      setShowWorkspaceModal(false);
    }
  };

  const handleDeleteWorkspace = (workspaceId) => {
    if (workspaces.length > 1) {
      setConfirmModal({
        show: true,
        message: 'Êtes-vous sûr de vouloir supprimer ce workspace ? Toutes les données seront perdues.',
        onConfirm: () => {
          deleteWorkspace(workspaceId);
          setConfirmModal({ show: false, message: '', onConfirm: null });
        }
      });
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-[50px]' : 'w-[260px]'} h-screen bg-[#FBFBFA] flex flex-col transition-all duration-200 border-r border-[#E5E5E5]`}>
      {/* Header avec Workspace et titre */}
      <div className="px-4 py-3 border-b border-[#EBEBEA]">
        {/* Workspace Selector */}
        {!isCollapsed && currentWorkspace && (
          <div className="relative mb-3 workspace-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWorkspaceDropdown(!showWorkspaceDropdown);
              }}
              className="w-full flex items-center gap-2 hover:bg-[#EFEFEE] rounded-md px-3 py-2 transition-all duration-150 group"
            >
              <span className="text-gray-600 flex-shrink-0">
                {currentWorkspace.icon ? (
                  <span className="text-[20px]">{currentWorkspace.icon}</span>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,7L2,3V11L12,15L22,11V3L12,7M12,2L22,6V18L12,22L2,18V6L12,2Z"/>
                  </svg>
                )}
              </span>
              <span className="text-[14px] font-medium text-gray-800 flex-1 text-left truncate">
                {currentWorkspace.name}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${
                  showWorkspaceDropdown ? 'rotate-180' : ''
                }`}
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
            </button>

            {/* Dropdown des workspaces */}
            {showWorkspaceDropdown && (
              <div className="absolute top-[42px] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-[100] max-h-[400px] overflow-y-auto">
                {/* Liste des workspaces */}
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setShowWorkspaceDropdown(false); // Fermer immédiatement le dropdown
                      if (ws.id !== currentWorkspace.id) {
                        // Petit délai pour laisser le dropdown se fermer avant le switch
                        setTimeout(() => {
                          switchWorkspace(ws.id);
                        }, 50);
                      }
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-all duration-150 ${
                      ws.id === currentWorkspace.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-[18px]">{ws.icon}</span>
                    <span className="text-[13px] text-gray-700 flex-1 text-left">
                      {ws.name}
                    </span>
                    {ws.id === currentWorkspace.id && (
                      <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    )}
                  </button>
                ))}

                {/* Séparateur */}
                <div className="h-[1px] bg-gray-200 my-1"></div>

                {/* Actions */}
                <button
                  onClick={() => {
                    setShowWorkspaceDropdown(false);
                    setEditingWorkspace(null);
                    setShowWorkspaceModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-all duration-150"
                >
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
                  </svg>
                  <span className="text-[13px] text-gray-600">Créer un workspace</span>
                </button>

                {currentWorkspace && (
                  <button
                    onClick={() => {
                      setShowWorkspaceDropdown(false);
                      setEditingWorkspace(currentWorkspace);
                      setShowWorkspaceModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-all duration-150"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.146 0.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10A.5.5 0 0 1 5.5 14H2.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .146-.354l10-10zM11.207 1L2 10.207V13h2.793L14 3.793 11.207 1z"/>
                    </svg>
                    <span className="text-[13px] text-gray-600">Paramètres du workspace</span>
                  </button>
                )}

                {workspaces.length > 1 && currentWorkspace && (
                  <button
                    onClick={() => {
                      setShowWorkspaceDropdown(false);
                      handleDeleteWorkspace(currentWorkspace.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 transition-all duration-150"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                    </svg>
                    <span className="text-[13px]">Supprimer le workspace</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Titre et bouton collapse */}
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-[15px] font-medium text-gray-700">Gestion Desktop</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-[#EFEFEE] rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
              <path d={isCollapsed ?
                "M6.5 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" :
                "M2.5 2.5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z"
              } />
            </svg>
          </button>
        </div>
      </div>

      {/* Bouton Recherche */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setShowSearchModal(true)}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#EFEFEE] rounded-md text-sm text-[#787774] hover:text-[#37352F] transition-all duration-150"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">Recherche rapide</span>
              <kbd className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">Ctrl K</kbd>
            </>
          )}
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
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative ${dragOverIndex === index ? 'opacity-50' : ''} ${draggedItem === index ? 'opacity-30' : ''}`}
            >
              {dragOverIndex === index && (
                <div className="absolute inset-x-0 -top-0.5 h-0.5 bg-blue-500 rounded-full"></div>
              )}
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive(item.path)
                    ? 'bg-[#EFEFEE] text-[#37352F] font-medium'
                    : 'text-[#787774] hover:bg-[#EFEFEE]'
                }`}
              >
                <span className={isActive(item.path) ? 'text-[#37352F]' : 'text-[#787774]'}>{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div className="mx-4 border-t border-[#EBEBEA] mb-4"></div>

        {/* Pages personnalisées */}
        {customPages.length > 0 && (
          <div className="px-2 mb-4">
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pages</span>
              </div>
            )}
            {customPages.map(page => (
              <div
                key={page.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                  location.pathname === page.path
                    ? 'bg-[#EFEFEE] text-[#37352F]'
                    : 'hover:bg-[#EFEFEE] text-[#787774]'
                }`}
                onClick={() => navigate(page.path)}
              >
                <span className="text-[16px]">{page.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="text-sm flex-1 font-medium">{page.name}</span>
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
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/80 rounded transition-all"
                    >
                      <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 16 16" fill="currentColor">
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-150 hover:bg-[#EFEFEE] text-[#787774] hover:text-[#37352F]"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
            </svg>
            {!isCollapsed && <span className="text-sm font-medium">Nouvelle page</span>}
          </button>
        </div>

        {/* Radars */}
        <div className="px-2">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && (
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Radars</span>
            )}
          </div>

          {radars.map(radar => (
            <div key={radar.id}>
              <div
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-all duration-150 ${
                  isRadarActive(radar.id)
                    ? 'bg-[#EFEFEE] text-[#37352F] font-medium'
                    : 'text-[#787774] hover:bg-[#EFEFEE]'
                }`}
              >
                <button
                  onClick={() => toggleRadar(radar.id)}
                  className="p-0.5 hover:bg-[#EFEFEE] rounded"
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
                          ? 'bg-[#EFEFEE] text-[#37352F]'
                          : 'text-[#9B9A97] hover:bg-[#EFEFEE] hover:text-[#37352F]'
                      }`}
                    >
                      <span className="w-1 h-1 bg-current rounded-full"></span>
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
      <div className="p-3 border-t border-[#EBEBEA] space-y-2">
        {/* Corbeille */}
        <button
          onClick={() => navigate('/trash')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            location.pathname === '/trash'
              ? 'bg-[#FDEDEF] text-[#EB5757]'
              : 'text-[#787774] hover:bg-[#EFEFEE] hover:text-[#37352F]'
          }`}>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
          </svg>
          {!isCollapsed && <span className="font-medium">Corbeille</span>}
        </button>

        {/* Paramètres */}
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
            location.pathname === '/settings'
              ? 'bg-[#EFEFEE] text-[#37352F]'
              : 'text-[#787774] hover:bg-[#EFEFEE] hover:text-[#37352F]'
          }`}>
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
          {!isCollapsed && <span className="font-medium">Paramètres</span>}
        </button>
      </div>

      {/* Modal nouvelle page */}
      <NewPageModal
        isOpen={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreate={handleCreatePage}
      />

      {/* Modal de confirmation */}
      <ConfirmModal
        show={confirmModal.show}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
      />

      {/* Modal pour créer/éditer un workspace */}
      <WorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => {
          setShowWorkspaceModal(false);
          setEditingWorkspace(null);
        }}
        onSubmit={editingWorkspace ? handleEditWorkspace : handleCreateWorkspace}
        workspace={editingWorkspace}
      />

      {/* Modal de recherche */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
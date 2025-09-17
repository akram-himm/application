import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import {
  getAllPages,
  createPage,
  updatePage,
  deletePage,
  savePagesOrder
} from '../services/pageService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant pour un item de menu draggable
const SortableMenuItem = ({ page, isActive, onNavigate, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(page.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleSaveName = () => {
    if (newName.trim() && newName !== page.name) {
      onEdit(page.id, { name: newName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      setNewName(page.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-blue-50 text-blue-600'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isEditing && onNavigate(page.path)}
    >
      {/* Poignée de drag */}
      <div
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
      >
        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 5h2v2H9V5zm0 4h2v2H9V9zm4-4h2v2h-2V5zm0 4h2v2h-2V9z" />
        </svg>
      </div>

      {/* Icône */}
      <span className="text-lg ml-4">{page.icon}</span>

      {/* Nom */}
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-white border border-blue-300 rounded px-1 outline-none focus:border-blue-500"
          autoFocus
        />
      ) : (
        <span className="flex-1">{page.name}</span>
      )}

      {/* Actions */}
      {isHovered && !page.fixed && !isEditing && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Renommer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Supprimer "${page.name}" ?`)) {
                onDelete(page.id);
              }
            }}
            className="p-1 hover:bg-red-100 rounded text-red-500"
            title="Supprimer"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Actions pour les pages fixes (renommer seulement) */}
      {isHovered && page.fixed && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="p-1 hover:bg-gray-200 rounded"
          title="Renommer"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  );
};

const SidebarWithPages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { radars } = useContext(AppContext);
  const [pages, setPages] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('📝');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Charger les pages
  const loadPages = () => {
    const allPages = getAllPages();
    setPages(allPages);
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Gérer le drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = pages.findIndex(p => p.id === active.id);
      const newIndex = pages.findIndex(p => p.id === over.id);

      const newPages = arrayMove(pages, oldIndex, newIndex);
      setPages(newPages);

      // Sauvegarder le nouvel ordre
      savePagesOrder(newPages.map(p => p.id));
    }
  };

  // Créer une nouvelle page
  const handleCreatePage = () => {
    if (newPageName.trim()) {
      const newPage = createPage(newPageName.trim(), newPageIcon);
      navigate(newPage.path);
      setNewPageName('');
      setNewPageIcon('📝');
      setShowNewPageModal(false);
      loadPages();
    }
  };

  // Modifier une page
  const handleEditPage = (pageId, updates) => {
    updatePage(pageId, updates);
    loadPages();
  };

  // Supprimer une page
  const handleDeletePage = (pageId) => {
    deletePage(pageId);
    loadPages();
    // Si on est sur la page supprimée, rediriger
    const page = pages.find(p => p.id === pageId);
    if (page && location.pathname === page.path) {
      navigate('/');
    }
  };

  const commonEmojis = ['📝', '📄', '📋', '📌', '🗂️', '📁', '📊', '💡', '🎯', '⭐', '🔥', '🚀'];

  return (
    <>
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* En-tête */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-xl text-gray-800 ${isCollapsed ? 'hidden' : 'block'}`}>
              Mon Espace
            </h1>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Liste des pages */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isCollapsed && (
            <>
              {/* Pages fixes et custom */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pages.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {pages.map(page => (
                      <SortableMenuItem
                        key={page.id}
                        page={page}
                        isActive={location.pathname === page.path}
                        onNavigate={navigate}
                        onEdit={handleEditPage}
                        onDelete={handleDeletePage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Bouton nouvelle page */}
              <button
                onClick={() => setShowNewPageModal(true)}
                className="w-full mt-4 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle page
              </button>

              {/* Section Radars */}
              {radars.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                    Radars
                  </h3>
                  <div className="space-y-1">
                    {radars.map(radar => (
                      <button
                        key={radar.id}
                        onClick={() => navigate(`/radar/${radar.id}`)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          location.pathname.includes(`/radar/${radar.id}`)
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{radar.icon}</span>
                        <span className="flex-1 text-left">{radar.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Version collapsed */}
          {isCollapsed && (
            <div className="space-y-2">
              {pages.slice(0, 5).map(page => (
                <button
                  key={page.id}
                  onClick={() => navigate(page.path)}
                  className={`w-full p-2 rounded-lg transition-colors ${
                    location.pathname === page.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title={page.name}
                >
                  <span className="text-lg">{page.icon}</span>
                </button>
              ))}
              <button
                onClick={() => setShowNewPageModal(true)}
                className="w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Nouvelle page"
              >
                <svg className="w-4 h-4 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouvelle page */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nouvelle page</h2>

            {/* Sélecteur d'emoji */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
              <div className="grid grid-cols-6 gap-2">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewPageIcon(emoji)}
                    className={`p-2 text-2xl rounded-lg hover:bg-gray-100 ${
                      newPageIcon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Nom de la page */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Ma nouvelle page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarWithPages;
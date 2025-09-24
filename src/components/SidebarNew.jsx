import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import pageHierarchyService from '../services/pageHierarchyService';
import { getIcon } from './icons/SvgIcons';

const SidebarNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace } = useWorkspace();
  const [pages, setPages] = useState({});
  const [expandedPages, setExpandedPages] = useState({});
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageParent, setNewPageParent] = useState(null);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Charger les pages au démarrage
  useEffect(() => {
    const allPages = pageHierarchyService.getAllPages();
    setPages(allPages);

    // Initialiser les états d'expansion
    const expanded = {};
    Object.values(allPages).forEach(page => {
      expanded[page.id] = page.isExpanded;
    });
    setExpandedPages(expanded);
  }, []);

  // Toggle expand/collapse
  const toggleExpand = (pageId) => {
    const newExpanded = !expandedPages[pageId];
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: newExpanded
    }));
    pageHierarchyService.toggleExpand(pageId);
  };

  // Créer une nouvelle page
  const handleCreatePage = (parentId = null) => {
    if (newPageTitle.trim()) {
      const newPage = pageHierarchyService.createPage(parentId, newPageTitle, 'document');
      setPages(pageHierarchyService.getAllPages());
      setNewPageTitle('');
      setShowNewPage(false);
      setNewPageParent(null);
      navigate(`/page/${newPage.id}`);
    }
  };

  // Supprimer une page
  const handleDeletePage = (pageId, e) => {
    e.stopPropagation();
    if (confirm('Supprimer cette page et toutes ses sous-pages ?')) {
      pageHierarchyService.deletePage(pageId);
      setPages(pageHierarchyService.getAllPages());
    }
  };

  // Renommer une page
  const handleRenamePage = (pageId, newTitle) => {
    pageHierarchyService.updatePage(pageId, { title: newTitle });
    setPages(pageHierarchyService.getAllPages());
  };

  // Render une page et ses enfants (récursif)
  const renderPageTree = (pageId, depth = 0) => {
    const page = pages[pageId];
    if (!page) return null;

    const hasChildren = page.children && page.children.length > 0;
    const isExpanded = expandedPages[pageId];
    const isActive = location.pathname === `/${pageId}` || location.pathname === `/page/${pageId}`;

    return (
      <div key={pageId}>
        {/* Page item */}
        <div
          className={`
            group flex items-center px-2 py-1 mx-1 rounded-md cursor-pointer
            hover:bg-gray-100 transition-colors
            ${isActive ? 'bg-gray-100' : ''}
          `}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {/* Expand/collapse arrow */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(pageId);
              }}
              className="p-0.5 mr-1 hover:bg-gray-200 rounded"
            >
              <span className="text-gray-400 text-xs">
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>
          )}

          {/* Page icon and title */}
          <div
            className="flex items-center gap-2 flex-1"
            onClick={() => navigate(`/${pageId}`)}
          >
            <span className="text-gray-600">
              {getIcon(page.icon || 'document', 'w-4 h-4')}
            </span>
            <span className="text-sm text-gray-700 flex-1">{page.title}</span>
          </div>

          {/* Actions (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewPageParent(pageId);
                setShowNewPage(true);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Ajouter une sous-page"
            >
              {getIcon('plus', 'w-3 h-3 text-gray-400')}
            </button>
            <button
              onClick={(e) => handleDeletePage(pageId, e)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Supprimer"
            >
              {getIcon('delete', 'w-3 h-3 text-gray-400')}
            </button>
          </div>
        </div>

        {/* Children (if expanded) */}
        {hasChildren && isExpanded && (
          <div>
            {page.children.map(childId => renderPageTree(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Obtenir les pages racines
  const rootPages = pageHierarchyService.getRootPages();

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon('folder', 'w-5 h-5 text-gray-600')}
            <span className="font-medium text-gray-800">
              {currentWorkspace?.name || 'Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full px-3 py-1.5 pl-8 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
          />
          <span className="absolute left-2.5 top-2 text-gray-400">
            {getIcon('search', 'w-4 h-4')}
          </span>
        </div>
      </div>

      {/* Pages tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {rootPages.map(page => renderPageTree(page.id))}

        {/* New page button */}
        <button
          onClick={() => {
            setNewPageParent(null);
            setShowNewPage(true);
          }}
          className="w-full px-3 py-1.5 mx-1 text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
        >
          {getIcon('plus', 'w-4 h-4')}
          <span>Nouvelle page</span>
        </button>
      </div>

      {/* New page input */}
      {showNewPage && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <input
            type="text"
            placeholder="Nom de la page..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePage(newPageParent)}
            onBlur={() => {
              if (!newPageTitle) {
                setShowNewPage(false);
                setNewPageParent(null);
              }
            }}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>
      )}

      {/* Bottom actions */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => navigate('/settings')}
          className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
        >
          {getIcon('settings', 'w-4 h-4')}
          <span>Paramètres</span>
        </button>
        <button
          onClick={() => navigate('/trash')}
          className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center gap-2"
        >
          {getIcon('trash', 'w-4 h-4')}
          <span>Corbeille</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarNew;
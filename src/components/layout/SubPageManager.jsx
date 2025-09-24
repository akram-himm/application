import React, { useState, useEffect } from 'react';
import { getIcon } from '../icons/SvgIcons';
import LayoutManager from './LayoutManager';

const SubPageManager = ({ pageId, defaultComponent, defaultProps }) => {
  const [subPages, setSubPages] = useState([]);
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [showNewSubPage, setShowNewSubPage] = useState(false);
  const [newSubPageName, setNewSubPageName] = useState('');

  // Charger les sous-pages depuis localStorage
  useEffect(() => {
    const savedSubPages = localStorage.getItem(`subPages_${pageId}`);
    if (savedSubPages) {
      setSubPages(JSON.parse(savedSubPages));
    }
  }, [pageId]);

  // Sauvegarder les sous-pages
  useEffect(() => {
    if (subPages.length > 0) {
      localStorage.setItem(`subPages_${pageId}`, JSON.stringify(subPages));
    }
  }, [subPages, pageId]);

  const handleCreateSubPage = () => {
    if (newSubPageName.trim()) {
      const newSubPage = {
        id: `${pageId}_sub_${Date.now()}`,
        name: newSubPageName,
        icon: 'document',
        createdAt: new Date().toISOString()
      };
      setSubPages([...subPages, newSubPage]);
      setNewSubPageName('');
      setShowNewSubPage(false);
      setActiveSubPage(newSubPage.id);
    }
  };

  const handleDeleteSubPage = (subPageId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-page ?')) {
      setSubPages(subPages.filter(sp => sp.id !== subPageId));
      // Supprimer aussi le layout de la sous-page
      localStorage.removeItem(`layouts_${subPageId}`);
      localStorage.removeItem(`pageConfigs_${subPageId}`);
      if (activeSubPage === subPageId) {
        setActiveSubPage(null);
      }
    }
  };

  const handleRenameSubPage = (subPageId, newName) => {
    setSubPages(subPages.map(sp =>
      sp.id === subPageId ? { ...sp, name: newName } : sp
    ));
  };

  // Si une sous-page est active, afficher son contenu
  if (activeSubPage) {
    const currentSubPage = subPages.find(sp => sp.id === activeSubPage);

    return (
      <div className="h-full flex flex-col">
        {/* Header de sous-page */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubPage(null)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Retour à la page parent"
            >
              {getIcon('arrow-left', 'w-4 h-4')}
            </button>
            <span className="text-sm text-gray-500">Sous-page:</span>
            <input
              type="text"
              value={currentSubPage?.name || ''}
              onChange={(e) => handleRenameSubPage(activeSubPage, e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleDeleteSubPage(activeSubPage)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Supprimer cette sous-page"
          >
            {getIcon('delete', 'w-4 h-4')}
          </button>
        </div>

        {/* Contenu de la sous-page */}
        <div className="flex-1">
          <LayoutManager
            pageId={activeSubPage}
            defaultComponent={defaultComponent}
            defaultProps={defaultProps}
          />
        </div>
      </div>
    );
  }

  // Affichage de la page parent avec liste des sous-pages
  return (
    <div className="h-full flex">
      {/* Sidebar des sous-pages */}
      {subPages.length > 0 && (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Sous-pages</span>
              <button
                onClick={() => setShowNewSubPage(true)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Nouvelle sous-page"
              >
                {getIcon('plus', 'w-4 h-4')}
              </button>
            </div>

            {/* Formulaire nouvelle sous-page */}
            {showNewSubPage && (
              <div className="flex items-center gap-1 mb-2">
                <input
                  type="text"
                  placeholder="Nom de la sous-page"
                  value={newSubPageName}
                  onChange={(e) => setNewSubPageName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateSubPage()}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  autoFocus
                />
                <button
                  onClick={handleCreateSubPage}
                  className="text-green-500 hover:text-green-600 p-1"
                >
                  {getIcon('check', 'w-4 h-4')}
                </button>
                <button
                  onClick={() => setShowNewSubPage(false)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  {getIcon('close', 'w-4 h-4')}
                </button>
              </div>
            )}
          </div>

          {/* Liste des sous-pages */}
          <div className="flex-1 overflow-y-auto">
            {subPages.map(subPage => (
              <div
                key={subPage.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group"
                onClick={() => setActiveSubPage(subPage.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-600">
                    {getIcon(subPage.icon, 'w-4 h-4')}
                  </span>
                  <span className="text-sm">{subPage.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubPage(subPage.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1"
                >
                  {getIcon('delete', 'w-3 h-3')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 relative">
        <LayoutManager
          pageId={pageId}
          defaultComponent={defaultComponent}
          defaultProps={defaultProps}
        />

        {/* Bouton pour créer la première sous-page */}
        {subPages.length === 0 && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowNewSubPage(true)}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-2"
            >
              {getIcon('folder', 'w-4 h-4')}
              <span>Créer une sous-page</span>
            </button>

            {showNewSubPage && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Nom de la sous-page"
                    value={newSubPageName}
                    onChange={(e) => setNewSubPageName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSubPage()}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateSubPage}
                    className="text-green-500 hover:text-green-600 p-1"
                  >
                    {getIcon('check', 'w-4 h-4')}
                  </button>
                  <button
                    onClick={() => setShowNewSubPage(false)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    {getIcon('close', 'w-4 h-4')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubPageManager;
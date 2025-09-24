import React, { useState } from 'react';
import { LayoutProvider } from '../contexts/LayoutContext';
import LayoutManager from '../components/layout/LayoutManager';
import { getIcon } from '../components/icons/SvgIcons';

const TestLayout = () => {
  const [pageTitle, setPageTitle] = useState('Page de test - Layout divisible');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('layout');
  const [showIconMenu, setShowIconMenu] = useState(false);

  const availableIcons = [
    'layout', 'component', 'table', 'note', 'target',
    'list', 'calendar', 'chart', 'settings', 'folder'
  ];

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleIconClick = () => {
    setShowIconMenu(!showIconMenu);
  };

  const selectIcon = (icon) => {
    setSelectedIcon(icon);
    setShowIconMenu(false);
  };

  return (
    <LayoutProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header de page éditable */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Icône cliquable */}
            <div className="relative">
              <button
                onClick={handleIconClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Changer l'icône"
              >
                <span className="text-2xl">{getIcon(selectedIcon, 'w-6 h-6')}</span>
              </button>

              {/* Menu de sélection d'icône */}
              {showIconMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-5 gap-2 z-50">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => selectIcon(icon)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title={icon}
                    >
                      {getIcon(icon, 'w-5 h-5')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Titre éditable */}
            {isEditingTitle ? (
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none flex-1"
                autoFocus
              />
            ) : (
              <h1
                onClick={handleTitleClick}
                className="text-2xl font-bold cursor-text hover:bg-gray-50 px-2 py-1 rounded flex-1"
              >
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-2 text-sm text-gray-600">
            Cliquez droit sur n'importe quelle section pour ajouter, diviser ou supprimer des composants
          </div>
        </div>

        {/* Zone de layout */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <LayoutManager
              pageId="test-layout"
              defaultComponent="blocknote"
              defaultProps={{ content: '' }}
            />
          </div>
        </div>

        {/* Barre d'aide flottante */}
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
          <div className="text-sm font-semibold mb-2">Raccourcis</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-mono bg-gray-100 px-1 rounded">Clic droit</span>
              <span>Menu contextuel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono bg-gray-100 px-1 rounded">Glisser bordure</span>
              <span>Redimensionner</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono bg-gray-100 px-1 rounded">Clic sur titre</span>
              <span>Éditer titre</span>
            </div>
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
};

export default TestLayout;
import React, { useState, useEffect } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import LayoutManager from './LayoutManager';
import SubPageManager from './SubPageManager';
import PageMenu from './PageMenu';
import PageBreadcrumbs from './PageBreadcrumbs';
import { getIcon } from '../icons/SvgIcons';

const PageWithLayout = ({
  pageId,
  defaultTitle,
  defaultIcon = 'document',
  defaultComponent,
  defaultProps = {},
  children,
  showSplitControls = true
}) => {
  const { getPageConfig, updatePageConfig } = useLayout();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [pageMode, setPageMode] = useState('normal');

  // Charger la configuration sauvegardée
  const config = getPageConfig(pageId) || {};
  const pageTitle = config.name || defaultTitle;
  const pageIcon = config.icon || defaultIcon;

  // Vérifier le mode de page (normal ou sous-pages)
  useEffect(() => {
    const savedMode = localStorage.getItem(`pageMode_${pageId}`);
    if (savedMode) {
      setPageMode(savedMode);
    }
  }, [pageId]);

  const availableIcons = [
    'document', 'folder', 'note', 'book', 'chart', 'target',
    'list', 'calendar', 'settings', 'user', 'team', 'star',
    'heart', 'home', 'search', 'filter', 'sort', 'layout',
    'component', 'table', 'play', 'pause', 'refresh'
  ];

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    updatePageConfig(pageId, { name: e.target.value });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleIconClick = () => {
    setShowIconMenu(!showIconMenu);
  };

  const selectIcon = (icon) => {
    updatePageConfig(pageId, { icon });
    setShowIconMenu(false);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (showIconMenu && !e.target.closest('.icon-menu-container')) {
        setShowIconMenu(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showIconMenu]);

  // Si children est fourni, l'utiliser (pour les pages qui ne veulent pas de split)
  if (children && !showSplitControls) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header de page éditable */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Icône cliquable */}
            <div className="relative icon-menu-container">
              <button
                onClick={handleIconClick}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Changer l'icône"
              >
                <span className="text-2xl">{getIcon(pageIcon, 'w-6 h-6')}</span>
              </button>

              {/* Menu de sélection d'icône */}
              {showIconMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-6 gap-2 z-50 w-72">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => selectIcon(icon)}
                      className={`p-2 hover:bg-gray-100 rounded-lg ${pageIcon === icon ? 'bg-blue-100' : ''}`}
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
                defaultValue={pageTitle}
                onChange={handleTitleChange}
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
        </div>

        {/* Contenu de la page */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Menu en haut de page style Notion */}
        <PageMenu pageId={pageId} />
      </div>
    );
  }

  // Mode avec split layout
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header de page éditable */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Icône cliquable */}
          <div className="relative icon-menu-container">
            <button
              onClick={handleIconClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Changer l'icône"
            >
              <span className="text-2xl">{getIcon(pageIcon, 'w-6 h-6')}</span>
            </button>

            {/* Menu de sélection d'icône */}
            {showIconMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 grid grid-cols-6 gap-2 z-50 w-72">
                {availableIcons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => selectIcon(icon)}
                    className={`p-2 hover:bg-gray-100 rounded-lg ${pageIcon === icon ? 'bg-blue-100' : ''}`}
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
              defaultValue={pageTitle}
              onChange={handleTitleChange}
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

          {/* Instructions pour le split */}
          {showSplitControls && (
            <div className="text-sm text-gray-500">
              Clic droit pour diviser
            </div>
          )}
        </div>
      </div>

      {/* Zone de layout avec split ou sous-pages */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
          {pageMode === 'subpage' ? (
            <SubPageManager
              pageId={pageId}
              defaultComponent={defaultComponent}
              defaultProps={defaultProps}
            />
          ) : (
            <LayoutManager
              pageId={pageId}
              defaultComponent={defaultComponent}
              defaultProps={defaultProps}
            />
          )}
        </div>
      </div>

      {/* Menu en haut de page style Notion */}
      <PageMenu pageId={pageId} />
    </div>
  );
};

export default PageWithLayout;
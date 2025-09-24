import React, { useState, useEffect } from 'react';
import { getIcon } from '../icons/SvgIcons';
import { useUndoRedo } from '../../contexts/UndoRedoContext';
import { useLayout } from '../../contexts/LayoutContext';

const PageMenu = ({ pageId, onSplit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { addComponent, getPageLayout } = useLayout();

  const handleSplitPage = (direction) => {
    if (direction === 'subpage') {
      // Créer une vraie sous-page dans la hiérarchie
      const newPageId = `${pageId}_sub_${Date.now()}`;
      // TODO: Implémenter la création de sous-page hiérarchique
      console.log('Creating hierarchical subpage:', newPageId);
    } else {
      // Division de la vue actuelle
      addComponent(pageId, {
        type: 'component',
        component: 'blocknote',
        props: {}
      }, direction);
    }
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (showMenu && !e.target.closest('.page-menu-container')) {
        setShowMenu(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu]);

  return (
    <div className="page-menu-container fixed top-3 right-3 z-[9999]">
      {/* Bouton menu style Notion (•••) */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition-colors flex items-center"
        title="Options de page"
      >
        <span className="text-xl font-bold tracking-wider">•••</span>
      </button>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[240px]">

          {/* Section Split */}
          <div className="px-1 py-1">
            <button
              onClick={() => handleSplitPage('left')}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('arrow-left', 'w-4 h-4 text-gray-500')}
              <span>Split left</span>
            </button>
            <button
              onClick={() => handleSplitPage('right')}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('arrow-right', 'w-4 h-4 text-gray-500')}
              <span>Split right</span>
            </button>
            <button
              onClick={() => handleSplitPage('top')}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('arrow-up', 'w-4 h-4 text-gray-500')}
              <span>Split top</span>
            </button>
            <button
              onClick={() => handleSplitPage('bottom')}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('arrow-down', 'w-4 h-4 text-gray-500')}
              <span>Split bottom</span>
            </button>
          </div>

          <div className="h-px bg-gray-200 mx-2 my-1" />

          {/* Section Pages */}
          <div className="px-1 py-1">
            <button
              onClick={() => handleSplitPage('subpage')}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('plus', 'w-4 h-4 text-gray-500')}
              <span>Add subpage</span>
            </button>
            <button
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
              onClick={() => {
                // TODO: Turn into page
              }}
            >
              {getIcon('document', 'w-4 h-4 text-gray-500')}
              <span>Turn into page</span>
            </button>
          </div>

          <div className="h-px bg-gray-200 mx-2 my-1" />

          {/* Section Undo/Redo */}
          <div className="px-1 py-1">
            <button
              onClick={() => undo()}
              disabled={!canUndo}
              className={`w-full px-3 py-1.5 text-left text-sm rounded flex items-center gap-2 ${
                canUndo ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {getIcon('undo', 'w-4 h-4 text-gray-500')}
              <span>Undo</span>
              <span className="ml-auto text-xs text-gray-400">Ctrl+Z</span>
            </button>
            <button
              onClick={() => redo()}
              disabled={!canRedo}
              className={`w-full px-3 py-1.5 text-left text-sm rounded flex items-center gap-2 ${
                canRedo ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {getIcon('redo', 'w-4 h-4 text-gray-500')}
              <span>Redo</span>
              <span className="ml-auto text-xs text-gray-400">Ctrl+Y</span>
            </button>
          </div>

          <div className="h-px bg-gray-200 mx-2 my-1" />

          {/* Section Actions */}
          <div className="px-1 py-1">
            <button
              onClick={() => {
                const layout = getPageLayout(pageId);
                if (layout) {
                  navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
                  setShowMenu(false);
                }
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              {getIcon('copy', 'w-4 h-4 text-gray-500')}
              <span>Copy layout</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset page to default?')) {
                  localStorage.removeItem(`layouts_${pageId}`);
                  localStorage.removeItem(`pageConfigs_${pageId}`);
                  window.location.reload();
                }
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2 text-red-600"
            >
              {getIcon('trash', 'w-4 h-4')}
              <span>Reset page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageMenu;
import React, { useState } from 'react';
import { getIcon } from '../icons/SvgIcons';
import { useUndoRedo } from '../../contexts/UndoRedoContext';
import { useLayout } from '../../contexts/LayoutContext';

const PageToolbar = ({ pageId, onSplit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { addComponent, getPageLayout } = useLayout();

  const handleSplitPage = (direction) => {
    if (direction === 'subpage') {
      // Activer le mode sous-pages
      localStorage.setItem(`pageMode_${pageId}`, 'subpage');
      window.location.reload();
    } else {
      if (onSplit) {
        onSplit(direction);
      } else {
        // Utiliser le système de layout existant
        addComponent(pageId, {
          type: 'component',
          component: 'blocknote',
          props: {}
        }, direction);
      }
    }
    setShowSplitMenu(false);
    setShowMenu(false);
  };

  const splitOptions = [
    {
      id: 'left',
      label: 'Diviser à gauche',
      icon: 'arrow-left',
      description: 'Ajouter une section à gauche'
    },
    {
      id: 'right',
      label: 'Diviser à droite',
      icon: 'arrow-right',
      description: 'Ajouter une section à droite'
    },
    {
      id: 'top',
      label: 'Diviser en haut',
      icon: 'arrow-up',
      description: 'Ajouter une section en haut'
    },
    {
      id: 'bottom',
      label: 'Diviser en bas',
      icon: 'arrow-down',
      description: 'Ajouter une section en bas'
    },
    {
      id: 'subpage',
      label: 'Créer une sous-page',
      icon: 'folder',
      description: 'Transformer en page parent/enfant'
    }
  ];

  return (
    <>
      {/* Bouton principal flottant */}
      <div className="fixed bottom-20 right-4 z-[9998]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center group"
          title="Outils de page"
        >
          {getIcon('settings', 'w-6 h-6')}
        </button>

        {/* Menu principal */}
        {showMenu && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[250px]">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200">
              OUTILS DE PAGE
            </div>

            {/* Option Split */}
            <button
              onClick={() => setShowSplitMenu(!showSplitMenu)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-500">{getIcon('layout', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Diviser la page</div>
                  <div className="text-xs text-gray-500">Split en sections</div>
                </div>
              </div>
              <span className="text-gray-400">
                {getIcon('arrow-right', 'w-4 h-4')}
              </span>
            </button>

            {/* Undo/Redo */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => undo()}
                disabled={!canUndo}
                className={`w-full px-3 py-2 text-left rounded flex items-center gap-3 ${
                  canUndo ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-gray-600">{getIcon('undo', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Annuler</div>
                  <div className="text-xs text-gray-500">Ctrl+Z</div>
                </div>
              </button>

              <button
                onClick={() => redo()}
                disabled={!canRedo}
                className={`w-full px-3 py-2 text-left rounded flex items-center gap-3 ${
                  canRedo ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-gray-600">{getIcon('redo', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Refaire</div>
                  <div className="text-xs text-gray-500">Ctrl+Y</div>
                </div>
              </button>
            </div>

            {/* Actions rapides */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={() => {
                  // Copier le layout actuel
                  const layout = getPageLayout(pageId);
                  if (layout) {
                    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
                    alert('Layout copié dans le presse-papiers');
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center gap-3"
              >
                <span className="text-gray-600">{getIcon('copy', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Copier le layout</div>
                  <div className="text-xs text-gray-500">Export JSON</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const currentMode = localStorage.getItem(`pageMode_${pageId}`);
                  if (currentMode === 'subpage') {
                    localStorage.removeItem(`pageMode_${pageId}`);
                    window.location.reload();
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center gap-3"
              >
                <span className="text-purple-500">{getIcon('layout', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Mode normal</div>
                  <div className="text-xs text-gray-500">Sans sous-pages</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm('Réinitialiser la page à son état par défaut ?')) {
                    localStorage.removeItem(`layouts_${pageId}`);
                    localStorage.removeItem(`pageConfigs_${pageId}`);
                    localStorage.removeItem(`pageMode_${pageId}`);
                    localStorage.removeItem(`subPages_${pageId}`);
                    window.location.reload();
                  }
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center gap-3 text-red-600"
              >
                <span>{getIcon('refresh', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Réinitialiser</div>
                  <div className="text-xs text-red-500">Retour par défaut</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Sous-menu Split */}
        {showMenu && showSplitMenu && (
          <div className="absolute bottom-full right-[260px] mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[250px]">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200">
              OPTIONS DE DIVISION
            </div>

            {splitOptions.map(option => (
              <button
                key={option.id}
                onClick={() => handleSplitPage(option.id)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center gap-3"
              >
                <span className={`${option.id === 'subpage' ? 'text-purple-500' : 'text-blue-500'}`}>
                  {getIcon(option.icon, 'w-5 h-5')}
                </span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}

            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center gap-3"
                onClick={() => {
                  alert('Astuce: Faites un clic droit sur n\'importe quelle section pour plus d\'options');
                }}
              >
                <span className="text-amber-500">{getIcon('info', 'w-5 h-5')}</span>
                <div>
                  <div className="font-medium">Aide</div>
                  <div className="text-xs text-gray-500">Clic droit pour plus</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de raccourcis clavier */}
      {showMenu && (
        <div className="fixed bottom-4 right-4 bg-black/75 text-white text-xs rounded-lg px-3 py-2 z-[9997]">
          <div className="flex items-center gap-4">
            <span>ESC pour fermer</span>
            <span>• Clic droit pour menu contextuel</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PageToolbar;
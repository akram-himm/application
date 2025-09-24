import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { getIcon } from '../icons/SvgIcons';

const SplitPane = ({
  direction = 'horizontal',
  sizes = [50, 50],
  children,
  onSizeChange,
  minSize = 200
}) => {
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    paneIndex: null
  });

  const handleContextMenu = useCallback((e, index) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      paneIndex: index
    });
  }, []);

  const handleAddComponent = (position) => {
    console.log('Add component at position:', position);
    setContextMenu({ show: false, x: 0, y: 0, paneIndex: null });
  };

  const handleRemovePane = () => {
    console.log('Remove pane:', contextMenu.paneIndex);
    setContextMenu({ show: false, x: 0, y: 0, paneIndex: null });
  };

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, paneIndex: null });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu.show]);

  return (
    <>
      <Allotment
        vertical={direction === 'vertical'}
        onChange={onSizeChange}
        defaultSizes={sizes}
      >
        {React.Children.map(children, (child, index) => (
          <Allotment.Pane minSize={minSize}>
            <div
              className="h-full w-full relative group"
              onContextMenu={(e) => handleContextMenu(e, index)}
            >
              {child}

              {/* Floating action button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
                  onClick={(e) => handleContextMenu(e, index)}
                  title="Options"
                >
                  {getIcon('settings', 'w-4 h-4')}
                </button>
              </div>
            </div>
          </Allotment.Pane>
        ))}
      </Allotment>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-[10000] bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleAddComponent('left')}
          >
            {getIcon('arrow-left', 'w-4 h-4')}
            <span>Ajouter à gauche</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleAddComponent('right')}
          >
            {getIcon('arrow-right', 'w-4 h-4')}
            <span>Ajouter à droite</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleAddComponent('top')}
          >
            {getIcon('arrow-up', 'w-4 h-4')}
            <span>Ajouter en haut</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleAddComponent('bottom')}
          >
            {getIcon('arrow-down', 'w-4 h-4')}
            <span>Ajouter en bas</span>
          </button>
          <div className="h-px bg-gray-200 my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            onClick={handleRemovePane}
          >
            {getIcon('delete', 'w-4 h-4')}
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </>
  );
};

export default SplitPane;
import React, { useState, useCallback, useEffect } from 'react';
import { useLayout } from '../../contexts/LayoutContext';
import SplitPane from './SplitPane';
import ComponentRegistry from './ComponentRegistry';
import { getIcon } from '../icons/SvgIcons';

const LayoutManager = ({ pageId, defaultComponent, defaultProps = {} }) => {
  const { getPageLayout, updatePageLayout, addComponent } = useLayout();
  const [layout, setLayout] = useState(null);
  const [showComponentMenu, setShowComponentMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState(null);

  useEffect(() => {
    const savedLayout = getPageLayout(pageId);
    if (savedLayout) {
      setLayout(savedLayout);
    } else {
      // Layout par défaut
      setLayout({
        type: 'component',
        component: defaultComponent,
        props: defaultProps
      });
    }
  }, [pageId, getPageLayout, defaultComponent, defaultProps]);

  const handleAddComponent = useCallback((position, newComponent) => {
    const currentLayout = layout || {
      type: 'component',
      component: defaultComponent,
      props: defaultProps
    };

    const newComponentNode = {
      type: 'component',
      component: newComponent.type,
      props: newComponent.props || {}
    };

    let newLayout;
    const isHorizontal = position === 'left' || position === 'right';
    const isFirst = position === 'left' || position === 'top';

    if (currentLayout.type === 'component') {
      // Créer une nouvelle division
      newLayout = {
        type: 'split',
        direction: isHorizontal ? 'horizontal' : 'vertical',
        sizes: [50, 50],
        children: isFirst
          ? [newComponentNode, currentLayout]
          : [currentLayout, newComponentNode]
      };
    } else if (currentLayout.type === 'split') {
      // Ajouter à une division existante
      // Pour simplifier, on remplace le layout actuel par une nouvelle division
      // Dans une implémentation plus avancée, on pourrait insérer dans la division existante
      newLayout = {
        type: 'split',
        direction: isHorizontal ? 'horizontal' : 'vertical',
        sizes: [50, 50],
        children: isFirst
          ? [newComponentNode, currentLayout]
          : [currentLayout, newComponentNode]
      };
    }

    setLayout(newLayout);
    updatePageLayout(pageId, newLayout);
  }, [layout, pageId, updatePageLayout, defaultComponent, defaultProps]);

  const handleRemoveComponent = useCallback((path) => {
    // Logique pour supprimer un composant
    // Path est un tableau d'indices indiquant le chemin vers le composant
    console.log('Remove component at path:', path);
  }, []);

  const handleSizeChange = useCallback((sizes) => {
    if (layout && layout.type === 'split') {
      const newLayout = { ...layout, sizes };
      setLayout(newLayout);
      updatePageLayout(pageId, newLayout);
    }
  }, [layout, pageId, updatePageLayout]);

  const openComponentMenu = useCallback((position, event) => {
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setTargetPosition(position);
    setShowComponentMenu(true);
  }, []);

  const handleSelectComponent = useCallback((componentType) => {
    if (targetPosition) {
      handleAddComponent(targetPosition, { type: componentType });
    }
    setShowComponentMenu(false);
    setTargetPosition(null);
  }, [targetPosition, handleAddComponent]);

  const renderLayout = useCallback((node, path = []) => {
    if (!node) return null;

    if (node.type === 'component') {
      const Component = ComponentRegistry[node.component];
      if (!Component) {
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Composant non trouvé: {node.component}</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={(e) => openComponentMenu('replace', e)}
              >
                Ajouter un composant
              </button>
            </div>
          </div>
        );
      }
      return (
        <div className="h-full w-full relative">
          <Component {...node.props} pageId={pageId} />
        </div>
      );
    }

    if (node.type === 'split') {
      return (
        <SplitPane
          direction={node.direction}
          sizes={node.sizes}
          onSizeChange={handleSizeChange}
        >
          {node.children.map((child, index) => (
            <div key={index} className="h-full w-full">
              {renderLayout(child, [...path, index])}
            </div>
          ))}
        </SplitPane>
      );
    }

    return null;
  }, [pageId, handleSizeChange, openComponentMenu]);

  useEffect(() => {
    const handleClick = () => {
      if (showComponentMenu) {
        setShowComponentMenu(false);
        setTargetPosition(null);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showComponentMenu]);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin">
          {getIcon('refresh', 'w-6 h-6 text-gray-400')}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {renderLayout(layout)}

      {/* Menu de sélection de composant */}
      {showComponentMenu && (
        <div
          className="fixed z-[10000] bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[250px]"
          style={{
            left: menuPosition.x,
            top: menuPosition.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200">
            Choisir un composant
          </div>

          {Object.entries(ComponentRegistry).map(([key, Component]) => (
            <button
              key={key}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
              onClick={() => handleSelectComponent(key)}
            >
              <span className="text-gray-500">
                {Component.icon ? getIcon(Component.icon, 'w-4 h-4') : getIcon('component', 'w-4 h-4')}
              </span>
              <div>
                <div className="font-medium">{Component.displayName || key}</div>
                {Component.description && (
                  <div className="text-xs text-gray-500">{Component.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayoutManager;
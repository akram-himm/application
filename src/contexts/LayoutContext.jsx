import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from './WorkspaceContext';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  const { currentWorkspace } = useWorkspace();
  const [layouts, setLayouts] = useState({});
  const [pageConfigs, setPageConfigs] = useState({});

  // Charger les layouts depuis localStorage
  useEffect(() => {
    if (currentWorkspace) {
      const savedLayouts = localStorage.getItem(`layouts_${currentWorkspace.id}`);
      const savedConfigs = localStorage.getItem(`pageConfigs_${currentWorkspace.id}`);

      if (savedLayouts) {
        setLayouts(JSON.parse(savedLayouts));
      }
      if (savedConfigs) {
        setPageConfigs(JSON.parse(savedConfigs));
      }
    }
  }, [currentWorkspace]);

  // Sauvegarder les layouts
  useEffect(() => {
    if (currentWorkspace && Object.keys(layouts).length > 0) {
      localStorage.setItem(`layouts_${currentWorkspace.id}`, JSON.stringify(layouts));
    }
  }, [layouts, currentWorkspace]);

  // Sauvegarder les configs de pages
  useEffect(() => {
    if (currentWorkspace && Object.keys(pageConfigs).length > 0) {
      localStorage.setItem(`pageConfigs_${currentWorkspace.id}`, JSON.stringify(pageConfigs));
    }
  }, [pageConfigs, currentWorkspace]);

  // Obtenir le layout d'une page
  const getPageLayout = (pageId) => {
    return layouts[pageId] || null;
  };

  // Mettre à jour le layout d'une page
  const updatePageLayout = (pageId, layout) => {
    setLayouts(prev => ({
      ...prev,
      [pageId]: layout
    }));
  };

  // Ajouter un composant à une position
  const addComponent = (pageId, component, position = 'right') => {
    const currentLayout = layouts[pageId];

    if (!currentLayout) {
      // Première division de la page
      setLayouts(prev => ({
        ...prev,
        [pageId]: {
          type: 'split',
          direction: position === 'left' || position === 'right' ? 'horizontal' : 'vertical',
          sizes: [50, 50],
          children: position === 'left' || position === 'top'
            ? [component, { type: 'component', component: 'original' }]
            : [{ type: 'component', component: 'original' }, component]
        }
      }));
    } else {
      // Ajouter à un layout existant
      // Logique plus complexe pour gérer les divisions imbriquées
      // À implémenter selon les besoins
    }
  };

  // Supprimer un composant
  const removeComponent = (pageId, componentId) => {
    // À implémenter
  };

  // Obtenir la config d'une page (titre, icône, etc.)
  const getPageConfig = (pageId) => {
    return pageConfigs[pageId] || {};
  };

  // Mettre à jour la config d'une page
  const updatePageConfig = (pageId, config) => {
    setPageConfigs(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        ...config
      }
    }));
  };

  // Renommer une page
  const renamePage = (pageId, newName) => {
    updatePageConfig(pageId, { name: newName });
  };

  // Changer l'icône d'une page
  const updatePageIcon = (pageId, icon) => {
    updatePageConfig(pageId, { icon });
  };

  const value = {
    layouts,
    pageConfigs,
    getPageLayout,
    updatePageLayout,
    addComponent,
    removeComponent,
    getPageConfig,
    updatePageConfig,
    renamePage,
    updatePageIcon
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
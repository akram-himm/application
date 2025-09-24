import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as workspaceService from '../services/workspaceService';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les workspaces au montage
  useEffect(() => {
    loadWorkspaces();

    // Écouter les changements de workspace
    const handleWorkspaceChange = (event) => {
      loadWorkspaces();
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, []);

  const loadWorkspaces = useCallback(() => {
    try {
      setLoading(true);
      const allWorkspaces = workspaceService.getAllWorkspaces();
      const current = workspaceService.getCurrentWorkspace();

      setWorkspaces(allWorkspaces);
      setCurrentWorkspace(current);
    } catch (error) {
      console.error('Erreur lors du chargement des workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchWorkspace = useCallback((workspaceId) => {
    try {
      // Vérifier si on n'est pas déjà en train de changer de workspace
      if (window.workspaceSwitching) {
        return false;
      }

      // Marquer qu'on est en train de changer
      window.workspaceSwitching = true;

      // Ajouter une classe de transition avant le changement
      document.body.classList.add('workspace-switching');

      const success = workspaceService.setCurrentWorkspace(workspaceId);
      if (success) {
        loadWorkspaces();

        // Attendre un peu pour la transition visuelle
        setTimeout(() => {
          // Nettoyer le flag avant de recharger
          window.workspaceSwitching = false;
          // Recharger la page pour réinitialiser toutes les données
          window.location.reload();
        }, 150);
      } else {
        window.workspaceSwitching = false;
        document.body.classList.remove('workspace-switching');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors du changement de workspace:', error);
      window.workspaceSwitching = false;
      document.body.classList.remove('workspace-switching');
      return false;
    }
  }, [loadWorkspaces]);

  const createWorkspace = useCallback((name, icon, color) => {
    try {
      const newWorkspace = workspaceService.createNewWorkspace(name, icon, color);
      if (newWorkspace) {
        loadWorkspaces();
        return newWorkspace;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la création du workspace:', error);
      return null;
    }
  }, [loadWorkspaces]);

  const updateWorkspace = useCallback((workspaceId, updates) => {
    try {
      const success = workspaceService.updateWorkspace(workspaceId, updates);
      if (success) {
        loadWorkspaces();
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du workspace:', error);
      return false;
    }
  }, [loadWorkspaces]);

  const deleteWorkspace = useCallback((workspaceId) => {
    try {
      const success = workspaceService.deleteWorkspace(workspaceId);
      if (success) {
        loadWorkspaces();
        // Si le workspace supprimé était le workspace actuel, recharger la page
        if (currentWorkspace?.id === workspaceId) {
          window.location.reload();
        }
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression du workspace:', error);
      return false;
    }
  }, [loadWorkspaces, currentWorkspace]);

  const duplicateWorkspace = useCallback((workspaceId, newName) => {
    try {
      const duplicated = workspaceService.duplicateWorkspace(workspaceId, newName);
      if (duplicated) {
        loadWorkspaces();
        return duplicated;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la duplication du workspace:', error);
      return null;
    }
  }, [loadWorkspaces]);

  // Méthodes pour accéder aux données du workspace actuel
  const getWorkspaceData = useCallback((dataType) => {
    return workspaceService.getWorkspaceData(dataType);
  }, []);

  const saveWorkspaceData = useCallback((dataType, data) => {
    return workspaceService.saveWorkspaceData(dataType, data);
  }, []);

  const value = {
    workspaces,
    currentWorkspace,
    loading,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    getWorkspaceData,
    saveWorkspaceData,
    reloadWorkspaces: loadWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
// Composant pour gérer les requêtes API depuis ChatGPT
import { useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { createPage } from '../services/pageService';
import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const APIHandler = () => {
  const { currentWorkspace, switchWorkspace } = useWorkspace();
  const { addTask } = useContext(AppContext);

  useEffect(() => {
    // Écouter les commandes API depuis le main process
    const handleCreatePage = async (event, data) => {
      try {
        const newPage = createPage(data.name, data.icon, data.content);

        // Envoyer la réponse
        window.electron?.ipcRenderer.send('api-create-page-response', {
          success: true,
          page: newPage
        });
      } catch (error) {
        window.electron?.ipcRenderer.send('api-create-page-response', {
          success: false,
          error: error.message
        });
      }
    };

    const handleCreateTask = async (event, data) => {
      try {
        const newTask = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          priority: data.priority || 'Normal',
          status: 'À faire',
          createdAt: new Date().toISOString()
        };

        addTask(newTask);

        window.electron?.ipcRenderer.send('api-create-task-response', {
          success: true,
          task: newTask
        });
      } catch (error) {
        window.electron?.ipcRenderer.send('api-create-task-response', {
          success: false,
          error: error.message
        });
      }
    };

    const handleGetWorkspace = () => {
      window.electron?.ipcRenderer.send('api-workspace-response', {
        success: true,
        workspace: currentWorkspace
      });
    };

    const handleSwitchWorkspace = async (event, data) => {
      try {
        const success = await switchWorkspace(data.workspaceId);

        window.electron?.ipcRenderer.send('api-switch-workspace-response', {
          success,
          workspaceId: data.workspaceId
        });
      } catch (error) {
        window.electron?.ipcRenderer.send('api-switch-workspace-response', {
          success: false,
          error: error.message
        });
      }
    };

    // Ajouter les listeners
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('api-create-page', handleCreatePage);
      window.electron.ipcRenderer.on('api-create-task', handleCreateTask);
      window.electron.ipcRenderer.on('api-get-workspace', handleGetWorkspace);
      window.electron.ipcRenderer.on('api-switch-workspace', handleSwitchWorkspace);
    }

    // Cleanup
    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners('api-create-page');
        window.electron.ipcRenderer.removeAllListeners('api-create-task');
        window.electron.ipcRenderer.removeAllListeners('api-get-workspace');
        window.electron.ipcRenderer.removeAllListeners('api-switch-workspace');
      }
    };
  }, [currentWorkspace, switchWorkspace, addTask]);

  return null;
};

export default APIHandler;
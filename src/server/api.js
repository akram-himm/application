// Serveur API pour permettre à ChatGPT d'interagir avec l'app
import express from 'express';
import cors from 'cors';
import { ipcMain } from 'electron';

export function startAPIServer(mainWindow) {
  const app = express();
  const PORT = 3456;

  // Permettre CORS pour ChatGPT
  app.use(cors({
    origin: ['https://chat.openai.com', 'http://localhost:*'],
    credentials: true
  }));
  app.use(express.json());

  // Routes API
  app.post('/api/pages/create', async (req, res) => {
    const { name, icon, content } = req.body;

    // Communiquer avec le renderer via IPC
    mainWindow.webContents.send('api-create-page', {
      name,
      icon,
      content
    });

    // Attendre la réponse
    const result = await new Promise((resolve) => {
      ipcMain.once('api-create-page-response', (event, data) => {
        resolve(data);
      });
    });

    res.json(result);
  });

  app.post('/api/tasks/create', async (req, res) => {
    const { title, description, priority } = req.body;

    mainWindow.webContents.send('api-create-task', {
      title,
      description,
      priority
    });

    const result = await new Promise((resolve) => {
      ipcMain.once('api-create-task-response', (event, data) => {
        resolve(data);
      });
    });

    res.json(result);
  });

  app.get('/api/workspace/current', async (req, res) => {
    mainWindow.webContents.send('api-get-workspace');

    const result = await new Promise((resolve) => {
      ipcMain.once('api-workspace-response', (event, data) => {
        resolve(data);
      });
    });

    res.json(result);
  });

  app.post('/api/workspace/switch', async (req, res) => {
    const { workspaceId } = req.body;

    mainWindow.webContents.send('api-switch-workspace', { workspaceId });

    const result = await new Promise((resolve) => {
      ipcMain.once('api-switch-workspace-response', (event, data) => {
        resolve(data);
      });
    });

    res.json(result);
  });

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      app: 'Gestion Desktop',
      version: '1.0.0'
    });
  });

  app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
  });

  return app;
}
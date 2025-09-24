const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

let mainWindow;
let apiServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // En développement
  mainWindow.loadURL('http://localhost:5173');

  // En production
  // mainWindow.loadFile('dist/index.html');

  // Démarrer le serveur API
  startAPIServer();
}

function startAPIServer() {
  const app = express();
  const PORT = 3456;

  app.use(cors({
    origin: ['https://chat.openai.com', 'https://chatgpt.com', 'http://localhost:*'],
    credentials: true
  }));
  app.use(express.json());

  // Route de test
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      app: 'Gestion Desktop',
      version: '1.0.0',
      workspace: 'Connected'
    });
  });

  // Créer une page
  app.post('/api/pages/create', async (req, res) => {
    try {
      // Envoyer la commande au renderer
      mainWindow.webContents.send('api-command', {
        action: 'create-page',
        data: req.body
      });

      // Attendre la réponse
      const result = await new Promise((resolve) => {
        ipcMain.once('api-response-create-page', (event, data) => {
          resolve(data);
        });

        // Timeout après 5 secondes
        setTimeout(() => {
          resolve({ success: false, error: 'Timeout' });
        }, 5000);
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Créer une tâche
  app.post('/api/tasks/create', async (req, res) => {
    try {
      mainWindow.webContents.send('api-command', {
        action: 'create-task',
        data: req.body
      });

      const result = await new Promise((resolve) => {
        ipcMain.once('api-response-create-task', (event, data) => {
          resolve(data);
        });

        setTimeout(() => {
          resolve({ success: false, error: 'Timeout' });
        }, 5000);
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Obtenir les workspaces
  app.get('/api/workspaces', async (req, res) => {
    try {
      mainWindow.webContents.send('api-command', {
        action: 'get-workspaces'
      });

      const result = await new Promise((resolve) => {
        ipcMain.once('api-response-workspaces', (event, data) => {
          resolve(data);
        });

        setTimeout(() => {
          resolve({ success: false, error: 'Timeout' });
        }, 5000);
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  apiServer = app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log('ChatGPT peut maintenant contrôler l\'application !');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (apiServer) {
    apiServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
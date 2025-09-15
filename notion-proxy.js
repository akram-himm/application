const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration Notion
const notion = new Client({
  auth: process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE'
});

const DATABASE_ID = '26c6b77b098e80c18380d27d8156fa9b';

// Test de connexion
app.get('/api/notion/test', async (req, res) => {
  try {
    const response = await notion.users.me();
    res.json({ success: true, user: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Récupérer les tâches
app.get('/api/notion/tasks', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une tâche
app.post('/api/notion/tasks', async (req, res) => {
  try {
    const { name, status, priority, date, description, type } = req.body;

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'Task name': {
          title: [{ text: { content: name || 'Sans titre' } }]
        },
        Status: status ? {
          status: { name: status }
        } : undefined,
        Priority: priority ? {
          select: { name: priority }
        } : undefined,
        'Due date': date ? {
          date: { start: date }
        } : undefined,
        Type: type ? {
          select: { name: type }
        } : undefined,
        Description: description ? {
          rich_text: [{ text: { content: description } }]
        } : undefined
      }
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une tâche
app.patch('/api/notion/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const properties = {};

    if (updates.name !== undefined) {
      properties['Task name'] = {
        title: [{ text: { content: updates.name } }]
      };
    }

    if (updates.status !== undefined) {
      properties.Status = {
        status: { name: updates.status }
      };
    }

    if (updates.priority !== undefined) {
      properties.Priority = {
        select: { name: updates.priority }
      };
    }

    const response = await notion.pages.update({
      page_id: id,
      properties
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`✅ Serveur Notion démarré sur http://localhost:${PORT}`);
  console.log('🔌 Pour connecter avec ton app, le serveur doit rester ouvert');
  console.log('📝 Endpoints disponibles:');
  console.log('  - GET  /api/notion/test');
  console.log('  - GET  /api/notion/tasks');
  console.log('  - POST /api/notion/tasks');
  console.log('  - PATCH /api/notion/tasks/:id');
});
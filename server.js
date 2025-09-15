const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Notion
const NOTION_TOKEN = process.env.NOTION_TOKEN || 'YOUR_NOTION_TOKEN_HERE';
const DATABASE_ID = '26c6b77b098e80309cb5ea05c710888e';

// Initialiser le client Notion
const notion = new Client({
  auth: NOTION_TOKEN,
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Serveur Notion proxy fonctionnel' });
});

// Route pour vérifier la connexion
app.get('/api/notion/verify', async (req, res) => {
  try {
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID
    });
    res.json({
      success: true,
      database: response.title[0]?.plain_text || 'Base de données trouvée'
    });
  } catch (error) {
    console.error('Erreur de vérification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour récupérer les tâches
app.get('/api/notion/tasks', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Date',
          direction: 'ascending'
        }
      ]
    });

    const tasks = response.results.map(page => ({
      notionId: page.id,
      name: page.properties['Nom']?.title?.[0]?.text?.content ||
             page.properties['Name']?.title?.[0]?.text?.content ||
             'Sans titre',
      status: page.properties['Statut']?.select?.name ||
              page.properties['Status']?.select?.name ||
              'À faire',
      priority: page.properties['Priorité']?.select?.name ||
                page.properties['Priority']?.select?.name ||
                'Normal',
      date: page.properties['Date']?.date?.start || null,
      endDate: page.properties['Date']?.date?.end || null,
      time: page.properties['Heure']?.rich_text?.[0]?.text?.content ||
            page.properties['Time']?.rich_text?.[0]?.text?.content ||
            '-',
      description: page.properties['Description']?.rich_text?.[0]?.text?.content || '',
      type: page.properties['Type']?.select?.name || 'daily'
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer une tâche
app.post('/api/notion/tasks', async (req, res) => {
  try {
    const task = req.body;

    const properties = {
      'Nom': {
        title: [
          {
            text: {
              content: task.name || 'Nouvelle tâche'
            }
          }
        ]
      }
    };

    // Ajouter les autres propriétés si elles existent dans la base
    if (task.status) {
      properties['Statut'] = {
        select: {
          name: task.status
        }
      };
    }

    if (task.priority) {
      properties['Priorité'] = {
        select: {
          name: task.priority
        }
      };
    }

    if (task.date) {
      properties['Date'] = {
        date: {
          start: task.date,
          end: task.endDate || null
        }
      };
    }

    if (task.time && task.time !== '-') {
      properties['Heure'] = {
        rich_text: [
          {
            text: {
              content: task.time
            }
          }
        ]
      };
    }

    if (task.description) {
      properties['Description'] = {
        rich_text: [
          {
            text: {
              content: task.description
            }
          }
        ]
      };
    }

    if (task.type) {
      properties['Type'] = {
        select: {
          name: task.type
        }
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: properties
    });

    res.json({
      success: true,
      id: response.id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour une tâche
app.put('/api/notion/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = req.body;

    const properties = {};

    if (task.name !== undefined) {
      properties['Nom'] = {
        title: [
          {
            text: {
              content: task.name
            }
          }
        ]
      };
    }

    if (task.status !== undefined) {
      properties['Statut'] = {
        select: {
          name: task.status
        }
      };
    }

    if (task.priority !== undefined) {
      properties['Priorité'] = {
        select: {
          name: task.priority
        }
      };
    }

    if (task.date !== undefined) {
      properties['Date'] = {
        date: {
          start: task.date,
          end: task.endDate || null
        }
      };
    }

    if (task.time !== undefined) {
      properties['Heure'] = {
        rich_text: [
          {
            text: {
              content: task.time === '-' ? '' : task.time
            }
          }
        ]
      };
    }

    if (task.description !== undefined) {
      properties['Description'] = {
        rich_text: [
          {
            text: {
              content: task.description || ''
            }
          }
        ]
      };
    }

    await notion.pages.update({
      page_id: id,
      properties: properties
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer une tâche
app.delete('/api/notion/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await notion.pages.update({
      page_id: id,
      archived: true
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur Notion proxy démarré sur http://localhost:${PORT}`);
  console.log(`📊 Base de données Notion: ${DATABASE_ID}`);
});
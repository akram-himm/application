// Service Notion simplifié - connexion directe sans serveur proxy
// IMPORTANT: Cette méthode expose votre clé API dans le code front-end
// Pour la production, utilisez un serveur backend sécurisé

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_TOKEN = 'YOUR_NOTION_TOKEN_HERE'; // Replace with your actual token
const DATABASE_ID = '26c6b77b098e80c18380d27d8156fa9b';

class NotionDirectService {
  constructor() {
    this.isConnected = false;
    this.headers = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
  }

  // Tester la connexion
  async testConnection() {
    try {
      const response = await fetch(`${NOTION_API_URL}/users/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        return { success: true, user: data };
      } else {
        const error = await response.text();
        this.isConnected = false;
        return { success: false, error };
      }
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  // Récupérer les tâches depuis Notion
  async fetchTasks() {
    try {
      const response = await fetch(`${NOTION_API_URL}/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          sorts: [
            {
              property: 'Date',
              direction: 'ascending',
            },
          ],
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map(page => this.notionPageToTask(page));
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      throw error;
    }
  }

  // Convertir une page Notion en tâche
  notionPageToTask(page) {
    const properties = page.properties;

    return {
      id: page.id,
      notionId: page.id,
      name: this.getPropertyValue(properties.Name || properties.Title || properties.Nom),
      status: this.getPropertyValue(properties.Status || properties.Statut),
      priority: this.getPropertyValue(properties.Priority || properties.Priorité),
      date: this.getPropertyValue(properties.Date),
      description: this.getPropertyValue(properties.Description),
      type: this.getPropertyValue(properties.Type) || 'daily',
      lastSync: new Date().toISOString()
    };
  }

  // Extraire la valeur d'une propriété Notion
  getPropertyValue(property) {
    if (!property) return null;

    switch (property.type) {
      case 'title':
      case 'rich_text':
        return property[property.type]?.[0]?.plain_text || '';

      case 'select':
        return property.select?.name || null;

      case 'multi_select':
        return property.multi_select?.map(s => s.name) || [];

      case 'date':
        return property.date?.start || null;

      case 'checkbox':
        return property.checkbox;

      case 'number':
        return property.number;

      default:
        return null;
    }
  }

  // Créer une tâche dans Notion
  async createTask(task) {
    try {
      const properties = {
        Name: {
          title: [
            {
              text: {
                content: task.name || 'Sans titre'
              }
            }
          ]
        }
      };

      if (task.status) {
        properties.Status = {
          select: {
            name: task.status
          }
        };
      }

      if (task.priority) {
        properties.Priority = {
          select: {
            name: task.priority
          }
        };
      }

      if (task.date) {
        properties.Date = {
          date: {
            start: task.date
          }
        };
      }

      if (task.type) {
        properties.Type = {
          select: {
            name: task.type
          }
        };
      }

      const response = await fetch(`${NOTION_API_URL}/pages`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          parent: { database_id: DATABASE_ID },
          properties
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      return this.notionPageToTask(data);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  }

  // Mettre à jour une tâche
  async updateTask(taskId, updates) {
    try {
      const properties = {};

      if (updates.name !== undefined) {
        properties.Name = {
          title: [
            {
              text: {
                content: updates.name
              }
            }
          ]
        };
      }

      if (updates.status !== undefined) {
        properties.Status = {
          select: {
            name: updates.status
          }
        };
      }

      if (updates.priority !== undefined) {
        properties.Priority = {
          select: {
            name: updates.priority
          }
        };
      }

      const response = await fetch(`${NOTION_API_URL}/pages/${taskId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ properties })
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      return this.notionPageToTask(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  // Synchroniser les tâches
  async syncTasks(localTasks) {
    const results = {
      created: [],
      updated: [],
      errors: []
    };

    try {
      // Récupérer les tâches de Notion
      const notionTasks = await this.fetchTasks();
      const notionTasksMap = new Map(notionTasks.map(t => [t.notionId, t]));

      // Synchroniser chaque tâche locale
      for (const localTask of localTasks) {
        try {
          if (localTask.notionId && notionTasksMap.has(localTask.notionId)) {
            // Mettre à jour la tâche existante
            const updated = await this.updateTask(localTask.notionId, localTask);
            results.updated.push(updated);
          } else {
            // Créer une nouvelle tâche
            const created = await this.createTask(localTask);
            results.created.push(created);
          }
        } catch (error) {
          results.errors.push({ task: localTask, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      throw error;
    }
  }
}

// Singleton
const notionDirectService = new NotionDirectService();
export default notionDirectService;
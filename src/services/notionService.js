// Plus besoin du client Notion côté frontend, on utilise le proxy

// Configuration - À remplacer par vos propres valeurs
const NOTION_CONFIG = {
  // URL du serveur proxy local
  proxyUrl: 'http://localhost:3005',
  databaseId: '26c6b77b098e80c18380d27d8156fa9b' // ID de votre database Notion
};

class NotionService {
  constructor() {
    this.isConnected = false;
    this.config = this.loadConfig();
    // Auto-connexion
    this.connect();
  }

  // Charger la configuration depuis localStorage
  loadConfig() {
    const saved = localStorage.getItem('notion_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Invalid Notion config:', e);
      }
    }
    // Utiliser la config par défaut si rien n'est sauvegardé
    return {
      token: NOTION_CONFIG.token || '',
      databaseId: NOTION_CONFIG.databaseId || ''
    };
  }

  // Sauvegarder la configuration
  saveConfig(config) {
    this.config = config;
    localStorage.setItem('notion_config', JSON.stringify(config));
    this.connect();
  }

  // Se connecter à Notion via le proxy
  connect() {
    // Avec le proxy, on n'a plus besoin du client Notion côté frontend
    this.isConnected = true;
    return true;
  }

  // Vérifier la connexion via le proxy
  async testConnection() {
    try {
      const response = await fetch(`${NOTION_CONFIG.proxyUrl}/api/notion/test`);
      const data = await response.json();
      this.isConnected = data.success;
      return data;
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  // Récupérer les tâches depuis Notion via le proxy
  async fetchTasks() {
    try {
      const response = await fetch(`${NOTION_CONFIG.proxyUrl}/api/notion/tasks`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transformer les données Notion en format de votre app
      return data.results.map(page => this.notionPageToTask(page));
    } catch (error) {
      console.error('Error fetching tasks from Notion:', error);
      throw error;
    }
  }

  // Convertir une page Notion en tâche
  notionPageToTask(page) {
    const properties = page.properties;

    return {
      id: page.id,
      notionId: page.id,
      name: this.getPropertyValue(properties.Name || properties.Title),
      status: this.getPropertyValue(properties.Status),
      priority: this.getPropertyValue(properties.Priority),
      date: this.getPropertyValue(properties.Date),
      description: this.getPropertyValue(properties.Description),
      type: this.getPropertyValue(properties.Type) || 'daily',
      radar: this.getPropertyValue(properties.Radar),
      subject: this.getPropertyValue(properties.Subject),
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

      case 'status':
        return property.status?.name || null;

      case 'multi_select':
        return property.multi_select?.map(s => s.name) || [];

      case 'date':
        return property.date?.start || null;

      case 'checkbox':
        return property.checkbox;

      case 'number':
        return property.number;

      case 'url':
        return property.url;

      case 'email':
        return property.email;

      case 'phone_number':
        return property.phone_number;

      default:
        return null;
    }
  }

  // Créer une tâche dans Notion via le proxy
  async createTask(task) {
    try {
      const response = await fetch(`${NOTION_CONFIG.proxyUrl}/api/notion/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return this.notionPageToTask(data);
    } catch (error) {
      console.error('Error creating task in Notion:', error);
      throw error;
    }
  }

  // Mettre à jour une tâche dans Notion via le proxy
  async updateTask(taskId, updates) {
    try {
      const response = await fetch(`${NOTION_CONFIG.proxyUrl}/api/notion/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return this.notionPageToTask(data);
    } catch (error) {
      console.error('Error updating task in Notion:', error);
      throw error;
    }
  }

  // Convertir une tâche en propriétés Notion
  taskToNotionProperties(task) {
    const properties = {};

    if (task.name !== undefined) {
      properties.Name = {
        title: [
          {
            text: {
              content: task.name || 'Untitled'
            }
          }
        ]
      };
    }

    if (task.status !== undefined) {
      properties.Status = {
        select: {
          name: task.status || 'À faire'
        }
      };
    }

    if (task.priority !== undefined) {
      properties.Priority = {
        select: {
          name: task.priority || 'Pas de panique'
        }
      };
    }

    if (task.date !== undefined) {
      properties.Date = {
        date: task.date ? {
          start: task.date
        } : null
      };
    }

    if (task.description !== undefined) {
      properties.Description = {
        rich_text: [
          {
            text: {
              content: task.description || ''
            }
          }
        ]
      };
    }

    if (task.type !== undefined) {
      properties.Type = {
        select: {
          name: task.type || 'daily'
        }
      };
    }

    return properties;
  }

  // Synchroniser toutes les tâches
  async syncTasks(localTasks) {
    if (!this.isConnected) {
      throw new Error('Not connected to Notion');
    }

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
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Récupérer les databases disponibles
  async fetchDatabases() {
    if (!this.client) {
      throw new Error('Not connected to Notion');
    }

    try {
      const response = await this.client.search({
        filter: {
          value: 'database',
          property: 'object'
        }
      });

      return response.results.map(db => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Untitled',
        url: db.url,
        icon: db.icon
      }));
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw error;
    }
  }
}

// Singleton
const notionService = new NotionService();
export default notionService;
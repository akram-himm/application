import { Client } from '@notionhq/client';

class NotionService {
  constructor() {
    this.notion = null;
    this.databaseId = null;
    this.isInitialized = false;
  }

  async initialize(integrationToken, databaseUrl) {
    try {
      // Extraire l'ID de la base de données depuis l'URL
      const match = databaseUrl.match(/([a-f0-9]{32})/);
      if (!match) {
        throw new Error('URL de base de données Notion invalide');
      }
      this.databaseId = match[1];

      // Initialiser le client Notion
      this.notion = new Client({
        auth: integrationToken,
      });

      // Vérifier la connexion en récupérant la base
      await this.notion.databases.retrieve({ database_id: this.databaseId });

      this.isInitialized = true;
      console.log('✅ Service Notion initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service Notion:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  async createTask(task) {
    if (!this.isInitialized) {
      throw new Error('Service Notion non initialisé');
    }

    try {
      const properties = {
        'Nom': {
          title: [
            {
              text: {
                content: task.name || 'Sans titre'
              }
            }
          ]
        },
        'Statut': {
          select: {
            name: this.mapStatus(task.status)
          }
        },
        'Priorité': {
          select: {
            name: this.mapPriority(task.priority)
          }
        }
      };

      // Ajouter les dates si elles existent
      if (task.date && task.date !== '-') {
        properties['Date'] = {
          date: {
            start: task.date,
            end: task.endDate || null
          }
        };
      } else if (task.startDate && task.startDate !== '-') {
        properties['Date'] = {
          date: {
            start: task.startDate,
            end: task.endDate || null
          }
        };
      }

      // Ajouter l'heure si elle existe
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

      // Ajouter la description si elle existe
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

      // Ajouter le type de tâche
      if (task.type) {
        properties['Type'] = {
          select: {
            name: task.type
          }
        };
      }

      const response = await this.notion.pages.create({
        parent: { database_id: this.databaseId },
        properties: properties
      });

      return response.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la tâche dans Notion:', error);
      throw error;
    }
  }

  async updateTask(notionId, task) {
    if (!this.isInitialized) {
      throw new Error('Service Notion non initialisé');
    }

    try {
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
            name: this.mapStatus(task.status)
          }
        };
      }

      if (task.priority !== undefined) {
        properties['Priorité'] = {
          select: {
            name: this.mapPriority(task.priority)
          }
        };
      }

      if (task.date !== undefined || task.startDate !== undefined) {
        const startDate = task.date || task.startDate;
        if (startDate && startDate !== '-') {
          properties['Date'] = {
            date: {
              start: startDate,
              end: task.endDate || null
            }
          };
        }
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

      await this.notion.pages.update({
        page_id: notionId,
        properties: properties
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la tâche dans Notion:', error);
      throw error;
    }
  }

  async deleteTask(notionId) {
    if (!this.isInitialized) {
      throw new Error('Service Notion non initialisé');
    }

    try {
      await this.notion.pages.update({
        page_id: notionId,
        archived: true
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la tâche dans Notion:', error);
      throw error;
    }
  }

  async getTasks() {
    if (!this.isInitialized) {
      throw new Error('Service Notion non initialisé');
    }

    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
        filter: {
          property: 'Statut',
          select: {
            does_not_equal: 'Archivé'
          }
        },
        sorts: [
          {
            property: 'Date',
            direction: 'ascending'
          }
        ]
      });

      return response.results.map(page => this.pageToTask(page));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tâches depuis Notion:', error);
      throw error;
    }
  }

  pageToTask(page) {
    const properties = page.properties;

    const task = {
      notionId: page.id,
      name: properties['Nom']?.title?.[0]?.text?.content || 'Sans titre',
      status: this.reverseMapStatus(properties['Statut']?.select?.name),
      priority: this.reverseMapPriority(properties['Priorité']?.select?.name),
      type: properties['Type']?.select?.name || 'daily'
    };

    // Gérer les dates
    if (properties['Date']?.date) {
      const dateInfo = properties['Date'].date;
      if (task.type === 'weekly') {
        task.startDate = dateInfo.start;
        task.endDate = dateInfo.end || dateInfo.start;
      } else {
        task.date = dateInfo.start;
      }
    }

    // Gérer l'heure
    if (properties['Heure']?.rich_text?.[0]?.text?.content) {
      task.time = properties['Heure'].rich_text[0].text.content;
    } else {
      task.time = '-';
    }

    // Gérer la description
    if (properties['Description']?.rich_text?.[0]?.text?.content) {
      task.description = properties['Description'].rich_text[0].text.content;
    }

    return task;
  }

  // Mapper les statuts de l'application vers Notion
  mapStatus(appStatus) {
    const mapping = {
      'À faire': 'À faire',
      'En cours': 'En cours',
      'Terminé': 'Terminé',
      'En attente': 'En attente'
    };
    return mapping[appStatus] || 'À faire';
  }

  // Mapper les statuts de Notion vers l'application
  reverseMapStatus(notionStatus) {
    const mapping = {
      'À faire': 'À faire',
      'En cours': 'En cours',
      'Terminé': 'Terminé',
      'En attente': 'En attente'
    };
    return mapping[notionStatus] || 'À faire';
  }

  // Mapper les priorités de l'application vers Notion
  mapPriority(appPriority) {
    const mapping = {
      'Urgent': 'Urgent',
      'Important': 'Important',
      'Normal': 'Normal',
      'Pas de panique': 'Faible'
    };
    return mapping[appPriority] || 'Normal';
  }

  // Mapper les priorités de Notion vers l'application
  reverseMapPriority(notionPriority) {
    const mapping = {
      'Urgent': 'Urgent',
      'Important': 'Important',
      'Normal': 'Normal',
      'Faible': 'Pas de panique'
    };
    return mapping[notionPriority] || 'Normal';
  }
}

// Export une instance unique
export const notionService = new NotionService();
export default notionService;
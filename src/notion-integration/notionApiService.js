// Service pour communiquer avec le serveur proxy Notion
const API_BASE_URL = 'http://localhost:3001/api';

class NotionApiService {
  async verifyConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/verify`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erreur de vérification de connexion:', error);
      return false;
    }
  }

  async getTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/tasks`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des tâches');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      throw error;
    }
  }

  async createTask(task) {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la tâche');
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  }

  async updateTask(taskId, task) {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour de la tâche');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notion/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression de la tâche');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }
  }
}

export const notionApiService = new NotionApiService();
export default notionApiService;
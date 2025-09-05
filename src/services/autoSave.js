/**
 * Service de sauvegarde automatique avec récupération de crash
 */

const AUTO_SAVE_KEYS = {
  LAST_SAVE: 'gestion_last_save',
  CRASH_RECOVERY: 'gestion_crash_recovery',
  SESSION_ID: 'gestion_session_id',
  AUTO_SAVE_DATA: 'gestion_autosave_data'
};

class AutoSaveService {
  constructor() {
    this.saveInterval = null;
    this.saveCallbacks = [];
    this.lastSaveTime = null;
    this.sessionId = null;
    this.isRecovering = false;
    this.saveStatus = 'idle'; // idle, saving, saved, error
    this.statusListeners = [];
  }

  /**
   * Initialise le service de sauvegarde automatique
   * @param {Function} saveFunction - Fonction à appeler pour sauvegarder
   * @param {number} intervalMs - Intervalle en millisecondes (défaut: 30000 = 30 secondes)
   */
  init(saveFunction, intervalMs = 30000) {
    // Générer un nouvel ID de session
    this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(AUTO_SAVE_KEYS.SESSION_ID, this.sessionId);

    // Vérifier s'il y a des données à récupérer d'un crash
    this.checkCrashRecovery();

    // Démarrer la sauvegarde automatique
    this.startAutoSave(saveFunction, intervalMs);

    // Marquer que la session est active
    this.markSessionActive();

    // Écouter les événements de fermeture pour sauvegarder
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    // Écouter la visibilité de la page pour sauvegarder quand on quitte
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Démarre la sauvegarde automatique périodique
   */
  startAutoSave(saveFunction, intervalMs) {
    // Nettoyer l'ancien interval s'il existe
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }

    // Sauvegarder immédiatement
    this.performSave(saveFunction);

    // Configurer la sauvegarde périodique
    this.saveInterval = setInterval(() => {
      this.performSave(saveFunction);
    }, intervalMs);
  }

  /**
   * Effectue une sauvegarde
   */
  async performSave(saveFunction) {
    try {
      this.setStatus('saving');
      
      // Appeler la fonction de sauvegarde
      await saveFunction();
      
      // Mettre à jour le timestamp de dernière sauvegarde
      this.lastSaveTime = new Date().toISOString();
      localStorage.setItem(AUTO_SAVE_KEYS.LAST_SAVE, JSON.stringify({
        timestamp: this.lastSaveTime,
        sessionId: this.sessionId
      }));

      // Sauvegarder les données pour récupération en cas de crash
      this.saveCrashRecoveryData();
      
      this.setStatus('saved');
      
      // Réinitialiser le statut après 2 secondes
      setTimeout(() => {
        if (this.saveStatus === 'saved') {
          this.setStatus('idle');
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.setStatus('error');
      
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => {
        if (this.saveStatus === 'error') {
          this.setStatus('idle');
        }
      }, 3000);
      
      return false;
    }
  }

  /**
   * Sauvegarde les données pour récupération en cas de crash
   */
  saveCrashRecoveryData() {
    try {
      // Récupérer les données actuelles
      const radars = localStorage.getItem('gestion_radars');
      const tasks = localStorage.getItem('gestion_tasks');
      
      // Sauvegarder avec métadonnées
      localStorage.setItem(AUTO_SAVE_KEYS.CRASH_RECOVERY, JSON.stringify({
        radars: radars ? JSON.parse(radars) : [],
        tasks: tasks ? JSON.parse(tasks) : [],
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      }));
    } catch (error) {
      console.error('Error saving crash recovery data:', error);
    }
  }

  /**
   * Vérifie s'il y a des données à récupérer d'un crash
   */
  checkCrashRecovery() {
    try {
      // Vérifier la dernière session
      const lastSession = localStorage.getItem(AUTO_SAVE_KEYS.SESSION_ID);
      const crashData = localStorage.getItem(AUTO_SAVE_KEYS.CRASH_RECOVERY);
      
      if (lastSession && crashData && lastSession !== this.sessionId) {
        const recovery = JSON.parse(crashData);
        const lastSave = localStorage.getItem(AUTO_SAVE_KEYS.LAST_SAVE);
        
        if (lastSave) {
          const { timestamp } = JSON.parse(lastSave);
          const timeDiff = Date.now() - new Date(timestamp).getTime();
          
          // Si la dernière sauvegarde date de moins de 24 heures
          if (timeDiff < 24 * 60 * 60 * 1000) {
            this.isRecovering = true;
            return {
              available: true,
              data: recovery,
              lastSave: timestamp
            };
          }
        }
      }
      
      // Nettoyer les vieilles données de récupération
      this.clearCrashRecoveryData();
      
    } catch (error) {
      console.error('Error checking crash recovery:', error);
    }
    
    return { available: false };
  }

  /**
   * Récupère les données après un crash
   */
  recoverFromCrash() {
    try {
      const crashData = localStorage.getItem(AUTO_SAVE_KEYS.CRASH_RECOVERY);
      
      if (crashData) {
        const { radars, tasks } = JSON.parse(crashData);
        
        // Restaurer les données
        if (radars) {
          localStorage.setItem('gestion_radars', JSON.stringify(radars));
        }
        if (tasks) {
          localStorage.setItem('gestion_tasks', JSON.stringify(tasks));
        }
        
        // Nettoyer les données de récupération
        this.clearCrashRecoveryData();
        
        this.isRecovering = false;
        
        return { success: true, radars, tasks };
      }
    } catch (error) {
      console.error('Error recovering from crash:', error);
      this.isRecovering = false;
      return { success: false, error };
    }
  }

  /**
   * Nettoie les données de récupération de crash
   */
  clearCrashRecoveryData() {
    localStorage.removeItem(AUTO_SAVE_KEYS.CRASH_RECOVERY);
  }

  /**
   * Marque la session comme active
   */
  markSessionActive() {
    // Utiliser un heartbeat pour détecter les crashes
    setInterval(() => {
      localStorage.setItem(AUTO_SAVE_KEYS.SESSION_ID, this.sessionId);
    }, 5000);
  }

  /**
   * Gère l'événement avant fermeture de la fenêtre
   */
  handleBeforeUnload(e) {
    // Effectuer une sauvegarde finale
    if (this.saveCallbacks.length > 0) {
      this.saveCallbacks.forEach(callback => callback());
    }
    
    // Marquer une fermeture propre
    localStorage.setItem(AUTO_SAVE_KEYS.LAST_SAVE, JSON.stringify({
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      cleanExit: true
    }));
  }

  /**
   * Gère le changement de visibilité de la page
   */
  handleVisibilityChange() {
    if (document.hidden && this.saveCallbacks.length > 0) {
      // Sauvegarder quand l'utilisateur quitte la page
      this.saveCallbacks.forEach(callback => callback());
    }
  }

  /**
   * Ajoute un callback de sauvegarde
   */
  addSaveCallback(callback) {
    this.saveCallbacks.push(callback);
  }

  /**
   * Définit le statut de sauvegarde
   */
  setStatus(status) {
    this.saveStatus = status;
    this.notifyStatusListeners(status);
  }

  /**
   * Ajoute un écouteur de statut
   */
  addStatusListener(listener) {
    this.statusListeners.push(listener);
  }

  /**
   * Retire un écouteur de statut
   */
  removeStatusListener(listener) {
    this.statusListeners = this.statusListeners.filter(l => l !== listener);
  }

  /**
   * Notifie les écouteurs de statut
   */
  notifyStatusListeners(status) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error notifying status listener:', error);
      }
    });
  }

  /**
   * Obtient le temps écoulé depuis la dernière sauvegarde
   */
  getTimeSinceLastSave() {
    if (!this.lastSaveTime) return null;
    
    const diff = Date.now() - new Date(this.lastSaveTime).getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds} secondes`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }

  /**
   * Force une sauvegarde immédiate
   */
  forceSave() {
    if (this.saveCallbacks.length > 0) {
      return this.performSave(this.saveCallbacks[0]);
    }
    return Promise.resolve(false);
  }

  /**
   * Arrête la sauvegarde automatique
   */
  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    // Retirer les écouteurs
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Obtient les statistiques de sauvegarde
   */
  getStats() {
    return {
      status: this.saveStatus,
      lastSave: this.lastSaveTime,
      timeSinceLastSave: this.getTimeSinceLastSave(),
      sessionId: this.sessionId,
      isRecovering: this.isRecovering
    };
  }
}

// Créer une instance singleton
const autoSaveService = new AutoSaveService();

export default autoSaveService;
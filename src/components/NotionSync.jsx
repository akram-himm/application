import React, { useState, useEffect } from 'react';
import notionService from '../services/notionService';

const NotionSync = ({ tasks, onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Vérifier la connexion au chargement
    checkConnection();
    // Récupérer la dernière sync
    const saved = localStorage.getItem('notion_last_sync');
    if (saved) {
      setLastSync(new Date(saved));
    }
  }, []);

  const checkConnection = async () => {
    const result = await notionService.testConnection();
    setIsConnected(result.success);
    if (result.success) {
      setSyncStatus('✅ Connecté à Notion');
    } else {
      setSyncStatus('❌ Non connecté');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('🔄 Synchronisation en cours...');

    try {
      // Filtrer les tâches à synchroniser (exclure les routines si souhaité)
      const tasksToSync = tasks.filter(task =>
        task.type !== 'routine' // Ne pas sync les routines
      );

      const results = await notionService.syncTasks(tasksToSync);

      const now = new Date();
      setLastSync(now);
      localStorage.setItem('notion_last_sync', now.toISOString());

      setSyncStatus(
        `✅ Sync réussie ! ${results.created.length} créées, ${results.updated.length} mises à jour`
      );

      if (onSyncComplete) {
        onSyncComplete(results);
      }

      // Effacer le message après 5 secondes
      setTimeout(() => {
        setSyncStatus('');
      }, 5000);
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      setSyncStatus(`❌ Erreur: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Jamais';

    const now = new Date();
    const diff = now - lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  return (
    <div className="notion-sync-container">
      <button
        onClick={handleSync}
        disabled={isSyncing || !isConnected}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isConnected
            ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          ${isSyncing ? 'animate-pulse' : ''}
        `}
      >
        {isSyncing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Synchronisation...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
            </svg>
            Synchroniser avec Notion
          </span>
        )}
      </button>

      {syncStatus && (
        <div className="mt-2 text-sm">
          {syncStatus}
        </div>
      )}

      {lastSync && !syncStatus && (
        <div className="mt-1 text-xs text-gray-500">
          Dernière sync: {formatLastSync()}
        </div>
      )}
    </div>
  );
};

export default NotionSync;
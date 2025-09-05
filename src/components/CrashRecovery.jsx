import React, { useState, useEffect } from 'react';
import autoSaveService from '../services/autoSave';

const CrashRecovery = ({ onRecover, onDiscard }) => {
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);

  useEffect(() => {
    // Vérifier s'il y a des données à récupérer
    const recovery = autoSaveService.checkCrashRecovery();
    
    if (recovery.available) {
      setRecoveryData(recovery);
      setShowRecovery(true);
    }
  }, []);

  const handleRecover = () => {
    const result = autoSaveService.recoverFromCrash();
    
    if (result.success) {
      // Notifier le parent que les données ont été récupérées
      if (onRecover) {
        onRecover(result);
      }
      
      // Recharger la page pour appliquer les données récupérées
      window.location.reload();
    } else {
      console.error('Failed to recover data:', result.error);
    }
    
    setShowRecovery(false);
  };

  const handleDiscard = () => {
    // Nettoyer les données de récupération
    autoSaveService.clearCrashRecoveryData();
    
    if (onDiscard) {
      onDiscard();
    }
    
    setShowRecovery(false);
  };

  if (!showRecovery || !recoveryData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Récupération après fermeture
                </h3>
                <p className="text-sm text-gray-500">
                  Session précédente fermée de manière inattendue
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Nous avons détecté une sauvegarde automatique de vos données :
            </p>
            
            <div className="rounded-lg bg-gray-50 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dernière sauvegarde :</span>
                <span className="font-medium text-gray-700">
                  {formatDate(recoveryData.lastSave)}
                </span>
              </div>
              
              {recoveryData.data && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Radars :</span>
                    <span className="font-medium text-gray-700">
                      {recoveryData.data.radars?.length || 0} élément(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tâches :</span>
                    <span className="font-medium text-gray-700">
                      {recoveryData.data.tasks?.length || 0} élément(s)
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Voulez-vous restaurer ces données ?
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Ignorer
            </button>
            <button
              onClick={handleRecover}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Récupérer les données
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashRecovery;
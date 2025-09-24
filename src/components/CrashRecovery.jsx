import React, { useEffect } from 'react';
import autoSaveService from '../services/autoSave';

const CrashRecovery = ({ onRecover }) => {
  useEffect(() => {
    // Récupération automatique et silencieuse
    const recovery = autoSaveService.checkCrashRecovery();

    if (recovery.available) {
      // Récupérer automatiquement les données sans demander
      const result = autoSaveService.recoverFromCrash();

      if (result.success) {
        // Notifier silencieusement que les données ont été récupérées
        console.log('Données récupérées automatiquement après fermeture inattendue');
        if (onRecover) {
          onRecover(result);
        }

        // NE PAS recharger automatiquement - laisser l'app gérer les données récupérées
        // Nettoyer les données de récupération après usage
        autoSaveService.clearCrashRecoveryData();
      } else {
        // En cas d'erreur, nettoyer silencieusement
        autoSaveService.clearCrashRecoveryData();
      }
    }
  }, [onRecover]);

  // Ne rien afficher visuellement
  return null;
};

export default CrashRecovery;
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

export const AkramContext = createContext();

export const AkramProvider = ({ children }) => {
  const { radars } = useContext(AppContext);
  const [akramPeriod, setAkramPeriod] = useState(3); // Jours par défaut
  const [penalties, setPenalties] = useState([]);

  // Calculer les pénalités basées sur le système d'Akram
  useEffect(() => {
    if (akramPeriod === 0) {
      setPenalties([]);
      return;
    }

    const calculatePenalties = () => {
      const now = new Date();
      const periodMs = akramPeriod * 24 * 60 * 60 * 1000;
      const newPenalties = [];

      radars.forEach(radar => {
        radar.subjects?.forEach(subject => {
          if (subject.lastProgress) {
            const lastProgressDate = new Date(subject.lastProgress);
            const timeSinceProgress = now - lastProgressDate;

            if (timeSinceProgress > periodMs) {
              const daysSince = Math.floor(timeSinceProgress / (24 * 60 * 60 * 1000));
              const penaltyValue = Math.min(daysSince * 2, 20); // Max 20% de pénalité

              newPenalties.push({
                radarId: radar.id,
                subjectId: subject.id,
                subjectName: subject.name,
                daysSince,
                penaltyValue
              });
            }
          }
        });
      });

      setPenalties(newPenalties);
    };

    calculatePenalties();
    
    // Recalculer toutes les heures
    const interval = setInterval(calculatePenalties, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [radars, akramPeriod]);

  // Obtenir la pénalité pour une matière spécifique
  const getPenaltyForSubject = (radarId, subjectId) => {
    return penalties.find(
      p => p.radarId === radarId && p.subjectId === subjectId
    );
  };

  // Obtenir le nombre total de matières en retard
  const getDelayedSubjectsCount = () => {
    return penalties.length;
  };

  // Vérifier si un radar a des matières en retard
  const radarHasPenalties = (radarId) => {
    return penalties.some(p => p.radarId === radarId);
  };

  const value = {
    akramPeriod,
    setAkramPeriod,
    penalties,
    getPenaltyForSubject,
    getDelayedSubjectsCount,
    radarHasPenalties
  };

  return (
    <AkramContext.Provider value={value}>
      {children}
    </AkramContext.Provider>
  );
};
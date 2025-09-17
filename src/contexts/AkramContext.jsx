import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

export const AkramContext = createContext();

export const AkramProvider = ({ children }) => {
  const { radars, updateRadar } = useContext(AppContext);
  const [akramPeriod, setAkramPeriod] = useState(3); // Jours par défaut
  const [penaltyPercentage, setPenaltyPercentage] = useState(2); // Pourcentage de pénalité par période
  const [penalties, setPenalties] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Calculer les pénalités basées sur le système d'Akram
  useEffect(() => {
    if (akramPeriod === 0) {
      setPenalties([]);
      return;
    }

    const calculatePenalties = () => {
      const now = new Date();
      // Ajouter 1 jour pour que la pénalité s'applique après X jours complets
      // Ex: Si period = 3, la pénalité arrive après 4 jours (lundi -> vendredi 00:00)
      const periodMs = (akramPeriod + 1) * 24 * 60 * 60 * 1000;
      const newPenalties = [];

      radars.forEach(radar => {
        radar.subjects?.forEach(subject => {
          // Ignorer les matières en pause
          if (subject.isPaused) {
            return; // Pas de pénalité pour les matières pausées
          }

          if (subject.lastProgress) {
            const lastProgressDate = new Date(subject.lastProgress);
            const timeSinceProgress = now - lastProgressDate;

            // Récupérer la dernière valeur de progression stockée
            const lastValue = subject.lastProgressValue || subject.value;
            const currentValue = subject.value;

            // Si la valeur a augmenté, c'est qu'il y a eu progression
            const hasProgressed = currentValue > lastValue;

            if (!hasProgressed && timeSinceProgress >= periodMs) {
              // Calculer combien de périodes complètes se sont écoulées depuis la dernière vraie progression
              const periodsElapsed = Math.floor(timeSinceProgress / periodMs);

              // Récupérer les pénalités déjà appliquées pour éviter de les réappliquer
              const previouslyAppliedPenalties = subject.appliedPenalties || 0;

              // Calculer les nouvelles pénalités à appliquer
              const totalPenaltyPeriods = periodsElapsed;
              const newPenaltyPeriods = totalPenaltyPeriods - Math.floor(previouslyAppliedPenalties / penaltyPercentage);

              // Appliquer seulement les nouvelles pénalités
              const penaltyValue = newPenaltyPeriods > 0 ? newPenaltyPeriods * penaltyPercentage : 0;

              if (penaltyValue > 0) {
                newPenalties.push({
                  radarId: radar.id,
                  subjectId: subject.id,
                  subjectName: subject.name,
                  periodsElapsed: totalPenaltyPeriods,
                  daysSince: Math.floor(timeSinceProgress / (24 * 60 * 60 * 1000)),
                  penaltyValue: totalPenaltyPeriods * penaltyPercentage, // Total des pénalités
                  actualPenaltyToApply: penaltyValue // Pénalité réelle à appliquer maintenant
                });
              }
            }
          }
        });
      });

      setPenalties(newPenalties);

      // Appliquer les pénalités permanentes et sauvegarder
      if (!hasInitialized && newPenalties.length > 0) {
        radars.forEach(radar => {
          let radarUpdated = false;
          const updatedSubjects = radar.subjects?.map(subject => {
            const penalty = newPenalties.find(p => p.radarId === radar.id && p.subjectId === subject.id);
            if (penalty) {
              radarUpdated = true;
              return {
                ...subject,
                appliedPenalties: (subject.appliedPenalties || 0) + penalty.actualPenaltyToApply
              };
            }
            return subject;
          });

          if (radarUpdated) {
            updateRadar({ ...radar, subjects: updatedSubjects });
          }
        });
        setHasInitialized(true);
      }
    };

    calculatePenalties();

    // Recalculer toutes les minutes pour vérifier les pénalités
    const interval = setInterval(calculatePenalties, 60 * 1000);
    return () => clearInterval(interval);
  }, [radars, akramPeriod, penaltyPercentage, hasInitialized, updateRadar]);

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
    penaltyPercentage,
    setPenaltyPercentage,
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
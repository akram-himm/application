import React, { useState, useContext } from 'react';
import { AkramContext } from '../../contexts/AkramContext';

const AkramControl = () => {
  const { akramPeriod, setAkramPeriod, penaltyPercentage, setPenaltyPercentage, getDelayedSubjectsCount } = useContext(AkramContext);
  const [isHidden, setIsHidden] = useState(false);
  
  const delayedCount = getDelayedSubjectsCount();
  const hasDelayed = delayedCount > 0;
  
  const getStatusClass = () => {
    if (akramPeriod === 0) return '';
    return hasDelayed ? 'warning' : 'active';
  };
  
  const getStatusText = () => {
    if (akramPeriod === 0) return 'Désactivé';
    return hasDelayed ? `${delayedCount} en retard` : 'Actif';
  };
  
  return (
    <>
      {/* Panneau de contrôle */}
      <div 
        className={`fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[rgb(37,37,37)]/90 backdrop-blur-xl border border-white/10 rounded-xl px-6 py-4 z-50 transition-all duration-300 ${
          isHidden ? 'translate-y-[calc(100%+40px)]' : ''
        }`}
      >
        <span className="text-sm text-white/81 font-medium">Système d'Akram</span>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/46">Période:</span>
          <select
            value={akramPeriod}
            onChange={(e) => setAkramPeriod(Number(e.target.value))}
            className="px-3 py-1.5 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 text-sm cursor-pointer transition-all duration-150 hover:bg-white/[0.08] hover:border-white/20 focus:outline-none focus:border-[rgb(35,131,226)]"
            title="Pénalité appliquée après X jours complets sans progression"
          >
            <option value="0">Désactivé</option>
            <option value="1">1 jour complet</option>
            <option value="2">2 jours complets</option>
            <option value="3">3 jours complets</option>
            <option value="7">7 jours complets</option>
            <option value="14">14 jours complets</option>
          </select>
        </div>

        {/* Sélecteur de pénalité */}
        {akramPeriod > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/46">Pénalité:</span>
            <select
              value={penaltyPercentage}
              onChange={(e) => setPenaltyPercentage(Number(e.target.value))}
              className="px-3 py-1.5 bg-white/[0.055] border border-white/[0.094] rounded-md text-white/81 text-sm cursor-pointer transition-all duration-150 hover:bg-white/[0.08] hover:border-white/20 focus:outline-none focus:border-[rgb(35,131,226)]"
            >
              <option value="1">1%</option>
              <option value="2">2%</option>
              <option value="3">3%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
            </select>
          </div>
        )}
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium ${
          getStatusClass() === 'active' ? 'bg-[rgb(34,197,94)]/10 text-[rgb(34,197,94)]' :
          getStatusClass() === 'warning' ? 'bg-[rgb(251,191,36)]/10 text-[rgb(251,191,36)]' :
          'bg-white/[0.055] text-white/46'
        }`}>
          {akramPeriod > 0 && (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5A6.5 6.5 0 1 0 14.5 8 6.508 6.508 0 0 0 8 1.5zM8 13A5 5 0 1 1 13 8a5.006 5.006 0 0 1-5 5zm2.5-5.5H8.25V4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 0-1.5z" />
            </svg>
          )}
          <span>{getStatusText()}</span>
        </div>
      </div>
      
      {/* Bouton toggle */}
      <button
        onClick={() => setIsHidden(!isHidden)}
        className={`fixed bottom-2.5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[rgb(37,37,37)]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center cursor-pointer z-[51] transition-all duration-300 hover:bg-[rgb(45,45,45)]/90 hover:scale-110 ${
          isHidden ? 'rotate-180' : ''
        }`}
      >
        <svg className="w-5 h-5 text-white/46" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.78 5.22a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06L8 9.44l4.22-4.22a.75.75 0 0 1 1.06 0z" />
        </svg>
      </button>
    </>
  );
};

export default AkramControl;
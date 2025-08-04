import React, { useContext, useEffect, useState } from 'react';
import { AkramContext } from '../../contexts/AkramContext';

const FloatingAlert = () => {
  const { penalties, akramPeriod } = useContext(AkramContext);
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    if (akramPeriod > 0 && penalties.length > 0) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowAlert(false);
    }
  }, [penalties, akramPeriod]);
  
  if (!showAlert || penalties.length === 0) return null;
  
  const getAlertMessage = () => {
    if (penalties.length === 1) {
      return `${penalties[0].subjectName} n'a pas progressé depuis ${penalties[0].daysSince} jours`;
    } else {
      return `${penalties.length} matières n'ont pas progressé récemment`;
    }
  };
  
  return (
    <div className={`fixed bottom-[120px] right-[30px] bg-[rgb(251,191,36)]/10 border border-[rgb(251,191,36)]/20 rounded-lg p-4 max-w-[300px] transition-all duration-300 z-50 ${
      showAlert ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
    }`}>
      <div className="flex items-center gap-1.5 text-[rgb(251,191,36)] font-semibold text-sm mb-1">
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z" />
        </svg>
        Système d'Akram
      </div>
      <p className="text-[13px] text-white/81 leading-relaxed">
        {getAlertMessage()}
      </p>
    </div>
  );
};

export default FloatingAlert;
import React from 'react';

const CalendarView = () => {
  return (
    <div className="h-full bg-[rgb(25,25,25)]">
      <header className="border-b border-[rgb(47,47,47)]">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-white/81">Calendrier</h1>
          <p className="text-white/46 text-sm mt-1">Vue calendrier - En cours de développement</p>
        </div>
      </header>
      
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📅</span>
          <p className="text-white/46">La vue calendrier sera bientôt disponible</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
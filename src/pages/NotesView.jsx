import React from 'react';

const NotesView = () => {
  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Header héro premium */}
        <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] p-8">
          <h1 className="text-[40px] font-bold tracking-tight text-[#1E1F22]">Notes</h1>
          <p className="text-gray-600 mt-3 text-lg">Vos <span className="text-blue-500 font-semibold">notes et documents</span> - En cours de développement</p>
        </div>
        
        {/* Contenu */}
        <div className="flex items-center justify-center py-20 rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)]">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-gray-600 text-lg font-medium">La section notes sera bientôt disponible</p>
            <p className="text-gray-500 text-sm mt-2">Restez connecté pour les prochaines mises à jour</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesView;
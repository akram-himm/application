import React from 'react';
import { uniformStyles } from '../styles/uniformStyles';

const NotesView = () => {
  return (
    <div className="min-h-screen bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 shadow-[12px_0_32px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Removed header for uniform design */}
        
        {/* Contenu */}
        <div className={'flex items-center justify-center py-20 ' + uniformStyles.card.default}>
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
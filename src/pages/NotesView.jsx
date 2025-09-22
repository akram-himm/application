import React from 'react';
import { uniformStyles } from '../styles/uniformStyles';

const NotesView = () => {
  return (
    <div className={uniformStyles.layout.page}>
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container}>
          <h1 className={uniformStyles.text.pageTitle}>Notes</h1>
          <p className={uniformStyles.text.pageSubtitle}>
            Gérez votre base de connaissances personnelle
          </p>
        </div>

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
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import SimpleKanban from '../components/chapters/SimpleKanban';
import NotionEditor from '../components/NotionEditor/Editor';
import { uniformStyles } from '../styles/uniformStyles';

const ChaptersView = () => {
  const { radarId, subjectId } = useParams();
  const navigate = useNavigate();
  const { radars, updateRadar } = useContext(AppContext);

  // Récupérer les données du radar et de la matière
  const radar = radars.find(r => r.id === radarId);
  const subject = radar?.subjects?.find(s => s.id === subjectId);
  
  
  if (!radar || !subject) {
    return (
      <div className={uniformStyles.layout.page + ' flex items-center justify-center'}>
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className={uniformStyles.layout.page}>
      <div className="px-6 py-4">
        {/* Titre de la page */}
        <div className={uniformStyles.pageHeader.container + ' px-6'}>
          <h1 className={uniformStyles.text.pageTitle}>{subject?.name || 'Chapitres'}</h1>
          <p className={uniformStyles.text.pageSubtitle}>Organisez vos tâches et notes</p>
        </div>
      </div>
      
      
      {/* Main Content - Kanban et Liste */}
      <div className="max-w-[1400px] mx-auto px-6 pb-32 space-y-8">
        {/* Kanban simplifié */}
        <SimpleKanban />

        {/* Éditeur style Notion */}
        <div className="mt-6">
          <NotionEditor />
        </div>
      </div>
    </div>
  );
};

export default ChaptersView;
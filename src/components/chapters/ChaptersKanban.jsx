import React, { useState } from 'react';

const ChaptersKanban = ({ chapters, onUpdateSubtopic }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  
  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  
  const priorityLabels = {
    low: 'Pas de panique',
    medium: 'Important',
    high: 'Très important'
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Organiser les tâches par statut et chapitre
  const getTasksByStatus = (status) => {
    const tasksByChapter = {};
    
    chapters.forEach(chapter => {
      if (chapter.enabled) {
        const tasksForStatus = chapter.subtopics.filter(subtopic => subtopic.status === status);
        if (tasksForStatus.length > 0) {
          tasksByChapter[chapter.id] = {
            name: chapter.name,
            tasks: tasksForStatus
          };
        }
      }
    });
    
    return tasksByChapter;
  };
  
  const notStartedTasks = getTasksByStatus('not-started');
  const inProgressTasks = getTasksByStatus('in-progress');
  const doneTasks = getTasksByStatus('done');
  
  // Compter le nombre total de tâches par colonne
  const countTasks = (tasksByChapter) => {
    return Object.values(tasksByChapter).reduce((total, chapter) => total + chapter.tasks.length, 0);
  };
  
  // Drag and drop handlers
  const handleDragStart = (e, chapterId, subtopic) => {
    setDraggedItem({ chapterId, subtopic });
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedItem(null);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedItem) {
      onUpdateSubtopic(draggedItem.chapterId, draggedItem.subtopic.id, { status: newStatus });
    }
  };
  
  const renderTask = (chapterId, subtopic) => {
    return (
      <div
        key={subtopic.id}
        draggable
        onDragStart={(e) => handleDragStart(e, chapterId, subtopic)}
        onDragEnd={handleDragEnd}
        className="bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-md p-3 ml-4 cursor-grab active:cursor-grabbing hover:bg-[rgb(45,45,45)] transition-all duration-150"
      >
        <div className="font-medium text-sm text-white/81 mb-2">
          {subtopic.icon} {subtopic.name}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/46">
          <div className="flex items-center gap-1">
            {priorityIcons[subtopic.priority]} {priorityLabels[subtopic.priority]}
          </div>
          {subtopic.endDate && (
            <div className="flex items-center gap-1">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5v1h10v-1A1.5 1.5 0 0 0 11.5 2h-7zM13 5.5H3v7A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-7zM4.5 1A2.5 2.5 0 0 0 2 3.5v9A2.5 2.5 0 0 0 4.5 15h7a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 11.5 1h-7z" />
              </svg>
              {formatDate(subtopic.endDate)}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderColumn = (title, status, tasksByChapter) => {
    const count = countTasks(tasksByChapter);
    
    return (
      <div className="flex-1 min-w-[300px] bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.055]">
          <h3 className="text-base font-semibold text-white/81">{title}</h3>
          <span className="text-sm text-white/46 bg-white/[0.055] px-2 py-0.5 rounded-xl">
            {count}
          </span>
        </div>
        
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
          className="flex flex-col gap-3 min-h-[100px]"
        >
          {Object.entries(tasksByChapter).map(([chapterId, chapterData]) => (
            <div key={chapterId} className="mb-3">
              <div className="text-sm font-semibold text-white/81 mb-1.5 pl-1">
                {chapterData.name}
              </div>
              {chapterData.tasks.map(task => renderTask(chapterId, task))}
            </div>
          ))}
          
          {count === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              Aucune tâche
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-5">
      {renderColumn('Non commencé', 'not-started', notStartedTasks)}
      {renderColumn('En cours', 'in-progress', inProgressTasks)}
      {renderColumn('Terminé', 'done', doneTasks)}
    </div>
  );
};

export default ChaptersKanban;
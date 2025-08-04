import React, { useState } from 'react';

const ChaptersTable = ({
  chapters,
  searchQuery,
  onToggleChapter,
  onUpdateSubtopic,
  onEditChapter,
  onDeleteChapter,
  onEditSubtopic,
  onDeleteSubtopic,
  onAddSubtopic
}) => {
  const [columnOrder, setColumnOrder] = useState([
    'checkbox', 'name', 'startDate', 'endDate', 'priority', 'progress', 'actions'
  ]);
  const [draggedColumn, setDraggedColumn] = useState(null);
  
  const priorityLabels = {
    low: 'Pas de panique',
    medium: 'Important',
    high: 'Très important'
  };
  
  const statusLabels = {
    'not-started': 'Non commencé',
    'in-progress': 'En cours',
    'done': 'Terminé'
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Filtrage basé sur la recherche
  const filterItems = (chapter, subtopics) => {
    if (!searchQuery) return { chapter: true, subtopics };
    
    const query = searchQuery.toLowerCase();
    const chapterMatch = chapter.name.toLowerCase().includes(query);
    const filteredSubtopics = subtopics.filter(s =>
      s.name.toLowerCase().includes(query) ||
      priorityLabels[s.priority]?.toLowerCase().includes(query) ||
      statusLabels[s.status]?.toLowerCase().includes(query)
    );
    
    return {
      chapter: chapterMatch || filteredSubtopics.length > 0,
      subtopics: chapterMatch ? subtopics : filteredSubtopics
    };
  };
  
  // Drag and drop des colonnes
  const handleColumnDragStart = (e, column) => {
    setDraggedColumn(column);
    e.target.classList.add('opacity-50');
  };
  
  const handleColumnDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedColumn(null);
  };
  
  const handleColumnDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleColumnDrop = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumn) return;
    
    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedColumn);
    const targetIndex = newColumnOrder.indexOf(targetColumn);
    
    newColumnOrder.splice(draggedIndex, 1);
    newColumnOrder.splice(targetIndex, 0, draggedColumn);
    
    setColumnOrder(newColumnOrder);
  };
  
  const renderCell = (column, chapter, subtopic = null) => {
    switch (column) {
      case 'checkbox':
        if (!subtopic) {
          return (
            <td className="w-10">
              <input
                type="checkbox"
                checked={chapter.enabled}
                onChange={(e) => onToggleChapter(chapter.id, { enabled: e.target.checked })}
                className="w-[18px] h-[18px] appearance-none border-2 border-white/[0.282] rounded cursor-pointer transition-all duration-150 hover:border-white/46 checked:bg-[rgb(35,131,226)] checked:border-[rgb(35,131,226)] relative
                  checked:after:content-[''] checked:after:absolute checked:after:top-[1px] checked:after:left-[5px] checked:after:w-1 checked:after:h-2 checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:transform checked:after:rotate-45"
              />
            </td>
          );
        } else {
          return <td className="w-10"></td>;
        }
        
      case 'name':
        if (!subtopic) {
          return <td className="font-semibold text-white/81">{chapter.name}</td>;
        } else {
          return (
            <td className="pl-10">
              <span className="text-white/81">
                {subtopic.icon} {subtopic.name}
              </span>
            </td>
          );
        }
        
      case 'startDate':
        if (!subtopic) return <td></td>;
        return (
          <td className="w-[120px]">
            <input
              type="date"
              value={subtopic.startDate || ''}
              onChange={(e) => onUpdateSubtopic(chapter.id, subtopic.id, { startDate: e.target.value })}
              disabled={!chapter.enabled}
              className="bg-transparent border-none text-white/81 text-sm cursor-pointer px-2 py-1 rounded hover:bg-white/[0.055] focus:outline-none focus:bg-white/[0.055] focus:border focus:border-white/[0.094] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </td>
        );
        
      case 'endDate':
        if (!subtopic) return <td></td>;
        return (
          <td className="w-[120px]">
            <input
              type="date"
              value={subtopic.endDate || ''}
              onChange={(e) => onUpdateSubtopic(chapter.id, subtopic.id, { endDate: e.target.value })}
              disabled={!chapter.enabled}
              className="bg-transparent border-none text-white/81 text-sm cursor-pointer px-2 py-1 rounded hover:bg-white/[0.055] focus:outline-none focus:bg-white/[0.055] focus:border focus:border-white/[0.094] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </td>
        );
        
      case 'priority':
        if (!subtopic) return <td></td>;
        return (
          <td className="w-[130px]">
            <select
              value={subtopic.priority}
              onChange={(e) => onUpdateSubtopic(chapter.id, subtopic.id, { priority: e.target.value })}
              disabled={!chapter.enabled}
              className={`px-2 py-1 rounded-md text-[13px] cursor-pointer transition-all duration-150 min-w-[120px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                ${subtopic.priority === 'low' ? 'bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/[0.13]' : ''}
                ${subtopic.priority === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/[0.13]' : ''}
                ${subtopic.priority === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/[0.13]' : ''}
              `}
            >
              <option value="low">Pas de panique</option>
              <option value="medium">Important</option>
              <option value="high">Très important</option>
            </select>
          </td>
        );
        
      case 'progress':
        if (!subtopic) return <td></td>;
        return (
          <td className="w-[120px]">
            <select
              value={subtopic.status}
              onChange={(e) => onUpdateSubtopic(chapter.id, subtopic.id, { status: e.target.value })}
              disabled={!chapter.enabled}
              className={`px-2 py-1 rounded-md text-[13px] cursor-pointer transition-all duration-150 min-w-[110px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                ${subtopic.status === 'not-started' ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/[0.13]' : ''}
                ${subtopic.status === 'in-progress' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/[0.13]' : ''}
                ${subtopic.status === 'done' ? 'bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/[0.13]' : ''}
              `}
            >
              <option value="not-started">Non commencé</option>
              <option value="in-progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </td>
        );
        
      case 'actions':
        return (
          <td className="w-20">
            <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => subtopic ? onEditSubtopic(chapter.id, subtopic) : onEditChapter(chapter)}
                className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                title="Modifier"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                </svg>
              </button>
              <button
                onClick={() => subtopic ? onDeleteSubtopic(chapter.id, subtopic.id) : onDeleteChapter(chapter.id)}
                className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                title="Supprimer"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                  <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                </svg>
              </button>
            </div>
          </td>
        );
        
      default:
        return <td></td>;
    }
  };
  
  return (
    <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
            {columnOrder.map(column => (
              <th
                key={column}
                data-column={column}
                draggable={column !== 'checkbox' && column !== 'name' && column !== 'actions'}
                onDragStart={(e) => handleColumnDragStart(e, column)}
                onDragEnd={handleColumnDragEnd}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, column)}
                className={`px-4 py-3 text-left text-[13px] font-medium text-white/46 select-none
                  ${column !== 'checkbox' && column !== 'name' && column !== 'actions' ? 'cursor-move hover:bg-[rgb(45,45,45)] transition-colors duration-150' : ''}
                `}
              >
                {column === 'checkbox' && ''}
                {column === 'name' && 'Nom'}
                {column === 'startDate' && 'Date début'}
                {column === 'endDate' && 'Date limite'}
                {column === 'priority' && 'Priorité'}
                {column === 'progress' && 'Progression'}
                {column === 'actions' && 'Actions'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => {
            const filtered = filterItems(chapter, chapter.subtopics);
            if (!filtered.chapter) return null;
            
            return (
              <React.Fragment key={chapter.id}>
                {/* Chapter row */}
                <tr className="bg-[rgb(37,37,37)] hover:bg-[rgb(40,40,40)] transition-colors duration-150">
                  {columnOrder.map(column => renderCell(column, chapter))}
                </tr>
                
                {/* Subtopic rows */}
                {filtered.subtopics.map(subtopic => (
                  <tr
                    key={subtopic.id}
                    className={`border-b border-white/[0.055] hover:bg-white/[0.03] transition-colors duration-150
                      ${!chapter.enabled ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    {columnOrder.map(column => renderCell(column, chapter, subtopic))}
                  </tr>
                ))}
                
                {/* Add subtopic row */}
                {chapter.enabled && (
                  <tr
                    className="cursor-pointer hover:bg-white/[0.03] transition-colors duration-150"
                    onClick={() => onAddSubtopic(chapter.id)}
                  >
                    <td></td>
                    <td className="pl-10 py-3 text-white/46">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-[14px] h-[14px]" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
                        </svg>
                        Ajouter un sous-chapitre
                      </span>
                    </td>
                    {columnOrder.slice(2).map(col => (
                      <td key={col}></td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ChaptersTable;
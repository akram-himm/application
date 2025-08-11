import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import CustomOptionsModal from '../components/plan/CustomOptionsModal';
import ColumnSelectorModal from '../components/plan/ColumnSelectorModal';

const PlanView = () => {
  const { radars } = useContext(AppContext);
  
  // États pour les tâches
  const [dailyTasksList, setDailyTasksList] = useState(() => {
    const saved = localStorage.getItem('dailyTasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [weeklyTasksList, setWeeklyTasksList] = useState(() => {
    const saved = localStorage.getItem('weeklyTasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // États pour les statuts et priorités personnalisés
  const [customStatuses, setCustomStatuses] = useState(() => {
    const saved = localStorage.getItem('customStatuses');
    return saved ? JSON.parse(saved) : [
      { id: 'not-started', name: 'Pas commencé', color: '#6B7280' },
      { id: 'in-progress', name: 'En cours', color: '#3B82F6' },
      { id: 'completed', name: 'Terminé', color: '#10B981' }
    ];
  });
  
  const [customPriorities, setCustomPriorities] = useState(() => {
    const saved = localStorage.getItem('customPriorities');
    return saved ? JSON.parse(saved) : [
      { id: 'low', name: 'Basse', color: '#10B981' },
      { id: 'medium', name: 'Moyenne', color: '#F59E0B' },
      { id: 'high', name: 'Haute', color: '#EF4444' }
    ];
  });
  
  // États pour les colonnes visibles
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('visibleColumns');
    return saved ? JSON.parse(saved) : [
      'name', 'status', 'priority', 'date', 'time'
    ];
  });
  
  // État pour les largeurs de colonnes
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('columnWidths');
    return saved ? JSON.parse(saved) : {
      name: 300,
      status: 150,
      priority: 150,
      date: 120,
      endDate: 120,
      time: 100,
      assignee: 120,
      progress: 100
    };
  });
  
  // États pour les modals
  const [showCustomOptionsModal, setShowCustomOptionsModal] = useState(false);
  const [customOptionsType, setCustomOptionsType] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [columnSelectorTable, setColumnSelectorTable] = useState(null);
  
  // États pour le drag & drop
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [draggedRow, setDraggedRow] = useState(null);
  const [draggedFromTable, setDraggedFromTable] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  // États pour l'édition inline
  const [newTaskName, setNewTaskName] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(null); // 'daily' ou 'weekly'
  const [editingCellId, setEditingCellId] = useState(null);
  const [editingCellValue, setEditingCellValue] = useState('');
  
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    taskId: null,
    tableType: null
  });
  
  // État pour le redimensionnement
  const [resizingColumn, setResizingColumn] = useState(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);
  
  // Headers des colonnes
  const columnHeaders = {
    name: 'Nom',
    status: 'Statut',
    priority: 'Priorité',
    date: 'Date',
    endDate: 'Date limite',
    time: 'Heure',
    assignee: 'Assigné',
    progress: 'Progression'
  };
  
  // Colonnes disponibles avec icônes
  const availableColumns = [
    { id: 'assignee', label: 'Assigné', icon: '👤' },
    { id: 'progress', label: 'Progression', icon: '📊' }
  ];
  
  // Sauvegardes localStorage
  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasksList));
  }, [dailyTasksList]);
  
  useEffect(() => {
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasksList));
  }, [weeklyTasksList]);
  
  useEffect(() => {
    localStorage.setItem('customStatuses', JSON.stringify(customStatuses));
  }, [customStatuses]);
  
  useEffect(() => {
    localStorage.setItem('customPriorities', JSON.stringify(customPriorities));
  }, [customPriorities]);
  
  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  
  useEffect(() => {
    localStorage.setItem('columnWidths', JSON.stringify(columnWidths));
  }, [columnWidths]);
  
  // Déplacement automatique des tâches (UNIQUEMENT pour les tâches qui ont la date d'aujourd'hui)
  useEffect(() => {
    const moveTasksToDaily = () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Trouver les tâches hebdomadaires qui ont la date d'aujourd'hui ET qui n'ont pas été déplacées
      const tasksToMove = weeklyTasksList.filter(task => 
        task.date === today && 
        !task.movedToDaily && 
        !task.disableAutoMove &&
        task.autoMoveEnabled === true // Nouvelle propriété pour contrôler l'auto-move
      );
      
      if (tasksToMove.length > 0) {
        const existingDailyIds = new Set(dailyTasksList.map(t => t.id));
        const toAdd = tasksToMove.filter(t => !existingDailyIds.has(t.id));
        
        if (toAdd.length > 0) {
          // Ajouter au daily
          setDailyTasksList(prev => [...prev, ...toAdd]);
          // Marquer comme déplacé dans weekly
          setWeeklyTasksList(prev => prev.map(task => 
            toAdd.find(t => t.id === task.id) 
              ? { ...task, movedToDaily: true }
              : task
          ));
        }
      }
    };
    
    // Ne pas exécuter au montage initial pour éviter les déplacements non désirés
    const timer = setTimeout(() => {
      moveTasksToDaily();
    }, 1000);
    
    const interval = setInterval(moveTasksToDaily, 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [weeklyTasksList, dailyTasksList]);
  
  // Fermer le menu contextuel
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  // Gestion du redimensionnement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingColumn) return;
      
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(50, resizeStartWidth.current + diff);
      
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    };
    
    const handleMouseUp = () => {
      setResizingColumn(null);
    };
    
    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn]);
  
  // Redimensionnement des colonnes
  const handleColumnResize = (e, column) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[column];
  };
  
  // Drag & Drop des colonnes
  const handleColumnDragStart = (e, column) => {
    if (column === 'name') return;
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleColumnDrop = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumn || targetColumn === 'name') return;
    
    const draggedIndex = visibleColumns.indexOf(draggedColumn);
    const targetIndex = visibleColumns.indexOf(targetColumn);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newColumns = [...visibleColumns];
      newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, draggedColumn);
      setVisibleColumns(newColumns);
    }
    
    setDraggedColumn(null);
  };
  
  // Drag & Drop des lignes - Handlers simplifiés et améliorés
  const handleRowDragStart = (e, taskId, tableType) => {
    setDraggedRow(taskId.toString());
    setDraggedFromTable(tableType);
    e.dataTransfer.effectAllowed = 'move';
    
    // Ajouter un effet visuel
    setTimeout(() => {
      const row = document.querySelector(`[data-task-id="${taskId}"]`);
      if (row) {
        row.style.opacity = '0.4';
      }
    }, 0);
  };
  
  const handleRowDragEnd = () => {
    // Restaurer l'opacité
    const row = document.querySelector(`[data-task-id="${draggedRow}"]`);
    if (row) {
      row.style.opacity = '1';
    }
    
    setDraggedRow(null);
    setDraggedFromTable(null);
    setDragOverRow(null);
  };
  
  const handleRowDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trouver la ligne la plus proche
    const afterElement = getDragAfterElement(e.currentTarget.parentElement, e.clientY);
    if (afterElement) {
      const taskId = afterElement.getAttribute('data-task-id');
      if (taskId && taskId !== draggedRow) {
        setDragOverRow(taskId);
      }
    }
  };
  
  const handleTableDragOver = (e, tableType) => {
    e.preventDefault();
    
    // Permettre le drop sur tout le tableau
    const tbody = e.currentTarget;
    const afterElement = getDragAfterElement(tbody, e.clientY);
    
    if (afterElement) {
      const taskId = afterElement.getAttribute('data-task-id');
      if (taskId) {
        setDragOverRow(taskId);
      }
    } else {
      // Si aucun élément après, on est à la fin
      setDragOverRow('end-' + tableType);
    }
  };
  
  // Helper pour trouver l'élément après le curseur
  const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('tr[data-task-id]:not([data-dragging])')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  };
  
  const handleRowDragLeave = (e) => {
    // Ne pas effacer si on reste dans le tableau
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverRow(null);
    }
  };
  
  const handleRowDrop = (e, targetTaskId, targetTableType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedRow) {
      setDragOverRow(null);
      return;
    }
    
    const sourceList = draggedFromTable === 'daily' ? dailyTasksList : weeklyTasksList;
    const draggedTask = sourceList.find(t => t.id.toString() === draggedRow);
    
    if (!draggedTask) {
      setDragOverRow(null);
      return;
    }
    
    // Créer une copie de la tâche pour éviter les mutations
    const taskCopy = { ...draggedTask };
    
    if (draggedFromTable !== targetTableType) {
      // Déplacement entre tables - IMPORTANT: retirer de la source d'abord
      if (draggedFromTable === 'daily') {
        // Retirer du daily
        setDailyTasksList(prev => prev.filter(t => t.id.toString() !== draggedRow));
        
        // Ajouter au weekly
        setWeeklyTasksList(prev => {
          const newList = [...prev];
          
          if (targetTaskId && targetTaskId !== 'end-weekly') {
            const targetIndex = newList.findIndex(t => t.id.toString() === targetTaskId.toString());
            if (targetIndex !== -1) {
              newList.splice(targetIndex, 0, { ...taskCopy, movedToDaily: false });
            } else {
              newList.push({ ...taskCopy, movedToDaily: false });
            }
          } else {
            newList.push({ ...taskCopy, movedToDaily: false });
          }
          
          return newList;
        });
      } else {
        // Retirer du weekly
        setWeeklyTasksList(prev => prev.filter(t => t.id.toString() !== draggedRow));
        
        // Ajouter au daily
        setDailyTasksList(prev => {
          const newList = [...prev];
          
          if (targetTaskId && targetTaskId !== 'end-daily') {
            const targetIndex = newList.findIndex(t => t.id.toString() === targetTaskId.toString());
            if (targetIndex !== -1) {
              newList.splice(targetIndex, 0, taskCopy);
            } else {
              newList.push(taskCopy);
            }
          } else {
            newList.push(taskCopy);
          }
          
          return newList;
        });
      }
    } else {
      // Réorganisation dans la même table
      const setTasksList = targetTableType === 'daily' ? setDailyTasksList : setWeeklyTasksList;
      
      setTasksList(prev => {
        const newList = [...prev];
        const draggedIndex = newList.findIndex(t => t.id.toString() === draggedRow);
        
        if (draggedIndex === -1) return prev;
        
        // Retirer l'élément draggé
        const [removed] = newList.splice(draggedIndex, 1);
        
        if (targetTaskId && targetTaskId !== `end-${targetTableType}`) {
          // Insérer avant la cible
          const targetIndex = newList.findIndex(t => t.id.toString() === targetTaskId.toString());
          if (targetIndex !== -1) {
            newList.splice(targetIndex, 0, removed);
          } else {
            newList.push(removed);
          }
        } else {
          // Ajouter à la fin
          newList.push(removed);
        }
        
        return newList;
      });
    }
    
    setDragOverRow(null);
    setDraggedRow(null);
    setDraggedFromTable(null);
  };
  
  // Menu contextuel
  const handleDragHandleContextMenu = (e, taskId, tableType) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      taskId,
      tableType,
      isDeleteOnly: true
    });
  };
  
  const handleTaskContextMenu = (e, taskId, tableType) => {
    e.preventDefault();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      taskId,
      tableType,
      isDeleteOnly: false
    });
  };
  
  // Actions sur les tâches
  const handleDeleteTask = (taskId, tableType) => {
    if (tableType === 'daily') {
      setDailyTasksList(prev => prev.filter(t => t.id !== taskId));
    } else {
      setWeeklyTasksList(prev => prev.filter(t => t.id !== taskId));
    }
    closeContextMenu();
  };
  
  const handleDuplicateTask = (taskId, tableType) => {
    const tasksList = tableType === 'daily' ? dailyTasksList : weeklyTasksList;
    const task = tasksList.find(t => t.id === taskId);
    
    if (task) {
      const newTask = { ...task, id: Date.now(), name: `${task.name} (copie)` };
      if (tableType === 'daily') {
        setDailyTasksList(prev => [...prev, newTask]);
      } else {
        setWeeklyTasksList(prev => [...prev, newTask]);
      }
    }
    closeContextMenu();
  };
  
  const toggleAutoMove = (taskId) => {
    setWeeklyTasksList(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, disableAutoMove: !task.disableAutoMove }
        : task
    ));
    closeContextMenu();
  };
  
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, taskId: null });
  };
  
  // Gestion des tâches - Ajout direct sans modal (SANS duplication)
  const handleQuickAddTask = (tableType) => {
    if (!newTaskName.trim()) {
      setIsAddingTask(null);
      setNewTaskName('');
      return;
    }
    
    const newTask = {
      id: Date.now(),
      name: newTaskName.trim(),
      description: '',
      status: customStatuses[0]?.id || 'not-started',
      priority: customPriorities[0]?.id || 'medium',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      time: '',
      assignee: '',
      completed: false,
      progress: 0,
      tag: null,
      autoMoveEnabled: false // Par défaut, pas d'auto-move pour les nouvelles tâches
    };
    
    // Ajouter UNIQUEMENT dans le tableau spécifié
    if (tableType === 'daily') {
      setDailyTasksList(prev => [...prev, newTask]);
    } else if (tableType === 'weekly') {
      // Pour le weekly, ne PAS ajouter automatiquement au daily
      setWeeklyTasksList(prev => [...prev, newTask]);
    }
    
    setNewTaskName('');
    setIsAddingTask(null);
  };
  
  // Gestion des tâches avec tableType explicite
  const handleUpdateTask = (taskId, taskData, explicitTableType = null) => {
    const tableType = explicitTableType || 
      (dailyTasksList.some(t => t.id === taskId) ? 'daily' : 'weekly');
    
    if (tableType === 'daily') {
      setDailyTasksList(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
    } else {
      setWeeklyTasksList(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
    }
  };
  
  // Édition inline du nom
  const handleStartEditingName = (taskId, currentName) => {
    setEditingCellId(`name-${taskId}`);
    setEditingCellValue(currentName);
  };
  
  const handleSaveEditingName = (taskId, tableType) => {
    const tasksList = tableType === 'daily' ? dailyTasksList : weeklyTasksList;
    const setTasksList = tableType === 'daily' ? setDailyTasksList : setWeeklyTasksList;
    
    setTasksList(prev => prev.map(task => 
      task.id === taskId ? { ...task, name: editingCellValue } : task
    ));
    
    setEditingCellId(null);
    setEditingCellValue('');
  };
  
  // Gestion des colonnes
  const handleAddColumn = (columnId) => {
    if (!visibleColumns.includes(columnId)) {
      setVisibleColumns(prev => [...prev, columnId]);
    }
    
    if (!columnWidths[columnId]) {
      setColumnWidths(prev => ({ ...prev, [columnId]: 120 }));
    }
    
    setShowColumnSelector(false);
  };
  
  // Obtenir les colonnes pour chaque tableau
  const getColumnsForTable = (tableType) => {
    if (tableType === 'weekly') {
      const cols = [...visibleColumns];
      const dateIndex = cols.indexOf('date');
      if (dateIndex !== -1 && !cols.includes('endDate')) {
        cols.splice(dateIndex + 1, 0, 'endDate');
      }
      return cols;
    }
    return visibleColumns;
  };
  
  // Handler pour hover des lignes
  const handleRowMouseEnter = (taskId) => {
    setHoveredRowId(taskId);
  };
  
  const handleRowMouseLeave = () => {
    setHoveredRowId(null);
  };
  
  // Rendu d'une table (avec ajout direct et poignées corrigées)
  const renderTable = (title, taskList, tableType) => {
    const columns = getColumnsForTable(tableType);
    
    return (
      <div>
        <h2 className="text-white/81 font-medium text-lg mb-3">{title}</h2>
        
        <div className="flex">
          {/* Drag handles - VRAIMENT à l'extérieur */}
          <div className="w-8 mr-2">
            <div className="h-[41px]"></div>
            {taskList.map((task) => (
              <div
                key={`handle-${task.id}`}
                className="h-[49px] flex items-center justify-center"
              >
                <div
                  className={`transition-opacity duration-150 ${
                    hoveredRowId === task.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  draggable
                  onDragStart={(e) => handleRowDragStart(e, task.id, tableType)}
                  onDragEnd={handleRowDragEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDragHandleContextMenu(e, task.id, tableType);
                  }}
                  onMouseEnter={() => setHoveredRowId(task.id)}
                  style={{ cursor: 'grab' }}
                >
                  <svg className="w-4 h-4 text-white/30" viewBox="0 0 16 4" fill="currentColor">
                    <circle cx="2" cy="2" r="1.5"/>
                    <circle cx="8" cy="2" r="1.5"/>
                    <circle cx="14" cy="2" r="1.5"/>
                  </svg>
                </div>
              </div>
            ))}
            {/* Ligne pour l'ajout - avec hover séparé */}
            <div 
              className="h-[49px] flex items-center justify-center"
              onMouseEnter={() => setHoveredRowId(`add-${tableType}`)}
              onMouseLeave={() => setHoveredRowId(null)}
            >
              <div className={`transition-opacity duration-150 ${
                hoveredRowId === `add-${tableType}` ? 'opacity-100' : 'opacity-0'
              }`}>
                <svg className="w-4 h-4 text-white/20" viewBox="0 0 16 4" fill="currentColor">
                  <circle cx="2" cy="2" r="1.5"/>
                  <circle cx="8" cy="2" r="1.5"/>
                  <circle cx="14" cy="2" r="1.5"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Table sans colonne de poignées */}
          <div className="flex-1 bg-[rgb(32,32,32)] rounded-lg overflow-hidden border border-[rgb(47,47,47)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
                    {columns.map((column, index) => (
                      <th 
                        key={column}
                        draggable={column !== 'name'}
                        onDragStart={(e) => handleColumnDragStart(e, column)}
                        onDragOver={handleColumnDragOver}
                        onDrop={(e) => handleColumnDrop(e, column)}
                        className={`px-4 py-3 text-left text-[13px] font-medium text-white/46 relative group ${
                          column !== 'name' ? 'cursor-move' : ''
                        }`}
                        style={{ 
                          width: columnWidths[column],
                          minWidth: columnWidths[column]
                        }}
                      >
                        {columnHeaders[column]}
                        {index < columns.length - 1 && (
                          <div className="absolute right-0 top-0 bottom-0 w-px bg-[rgb(47,47,47)]">
                            <div
                              className="absolute right-[-2px] top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20"
                              onMouseDown={(e) => handleColumnResize(e, column)}
                            />
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  onDragOver={(e) => handleTableDragOver(e, tableType)}
                  onDrop={(e) => {
                    if (!e.defaultPrevented) {
                      handleRowDrop(e, dragOverRow, tableType);
                    }
                  }}
                >
                  {taskList.map((task) => (
                    <tr 
                      key={task.id}
                      data-task-id={task.id}
                      data-dragging={draggedRow === task.id.toString() ? 'true' : undefined}
                      className={`border-b border-white/[0.055] hover:bg-white/[0.02] transition-all duration-200 ${
                        dragOverRow === task.id.toString() ? 'border-t-2 border-t-[rgb(35,131,226)]' : ''
                      }`}
                      style={{
                        opacity: draggedRow === task.id.toString() ? 0.4 : 1,
                        backgroundColor: draggedRow === task.id.toString() ? 'rgba(255,255,255,0.02)' : ''
                      }}
                      onDragOver={handleRowDragOver}
                      onDragLeave={handleRowDragLeave}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRowDrop(e, task.id, tableType);
                      }}
                      onMouseEnter={() => setHoveredRowId(task.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      onContextMenu={(e) => handleTaskContextMenu(e, task.id, tableType)}
                    >
                      {columns.map(column => (
                        <td key={column} className="px-4 py-3" style={{ 
                          width: columnWidths[column],
                          minWidth: columnWidths[column]
                        }}>
                          {renderCell(task, column, tableType)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Ligne d'ajout direct */}
                  <tr 
                    className="border-b border-white/[0.055] hover:bg-white/[0.02] transition-colors"
                    onMouseEnter={() => setHoveredRowId(`add-${tableType}`)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    {columns.map(column => (
                      <td key={column} className="px-4 py-3">
                        {column === 'name' ? (
                          isAddingTask === tableType ? (
                            <input
                              type="text"
                              value={newTaskName}
                              onChange={(e) => setNewTaskName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleQuickAddTask(tableType);
                                }
                              }}
                              onBlur={() => handleQuickAddTask(tableType)}
                              placeholder="Nom de la tâche..."
                              className="w-full px-2 py-1 bg-white/[0.055] border border-white/20 rounded text-white/81 text-sm placeholder-white/30 focus:outline-none focus:border-[rgb(35,131,226)]"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setIsAddingTask(tableType);
                                setNewTaskName('');
                              }}
                              className="text-white/30 hover:text-white/60 text-sm transition-colors"
                            >
                              + Ajouter une tâche
                            </button>
                          )
                        ) : column === 'status' && isAddingTask === tableType ? (
                          <div className="px-2 py-1 bg-white/[0.055] rounded text-white/46 text-sm">
                            {customStatuses[0]?.name || 'À faire'}
                          </div>
                        ) : column === 'priority' && isAddingTask === tableType ? (
                          <div className="px-2 py-1 bg-white/[0.055] rounded text-white/46 text-sm">
                            {customPriorities[0]?.name || 'Moyenne'}
                          </div>
                        ) : column === 'date' && isAddingTask === tableType ? (
                          <div className="text-white/46 text-sm">
                            {new Date().toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Zone de drop en fin de tableau avec indicateur visuel */}
                  {draggedRow && (
                    <tr 
                      className={`h-2 ${
                        dragOverRow === `end-${tableType}` ? 'bg-[rgb(35,131,226)] opacity-20' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverRow(`end-${tableType}`);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRowDrop(e, null, tableType);
                      }}
                    >
                      <td colSpan={columns.length}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu d'une cellule
  const renderCell = (task, column, tableType) => {
    switch (column) {
      case 'name':
        const isEditing = editingCellId === `name-${task.id}`;
        return (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                type="text"
                value={editingCellValue}
                onChange={(e) => setEditingCellValue(e.target.value)}
                onBlur={() => handleSaveEditingName(task.id, tableType)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEditingName(task.id, tableType);
                  }
                }}
                className="flex-1 px-2 py-1 bg-white/[0.055] border border-white/20 rounded text-white/81 text-sm focus:outline-none focus:border-[rgb(35,131,226)]"
                autoFocus
              />
            ) : (
              <>
                <div 
                  className="flex-1 cursor-text"
                  onClick={() => handleStartEditingName(task.id, task.name)}
                >
                  {task.tag ? (
                    <div>
                      <div className="text-white/81 text-sm">{task.name}</div>
                      <div className="text-white/46 text-xs mt-0.5">
                        {task.tag.type === 'radar' ? task.tag.radarName : task.tag.path}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/81 text-sm">{task.name}</div>
                  )}
                </div>
                <button
                  onClick={() => handleStartEditingName(task.id, task.name)}
                  className="p-1 text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        );
        
      case 'status':
        const allStatuses = [...customStatuses, { id: 'add-status', name: '+ Ajouter', isAddButton: true, color: '#374151' }];
        const currentStatus = task.status || customStatuses[0]?.id;
        const statusOption = customStatuses.find(s => s.id === currentStatus) || customStatuses[0];
        
        return (
          <select
            value={currentStatus}
            onChange={(e) => {
              if (e.target.value === 'add-status') {
                openCustomOptionsModal('status');
              } else {
                handleUpdateTask(task.id, { ...task, status: e.target.value }, tableType);
              }
            }}
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20 transition-all"
            style={{ 
              backgroundColor: statusOption ? `${statusOption.color}25` : 'rgba(255,255,255,0.055)',
              borderColor: statusOption ? `${statusOption.color}40` : 'rgba(255,255,255,0.094)'
            }}
          >
            {allStatuses.map(status => (
              <option 
                key={status.id} 
                value={status.id}
                className="bg-[rgb(37,37,37)]"
              >
                {status.name}
              </option>
            ))}
          </select>
        );
        
      case 'priority':
        const allPriorities = [...customPriorities, { id: 'add-priority', name: '+ Ajouter', isAddButton: true, color: '#374151' }];
        const currentPriority = task.priority || customPriorities[0]?.id;
        const priorityOption = customPriorities.find(p => p.id === currentPriority) || customPriorities[0];
        
        return (
          <select
            value={currentPriority}
            onChange={(e) => {
              if (e.target.value === 'add-priority') {
                openCustomOptionsModal('priority');
              } else {
                handleUpdateTask(task.id, { ...task, priority: e.target.value }, tableType);
              }
            }}
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20 transition-all"
            style={{ 
              backgroundColor: priorityOption ? `${priorityOption.color}25` : 'rgba(255,255,255,0.055)',
              borderColor: priorityOption ? `${priorityOption.color}40` : 'rgba(255,255,255,0.094)'
            }}
          >
            {allPriorities.map(priority => (
              <option 
                key={priority.id} 
                value={priority.id}
                className="bg-[rgb(37,37,37)]"
              >
                {priority.name}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={task.date || ''}
            onChange={(e) => handleUpdateTask(task.id, { ...task, date: e.target.value }, tableType)}
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20"
          />
        );
        
      case 'endDate':
        return (
          <input
            type="date"
            value={task.endDate || ''}
            onChange={(e) => handleUpdateTask(task.id, { ...task, endDate: e.target.value }, tableType)}
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20"
          />
        );
        
      case 'time':
        return (
          <input
            type="time"
            value={task.time || ''}
            onChange={(e) => handleUpdateTask(task.id, { ...task, time: e.target.value }, tableType)}
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm focus:outline-none focus:border-white/20"
          />
        );
        
      case 'assignee':
        return (
          <input
            type="text"
            value={task.assignee || ''}
            onChange={(e) => handleUpdateTask(task.id, { ...task, assignee: e.target.value }, tableType)}
            placeholder="Non assigné"
            className="w-full px-2 py-1 bg-white/[0.055] border border-white/[0.094] rounded text-white/81 text-sm placeholder-white/30 focus:outline-none focus:border-white/20"
          />
        );
        
      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              value={task.progress || 0}
              onChange={(e) => handleUpdateTask(task.id, { ...task, progress: parseInt(e.target.value) }, tableType)}
              min="0"
              max="100"
              className="flex-1 h-1.5 bg-white/[0.055] rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(35,131,226) 0%, rgb(35,131,226) ${task.progress || 0}%, rgba(255,255,255,0.055) ${task.progress || 0}%, rgba(255,255,255,0.055) 100%)`
              }}
            />
            <span className="text-white/46 text-xs w-8">{task.progress || 0}%</span>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Ouvrir le modal d'options
  const openCustomOptionsModal = (type) => {
    setCustomOptionsType(type);
    setShowCustomOptionsModal(true);
  };
  
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white/81 mb-2">To do</h1>
        <p className="text-white/46">Gérez vos tâches quotidiennes et hebdomadaires</p>
      </div>
      
      <div className="space-y-8">
        {renderTable('To do', dailyTasksList, 'daily')}
        {renderTable('Tâches de la semaine', weeklyTasksList, 'weekly')}
      </div>
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.isDeleteOnly ? (
            <button
              onClick={() => handleDeleteTask(contextMenu.taskId, contextMenu.tableType)}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/[0.055] transition-colors"
            >
              Supprimer
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  const task = contextMenu.tableType === 'daily' 
                    ? dailyTasksList.find(t => t.id === contextMenu.taskId)
                    : weeklyTasksList.find(t => t.id === contextMenu.taskId);
                  if (task) {
                    handleStartEditingName(task.id, task.name);
                  }
                  closeContextMenu();
                }}
                className="w-full px-4 py-2 text-left text-sm text-white/81 hover:bg-white/[0.055] transition-colors"
              >
                Modifier le nom
              </button>
              <button
                onClick={() => handleDuplicateTask(contextMenu.taskId, contextMenu.tableType)}
                className="w-full px-4 py-2 text-left text-sm text-white/81 hover:bg-white/[0.055] transition-colors"
              >
                Dupliquer
              </button>
              {contextMenu.tableType === 'weekly' && (
                <button
                  onClick={() => toggleAutoMove(contextMenu.taskId)}
                  className="w-full px-4 py-2 text-left text-sm text-white/81 hover:bg-white/[0.055] transition-colors"
                >
                  {weeklyTasksList.find(t => t.id === contextMenu.taskId)?.disableAutoMove 
                    ? 'Activer le déplacement auto' 
                    : 'Désactiver le déplacement auto'}
                </button>
              )}
              <hr className="my-1 border-[rgb(47,47,47)]" />
              <button
                onClick={() => handleDeleteTask(contextMenu.taskId, contextMenu.tableType)}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/[0.055] transition-colors"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Modals */}      
      {showCustomOptionsModal && (
        <CustomOptionsModal
          type={customOptionsType}
          options={customOptionsType === 'status' ? customStatuses : customPriorities}
          onSave={(newOptions) => {
            if (customOptionsType === 'status') {
              setCustomStatuses(newOptions);
            } else {
              setCustomPriorities(newOptions);
            }
            setShowCustomOptionsModal(false);
            setCustomOptionsType(null);
          }}
          onClose={() => {
            setShowCustomOptionsModal(false);
            setCustomOptionsType(null);
          }}
        />
      )}
      
      {showColumnSelector && (
        <ColumnSelectorModal
          availableColumns={availableColumns}
          onSelect={(columnId) => handleAddColumn(columnId)}
          onClose={() => {
            setShowColumnSelector(false);
            setColumnSelectorTable(null);
          }}
        />
      )}
    </div>
  );
};

export default PlanView;
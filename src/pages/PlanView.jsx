import React, { useState, useContext, useEffect, useRef, useLayoutEffect } from 'react';
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
  const [isAddingTask, setIsAddingTask] = useState(null);
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
  
  // Colonnes disponibles
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
  
  // Auto-move des tâches hebdomadaires vers quotidiennes
  useEffect(() => {
    const moveTasksToDaily = () => {
      const today = new Date().toLocaleDateString();
      
      for (const task of weeklyTasksList) {
        if (task.autoMoveEnabled && !task.disableAutoMove && !task.movedToDaily) {
          const taskDate = new Date(task.date).toLocaleDateString();
          
          if (taskDate === today) {
            const existsInDaily = dailyTasksList.some(t => 
              t.name === task.name && 
              new Date(t.date).toLocaleDateString() === today
            );
            
            if (!existsInDaily) {
              const dailyTask = { ...task, id: Date.now() + Math.random() };
              setDailyTasksList(prev => [...prev, dailyTask]);
            }
            
            setWeeklyTasksList(prev => prev.map(t => 
              t.id === task.id 
                ? { ...task, movedToDaily: true }
                : t
            ));
          }
        }
      }
    };
    
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
  
  // Handlers
  const handleColumnResize = (e, column) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(column);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[column];
  };
  
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
  
  const handleRowDragStart = (e, taskId, tableType) => {
    setDraggedRow(taskId.toString());
    setDraggedFromTable(tableType);
    e.dataTransfer.effectAllowed = 'move';
    
    // Créer une image de prévisualisation personnalisée
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      background: rgba(35, 131, 226, 0.1);
      border: 1px solid rgb(35, 131, 226);
      border-radius: 4px;
      padding: 8px 12px;
      color: white;
      font-size: 14px;
      pointer-events: none;
    `;
    
    const task = tableType === 'daily' 
      ? dailyTasksList.find(t => t.id === taskId)
      : weeklyTasksList.find(t => t.id === taskId);
    
    if (task) {
      dragPreview.textContent = task.name;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 0, 0);
      
      // Nettoyer après un court délai
      setTimeout(() => {
        document.body.removeChild(dragPreview);
      }, 0);
    }
  };
  
  const handleRowDragEnd = () => {
    setDraggedRow(null);
    setDraggedFromTable(null);
    setDragOverRow(null);
  };
  
  const handleRowDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleRowDragEnter = (e, taskId) => {
    if (draggedRow && draggedRow !== taskId.toString()) {
      setDragOverRow(taskId.toString());
    }
  };
  
  const handleRowDragLeave = (e) => {
    // Vérifier si on quitte vraiment la ligne
    const relatedTarget = e.relatedTarget;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverRow(null);
    }
  };
  
  const handleTableDragOver = (e, tableType) => {
    e.preventDefault();
    
    const tbody = e.currentTarget;
    const rect = tbody.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    
    if (relativeY > rect.height - 50) {
      setDragOverRow(`end-${tableType}`);
    }
  };
  
  const handleRowDrop = (e, targetTaskId, targetTableType) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedRow || !draggedFromTable) return;
    
    if (draggedFromTable !== targetTableType) {
      const sourceList = draggedFromTable === 'daily' ? dailyTasksList : weeklyTasksList;
      const setSourceList = draggedFromTable === 'daily' ? setDailyTasksList : setWeeklyTasksList;
      const setTargetList = targetTableType === 'daily' ? setDailyTasksList : setWeeklyTasksList;
      
      const taskToMove = sourceList.find(t => t.id.toString() === draggedRow);
      
      if (taskToMove) {
        setSourceList(prev => prev.filter(t => t.id.toString() !== draggedRow));
        
        setTargetList(prev => {
          const newList = [...prev];
          
          if (targetTaskId && targetTaskId !== `end-${targetTableType}`) {
            const targetIndex = newList.findIndex(t => t.id.toString() === targetTaskId.toString());
            if (targetIndex !== -1) {
              newList.splice(targetIndex, 0, { ...taskToMove, id: Date.now() });
            } else {
              newList.push({ ...taskToMove, id: Date.now() });
            }
          } else {
            newList.push({ ...taskToMove, id: Date.now() });
          }
          
          return newList;
        });
      }
    } else {
      const setTasksList = targetTableType === 'daily' ? setDailyTasksList : setWeeklyTasksList;
      
      setTasksList(prev => {
        const newList = [...prev];
        const draggedIndex = newList.findIndex(t => t.id.toString() === draggedRow);
        
        if (draggedIndex === -1) return prev;
        
        const [removed] = newList.splice(draggedIndex, 1);
        
        if (targetTaskId && targetTaskId !== `end-${targetTableType}`) {
          const targetIndex = newList.findIndex(t => t.id.toString() === targetTaskId.toString());
          if (targetIndex !== -1) {
            newList.splice(targetIndex, 0, removed);
          } else {
            newList.push(removed);
          }
        } else {
          newList.push(removed);
        }
        
        return newList;
      });
    }
    
    setDragOverRow(null);
    setDraggedRow(null);
    setDraggedFromTable(null);
  };
  
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
      autoMoveEnabled: false
    };
    
    if (tableType === 'daily') {
      setDailyTasksList(prev => [...prev, newTask]);
    } else if (tableType === 'weekly') {
      setWeeklyTasksList(prev => [...prev, newTask]);
    }
    
    setNewTaskName('');
    setIsAddingTask(null);
  };
  
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
  
  const handleStartEditingName = (taskId, currentName) => {
    setEditingCellId(`name-${taskId}`);
    setEditingCellValue(currentName);
  };
  
  const handleSaveEditingName = (taskId, tableType) => {
    const setTasksList = tableType === 'daily' ? setDailyTasksList : setWeeklyTasksList;
    
    setTasksList(prev => prev.map(task => 
      task.id === taskId ? { ...task, name: editingCellValue } : task
    ));
    
    setEditingCellId(null);
    setEditingCellValue('');
  };
  
  const handleAddColumn = (columnId) => {
    if (!visibleColumns.includes(columnId)) {
      setVisibleColumns(prev => [...prev, columnId]);
    }
    
    if (!columnWidths[columnId]) {
      setColumnWidths(prev => ({ ...prev, [columnId]: 120 }));
    }
    
    setShowColumnSelector(false);
  };
  
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
  
  // Composant de table avec synchronisation des handles
  const TableWithHandles = ({ title, taskList, tableType }) => {
    const wrapperRef = useRef(null);
    const theadRef = useRef(null);
    const tbodyRef = useRef(null);
    const [handleSlots, setHandleSlots] = useState([]);
    const [headerHeight, setHeaderHeight] = useState(0);
    
    const columns = getColumnsForTable(tableType);
    
    // Mesurer les positions des lignes
    const measureRows = () => {
      if (!tbodyRef.current || !theadRef.current) return;
      
      const thead = theadRef.current;
      const tbody = tbodyRef.current;
      const theadRect = thead.getBoundingClientRect();
      const tbodyRect = tbody.getBoundingClientRect();
      
      // Hauteur du header
      setHeaderHeight(theadRect.height);
      
      // Récupérer toutes les lignes avec data-row-id
      const rows = Array.from(tbody.querySelectorAll('tr[data-row-id]'));
      const slots = rows.map(row => {
        const rect = row.getBoundingClientRect();
        return {
          id: row.getAttribute('data-row-id'),
          top: rect.top - tbodyRect.top,
          height: rect.height
        };
      });
      
      setHandleSlots(slots);
    };
    
    // Observer les changements de taille et re-mesurer
    useLayoutEffect(() => {
      measureRows();
      
      const resizeObserver = new ResizeObserver(() => {
        measureRows();
      });
      
      if (tbodyRef.current) {
        resizeObserver.observe(tbodyRef.current);
      }
      if (theadRef.current) {
        resizeObserver.observe(theadRef.current);
      }
      
      window.addEventListener('resize', measureRows);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', measureRows);
      };
    }, []); // Dépendances vides pour ne s'exécuter qu'au mount
    
    // Re-mesurer quand les données changent
    useEffect(() => {
      // Petit délai pour laisser le DOM se mettre à jour
      const timer = setTimeout(() => {
        measureRows();
      }, 0);
      
      return () => clearTimeout(timer);
    }, [taskList.length, hoveredRowId, draggedRow, dragOverRow, isAddingTask]);
    
    return (
      <div>
        <h2 className="text-white/81 font-medium text-lg mb-3">{title}</h2>
        
        <div ref={wrapperRef} className="relative flex">
          {/* Gouttière des handles - position absolue synchronisée */}
          <div className="relative w-8 mr-2">
            {/* Espace pour le header */}
            <div style={{ height: headerHeight }}></div>
            
            {/* Container pour les handles positionnés absolument */}
            <div className="relative">
              {handleSlots.map(slot => {
                const taskId = slot.id === 'add-row' ? `add-${tableType}` : parseInt(slot.id);
                const isAddRow = slot.id === 'add-row';
                
                return (
                  <div
                    key={slot.id}
                    className="absolute inset-x-0 flex items-center justify-center"
                    style={{
                      top: slot.top,
                      height: slot.height
                    }}
                    onMouseEnter={() => !isAddRow && setHoveredRowId(taskId)}
                    onMouseLeave={() => !isAddRow && setHoveredRowId(null)}
                  >
                    {!isAddRow && (
                      <div
                        className={`transition-opacity duration-150 cursor-grab select-none ${
                          hoveredRowId === taskId ? 'opacity-100' : 'opacity-0'
                        }`}
                        draggable
                        onDragStart={(e) => handleRowDragStart(e, taskId, tableType)}
                        onDragEnd={handleRowDragEnd}
                        onContextMenu={(e) => handleDragHandleContextMenu(e, taskId, tableType)}
                      >
                        <svg className="w-4 h-4 text-white/30" viewBox="0 0 16 4" fill="currentColor">
                          <circle cx="2" cy="2" r="1.5"/>
                          <circle cx="8" cy="2" r="1.5"/>
                          <circle cx="14" cy="2" r="1.5"/>
                        </svg>
                      </div>
                    )}
                    {isAddRow && (
                      <div className={`transition-opacity duration-150 ${
                        hoveredRowId === `add-${tableType}` ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <svg className="w-4 h-4 text-white/20" viewBox="0 0 16 4" fill="currentColor">
                          <circle cx="2" cy="2" r="1.5"/>
                          <circle cx="8" cy="2" r="1.5"/>
                          <circle cx="14" cy="2" r="1.5"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Table */}
          <div className="flex-1 bg-[rgb(32,32,32)] rounded-lg overflow-hidden border border-[rgb(47,47,47)]">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead ref={theadRef}>
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
                  ref={tbodyRef}
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
                      data-row-id={task.id}
                      data-dragging={draggedRow === task.id.toString() ? 'true' : undefined}
                      className={`
                        border-b border-white/[0.055] border-t-2 hover:bg-white/[0.02] 
                        transition-all duration-200 relative
                        ${draggedRow === task.id.toString() ? 'opacity-40' : ''}
                        ${dragOverRow === task.id.toString() ? 'bg-blue-500/10' : ''}
                      `}
                      style={{
                        borderTopColor: dragOverRow === task.id.toString() ? 'rgb(35,131,226)' : 'transparent',
                        transform: dragOverRow === task.id.toString() ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: dragOverRow === task.id.toString() ? '0 0 20px rgba(35,131,226,0.3)' : 'none'
                      }}
                      onDragOver={handleRowDragOver}
                      onDragLeave={handleRowDragLeave}
                      onDragEnter={() => handleRowDragEnter(null, task.id)}
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
                        <td 
                          key={column} 
                          className="px-4 py-3"
                          style={{ 
                            width: columnWidths[column],
                            minWidth: columnWidths[column]
                          }}
                        >
                          {renderCell(task, column, tableType)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Ligne d'ajout */}
                  <tr 
                    data-row-id="add-row"
                    className="border-b border-white/[0.055] border-t-2 border-t-transparent hover:bg-white/[0.02] transition-colors"
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
                  
                  {/* Zone de drop finale */}
                  {draggedRow && (
                    <tr 
                      className="h-2 border-t-2 border-t-transparent"
                      style={{
                        borderTopColor: dragOverRow === `end-${tableType}` ? 'rgb(35,131,226)' : 'transparent',
                        backgroundColor: dragOverRow === `end-${tableType}` ? 'rgba(35,131,226,0.1)' : 'transparent'
                      }}
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
                        {task.tag.type === 'radar' ? 
                          `${task.tag.radar} > ${task.tag.subject}` :
                          task.tag.text
                        }
                      </div>
                    </div>
                  ) : (
                    <span className="text-white/81 text-sm">{task.name}</span>
                  )}
                </div>
                {task.autoMoveEnabled && tableType === 'weekly' && (
                  <span className="px-1.5 py-0.5 bg-[rgb(35,131,226)]/10 text-[rgb(35,131,226)] text-[11px] rounded">
                    Auto
                  </span>
                )}
              </>
            )}
          </div>
        );
        
      case 'status':
        const status = customStatuses.find(s => s.id === task.status) || customStatuses[0];
        return (
          <select
            value={task.status}
            onChange={(e) => handleUpdateTask(task.id, { status: e.target.value }, tableType)}
            className="px-2 py-1 rounded text-sm cursor-pointer transition-all duration-150 focus:outline-none"
            style={{
              border: `1px solid ${status?.color}33`,
              backgroundColor: status?.color + '1A',
              color: status?.color || '#ffffff'
            }}
          >
            {customStatuses.map(s => (
              <option 
                key={s.id} 
                value={s.id}
                style={{
                  backgroundColor: '#252525',
                  color: s.color || '#ffffff'
                }}
              >
                {s.name}
              </option>
            ))}
          </select>
        );
        
      case 'priority':
        const priority = customPriorities.find(p => p.id === task.priority) || customPriorities[1];
        return (
          <select
            value={task.priority}
            onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value }, tableType)}
            className="px-2 py-1 rounded text-sm cursor-pointer transition-all duration-150 focus:outline-none"
            style={{
              border: `1px solid ${priority?.color}33`,
              backgroundColor: priority?.color + '1A',
              color: priority?.color || '#ffffff'
            }}
          >
            {customPriorities.map(p => (
              <option 
                key={p.id} 
                value={p.id}
                style={{
                  backgroundColor: '#252525',
                  color: p.color || '#ffffff'
                }}
              >
                {p.name}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={task.date || ''}
            onChange={(e) => handleUpdateTask(task.id, { date: e.target.value }, tableType)}
            className="bg-transparent border-none text-white/81 text-sm cursor-pointer"
          />
        );
        
      case 'endDate':
        return (
          <input
            type="date"
            value={task.endDate || ''}
            onChange={(e) => handleUpdateTask(task.id, { endDate: e.target.value }, tableType)}
            className="bg-transparent border-none text-white/81 text-sm cursor-pointer"
          />
        );
        
      case 'time':
        return (
          <input
            type="time"
            value={task.time || ''}
            onChange={(e) => handleUpdateTask(task.id, { time: e.target.value }, tableType)}
            className="bg-transparent border-none text-white/81 text-sm cursor-pointer"
          />
        );
        
      case 'assignee':
        return (
          <input
            type="text"
            value={task.assignee || ''}
            onChange={(e) => handleUpdateTask(task.id, { assignee: e.target.value }, tableType)}
            placeholder="-"
            className="bg-transparent border-none text-white/81 text-sm w-full focus:outline-none focus:bg-white/[0.055] px-1 py-0.5 rounded"
          />
        );
        
      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/[0.055] rounded-full overflow-hidden">
              <div
                className="h-full bg-[rgb(35,131,226)] transition-all duration-300"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
            <span className="text-xs text-white/46 min-w-[35px] text-right">
              {task.progress || 0}%
            </span>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-[rgb(25,25,25)]">
      <div className="max-w-[1400px] mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white/81 mb-2">To do</h1>
            <p className="text-white/46">Gérez vos tâches quotidiennes et hebdomadaires</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCustomOptionsType('status');
                setShowCustomOptionsModal(true);
              }}
              className="px-4 py-2 bg-white/[0.055] text-white/81 rounded-lg hover:bg-white/[0.08] transition-colors text-sm"
            >
              Statuts
            </button>
            <button
              onClick={() => {
                setCustomOptionsType('priority');
                setShowCustomOptionsModal(true);
              }}
              className="px-4 py-2 bg-white/[0.055] text-white/81 rounded-lg hover:bg-white/[0.08] transition-colors text-sm"
            >
              Priorités
            </button>
          </div>
        </div>
        
        {/* Tables avec handles synchronisés */}
        <div className="space-y-8">
          <TableWithHandles title="Tâches quotidiennes" taskList={dailyTasksList} tableType="daily" />
          <TableWithHandles title="Tâches hebdomadaires" taskList={weeklyTasksList} tableType="weekly" />
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-[rgb(37,37,37)] border border-[rgb(47,47,47)] rounded-lg py-1 shadow-xl z-50 min-w-[180px]"
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
          }}
          onClose={() => setShowCustomOptionsModal(false)}
        />
      )}
      
      {showColumnSelector && (
        <ColumnSelectorModal
          availableColumns={availableColumns}
          visibleColumns={visibleColumns}
          onAddColumn={handleAddColumn}
          onClose={() => setShowColumnSelector(false)}
        />
      )}
    </div>
  );
};

export default PlanView;
import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

const PlanView = () => {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask, radars } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('both'); // 'day', 'week', 'both'
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [tableWidth, setTableWidth] = useState('100%');
  const [columnWidths, setColumnWidths] = useState({
    checkbox: 50,
    name: 400,
    status: 120,
    priority: 100,
    date: 120,
    dragHandle: 40
  });
  const [visibleColumns, setVisibleColumns] = useState(['checkbox', 'name', 'status', 'priority', 'date', 'dragHandle']);
  const [availableColumns] = useState([
    { id: 'checkbox', name: '', canHide: false },
    { id: 'name', name: 'Tâche', canHide: false },
    { id: 'status', name: 'Statut', canHide: true },
    { id: 'priority', name: 'Priorité', canHide: true },
    { id: 'date', name: 'Date', canHide: true },
    { id: 'assignee', name: 'Assigné à', canHide: true },
    { id: 'tags', name: 'Tags', canHide: true },
    { id: 'dragHandle', name: '', canHide: false }
  ]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [draggedRow, setDraggedRow] = useState(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, taskId: null });
  const inputRef = useRef(null);
  const tableRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Colonnes disponibles
  const columnHeaders = {
    checkbox: '',
    name: 'Tâche',
    status: 'Statut',
    priority: 'Priorité',
    date: 'Date',
    assignee: 'Assigné à',
    tags: 'Tags',
    dragHandle: ''
  };

  // Gérer le redimensionnement des colonnes
  const handleColumnResize = (e, column) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[column] || 100;
    
    const handleMouseMove = (e) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [column]: newWidth }));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  // Gérer le redimensionnement du tableau
  const handleTableResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = tableRef.current?.offsetWidth || 800;
    
    const handleMouseMove = (e) => {
      const diff = e.clientX - startX;
      const newWidth = Math.max(600, Math.min(1200, startWidth + diff));
      setTableWidth(`${newWidth}px`);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
  };

  // Gérer le drag & drop des lignes
  const handleRowDragStart = (e, taskId, index) => {
    setDraggedRow(taskId);
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleRowDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedRow(null);
    setDraggedRowIndex(null);
    setDragOverRow(null);
  };

  const handleRowDragOver = (e, taskId) => {
    e.preventDefault();
    if (taskId !== draggedRow) {
      setDragOverRow(taskId);
    }
  };

  const handleRowDrop = (e, targetTaskId) => {
    e.preventDefault();
    if (draggedRow && draggedRow !== targetTaskId) {
      const draggedTask = tasks.find(t => t.id === draggedRow);
      const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
      
      if (draggedTask && targetIndex !== -1) {
        // Créer une nouvelle liste de tâches avec l'ordre modifié
        const newTasks = tasks.filter(t => t.id !== draggedRow);
        newTasks.splice(targetIndex, 0, draggedTask);
        
        // Mettre à jour l'ordre dans le contexte
        // Note: Vous devrez implémenter reorderTasks dans AppContext
        if (typeof reorderTasks === 'function') {
          reorderTasks(newTasks);
        }
      }
    }
    setDragOverRow(null);
  };

  // Menu contextuel pour les actions
  const handleContextMenu = (e, taskId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const menuHeight = 100; // Estimation de la hauteur du menu
    
    // Calculer la position pour éviter le débordement
    let top = e.clientY;
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight - 10;
    }
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: top,
      taskId
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, taskId: null });
  };

  // Gérer les colonnes visibles
  const toggleColumn = (columnId) => {
    if (visibleColumns.includes(columnId)) {
      setVisibleColumns(prev => prev.filter(c => c !== columnId));
    } else {
      // Ajouter la colonne avant dragHandle
      const newColumns = [...visibleColumns];
      const dragHandleIndex = newColumns.indexOf('dragHandle');
      newColumns.splice(dragHandleIndex, 0, columnId);
      setVisibleColumns(newColumns);
      
      // Définir une largeur par défaut si elle n'existe pas
      if (!columnWidths[columnId]) {
        setColumnWidths(prev => ({ ...prev, [columnId]: 120 }));
      }
    }
  };

  // Filtrer les tâches selon le mode de vue
  const getFilteredTasks = (type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (type === 'day') {
      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (type === 'week') {
      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
    }
    return tasks;
  };

  // Générer les options d'autocomplete
  const generateAutocompleteOptions = (query) => {
    if (!query || query.length < 2) {
      setAutocompleteOptions([]);
      return;
    }

    const options = [];
    const lowerQuery = query.toLowerCase();

    // Rechercher dans les radars
    radars.forEach(radar => {
      if (radar.name.toLowerCase().includes(lowerQuery)) {
        options.push({
          type: 'radar',
          id: radar.id,
          name: radar.name,
          icon: radar.icon,
          path: `/radar/${radar.id}`
        });
      }

      // Rechercher dans les matières
      radar.subjects?.forEach(subject => {
        if (subject.name.toLowerCase().includes(lowerQuery) || 
            radar.name.toLowerCase().includes(lowerQuery)) {
          options.push({
            type: 'subject',
            id: subject.id,
            radarId: radar.id,
            radarName: radar.name,
            name: subject.name,
            icon: '📚',
            path: `/radar/${radar.id}/subject/${subject.id}`
          });
        }
      });
    });

    setAutocompleteOptions(options);
    setSelectedOptionIndex(0);
  };

  // Gérer l'édition inline
  const handleStartEdit = (taskId, field, currentValue) => {
    setEditingTaskId(taskId);
    setEditingField(field);
    setTempValue(currentValue || '');
    if (field === 'name') {
      generateAutocompleteOptions(currentValue || '');
      setShowAutocomplete(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editingField) {
      const task = tasks.find(t => t.id === editingTaskId);
      if (task) {
        if (editingField === 'name') {
          updateTask({ ...task, name: tempValue });
        }
      }
    }
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingField(null);
    setTempValue('');
    setShowAutocomplete(false);
    setAutocompleteOptions([]);
  };

  const handleSelectAutocomplete = (option) => {
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
      updateTask({
        ...task,
        name: option.name,
        tag: {
          type: option.type,
          radarId: option.radarId || option.id,
          radarName: option.radarName || option.name,
          subjectId: option.type === 'subject' ? option.id : null,
          path: option.path
        }
      });
    }
    handleCancelEdit();
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete && e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
      return;
    }

    if (!showAutocomplete) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOptionIndex(prev => 
        prev < autocompleteOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOptionIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (autocompleteOptions[selectedOptionIndex]) {
        handleSelectAutocomplete(autocompleteOptions[selectedOptionIndex]);
      } else {
        handleSaveEdit();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      name: '',
      status: 'todo',
      priority: 'medium',
      date: new Date().toISOString(),
      completed: false
    };
    addTask(newTask);
    handleStartEdit(newTask.id, 'name', '');
  };

  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        completed: !task.completed,
        status: !task.completed ? 'done' : 'todo'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-500/10 text-gray-400';
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500';
      case 'done': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Effet pour fermer le menu contextuel
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Effet pour sauvegarder quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editingTaskId && !e.target.closest('.editing-input') && !e.target.closest('.autocomplete-dropdown')) {
        handleSaveEdit();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingTaskId, tempValue]);

  // Calculer la position de l'autocomplete pour éviter le débordement
  const calculateAutocompletePosition = () => {
    if (!inputRef.current) return { top: 0, left: 0 };
    
    const rect = inputRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 300;
    const dropdownHeight = 240; // max-h-60 = 15rem = 240px
    
    let left = rect.left;
    let top = rect.bottom + 5;
    
    // Ajuster si déborde à droite
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 10;
    }
    
    // Ajuster si déborde en bas
    if (top + dropdownHeight > viewportHeight) {
      top = rect.top - dropdownHeight - 5;
    }
    
    return { top, left };
  };

  // Rendu des cellules selon le type
  const renderCell = (task, column, index) => {
    switch (column) {
      case 'checkbox':
        return (
          <td key={column} className="px-4 py-3" style={{ width: columnWidths[column] }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleTask(task.id)}
              className="w-4 h-4 rounded border-2 border-white/20 checked:bg-[rgb(35,131,226)] checked:border-[rgb(35,131,226)] cursor-pointer"
            />
          </td>
        );

      case 'name':
        return (
          <td key={column} className="px-4 py-3 relative group" style={{ width: columnWidths[column] }}>
            {editingTaskId === task.id && editingField === 'name' ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={tempValue}
                  onChange={(e) => {
                    setTempValue(e.target.value);
                    generateAutocompleteOptions(e.target.value);
                    setShowAutocomplete(true);
                  }}
                  onKeyDown={handleKeyDown}
                  className="editing-input w-full px-2 py-1 bg-white/[0.055] border border-white/20 rounded text-white/81 focus:outline-none focus:border-[rgb(35,131,226)]"
                  autoFocus
                />
                
                {/* Autocomplete dropdown */}
                {showAutocomplete && autocompleteOptions.length > 0 && (
                  <div 
                    ref={autocompleteRef}
                    className="autocomplete-dropdown fixed bg-[rgb(37,37,37)] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[300px] z-[9999]"
                    style={calculateAutocompletePosition()}
                  >
                    {autocompleteOptions.map((option, index) => (
                      <button
                        key={`${option.type}-${option.id}`}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                          index === selectedOptionIndex
                            ? 'bg-white/10 text-white/81'
                            : 'text-white/46 hover:bg-white/[0.055] hover:text-white/81'
                        }`}
                        onMouseDown={() => handleSelectAutocomplete(option)}
                        onMouseEnter={() => setSelectedOptionIndex(index)}
                      >
                        <span>{option.icon}</span>
                        <div className="flex-1">
                          <div className="text-white/81">{option.name}</div>
                          {option.type === 'subject' && (
                            <div className="text-xs text-white/40">{option.radarName}</div>
                          )}
                        </div>
                        <span className="text-xs text-white/30">
                          {option.type === 'radar' ? 'Radar' : 'Matière'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <div
                  onClick={() => task.tag?.path && navigate(task.tag.path)}
                  className={`cursor-pointer ${task.completed ? 'line-through opacity-50' : ''} ${
                    task.tag ? 'hover:text-[rgb(35,131,226)]' : ''
                  }`}
                >
                  {task.name || (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(task.id, 'name', '');
                      }}
                      className="text-white/30 cursor-text"
                    >
                      Cliquez pour ajouter une tâche...
                    </span>
                  )}
                </div>
                {task.tag && (
                  <div className="text-xs text-white/40 mt-0.5">
                    {task.tag.radarName}
                  </div>
                )}
              </div>
            )}
          </td>
        );

      case 'status':
        return (
          <td key={column} className="px-4 py-3" style={{ width: columnWidths[column] }}>
            <select
              value={task.status}
              onChange={(e) => updateTask({ ...task, status: e.target.value })}
              className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-all ${getStatusColor(task.status)}`}
            >
              <option value="todo">À faire</option>
              <option value="in-progress">En cours</option>
              <option value="done">Terminé</option>
            </select>
          </td>
        );

      case 'priority':
        return (
          <td key={column} className="px-4 py-3" style={{ width: columnWidths[column] }}>
            <select
              value={task.priority}
              onChange={(e) => updateTask({ ...task, priority: e.target.value })}
              className={`text-xs cursor-pointer bg-transparent ${getPriorityColor(task.priority)}`}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </td>
        );

      case 'date':
        return (
          <td key={column} className="px-4 py-3" style={{ width: columnWidths[column] }}>
            <input
              type="date"
              value={task.date ? new Date(task.date).toISOString().split('T')[0] : ''}
              onChange={(e) => updateTask({ ...task, date: e.target.value })}
              className="text-xs text-white/60 bg-transparent cursor-pointer hover:bg-white/[0.055] px-2 py-1 rounded"
            />
          </td>
        );

      case 'dragHandle':
        return (
          <td key={column} className="px-2 py-3 cursor-grab" style={{ width: columnWidths[column] }}>
            <div
              draggable
              onDragStart={(e) => handleRowDragStart(e, task.id, index)}
              onDragEnd={handleRowDragEnd}
              onClick={(e) => handleContextMenu(e, task.id)}
              className="flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
              </svg>
            </div>
          </td>
        );

      default:
        return <td key={column}></td>;
    }
  };

  // Rendu du tableau
  const renderTaskTable = (title, taskList, isActive) => (
    <div 
      className={`bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden transition-opacity duration-150 ${
        !isActive ? 'opacity-50' : ''
      }`}
      style={{ width: tableWidth }}
    >
      <div className="px-4 py-3 border-b border-[rgb(47,47,47)] flex items-center justify-between">
        <h3 className="font-medium text-white/81">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/46">{taskList.length} tâches</span>
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-1 hover:bg-white/[0.055] rounded transition-colors"
              title="Gérer les colonnes"
            >
              <svg className="w-4 h-4 text-white/46" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2.75a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 2.75" />
              </svg>
            </button>
            
            {showColumnMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[rgb(37,37,37)] border border-white/10 rounded-lg shadow-xl p-2 min-w-[180px] z-50">
                {availableColumns.filter(col => col.canHide).map(col => (
                  <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/[0.055] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.id)}
                      onChange={() => toggleColumn(col.id)}
                      className="w-4 h-4 rounded border-2 border-white/20"
                    />
                    <span className="text-sm text-white/81">{col.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
              {visibleColumns.map((column, index) => (
                <th 
                  key={column} 
                  className="px-4 py-3 text-left text-[13px] font-medium text-white/46 relative group"
                  style={{ width: columnWidths[column] }}
                >
                  {columnHeaders[column]}
                  {index < visibleColumns.length - 1 && column !== 'dragHandle' && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResize(e, column)}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taskList.map((task, index) => (
              <tr 
                key={task.id}
                className={`border-b border-white/[0.055] hover:bg-white/[0.02] transition-colors ${
                  dragOverRow === task.id ? 'bg-white/[0.055]' : ''
                } ${draggedRow === task.id ? 'opacity-50' : ''}`}
                onDragOver={(e) => handleRowDragOver(e, task.id)}
                onDrop={(e) => handleRowDrop(e, task.id)}
              >
                {visibleColumns.map(column => renderCell(task, column, index))}
              </tr>
            ))}
            
            {/* Add new task row */}
            <tr 
              className="hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={handleAddTask}
            >
              <td colSpan={visibleColumns.length} className="px-4 py-3">
                <div className="flex items-center gap-2 text-white/46 hover:text-white/81 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2.75a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 2.75" />
                  </svg>
                  <span>Ajouter une tâche</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Resize handle pour la largeur */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20"
        onMouseDown={handleTableResize}
      />
    </div>
  );

  const dailyTasks = getFilteredTasks('day');
  const weeklyTasks = getFilteredTasks('week');

  return (
    <div className="h-full bg-[rgb(25,25,25)]">
      {/* Header */}
      <header className="border-b border-[rgb(47,47,47)]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white/81">Plan</h1>
            
            {/* View Mode Selector */}
            <div className="flex items-center gap-2 bg-white/[0.055] rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  viewMode === 'day'
                    ? 'bg-white/10 text-white/81'
                    : 'text-white/46 hover:text-white/81'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  viewMode === 'week'
                    ? 'bg-white/10 text-white/81'
                    : 'text-white/46 hover:text-white/81'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  viewMode === 'both'
                    ? 'bg-white/10 text-white/81'
                    : 'text-white/46 hover:text-white/81'
                }`}
              >
                Les deux
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tasks Tables */}
      <div className="p-6 space-y-6 relative" ref={tableRef}>
        {(viewMode === 'day' || viewMode === 'both') && 
          renderTaskTable("Tâches du jour", dailyTasks, viewMode === 'day' || viewMode === 'both')}
        
        {(viewMode === 'week' || viewMode === 'both') && 
          renderTaskTable("Tâches de la semaine", weeklyTasks, viewMode === 'week' || viewMode === 'both')}
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-[rgb(37,37,37)]/95 backdrop-blur-xl border border-white/10 rounded-lg p-1 shadow-2xl z-[10000]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              deleteTask(contextMenu.taskId);
              closeContextMenu();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/81 rounded-md transition-all duration-150 hover:bg-white/[0.08]"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
              <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
            </svg>
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanView;
import React, { useState, useRef, useEffect } from 'react';

const PlanViewMinimalDark = () => {
  // États pour les tâches
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, name: 'Révision du code', date: '2024-01-12', time: '09:00', assignee: 'Alice', progress: 75, priority: 'high', status: 'En cours' },
    { id: 2, name: 'Réunion client', date: '2024-01-12', time: '14:00', assignee: 'Bob', progress: 50, priority: 'medium', status: 'En cours' },
    { id: 3, name: 'Tests unitaires', date: '2024-01-12', time: '16:00', assignee: 'Charlie', progress: 25, priority: 'low', status: 'À faire' }
  ]);
  
  const [weeklyTasks, setWeeklyTasks] = useState([
    { id: 101, name: 'Sprint planning', startDate: '2024-01-08', endDate: '2024-01-12', assignee: 'Alice', progress: 90, priority: 'high', status: 'Terminé' },
    { id: 102, name: 'Refactoring API', startDate: '2024-01-10', endDate: '2024-01-17', assignee: 'David', progress: 30, priority: 'medium', status: 'En cours' },
    { id: 103, name: 'Documentation', startDate: '2024-01-15', endDate: '2024-01-19', assignee: 'Eve', progress: 10, priority: 'low', status: 'À faire' }
  ]);
  
  // État du menu contextuel
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    taskId: null,
    tableType: null
  });
  
  // État du modal d'édition
  const [editModal, setEditModal] = useState({
    show: false,
    task: null,
    tableType: null
  });
  
  // État temporaire pour le formulaire d'édition
  const [editForm, setEditForm] = useState({});
  
  // Gestion du menu contextuel
  const handleContextMenu = (e, task, tableType) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      taskId: task.id,
      tableType: tableType
    });
  };
  
  // Fermer le menu au clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu({ ...contextMenu, show: false });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);
  
  // Ouvrir le modal d'édition
  const handleEdit = () => {
    const tasks = contextMenu.tableType === 'daily' ? dailyTasks : weeklyTasks;
    const task = tasks.find(t => t.id === contextMenu.taskId);
    
    setEditForm({ ...task });
    setEditModal({
      show: true,
      task: task,
      tableType: contextMenu.tableType
    });
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Supprimer une tâche
  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      if (contextMenu.tableType === 'daily') {
        setDailyTasks(prev => prev.filter(t => t.id !== contextMenu.taskId));
      } else {
        setWeeklyTasks(prev => prev.filter(t => t.id !== contextMenu.taskId));
      }
    }
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Déplacer vers l'autre tableau
  const handleMoveToOtherTable = () => {
    const sourceTable = contextMenu.tableType === 'daily' ? dailyTasks : weeklyTasks;
    const setSourceTable = contextMenu.tableType === 'daily' ? setDailyTasks : setWeeklyTasks;
    const setTargetTable = contextMenu.tableType === 'daily' ? setWeeklyTasks : setDailyTasks;
    
    const task = sourceTable.find(t => t.id === contextMenu.taskId);
    
    if (task) {
      // Adapter les champs selon le tableau cible
      const adaptedTask = { ...task };
      if (contextMenu.tableType === 'daily') {
        // Daily -> Weekly
        delete adaptedTask.date;
        delete adaptedTask.time;
        adaptedTask.startDate = task.date;
        adaptedTask.endDate = task.date;
      } else {
        // Weekly -> Daily
        delete adaptedTask.startDate;
        delete adaptedTask.endDate;
        adaptedTask.date = task.startDate;
        adaptedTask.time = '09:00';
      }
      
      setSourceTable(prev => prev.filter(t => t.id !== contextMenu.taskId));
      setTargetTable(prev => [...prev, adaptedTask]);
    }
    
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Sauvegarder les modifications
  const handleSaveEdit = () => {
    const setTasks = editModal.tableType === 'daily' ? setDailyTasks : setWeeklyTasks;
    
    setTasks(prev => prev.map(task => 
      task.id === editForm.id ? editForm : task
    ));
    
    setEditModal({ show: false, task: null, tableType: null });
    setEditForm({});
  };
  
  // Ctrl+Enter pour ajouter une nouvelle tâche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        
        // Déterminer quel tableau est actif (simple logique : on ajoute au daily par défaut)
        const newTask = {
          id: Date.now(),
          name: 'Nouvelle tâche',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          assignee: '',
          progress: 0,
          priority: 'medium'
        };
        
        setDailyTasks(prev => [...prev, newTask]);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Composant Table réutilisable avec drag & drop
  const DraggableTable = ({ title, tasks, setTasks, tableType, columns }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDropping, setIsDropping] = useState(false);
    const [focusedRowIndex, setFocusedRowIndex] = useState(null);
    const [isMovingMode, setIsMovingMode] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    
    const draggedIndexRef = useRef(null);
    const hoverIndexRef = useRef(null);
    const floatingElementRef = useRef(null);
    
    // Cleanup du drag
    useEffect(() => {
      if (!isDragging) return;
      
      const handleGlobalMouseUp = () => {
        endDrag();
      };
      
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging, tasks]);
    
    // Navigation clavier locale au tableau
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (focusedRowIndex === null) return;
        
        if (e.key === 'Escape') {
          setFocusedRowIndex(null);
          setIsMovingMode(false);
          return;
        }
        
        if (e.key === 'Tab' && !isMovingMode) {
          e.preventDefault();
          const nextIndex = (focusedRowIndex + 1) % tasks.length;
          setFocusedRowIndex(nextIndex);
          return;
        }
        
        if (e.key === 'Enter' && !e.ctrlKey) {
          e.preventDefault();
          setIsMovingMode(!isMovingMode);
          return;
        }
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const direction = e.key === 'ArrowUp' ? -1 : 1;
          
          if (isMovingMode) {
            const newIndex = focusedRowIndex + direction;
            if (newIndex >= 0 && newIndex < tasks.length) {
              const newTasks = [...tasks];
              const [movedTask] = newTasks.splice(focusedRowIndex, 1);
              newTasks.splice(newIndex, 0, movedTask);
              setTasks(newTasks);
              setFocusedRowIndex(newIndex);
            }
          } else {
            const newIndex = focusedRowIndex + direction;
            if (newIndex >= 0 && newIndex < tasks.length) {
              setFocusedRowIndex(newIndex);
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [focusedRowIndex, isMovingMode, tasks, setTasks]);
    
    const getRowTransform = (index) => {
      if (isDropping && index === draggedIndex) {
        const targetPosition = hoverIndexRef.current;
        if (targetPosition !== null && targetPosition !== draggedIndex) {
          const offset = (targetPosition - draggedIndex) * 56;
          return `translateY(${offset}px)`;
        }
        return '';
      }
      
      if (!isDragging || draggedIndex === null || hoverIndex === null) {
        return '';
      }
      
      if (index === draggedIndex) {
        return '';
      }
      
      if (hoverIndex === draggedIndex || hoverIndex === draggedIndex + 1) {
        return '';
      }
      
      if (draggedIndex < hoverIndex) {
        if (index > draggedIndex && index < hoverIndex) {
          return 'translateY(-56px)';
        }
      } else {
        if (index < draggedIndex && index >= hoverIndex) {
          return 'translateY(56px)';
        }
      }
      
      return '';
    };
    
    const startDrag = (e, index) => {
      if (isMovingMode) return;
      e.preventDefault();
      
      setDraggedIndex(index);
      setHoverIndex(index);
      setIsDragging(true);
      
      draggedIndexRef.current = index;
      hoverIndexRef.current = index;
      
      const row = e.currentTarget;
      const rect = row.getBoundingClientRect();
      
      const floatingElement = document.createElement('div');
      floatingElement.style.cssText = `
        position: fixed;
        z-index: 999999;
        pointer-events: none;
        width: ${rect.width}px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.4),
          inset 0 2px 8px rgba(255, 255, 255, 0.1);
        opacity: 0.95;
        left: ${e.clientX + 10}px;
        top: ${e.clientY - 20}px;
      `;
      
      floatingElement.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="color: rgba(255, 255, 255, 0.95);">
            ${row.innerHTML}
          </tr>
        </table>
      `;
      
      document.body.appendChild(floatingElement);
      floatingElementRef.current = floatingElement;
      
      const handleMouseMove = (e) => {
        if (floatingElementRef.current) {
          floatingElementRef.current.style.left = `${e.clientX + 10}px`;
          floatingElementRef.current.style.top = `${e.clientY - 20}px`;
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      floatingElementRef.current._mouseMoveHandler = handleMouseMove;
    };
    
    const handleMouseEnter = (e, index) => {
      if (isDragging && draggedIndexRef.current !== null) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const middle = rect.height / 2;
        
        let targetIndex = index;
        if (y > middle) {
          targetIndex = index + 1;
        }
        
        if (targetIndex > tasks.length) {
          targetIndex = tasks.length;
        }
        
        setHoverIndex(targetIndex);
        hoverIndexRef.current = targetIndex;
      }
    };
    
    const endDrag = () => {
      if (floatingElementRef.current) {
        if (floatingElementRef.current._mouseMoveHandler) {
          document.removeEventListener('mousemove', floatingElementRef.current._mouseMoveHandler);
        }
        floatingElementRef.current.remove();
        floatingElementRef.current = null;
      }
      
      const finalDraggedIndex = draggedIndexRef.current;
      const finalHoverIndex = hoverIndexRef.current;
      
      if (finalDraggedIndex !== null && finalHoverIndex !== null && finalDraggedIndex !== finalHoverIndex) {
        setIsDropping(true);
        
        setTimeout(() => {
          const newTasks = [...tasks];
          const [draggedItem] = newTasks.splice(finalDraggedIndex, 1);
          
          let insertIndex = finalHoverIndex;
          if (finalDraggedIndex < finalHoverIndex) {
            insertIndex = finalHoverIndex - 1;
          }
          
          newTasks.splice(insertIndex, 0, draggedItem);
          setTasks(newTasks);
          
          setDraggedIndex(null);
          setHoverIndex(null);
          setIsDragging(false);
          setIsDropping(false);
          draggedIndexRef.current = null;
          hoverIndexRef.current = null;
        }, 300);
      } else {
        setDraggedIndex(null);
        setHoverIndex(null);
        setIsDragging(false);
        draggedIndexRef.current = null;
        hoverIndexRef.current = null;
      }
    };
    
    const shouldShowPlaceholder = isDragging && 
                                  hoverIndex !== null && 
                                  draggedIndex !== null &&
                                  hoverIndex !== draggedIndex && 
                                  hoverIndex !== draggedIndex + 1;
    
    const getPlaceholderPosition = () => {
      if (!shouldShowPlaceholder) return null;
      
      let position;
      if (draggedIndex < hoverIndex) {
        position = (hoverIndex - 1) * 56;
      } else {
        position = hoverIndex * 56;
      }
      
      return position + 53;
    };
    
    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'high': return 'linear-gradient(135deg, #ff6b6b, #ff8787)';
        case 'medium': return 'linear-gradient(135deg, #ffd93d, #ffed4e)';
        case 'low': return 'linear-gradient(135deg, #6bcf7f, #8be59e)';
        default: return 'linear-gradient(135deg, #6c757d, #909aa3)';
      }
    };
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'Terminé': return { bg: 'linear-gradient(135deg, #6bcf7f, #8be59e)', color: '#ffffff' };
        case 'En cours': return { bg: 'linear-gradient(135deg, #4a9ff5, #6fb3f7)', color: '#ffffff' };
        case 'À faire': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)' };
        case 'Bloqué': return { bg: 'linear-gradient(135deg, #ff6b6b, #ff8787)', color: '#ffffff' };
        default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)' };
      }
    };
    
    const renderCell = (task, column) => {
      const cellStyle = {
        padding: '14px 20px',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px'
      };
      
      switch (column) {
        case 'name':
          return (
            <td style={{ ...cellStyle, fontWeight: '500' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '4px',
                  height: '28px',
                  background: getPriorityColor(task.priority),
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }} />
                {task.name}
              </div>
            </td>
          );
          
        case 'status':
          const statusStyle = getStatusColor(task.status);
          return (
            <td style={cellStyle}>
              <span style={{ 
                background: statusStyle.bg,
                color: statusStyle.color,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2)'
              }}>
                {task.status}
              </span>
            </td>
          );
          
        case 'date':
          return (
            <td style={cellStyle}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '13px'
              }}>
                {task.date}
              </span>
            </td>
          );
          
        case 'time':
          return (
            <td style={cellStyle}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '13px'
              }}>
                {task.time}
              </span>
            </td>
          );
          
        case 'startDate':
          return (
            <td style={cellStyle}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '13px'
              }}>
                {task.startDate}
              </span>
            </td>
          );
          
        case 'endDate':
          return (
            <td style={cellStyle}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '13px'
              }}>
                {task.endDate}
              </span>
            </td>
          );
          
        case 'assignee':
          return (
            <td style={cellStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: task.assignee ? 
                    'linear-gradient(135deg, #667eea, #764ba2)' : 
                    'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: task.assignee ? 
                    '0 8px 16px rgba(102, 126, 234, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' : 
                    'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  {task.assignee ? task.assignee[0].toUpperCase() : '?'}
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px' }}>
                  {task.assignee || 'Non assigné'}
                </span>
              </div>
            </td>
          );
          
        case 'progress':
          const progressGradient = task.progress >= 75 ? 
            'linear-gradient(90deg, #6bcf7f, #8be59e)' : 
            task.progress >= 50 ? 
            'linear-gradient(90deg, #4a9ff5, #6fb3f7)' : 
            task.progress >= 25 ? 
            'linear-gradient(90deg, #ffd93d, #ffed4e)' : 
            'linear-gradient(90deg, #ff6b6b, #ff8787)';
          
          return (
            <td style={{ ...cellStyle, width: '160px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    background: progressGradient,
                    transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(255, 255, 255, 0.2)'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '600',
                  minWidth: '40px',
                  textAlign: 'right'
                }}>
                  {task.progress}%
                </span>
              </div>
            </td>
          );
          
        default:
          return null;
      }
    };
    
    const handleAddNewTask = (e) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        if (newTaskName.trim()) {
          const newTask = tableType === 'daily' ? {
            id: Date.now(),
            name: newTaskName.trim(),
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            assignee: '',
            progress: 0,
            priority: 'medium',
            status: 'À faire'
          } : {
            id: Date.now(),
            name: newTaskName.trim(),
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            assignee: '',
            progress: 0,
            priority: 'medium',
            status: 'À faire'
          };
          setTasks([...tasks, newTask]);
          setNewTaskName('');
        }
      }
    };
    
    return (
      <div style={{ marginBottom: '48px' }}>
        {focusedRowIndex !== null && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 18px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            {isMovingMode ? 
              'Mode déplacement • ↑↓ pour déplacer • Entrée pour désactiver' :
              'Navigation • TAB ou ↑↓ pour naviguer • Entrée pour déplacer'
            }
          </div>
        )}
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 2px 8px rgba(255, 255, 255, 0.05)
          `
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {columns.map(col => (
                  <th key={col.key} style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const isDraggedRow = index === draggedIndex && isDragging;
                const isFocused = index === focusedRowIndex;
                const isBeingMoved = isMovingMode && index === focusedRowIndex;
                
                return (
                  <tr
                    key={task.id}
                    onClick={() => setFocusedRowIndex(index)}
                    onContextMenu={(e) => handleContextMenu(e, task, tableType)}
                    onMouseDown={(e) => !isMovingMode && startDrag(e, index)}
                    onMouseEnter={(e) => handleMouseEnter(e, index)}
                    style={{
                      cursor: isMovingMode ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                      height: '56px',
                      transform: getRowTransform(index),
                      transition: isDropping && index === draggedIndex 
                        ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                        : isDragging 
                          ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                          : 'background 200ms ease',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: isFocused ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                      userSelect: 'none',
                      opacity: isDraggedRow && !isDropping ? 0 : 1,
                      outline: isBeingMoved ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
                      outlineOffset: '-2px',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (!isDragging && !isMovingMode && !isFocused) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDragging && !isMovingMode && !isFocused) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {columns.map(col => renderCell(task, col.key))}
                  </tr>
                );
              })}
              
              {/* Ligne pour ajouter une nouvelle tâche */}
              <tr style={{
                height: '56px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'transparent'
              }}>
                <td style={{
                  padding: '14px 20px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '4px',
                      height: '28px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px'
                    }} />
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyPress={handleAddNewTask}
                      onBlur={handleAddNewTask}
                      placeholder="Ajouter une nouvelle tâche..."
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        width: '100%',
                        padding: '4px 0'
                      }}
                    />
                  </div>
                </td>
                {columns.slice(1).map(col => (
                  <td key={col.key} style={{
                    padding: '14px 20px',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '13px'
                  }}>
                    -
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          
          {shouldShowPlaceholder && (
            <div style={{
              position: 'absolute',
              top: `${getPlaceholderPosition()}px`,
              left: '16px',
              right: '16px',
              height: '52px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '12px',
              fontWeight: '600',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)'
            }}>
              Déposer ici
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #1a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de lumière douce */}
      <div style={{
        position: 'fixed',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ 
        position: 'relative',
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '48px 32px'
      }}>
        
        <DraggableTable
          title="Tâches quotidiennes"
          tasks={dailyTasks}
          setTasks={setDailyTasks}
          tableType="daily"
          columns={[
            { key: 'name', label: 'Tâche' },
            { key: 'status', label: 'Statut' },
            { key: 'date', label: 'Date' },
            { key: 'time', label: 'Heure' },
            { key: 'assignee', label: 'Responsable' },
            { key: 'progress', label: 'Progression' }
          ]}
        />
        
        <DraggableTable
          title="Tâches hebdomadaires"
          tasks={weeklyTasks}
          setTasks={setWeeklyTasks}
          tableType="weekly"
          columns={[
            { key: 'name', label: 'Projet' },
            { key: 'status', label: 'Statut' },
            { key: 'startDate', label: 'Début' },
            { key: 'endDate', label: 'Fin' },
            { key: 'assignee', label: 'Responsable' },
            { key: 'progress', label: 'Avancement' }
          ]}
        />
      </div>
      
      {/* Menu contextuel glassmorphism */}
      {contextMenu.show && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: `
              0 16px 32px rgba(0, 0, 0, 0.4),
              inset 0 2px 8px rgba(255, 255, 255, 0.1)
            `,
            zIndex: 1000
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Éditer
          </button>
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <button
            onClick={handleDelete}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255, 107, 107, 0.1)';
              e.target.style.color = '#ff6b6b';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            Supprimer
          </button>
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <button
            onClick={handleMoveToOtherTable}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Déplacer vers {contextMenu.tableType === 'daily' ? 'Hebdomadaire' : 'Quotidien'}
          </button>
        </div>
      )}
      
      {/* Modal d'édition glassmorphism */}
      {editModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setEditModal({ show: false, task: null, tableType: null })}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '32px',
              width: '520px',
              maxWidth: '90%',
              boxShadow: `
                0 24px 48px rgba(0, 0, 0, 0.5),
                inset 0 2px 8px rgba(255, 255, 255, 0.1)
              `
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '28px'
            }}>
              Éditer la tâche
            </h3>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Nom de la tâche
              </label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 200ms ease',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            
            {editModal.tableType === 'daily' ? (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Heure
                    </label>
                    <input
                      type="time"
                      value={editForm.time || ''}
                      onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Date début
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate || ''}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate || ''}
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Statut
                </label>
                <select
                  value={editForm.status || 'À faire'}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <option value="À faire" style={{ background: '#141414' }}>À faire</option>
                  <option value="En cours" style={{ background: '#141414' }}>En cours</option>
                  <option value="Terminé" style={{ background: '#141414' }}>Terminé</option>
                  <option value="Bloqué" style={{ background: '#141414' }}>Bloqué</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Priorité
                </label>
                <select
                  value={editForm.priority || 'medium'}
                  onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <option value="high" style={{ background: '#141414' }}>Haute</option>
                  <option value="medium" style={{ background: '#141414' }}>Moyenne</option>
                  <option value="low" style={{ background: '#141414' }}>Basse</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Responsable
              </label>
              <input
                type="text"
                value={editForm.assignee || ''}
                onChange={e => setEditForm({ ...editForm, assignee: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 200ms ease',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Progression: <span style={{ 
                  color: editForm.progress >= 75 ? '#6bcf7f' : 
                         editForm.progress >= 50 ? '#4a9ff5' : 
                         editForm.progress >= 25 ? '#ffd93d' : '#ff6b6b',
                  fontWeight: '600'
                }}>{editForm.progress || 0}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editForm.progress || 0}
                onChange={e => setEditForm({ ...editForm, progress: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: `linear-gradient(to right, 
                    ${editForm.progress >= 75 ? '#6bcf7f' : 
                      editForm.progress >= 50 ? '#4a9ff5' :
                      editForm.progress >= 25 ? '#ffd93d' : '#ff6b6b'} 0%, 
                    ${editForm.progress >= 75 ? '#6bcf7f' : 
                      editForm.progress >= 50 ? '#4a9ff5' :
                      editForm.progress >= 25 ? '#ffd93d' : '#ff6b6b'} ${editForm.progress || 0}%, 
                    rgba(255, 255, 255, 0.05) ${editForm.progress || 0}%, 
                    rgba(255, 255, 255, 0.05) 100%)`,
                  borderRadius: '12px',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditModal({ show: false, task: null, tableType: null })}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)';
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanViewMinimalDark;
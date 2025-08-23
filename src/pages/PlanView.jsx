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
          const offset = (targetPosition - draggedIndex) * 48;
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
          return 'translateY(-48px)';
        }
      } else {
        if (index < draggedIndex && index >= hoverIndex) {
          return 'translateY(48px)';
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
        background: rgba(20, 20, 20, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: 
          0 10px 30px rgba(0, 0, 0, 0.6),
          inset 0 0 20px rgba(255, 255, 255, 0.02);
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
        position = (hoverIndex - 1) * 48;
      } else {
        position = hoverIndex * 48;
      }
      
      return position + 45;
    };
    
    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'high': return '#dc2626';
        case 'medium': return '#f59e0b';
        case 'low': return '#22c55e';
        default: return '#6b7280';
      }
    };
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'Terminé': return '#22c55e';
        case 'En cours': return '#3b82f6';
        case 'À faire': return '#6b7280';
        case 'Bloqué': return '#dc2626';
        default: return '#6b7280';
      }
    };
    
    const renderCell = (task, column) => {
      const cellStyle = {
        padding: '12px 16px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '13px'
      };
      
      switch (column) {
        case 'name':
          return (
            <td style={{ ...cellStyle, fontWeight: '500' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '4px',
                  height: '24px',
                  background: getPriorityColor(task.priority),
                  borderRadius: '2px'
                }} />
                {task.name}
              </div>
            </td>
          );
          
        case 'status':
          return (
            <td style={cellStyle}>
              <span style={{ 
                background: `${getStatusColor(task.status)}15`,
                color: getStatusColor(task.status),
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                border: `1px solid ${getStatusColor(task.status)}30`
              }}>
                {task.status}
              </span>
            </td>
          );
          
        case 'date':
          return (
            <td style={cellStyle}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
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
                color: 'rgba(255, 255, 255, 0.7)',
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
                color: 'rgba(255, 255, 255, 0.7)',
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
                color: 'rgba(255, 255, 255, 0.7)',
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
                gap: '8px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: task.assignee ? '#1e293b' : '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  {task.assignee ? task.assignee[0].toUpperCase() : '?'}
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                  {task.assignee || 'Non assigné'}
                </span>
              </div>
            </td>
          );
          
        case 'progress':
          const progressColor = task.progress >= 75 ? '#22c55e' : 
                               task.progress >= 50 ? '#3b82f6' : 
                               task.progress >= 25 ? '#f59e0b' : '#dc2626';
          return (
            <td style={{ ...cellStyle, width: '140px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{
                    width: `${task.progress}%`,
                    height: '100%',
                    background: progressColor,
                    transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  color: progressColor,
                  fontWeight: '600',
                  minWidth: '35px',
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
    
    return (
      <div style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.01em'
          }}>
            {title}
          </h2>
          <button
            onClick={() => {
              const newTask = tableType === 'daily' ? {
                id: Date.now(),
                name: 'Nouvelle tâche',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                assignee: '',
                progress: 0,
                priority: 'medium',
                status: 'À faire'
              } : {
                id: Date.now(),
                name: 'Nouvelle tâche',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                assignee: '',
                progress: 0,
                priority: 'medium',
                status: 'À faire'
              };
              setTasks([...tasks, newTask]);
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.target.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255, 255, 255, 0.03)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            + Nouvelle tâche
          </button>
        </div>
        
        {focusedRowIndex !== null && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            {isMovingMode ? 
              'Mode déplacement • ↑↓ pour déplacer • Entrée pour désactiver' :
              'Navigation • TAB ou ↑↓ pour naviguer • Entrée pour déplacer'
            }
          </div>
        )}
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: `
            0 4px 24px rgba(0, 0, 0, 0.4),
            inset 0 0 40px rgba(255, 255, 255, 0.01)
          `
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                {columns.map(col => (
                  <th key={col.key} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
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
                      height: '48px',
                      transform: getRowTransform(index),
                      transition: isDropping && index === draggedIndex 
                        ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                        : isDragging 
                          ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                          : 'background 200ms ease',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      background: isFocused ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                      userSelect: 'none',
                      opacity: isDraggedRow && !isDropping ? 0 : 1,
                      outline: isBeingMoved ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                      outlineOffset: '-1px',
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
            </tbody>
          </table>
          
          {shouldShowPlaceholder && (
            <div style={{
              position: 'absolute',
              top: `${getPlaceholderPosition()}px`,
              left: '12px',
              right: '12px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '11px',
              fontWeight: '500',
              pointerEvents: 'none',
              zIndex: 10,
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
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
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Effet de fond très subtil */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.02) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />
      
      <div style={{ 
        position: 'relative',
        maxWidth: '1400px', 
        margin: '0 auto',
        padding: '32px'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '12px',
            letterSpacing: '-0.03em'
          }}>
            Tableau de bord
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            gap: '20px'
          }}>
            <span>Ctrl+Enter pour ajouter</span>
            <span>Clic droit pour le menu</span>
            <span>Glisser pour réorganiser</span>
          </p>
        </div>
        
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
      
      {/* Menu contextuel avec glassmorphisme */}
      {contextMenu.show && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.6),
              inset 0 0 20px rgba(255, 255, 255, 0.02)
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
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Éditer
          </button>
          <button
            onClick={handleDelete}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(220, 38, 38, 0.1)';
              e.target.style.color = '#dc2626';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'rgba(255, 255, 255, 0.9)';
            }}
          >
            Supprimer
          </button>
          <button
            onClick={handleMoveToOtherTable}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '13px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Déplacer vers {contextMenu.tableType === 'daily' ? 'Hebdomadaire' : 'Quotidien'}
          </button>
        </div>
      )}
      
      {/* Modal d'édition avec glassmorphisme et neumorphisme */}
      {editModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
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
              background: 'rgba(20, 20, 20, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              width: '480px',
              maxWidth: '90%',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.8),
                inset 0 0 40px rgba(255, 255, 255, 0.02)
              `
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.95)',
              marginBottom: '24px'
            }}>
              Éditer la tâche
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Nom de la tâche
              </label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 200ms ease'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                }}
              />
            </div>
            
            {editModal.tableType === 'daily' ? (
              <>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
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
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
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
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
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
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
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
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
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
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: 'rgba(255, 255, 255, 0.95)',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Statut
                </label>
                <select
                  value={editForm.status || 'À faire'}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
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
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Priorité
                </label>
                <select
                  value={editForm.priority || 'medium'}
                  onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="high" style={{ background: '#141414' }}>Haute</option>
                  <option value="medium" style={{ background: '#141414' }}>Moyenne</option>
                  <option value="low" style={{ background: '#141414' }}>Basse</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Responsable
              </label>
              <input
                type="text"
                value={editForm.assignee || ''}
                onChange={e => setEditForm({ ...editForm, assignee: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 200ms ease'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.6)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.background = 'rgba(0, 0, 0, 0.4)';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Progression: <span style={{ 
                  color: editForm.progress >= 75 ? '#22c55e' : 
                         editForm.progress >= 50 ? '#3b82f6' : 
                         editForm.progress >= 25 ? '#f59e0b' : '#dc2626',
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
                  height: '6px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  background: `linear-gradient(to right, 
                    ${editForm.progress >= 75 ? '#22c55e' : 
                      editForm.progress >= 50 ? '#3b82f6' :
                      editForm.progress >= 25 ? '#f59e0b' : '#dc2626'} 0%, 
                    ${editForm.progress >= 75 ? '#22c55e' : 
                      editForm.progress >= 50 ? '#3b82f6' :
                      editForm.progress >= 25 ? '#f59e0b' : '#dc2626'} ${editForm.progress || 0}%, 
                    rgba(255, 255, 255, 0.05) ${editForm.progress || 0}%, 
                    rgba(255, 255, 255, 0.05) 100%)`,
                  borderRadius: '10px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditModal({ show: false, task: null, tableType: null })}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '10px 24px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={e => {
                  e.target.style.background = '#2563eb';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = '#3b82f6';
                  e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
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
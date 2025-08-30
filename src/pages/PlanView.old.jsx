// src/pages/PlanView.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import TestComponent from '../components/tasks/TestComponent'; // ← AJOUTEZ CETTE LIGNE

const PlanView = () => {
  // Utiliser le contexte au lieu de l'état local
  const { tasks, addTask, updateTask, deleteTask } = useContext(AppContext);
  
  // Filtrer les tâches par type (daily/weekly)
  // Si pas de type, on les considère comme daily par défaut
  const dailyTasks = tasks.filter(task => !task.type || task.type === 'daily');
  const weeklyTasks = tasks.filter(task => task.type === 'weekly');
  
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
  
  // Enlever l'ajout automatique de tâches d'exemple qui cause les duplications
  
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
    const currentTasks = contextMenu.tableType === 'daily' ? dailyTasks : weeklyTasks;
    const task = currentTasks.find(t => t.id === contextMenu.taskId);
    
    setEditForm({ ...task });
    setEditModal({
      show: true,
      task: task,
      tableType: contextMenu.tableType
    });
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Utiliser deleteTask du contexte
  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      deleteTask(contextMenu.taskId);
    }
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Déplacer vers l'autre tableau
  const handleMoveToOtherTable = () => {
    const sourceTable = contextMenu.tableType === 'daily' ? dailyTasks : weeklyTasks;
    const task = sourceTable.find(t => t.id === contextMenu.taskId);
    
    if (task) {
      const updatedTask = { ...task };
      if (contextMenu.tableType === 'daily') {
        updatedTask.type = 'weekly';
        delete updatedTask.date;
        delete updatedTask.time;
        updatedTask.startDate = task.date;
        updatedTask.endDate = task.date;
      } else {
        updatedTask.type = 'daily';
        delete updatedTask.startDate;
        delete updatedTask.endDate;
        updatedTask.date = task.startDate || new Date().toISOString().split('T')[0];
        updatedTask.time = '09:00';
      }
      
      updateTask(updatedTask);
    }
    
    setContextMenu({ ...contextMenu, show: false });
  };
  
  // Utiliser updateTask du contexte
  const handleSaveEdit = () => {
    updateTask(editForm);
    setEditModal({ show: false, task: null, tableType: null });
    setEditForm({});
  };
  
  // Ctrl+Enter pour ajouter une nouvelle tâche
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        
        const newTask = {
          name: 'Nouvelle tâche',
          type: 'daily',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          assignee: '',
          progress: 0,
          priority: 'medium',
          status: 'À faire'
        };
        
        addTask(newTask);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Composant Table réutilisable avec drag & drop
  const DraggableTable = ({ title, tasks, tableType, columns }) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDropping, setIsDropping] = useState(false);
    const [focusedRowIndex, setFocusedRowIndex] = useState(null);
    const [isMovingMode, setIsMovingMode] = useState(false);
    const [newTask, setNewTask] = useState({
      name: '',
      status: 'À faire',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      assignee: '',
      progress: 0,
      priority: 'medium'
    });
    const [editingCell, setEditingCell] = useState(null);
    
    const draggedIndexRef = useRef(null);
    const hoverIndexRef = useRef(null);
    const floatingElementRef = useRef(null);
    
    const updateTasksOrder = (newOrderedTasks) => {
      newOrderedTasks.forEach((task, index) => {
        updateTask({ ...task, order: index });
      });
    };
    
    // Cleanup du drag
    useEffect(() => {
      if (!isDragging) return;
      
      const handleGlobalMouseUp = () => {
        endDrag();
      };
      
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [isDragging, tasks]);
    
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
    
    const handleAddNewTask = () => {
      if (newTask.name.trim()) {
        const taskToAdd = tableType === 'daily' ? {
          name: newTask.name.trim(),
          type: 'daily',
          date: newTask.date,
          time: newTask.time,
          assignee: newTask.assignee,
          progress: newTask.progress,
          priority: newTask.priority,
          status: newTask.status
        } : {
          name: newTask.name.trim(),
          type: 'weekly',
          startDate: newTask.startDate,
          endDate: newTask.endDate,
          assignee: newTask.assignee,
          progress: newTask.progress,
          priority: newTask.priority,
          status: newTask.status
        };
        
        addTask(taskToAdd);
        setNewTask({ ...newTask, name: '' });
      }
    };
    
    // Fonctions de drag & drop
    const startDrag = (e, index) => {
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
        backdrop-filter: blur(7px);
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
          updateTasksOrder(newTasks);
          
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
    
    const renderCell = (task, column) => {
      const cellStyle = {
        padding: '14px 20px',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px'
      };
      
      const isEditing = editingCell?.taskId === task.id && editingCell?.column === column;
      
      if (isEditing) {
        return (
          <td style={cellStyle}>
            <input
              type={column === 'date' || column === 'startDate' || column === 'endDate' ? 'date' : 
                    column === 'time' ? 'time' : 
                    column === 'progress' ? 'number' : 'text'}
              autoFocus
              value={editingCell.value}
              onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
              onBlur={() => {
                const updatedTask = { ...task, [column]: editingCell.value };
                updateTask(updatedTask);
                setEditingCell(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const updatedTask = { ...task, [column]: editingCell.value };
                  updateTask(updatedTask);
                  setEditingCell(null);
                }
                if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </td>
        );
      }
      
      switch (column) {
        case 'name':
          return (
            <td 
              style={{ ...cellStyle, fontWeight: '500', cursor: 'pointer' }}
              onDoubleClick={() => setEditingCell({ taskId: task.id, column, value: task[column] })}
            >
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
          const statusStyle = getStatusColor(task.status || 'À faire');
          return (
            <td 
              style={{ ...cellStyle, cursor: 'pointer' }}
              onDoubleClick={() => setEditingCell({ taskId: task.id, column, value: task[column] })}
            >
              <span style={{ 
                background: statusStyle.bg,
                color: statusStyle.color,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                {task.status || 'À faire'}
              </span>
            </td>
          );
          
        case 'progress':
          const progress = task.progress || 0;
          const progressGradient = progress >= 75 ? 
            'linear-gradient(90deg, #6bcf7f, #8be59e)' : 
            progress >= 50 ? 
            'linear-gradient(90deg, #4a9ff5, #6fb3f7)' : 
            progress >= 25 ? 
            'linear-gradient(90deg, #ffd93d, #ffed4e)' : 
            'linear-gradient(90deg, #ff6b6b, #ff8787)';
          
          return (
            <td 
              style={{ ...cellStyle, width: '160px', cursor: 'pointer' }}
              onDoubleClick={() => setEditingCell({ taskId: task.id, column, value: progress })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: progressGradient,
                    transition: 'width 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '12px'
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
                  {progress}%
                </span>
              </div>
            </td>
          );
          
        default:
          return (
            <td 
              style={{ ...cellStyle, cursor: 'pointer' }}
              onDoubleClick={() => setEditingCell({ taskId: task.id, column, value: task[column] || '' })}
            >
              {task[column] || '-'}
            </td>
          );
      }
    };
    
    return (
      <div style={{ marginBottom: '48px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>
            {title}
          </h2>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
            💡 Double-cliquez sur une cellule pour l'éditer
          </span>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(7px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative'
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
                
                return (
                  <tr
                    key={task.id}
                    onContextMenu={(e) => handleContextMenu(e, task, tableType)}
                    onMouseDown={(e) => startDrag(e, index)}
                    onMouseEnter={(e) => handleMouseEnter(e, index)}
                    style={{
                      cursor: isDragging ? 'grabbing' : 'grab',
                      height: '56px',
                      transform: getRowTransform(index),
                      transition: isDropping && index === draggedIndex 
                        ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                        : isDragging 
                          ? 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)' 
                          : 'background 200ms ease',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'transparent',
                      userSelect: 'none',
                      opacity: isDraggedRow && !isDropping ? 0 : 1,
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (!isDragging) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDragging) {
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
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <td style={{ padding: '14px 20px' }}>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewTask();
                      }
                    }}
                    placeholder="➕ Ajouter une nouvelle tâche..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </td>
                {columns.slice(1).map(col => (
                  <td key={col.key} style={{ padding: '14px 20px' }}></td>
                ))}
              </tr>
            </tbody>
          </table>
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
        <div style={{
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.95)',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.7))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Planification des Tâches
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: '400',
            letterSpacing: '0.5px'
          }}>
            Organisez et suivez vos tâches quotidiennes et hebdomadaires
          </p>
        </div>
        
        <DraggableTable
          title="Tâches quotidiennes"
          tasks={dailyTasks}
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
      
      {/* Menu contextuel */}
      {contextMenu.show && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(7px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)',
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
              cursor: 'pointer'
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
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Déplacer vers {contextMenu.tableType === 'daily' ? 'hebdomadaire' : 'quotidien'}
          </button>
        </div>
      )}
      
      {/* Modal d'édition */}
      {editModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(7px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '36px',
            width: '560px',
            maxWidth: '90%'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              marginBottom: '28px',
              color: 'rgba(255, 255, 255, 0.95)'
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
                  outline: 'none'
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
                  cursor: 'pointer'
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
                  cursor: 'pointer'
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
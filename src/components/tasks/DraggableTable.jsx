import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import TaskAutocomplete from './TaskAutocomplete';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Composant pour une ligne draggable
const SortableRow = ({ task, columns, onDoubleClick, onContextMenu, onCellClick, getPriorityColor, getStatusColor, editingCell, onEditingCellChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const renderCell = (column) => {
    const value = task[column] || '';
    const isEditing = editingCell?.taskId === task.id && editingCell?.column === column;
    
    // Si on édite cette cellule
    if (isEditing) {
      if (column === 'status') {
        return (
          <td className="px-4 py-3">
            <select
              autoFocus
              value={editingCell.value}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </td>
        );
      } else if (column === 'priority') {
        return (
          <td className="px-4 py-3">
            <select
              autoFocus
              value={editingCell.value}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
            >
              <option value="Pas de panique">Pas de panique</option>
              <option value="Important">Important</option>
              <option value="Très important">Très important</option>
            </select>
          </td>
        );
      } else if (column === 'name') {
        return (
          <td className="px-4 py-3">
            <input
              autoFocus
              type="text"
              value={editingCell.value}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        );
      }
    }
    
    // Rendu normal (non édité)
    switch (column) {
      case 'name':
        return (
          <td 
            className="px-4 py-3"
            {...attributes}
            {...listeners}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-1 h-6 rounded-full"
                style={{ background: getPriorityColor(task.priority) }}
              />
              <span 
                className="text-gray-200 cursor-pointer flex-1"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onEditingCellChange({ taskId: task.id, column, value });
                }}
              >
                {value}
              </span>
            </div>
          </td>
        );
        
      case 'status':
        const statusStyle = getStatusColor(task.status);
        return (
          <td className="px-4 py-3">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
              style={{ 
                background: statusStyle.bg,
                color: statusStyle.color 
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value });
              }}
            >
              {value}
            </span>
          </td>
        );
        
      case 'priority':
        return (
          <td className="px-4 py-3">
            <span 
              className="text-gray-300 cursor-pointer px-2 py-1 hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value });
              }}
            >
              {value}
            </span>
          </td>
        );
        
      case 'tag':
        // Afficher le radar et/ou la matière
        const tagDisplay = task.subjectName 
          ? `${task.radarName} › ${task.subjectName}`
          : task.radarName || '';
        
        return (
          <td className="px-4 py-3">
            {tagDisplay && (
              <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full">
                {tagDisplay}
              </span>
            )}
          </td>
        );
        
      default:
        return (
          <td className="px-4 py-3 text-gray-300">
            {value || '-'}
          </td>
        );
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onContextMenu={(e) => onContextMenu(e, task)}
      className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
    >
      {columns.map(col => (
        <React.Fragment key={col.key}>
          {renderCell(col.key)}
        </React.Fragment>
      ))}
    </tr>
  );
};

// Composant principal du tableau
const DraggableTable = ({ 
  title, 
  tasks, 
  columns, 
  onUpdateTasks,
  onAddTask,
  onUpdateTask,
  onDoubleClick,
  onContextMenu 
}) => {
  const { radars } = useContext(AppContext);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingCell, setEditingCell] = useState(null);
  const inputRef = React.useRef(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // Seulement réordonner si on a un 'over' valide ET des IDs différents
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        onUpdateTasks(newTasks);
      }
    }
  };

  const handleAddTask = (taskData) => {
    if (typeof taskData === 'string') {
      // Ancien comportement pour compatibilité
      if (taskData.trim()) {
        onAddTask(taskData.trim());
        setNewTaskName('');
      }
    } else {
      // Nouveau comportement avec radar/matière
      onAddTask(taskData);
      setNewTaskName('');
    }
  };

  // Gérer le clic sur une cellule pour édition rapide
  const handleCellClick = (task, column, newValue) => {
    if (newValue !== undefined && newValue !== task[column]) {
      onUpdateTask({ ...task, [column]: newValue });
    }
    setEditingCell(null);
  };

  // Couleurs pour les priorités
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Très important': return '#8b5cf6'; // Violet
      case 'Important': return '#ef4444'; // Rouge
      case 'Pas de panique': return '#0ea5e9'; // Bleu ciel
      default: return '#6b7280'; // Gris
    }
  };

  // Couleurs pour les statuts
  const getStatusColor = (status) => {
    switch(status) {
      case 'Terminé': 
        return { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
      case 'En cours': 
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
      case 'À faire': 
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' };
      default: 
        return { bg: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' };
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header avec effet neumorphism */}
      <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700/50">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>
      </div>
      
      {/* Table avec DndContext en dehors */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 bg-gray-900/30">
                {columns.map(col => (
                  <th 
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map(task => (
                  <SortableRow
                    key={task.id}
                    task={task}
                    columns={columns}
                    onDoubleClick={onDoubleClick}
                    onContextMenu={onContextMenu}
                    onCellClick={handleCellClick}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    editingCell={editingCell}
                    onEditingCellChange={setEditingCell}
                  />
                ))}
              </SortableContext>
              
              {/* Ligne d'ajout avec autocomplétion */}
              <tr className="border-t border-gray-700/50 bg-gray-900/20">
                <td colSpan={columns.length} className="px-4 py-3 relative">
                  <TaskAutocomplete
                    value={newTaskName}
                    onChange={setNewTaskName}
                    onSubmit={handleAddTask}
                    radars={radars}
                    placeholder="➕ Ajouter une tâche..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
};

export default DraggableTable;
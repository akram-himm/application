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
const SortableRow = ({ task, columns, onDoubleClick, onContextMenu, onCellClick, getPriorityColor, getStatusColor, editingCell, onEditingCellChange, radars }) => {
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
  };

  const renderCell = (column) => {
    const value = task[column] || '';
    const isEditing = editingCell?.taskId === task.id && editingCell?.column === column;
    
    // Si on édite cette cellule
    if (isEditing) {
      if (column === 'status') {
        return (
          <td className="px-6 py-5">
            <select
              autoFocus
              value={editingCell.value}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-2 py-1 bg-white border border-[#E4E7EB] rounded text-[#1E1F22] text-sm"
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </td>
        );
      } else if (column === 'priority') {
        return (
          <td className="px-6 py-5">
            <select
              autoFocus
              value={editingCell.value}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-2 py-1 bg-white border border-[#E4E7EB] rounded text-[#1E1F22] text-sm"
            >
              <option value="Pas de panique">Pas de panique</option>
              <option value="Important">Important</option>
              <option value="Très important">Très important</option>
            </select>
          </td>
        );
      } else if (column === 'name') {
        return (
          <td className="px-6 py-5">
            <div className="relative">
              <TaskAutocomplete
                value={editingCell.value}
                onChange={(newValue) => onEditingCellChange({ ...editingCell, value: newValue })}
                onSubmit={(taskData) => {
                  // Si c'est un objet avec radar/subject, on met à jour toutes les infos
                  if (typeof taskData === 'object') {
                    const updatedTask = {
                      ...task,
                      name: taskData.name,
                      radar: taskData.radar || null,
                      radarName: taskData.radarName || null,
                      subject: taskData.subject || null,
                      subjectName: taskData.subjectName || null
                    };
                    onCellClick(updatedTask, 'fullUpdate', updatedTask);
                  } else {
                    onCellClick(task, column, editingCell.value);
                  }
                }}
                radars={radars}
                placeholder=""
              />
            </div>
          </td>
        );
      }
    }
    
    // Rendu normal (non édité)
    switch (column) {
      case 'name':
        return (
          <td 
            className="px-6 py-5"
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-1.5 h-10 rounded-full flex-shrink-0"
                style={{ background: getPriorityColor(task.priority) }}
              />
              <div className="flex-1">
                <div>
                  <span 
                    className="text-[#1E1F22] cursor-pointer"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onEditingCellChange({ taskId: task.id, column, value });
                    }}
                  >
                    {value}
                  </span>
                </div>
                {task.radarName && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-[10px] font-medium">
                      radar
                    </span>
                    <span className="text-[11px]">› {task.radarName}</span>
                    {task.subjectName && (
                      <span className="text-[11px]">› {task.subjectName}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        );
        
      case 'status':
        const statusStyle = getStatusColor(task.status);
        return (
          <td className="px-6 py-5">
            <span 
              className={`px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all ${
                value === 'En cours'
                  ? 'bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.18)]'
                  : value === 'À faire'
                    ? 'bg-white border border-gray-200 text-gray-700'
                    : 'bg-white/70 border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }`}
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
        const isPriorityUrgent = value === 'Très important';
        return (
          <td className="px-6 py-5">
            <span 
              className={`cursor-pointer px-2.5 py-1 rounded-full text-xs transition-all ${
                isPriorityUrgent 
                  ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value });
              }}
            >
              {value}
            </span>
          </td>
        );
        
      default:
        return (
          <td className="px-6 py-4 text-[#6B7280]">
            {value || '-'}
          </td>
        );
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => onContextMenu(e, task)}
      className="hover:bg-gray-50 transition cursor-grab active:cursor-grabbing"
    >
      {columns.filter(col => col.key !== 'tag').map(col => (
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
    if (column === 'fullUpdate') {
      // Mise à jour complète de la tâche (utilisé pour l'autocomplete)
      onUpdateTask(newValue);
    } else if (newValue !== undefined && newValue !== task[column]) {
      onUpdateTask({ ...task, [column]: newValue });
    }
    setEditingCell(null);
  };

  // Couleurs pour les priorités
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Très important': return '#EF4444'; // Rouge urgent
      case 'Important': return '#3B82F6'; // Bleu accent
      case 'Pas de panique': return '#9CA3AF'; // Gris muted
      default: return '#9CA3AF'; // Gris muted
    }
  };

  // Couleurs pour les statuts
  const getStatusColor = (status) => {
    switch(status) {
      case 'Terminé': 
        return { bg: '#FFFFFF', color: '#6B7280', border: '#E4E7EB' };
      case 'En cours': 
        return { bg: '#FCE7E7', color: '#EF4444', border: 'rgba(239,68,68,.2)' };
      case 'À faire': 
        return { bg: '#FFFFFF', color: '#6B7280', border: '#E4E7EB' };
      default: 
        return { bg: '#FFFFFF', color: '#6B7280', border: '#E4E7EB' };
    }
  };

  return (
    <div className="rounded-2xl bg-white/70 ring-1 ring-gray-200 shadow-[18px_18px_36px_rgba(0,0,0,0.08),_-10px_-10px_28px_rgba(255,255,255,0.60)] overflow-hidden">
      {/* Header avec effet neumorphism */}
      <div className="px-6 py-5 bg-gradient-to-b from-[#EFEFEF] to-[#F7F7F7] border-b border-gray-200">
        <h2 className="text-[18px] font-semibold text-[#1E1F22]" style={{ letterSpacing: '-0.01em' }}>
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
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {columns.filter(col => col.key !== 'tag').map(col => (
                  <th 
                    key={col.key}
                    className="px-6 py-4 text-left text-sm font-medium tracking-wide"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                    radars={radars}
                  />
                ))}
              </SortableContext>
              
              {/* Ligne d'ajout avec autocomplétion */}
              <tr className="border-t border-[#E4E7EB]">
                <td colSpan={columns.filter(col => col.key !== 'tag').length} className="px-6 py-5 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-lg">+</span>
                    <TaskAutocomplete
                      value={newTaskName}
                      onChange={setNewTaskName}
                      onSubmit={handleAddTask}
                      radars={radars}
                      placeholder="Ajouter une tâche..."
                    />
                  </div>
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
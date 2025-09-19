import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import TaskAutocomplete from './TaskAutocomplete';
import ConfirmModal from './ConfirmModal';
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
const SortableRow = ({ task, columns, onDoubleClick, onContextMenu, onCellClick, getPriorityColor, getStatusColor, editingCell, onEditingCellChange, radars, isHovered, onHover, statusOptions, priorityOptions, customStatus, setCustomStatus, customPriority, setCustomPriority, selectedColor, setSelectedColor, colorPalette, setStatusOptions, setPriorityOptions, dropdownRef, showCustomStatus, setShowCustomStatus, showCustomPriority, setShowCustomPriority }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
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
        const currentOption = statusOptions.find(opt => opt.label === editingCell.value);
        const currentColor = currentOption?.color || '#9CA3AF';
        
        return (
          <td className="px-6 py-3 border-b border-gray-200 text-center">
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border hover:shadow-lg whitespace-nowrap"
                style={{
                  backgroundColor: `${currentColor}20`,
                  borderColor: `${currentColor}60`,
                  color: currentColor,
                  minWidth: '120px',
                  width: '120px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditingCellChange(null);
                  setShowCustomStatus(false);
                  setShowCustomPriority(false);
                }}
              >
                {editingCell.value}
              </button>
              <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden min-w-[180px]">
                {statusOptions.map((option, index) => (
                  <div 
                    key={option.label} 
                    className="relative group flex items-center"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.opacity = '1';
                      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      if (draggedIndex !== index) {
                        const newOptions = [...statusOptions];
                        const [removed] = newOptions.splice(draggedIndex, 1);
                        newOptions.splice(index, 0, removed);
                        setStatusOptions(newOptions);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-xs font-medium transition-all relative pr-16"
                      style={{
                        backgroundColor: `${option.color}15`,
                        color: option.color
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${option.color}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${option.color}15`;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCellClick(task, column, option.label);
                        setShowCustomStatus(false);
                      }}
                    >
                      {option.label}
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-gray-100 transition-all text-gray-300 hover:text-gray-600"
                          title="Modifier"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implémenter la modification
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-gray-100 transition-all text-gray-300 hover:text-gray-600"
                          title="Supprimer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusOptions(statusOptions.filter((_, i) => i !== index));
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    </div>
                  </div>
                ))}
                
                {/* Séparateur */}
                <div className="border-t border-gray-200/50 my-1"></div>
                
                {/* Option Personnalisé */}
                <button
                  type="button"
                  className="block w-full px-3 py-2.5 text-left text-xs font-medium transition-all hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCustomStatus(!showCustomStatus);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400"></span>
                    <span className="text-gray-600">Personnalisé...</span>
                  </span>
                </button>
                
                {/* Section de création personnalisée - visible seulement si showCustomStatus est true */}
                {showCustomStatus && (
                  <div className="p-2 border-t border-gray-200/50 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                      placeholder="Nouvelle catégorie..."
                      className="flex-1 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex gap-1 mb-2">
                    {colorPalette.map(color => (
                      <button
                        key={color.value}
                        className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          borderColor: selectedColor === color.value ? '#1F2937' : 'transparent'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColor(color.value);
                        }}
                      />
                    ))}
                  </div>
                  <button
                    className="w-full px-2 py-1 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customStatus.trim()) {
                        setStatusOptions([...statusOptions, { label: customStatus, color: selectedColor }]);
                        onCellClick(task, column, customStatus);
                        setCustomStatus('');
                        setShowCustomStatus(false);
                      }
                    }}
                  >
                    Ajouter
                  </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        );
      } else if (column === 'priority') {
        const currentOption = priorityOptions.find(s => s.value === editingCell.value) || priorityOptions[0];
        const currentColor = currentOption.color;
        
        return (
          <td className="px-6 py-3 border-b border-gray-200 text-center">
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border hover:shadow-lg whitespace-nowrap"
                style={{
                  backgroundColor: `${currentColor}20`,
                  borderColor: `${currentColor}60`,
                  color: currentColor,
                  minWidth: '120px',
                  width: '120px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditingCellChange(null);
                  setShowCustomStatus(false);
                  setShowCustomPriority(false);
                }}
              >
                {editingCell.value}
              </button>
              <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden min-w-[180px] border border-gray-200/50">
                {priorityOptions.map((option, index) => (
                  <div 
                    key={option.value} 
                    className="relative group flex items-center"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.opacity = '1';
                      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      if (draggedIndex !== index) {
                        const newOptions = [...priorityOptions];
                        const [removed] = newOptions.splice(draggedIndex, 1);
                        newOptions.splice(index, 0, removed);
                        setPriorityOptions(newOptions);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-xs font-medium transition-all relative pr-16"
                      style={{
                        backgroundColor: `${option.color}15`,
                        color: option.color
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${option.color}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${option.color}15`;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCellClick(task, column, option.value);
                        onEditingCellChange(null);
                        setShowCustomPriority(false);
                      }}
                    >
                      {option.value}
                    </button>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-gray-100 transition-all text-gray-300 hover:text-gray-600"
                          title="Modifier"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implémenter la modification
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-0.5 rounded hover:bg-gray-100 transition-all text-gray-300 hover:text-gray-600"
                          title="Supprimer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPriorityOptions(priorityOptions.filter((_, i) => i !== index));
                          }}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    </div>
                  </div>
                ))}
                
                {/* Séparateur */}
                <div className="border-t border-gray-200/50 my-1"></div>
                
                {/* Option Personnalisé */}
                <button
                  type="button"
                  className="block w-full px-3 py-2.5 text-left text-xs font-medium transition-all hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCustomPriority(!showCustomPriority);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400"></span>
                    <span className="text-gray-600">Personnalisé...</span>
                  </span>
                </button>
                
                {/* Section de création personnalisée - visible seulement si showCustomPriority est true */}
                {showCustomPriority && (
                  <div className="p-2 border-t border-gray-200/50 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Nouvelle priorité..."
                        value={customPriority}
                        onChange={(e) => setCustomPriority(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex gap-1 mb-2">
                    {colorPalette.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className="w-6 h-6 rounded-lg border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          borderColor: selectedColor === color.value ? '#1F2937' : 'transparent'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColor(color.value);
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full px-2 py-1 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customPriority.trim()) {
                        setPriorityOptions([...priorityOptions, { value: customPriority, color: selectedColor }]);
                        onCellClick(task, column, customPriority);
                        setCustomPriority('');
                        onEditingCellChange(null);
                        setShowCustomPriority(false);
                      }
                    }}
                  >
                    Ajouter
                  </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        );
      } else if (column === 'date' || column === 'startDate' || column === 'endDate') {
        return (
          <td className="px-6 py-3 border-b border-gray-200">
            <input
              type="date"
              autoFocus
              value={editingCell.value || ''}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[#1E1F22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </td>
        );
      } else if (column === 'time') {
        return (
          <td className="px-6 py-3 border-b border-gray-200">
            <input
              type="time"
              autoFocus
              value={editingCell.value || ''}
              onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
              onBlur={() => onCellClick(task, column, editingCell.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                if (e.key === 'Escape') onEditingCellChange(null);
              }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[#1E1F22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </td>
        );
      } else if (column === 'name') {
        return (
          <td className="px-6 py-3 border-b border-gray-200">
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
            className="px-3 py-2 border-b border-gray-200"
            ref={setActivatorNodeRef}
            {...listeners}
            style={{ cursor: 'default' }}
          >
            <div className="flex items-start gap-2">
              <div 
                className="w-1 h-5 rounded-full flex-shrink-0 mt-0.5"
                style={{ 
                  background: task.type === 'routine' ? '#9333ea' : getPriorityColor(task.priority) 
                }}
              />
              <div className="flex-1">
                <span 
                  className="text-gray-900 text-sm cursor-pointer hover:text-blue-600"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onEditingCellChange({ taskId: task.id, column, value });
                  }}
                >
                  {value}
                </span>
                {task.radarName && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {task.radarName}{task.subjectName ? ` > ${task.subjectName}` : ''}
                  </div>
                )}
              </div>
            </div>
          </td>
        );
        
      case 'status': {
        const currentOption = statusOptions.find(s => s.label === value) || statusOptions[0];
        const currentColor = currentOption ? currentOption.color : '#9CA3AF';
        
        return (
          <td className="px-6 py-3 border-b border-gray-200 text-center">
            <button
              type="button"
              className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border hover:shadow-lg whitespace-nowrap"
              style={{
                backgroundColor: `${currentColor}20`,
                borderColor: `${currentColor}40`,
                color: currentColor,
                minWidth: '120px',
                width: '120px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value });
              }}
            >
              {value}
            </button>
          </td>
        );
      }
        
      case 'priority': {
        const currentOption = priorityOptions.find(p => p.value === value) || priorityOptions[0];
        const currentColor = currentOption ? currentOption.color : '#9CA3AF';
        
        return (
          <td className="px-6 py-3 border-b border-gray-200 text-center">
            <button
              type="button"
              className="inline-flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border hover:shadow-lg whitespace-nowrap"
              style={{
                backgroundColor: `${currentColor}20`,
                borderColor: `${currentColor}40`,
                color: currentColor,
                minWidth: '120px',
                width: '120px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value });
              }}
            >
              {value}
            </button>
          </td>
        );
      }
        
      case 'date':
      case 'startDate':
      case 'endDate':
        return (
          <td className="px-6 py-3 border-b border-gray-200">
            <span
              className="text-sm cursor-pointer transition-all hover:text-blue-600"
              style={{
                color: value ? '#6B7280' : '#D1D5DB',
                fontStyle: value ? 'normal' : 'italic',
                fontWeight: '400'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value: value || '' });
              }}
            >
              {value ? (
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).replace(/\//g, '/')
              ) : 'Ajouter'}
            </span>
          </td>
        );

      case 'time':
        // Si on est en train d'éditer cette cellule
        if (isEditing) {
          return (
            <td className="px-6 py-3 border-b border-gray-200">
              <input
                type="time"
                className="px-2 py-1 text-sm text-gray-900 bg-white border border-blue-500 rounded outline-none"
                autoFocus
                value={editingCell.value || ''}
                onChange={(e) => onEditingCellChange({ ...editingCell, value: e.target.value })}
                onBlur={() => onCellClick(task, column, editingCell.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onCellClick(task, column, editingCell.value);
                  if (e.key === 'Escape') onEditingCellChange(null);
                }}
              />
            </td>
          );
        }
        // Affichage normal
        return (
          <td className="px-6 py-3 border-b border-gray-200">
            <span
              className="text-sm cursor-pointer transition-all hover:text-blue-600"
              style={{
                color: value ? '#6B7280' : '#D1D5DB',
                fontStyle: value ? 'normal' : 'italic',
                fontWeight: '400'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditingCellChange({ taskId: task.id, column, value: value || '' });
              }}
            >
              {value || 'Ajouter'}
            </span>
          </td>
        );
        
      default:
        return (
          <td className="px-6 py-3 text-[#6B7280] border-b border-gray-200">
            {value || '-'}
          </td>
        );
    }
  };

  return (
    <tr
      ref={setNodeRef}
      data-task-id={task.id}
      style={{
        ...style,
        height: '60px'
      }}
      {...attributes}
      onContextMenu={(e) => onContextMenu(e, task)}
      onMouseEnter={() => onHover(task.id)}
      onMouseLeave={() => onHover(null)}
      className={`hover:bg-gray-50 transition ${
        isHovered ? 'bg-gray-50/50' : ''
      }`}
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
  onContextMenu,
  onDeleteTasks 
}) => {
  const { radars } = useContext(AppContext);
  const [newTaskName, setNewTaskName] = useState('');
  const [isRoutine, setIsRoutine] = useState(false); // État pour la case routine
  const [editingCell, setEditingCell] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [rowHeights, setRowHeights] = useState({});
  const [customStatus, setCustomStatus] = useState('');
  const [customPriority, setCustomPriority] = useState('');
  const [selectedColor, setSelectedColor] = useState('#EA580C');
  const [showCustomStatus, setShowCustomStatus] = useState(false);
  const [showCustomPriority, setShowCustomPriority] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: '',
    onConfirm: null
  });
  const inputRef = React.useRef(null);
  const tableRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  
  // Palette de couleurs prédéfinies
  const colorPalette = [
    { name: 'Orange', value: '#EA580C' },
    { name: 'Rouge', value: '#DC2626' },
    { name: 'Vert', value: '#16A34A' },
    { name: 'Jaune', value: '#CA8A04' },
    { name: 'Violet', value: '#9333EA' },
    { name: 'Rose', value: '#DB2777' },
    { name: 'Gris', value: '#C4C4C4' },
    { name: 'Bleu', value: '#2563EB' }
  ];
  
  // Options de status avec couleurs personnalisables (style Monday.com)
  // Charger les options depuis localStorage ou utiliser les valeurs par défaut
  const getStoredOptions = (key, defaultOptions) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultOptions;
    } catch {
      return defaultOptions;
    }
  };

  // Pour réinitialiser, décommentez la ligne suivante temporairement :
  // localStorage.removeItem('taskStatusOptions');
  
  const [statusOptions, setStatusOptionsState] = useState(() => {
    // Forcer la réinitialisation pour corriger la couleur
    const defaultOptions = [
      { label: 'À faire', color: '#9CA3AF' },
      { label: 'En cours', color: '#FBBF24' },
      { label: 'Terminé', color: '#10B981' }
    ];
    
    // Effacer l'ancien localStorage et utiliser les nouvelles valeurs
    localStorage.removeItem('taskStatusOptions');
    localStorage.setItem('taskStatusOptions', JSON.stringify(defaultOptions));
    
    return defaultOptions;
  });
  
  // Options de priorité avec couleurs personnalisables (style Monday.com)
  const [priorityOptions, setPriorityOptionsState] = useState(() => {
    // Forcer la réinitialisation pour corriger la couleur
    const defaultOptions = [
      { value: 'Pas de panique', color: '#9CA3AF' },
      { value: 'Important', color: '#3B82F6' },
      { value: 'Très important', color: '#EF4444' }
    ];
    
    // Effacer l'ancien localStorage et utiliser les nouvelles valeurs
    localStorage.removeItem('taskPriorityOptions');
    localStorage.setItem('taskPriorityOptions', JSON.stringify(defaultOptions));
    
    return defaultOptions;
  });

  // Wrapper pour sauvegarder dans localStorage
  const setStatusOptions = (newOptions) => {
    const options = typeof newOptions === 'function' ? newOptions(statusOptions) : newOptions;
    setStatusOptionsState(options);
    localStorage.setItem('taskStatusOptions', JSON.stringify(options));
  };

  const setPriorityOptions = (newOptions) => {
    const options = typeof newOptions === 'function' ? newOptions(priorityOptions) : newOptions;
    setPriorityOptionsState(options);
    localStorage.setItem('taskPriorityOptions', JSON.stringify(options));
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Fermeture du dropdown au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingCell(null);
        setShowCustomStatus(false);
        setShowCustomPriority(false);
      }
    };
    
    if (editingCell) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingCell]);
  
  // Réinitialiser l'état personnalisé quand on ferme le dropdown
  React.useEffect(() => {
    if (!editingCell) {
      setShowCustomStatus(false);
      setShowCustomPriority(false);
    }
  }, [editingCell]);

  // Mesurer les hauteurs des lignes du tableau
  React.useEffect(() => {
    if (!tableRef.current) return;
    
    const measureHeights = () => {
      const heights = {};
      const thead = tableRef.current.querySelector('thead tr');
      const tbody = tableRef.current.querySelectorAll('tbody tr');
      
      if (thead) {
        heights.header = thead.offsetHeight;
      }
      
      tbody.forEach((row, index) => {
        if (row.dataset.taskId) {
          heights[row.dataset.taskId] = row.offsetHeight;
        } else if (index === tbody.length - 1) {
          heights.addRow = row.offsetHeight;
        }
      });
      
      setRowHeights(heights);
    };
    
    measureHeights();
    // Re-mesurer si les tâches changent
    const resizeObserver = new ResizeObserver(measureHeights);
    resizeObserver.observe(tableRef.current);
    
    return () => resizeObserver.disconnect();
  }, [tasks]);

  // Gérer la sélection
  const handleToggleSelect = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Suppression en masse
  const handleBulkDelete = () => {
    const count = selectedTasks.size;
    const message = count === 1 
      ? 'Êtes-vous sûr de vouloir supprimer cette tâche ?' 
      : `Êtes-vous sûr de vouloir supprimer ces ${count} tâches ?`;
    
    setConfirmModal({
      show: true,
      message: message,
      onConfirm: () => {
        if (onDeleteTasks) {
          // Supprimer chaque tâche individuellement
          Array.from(selectedTasks).forEach(taskId => {
            onDeleteTasks(taskId);
          });
          setSelectedTasks(new Set());
        }
        setConfirmModal({ show: false, message: '', onConfirm: null });
      }
    });
  };

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
        onAddTask({
          name: taskData.trim(),
          type: isRoutine ? 'routine' : 'today'
        });
        setNewTaskName('');
        setIsRoutine(false); // Réinitialiser la case
      }
    } else {
      // Nouveau comportement avec radar/matière
      onAddTask({
        ...taskData,
        type: isRoutine ? 'routine' : 'today'
      });
      setNewTaskName('');
      setIsRoutine(false); // Réinitialiser la case
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
      case 'Très important': return '#EF4444';
      case 'Important': return '#3B82F6';
      case 'Pas de panique': return '#C4C4C4';
      default: return '#C4C4C4';
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
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Barre d'actions en masse */}
      {selectedTasks.size > 0 && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gray-900/90 backdrop-blur-md rounded-t-xl text-white text-sm z-10">
          <span>{selectedTasks.size} élément(s) sélectionné(s)</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => setSelectedTasks(new Set())}
              className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-2 w-full">
        {/* Colonne des checkboxes */}
        <div className="flex flex-col flex-shrink-0" style={{ width: '44px' }}>
          {/* Espace pour le titre si présent */}
          {title && <div style={{ height: '60px' }}></div>}
          
          {/* Case à cocher du header */}
          <div 
            className="flex items-center justify-center"
            style={{ 
              height: 50,
              transition: 'height 0.1s'
            }}
          >
            <input
              type="checkbox"
              checked={selectedTasks.size === tasks.length && tasks.length > 0}
              onChange={() => {
                if (selectedTasks.size === tasks.length) {
                  setSelectedTasks(new Set());
                } else {
                  setSelectedTasks(new Set(tasks.map(t => t.id)));
                }
              }}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          
          {/* Cases à cocher pour chaque ligne */}
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center justify-center"
              style={{ 
                height: 60,
                transition: 'height 0.1s'
              }}
              onMouseEnter={() => setHoveredRow(task.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <input
                type="checkbox"
                checked={selectedTasks.has(task.id)}
                onChange={() => handleToggleSelect(task.id)}
                className={`w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer transition-opacity duration-200 ${
                  hoveredRow === task.id || selectedTasks.has(task.id) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          ))}
          
          {/* Case vide pour la ligne d'ajout */}
          <div 
            style={{ 
              height: 60,
              transition: 'height 0.1s'
            }}
          ></div>
        </div>
        
        {/* Tableau principal */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 min-w-0">
          {/* Header */}
          {title && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {title}
              </h2>
            </div>
          )}
          
          {/* Table avec DndContext en dehors */}
          <div className="overflow-visible">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full" ref={tableRef}>
            <thead className="bg-gray-100 text-gray-600">
              <tr style={{ height: '50px', boxSizing: 'border-box' }}>
                {columns.filter(col => col.key !== 'tag').map(col => (
                  <th 
                    key={col.key}
                    className={`px-6 text-sm font-medium tracking-wide border-b border-gray-200 ${
                      col.key === 'status' || col.key === 'priority' ? 'text-center' : 'text-left'
                    }`}
                    style={{ paddingTop: '12px', paddingBottom: '12px', boxSizing: 'border-box' }}
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
                    radars={radars}
                    isHovered={hoveredRow === task.id}
                    onHover={setHoveredRow}
                    statusOptions={statusOptions}
                    priorityOptions={priorityOptions}
                    customStatus={customStatus}
                    setCustomStatus={setCustomStatus}
                    customPriority={customPriority}
                    setCustomPriority={setCustomPriority}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colorPalette={colorPalette}
                    setStatusOptions={setStatusOptions}
                    setPriorityOptions={setPriorityOptions}
                    dropdownRef={dropdownRef}
                    showCustomStatus={showCustomStatus}
                    setShowCustomStatus={setShowCustomStatus}
                    showCustomPriority={showCustomPriority}
                    setShowCustomPriority={setShowCustomPriority}
                  />
                ))}
              </SortableContext>
              
              {/* Ligne d'ajout avec autocomplétion */}
              <tr className="border-t border-gray-200">
                <td colSpan={columns.filter(col => col.key !== 'tag').length} className="px-6 py-3 relative border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500 text-lg">+</span>
                    <TaskAutocomplete
                      value={newTaskName}
                      onChange={setNewTaskName}
                      onSubmit={handleAddTask}
                      radars={radars}
                      placeholder="Ajouter une tâche..."
                      existingTasks={tasks}
                    />
                    <label className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap cursor-pointer hover:text-purple-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={isRoutine}
                        onChange={(e) => setIsRoutine(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                      />
                      <span>Routine</span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </DndContext>
        </div>
        </div>
      </div>
      
      {/* Modal de confirmation pour suppression multiple */}
      {confirmModal.show && (
        <ConfirmModal
          show={confirmModal.show}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
        />
      )}
    </div>
  );
};

export default DraggableTable;
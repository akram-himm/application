import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types de colonnes disponibles
const COLUMN_TYPES = {
  text: { name: 'Texte', icon: '📝' },
  number: { name: 'Nombre', icon: '🔢' },
  select: { name: 'Sélection', icon: '📋' },
  multiSelect: { name: 'Multi-sélection', icon: '🏷️' },
  date: { name: 'Date', icon: '📅' },
  checkbox: { name: 'Case à cocher', icon: '✅' },
  url: { name: 'URL', icon: '🔗' },
  email: { name: 'Email', icon: '📧' },
  person: { name: 'Personne', icon: '👤' },
  files: { name: 'Fichiers', icon: '📎' },
  status: { name: 'Statut', icon: '🚦' },
  priority: { name: 'Priorité', icon: '⚡' },
  tags: { name: 'Tags', icon: '🏷️' },
  rating: { name: 'Évaluation', icon: '⭐' },
  progress: { name: 'Progression', icon: '📊' }
};

// Options par défaut pour certains types
const DEFAULT_OPTIONS = {
  select: ['Option 1', 'Option 2', 'Option 3'],
  multiSelect: ['Tag 1', 'Tag 2', 'Tag 3'],
  status: [
    { value: 'todo', label: 'À faire', color: '#ef4444' },
    { value: 'in_progress', label: 'En cours', color: '#f59e0b' },
    { value: 'done', label: 'Terminé', color: '#10b981' }
  ],
  priority: [
    { value: 'low', label: 'Basse', color: '#10b981' },
    { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
    { value: 'high', label: 'Haute', color: '#ef4444' },
    { value: 'urgent', label: 'Urgente', color: '#dc2626' }
  ]
};

// Composant pour une colonne triable
const SortableColumn = ({ column, onEditColumn, onDeleteColumn }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);

  const handleSave = () => {
    onEditColumn(column.id, { name: columnName });
    setIsEditing(false);
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 relative group"
    >
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ⋮⋮
        </span>
        <span>{COLUMN_TYPES[column.type]?.icon || '📄'}</span>
        {isEditing ? (
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </span>
        )}
        <button
          onClick={() => onDeleteColumn(column.id)}
          className="ml-auto opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
        >
          ×
        </button>
      </div>
    </th>
  );
};

// Composant principal de la base de données
const DatabaseTable = ({ initialData, onChange }) => {
  const [columns, setColumns] = useState([
    { id: 'col1', name: 'Nom', type: 'text' },
    { id: 'col2', name: 'Statut', type: 'status' },
    { id: 'col3', name: 'Date', type: 'date' },
    { id: 'col4', name: 'Priorité', type: 'priority' }
  ]);

  const [rows, setRows] = useState([
    { id: 'row1', data: {} },
    { id: 'row2', data: {} },
    { id: 'row3', data: {} }
  ]);

  const [sortConfig, setSortConfig] = useState(null);
  const [filterConfig, setFilterConfig] = useState({});
  const [showColumnTypeMenu, setShowColumnTypeMenu] = useState(null);
  const [viewType, setViewType] = useState('table'); // table, board, calendar, gallery, list

  // Capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialiser avec les données passées
  useEffect(() => {
    if (initialData) {
      if (initialData.columns) setColumns(initialData.columns);
      if (initialData.rows) setRows(initialData.rows);
    }
  }, [initialData]);

  // Notifier les changements
  useEffect(() => {
    if (onChange) {
      onChange({ columns, rows });
    }
  }, [columns, rows]);

  // Gérer le drag and drop des colonnes
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Ajouter une nouvelle colonne
  const addColumn = () => {
    const newColumn = {
      id: `col${Date.now()}`,
      name: 'Nouvelle colonne',
      type: 'text'
    };
    setColumns([...columns, newColumn]);
  };

  // Modifier une colonne
  const editColumn = (columnId, updates) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    ));
  };

  // Supprimer une colonne
  const deleteColumn = (columnId) => {
    setColumns(columns.filter(col => col.id !== columnId));
    // Nettoyer les données des lignes
    setRows(rows.map(row => ({
      ...row,
      data: Object.fromEntries(
        Object.entries(row.data).filter(([key]) => key !== columnId)
      )
    })));
  };

  // Ajouter une nouvelle ligne
  const addRow = () => {
    const newRow = {
      id: `row${Date.now()}`,
      data: {}
    };
    setRows([...rows, newRow]);
  };

  // Supprimer une ligne
  const deleteRow = (rowId) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  // Mettre à jour une cellule
  const updateCell = (rowId, columnId, value) => {
    setRows(rows.map(row =>
      row.id === rowId
        ? { ...row, data: { ...row.data, [columnId]: value } }
        : row
    ));
  };

  // Trier les lignes
  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a.data[sortConfig.key] || '';
      const bValue = b.data[sortConfig.key] || '';

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [rows, sortConfig]);

  // Filtrer les lignes
  const filteredRows = useMemo(() => {
    return sortedRows.filter(row => {
      return Object.entries(filterConfig).every(([columnId, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row.data[columnId] || '';
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [sortedRows, filterConfig]);

  // Gérer le tri
  const handleSort = (columnId) => {
    setSortConfig(current => {
      if (current?.key === columnId) {
        return {
          key: columnId,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  // Rendu d'une cellule selon son type
  const renderCell = (row, column) => {
    const value = row.data[column.id];

    switch (column.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => updateCell(row.id, column.id, e.target.checked)}
            className="rounded border-gray-300"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">-</option>
            {(column.options || DEFAULT_OPTIONS.select).map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'status':
        const statusOptions = column.options || DEFAULT_OPTIONS.status;
        const currentStatus = statusOptions.find(s => s.value === value);
        return (
          <select
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
            style={{
              backgroundColor: currentStatus?.color ? `${currentStatus.color}20` : undefined,
              borderColor: currentStatus?.color
            }}
          >
            <option value="">-</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        );

      case 'priority':
        const priorityOptions = column.options || DEFAULT_OPTIONS.priority;
        const currentPriority = priorityOptions.find(p => p.value === value);
        return (
          <select
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
            style={{
              backgroundColor: currentPriority?.color ? `${currentPriority.color}20` : undefined,
              borderColor: currentPriority?.color
            }}
          >
            <option value="">-</option>
            {priorityOptions.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        );

      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            placeholder="https://..."
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            placeholder="email@exemple.com"
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        );

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => updateCell(row.id, column.id, star)}
                className={`text-lg ${star <= (value || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        );

      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value || 0}
              onChange={(e) => updateCell(row.id, column.id, e.target.value)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600">{value || 0}%</span>
          </div>
        );

      case 'multiSelect':
      case 'tags':
        const tags = value ? (Array.isArray(value) ? value : [value]) : [];
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {tag}
                <button
                  onClick={() => {
                    const newTags = tags.filter((_, i) => i !== idx);
                    updateCell(row.id, column.id, newTags);
                  }}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const newTag = prompt('Nouveau tag:');
                if (newTag) {
                  updateCell(row.id, column.id, [...tags, newTag]);
                }
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
            className="w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none focus:bg-white focus:border focus:border-blue-500 rounded"
          />
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Sélecteur de vue */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          >
            <option value="table">📊 Tableau</option>
            <option value="board">📋 Kanban</option>
            <option value="calendar">📅 Calendrier</option>
            <option value="gallery">🖼️ Galerie</option>
            <option value="list">📝 Liste</option>
          </select>

          {/* Bouton de tri */}
          <button
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => {
              const column = prompt('Trier par colonne:');
              if (column) handleSort(column);
            }}
          >
            ↕️ Trier
          </button>

          {/* Bouton de filtre */}
          <button
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => {
              const column = prompt('Filtrer par colonne:');
              const value = prompt('Valeur à filtrer:');
              if (column && value) {
                setFilterConfig({ ...filterConfig, [column]: value });
              }
            }}
          >
            🔍 Filtrer
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />

          {/* Bouton d'ajout de colonne */}
          <button
            onClick={addColumn}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            + Colonne
          </button>

          {/* Bouton d'ajout de ligne */}
          <button
            onClick={addRow}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            + Ligne
          </button>
        </div>
      </div>

      {/* Vue Tableau */}
      {viewType === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns}
                  strategy={horizontalListSortingStrategy}
                >
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 w-10">
                      #
                    </th>
                    {columns.map((column) => (
                      <SortableColumn
                        key={column.id}
                        column={column}
                        onEditColumn={editColumn}
                        onDeleteColumn={deleteColumn}
                      />
                    ))}
                    <th className="px-4 py-3 bg-gray-50 w-10"></th>
                  </tr>
                </SortableContext>
              </DndContext>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-2">
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vue Kanban */}
      {viewType === 'board' && (
        <div className="p-4">
          <div className="flex gap-4 overflow-x-auto">
            {columns
              .filter(col => col.type === 'status' || col.type === 'select')
              .map(column => {
                const options = column.options || DEFAULT_OPTIONS[column.type] || [];
                return options.map(option => {
                  const optionValue = typeof option === 'object' ? option.value : option;
                  const optionLabel = typeof option === 'object' ? option.label : option;
                  const optionColor = typeof option === 'object' ? option.color : null;

                  const columnRows = filteredRows.filter(
                    row => row.data[column.id] === optionValue
                  );

                  return (
                    <div
                      key={`${column.id}-${optionValue}`}
                      className="flex-shrink-0 w-72"
                    >
                      <div
                        className="p-3 rounded-t-lg font-medium"
                        style={{
                          backgroundColor: optionColor ? `${optionColor}20` : '#f3f4f6'
                        }}
                      >
                        {optionLabel} ({columnRows.length})
                      </div>
                      <div className="bg-gray-50 min-h-[200px] p-2 space-y-2 rounded-b-lg">
                        {columnRows.map(row => (
                          <div
                            key={row.id}
                            className="bg-white p-3 rounded shadow-sm hover:shadow-md transition-shadow"
                          >
                            {columns.map(col => (
                              <div key={col.id} className="mb-2">
                                <span className="text-xs text-gray-500">{col.name}:</span>
                                <div className="mt-1">
                                  {renderCell(row, col)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              }).flat()}
          </div>
        </div>
      )}

      {/* Autres vues à implémenter */}
      {(viewType === 'calendar' || viewType === 'gallery' || viewType === 'list') && (
        <div className="p-8 text-center text-gray-500">
          Vue "{viewType}" en cours de développement...
        </div>
      )}
    </div>
  );
};

export default DatabaseTable;
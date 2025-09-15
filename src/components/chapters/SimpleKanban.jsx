import React, { useState } from 'react';

const SimpleKanban = () => {
  const [tasks, setTasks] = useState({
    'not-started': [],
    'in-progress': [],
    'done': []
  });

  const [draggedTask, setDraggedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalColumn, setModalColumn] = useState('not-started');
  const [newTask, setNewTask] = useState({ name: '', date: '' });

  // Ajouter une nouvelle tâche
  const handleAddTask = () => {
    if (newTask.name.trim()) {
      const task = {
        id: Date.now().toString(),
        name: newTask.name,
        date: newTask.date
      };

      setTasks(prev => ({
        ...prev,
        [modalColumn]: [...prev[modalColumn], task]
      }));

      setNewTask({ name: '', date: '' });
      setShowAddModal(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, task, fromColumn) => {
    setDraggedTask({ task, fromColumn });
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toColumn) => {
    e.preventDefault();

    if (draggedTask && draggedTask.fromColumn !== toColumn) {
      const { task, fromColumn } = draggedTask;

      // Retirer de l'ancienne colonne
      setTasks(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn].filter(t => t.id !== task.id),
        [toColumn]: [...prev[toColumn], task]
      }));
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = (taskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== taskId)
    }));
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const columns = [
    { id: 'not-started', title: 'Non commencé', color: 'bg-gray-50' },
    { id: 'in-progress', title: 'En cours', color: 'bg-blue-50' },
    { id: 'done', title: 'Terminé', color: 'bg-green-50' }
  ];

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-1 min-w-[280px] ${column.color} rounded-lg p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* En-tête de colonne */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">{column.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded">
                  {tasks[column.id].length}
                </span>
                <button
                  onClick={() => {
                    setModalColumn(column.id);
                    setShowAddModal(true);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Ajouter une tâche"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-2 min-h-[100px]">
              {tasks[column.id].map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, column.id)}
                  onDragEnd={handleDragEnd}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{task.name}</p>
                      {task.date && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.date)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id, column.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-2"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {tasks[column.id].length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucune tâche
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal d'ajout de tâche */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Ajouter une tâche</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la tâche
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez le nom de la tâche..."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTask.name.trim()) {
                      handleAddTask();
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date (optionnelle)
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-sm text-gray-500">
                Colonne: <span className="font-medium">
                  {columns.find(c => c.id === modalColumn)?.title}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTask({ name: '', date: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleKanban;
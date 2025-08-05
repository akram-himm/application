import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import TaskModal from '../components/plan/TaskModal';

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
  const inputRef = useRef(null);

  // Filtrer les tâches selon le mode de vue
  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    if (viewMode === 'day') {
      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (viewMode === 'week') {
      return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
    }
    return tasks; // 'both' - toutes les tâches
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

        // Si un radar correspond, ajouter ses matières
        radar.subjects?.forEach(subject => {
          options.push({
            type: 'subject',
            id: subject.id,
            radarId: radar.id,
            name: `${radar.name} > ${subject.name}`,
            icon: '📚',
            path: `/radar/${radar.id}/subject/${subject.id}`
          });
        });
      } else {
        // Rechercher aussi dans les matières
        radar.subjects?.forEach(subject => {
          if (subject.name.toLowerCase().includes(lowerQuery)) {
            options.push({
              type: 'subject',
              id: subject.id,
              radarId: radar.id,
              name: `${radar.name} > ${subject.name}`,
              icon: '📚',
              path: `/radar/${radar.id}/subject/${subject.id}`
            });
          }
        });
      }
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
        updateTask({ ...task, [editingField]: tempValue });
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
          subjectId: option.type === 'subject' ? option.id : null,
          path: option.path
        }
      });
    }
    handleCancelEdit();
  };

  const handleKeyDown = (e) => {
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

  const handleNavigateToTag = (task) => {
    if (task.tag?.path) {
      navigate(task.tag.path);
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
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredTasks = getFilteredTasks();

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
                Tout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tasks Table */}
      <div className="p-6">
        <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46">Tâche</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[120px]">Statut</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[100px]">Priorité</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[120px]">Date</th>
                <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} className="border-b border-white/[0.055] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 rounded border-2 border-white/20 checked:bg-[rgb(35,131,226)] checked:border-[rgb(35,131,226)] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {editingTaskId === task.id && editingField === 'name' ? (
                      <div className="relative">
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
                          onBlur={() => {
                            setTimeout(() => {
                              if (!showAutocomplete) handleSaveEdit();
                            }, 200);
                          }}
                          className="w-full px-2 py-1 bg-white/[0.055] border border-white/20 rounded text-white/81 focus:outline-none focus:border-[rgb(35,131,226)]"
                          autoFocus
                        />
                        
                        {/* Autocomplete dropdown */}
                        {showAutocomplete && autocompleteOptions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[rgb(37,37,37)] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                                <span>{option.name}</span>
                                <span className="text-xs text-white/30 ml-auto">
                                  {option.type === 'radar' ? 'Radar' : 'Matière'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => task.tag?.path && navigate(task.tag.path)}
                          className={`text-left ${task.completed ? 'line-through opacity-50' : ''} ${
                            task.tag ? 'hover:text-[rgb(35,131,226)] cursor-pointer' : ''
                          }`}
                          disabled={!task.tag}
                        >
                          {task.name || <span className="text-white/30">Cliquez pour ajouter une tâche...</span>}
                        </button>
                        <button
                          onClick={() => handleStartEdit(task.id, 'name', task.name)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/[0.055] rounded"
                        >
                          <svg className="w-3 h-3 text-white/46" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a.751.751 0 0 1-.154.109l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72a.751.751 0 0 1 .109-.154l8.596-8.598zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.117l.884.884 1.544-1.544a.25.25 0 0 0 0-.354l-.353-.353zM9.822 5.824 4.31 11.337a.751.751 0 0 0-.163.236l-.51 1.53 1.53-.51a.751.751 0 0 0 .236-.163l5.512-5.513-.884-.884z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={task.date ? new Date(task.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateTask({ ...task, date: new Date(e.target.value).toISOString() })}
                      className="bg-transparent text-white/46 text-xs cursor-pointer hover:text-white/81"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-white/46 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                        <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Add new task row */}
              <tr>
                <td colSpan="6" className="px-4 py-3">
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-2 text-white/46 hover:text-white/81 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 2.75a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 2.75" />
                    </svg>
                    <span>Ajouter une tâche</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanView;
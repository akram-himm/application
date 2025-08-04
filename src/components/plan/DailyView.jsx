import React from 'react';

const DailyView = ({ 
  tasks, 
  radars, 
  onToggleTask, 
  onUpdateStatus, 
  onEditTask, 
  onDeleteTask, 
  onAddTask,
  onNavigateToSubject 
}) => {
  // Filtrer les tâches du jour
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });
  
  const getRadarInfo = (task) => {
    if (!task.tag) return null;
    const radar = radars.find(r => r.id === task.tag.radar);
    if (!radar) return null;
    
    const subject = radar.subjects?.find(s => s.id === task.tag.subject);
    return { radar, subject };
  };
  
  const priorityDots = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };
  
  const statusClasses = {
    'todo': 'bg-red-500/10 border-red-500/20 text-red-500',
    'in-progress': 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    'done': 'bg-green-500/10 border-green-500/20 text-green-500'
  };
  
  const statusLabels = {
    'todo': 'À faire',
    'in-progress': 'En cours',
    'done': 'Terminé'
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  if (todayTasks.length === 0) {
    return (
      <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg p-16 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-white/30" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.5a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 7.793V2a.5.5 0 0 1 .5-.5zM3.5 9.5a.5.5 0 0 1 0 1 .5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5.5.5 0 1 1 0-1A1.5 1.5 0 0 1 14 11v2a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13v-2a1.5 1.5 0 0 1 1.5-1.5z" />
        </svg>
        <p className="text-white/60 mb-4">Aucune tâche pour aujourd'hui</p>
        <button
          onClick={onAddTask}
          className="px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-md hover:bg-[rgb(28,104,181)] transition-colors duration-150"
        >
          <svg className="w-4 h-4 inline-block mr-2" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
          </svg>
          Ajouter une tâche
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
            <th className="w-10 px-4 py-3"></th>
            <th className="text-left px-4 py-3 text-[13px] font-medium text-white/46">Tâche</th>
            <th className="text-left px-4 py-3 text-[13px] font-medium text-white/46 w-32">Statut</th>
            <th className="text-left px-4 py-3 text-[13px] font-medium text-white/46 w-32">Date</th>
            <th className="text-left px-4 py-3 text-[13px] font-medium text-white/46 w-40">Progression</th>
            <th className="w-20 px-4 py-3 text-[13px] font-medium text-white/46">Actions</th>
          </tr>
        </thead>
        <tbody>
          {todayTasks.map(task => {
            const radarInfo = getRadarInfo(task);
            const isLinked = !!radarInfo?.subject;
            
            return (
              <tr key={task.id} className="border-b border-white/[0.055] hover:bg-white/[0.03] transition-colors duration-150">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggleTask(task.id, e.target.checked)}
                    className="w-[18px] h-[18px] appearance-none border-2 border-white/[0.282] rounded cursor-pointer transition-all duration-150 hover:border-white/46 checked:bg-[rgb(35,131,226)] checked:border-[rgb(35,131,226)] relative
                      checked:after:content-[''] checked:after:absolute checked:after:top-[1px] checked:after:left-[5px] checked:after:w-1 checked:after:h-2 checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:transform checked:after:rotate-45"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDots[task.priority]}`} />
                    {radarInfo && (
                      <span className="text-base opacity-70">{radarInfo.radar.icon}</span>
                    )}
                    <span 
                      className={`text-white/81 font-medium ${task.completed ? 'line-through text-white/46' : ''} ${
                        isLinked ? 'cursor-pointer hover:text-[rgb(35,131,226)]' : ''
                      }`}
                      onClick={() => isLinked && onNavigateToSubject(task)}
                    >
                      {task.customName || task.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                    className={`px-2 py-1 rounded-md text-[13px] font-medium cursor-pointer transition-all duration-150 min-w-[120px] focus:outline-none border ${statusClasses[task.status]}`}
                  >
                    <option value="todo">À faire</option>
                    <option value="in-progress">En cours</option>
                    <option value="done">Terminé</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] text-white/60">
                    {formatTime(task.date)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/[0.055] rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-[rgb(35,131,226)] rounded-sm transition-all duration-300"
                        style={{ width: task.completed ? '100%' : task.status === 'in-progress' ? '50%' : '0%' }}
                      />
                    </div>
                    <span className="text-[13px] text-white/46 min-w-[40px] text-right">
                      {task.completed ? '100%' : task.status === 'in-progress' ? '50%' : '0%'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => onEditTask(task)}
                      className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L5.226 13.25a4.25 4.25 0 0 1-1.154.734l-2.72.906a.75.75 0 0 1-.95-.95l.906-2.72c.141-.424.415-.81.734-1.154l8.258-8.262zm1.414 1.06a.25.25 0 0 0-.353 0L10.53 5.119l.707.707 1.545-1.545a.25.25 0 0 0 0-.354l-.354-.353zM9.822 5.826 4.31 11.338a2.75 2.75 0 0 0-.475.748l-.51 1.53 1.53-.51a2.75 2.75 0 0 0 .748-.475l5.512-5.512-.707-.707z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md text-white/46 cursor-pointer transition-all duration-150 hover:bg-white/[0.055] hover:text-white/81"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6.5 5.5a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5zm4.25 0a.75.75 0 0 0-1.5 0v4.75a.75.75 0 0 0 1.5 0V5.5z" />
                        <path d="M12 2.75a.75.75 0 0 1 .75.75v.5h.75a.75.75 0 0 1 0 1.5h-.5v7a2.25 2.25 0 0 1-2.25 2.25h-5.5A2.25 2.25 0 0 1 3 12.5v-7h-.5a.75.75 0 0 1 0-1.5h.75v-.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75h1.5zm-7.5.75v-.25h5v.25h-5zm7 2.5h-7v7a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75v-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          
          {/* Add task row */}
          <tr 
            className="cursor-pointer hover:bg-white/[0.03] transition-colors duration-150"
            onClick={onAddTask}
          >
            <td></td>
            <td colSpan="5" className="px-4 py-3 text-white/46">
              <span className="flex items-center gap-1.5">
                <svg className="w-[14px] h-[14px]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
                </svg>
                Ajouter une tâche
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DailyView;
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

const WeeklyView = ({ onEditTask, onDeleteTask, onToggleTask, onAddTask }) => {
  const { getWeeklyTasks, radars } = useContext(AppContext);
  const tasks = getWeeklyTasks();
  
  const daysOfWeek = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ];
  
  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴'
  };
  
  const priorityLabels = {
    low: 'Pas de panique',
    medium: 'Important',
    high: 'Très important'
  };
  
  const statusLabels = {
    'todo': 'À faire',
    'in-progress': 'En cours',
    'done': 'Terminé'
  };
  
  const getTaskIcon = (task) => {
    if (task.tag && task.tag.radar) {
      const radar = radars.find(r => r.id === task.tag.radar);
      return radar?.icon || '📌';
    }
    return '📌';
  };
  
  const getTasksForDay = (dayKey) => {
    const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex + 1); // +1 car dimanche = 0
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.toDateString() === targetDate.toDateString();
    });
  };
  
  const formatDate = (dayKey) => {
    const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex + 1);
    
    return targetDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };
  
  const isToday = (dayKey) => {
    const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    const today = new Date();
    const dayOfWeek = today.getDay();
    return dayIndex === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  };
  
  return (
    <div className="bg-[rgb(32,32,32)] border border-[rgb(47,47,47)] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[rgb(37,37,37)] border-b border-[rgb(47,47,47)]">
            <th className="w-10 px-4 py-3"></th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46">Tâche</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[120px]">Statut</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[100px]">Jour</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[120px]">Date</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-[150px]">Progression</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium text-white/46 w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map(day => {
            const dayTasks = getTasksForDay(day.key);
            const hasNoTasks = dayTasks.length === 0;
            
            return (
              <React.Fragment key={day.key}>
                {/* Header du jour */}
                <tr className={`${isToday(day.key) ? 'bg-[rgb(35,131,226)]/5' : 'bg-[rgb(37,37,37)]'}`}>
                  <td colSpan="7" className="px-4 py-2 font-semibold text-white/81">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {day.label}
                        {isToday(day.key) && (
                          <span className="text-xs bg-[rgb(35,131,226)] text-white px-2 py-0.5 rounded-full">
                            Aujourd'hui
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-white/46">{formatDate(day.key)}</span>
                    </div>
                  </td>
                </tr>
                
                {/* Tâches du jour */}
                {dayTasks.length > 0 ? (
                  dayTasks.map(task => (
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
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                            task.priority === 'high' ? 'bg-[rgb(239,68,68)]' :
                            task.priority === 'medium' ? 'bg-[rgb(251,191,36)]' :
                            'bg-[rgb(34,197,94)]'
                          }`}></span>
                          <span className="text-base opacity-70">{getTaskIcon(task)}</span>
                          <span className={`font-medium text-white/81 cursor-pointer hover:text-[rgb(35,131,226)] transition-colors duration-150 ${
                            task.completed ? 'line-through text-white/46' : ''
                          }`}>
                            {task.customName || task.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) => onEditTask(task.id, { status: e.target.value })}
                          className={`px-2 py-1 rounded-md text-[13px] cursor-pointer transition-all duration-150 min-w-[110px] focus:outline-none
                            ${task.status === 'todo' ? 'bg-[rgb(239,68,68)]/10 border border-[rgb(239,68,68)]/20 text-[rgb(239,68,68)] hover:bg-[rgb(239,68,68)]/[0.13]' : ''}
                            ${task.status === 'in-progress' ? 'bg-[rgb(251,191,36)]/10 border border-[rgb(251,191,36)]/20 text-[rgb(251,191,36)] hover:bg-[rgb(251,191,36)]/[0.13]' : ''}
                            ${task.status === 'done' ? 'bg-[rgb(34,197,94)]/10 border border-[rgb(34,197,94)]/20 text-[rgb(34,197,94)] hover:bg-[rgb(34,197,94)]/[0.13]' : ''}
                          `}
                        >
                          <option value="todo">À faire</option>
                          <option value="in-progress">En cours</option>
                          <option value="done">Terminé</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white/81">{day.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white/60">{formatDate(day.key)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/[0.055] rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-[rgb(35,131,226)] rounded-sm transition-all duration-300"
                              style={{ width: task.status === 'done' ? '100%' : task.status === 'in-progress' ? '50%' : '0%' }}
                            />
                          </div>
                          <span className="text-sm text-white/46 min-w-[40px] text-right">
                            {task.status === 'done' ? '100%' : task.status === 'in-progress' ? '50%' : '0%'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => onEditTask(task.id)}
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
                  ))
                ) : (
                  <tr className="border-b border-white/[0.055]">
                    <td colSpan="7" className="px-4 py-8 text-center text-white/30">
                      Aucune tâche planifiée
                    </td>
                  </tr>
                )}
                
                {/* Ligne pour ajouter une tâche */}
                <tr
                  className="cursor-pointer hover:bg-white/[0.03] transition-colors duration-150"
                  onClick={() => onAddTask(day.key)}
                >
                  <td></td>
                  <td colSpan="6" className="px-4 py-3 text-white/46">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-[14px] h-[14px]" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
                      </svg>
                      Ajouter une tâche
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyView;
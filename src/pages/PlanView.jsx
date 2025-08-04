import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import DailyView from '../components/plan/DailyView';
import WeeklyView from '../components/plan/WeeklyView';
import TaskModal from '../components/plan/TaskModal';

const PlanView = () => {
  const navigate = useNavigate();
  const { tasks, addTask, updateTask, deleteTask, radars } = useContext(AppContext);
  const [currentView, setCurrentView] = useState('daily');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const handleAddTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };
  
  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };
  
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...taskData });
    } else {
      addTask(taskData);
    }
    setModalOpen(false);
  };
  
  const handleDeleteTask = (taskId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      deleteTask(taskId);
    }
  };
  
  const handleToggleTask = (taskId, completed) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        completed,
        status: completed ? 'done' : task.status === 'done' ? 'in-progress' : task.status
      });
    }
  };
  
  const handleUpdateTaskStatus = (taskId, status) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        status,
        completed: status === 'done'
      });
    }
  };
  
  const handleNavigateToSubject = (task) => {
    if (task.tag && task.tag.radar && task.tag.subject) {
      navigate(`/radar/${task.tag.radar}/subject/${task.tag.subject}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[rgb(25,25,25)]">
      {/* Header */}
      <header className="bg-[rgb(32,32,32)] border-b border-[rgb(47,47,47)] px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/46 hover:text-white/81 hover:bg-white/[0.055] rounded-md transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.78 12.78a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06L6.56 8l4.22 4.22a.75.75 0 0 1 0 1.06z" />
              </svg>
              Retour
            </button>
            
            <h1 className="text-2xl font-bold text-white/81">Plan</h1>
            
            <div className="flex bg-white/[0.055] border border-white/[0.094] rounded-md p-0.5">
              <button
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 ${
                  currentView === 'daily'
                    ? 'bg-white/10 text-white/81'
                    : 'text-white/46 hover:text-white/81'
                }`}
                onClick={() => setCurrentView('daily')}
              >
                Aujourd'hui
              </button>
              <button
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-150 ${
                  currentView === 'weekly'
                    ? 'bg-white/10 text-white/81'
                    : 'text-white/46 hover:text-white/81'
                }`}
                onClick={() => setCurrentView('weekly')}
              >
                Semaine
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 px-4 py-2 bg-[rgb(35,131,226)] text-white rounded-md text-sm font-medium hover:bg-[rgb(28,104,181)] transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2.74a.66.66 0 0 1 .66.66v3.94h3.94a.66.66 0 0 1 0 1.32H8.66v3.94a.66.66 0 0 1-1.32 0V8.66H3.4a.66.66 0 0 1 0-1.32h3.94V3.4A.66.66 0 0 1 8 2.74" />
              </svg>
              Nouvelle tâche
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="container max-w-[1200px] mx-auto px-6 py-6">
        {currentView === 'daily' ? (
          <DailyView
            tasks={tasks}
            radars={radars}
            onToggleTask={handleToggleTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onNavigateToSubject={handleNavigateToSubject}
          />
        ) : (
          <WeeklyView
            tasks={tasks}
            radars={radars}
            onToggleTask={handleToggleTask}
            onUpdateStatus={handleUpdateTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onNavigateToSubject={handleNavigateToSubject}
          />
        )}
      </div>
      
      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTask}
          editingTask={editingTask}
          radars={radars}
          isWeekly={currentView === 'weekly'}
        />
      )}
    </div>
  );
};

export default PlanView;
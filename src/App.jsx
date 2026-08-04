import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import TeamDirectory from './components/TeamDirectory';
import TaskModal from './components/TaskModal';
import GitHubSyncModal from './components/GitHubSyncModal';
import { INITIAL_TASKS, INITIAL_TEAM } from './data/initialData';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskpulse_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [team] = useState(INITIAL_TEAM);
  const [activeView, setActiveView] = useState('kanban'); // 'kanban', 'list', 'team'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('taskpulse_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Filter Tasks by Search & Priority
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  // Handlers
  const handleSaveTask = (taskData) => {
    if (taskToEdit) {
      setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
    } else {
      setTasks([taskData, ...tasks]);
    }
  };

  const handleMoveStage = (taskId, newStage) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, stage: newStage } : t));
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        onNewTask={handleOpenNewTask}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        onOpenGitModal={() => setIsGitModalOpen(true)}
      />

      <main className="main-content">
        <StatsOverview tasks={tasks} />

        {activeView === 'kanban' && (
          <KanbanBoard 
            tasks={filteredTasks}
            team={team}
            onEditTask={handleOpenEditTask}
            onMoveStage={handleMoveStage}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeView === 'list' && (
          <ListView 
            tasks={filteredTasks}
            team={team}
            onEditTask={handleOpenEditTask}
            onMoveStage={handleMoveStage}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeView === 'team' && (
          <TeamDirectory 
            team={team}
            tasks={tasks}
          />
        )}
      </main>

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        team={team}
      />

      <GitHubSyncModal 
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
      />
    </div>
  );
}

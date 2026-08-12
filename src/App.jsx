import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import TeamDirectory from './components/TeamDirectory';
import TaskModal from './components/TaskModal';
import LoginPage from './components/LoginPage';
import HRImportModal from './components/HRImportModal';
import FacultyReportCardModal from './components/FacultyReportCardModal';
import ChatThreadModal from './components/ChatThreadModal';
import ExtensionRequestModal from './components/ExtensionRequestModal';
import SubmissionReviewModal from './components/SubmissionReviewModal';
import { INITIAL_TASKS, INITIAL_TEAM } from './data/initialData';
import { ShieldAlert, Lock } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem('ctu_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ctu_tasks_data');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('ctu_team_data');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });

  const [activeView, setActiveView] = useState('kanban'); // 'kanban', 'list', 'team'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [activeExtensionTask, setActiveExtensionTask] = useState(null);
  const [activeReviewTask, setActiveReviewTask] = useState(null);
  const [isHRImportOpen, setIsHRImportOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ctu_tasks_data', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ctu_team_data', JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('ctu_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('ctu_auth_user');
    }
  }, [authUser]);

  // Handle Login & Logout
  const handleLogin = (user) => {
    setAuthUser(user);
    setActiveView('kanban');
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('ctu_auth_user');
  };

  // Handle Batch Import Execution
  const handleImportEmployees = (importedRows) => {
    const formattedMembers = importedRows.map((emp, idx) => {
      const initials = emp.displayName
        ? emp.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'EM';

      return {
        id: `usr-imp-${Date.now()}-${idx}`,
        employeeId: emp.empId || `CTU-EMP-${400 + idx}`,
        name: emp.displayName,
        role: emp.designation || 'Faculty Member',
        dept: emp.dept || 'General Academic Dept',
        email: emp.email || `${emp.displayName.toLowerCase().replace(/\s+/g, '.')}@ctu.edu.in`,
        avatar: initials,
        status: 'Active',
        source: 'EXCEL_IMPORT',
        hasAccount: false
      };
    });

    const existingEmpIds = new Set(team.map((m) => m.employeeId));
    const newUniqueMembers = formattedMembers.filter((m) => !existingEmpIds.has(m.employeeId));

    const updatedTeam = [...team, ...newUniqueMembers];
    setTeam(updatedTeam);
    localStorage.setItem('ctu_team_data', JSON.stringify(updatedTeam));
    setActiveView('team');
  };

  // If not logged in, render Login Page entry gate
  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentRole = authUser.role; // 'superAdmin', 'admin', 'hod', 'faculty', 'hr'

  // Role-Based Task Scoping Filter
  const roleScopedTasks = tasks.filter((t) => {
    if (currentRole === 'superAdmin' || currentRole === 'admin') {
      return true;
    }
    if (currentRole === 'hod' || currentRole === 'adminHead') {
      return true;
    }
    if (currentRole === 'faculty') {
      return t.assigneeId === authUser.id || t.assigneeId === 'usr-3' || (t.assigneeName && t.assigneeName.toLowerCase().includes('harmandeep'));
    }
    if (currentRole === 'hr') {
      return true;
    }
    return true;
  });

  // Filter Tasks by Search & Priority
  const filteredTasks = roleScopedTasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assigneeName && t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  // Handlers
  const handleSaveTask = (taskData) => {
    if (currentRole === 'faculty') {
      alert('Scope Rule: As a Faculty member, new task assignments are created by your Head of Department.');
      return;
    }
    if (taskToEdit) {
      setTasks(tasks.map(t => t.id === taskData.id ? taskData : t));
    } else {
      setTasks([taskData, ...tasks]);
    }
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = (t.subtasks || []).map((st) => st.id === subtaskId ? { ...st, done: !st.done } : st);
          const completedCount = updatedSubtasks.filter((s) => s.done).length;
          const progressPercent = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : 0;
          return {
            ...t,
            subtasks: updatedSubtasks,
            progressPercent,
            stage: t.stage === 'Assigned' ? 'In Progress' : t.stage,
            isIdle: false,
          };
        }
        return t;
      });
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      return updated;
    });
  };

  // Instant Stage Move Handler with functional state update and localStorage sync
  const handleMoveStage = (taskId, newStage) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          let progressPercent = t.progressPercent;
          let deadlineHealth = t.deadlineHealth;

          if (newStage === 'Accepted') {
            progressPercent = 100;
            deadlineHealth = 'Green';
          } else if (newStage === 'Submitted for Review') {
            progressPercent = 90;
          } else if (newStage === 'In Progress' && progressPercent === 0) {
            progressPercent = 30;
          }

          return {
            ...t,
            stage: newStage,
            progressPercent,
            deadlineHealth,
            isIdle: false,
          };
        }
        return t;
      });
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteTask = (taskId) => {
    if (currentRole === 'faculty') {
      alert('Scope Rule: Faculty members cannot delete assigned task records.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this task record?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleOpenNewTask = () => {
    if (currentRole === 'faculty') {
      alert('Scope Rule: As a Faculty member, task assignments are assigned by your Department Head.');
      return;
    }
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    if (currentRole === 'faculty') {
      alert('Faculty Scope: You can view task details, update subtasks, request deadline extensions, or chat with your Head.');
      return;
    }
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Chat message sending handler
  const handleSendMessage = (taskId, messageObj) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedMessages = [...(t.chatMessages || []), messageObj];
        return { ...t, chatMessages: updatedMessages };
      }
      return t;
    }));

    if (activeChatTask && activeChatTask.id === taskId) {
      setActiveChatTask({
        ...activeChatTask,
        chatMessages: [...(activeChatTask.chatMessages || []), messageObj]
      });
    }
  };

  // Extension request application handler
  const handleRequestExtension = (taskId, extensionObj) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const updatedExtensions = [...(t.extensions || []), extensionObj];
        return { ...t, extensions: updatedExtensions };
      }
      return t;
    }));
    alert('Deadline extension request submitted to your Head of Department!');
  };

  // Extension approval handler
  const handleApproveExtension = (taskId, extensionId, newDeadline) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          dueDate: newDeadline,
          deadlineHealth: 'Green',
          extensions: (t.extensions || []).map(e => e.id === extensionId ? { ...e, status: 'APPROVED' } : e),
        };
      }
      return t;
    }));
    alert(`Extension approved! New deadline set to ${newDeadline}`);
    setActiveExtensionTask(null);
  };

  // Submission submit & review handler
  const handleSubmitTask = (taskId, notes) => {
    handleMoveStage(taskId, 'Submitted for Review');
    alert('Task successfully submitted to your Head of Department for review!');
    setActiveReviewTask(null);
  };

  const handleReviewSubmission = (taskId, isApproved, feedback, newRestartDeadline) => {
    if (isApproved) {
      handleMoveStage(taskId, 'Accepted');
      alert('Task submission accepted & approved!');
    } else {
      setTasks((prevTasks) => {
        const updated = prevTasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              stage: 'Re-issued',
              dueDate: newRestartDeadline || t.dueDate,
              progressPercent: 30,
              review: { isApproved: false, feedback, newRestartDeadline },
            };
          }
          return t;
        });
        localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
        return updated;
      });
      alert('Task re-issued with revision feedback.');
    }
    setActiveReviewTask(null);
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
        authUser={authUser}
        onLogout={handleLogout}
        onOpenHRImport={() => setIsHRImportOpen(true)}
        onOpenReportCard={() => setIsReportCardOpen(true)}
      />

      <main className="main-content">
        {/* Role Scope Notice Banner */}
        <div style={{
          padding: '10px 16px',
          borderRadius: '10px',
          background: currentRole === 'faculty' ? '#fffbebf0' : '#f0f9ff',
          border: `1px solid ${currentRole === 'faculty' ? '#fde68a' : '#bae6fd'}`,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={15} color={currentRole === 'faculty' ? '#d97706' : '#0284c7'} />
            <span>
              <strong>Authenticated Role Scope: {authUser.roleTitle}</strong> • {
                currentRole === 'faculty'
                  ? 'Faculty Workspace: View self-assigned tasks, update subtasks, request extensions & view report card.'
                  : currentRole === 'hod'
                  ? 'Scoped to Computer Science & Engineering department tasks & faculty oversight.'
                  : currentRole === 'superAdmin'
                  ? 'Global University Access: Managing all schools, departments, RBAC & system configs.'
                  : 'Authorized access granted for current scope.'
              }
            </span>
          </div>

          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Logged in as {authUser.name}
          </span>
        </div>

        <StatsOverview tasks={filteredTasks} currentRole={currentRole} />

        {activeView === 'kanban' && (
          <KanbanBoard 
            tasks={filteredTasks}
            team={team}
            onToggleSubtask={handleToggleSubtask}
            onMoveStage={handleMoveStage}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenChat={(task) => setActiveChatTask(task)}
            onOpenExtensionModal={(task) => setActiveExtensionTask(task)}
            onOpenReviewModal={(task) => setActiveReviewTask(task)}
            currentRole={currentRole}
          />
        )}

        {activeView === 'list' && (
          <ListView 
            tasks={filteredTasks}
            team={team}
            onToggleSubtask={handleToggleSubtask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenChat={(task) => setActiveChatTask(task)}
            onOpenExtensionModal={(task) => setActiveExtensionTask(task)}
            onOpenReviewModal={(task) => setActiveReviewTask(task)}
            currentRole={currentRole}
          />
        )}

        {activeView === 'team' && (
          <TeamDirectory 
            team={team} 
            tasks={tasks}
            currentRole={currentRole}
            onOpenHRImport={() => setIsHRImportOpen(true)}
          />
        )}
      </main>

      {/* Task Creation / Edit Modal */}
      {isTaskModalOpen && (
        <TaskModal 
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          taskToEdit={taskToEdit}
          team={team}
        />
      )}

      {/* Bulk CSV/XLSX Employee Import Modal */}
      {isHRImportOpen && (
        <HRImportModal 
          isOpen={isHRImportOpen}
          onClose={() => setIsHRImportOpen(false)}
          onImportSuccess={handleImportEmployees}
        />
      )}

      {/* Faculty Performance Report Card Modal */}
      {isReportCardOpen && (
        <FacultyReportCardModal 
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          authUser={authUser}
          tasks={tasks}
        />
      )}

      {/* Task Chat Thread Modal */}
      {activeChatTask && (
        <ChatThreadModal
          isOpen={!!activeChatTask}
          onClose={() => setActiveChatTask(null)}
          task={activeChatTask}
          authUser={authUser}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Extension Request Modal */}
      {activeExtensionTask && (
        <ExtensionRequestModal
          isOpen={!!activeExtensionTask}
          onClose={() => setActiveExtensionTask(null)}
          task={activeExtensionTask}
          authUser={authUser}
          onRequestExtension={handleRequestExtension}
          onApproveExtension={handleApproveExtension}
        />
      )}

      {/* Task Submission / Review Modal */}
      {activeReviewTask && (
        <SubmissionReviewModal
          isOpen={!!activeReviewTask}
          onClose={() => setActiveReviewTask(null)}
          task={activeReviewTask}
          authUser={authUser}
          onSubmitTask={handleSubmitTask}
          onReviewSubmission={handleReviewSubmission}
        />
      )}
    </div>
  );
}

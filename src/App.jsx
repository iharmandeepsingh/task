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
import AnalyticsDashboardModal from './components/AnalyticsDashboardModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import CalendarView from './components/CalendarView';
import TagFilterBar from './components/TagFilterBar';
import { INITIAL_TASKS, INITIAL_TEAM } from './data/initialData';
import { ShieldAlert, Lock } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem('ctu_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ctu_tasks_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [deletedEmployeeIds, setDeletedEmployeeIds] = useState(() => {
    const saved = localStorage.getItem('ctu_deleted_employee_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('ctu_team_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_TEAM;
  });

  const [activeView, setActiveView] = useState('kanban'); // 'kanban', 'list', 'calendar', 'team'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL', 'INCOMING', 'OUTGOING'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ctu_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ctu_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [activeExtensionTask, setActiveExtensionTask] = useState(null);
  const [activeReviewTask, setActiveReviewTask] = useState(null);
  const [isHRImportOpen, setIsHRImportOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  // Sync team state to server and localStorage
  useEffect(() => {
    localStorage.setItem('ctu_team_data', JSON.stringify(team));
    fetch('/api/sync-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    }).catch(() => {});
  }, [team]);

  // Sync tasks state to server and localStorage
  useEffect(() => {
    localStorage.setItem('ctu_tasks_data', JSON.stringify(tasks));
    fetch('/api/sync-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    }).catch(() => {});
  }, [tasks]);

  // Auto-fetch latest team & tasks from shared server on mount and every 4 seconds
  useEffect(() => {
    const syncFromCloud = () => {
      fetch('/api/sync-team')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.team) && data.team.length > 0) {
            setTeam((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.team)) {
                localStorage.setItem('ctu_team_data', JSON.stringify(data.team));
                return data.team;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      fetch('/api/sync-tasks')
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.tasks)) {
            setTasks((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.tasks)) {
                localStorage.setItem('ctu_tasks_data', JSON.stringify(data.tasks));
                return data.tasks;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 4000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    if (authUser) {
      localStorage.setItem('ctu_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('ctu_auth_user');
    }
  }, [authUser]);

  const handleLogin = (userObj) => {
    setAuthUser(userObj);
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  // Handle Batch Import Execution with Smart Upsert Merge
  const handleImportEmployees = (importedRows, category = 'faculty') => {
    const formattedMembers = importedRows.map((emp, idx) => {
      const names = (emp.displayName || 'Employee').split(' ');
      const initials = names.map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'EM';
      const cleanEmpId = emp.empId || `26${100 + idx}`;

      return {
        id: `usr-imp-${Date.now()}-${idx}`,
        employeeId: cleanEmpId,
        name: emp.displayName || 'Staff Member',
        role: emp.designation || (category === 'faculty' ? 'Faculty Member' : 'Administrative Staff'),
        category: category === 'faculty' ? 'Faculty' : 'Admin',
        dept: emp.dept || (category === 'faculty' ? 'Computer Science & Engineering' : 'University Administration'),
        email: emp.email || `${(emp.displayName || 'staff').toLowerCase().replace(/\s+/g, '.')}@ctu.edu.in`,
        avatar: initials,
        status: 'Active',
        source: 'EXCEL_IMPORT',
        hasAccount: true
      };
    });

    setTeam((prevTeam) => {
      const teamMap = new Map();
      prevTeam.forEach(m => teamMap.set(m.employeeId, m));

      // Smart Upsert: add new members or update existing
      formattedMembers.forEach(newMem => {
        teamMap.set(newMem.employeeId, newMem);
      });

      const updated = Array.from(teamMap.values());
      localStorage.setItem('ctu_team_data', JSON.stringify(updated));
      return updated;
    });

    setActiveView('team');
  };

  // Delete Faculty / Admin Employee Record Handler
  const handleDeleteEmployee = (memberId) => {
    const targetMember = team.find(m => m.id === memberId || m.employeeId === memberId);
    const id1 = (targetMember?.id || memberId).toLowerCase();
    const id2 = (targetMember?.employeeId || memberId).toLowerCase();

    setDeletedEmployeeIds((prevDeleted) => {
      const updatedDeleted = Array.from(new Set([...prevDeleted, id1, id2]));
      localStorage.setItem('ctu_deleted_employee_ids', JSON.stringify(updatedDeleted));
      return updatedDeleted;
    });

    setTeam((prevTeam) => {
      const updated = prevTeam.filter((m) => {
        const mId = (m.id || '').toLowerCase();
        const mEmpId = (m.employeeId || '').toLowerCase();
        return mId !== id1 && mEmpId !== id2 && mId !== id2 && mEmpId !== id1;
      });

      localStorage.setItem('ctu_team_data', JSON.stringify(updated));

      fetch('/api/sync-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});

    });
  };

  // Change Password Handler with Old Password Verification
  const handlePasswordChanged = (empIdOrId, newPassword) => {
    setTeam((prevTeam) => {
      const updated = prevTeam.map((m) => {
        if ((m.employeeId && m.employeeId === empIdOrId) || (m.id && m.id === empIdOrId)) {
          return { ...m, password: newPassword };
        }
        return m;
      });

      localStorage.setItem('ctu_team_data', JSON.stringify(updated));

      fetch('/api/sync-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});

      return updated;
    });
  };

  // If not logged in, render Login Page entry gate
  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentRole = authUser.role; // 'superAdmin', 'admin', 'hod', 'faculty', 'hr'

  // Role-Based Task Scoping Filter (Strict RBAC Scoping)
  const roleScopedTasks = tasks.filter((t) => {
    const authEmpId = (authUser?.employeeId || '').toLowerCase();
    const authId = (authUser?.id || '').toLowerCase();
    const authName = (authUser?.name || '').toLowerCase().trim();

    const isSuperAdminAccount = 
      currentRole === 'superAdmin' || 
      authEmpId === '10001' || 
      authId === 'usr-10001' ||
      ['24051', '17572', '10001', '001', 'usr-0', 'usr-24051', 'usr-17572', 'usr-10001'].includes(authEmpId) ||
      ['24051', '17572', '10001', '001', 'usr-0', 'usr-24051', 'usr-17572', 'usr-10001'].includes(authId);

    // 1. Super Admin Executive Leadership: Full permission to view ALL tasks across CT University
    if (isSuperAdminAccount) {
      return true;
    }

    const taskAssigneeId = (t.assigneeId || '').toLowerCase();
    const taskAssigneeName = (t.assigneeName || '').toLowerCase().trim();
    const taskCreatorName = (t.creatorName || '').toLowerCase().trim();
    const taskCreatorId = (t.creatorId || '').toLowerCase().trim();

    // 2. Administrators, HODs, Deans & Faculty (Non-SuperAdmin):
    // Can ONLY view tasks assigned TO them (Incoming) OR assigned BY them (Delegated)
    const isCreatorOfTask = 
      (authId && taskCreatorId === authId) ||
      (authEmpId && taskCreatorId === authEmpId) ||
      (authName && taskCreatorName.includes(authName)) ||
      (authName && authName.includes(taskCreatorName));

    const isAssignedToUser = 
      (authId && taskAssigneeId === authId) ||
      (authEmpId && taskAssigneeId === authEmpId) ||
      (authName && taskAssigneeName.includes(authName)) ||
      (authName && authName.includes(taskAssigneeName));

    // STRICT ISOLATION: Hide any task that is neither assigned TO nor created BY this user
    return isCreatorOfTask || isAssignedToUser;
  });

  // Filter Tasks by Search, Priority & Tag
  const filteredTasks = roleScopedTasks.filter((t) => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assigneeName && t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    const matchesTag = selectedTag === 'ALL' || (Array.isArray(t.tags) && t.tags.includes(selectedTag));

    // Directional Task Filtering (Incoming vs Delegated)
    let matchesDirection = true;
    if (filterDirection === 'INCOMING') {
      matchesDirection = authUser?.name === t.assigneeName || authUser?.id === t.assigneeId || authUser?.employeeId === t.assigneeId;
    } else if (filterDirection === 'OUTGOING') {
      matchesDirection = authUser?.name === t.creatorName || authUser?.id === t.creatorId || authUser?.employeeId === t.creatorId;
    }

    return matchesSearch && matchesPriority && matchesTag && matchesDirection;
  });

  // Handlers
  const handleSaveTask = (taskData) => {
    if (currentRole === 'faculty') {
      alert('Scope Rule: As a Faculty member, new task assignments are created by your Head of Department.');
      return;
    }

    setTasks((prevTasks) => {
      let updated;
      if (taskToEdit) {
        updated = prevTasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
      } else {
        const newTask = {
          ...taskData,
          creatorName: authUser?.name || 'University Admin',
          creatorId: authUser?.id || authUser?.employeeId || 'admin',
          creatorRole: authUser?.roleTitle || 'University Administrator',
          departmentName: authUser?.dept || taskData.departmentName || 'School of Engineering'
        };
        updated = [newTask, ...prevTasks];
      }
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      return updated;
    });

    setIsTaskModalOpen(false);
    setTaskToEdit(null);
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
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const isAssignee = authUser?.name === targetTask.assigneeName || authUser?.id === targetTask.assigneeId || authUser?.employeeId === targetTask.assigneeId;
      const isCreator = authUser?.name === targetTask.creatorName || authUser?.id === targetTask.creatorId || authUser?.employeeId === targetTask.creatorId;
      const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

      // Security Guard: Assignees cannot self-accept or self-review
      if (isAssignee && !isCreator && !isSuperAdmin10001 && ['Under Review', 'Re-issued', 'Accepted'].includes(newStage)) {
        alert(`🛑 Authorization Denied: As the Assignee of this task, you can move work to "In Progress" or "Submitted for Review". Only the Assigner (${targetTask.creatorName || 'Super Admin'}) can mark tasks as Under Review, Re-issued, or Accepted.`);
        return;
      }
    }

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
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const isCreator = authUser?.name === targetTask.creatorName || authUser?.id === targetTask.creatorId || authUser?.employeeId === targetTask.creatorId;
      const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

      if (!isCreator && !isSuperAdmin10001) {
        alert(`🛑 Authorization Denied: You cannot delete tasks assigned to you. Only the Assigner (${targetTask.creatorName || 'Super Admin'}) who created this task can delete it.`);
        return;
      }
    }

    if (window.confirm('Are you sure you want to delete this task record?')) {
      setTasks((prevTasks) => {
        const updated = prevTasks.filter(t => t.id !== taskId);
        localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
        return updated;
      });
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
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          const updatedExtensions = [...(t.extensions || []), extensionObj];
          return { ...t, extensions: updatedExtensions };
        }
        return t;
      });
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      return updated;
    });
    alert('Deadline extension request submitted to your Head of Department!');
  };

  // Extension approval handler
  const handleApproveExtension = (taskId, extensionId, newDeadline) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            dueDate: newDeadline,
            deadlineHealth: 'Green',
            extensions: (t.extensions || []).map(e => e.id === extensionId ? { ...e, status: 'APPROVED' } : e),
          };
        }
        return t;
      });
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      return updated;
    });
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
        tasks={tasks}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onOpenHRImport={() => setIsHRImportOpen(true)}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenChangePassword={() => setIsChangePassOpen(true)}
        onOpenChat={(task) => setActiveChatTask(task)}
        onOpenExtensionModal={(task) => setActiveExtensionTask(task)}
        onOpenReviewModal={(task) => setActiveReviewTask(task)}
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

        {/* 🏷️ Quick Tag & Directional Assignment Filter Pills */}
        <TagFilterBar
          tasks={roleScopedTasks}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          filterDirection={filterDirection}
          onSelectDirection={setFilterDirection}
          authUser={authUser}
          currentRole={currentRole}
        />

        {activeView === 'kanban' && (
          <KanbanBoard 
            tasks={filteredTasks}
            team={team}
            authUser={authUser}
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
            authUser={authUser}
            onToggleSubtask={handleToggleSubtask}
            onEditTask={handleOpenEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenChat={(task) => setActiveChatTask(task)}
            onOpenExtensionModal={(task) => setActiveExtensionTask(task)}
            onOpenReviewModal={(task) => setActiveReviewTask(task)}
            currentRole={currentRole}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView 
            tasks={filteredTasks}
            onEditTask={handleOpenEditTask}
            onOpenChat={(task) => setActiveChatTask(task)}
            onMoveStage={handleMoveStage}
          />
        )}

        {activeView === 'team' && (
          currentRole !== 'faculty' ? (
            <TeamDirectory 
              team={team} 
              tasks={tasks}
              currentRole={currentRole}
              authUser={authUser}
              onOpenHRImport={() => setIsHRImportOpen(true)}
              onDeleteEmployee={handleDeleteEmployee}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #fee2e2', color: '#dc2626', fontWeight: '700', fontSize: '14px', marginTop: '20px' }}>
              ⚠️ Access Restricted: Faculty accounts do not have authorization to view Employee Master Directory or HR Data.
            </div>
          )
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
          team={team}
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

      {/* NAAC Analytics & Official Exporter Modal */}
      {isAnalyticsOpen && (
        <AnalyticsDashboardModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          tasks={tasks}
          team={team}
          authUser={authUser}
        />
      )}

      {/* Change Password Modal */}
      {isChangePassOpen && (
        <ChangePasswordModal
          isOpen={isChangePassOpen}
          onClose={() => setIsChangePassOpen(false)}
          authUser={authUser}
          team={team}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
    </div>
  );
}

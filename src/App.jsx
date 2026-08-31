import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import ForwardTaskModal from './components/ForwardTaskModal';
import AnalyticsDashboardModal from './components/AnalyticsDashboardModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import TagFilterBar from './components/TagFilterBar';
import SuperAdminVerification from './components/SuperAdminVerification';
import MobileBottomNav from './components/MobileBottomNav';
import MobileMoreSheet from './components/MobileMoreSheet';
import TaskActionSheet from './components/TaskActionSheet';
import FilterBottomSheet from './components/FilterBottomSheet';
import { INITIAL_TASKS, INITIAL_TEAM } from './data/initialData';
import { ShieldAlert, Lock, Award } from 'lucide-react';
import { getApiUrl } from './utils/apiBase';

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem('ctu_auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState(() => {
    const TASKS_VERSION = 'v5';
    const savedVersion = localStorage.getItem('ctu_tasks_version');
    if (savedVersion !== TASKS_VERSION) {
      localStorage.removeItem('ctu_tasks_data');
      localStorage.setItem('ctu_tasks_version', TASKS_VERSION);
    }
    const saved = localStorage.getItem('ctu_tasks_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [deletedEmployeeIds, setDeletedEmployeeIds] = useState(() => {
    const saved = localStorage.getItem('ctu_deleted_employee_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const [team, setTeam] = useState(() => {
    const TEAM_VERSION = 'v5'; // bump this to force clean cache reset across all users
    const savedVersion = localStorage.getItem('ctu_team_version');

    // If version mismatch, clear stale localStorage so INITIAL_TEAM is authoritative
    if (savedVersion !== TEAM_VERSION) {
      localStorage.removeItem('ctu_team_data');
      localStorage.setItem('ctu_team_version', TEAM_VERSION);
    }

    const saved = localStorage.getItem('ctu_team_data');
    const teamMap = new Map();

    // Start with full base roster — this has correct category, dept, etc.
    INITIAL_TEAM.forEach(m => teamMap.set(m.employeeId || m.id, m));


    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(savedMember => {
            const key = savedMember.employeeId || savedMember.id;
            const base = teamMap.get(key); // existing from INITIAL_TEAM
            // Merge: use saved data but fall back to INITIAL_TEAM for missing fields like category/dept
            teamMap.set(key, {
              ...(base || {}),       // base fields (category, dept, etc.)
              ...savedMember,        // saved overrides (name edits, imports, etc.)
              // Always preserve category and dept from INITIAL_TEAM if savedMember is missing them
              category: savedMember.category || base?.category || 'Faculty',
              dept: savedMember.dept || base?.dept || 'School of Engineering & Technology',
            });
          });
        }
      } catch (e) {}
    }

    const merged = Array.from(teamMap.values());
    try { localStorage.setItem('ctu_team_data', JSON.stringify(merged)); } catch(e) {}
    return merged;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Derive activeView from current URL path — keeps all existing conditional rendering working
  const pathToView = {
    '/':               'kanban',
    '/dashboard':      'kanban',
    '/tasks':          'list',
    '/staff-records':  'staff',
    '/team':           'staff',
    '/verification':   'staff',
  };
  const activeView = pathToView[location.pathname] || 'kanban';

  // Drop-in replacement for setActiveView — navigate to the matching URL instead
  const setActiveView = (view) => {
    const viewToPath = {
      'kanban':       '/',
      'list':         '/tasks',
      'staff':        '/staff-records',
      'team':         '/staff-records',
      'verification': '/staff-records',
    };
    navigate(viewToPath[view] || '/');
  };

  const [verificationRecordsState, setVerificationRecordsState] = useState(() => {
    try {
      const saved = localStorage.getItem('ctu_staff_verification');
      const parsed = JSON.parse(saved || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [filterDirection, setFilterDirection] = useState('ALL'); // 'ALL', 'INCOMING', 'OUTGOING'
  const [filterDept, setFilterDept] = useState('ALL'); // Department filter for admin/superAdmin
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

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [mobileActionTask, setMobileActionTask] = useState(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeChatTask, setActiveChatTask] = useState(null);
  const [activeExtensionTask, setActiveExtensionTask] = useState(null);
  const [activeReviewTask, setActiveReviewTask] = useState(null);
  const [activeForwardTask, setActiveForwardTask] = useState(null);
  const [isHRImportOpen, setIsHRImportOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);

  // Sync team state to localStorage (API sync happens in handleImportEmployees for new imports only)
  useEffect(() => {
    localStorage.setItem('ctu_team_data', JSON.stringify(team));
  }, [team]);

  // Sync tasks state to server and localStorage
  useEffect(() => {
    localStorage.setItem('ctu_tasks_data', JSON.stringify(tasks));
    fetch(getApiUrl('/api/sync-tasks'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    }).catch(() => {});
  }, [tasks]);


  // Auto-fetch latest team & tasks from shared server on mount and every 4 seconds
  useEffect(() => {
    const syncFromCloud = () => {
      const deletedIds = (() => {
        try { return JSON.parse(localStorage.getItem('ctu_deleted_employee_ids') || '[]'); } catch { return []; }
      })();

      // 1. Sync Staff Verification Records from MongoDB
      fetch(getApiUrl('/api/sync-verification'))
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.records) && data.records.length > 0) {
            setVerificationRecordsState(data.records);
            try { localStorage.setItem('ctu_staff_verification', JSON.stringify(data.records)); } catch (e) {}

            // NOTE: Do NOT merge verification records into team here.
            // Pre-Authorized faculty should remain in ctu_staff_verification only.
            // They move to team (Active) only when they self-register via LoginPage.

          }
        })
        .catch(() => {});

      // 2. Sync Team Data from MongoDB
      fetch(getApiUrl('/api/sync-team'))
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.team) && data.team.length > 0) {
            setTeam((prev) => {
              const merged = new Map();
              data.team.forEach(m => {
                const key = (m.employeeId || m.id || '').toLowerCase();
                if (!deletedIds.includes(key)) {
                  merged.set(m.employeeId || m.id, m);
                }
              });
              prev.forEach(m => {
                const key = (m.employeeId || m.id || '').toLowerCase();
                const mapKey = m.employeeId || m.id;
                if (!merged.has(mapKey) && !deletedIds.includes(key)) {
                  merged.set(mapKey, m);
                }
              });
              const mergedArr = Array.from(merged.values());
              if (JSON.stringify(prev) !== JSON.stringify(mergedArr)) {
                try { localStorage.setItem('ctu_team_data', JSON.stringify(mergedArr)); } catch(e) {}
                return mergedArr;
              }
              return prev;
            });
          }
        })
        .catch(() => {});

      // 3. Sync Tasks from MongoDB
      fetch(getApiUrl('/api/sync-tasks'))
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.tasks) && data.tasks.length > 0) {
            setTasks((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data.tasks)) {
                try { localStorage.setItem('ctu_tasks_data', JSON.stringify(data.tasks)); } catch (e) {}
                return data.tasks;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 5000);
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

  // Handle Batch Import Execution with Smart Upsert Merge & MongoDB Sync
  const handleImportEmployees = async (importedRows, category = 'faculty') => {
    if (!Array.isArray(importedRows) || importedRows.length === 0) return;

    const verificationRecords = importedRows.map((emp, idx) => {
      const isFacultyCat = category === 'faculty' || emp.targetRole === 'Faculty';
      return {
        staffId: emp.empId || `26${100 + idx}`,
        name: emp.displayName || 'Staff Member',
        email: emp.email || '',
        phone: emp.phone || '',
        department: emp.dept || (isFacultyCat ? 'School of Engineering & Technology' : 'University Administration'),
        category: isFacultyCat ? 'Faculty' : 'Admin',
        role: emp.designation || (isFacultyCat ? 'Faculty Member' : 'Administrative Staff'),
        status: 'Pre-Authorized',
        uploadedAt: new Date().toISOString()
      };
    });

    // 1. Update Verification LocalStorage AND React State
    try {
      const existingVer = JSON.parse(localStorage.getItem('ctu_staff_verification') || '[]');
      const verMap = new Map();
      existingVer.forEach(v => v?.staffId && verMap.set(String(v.staffId).toLowerCase(), v));
      verificationRecords.forEach(v => v?.staffId && verMap.set(String(v.staffId).toLowerCase(), v));
      const merged = Array.from(verMap.values());
      localStorage.setItem('ctu_staff_verification', JSON.stringify(merged));
      setVerificationRecordsState(merged);
    } catch (e) {}

    // 2. Persist to MongoDB verification collection only (NOT team)
    try {
      await fetch(getApiUrl('/api/sync-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: verificationRecords })
      });
    } catch (e) {
      console.warn("MongoDB sync-verification upload:", e);
    }

    // 3. Fire event to trigger re-fetch in SuperAdminVerification
    window.dispatchEvent(new Event('ctu_records_updated'));

    setActiveView('staff');
  };


  // Delete Faculty / Admin Employee Record Handler
  const handleDeleteEmployee = (memberId) => {
    const targetMember = team.find(m => m.id === memberId || m.employeeId === memberId);
    const id1 = (targetMember?.id || memberId).toLowerCase();
    const id2 = (targetMember?.employeeId || memberId).toLowerCase();

    // Track deleted IDs so sync loop never re-adds them
    const newDeletedIds = Array.from(new Set([...deletedEmployeeIds, id1, id2]));
    setDeletedEmployeeIds(newDeletedIds);
    localStorage.setItem('ctu_deleted_employee_ids', JSON.stringify(newDeletedIds));

    // Also delete from MongoDB verification collection
    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', staffId: targetMember?.employeeId || memberId })
    }).catch(() => {});

    setTeam((prevTeam) => {
      const updated = prevTeam.filter((m) => {
        const mId = (m.id || '').toLowerCase();
        const mEmpId = (m.employeeId || '').toLowerCase();
        return mId !== id1 && mEmpId !== id2 && mId !== id2 && mEmpId !== id1;
      });

      localStorage.setItem('ctu_team_data', JSON.stringify(updated));

      // Push the updated team (without deleted member) to MongoDB immediately
      fetch(getApiUrl('/api/sync-team'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});

      return updated;
    });
  };

  // Bulk Delete Employee Records Handler
  const handleBulkDeleteEmployees = (targetIds) => {
    if (!Array.isArray(targetIds) || targetIds.length === 0) return;
    const targetSet = new Set(targetIds.map(id => String(id).toLowerCase().trim()));

    const newDeletedIds = Array.from(new Set([...deletedEmployeeIds, ...targetSet]));
    setDeletedEmployeeIds(newDeletedIds);
    localStorage.setItem('ctu_deleted_employee_ids', JSON.stringify(newDeletedIds));

    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk-delete', staffIds: targetIds })
    }).catch(() => {});

    setTeam((prevTeam) => {
      const updated = prevTeam.filter((m) => {
        const mId = (m.id || '').toLowerCase();
        const mEmpId = (m.employeeId || '').toLowerCase();
        return !targetSet.has(mId) && !targetSet.has(mEmpId);
      });

      localStorage.setItem('ctu_team_data', JSON.stringify(updated));

      fetch(getApiUrl('/api/sync-team'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});

      return updated;
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

      fetch(getApiUrl('/api/sync-team'), {
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

  // Role-Based Task Scoping Filter (Strict ID-First, Exact-Name Fallback)
  const roleScopedTasks = tasks.filter((t) => {
    const authEmpId = (authUser?.employeeId || '').trim();
    const authId = (authUser?.id || '').trim();
    const authName = (authUser?.name || '').trim().toLowerCase();

    const taskAssigneeId = (t.assigneeId || '').trim();
    const taskAssigneeName = (t.assigneeName || '').trim().toLowerCase();
    const taskCreatorId = (t.creatorId || '').trim();
    const taskCreatorName = (t.creatorName || '').trim().toLowerCase();

    const taskDelegatedById = (t.delegatedById || '').trim();
    const taskDelegatedByEmpId = (t.delegatedByEmpId || '').trim();
    const taskDelegatedByName = (t.delegatedByName || '').trim().toLowerCase();

    const taskOriginalAssigneeId = (t.originalAssigneeId || '').trim();
    const taskOriginalAssigneeEmpId = (t.originalAssigneeEmpId || '').trim();
    const taskOriginalAssigneeName = (t.originalAssigneeName || '').trim().toLowerCase();

    // Helper: Strict match — ID (primary) or EXACT full name (fallback only)
    const matchesAsAssignee =
      (authId && taskAssigneeId === authId) ||
      (authEmpId && taskAssigneeId === authEmpId) ||
      (authName && taskAssigneeName === authName);

    const matchesAsCreator =
      (authId && taskCreatorId === authId) ||
      (authEmpId && taskCreatorId === authEmpId) ||
      (authName && taskCreatorName === authName);

    const matchesAsDelegator =
      (authId && taskDelegatedById === authId) ||
      (authEmpId && taskDelegatedByEmpId === authEmpId) ||
      (authName && taskDelegatedByName === authName);

    const matchesAsOriginalAssignee =
      (authId && taskOriginalAssigneeId === authId) ||
      (authEmpId && taskOriginalAssigneeEmpId === authEmpId) ||
      (authName && taskOriginalAssigneeName === authName);

    // 🎓 PHASE 1: Faculty — can ONLY view tasks assigned strictly TO them
    if (currentRole === 'faculty') {
      return matchesAsAssignee;
    }

    // 👑 PHASE 3: Executive Super Admin — can view ALL tasks across CT University
    const isSuperAdminAccount =
      currentRole === 'superAdmin' ||
      ['24051', '17572', '10001', '001'].includes(authEmpId) ||
      ['usr-0', 'usr-24051', 'usr-17572', 'usr-10001'].includes(authId);

    if (isSuperAdminAccount) {
      return true;
    }

    // 🏛️ PHASE 2: University Administrator / HOD — ONLY their direct assignment chain:
    // ✅ Tasks assigned TO them (Incoming from Super Admin or from another Admin)
    // ✅ Tasks assigned BY them (Delegated to Faculty or to another Admin)
    // ✅ Tasks FORWARDED/DELEGATED by them to faculty
    // 🚫 Tasks between other Admins and other Faculty/Admins are HIDDEN
    return matchesAsCreator || matchesAsAssignee || matchesAsDelegator || matchesAsOriginalAssignee;
  });



  // Filter Tasks by Search, Priority, Tag & Department
  const filteredTasks = roleScopedTasks.filter((t) => {
    if (!t) return false;
    const q = (searchQuery || '').toLowerCase();
    const titleStr = (t.title || '').toLowerCase();
    const descStr = (t.description || '').toLowerCase();
    const assigneeStr = (t.assigneeName || '').toLowerCase();

    const matchesSearch = 
      !q ||
      titleStr.includes(q) ||
      descStr.includes(q) ||
      assigneeStr.includes(q);

    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;

    const matchesTag = selectedTag === 'ALL' || (Array.isArray(t.tags) && t.tags.includes(selectedTag));

    // Department filter — only active for admin/superAdmin roles
    const matchesDept = 
      filterDept === 'ALL' ||
      currentRole === 'faculty' || // faculty sees all their own tasks regardless
      (t.departmentName || '').toLowerCase().includes(filterDept.toLowerCase());

    // Directional Task Filtering (Incoming vs Delegated)
    let matchesDirection = true;
    if (filterDirection === 'INCOMING') {
      matchesDirection = authUser?.name === t.assigneeName || authUser?.id === t.assigneeId || authUser?.employeeId === t.assigneeId;
    } else if (filterDirection === 'OUTGOING') {
      matchesDirection = authUser?.name === t.creatorName || authUser?.id === t.creatorId || authUser?.employeeId === t.creatorId;
    }

    return matchesSearch && matchesPriority && matchesTag && matchesDept && matchesDirection;
  }).sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.delegatedAt || a.createdAt || a.dueDate || 0).getTime();
    const timeB = new Date(b.updatedAt || b.delegatedAt || b.createdAt || b.dueDate || 0).getTime();
    return timeB - timeA;
  });

  // Handlers
  const handleSaveTask = (taskData) => {
    if (currentRole === 'faculty') {
      alert('Scope Rule: As a Faculty member, new task assignments are created by your Head of Department.');
      return;
    }

    setTasks((prevTasks) => {
      let updated;
      const nowIso = new Date().toISOString();
      if (taskToEdit) {
        updated = prevTasks.map(t => t.id === taskData.id ? { ...t, ...taskData, updatedAt: nowIso } : t);
      } else {
        const newTask = {
          ...taskData,
          createdAt: nowIso,
          updatedAt: nowIso,
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

  // Forward Task Handler (Admin forwards tasks to teaching faculty)
  const handleForwardTask = (payload) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === payload.taskId) {
          const forwardTag = 'Forwarded';
          const existingTags = Array.isArray(t.tags) ? t.tags : [];
          const updatedTags = existingTags.includes(forwardTag) ? existingTags : [...existingTags, forwardTag];

          const systemMessage = {
            id: `msg-${Date.now()}`,
            senderName: authUser?.name || 'Admin',
            senderRole: authUser?.roleTitle || 'University Administrator',
            text: `↗️ Task forwarded to ${payload.newAssigneeName} by ${authUser?.name || 'Admin'}${payload.delegationNotes ? ': "' + payload.delegationNotes + '"' : ''}`,
            timestamp: new Date().toISOString(),
            isSystem: true
          };

          return {
            ...t,
            originalAssigneeId: t.originalAssigneeId || t.assigneeId,
            originalAssigneeEmpId: t.originalAssigneeEmpId || t.assigneeEmpId || t.assigneeId,
            originalAssigneeName: t.originalAssigneeName || t.assigneeName,
            originalAssigneeRole: t.originalAssigneeRole || t.assigneeRole || 'University Administrator',
            isDelegated: true,
            assigneeId: payload.newAssigneeId,
            assigneeEmpId: payload.newAssigneeEmpId,
            assigneeName: payload.newAssigneeName,
            assigneeDept: payload.newAssigneeDept,
            delegatedById: payload.delegatedById,
            delegatedByEmpId: payload.delegatedByEmpId,
            delegatedByName: payload.delegatedByName,
            delegatedByRole: payload.delegatedByRole,
            delegatedAt: new Date().toISOString(),
            delegationNotes: payload.delegationNotes,
            dueDate: payload.updatedDueDate || t.dueDate,
            dueTime: payload.updatedDueTime || t.dueTime,
            stage: 'Assigned',
            tags: updatedTags,
            chatMessages: [...(t.chatMessages || []), systemMessage]
          };

        }
        return t;
      });

      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      fetch(getApiUrl('/api/sync-tasks'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});


      return updated;
    });

    alert(`✅ Task successfully forwarded to ${payload.newAssigneeName}!`);
    setActiveForwardTask(null);
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
      if (isAssignee && !isCreator && !isSuperAdmin10001) {
        if (['Under Review', 'Re-issued', 'Accepted'].includes(newStage)) {
          alert(`🛑 Authorization Denied: As the Assignee of this task, you can move work to "In Progress" or "Submitted for Review". Only the Assigner (${targetTask.creatorName || 'Super Admin'}) can mark tasks as Under Review, Re-issued, or Accepted.`);
          return;
        }

        // Rule: Once submitted for review or under review, status cannot be reverted back to Assigned or In Progress by faculty
        if (['Submitted for Review', 'Under Review', 'Accepted'].includes(targetTask.stage) && ['Assigned', 'In Progress'].includes(newStage)) {
          alert(`🛑 Action Blocked: This task has already been submitted for review (${targetTask.stage}). Its status cannot be moved back to "${newStage}" until the Assigner (${targetTask.creatorName || 'Admin / Super Admin'}) completes the review or re-issues the task.`);
          return;
        }
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
    const targetTask = tasks.find(t => t.id === taskId);
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
    alert(`Deadline extension request submitted to ${targetTask?.creatorName || 'Assigner / Super Admin'}!`);
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
    const targetTask = tasks.find(t => t.id === taskId);
    handleMoveStage(taskId, 'Submitted for Review');
    alert(`Task successfully submitted to ${targetTask?.creatorName || 'Assigner / Super Admin'} for review!`);
    setActiveReviewTask(null);
  };

  const handleRateTask = (taskId, newRating, feedback = '') => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            rating: newRating,
            ratingFeedback: feedback || t.ratingFeedback || '',
            ratedBy: {
              name: authUser?.name || 'Super Admin',
              role: currentRole || 'superAdmin',
              employeeId: authUser?.employeeId || '',
              at: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      });
      localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
      persistTasksToServer(updated);
      return updated;
    });
  };

  const handleReviewSubmission = (taskId, isApproved, feedback, newRestartDeadline, rating) => {
    if (isApproved) {
      const awardedRating = rating || 5;
      setTasks((prevTasks) => {
        const updated = prevTasks.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              stage: 'Accepted',
              progressPercent: 100,
              rating: awardedRating,
              ratingFeedback: feedback || '',
              ratedBy: {
                name: authUser?.name || 'Super Admin',
                role: currentRole || 'superAdmin',
                employeeId: authUser?.employeeId || '',
                at: new Date().toISOString()
              },
              review: { isApproved: true, feedback, rating: awardedRating },
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
        localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
        persistTasksToServer(updated);
        return updated;
      });
      alert(`Task submission accepted & approved with ${awardedRating} ★ rating! ⭐`);
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
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
        localStorage.setItem('ctu_tasks_data', JSON.stringify(updated));
        persistTasksToServer(updated);
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
        filterDept={filterDept}
        selectedTag={selectedTag}
        filterDirection={filterDirection}
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
        isMobile={isMobile}
        onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
      />

      <main className="main-content" style={{ paddingBottom: isMobile ? '80px' : '24px', padding: isMobile ? '10px' : '24px' }}>
        {/* 🎓 Dedicated Faculty Workspace Welcome & Action Banner */}
        {currentRole === 'faculty' ? (
          <div style={{
            padding: isMobile ? '12px 14px' : '14px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            color: '#ffffff',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: isMobile ? '34px' : '40px',
                height: isMobile ? '34px' : '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.35)'
              }}>
                <Award size={isMobile ? 18 : 22} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  {authUser.name}
                </h3>
                <p style={{ fontSize: isMobile ? '10.5px' : '11.5px', color: '#93c5fd', margin: 0 }}>
                  {authUser.dept || 'CT University Faculty Workspace'} • {roleScopedTasks.length} Assigned Tasks
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReportCardOpen(true)}
              style={{
                padding: isMobile ? '6px 12px' : '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: isMobile ? '11.5px' : '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Award size={14} />
              <span>My Report Card</span>
            </button>
          </div>
        ) : (
          /* Role Scope Notice Banner (Non-Faculty Desktop Only) */
          !isMobile && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={15} color="#0284c7" />
                <span>
                  <strong>Authenticated Role Scope: {authUser.roleTitle}</strong> • {
                    currentRole === 'hod'
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
          )
        )}

        <StatsOverview tasks={filteredTasks} currentRole={currentRole} isMobile={isMobile} />

        {/* 🏷️ Quick Department, Tag & Directional Assignment Filter Pills (Desktop & Mobile Optimized) */}
        <TagFilterBar
          tasks={roleScopedTasks}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          filterDirection={filterDirection}
          onSelectDirection={setFilterDirection}
          filterDept={filterDept}
          onSelectDept={setFilterDept}
          authUser={authUser}
          currentRole={currentRole}
          isMobile={isMobile}
          onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
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
            onOpenForwardModal={(task) => setActiveForwardTask(task)}
            onRateTask={handleRateTask}
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
            onOpenForwardModal={(task) => setActiveForwardTask(task)}
            onRateTask={handleRateTask}
            currentRole={currentRole}
          />
        )}


        {(activeView === 'team' || activeView === 'staff' || activeView === 'verification') && (
          currentRole !== 'faculty' ? (
            <SuperAdminVerification 
              viewType="table"
              onOpenHRImport={() => setIsHRImportOpen(true)}
              isMobile={isMobile}
            />

          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #fee2e2', color: '#dc2626', fontWeight: '700', fontSize: '14px', marginTop: '20px' }}>
              ⚠️ Access Restricted: Faculty accounts do not have authorization to view Employee Master Directory or Staff Records.
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

      {/* Forward Task to Faculty Modal */}
      {activeForwardTask && (
        <ForwardTaskModal
          isOpen={!!activeForwardTask}
          onClose={() => setActiveForwardTask(null)}
          task={activeForwardTask}
          team={team}
          verificationRecords={verificationRecordsState}
          authUser={authUser}
          onForwardTask={handleForwardTask}
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

      {/* Mobile Quick Action Sheet */}
      {mobileActionTask && (
        <TaskActionSheet
          isOpen={!!mobileActionTask}
          onClose={() => setMobileActionTask(null)}
          task={mobileActionTask}
          authUser={authUser}
          onMoveStage={handleMoveStage}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handleDeleteTask}
          onOpenChat={(task) => setActiveChatTask(task)}
          onOpenExtensionModal={(task) => setActiveExtensionTask(task)}
          onOpenReviewModal={(task) => setActiveReviewTask(task)}
          onOpenForwardModal={(task) => setActiveForwardTask(task)}
          currentRole={currentRole}
        />
      )}


      {/* Mobile Filter Bottom Sheet */}
      {isFilterSheetOpen && (
        <FilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          filterDirection={filterDirection}
          setFilterDirection={setFilterDirection}
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          availableTags={Array.from(new Set(roleScopedTasks.flatMap(t => Array.isArray(t.tags) ? t.tags : [])))}
          currentRole={currentRole}
        />
      )}

      {/* Mobile More Actions Bottom Sheet */}
      {isMoreSheetOpen && (
        <MobileMoreSheet
          isOpen={isMoreSheetOpen}
          onClose={() => setIsMoreSheetOpen(false)}
          authUser={authUser}
          currentRole={currentRole}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onOpenReportCard={() => setIsReportCardOpen(true)}
          onOpenChangePassword={() => setIsChangePassOpen(true)}
          onOpenHRImport={() => setIsHRImportOpen(true)}
          setActiveView={setActiveView}
          onToggleTheme={handleToggleTheme}
          theme={theme}
          onLogout={handleLogout}
        />
      )}

      {/* Mobile Fixed Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          activeView={activeView}
          setActiveView={setActiveView}
          currentRole={currentRole}
          onNewTask={handleOpenNewTask}
          onOpenReportCard={() => setIsReportCardOpen(true)}
          onOpenMoreSheet={() => setIsMoreSheetOpen(true)}
        />
      )}
    </div>
  );
}

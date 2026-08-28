import React from 'react';
import { LayoutGrid, ListTodo, Users, Shield, Award, Plus, MoreHorizontal } from 'lucide-react';

export default function MobileBottomNav({
  activeView,
  setActiveView,
  currentRole,
  onNewTask,
  onOpenMoreSheet
}) {
  const isFaculty = currentRole === 'faculty';

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: 'var(--bg-card, #ffffff)',
      borderTop: '1px solid var(--border-color, #e2e8f0)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 900,
      padding: '0 4px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      {/* 1. Workflow Board */}
      <button
        onClick={() => setActiveView('kanban')}
        style={{
          background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          color: activeView === 'kanban' ? '#2563eb' : '#64748b', cursor: 'pointer', flex: 1
        }}
      >
        <LayoutGrid size={20} />
        <span style={{ fontSize: '10.5px', fontWeight: activeView === 'kanban' ? '700' : '500' }}>Board</span>
      </button>

      {/* 2. Tasks List */}
      <button
        onClick={() => setActiveView('list')}
        style={{
          background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          color: activeView === 'list' ? '#2563eb' : '#64748b', cursor: 'pointer', flex: 1
        }}
      >
        <ListTodo size={20} />
        <span style={{ fontSize: '10.5px', fontWeight: activeView === 'list' ? '700' : '500' }}>Tasks</span>
      </button>

      {/* 3. Center New Task Button (Non-Faculty) */}
      {!isFaculty && (
        <button
          onClick={onNewTask}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
            marginTop: '-16px',
            flexShrink: 0
          }}
          title="Assign New Task"
        >
          <Plus size={24} />
        </button>
      )}

      {/* 4. Staff (Non-Faculty) or Academic Report Card (Faculty) */}
      {!isFaculty ? (
        <button
          onClick={() => setActiveView('staff')}
          style={{
            background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: (activeView === 'team' || activeView === 'staff') ? '#2563eb' : '#64748b', cursor: 'pointer', flex: 1
          }}
        >
          <Users size={20} />
          <span style={{ fontSize: '10.5px', fontWeight: (activeView === 'team' || activeView === 'staff') ? '700' : '500' }}>Staff</span>
        </button>
      ) : (
        <button
          onClick={onOpenReportCard}
          style={{
            background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
            color: '#f59e0b', cursor: 'pointer', flex: 1
          }}
        >
          <Award size={20} color="#f59e0b" />
          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#d97706' }}>Report Card</span>
        </button>
      )}

      {/* 5. More Action Sheet Button */}
      <button
        onClick={onOpenMoreSheet}
        style={{
          background: 'none', border: 'none', padding: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          color: '#64748b', cursor: 'pointer', flex: 1
        }}
      >
        <MoreHorizontal size={20} />
        <span style={{ fontSize: '10.5px', fontWeight: '600' }}>More</span>
      </button>
    </nav>
  );
}

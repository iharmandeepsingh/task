import React from 'react';
import { X, CheckCircle, Clock, MessageSquare, Edit3, Trash2, ArrowRight, ShieldAlert, Send } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';

export default function TaskActionSheet({
  isOpen,
  onClose,
  task,
  authUser,
  onMoveStage,
  onEditTask,
  onDeleteTask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  currentRole
}) {
  if (!isOpen || !task) return null;

  const authEmpId = (authUser?.employeeId || '').trim();
  const authId = (authUser?.id || '').trim();
  const isSuperAdmin = currentRole === 'superAdmin' || ['10001', '24051', '17572'].includes(authEmpId);
  const isFaculty = currentRole === 'faculty';

  const stages = [
    { key: 'To Do', label: 'To Do', color: '#64748b' },
    { key: 'In Progress', label: 'In Progress', color: '#3b82f6' },
    { key: 'Review', label: 'Review', color: '#f59e0b' },
    { key: 'Completed', label: 'Completed', color: '#10b981' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 1100
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#ffffff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '20px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header Drag Handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#cbd5e1', margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>
              {task.id} • {task.priority} Priority
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '2px 0 4px 0' }}>
              {task.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Due: {formatDueDateWithDayTime(task.dueDate, task.dueTime)} • Assignee: {task.assigneeName}
            </p>
          </div>

          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Quick Stage Change Buttons */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
            Move Workflow Stage
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {stages.map(st => (
              <button
                key={st.key}
                onClick={() => { onMoveStage(task.id, st.key); onClose(); }}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: task.stage === st.key ? `2px solid ${st.color}` : '1px solid #e2e8f0',
                  background: task.stage === st.key ? `${st.color}15` : '#f8fafc',
                  color: task.stage === st.key ? st.color : '#475569',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action List Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Submit / Review */}
          <button
            onClick={() => { onOpenReviewModal(task); onClose(); }}
            style={{
              padding: '12px 14px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0',
              color: '#047857', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>Submit Work / Review Submission</span>
            </div>
            <ArrowRight size={14} />
          </button>

          {/* Extension Request */}
          <button
            onClick={() => { onOpenExtensionModal(task); onClose(); }}
            style={{
              padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a',
              color: '#b45309', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} />
              <span>Deadline Extension & Re-issue</span>
            </div>
            <ArrowRight size={14} />
          </button>

          {/* Chat Thread */}
          <button
            onClick={() => { onOpenChat(task); onClose(); }}
            style={{
              padding: '12px 14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe',
              color: '#1d4ed8', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} />
              <span>Task Chat & Discussions</span>
            </div>
            <ArrowRight size={14} />
          </button>

          {/* Edit Task (Non-faculty) */}
          {!isFaculty && (
            <button
              onClick={() => { onEditTask(task); onClose(); }}
              style={{
                padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1',
                color: '#334155', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} />
                <span>Edit Task Details</span>
              </div>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Delete Task (Admin / Super Admin) */}
          {!isFaculty && (
            <button
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              style={{
                padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} />
                <span>Delete Task</span>
              </div>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

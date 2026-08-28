import React from 'react';
import { Clock, MessageSquare, CheckCircle, AlertCircle, MoreVertical, Paperclip, CheckSquare } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';

export default function MobileTaskCard({
  task,
  onOpenActionSheet,
  onToggleSubtask,
  authUser
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.stage !== 'Completed';

  const priorityColors = {
    Urgent: { bg: '#fee2e2', text: '#dc2626' },
    High: { bg: '#ffedd5', text: '#ea580c' },
    Medium: { bg: '#eff6ff', text: '#2563eb' },
    Low: { bg: '#f1f5f9', text: '#475569' }
  };

  const stageColors = {
    'To Do': { bg: '#f1f5f9', text: '#475569' },
    'In Progress': { bg: '#eff6ff', text: '#2563eb' },
    'Review': { bg: '#fffbeb', text: '#b45309' },
    'Completed': { bg: '#ecfdf5', text: '#059669' }
  };

  const priorityStyle = priorityColors[task.priority] || priorityColors.Medium;
  const stageStyle = stageColors[task.stage] || stageColors['To Do'];

  const subtasksCount = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  const completedSubtasks = Array.isArray(task.subtasks) ? task.subtasks.filter(s => s.completed).length : 0;

  return (
    <div
      onClick={() => onOpenActionSheet(task)}
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px',
        marginBottom: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Top Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700',
            background: priorityStyle.bg, color: priorityStyle.text
          }}>
            {task.priority}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700',
            background: stageStyle.bg, color: stageStyle.text
          }}>
            {task.stage}
          </span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onOpenActionSheet(task); }}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.3' }}>
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar (if applicable) */}
      {subtasksCount > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
            <span>Subtasks</span>
            <span>{completedSubtasks} / {subtasksCount}</span>
          </div>
          <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${(completedSubtasks / subtasksCount) * 100}%`, height: '100%', background: '#2563eb', borderRadius: '2px' }} />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '11.5px', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? '#dc2626' : '#64748b', fontWeight: isOverdue ? '700' : '500' }}>
          <Clock size={13} />
          <span>{formatDueDateWithDayTime(task.dueDate, task.dueTime)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {Array.isArray(task.comments) && task.comments.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <MessageSquare size={12} /> {task.comments.length}
            </span>
          )}
          <span style={{ fontWeight: '600', color: '#334155' }}>
            {task.assigneeName?.split(' ')[0] || 'Assignee'}
          </span>
        </div>
      </div>
    </div>
  );
}

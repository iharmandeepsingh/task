import React, { useState } from 'react';
import { Calendar, Trash2, Edit2, ArrowUpDown, MessageSquare, Clock, Send, RefreshCw, User, Tag } from 'lucide-react';
import { STAGES, formatDueDateWithDayTime } from '../data/initialData';

export default function ListView({
  tasks,
  team,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onToggleSubtask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  currentRole,
}) {
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const getAssignee = (id) => (team ? team.find((m) => m.id === id) : null) || { name: 'Faculty Member', avatar: 'FM' };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      {/* Desktop Table View */}
      <div className="desktop-table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('id')}>
                  ID <ArrowUpDown size={12} />
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('title')}>
                  Task Title <ArrowUpDown size={12} />
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('stage')}>
                  Stage <ArrowUpDown size={12} />
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('priority')}>
                  Priority <ArrowUpDown size={12} />
                </th>
                <th style={{ padding: '12px 16px' }}>Assignee</th>
                <th style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
                  Due Date <ArrowUpDown size={12} />
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No tasks matching current filter criteria.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const assignee = getAssignee(task.assigneeId);
                  const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');

                  return (
                    <tr 
                      key={task.id} 
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#2563eb', fontSize: '12px' }}>
                        {task.id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {task.description}
                        </div>
                        {hasPendingExt && (
                          <div style={{ fontSize: '10px', fontWeight: '700', color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                            <Clock size={11} /> Extension Requested
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select 
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#0f172a',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          value={task.stage}
                          onChange={(e) => onMoveStage && onMoveStage(task.id, e.target.value)}
                        >
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '700',
                          background: task.priority === 'Urgent' || task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                          color: task.priority === 'Urgent' || task.priority === 'High' ? '#b91c1c' : '#475569'
                        }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {assignee.avatar}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{task.assigneeName || assignee.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#1e40af', fontSize: '11px', fontWeight: '700' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          <Clock size={13} color="#2563eb" /> {formatDueDateWithDayTime(task.dueDate, task.dueTime)}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => onOpenChat && onOpenChat(task)}
                            title="Chat"
                            style={{ padding: '6px 10px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={13} />
                            <span>Chat</span>
                          </button>

                          {task.stage !== 'Accepted' && (
                            <button
                              onClick={() => onOpenExtensionModal && onOpenExtensionModal(task)}
                              title="Deadline Extension Request"
                              style={{ padding: '6px 10px', borderRadius: '8px', background: hasPendingExt ? '#fef3c7' : '#fffbeb', color: '#b45309', border: hasPendingExt ? '1px solid #f59e0b' : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Clock size={13} />
                              <span>Ext Request</span>
                            </button>
                          )}

                          {isLeader && (
                            <button
                              onClick={() => onOpenReviewModal && onOpenReviewModal(task)}
                              title="Review"
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Send size={13} />
                              <span>Review</span>
                            </button>
                          )}

                          {isLeader && (
                            <button
                              onClick={() => onDeleteTask && onDeleteTask(task.id)}
                              title="Delete Task"
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (Shown on Mobile screens <= 768px) */}
      <div className="mobile-task-cards-list" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: '#ffffff', borderRadius: '12px', color: '#94a3b8', fontSize: '13px' }}>
            No tasks matching filter criteria.
          </div>
        ) : (
          sortedTasks.map((task) => {
            const assignee = getAssignee(task.assigneeId);
            const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');

            return (
              <div key={task.id} style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                {/* Mobile Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                    {task.id}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: task.priority === 'Urgent' || task.priority === 'High' ? '#fee2e2' : '#f1f5f9', color: task.priority === 'Urgent' || task.priority === 'High' ? '#b91c1c' : '#475569' }}>
                      {task.priority || 'Medium'}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: '#dcfce7', color: '#166534' }}>
                      {task.deadlineHealth || 'Green'}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {task.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
                  {task.description}
                </p>

                {/* Pending Extension Request Alert Banner on Mobile Card */}
                {hasPendingExt && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} />
                    <span>Extension Requested (Pending Review)</span>
                  </div>
                )}

                {/* Mobile Stage Move Selector */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                    Stage / Status:
                  </label>
                  <select 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#0f172a', outline: 'none' }}
                    value={task.stage}
                    onChange={(e) => onMoveStage && onMoveStage(task.id, e.target.value)}
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Assignee & Due Date Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {assignee.avatar}
                    </div>
                    <span style={{ fontWeight: '600' }}>{task.assigneeName || assignee.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} color="#64748b" /> {task.dueDate}
                  </div>
                </div>

                {/* Mobile Touch Actions */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onOpenChat && onOpenChat(task)}
                    style={{ flex: 1, minWidth: '70px', padding: '8px 6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={13} /> Chat
                  </button>

                  {task.stage !== 'Accepted' && (
                    <button
                      onClick={() => onOpenExtensionModal && onOpenExtensionModal(task)}
                      style={{ flex: 1, minWidth: '100px', padding: '8px 6px', borderRadius: '8px', background: hasPendingExt ? '#fef3c7' : '#fffbeb', color: '#b45309', border: hasPendingExt ? '1px solid #f59e0b' : 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Clock size={13} /> Ext Request
                    </button>
                  )}

                  {isLeader && (
                    <button
                      onClick={() => onOpenReviewModal && onOpenReviewModal(task)}
                      style={{ flex: 1, minWidth: '70px', padding: '8px 6px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <Send size={13} /> Review
                    </button>
                  )}

                  {isLeader && (
                    <button
                      onClick={() => onDeleteTask && onDeleteTask(task.id)}
                      style={{ padding: '8px 10px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

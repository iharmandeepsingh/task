import React, { useState } from 'react';
import { Calendar, Trash2, Edit2, ArrowUpDown, MessageSquare, Clock, Send, RefreshCw, User, Tag } from 'lucide-react';
import { STAGES, formatDueDateWithDayTime, getUrgentCountdownInfo } from '../data/initialData';

export default function ListView({
  tasks,
  team,
  authUser,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onToggleSubtask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  onOpenForwardModal,
  currentRole,
}) {

  const [sortField, setSortField] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');

  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const getAssignee = (id) => (team ? team.find((m) => m.id === id) : null) || { name: 'Faculty Member', avatar: 'FM' };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'recent' ? 'desc' : 'asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortField === 'recent') {
      const timeA = new Date(a.updatedAt || a.delegatedAt || a.createdAt || a.dueDate || 0).getTime();
      const timeB = new Date(b.updatedAt || b.delegatedAt || b.createdAt || b.dueDate || 0).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    }
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
                sortedTasks.map((task, idx) => {
                  const assignee = getAssignee(task.assigneeId);
                  const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');

                  return (
                    <tr 
                      key={task.id || `task-row-${idx}`} 
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
                        
                        {/* Directional Assignment Badge */}
                        {(() => {
                          const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
                          const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;

                          if (task.delegatedByName || task.isDelegated) {
                            return (
                              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                DIRECTIVE: <strong>{task.creatorName || 'Super Admin'}</strong> ➔ <strong>{task.delegatedByName || task.originalAssigneeName || 'Admin'}</strong> ➔ <strong>{task.assigneeName}</strong>
                              </div>
                            );
                          } else if (isAssignee && !isCreator) {
                            return (
                              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                INCOMING: Assigned by <strong>{task.creatorName || 'Super Admin'}</strong>
                              </div>
                            );
                          } else if (isCreator && !isAssignee) {
                            return (
                              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                DELEGATED: Assigned to <strong>{task.assigneeName}</strong>
                              </div>
                            );
                          } else if (task.creatorName && (task.creatorName.toLowerCase().includes('super') || task.creatorRole?.toLowerCase().includes('super'))) {
                            return (
                              <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                DIRECTIVE: <strong>{task.creatorName}</strong> ➔ <strong>{task.assigneeName}</strong>
                              </div>
                            );
                          }
                          return null;
                        })()}



                        {hasPendingExt && (
                          <div style={{ fontSize: '10px', fontWeight: '700', color: '#b45309', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                            <Clock size={11} /> Extension Requested
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {(() => {
                          const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
                          const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
                          const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

                          let allowedStages = STAGES;
                          if (isAssignee && !isCreator && !isSuperAdmin10001) {
                            allowedStages = STAGES.filter(s => ['Assigned', 'In Progress', 'Submitted for Review'].includes(s));
                          }

                          return (
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
                              {allowedStages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          );
                        })()}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {assignee.avatar}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>{task.assigneeName || assignee.name}</span>
                          </div>
                          {task.delegatedByName && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                              <span style={{ fontSize: '9.5px', color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', fontWeight: '600' }}>
                                DIRECTIVE: {task.creatorName || 'Super Admin'} ➔ {task.delegatedByName} ➔ <span style={{ color: '#2563eb', fontWeight: '700' }}>{task.assigneeName}</span>
                              </span>
                              {task.delegationNotes && (
                                <span style={{ fontSize: '9.5px', color: '#64748b', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  "{task.delegationNotes}"
                                </span>
                              )}
                            </div>
                          )}


                        </div>

                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', fontSize: '11px', color: '#1e40af' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                            <Clock size={13} color="#2563eb" /> {formatDueDateWithDayTime(task.dueDate, task.dueTime)}
                          </div>
                          {getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage) && (
                            <div style={{
                              background: getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage).bgColor,
                              color: getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage).textColor,
                              border: `1px solid ${getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage).borderColor}`,
                              padding: '3px 6px',
                              borderRadius: '6px',
                              fontWeight: '800',
                              fontSize: '10px'
                            }}>
                              {getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage).text}
                            </div>
                          )}
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

                          {isLeader && task.stage !== 'Accepted' && (
                            <button
                              onClick={() => onOpenForwardModal && onOpenForwardModal(task)}
                              title="Forward / Delegate Task to Faculty"
                              style={{ padding: '6px 10px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Send size={13} />
                              <span>Forward</span>
                            </button>
                          )}


                          {(() => {
                            const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
                            const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

                            if (isCreator || isSuperAdmin10001) {
                              return (
                                <button
                                  onClick={() => onDeleteTask && onDeleteTask(task.id)}
                                  title="Delete Task (Assigner Only)"
                                  style={{ padding: '6px 10px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              );
                            }
                            return null;
                          })()}
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
          sortedTasks.map((task, idx) => {
            const assignee = getAssignee(task.assigneeId);
            const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');

            return (
              <div key={task.id || `task-mob-${idx}`} style={{ background: '#ffffff', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>

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

                {/* Delegation Info Banner on Mobile Card */}
                {task.delegatedByName && (
                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: currentRole === 'faculty' ? '#f0fdf4' : '#eff6ff',
                    border: currentRole === 'faculty' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                    fontSize: '11px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontWeight: '700', color: currentRole === 'faculty' ? '#166534' : '#1e40af', marginBottom: '2px' }}>
                      DIRECTIVE: {task.creatorName || 'Super Admin'} ➔ {task.delegatedByName} ➔ {task.assigneeName}
                    </div>
                    {task.delegationNotes && (
                      <div style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic', marginTop: '2px', background: '#ffffff', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        Note: "{task.delegationNotes}"
                      </div>
                    )}
                  </div>
                )}



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

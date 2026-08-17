import React, { useState } from 'react';
import { Clock, AlertTriangle, MessageSquare, CheckSquare, Send, Calendar, AlertCircle, RefreshCw, ChevronDown, Layers, Filter, Paperclip } from 'lucide-react';
import { STAGES, formatDueDateWithDayTime, getUrgentCountdownInfo } from '../data/initialData';

export default function KanbanBoard({
  tasks,
  team,
  authUser,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  onToggleSubtask,
  currentRole,
}) {
  const [selectedMobileStage, setSelectedMobileStage] = useState('ALL');
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);

  const displayedStages = selectedMobileStage === 'ALL' 
    ? STAGES 
    : STAGES.filter(s => s === selectedMobileStage);

  return (
    <div>
      {/* Mobile Touch Stage Filter Bar (Visible on mobile screens) */}
      <div className="mobile-stage-filter-bar" style={{
        marginBottom: '14px',
        background: '#ffffff',
        padding: '10px 12px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#2563eb" />
            <span>Workflow Stages:</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
            {selectedMobileStage === 'ALL' ? 'Showing All 7 Columns' : `Filtered: ${selectedMobileStage}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
          <button
            onClick={() => setSelectedMobileStage('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: selectedMobileStage === 'ALL' ? '#1e3a8a' : '#f1f5f9',
              color: selectedMobileStage === 'ALL' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            All Columns ({tasks.length})
          </button>

          {STAGES.map((s) => {
            const count = tasks.filter(t => t.stage === s).length;
            const isSel = selectedMobileStage === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedMobileStage(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: isSel ? '#2563eb' : '#f1f5f9',
                  color: isSel ? '#ffffff' : '#475569',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{s}</span>
                <span style={{
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: isSel ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
                  color: isSel ? '#ffffff' : '#1e293b',
                  fontSize: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-container" style={{ scrollSnapType: 'x mandatory' }}>
        <div className="kanban-grid">
          {displayedStages.map((stage) => {
            const stageTasks = tasks.filter((t) => t.stage === stage);

            return (
              <div key={stage} className="kanban-column" style={{ scrollSnapAlign: 'start' }}>
                <div className="column-header">
                  <div className="column-title-group">
                    <span className={`stage-dot ${getStageColorClass(stage)}`}></span>
                    <h3 className="column-title">{stage}</h3>
                    <span className="column-count">{stageTasks.length}</span>
                  </div>
                </div>

                <div className="column-cards">
                  {stageTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 12px', background: '#ffffff', borderRadius: '12px', border: '1.5px dashed #cbd5e1', color: '#94a3b8', fontSize: '12px' }}>
                      No tasks currently in <strong>{stage}</strong> stage
                    </div>
                  ) : (
                    stageTasks.map((task) => {
                      const assignee = team ? team.find((u) => u.id === task.assigneeId) : null;
                      const isIdle = task.isIdle;
                      const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');
                      const urgentInfo = getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage);

                      return (
                        <div key={task.id} className={`kanban-card ${isIdle ? 'idle-border' : ''}`}>
                          {/* Idle Flag Alert Banner */}
                          {isIdle && (
                            <div className="idle-flag-banner">
                              <AlertTriangle size={12} />
                              <span>Idle Flag: No update for 3-5 days</span>
                            </div>
                          )}

                          {/* Directional Assignment Badge (Incoming vs Delegated) */}
                          {(() => {
                            const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
                            const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;

                            if (isAssignee && !isCreator) {
                              return (
                                <div style={{ background: '#e0e7ff', border: '1px solid #c7d2fe', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📥 INCOMING TASK: Assigned to You by {task.creatorName || 'Super Admin'}</span>
                                </div>
                              );
                            } else if (isCreator && !isAssignee) {
                              return (
                                <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📤 DELEGATED TASK: Assigned by You to {task.assigneeName || 'Faculty'}</span>
                                </div>
                              );
                            } else if (task.creatorName && task.creatorName.toLowerCase().includes('super')) {
                              return (
                                <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', color: '#6b21a8', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>🏛️ SUPER ADMIN DIRECTIVE: {task.creatorName} ➔ {task.assigneeName}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Pending Extension Request Alert Banner */}
                          {hasPendingExt && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '6px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              <span>Extension Requested (Pending HOD Review)</span>
                            </div>
                          )}

                          {/* Urgent 24-Hour Countdown Timer Pulsing Badge */}
                          {urgentInfo && (
                            <div style={{
                              background: urgentInfo.bgColor,
                              border: `1px solid ${urgentInfo.borderColor}`,
                              color: urgentInfo.textColor,
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
                            }}>
                              <Clock size={13} color={urgentInfo.textColor} />
                              <span>{urgentInfo.text}</span>
                            </div>
                          )}

                          <div className="card-top">
                            <span className="task-code">{task.id}</span>
                            <span className={`priority-badge ${task.priority ? task.priority.toLowerCase() : 'medium'}`}>
                              {task.priority || 'Medium'}
                            </span>
                            <span className={`health-pill ${task.deadlineHealth ? task.deadlineHealth.toLowerCase() : 'green'}`}>
                              {task.deadlineHealth || 'Green'}
                            </span>
                          </div>

                          <h4 className="card-title" onClick={() => onEditTask(task)}>
                            {task.title}
                          </h4>

                          <p className="card-desc">{task.description}</p>

                          {/* Attached Documents Pills */}
                          {task.attachments && task.attachments.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '4px' }}>
                              {task.attachments.map((att) => (
                                <a
                                  key={att.name}
                                  href={att.dataUrl || '#'}
                                  download={att.name}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: '#1d4ed8',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textDecoration: 'none'
                                  }}
                                  title={`Download ${att.name}`}
                                >
                                  <Paperclip size={11} color="#2563eb" />
                                  <span>{att.name}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Due Date with Day, Hours & Minutes */}
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #bfdbfe' }}>
                            <Clock size={12} color="#2563eb" />
                            <span>Due: {formatDueDateWithDayTime(task.dueDate, task.dueTime)}</span>
                          </div>

                          {/* Explicit Interactive Stage Changer Dropdown */}
                          <div
                            style={{ marginTop: '10px', marginBottom: '10px' }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                              Move Task Stage:
                            </label>
                            <select
                              value={task.stage}
                              onChange={(e) => {
                                e.stopPropagation();
                                onMoveStage(task.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#0f172a',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                outline: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  Stage: {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Subtask Progress Checklist */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="card-subtasks">
                              <div className="subtasks-header">
                                <span>Sub-tasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})</span>
                              </div>
                              {task.subtasks.map((st) => (
                                <label key={st.id || st.text} className="subtask-item">
                                  <input
                                    type="checkbox"
                                    checked={st.done}
                                    onChange={() => onToggleSubtask(task.id, st.id)}
                                  />
                                  <span className={st.done ? 'completed' : ''}>{st.text}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Re-issued Feedback Banner */}
                          {task.stage === 'Re-issued' && task.review && (
                            <div className="reissued-banner" style={{ background: '#fef2f2', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', color: '#b91c1c', marginTop: '8px' }}>
                              <RefreshCw size={12} />
                              <span>Re-issued: {task.review.feedback}</span>
                            </div>
                          )}

                          <div className="card-footer" style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                            <div className="assignee-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div className="avatar-small" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                                {assignee ? assignee.avatar : 'HS'}
                              </div>
                              <span className="assignee-name" style={{ fontSize: '11px', fontWeight: '600' }}>
                                {task.assigneeName || (assignee ? assignee.name : 'Faculty')}
                              </span>
                            </div>

                            <div className="card-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                className="chat-btn"
                                title="Task Chat Thread"
                                onClick={() => onOpenChat(task)}
                                style={{ padding: '6px 10px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <MessageSquare size={13} />
                                <span>Chat</span>
                              </button>

                              {task.stage !== 'Accepted' && (
                                <button
                                  className="action-btn-small ext"
                                  title="Request or View Extension"
                                  onClick={() => onOpenExtensionModal(task)}
                                  style={{ padding: '6px 10px', borderRadius: '8px', background: hasPendingExt ? '#fef3c7' : '#fffbeb', color: '#b45309', border: hasPendingExt ? '1px solid #f59e0b' : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Clock size={13} />
                                  <span>Ext Request</span>
                                </button>
                              )}

                              {isLeader && (
                                <button
                                  className="action-btn-small review"
                                  title="Review Submission"
                                  onClick={() => onOpenReviewModal(task)}
                                  style={{ padding: '6px 10px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Send size={13} />
                                  <span>Review</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getStageColorClass(stage) {
  switch (stage) {
    case 'Assigned': return 'blue';
    case 'In Progress': return 'indigo';
    case 'Submitted for Review': return 'purple';
    case 'Under Review': return 'amber';
    case 'Accepted': return 'green';
    case 'Completed': return 'emerald';
    case 'Rejected': return 'red';
    case 'Re-issued': return 'cyan';
    default: return 'gray';
  }
}

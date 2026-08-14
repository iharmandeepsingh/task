import React from 'react';
import { Clock, AlertTriangle, MessageSquare, CheckSquare, Send, Calendar, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { STAGES } from '../data/initialData';

export default function KanbanBoard({
  tasks,
  team,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  onToggleSubtask,
  currentRole,
}) {
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);

  return (
    <div className="kanban-container">
      <div className="kanban-grid">
        {STAGES.map((stage) => {
          const stageTasks = tasks.filter((t) => t.stage === stage);

          return (
            <div key={stage} className="kanban-column">
              <div className="column-header">
                <div className="column-title-group">
                  <span className={`stage-dot ${getStageColorClass(stage)}`}></span>
                  <h3 className="column-title">{stage}</h3>
                  <span className="column-count">{stageTasks.length}</span>
                </div>
              </div>

              <div className="column-cards">
                {stageTasks.map((task) => {
                  const assignee = team ? team.find((u) => u.id === task.assigneeId) : null;
                  const isIdle = task.isIdle;
                  const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');

                  return (
                    <div key={task.id} className={`kanban-card ${isIdle ? 'idle-border' : ''}`}>
                      {/* Idle Flag Alert Banner */}
                      {isIdle && (
                        <div className="idle-flag-banner">
                          <AlertTriangle size={12} />
                          <span>Idle Flag: No update for 3-5 days</span>
                        </div>
                      )}

                      {/* Pending Extension Request Alert Banner */}
                      {hasPendingExt && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          <span>Extension Requested (Pending HOD Review)</span>
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
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
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
                })}
              </div>
            </div>
          );
        })}
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
    case 'Rejected': return 'red';
    case 'Re-issued': return 'cyan';
    default: return 'gray';
  }
}

import React, { useState } from 'react';
import { Clock, AlertTriangle, MessageSquare, CheckSquare, Send, Calendar, AlertCircle, RefreshCw, ChevronDown, Layers, Filter, Paperclip, Trash2, FileText } from 'lucide-react';
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
  onOpenForwardModal,
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
        marginBottom: '12px',
        background: '#ffffff',
        padding: '8px 10px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedMobileStage('ALL')}
            style={{
              padding: '5px 11px',
              borderRadius: '16px',
              background: selectedMobileStage === 'ALL' ? '#1e293b' : '#f1f5f9',
              color: selectedMobileStage === 'ALL' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            All Stages ({tasks.length})
          </button>

          {STAGES.map((s) => {
            const count = tasks.filter(t => t.stage === s).length;
            const isSel = selectedMobileStage === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedMobileStage(s)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '16px',
                  background: isSel ? '#2563eb' : '#f8fafc',
                  color: isSel ? '#ffffff' : '#475569',
                  border: isSel ? '1px solid #2563eb' : '1px solid #e2e8f0',
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
                  padding: '0 5px',
                  borderRadius: '8px',
                  background: isSel ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isSel ? '#ffffff' : '#334155',
                  fontSize: '9.5px',
                  fontWeight: '800'
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
            const stageTasks = tasks
              .filter((t) => t.stage === stage)
              .sort((a, b) => {
                const timeA = new Date(a.updatedAt || a.delegatedAt || a.createdAt || a.dueDate || 0).getTime();
                const timeB = new Date(b.updatedAt || b.delegatedAt || b.createdAt || b.dueDate || 0).getTime();
                return timeB - timeA;
              });


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
                      No tasks in <strong>{stage}</strong>
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

                          {/* Compact Directional Assignment Badge (Incoming vs Delegated) */}
                          {(() => {
                            const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
                            const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;

                            if (task.delegatedByName || task.isDelegated) {
                              return (
                                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>👑 {task.creatorName || 'Super Admin'} ➔ 🏛️ {task.delegatedByName || task.originalAssigneeName || 'Admin'} ➔ 🎓 {task.assigneeName}</span>
                                </div>
                              );
                            } else if (isAssignee && !isCreator) {
                              return (
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📥 Incoming: 👑 {task.creatorName || 'Super Admin'} ➔ 🏛️ {task.assigneeName}</span>
                                </div>
                              );
                            } else if (isCreator && !isAssignee) {
                              return (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>📤 Delegated: 🏛️ {task.creatorName} ➔ 🎓 {task.assigneeName}</span>
                                </div>
                              );
                            } else if (task.creatorName && (task.creatorName.toLowerCase().includes('super') || task.creatorRole?.toLowerCase().includes('super'))) {
                              return (
                                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>👑 {task.creatorName} ➔ 🏛️ {task.assigneeName}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}


                          {/* Pending Extension Request Alert Banner */}
                          {hasPendingExt && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={11} />
                              <span>Extension Requested</span>
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

                          <div className="card-top" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="task-code">{task.id}</span>
                            <span className={`priority-badge ${task.priority ? task.priority.toLowerCase() : 'medium'}`}>
                              {task.priority || 'Medium'}
                            </span>
                            <span className={`health-pill ${task.deadlineHealth ? task.deadlineHealth.toLowerCase() : 'green'}`}>
                              {task.deadlineHealth || 'Green'}
                            </span>

                            {/* Assigner Deletion Authorization Button */}
                            {(() => {
                              const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
                              const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

                              if (isCreator || isSuperAdmin10001) {
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteTask(task.id);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      marginLeft: 'auto',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                    title="Delete task assignment (Assigner Only)"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Mandatory Submission Format Requirement Badge */}
                          {task.requiredFormats && !task.requiredFormats.includes('ANY') && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', marginBottom: '2px', fontSize: '10px', fontWeight: '800', color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 7px', borderRadius: '6px' }}>
                              <FileText size={11} color="#0284c7" />
                              <span>Required Format: {task.requiredFormats.join(' + ')}</span>
                            </div>
                          )}

                          {/* Comprehensive Delegation / Reassignment Info Banner */}
                          {task.delegatedByName && (
                            <div style={{
                              marginTop: '6px',
                              marginBottom: '6px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: currentRole === 'faculty' ? '#f0fdf4' : '#eff6ff',
                              border: currentRole === 'faculty' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                              fontSize: '11px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{
                                  fontWeight: '800',
                                  color: currentRole === 'faculty' ? '#166534' : '#1e40af',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <span>{currentRole === 'faculty' ? '👑 Assigned from Super Admin' : 'ℹ️ Task Reassigned to Faculty'}</span>
                                </span>
                                <span style={{
                                  fontSize: '9.5px',
                                  background: currentRole === 'faculty' ? '#dcfce7' : '#dbeafe',
                                  color: currentRole === 'faculty' ? '#15803d' : '#1e40af',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '700'
                                }}>
                                  {task.assigneeDept || 'Faculty'}
                                </span>
                              </div>

                              <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '11.5px' }}>
                                Assigned to: <span style={{ color: '#2563eb' }}>{task.assigneeName}</span>
                              </div>

                              {task.delegationNotes && (
                                <div style={{
                                  fontSize: '10.5px',
                                  color: '#334155',
                                  marginTop: '4px',
                                  background: '#ffffff',
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  border: currentRole === 'faculty' ? '1px solid #dcfce7' : '1px solid #e2e8f0',
                                  fontStyle: 'italic'
                                }}>
                                  Delegation Note: "{task.delegationNotes}"
                                </div>
                              )}

                              <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1', fontWeight: '700' }}>
                                👑 <span>{task.creatorName || 'Super Admin'}</span> ➔ 🏛️ <span>{task.delegatedByName || task.originalAssigneeName || 'Admin'}</span> ➔ 🎓 <span style={{ color: '#2563eb' }}>{task.assigneeName}</span>
                              </div>
                            </div>
                          )}



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
                            {(() => {
                              const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
                              const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
                              const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

                              // Assignee Stage Restriction Guard: Assignee cannot self-accept or self-review
                              let allowedStages = STAGES;
                              if (isAssignee && !isCreator && !isSuperAdmin10001) {
                                allowedStages = STAGES.filter(s => ['Assigned', 'In Progress', 'Submitted for Review'].includes(s));
                              }

                              return (
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
                                  {allowedStages.map((s) => (
                                    <option key={s} value={s}>
                                      Stage: {s}
                                    </option>
                                  ))}
                                </select>
                              );
                            })()}
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

                              {isLeader && task.stage !== 'Accepted' && (
                                <button
                                  className="action-btn-small forward"
                                  title="Forward / Delegate Task to Faculty"
                                  onClick={() => onOpenForwardModal && onOpenForwardModal(task)}
                                  style={{ padding: '6px 10px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Send size={12} />
                                  <span>Forward</span>
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

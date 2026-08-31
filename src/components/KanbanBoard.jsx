import React, { useState, useMemo } from 'react';
import { 
  Clock, AlertTriangle, MessageSquare, Send, Calendar, RefreshCw, 
  ChevronDown, ChevronRight, Layers, Paperclip, Trash2, Building2, 
  CheckCircle2, LayoutGrid, List, Check, ChevronsUpDown, Star
} from 'lucide-react';
import { STAGES, formatDueDateWithDayTime, getUrgentCountdownInfo } from '../data/initialData';

function getStageColorClass(stage) {
  switch (stage) {
    case 'Assigned': return 'blue';
    case 'In Progress': return 'indigo';
    case 'Submitted for Review': return 'purple';
    case 'Accepted': return 'emerald';
    case 'Re-issued': return 'red';
    default: return 'blue';
  }
}

// 🌟 Compute Faculty / Teacher Average Rating across rated tasks
export function getFacultyAvgRating(assigneeId, assigneeName, allTasks = []) {
  if (!allTasks || allTasks.length === 0) return { avg: null, count: 0 };
  const rated = allTasks.filter(t => {
    const matchId = assigneeId && (t.assigneeId === assigneeId);
    const matchName = assigneeName && t.assigneeName && (t.assigneeName.toLowerCase() === assigneeName.toLowerCase());
    return (matchId || matchName) && typeof t.rating === 'number' && t.rating > 0;
  });
  if (rated.length === 0) return { avg: null, count: 0 };
  const total = rated.reduce((sum, t) => sum + t.rating, 0);
  const avg = (total / rated.length).toFixed(1);
  return { avg, count: rated.length };
}

// 🏫 Compute School / Department Average Rating across all department tasks
export function getSchoolAvgRating(schoolName, allTasks = []) {
  if (!allTasks || allTasks.length === 0 || !schoolName) return { avg: null, count: 0 };
  const rated = allTasks.filter(t => {
    const matchSchool = (t.departmentName || 'General University Administration').toLowerCase() === schoolName.toLowerCase();
    return matchSchool && typeof t.rating === 'number' && t.rating > 0;
  });
  if (rated.length === 0) return { avg: null, count: 0 };
  const total = rated.reduce((sum, t) => sum + t.rating, 0);
  const avg = (total / rated.length).toFixed(1);
  return { avg, count: rated.length };
}


// 🎨 Dynamic status color styling (Red, Yellow, Green) for task cards
function getTaskCardStyles(task, isIdle) {
  if (isIdle) {
    return {
      background: '#fff1f2',
      border: '1.5px solid #fca5a5',
      borderLeft: '5px solid #ef4444'
    };
  }
  const health = task.deadlineHealth || (task.priority === 'Urgent' ? 'Red' : 'Green');
  if (health === 'Red' || task.priority === 'Urgent') {
    return {
      background: '#fff5f5',
      border: '1.5px solid #fca5a5',
      borderLeft: '5px solid #ef4444'
    };
  }
  if (health === 'Yellow' || task.priority === 'High') {
    return {
      background: '#fefce8',
      border: '1.5px solid #fde047',
      borderLeft: '5px solid #eab308'
    };
  }
  return {
    background: '#f0fdf4',
    border: '1.5px solid #86efac',
    borderLeft: '5px solid #22c55e'
  };
}

function getCompactRowStyles(task, isIdle) {
  if (isIdle) {
    return {
      background: '#fff1f2',
      border: '1px solid #fecaca',
      borderLeft: '4px solid #ef4444'
    };
  }
  const health = task.deadlineHealth || (task.priority === 'Urgent' ? 'Red' : 'Green');
  if (health === 'Red' || task.priority === 'Urgent') {
    return {
      background: '#fff5f5',
      border: '1px solid #fecaca',
      borderLeft: '4px solid #ef4444'
    };
  }
  if (health === 'Yellow' || task.priority === 'High') {
    return {
      background: '#fefce8',
      border: '1px solid #fde68a',
      borderLeft: '4px solid #eab308'
    };
  }
  return {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderLeft: '4px solid #22c55e'
  };
}

// 📇 Single Compact Task Row (For High-Density Scanning of 100+ Tasks)
function CompactTaskRow({
  task,
  team,
  authUser,
  allTasks,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  onOpenForwardModal,
  onRateTask,
  currentRole
}) {
  const assignee = team ? team.find((u) => u.id === task.assigneeId) : null;
  const isIdle = task.isIdle;
  const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
  const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

  let allowedStages = STAGES;
  const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
  if (isAssignee && !isCreator && !isSuperAdmin10001) {
    if (['Submitted for Review', 'Under Review', 'Accepted'].includes(task.stage)) {
      allowedStages = [task.stage];
    } else {
      allowedStages = STAGES.filter(s => ['Assigned', 'In Progress', 'Submitted for Review'].includes(s));
    }
  }


  const rowStyle = getCompactRowStyles(task, isIdle);
  const facultyAvg = getFacultyAvgRating(task.assigneeId, task.assigneeName, allTasks);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '8px 12px',
      background: rowStyle.background,
      border: rowStyle.border,
      borderLeft: rowStyle.borderLeft,
      borderRadius: '8px',
      fontSize: '12px',
      transition: 'all 0.15s ease',
      flexWrap: 'wrap',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    }}>

      {/* Left: ID + Title + Health + Star Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px', minWidth: '240px' }}>
        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#1e3a8a', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>
          {task.id}
        </span>
        <span 
          onClick={() => onEditTask(task)} 
          style={{ fontWeight: '700', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}
          title={task.title}
        >
          {task.title}
        </span>
        <span style={{
          fontSize: '9.5px',
          fontWeight: '700',
          padding: '1px 6px',
          borderRadius: '10px',
          background: task.deadlineHealth === 'Red' ? '#fee2e2' : task.deadlineHealth === 'Yellow' ? '#fef3c7' : '#dcfce7',
          color: task.deadlineHealth === 'Red' ? '#b91c1c' : task.deadlineHealth === 'Yellow' ? '#92400e' : '#166534'
        }}>
          {task.deadlineHealth || 'On Track'}
        </span>

        {/* Task Star Rating Pill */}
        {task.rating > 0 && (
          <span style={{
            fontSize: '9.5px',
            fontWeight: '800',
            padding: '1px 6px',
            borderRadius: '10px',
            background: '#fefce8',
            color: '#854d0e',
            border: '1px solid #fde047',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
          }} title={`Task Rating: ${task.rating} / 5 Stars`}>
            <Star size={10} color="#eab308" fill="#eab308" />
            <span>{task.rating}.0</span>
          </span>
        )}
      </div>

      {/* Middle: Assignee + Teacher Average Rating + Due Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {assignee ? assignee.avatar : 'FC'}
          </div>
          <span style={{ fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.assigneeName || 'Faculty'}
          </span>
          {facultyAvg && facultyAvg.avg && (
            <span style={{
              fontSize: '9px',
              fontWeight: '800',
              color: '#854d0e',
              background: '#fefce8',
              border: '1px solid #fde047',
              padding: '0 4px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px'
            }} title={`Teacher Avg Rating: ${facultyAvg.avg} / 5 (${facultyAvg.count} tasks)`}>
              <Star size={8} color="#eab308" fill="#eab308" />
              <span>{facultyAvg.avg}</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#64748b' }}>
          <Clock size={11} color="#2563eb" />
          <span>{formatDueDateWithDayTime(task.dueDate, task.dueTime)}</span>
        </div>
      </div>


      {/* Right: Quick Stage Select + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <select
          value={task.stage}
          onChange={(e) => onMoveStage(task.id, e.target.value)}
          style={{
            padding: '3px 6px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {allowedStages.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          title="Task Chat"
          onClick={() => onOpenChat(task)}
          style={{ padding: '3px 6px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer', fontSize: '10.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}
        >
          <MessageSquare size={11} /> Chat
        </button>

        {task.stage !== 'Accepted' && (
          <button
            title="Request Extension"
            onClick={() => onOpenExtensionModal(task)}
            style={{ padding: '3px 6px', borderRadius: '4px', background: hasPendingExt ? '#fef3c7' : '#fffbeb', color: '#b45309', border: hasPendingExt ? '1px solid #f59e0b' : 'none', cursor: 'pointer', fontSize: '10.5px', fontWeight: '600' }}
          >
            Ext
          </button>
        )}

        {isLeader && (
          <button
            title="Review"
            onClick={() => onOpenReviewModal(task)}
            style={{ padding: '3px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#047857', border: 'none', cursor: 'pointer', fontSize: '10.5px', fontWeight: '600' }}
          >
            Review
          </button>
        )}

        {isLeader && task.stage !== 'Accepted' && (
          <button
            title="Forward to Faculty"
            onClick={() => onOpenForwardModal && onOpenForwardModal(task)}
            style={{ padding: '3px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer', fontSize: '10.5px', fontWeight: '600' }}
          >
            Forward
          </button>
        )}

        {(isCreator || isSuperAdmin10001) && (
          <button
            onClick={() => onDeleteTask(task.id)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
            title="Delete Task"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// 🗂️ Full Standard Task Card
function TaskCard({
  task,
  team,
  authUser,
  allTasks,
  onEditTask,
  onMoveStage,
  onDeleteTask,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  onOpenForwardModal,
  onToggleSubtask,
  onRateTask,
  currentRole
}) {
  const assignee = team ? team.find((u) => u.id === task.assigneeId) : null;
  const isIdle = task.isIdle;
  const hasPendingExt = task.extensions && task.extensions.some(e => e.status === 'PENDING');
  const urgentInfo = getUrgentCountdownInfo(task.dueDate, task.dueTime, task.stage);
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const isCreator = authUser?.name === task.creatorName || authUser?.id === task.creatorId || authUser?.employeeId === task.creatorId;
  const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

  let allowedStages = STAGES;
  const isAssignee = authUser?.name === task.assigneeName || authUser?.id === task.assigneeId || authUser?.employeeId === task.assigneeId;
  if (isAssignee && !isCreator && !isSuperAdmin10001) {
    if (['Submitted for Review', 'Under Review', 'Accepted'].includes(task.stage)) {
      allowedStages = [task.stage];
    } else {
      allowedStages = STAGES.filter(s => ['Assigned', 'In Progress', 'Submitted for Review'].includes(s));
    }
  }


  const cardStyle = getTaskCardStyles(task, isIdle);
  const facultyAvg = getFacultyAvgRating(task.assigneeId, task.assigneeName, allTasks);

  return (
    <div 
      className={`kanban-card ${isIdle ? 'idle-border' : ''}`}
      style={{
        background: cardStyle.background,
        borderRadius: '10px',
        border: cardStyle.border,
        borderLeft: cardStyle.borderLeft,
        padding: '12px 14px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.15s ease'
      }}
    >
      {/* 1. Card Top: ID + Priority + Health + Star Rating + Delete Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#1e3a8a',
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>
            {task.id}
          </span>

          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            padding: '1px 6px',
            borderRadius: '4px',
            background: task.priority === 'Urgent' || task.priority === 'High' ? '#fef2f2' : '#f8fafc',
            color: task.priority === 'Urgent' || task.priority === 'High' ? '#b91c1c' : '#475569',
            border: `1px solid ${task.priority === 'Urgent' || task.priority === 'High' ? '#fecaca' : '#e2e8f0'}`
          }}>
            {task.priority || 'Medium'}
          </span>

          <span style={{
            fontSize: '10px',
            fontWeight: '700',
            padding: '1px 6px',
            borderRadius: '4px',
            background: task.deadlineHealth === 'Red' ? '#fef2f2' : task.deadlineHealth === 'Yellow' ? '#fffbeb' : '#f0fdf4',
            color: task.deadlineHealth === 'Red' ? '#b91c1c' : task.deadlineHealth === 'Yellow' ? '#a16207' : '#15803d',
            border: `1px solid ${task.deadlineHealth === 'Red' ? '#fecaca' : task.deadlineHealth === 'Yellow' ? '#fde68a' : '#bbf7d0'}`
          }}>
            {task.deadlineHealth || 'On Track'}
          </span>

          {/* Task Star Rating Pill */}
          {task.rating > 0 && (
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              padding: '1px 6px',
              borderRadius: '4px',
              background: '#fefce8',
              color: '#854d0e',
              border: '1px solid #fde047',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px'
            }} title={`Task Quality Rating: ${task.rating} / 5 Stars`}>
              <Star size={10} color="#eab308" fill="#eab308" />
              <span>{task.rating}.0</span>
            </span>
          )}
        </div>


        {(isCreator || isSuperAdmin10001) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Delete task assignment (Assigner Only)"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* 2. Task Title */}
      <h4 
        onClick={() => onEditTask(task)}
        style={{
          fontSize: '13.5px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0,
          lineHeight: '1.35',
          cursor: 'pointer'
        }}
      >
        {task.title}
      </h4>

      {/* 3. Task Description */}
      {task.description && (
        <p style={{
          fontSize: '12px',
          color: '#64748b',
          margin: 0,
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {/* 4. Single Clean Directive / Delegation Strip */}
      {task.delegatedByName ? (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '5px 8px',
          borderRadius: '6px',
          fontSize: '10.5px',
          color: '#334155'
        }}>
          <div style={{ fontWeight: '600' }}>
            DIRECTIVE: <span>{task.creatorName || 'Super Admin'}</span> ➔ <span>{task.delegatedByName}</span> ➔ <strong style={{ color: '#2563eb' }}>{task.assigneeName}</strong>
          </div>
          {task.delegationNotes && (
            <div style={{ fontStyle: 'italic', color: '#64748b', marginTop: '2px', fontSize: '10px' }}>
              "{task.delegationNotes}"
            </div>
          )}
        </div>
      ) : (
        (() => {
          if (isAssignee && !isCreator) {
            return (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', color: '#475569' }}>
                Assigned by: <strong>{task.creatorName || 'Super Admin'}</strong>
              </div>
            );
          } else if (isCreator && !isAssignee) {
            return (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', color: '#475569' }}>
                Assigned to: <strong>{task.assigneeName}</strong>
              </div>
            );
          }
          return null;
        })()
      )}

      {/* 5. Alerts (Urgent Countdown / Extension / Idle) */}
      {urgentInfo && (
        <div style={{
          background: urgentInfo.bgColor,
          border: `1px solid ${urgentInfo.borderColor}`,
          color: urgentInfo.textColor,
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10.5px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={12} />
          <span>{urgentInfo.text}</span>
        </div>
      )}

      {hasPendingExt && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#b45309',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10.5px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={11} />
          <span>Extension Requested</span>
        </div>
      )}

      {isIdle && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10.5px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <AlertTriangle size={11} />
          <span>Idle Flag (No update for 3-5 days)</span>
        </div>
      )}

      {/* 6. Due Date & Format Requirement */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', fontSize: '11px', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} color="#2563eb" />
          <span>Due: <strong>{formatDueDateWithDayTime(task.dueDate, task.dueTime)}</strong></span>
        </div>
        {task.requiredFormats && !task.requiredFormats.includes('ANY') && (
          <span style={{ fontSize: '9.5px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
            {task.requiredFormats.join('/')}
          </span>
        )}
      </div>

      {/* 7. Attached Documents Pills */}
      {task.attachments && task.attachments.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
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
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none'
              }}
              title={`Download ${att.name}`}
            >
              <Paperclip size={10} color="#2563eb" />
              <span>{att.name}</span>
            </a>
          ))}
        </div>
      )}

      {/* 8. Explicit Interactive Stage Changer Dropdown */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
      >
        <label style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>
          Stage:
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
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            fontSize: '11.5px',
            fontWeight: '600',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {allowedStages.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 9. Subtask Progress Checklist */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="card-subtasks" style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
          <div className="subtasks-header" style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
            <span>Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})</span>
          </div>
          {task.subtasks.map((st) => (
            <label key={st.id || st.text} className="subtask-item" style={{ fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={st.done}
                onChange={() => onToggleSubtask(task.id, st.id)}
              />
              <span className={st.done ? 'completed' : ''} style={{ color: st.done ? '#94a3b8' : '#334155' }}>
                {st.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* 10. Re-issued Feedback Banner */}
      {task.stage === 'Re-issued' && task.review && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', color: '#b91c1c' }}>
          <strong>Revision Note:</strong> {task.review.feedback}
        </div>
      )}

      {/* 11. Quick Star Rater for Leaders (Super Admin, Admin, HOD) */}
      {isLeader && onRateTask && (task.stage === 'Accepted' || task.stage === 'Submitted for Review' || task.rating > 0) && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', background: '#fefce8', border: '1px solid #fde047', borderRadius: '8px', fontSize: '11px' }}
        >
          <span style={{ fontWeight: '700', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} color="#eab308" fill="#eab308" />
            <span>{task.rating ? `Quality: ${task.rating} ★` : 'Rate Submission:'}</span>
          </span>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onRateTask(task.id, s);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', lineHeight: 1 }}
                title={`Award ${s} Star${s > 1 ? 's' : ''}`}
              >
                <Star
                  size={15}
                  color={(task.rating || 0) >= s ? '#eab308' : '#cbd5e1'}
                  fill={(task.rating || 0) >= s ? '#eab308' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 12. Card Footer: Assignee Avatar + Faculty Avg Rating + Action Toolbar */}
      <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {assignee ? assignee.avatar : 'FC'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>
            {task.assigneeName || (assignee ? assignee.name : 'Faculty')}
          </span>
          {facultyAvg && facultyAvg.avg && (
            <span style={{
              fontSize: '9.5px',
              fontWeight: '800',
              color: '#854d0e',
              background: '#fefce8',
              border: '1px solid #fde047',
              padding: '1px 5px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px'
            }} title={`Teacher Overall Rating: ${facultyAvg.avg} / 5 (${facultyAvg.count} tasks)`}>
              <Star size={9} color="#eab308" fill="#eab308" />
              <span>{facultyAvg.avg}</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            title="Task Chat Thread"
            onClick={() => onOpenChat(task)}
            style={{ padding: '4px 8px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <MessageSquare size={12} />
            <span>Chat</span>
          </button>

          {task.stage !== 'Accepted' && (
            <button
              title="Request or View Extension"
              onClick={() => onOpenExtensionModal(task)}
              style={{ padding: '4px 8px', borderRadius: '6px', background: hasPendingExt ? '#fef3c7' : '#fffbeb', color: '#b45309', border: hasPendingExt ? '1px solid #f59e0b' : 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Clock size={12} />
              <span>Ext</span>
            </button>
          )}

          {isLeader && (
            <button
              title="Review Submission"
              onClick={() => onOpenReviewModal(task)}
              style={{ padding: '4px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Send size={12} />
              <span>Review</span>
            </button>
          )}

          {isLeader && task.stage !== 'Accepted' && (
            <button
              title="Forward / Delegate Task to Faculty"
              onClick={() => onOpenForwardModal && onOpenForwardModal(task)}
              style={{ padding: '4px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <Send size={11} />
              <span>Forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  onRateTask,
  currentRole,
}) {
  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const [selectedMobileStage, setSelectedMobileStage] = useState('ALL');
  const [groupBySchool, setGroupBySchool] = useState(false);
  const [densityMode, setDensityMode] = useState(isLeader ? 'compact' : 'standard'); // Compact by default for Super Admin & Admin
  const [collapsedSchools, setCollapsedSchools] = useState({});

  const displayedStages = selectedMobileStage === 'ALL' 
    ? STAGES 
    : STAGES.filter(s => s === selectedMobileStage);

  // Group tasks by School / Department
  const schoolGroups = useMemo(() => {
    const groups = {};
    tasks.forEach(t => {
      const school = t.departmentName || 'General University Administration';
      if (!groups[school]) {
        groups[school] = [];
      }
      groups[school].push(t);
    });
    return groups;
  }, [tasks]);

  const schoolNames = Object.keys(schoolGroups);

  const toggleSchoolCollapse = (school) => {
    setCollapsedSchools(prev => ({
      ...prev,
      [school]: !prev[school]
    }));
  };

  const handleExpandAll = () => setCollapsedSchools({});
  const handleCollapseAll = () => {
    const all = {};
    schoolNames.forEach(s => all[s] = true);
    setCollapsedSchools(all);
  };

  return (
    <div>
      {/* Top Controls Toolbar: Stage Dropdown Filter + Grouping & Density Toggles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Stage Filter Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1.5px solid #cbd5e1',
          padding: '6px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          gap: '8px',
          flex: '1 1 240px',
          minWidth: '200px',
          maxWidth: '380px',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <Layers size={15} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>
            Stage:
          </span>
          <select
            value={selectedMobileStage}
            onChange={(e) => setSelectedMobileStage(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: '700',
              color: '#0f172a',
              width: '100%',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <option value="ALL">All Stages ({tasks.length})</option>
            {STAGES.map((s) => {
              const count = tasks.filter(t => t.stage === s).length;
              return (
                <option key={s} value={s}>
                  {s} ({count})
                </option>
              );
            })}
          </select>
          <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0, pointerEvents: 'none' }} />
        </div>

        {/* Desktop / Leader Controls: Group by School + Density Switcher */}
        {isLeader && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {/* Group by School Toggle */}
            <button
              onClick={() => setGroupBySchool(!groupBySchool)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: groupBySchool ? '#0f172a' : '#ffffff',
                color: groupBySchool ? '#ffffff' : '#334155',
                border: `1px solid ${groupBySchool ? '#0f172a' : '#cbd5e1'}`,
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
              title="Group tasks into collapsible School & Faculty Accordions"
            >
              <Building2 size={13} color={groupBySchool ? '#60a5fa' : '#2563eb'} />
              <span>Group by School</span>
              {groupBySchool && (
                <span style={{ fontSize: '9.5px', background: '#3b82f6', color: '#ffffff', padding: '1px 4px', borderRadius: '8px' }}>
                  {schoolNames.length}
                </span>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
              {/* Density Toggle (Standard vs Compact) */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setDensityMode('standard')}
                  style={{
                    padding: '4px 7px',
                    borderRadius: '6px',
                    border: 'none',
                    background: densityMode === 'standard' ? '#ffffff' : 'transparent',
                    color: densityMode === 'standard' ? '#0f172a' : '#64748b',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    boxShadow: densityMode === 'standard' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                  title="Standard Card View"
                >
                  <LayoutGrid size={12} />
                  <span>Cards</span>
                </button>

                <button
                  onClick={() => setDensityMode('compact')}
                  style={{
                    padding: '4px 7px',
                    borderRadius: '6px',
                    border: 'none',
                    background: densityMode === 'compact' ? '#ffffff' : 'transparent',
                    color: densityMode === 'compact' ? '#0f172a' : '#64748b',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    boxShadow: densityMode === 'compact' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                  title="High-Density Compact Row View"
                >
                  <List size={12} />
                  <span>Compact</span>
                </button>
              </div>

              {/* Expand / Collapse All (When in Grouped mode) */}
              {groupBySchool && (
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    onClick={handleExpandAll}
                    style={{ padding: '4px 6px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '10.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                  >
                    Expand
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    style={{ padding: '4px 6px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '10.5px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
                  >
                    Collapse
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* ========================================================
          MODE 1: Grouped by School Accordions (Super Admin High Volume)
          ======================================================== */}
      {groupBySchool ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {schoolNames.map((school) => {
            const schoolTasks = schoolGroups[school] || [];
            const isCollapsed = !!collapsedSchools[school];
            const total = schoolTasks.length;
            const onTrack = schoolTasks.filter(t => t.deadlineHealth === 'Green' || t.stage === 'Accepted').length;
            const nearDue = schoolTasks.filter(t => t.deadlineHealth === 'Yellow').length;
            const urgentOverdue = schoolTasks.filter(t => t.deadlineHealth === 'Red' || t.deadlineHealth === 'Orange' || t.isIdle).length;
            const accepted = schoolTasks.filter(t => t.stage === 'Accepted').length;
            const progressPercent = total > 0 ? Math.round((accepted / total) * 100) : 0;
            const schoolRating = getSchoolAvgRating(school, tasks);

            return (
              <div 
                key={school} 
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleSchoolCollapse(school)}
                  style={{
                    padding: '12px 16px',
                    background: isCollapsed ? '#ffffff' : '#f8fafc',
                    borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isCollapsed ? <ChevronRight size={18} color="#64748b" /> : <ChevronDown size={18} color="#2563eb" />}
                    <Building2 size={17} color="#2563eb" />
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      {school}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e3a8a', background: '#eff6ff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      {total} {total === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  {/* Summary Metric Badges & School Average Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* School Average Rating Pill */}
                    {schoolRating.avg ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#854d0e',
                        background: '#fefce8',
                        border: '1px solid #fde047',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }} title={`School Performance Average: ${schoolRating.avg} / 5 based on ${schoolRating.count} reviewed tasks`}>
                        <Star size={12} color="#eab308" fill="#eab308" />
                        <span>{schoolRating.avg} Avg</span>
                        <span style={{ fontSize: '9.5px', color: '#a16207' }}>({schoolRating.count})</span>
                      </span>
                    ) : null}

                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px' }}>
                      🟢 {onTrack} On Track
                    </span>

                    {nearDue > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#a16207', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px' }}>
                        🟡 {nearDue} Near Due
                      </span>
                    )}

                    {urgentOverdue > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '6px' }}>
                        🔴 {urgentOverdue} Overdue / Critical
                      </span>
                    )}

                    {/* Progress Percent Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: '#16a34a', borderRadius: '4px' }} />
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#475569' }}>
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accordion Content Body */}
                {!isCollapsed && (
                  <div style={{ padding: '14px', background: '#f8fafc' }}>
                    {densityMode === 'compact' ? (
                      /* High Density Compact Rows */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {schoolTasks.map((t) => (
                          <CompactTaskRow
                            key={t.id}
                            task={t}
                            team={team}
                            authUser={authUser}
                            allTasks={tasks}
                            onEditTask={onEditTask}
                            onMoveStage={onMoveStage}
                            onDeleteTask={onDeleteTask}
                            onOpenChat={onOpenChat}
                            onOpenExtensionModal={onOpenExtensionModal}
                            onOpenReviewModal={onOpenReviewModal}
                            onOpenForwardModal={onOpenForwardModal}
                            onRateTask={onRateTask}
                            currentRole={currentRole}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Standard Kanban Grid Scoped to this School */
                      <div className="kanban-container" style={{ scrollSnapType: 'x mandatory' }}>
                        <div className="kanban-grid">
                          {displayedStages.map((stage) => {
                            const stageTasks = schoolTasks
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
                                    <div style={{ textAlign: 'center', padding: '20px 10px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '11.5px' }}>
                                      No tasks in <strong>{stage}</strong>
                                    </div>
                                  ) : (
                                    stageTasks.map((task) => (
                                      <TaskCard
                                        key={task.id}
                                        task={task}
                                        team={team}
                                        authUser={authUser}
                                        allTasks={tasks}
                                        onEditTask={onEditTask}
                                        onMoveStage={onMoveStage}
                                        onDeleteTask={onDeleteTask}
                                        onOpenChat={onOpenChat}
                                        onOpenExtensionModal={onOpenExtensionModal}
                                        onOpenReviewModal={onOpenReviewModal}
                                        onOpenForwardModal={onOpenForwardModal}
                                        onToggleSubtask={onToggleSubtask}
                                        onRateTask={onRateTask}
                                        currentRole={currentRole}
                                      />
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================
            MODE 2: Standard Global Workflow Board
            ======================================================== */
        densityMode === 'compact' ? (
          /* Global Compact Rows */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
                No tasks matching current filter criteria.
              </div>
            ) : (
              tasks.map((t) => (
                <CompactTaskRow
                  key={t.id}
                  task={t}
                  team={team}
                  authUser={authUser}
                  allTasks={tasks}
                  onEditTask={onEditTask}
                  onMoveStage={onMoveStage}
                  onDeleteTask={onDeleteTask}
                  onOpenChat={onOpenChat}
                  onOpenExtensionModal={onOpenExtensionModal}
                  onOpenReviewModal={onOpenReviewModal}
                  onOpenForwardModal={onOpenForwardModal}
                  onRateTask={onRateTask}
                  currentRole={currentRole}
                />
              ))
            )}
          </div>
        ) : (
          /* Global Kanban Columns Grid */
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
                        stageTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            team={team}
                            authUser={authUser}
                            allTasks={tasks}
                            onEditTask={onEditTask}
                            onMoveStage={onMoveStage}
                            onDeleteTask={onDeleteTask}
                            onOpenChat={onOpenChat}
                            onOpenExtensionModal={onOpenExtensionModal}
                            onOpenReviewModal={onOpenReviewModal}
                            onOpenForwardModal={onOpenForwardModal}
                            onToggleSubtask={onToggleSubtask}
                            onRateTask={onRateTask}
                            currentRole={currentRole}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}


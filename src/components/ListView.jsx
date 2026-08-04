import React, { useState } from 'react';
import { Calendar, Trash2, Edit2, ArrowUpDown } from 'lucide-react';
import { STAGES } from '../data/initialData';

export default function ListView({ tasks, team, onEditTask, onMoveStage, onDeleteTask }) {
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const getAssignee = (id) => team.find(m => m.id === id) || { name: 'Unassigned', avatar: '?' };

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
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: 'rgba(18, 24, 36, 0.9)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('id')}>
              ID <ArrowUpDown size={12} />
            </th>
            <th style={{ padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('title')}>
              Task Title <ArrowUpDown size={12} />
            </th>
            <th style={{ padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('stage')}>
              Stage <ArrowUpDown size={12} />
            </th>
            <th style={{ padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('priority')}>
              Priority <ArrowUpDown size={12} />
            </th>
            <th style={{ padding: '0.9rem 1rem' }}>Assignee</th>
            <th style={{ padding: '0.9rem 1rem', cursor: 'pointer' }} onClick={() => handleSort('dueDate')}>
              Due Date <ArrowUpDown size={12} />
            </th>
            <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No tasks matching current filter criteria.
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => {
              const assignee = getAssignee(task.assigneeId);
              return (
                <tr 
                  key={task.id} 
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {task.id}
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {task.description}
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <select 
                      className="select-filter"
                      style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                      value={task.stage}
                      onChange={(e) => onMoveStage(task.id, e.target.value)}
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="assignee-avatar" title={assignee.name}>
                        {assignee.avatar}
                      </div>
                      <span style={{ fontSize: '0.82rem' }}>{assignee.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {task.dueDate}
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '4px 8px' }}
                        onClick={() => onEditTask(task)}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        className="btn-secondary"
                        style={{ padding: '4px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { Calendar, CheckSquare, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { STAGES } from '../data/initialData';

export default function KanbanBoard({ tasks, team, onEditTask, onMoveStage, onDeleteTask }) {
  const getAssignee = (id) => team.find(m => m.id === id) || { name: 'Unassigned', avatar: '?' };

  return (
    <div className="kanban-grid">
      {STAGES.map((stage) => {
        const stageTasks = tasks.filter((t) => t.stage === stage);

        return (
          <div key={stage} className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <span className={`status-dot status-${stage.toLowerCase().replace(' ', '-')}`}></span>
                {stage}
              </div>
              <span className="task-count">{stageTasks.length}</span>
            </div>

            <div className="task-list">
              {stageTasks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 1rem', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.85rem',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  No tasks in {stage}
                </div>
              ) : (
                stageTasks.map((task) => {
                  const assignee = getAssignee(task.assigneeId);
                  const completedSubtasks = (task.subtasks || []).filter(s => s.done).length;

                  return (
                    <div 
                      key={task.id} 
                      className="task-card"
                      onClick={() => onEditTask(task)}
                    >
                      <div className="task-tags">
                        <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        {task.tags.map((tag) => (
                          <span key={tag} className="badge-tag">{tag}</span>
                        ))}
                      </div>

                      <div className="task-card-title">{task.title}</div>
                      <div className="task-card-desc">{task.description}</div>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckSquare size={13} /> {completedSubtasks}/{task.subtasks.length} subtasks
                        </div>
                      )}

                      <div className="task-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="assignee-avatar" title={assignee.name}>
                            {assignee.avatar}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {assignee.name.split(' ')[0]}
                          </span>
                        </div>

                        <div className="due-date">
                          <Calendar size={13} /> {task.dueDate}
                        </div>
                      </div>

                      {/* Quick Action Bar on Card */}
                      <div 
                        style={{ 
                          display: 'flex', 
                          justify: 'space-between', 
                          alignItems: 'center',
                          marginTop: '0.75rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {stage !== 'To Do' && (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              onClick={() => {
                                const prevIdx = STAGES.indexOf(stage) - 1;
                                onMoveStage(task.id, STAGES[prevIdx]);
                              }}
                              title="Move Previous"
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {stage !== 'Done' && (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              onClick={() => {
                                const nextIdx = STAGES.indexOf(stage) + 1;
                                onMoveStage(task.id, STAGES[nextIdx]);
                              }}
                              title="Move Next"
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>

                        <button 
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
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
  );
}

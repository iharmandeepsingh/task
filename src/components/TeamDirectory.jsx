import React from 'react';
import { Mail, ShieldCheck, CheckCircle } from 'lucide-react';

export default function TeamDirectory({ team, tasks }) {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>Workspace Team Directory</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Members & assigned active workloads across the <strong>task assignment</strong> project.
        </p>
      </div>

      <div className="team-grid">
        {team.map((member) => {
          const memberTasks = tasks.filter(t => t.assigneeId === member.id);
          const activeTasks = memberTasks.filter(t => t.stage !== 'Done').length;
          const completedTasks = memberTasks.filter(t => t.stage === 'Done').length;

          return (
            <div key={member.id} className="team-card">
              <div className="team-avatar">
                {member.avatar}
              </div>
              <div className="team-details" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4>{member.name}</h4>
                  <span style={{ 
                    fontSize: '0.68rem', 
                    padding: '2px 6px', 
                    borderRadius: '10px',
                    background: member.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: member.status === 'Active' ? '#10b981' : '#f59e0b',
                    fontWeight: '600'
                  }}>
                    {member.status}
                  </span>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px 0' }}>
                  <ShieldCheck size={13} color="var(--accent-primary)" /> {member.role}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Mail size={12} /> {member.email}
                </p>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '0.85rem', 
                  paddingTop: '0.6rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.75rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Active: </span>
                    <strong style={{ color: '#3b82f6' }}>{activeTasks}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Done: </span>
                    <strong style={{ color: '#10b981' }}>{completedTasks}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

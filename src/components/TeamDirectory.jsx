import React from 'react';
import { Mail, ShieldCheck, CheckCircle, UserPlus, Building2, Smartphone } from 'lucide-react';

export default function TeamDirectory({ team, tasks, currentRole, onOpenHRImport }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
            CT University Employee Master Directory & HR
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Unified Employee Master Records, Organization Unit Memberships & Provisioned Application Accounts.
          </p>
        </div>

        {(currentRole === 'hr' || currentRole === 'superAdmin') && (
          <button className="btn-primary" onClick={onOpenHRImport}>
            <UserPlus size={16} />
            <span>Bulk CSV/XLSX Employee Import</span>
          </button>
        )}
      </div>

      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {team.map((member) => {
          const memberTasks = tasks.filter(t => t.assigneeId === member.id);
          const activeTasks = memberTasks.filter(t => t.stage !== 'Accepted').length;
          const completedTasks = memberTasks.filter(t => t.stage === 'Accepted').length;
          const hasAccount = member.id !== 'usr-3-unprovisioned'; // Demo account check

          return (
            <div key={member.id} className="team-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div className="avatar-small" style={{ width: '42px', height: '42px', fontSize: '14px' }}>
                  {member.avatar}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{member.name}</h4>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 8px', 
                      borderRadius: '10px',
                      background: hasAccount ? '#dcfce7' : '#fef9c3',
                      color: hasAccount ? '#166534' : '#854d0e',
                      fontWeight: '700'
                    }}>
                      {hasAccount ? 'Account Active' : 'Account Not Provisioned'}
                    </span>
                  </div>

                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0', fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '600' }}>
                    <Building2 size={13} /> {member.dept || 'Computer Science & Engineering'}
                  </p>

                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <ShieldCheck size={13} /> Employment Title: {member.role}
                  </p>

                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <Mail size={12} /> {member.email} • ID: {member.employeeId || 'CTU-EMP-101'}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justify: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px', 
                    paddingTop: '8px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Active Tasks: </span>
                      <strong style={{ color: '#3b82f6' }}>{activeTasks}</strong>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>Completed: </span>
                      <strong style={{ color: '#10b981' }}>{completedTasks}</strong>
                    </div>

                    {(currentRole === 'hr' || currentRole === 'superAdmin') && !hasAccount && (
                      <button 
                        style={{ background: 'var(--primary-blue)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                        onClick={() => alert(`Provisioning application account for ${member.name}...`)}
                      >
                        Provision Account
                      </button>
                    )}
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

import React, { useState } from 'react';
import { Mail, ShieldCheck, CheckCircle, UserPlus, Building2, Smartphone, Users, UserCheck, Shield, Search, X } from 'lucide-react';

export default function TeamDirectory({ team, tasks, currentRole, onOpenHRImport }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'FACULTY', 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeam = team.filter((member) => {
    // Category Filter
    let matchesCategory = true;
    if (selectedFilter === 'FACULTY') {
      matchesCategory = member.category === 'Faculty' || (member.role && member.role.toLowerCase().includes('faculty')) || (member.role && member.role.toLowerCase().includes('professor'));
    } else if (selectedFilter === 'ADMIN') {
      matchesCategory = member.category === 'Admin' || (member.role && (member.role.toLowerCase().includes('admin') || member.role.toLowerCase().includes('hr') || member.role.toLowerCase().includes('head')));
    }

    // Name & ID Search Filter
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (member.name && member.name.toLowerCase().includes(q)) ||
      (member.employeeId && member.employeeId.toLowerCase().includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q)) ||
      (member.dept && member.dept.toLowerCase().includes(q)) ||
      (member.role && member.role.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header & Main Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--text-primary)', fontWeight: '800' }}>
            CT University Employee Directory & HR
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Search & Manage Faculty and Administrative Staff Records.
          </p>
        </div>

        {(currentRole === 'hr' || currentRole === 'superAdmin' || currentRole === 'admin') && (
          <button className="btn-primary" onClick={onOpenHRImport} style={{ padding: '8px 14px', borderRadius: '10px' }}>
            <UserPlus size={16} />
            <span>Bulk CSV/XLSX Employee Import</span>
          </button>
        )}
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Real-Time Name / Staff ID Search Bar */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by Name (e.g. Shilpa, Harmanpreet) or Staff ID (e.g. 26010, 309)..."
            style={{
              width: '100%',
              padding: '10px 36px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: '600',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setSelectedFilter('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: selectedFilter === 'ALL' ? '#ffffff' : 'transparent',
              color: selectedFilter === 'ALL' ? '#0f172a' : '#64748b',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: selectedFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            All Staff ({team.length})
          </button>

          <button
            onClick={() => setSelectedFilter('FACULTY')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: selectedFilter === 'FACULTY' ? '#3b82f6' : 'transparent',
              color: selectedFilter === 'FACULTY' ? '#ffffff' : '#64748b',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: selectedFilter === 'FACULTY' ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            🎓 Faculty Directory
          </button>

          <button
            onClick={() => setSelectedFilter('ADMIN')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: selectedFilter === 'ADMIN' ? '#10b981' : 'transparent',
              color: selectedFilter === 'ADMIN' ? '#ffffff' : '#64748b',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: selectedFilter === 'ADMIN' ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            🏛️ Admin Directory
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {filteredTeam.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px 20px', background: '#ffffff', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
            No faculty or staff records found matching "<strong>{searchQuery}</strong>".
          </div>
        ) : (
          filteredTeam.map((member) => {
            const memberTasks = tasks.filter(t => t.assigneeId === member.id);
            const activeTasks = memberTasks.filter(t => t.stage !== 'Accepted' && t.stage !== 'Completed').length;
            const completedTasks = memberTasks.filter(t => t.stage === 'Accepted' || t.stage === 'Completed').length;
            const hasAccount = member.id !== 'usr-3-unprovisioned'; // Demo account check
            const isFacultyRole = member.category === 'Faculty' || (member.role && member.role.toLowerCase().includes('faculty')) || (member.role && member.role.toLowerCase().includes('professor'));

            return (
              <div key={member.id} className="team-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div className="avatar-small" style={{ width: '44px', height: '44px', fontSize: '14px', background: isFacultyRole ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
                    {member.avatar}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{member.name}</h4>
                      
                      {/* Classification Badge */}
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        background: isFacultyRole ? '#eff6ff' : '#ecfdf5',
                        color: isFacultyRole ? '#1d4ed8' : '#047857',
                        fontWeight: '800',
                        border: `1px solid ${isFacultyRole ? '#bfdbfe' : '#a7f3d0'}`
                      }}>
                        {isFacultyRole ? '🎓 Faculty' : '🏛️ Admin'}
                      </span>
                    </div>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '3px 0', fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '600' }}>
                      <Building2 size={13} /> {member.dept || 'Computer Science & Engineering'}
                    </p>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <ShieldCheck size={13} /> Title: {member.role}
                    </p>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <Mail size={12} /> {member.email} • <strong>Staff ID: {member.employeeId || '26010'}</strong>
                    </p>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px', 
                      paddingTop: '8px',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '12px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Tasks Active: </span>
                        <strong style={{ color: '#3b82f6' }}>{activeTasks}</strong>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>Completed: </span>
                        <strong style={{ color: '#10b981' }}>{completedTasks}</strong>
                      </div>

                      {(currentRole === 'hr' || currentRole === 'superAdmin') && !hasAccount && (
                        <button 
                          style={{ background: 'var(--primary-blue)', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
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
          })
        )}
      </div>
    </div>
  );
}

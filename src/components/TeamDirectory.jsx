import React, { useState } from 'react';
import { Mail, ShieldCheck, CheckCircle, UserPlus, Building2, Smartphone, Users, UserCheck, Shield, Search, X, Trash2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function TeamDirectory({ team = [], tasks = [], currentRole, authUser, onOpenHRImport, onDeleteEmployee }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'FACULTY', 'ADMIN'
  const [searchQuery, setSearchQuery] = useState('');
  const [showVaultModal, setShowVaultModal] = useState(false);

  // Check if current logged-in user is Super Admin ID 10001
  const isSuperAdmin10001 = authUser?.employeeId === '10001' || authUser?.id === 'usr-10001' || currentRole === 'superAdmin';

  const filteredTeam = team.filter((member) => {
    let matchesCategory = true;
    if (selectedFilter === 'FACULTY') {
      matchesCategory = member.category === 'Faculty' || (member.role && member.role.toLowerCase().includes('faculty')) || (member.role && member.role.toLowerCase().includes('professor'));
    } else if (selectedFilter === 'ADMIN') {
      matchesCategory = member.category === 'Admin' || (member.role && (member.role.toLowerCase().includes('admin') || member.role.toLowerCase().includes('hr') || member.role.toLowerCase().includes('head')));
    }

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
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.3rem', color: 'var(--text-primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>CT University Employee Directory & HR</span>
            {isSuperAdmin10001 && (
              <span style={{ fontSize: '11px', background: '#8b5cf6', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                SUPER ADMIN 10001 VAULT ACCESS
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Search, Manage, and View Decrypted Faculty & Administrative Staff Passwords.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* 🔑 Decrypted Staff Passwords Vault Button (For Super Admin 10001) */}
          {isSuperAdmin10001 && (
            <button
              onClick={() => setShowVaultModal(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)'
              }}
            >
              <KeyRound size={16} />
              <span>🔑 Decrypted Staff Passwords Vault (10001)</span>
            </button>
          )}

          {currentRole !== 'faculty' && (
            <button className="btn-primary" onClick={onOpenHRImport} style={{ padding: '8px 14px', borderRadius: '10px' }}>
              <UserPlus size={16} />
              <span>Bulk CSV/XLSX Employee Import</span>
            </button>
          )}
        </div>
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
            placeholder="Search faculty by Name (e.g. Shilpa, Harmanpreet) or Staff ID (e.g. 26001, 26010, 309)..."
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedFilter('ALL')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: selectedFilter === 'ALL' ? '#3b82f6' : '#f1f5f9',
              color: selectedFilter === 'ALL' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            👥 All Staff ({team.length})
          </button>

          <button
            onClick={() => setSelectedFilter('FACULTY')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: selectedFilter === 'FACULTY' ? '#2563eb' : '#f1f5f9',
              color: selectedFilter === 'FACULTY' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🎓 Faculty Directory
          </button>

          <button
            onClick={() => setSelectedFilter('ADMIN')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: selectedFilter === 'ADMIN' ? '#10b981' : '#f1f5f9',
              color: selectedFilter === 'ADMIN' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🏛️ Admin Directory
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredTeam.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px 20px', background: '#ffffff', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
            No faculty or staff records found matching "<strong>{searchQuery}</strong>".
          </div>
        ) : (
          filteredTeam.map((member) => {
            const memberTasks = tasks.filter(t => t.assigneeId === member.id);
            const activeTasks = memberTasks.filter(t => t.stage !== 'Accepted').length;
            const completedTasks = memberTasks.filter(t => t.stage === 'Accepted').length;
            const isFacultyRole = member.category === 'Faculty' || (member.role && member.role.toLowerCase().includes('faculty')) || (member.role && member.role.toLowerCase().includes('professor'));
            const memberPassword = member.password || member.name || '123';

            return (
              <div key={member.id} className="team-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div className="avatar-small" style={{ width: '44px', height: '44px', fontSize: '14px', background: isFacultyRole ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
                    {member.avatar}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{member.name}</h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                        {/* 🗑️ Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${member.name}" (Staff ID: ${member.employeeId || member.id}) from the Master Directory?`)) {
                              if (onDeleteEmployee) {
                                onDeleteEmployee(member.id);
                              }
                            }
                          }}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '3px 7px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title={`Delete ${member.name} from directory`}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '3px 0', fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '600' }}>
                      <Building2 size={13} /> {member.dept || 'School of Engineering'}
                    </p>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <ShieldCheck size={13} /> Title: {member.role}
                    </p>

                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <Mail size={12} /> {member.email} • <strong>Staff ID: {member.employeeId || '26010'}</strong>
                    </p>

                    {/* 🔑 Password Badge: Plain ONLY for Super Admin 10001 */}
                    <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '8px', background: isSuperAdmin10001 ? '#ecfdf5' : '#f8fafc', border: `1px solid ${isSuperAdmin10001 ? '#a7f3d0' : '#e2e8f0'}`, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {isSuperAdmin10001 ? (
                        <div style={{ color: '#065f46', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <KeyRound size={13} color="#059669" />
                          <span>🔑 Password: <code style={{ fontSize: '12px', color: '#047857', fontWeight: '900' }}>{memberPassword}</code></span>
                        </div>
                      ) : (
                        <div style={{ color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Lock size={13} color="#94a3b8" />
                          <span>🔒 Password: <code style={{ color: '#94a3b8' }}>••••••••</code> <span style={{ fontSize: '10px', color: '#94a3b8' }}>(10001 Protected)</span></span>
                        </div>
                      )}
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px', 
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔑 Super Admin 10001 Decrypted Passwords Vault Modal */}
      {showVaultModal && (
        <div className="modal-backdrop" onClick={() => setShowVaultModal(false)} style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '16px'
        }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: '820px', background: '#ffffff', borderRadius: '18px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={22} color="#c4b5fd" />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                    Super Admin 10001 Decrypted Staff Passwords Vault
                  </h3>
                  <p style={{ fontSize: '11px', color: '#ddd6fe', margin: 0 }}>
                    Master Security Decryption Roster ({team.length} Faculty & Admin Accounts)
                  </p>
                </div>
              </div>

              <button onClick={() => setShowVaultModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Table Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px' }}>Staff ID</th>
                    <th style={{ padding: '10px 12px' }}>Staff Name</th>
                    <th style={{ padding: '10px 12px' }}>Official Email</th>
                    <th style={{ padding: '10px 12px' }}>Department</th>
                    <th style={{ padding: '10px 12px' }}>🔑 Decrypted Password</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m) => (
                    <tr key={m.id || m.employeeId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#2563eb' }}>{m.employeeId || m.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700' }}>{m.name}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{m.email}</td>
                      <td style={{ padding: '10px 12px' }}>{m.dept || 'Engineering'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '6px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontWeight: '900', fontSize: '12px' }}>
                          🔑 {m.password || m.name || '123'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

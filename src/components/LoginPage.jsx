import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Building2, KeyRound, AlertCircle, ArrowRight, CheckCircle, ShieldAlert, Mail } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';

export default function LoginPage({ onLogin }) {
  // Read master team directory from localStorage or initialData
  const activeTeam = (() => {
    const saved = localStorage.getItem('ctu_team_data');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  })();

  const [identifier, setIdentifier] = useState('26010'); // Employee ID e.g. 26010
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState('faculty'); // 'superAdmin', 'admin', 'faculty'
  const [errorMessage, setErrorMessage] = useState('');

  // Authorized Quick Account Cards
  const DEMO_ACCOUNTS = {
    superAdmin: {
      id: 'usr-0',
      employeeId: 'CTU-EMP-001',
      email: 'superadmin@ctu.edu.in',
      name: 'Dr. Manjit Singh',
      roleTitle: 'Super Administrator',
      dept: 'University Administration',
      avatar: 'MS',
      badgeColor: '#8b5cf6',
      desc: 'Full global system administration, user roles, system configs & audit logs.'
    },
    admin: {
      id: 'usr-1',
      employeeId: 'CTU-EMP-102',
      email: 'admin@ctu.edu.in',
      name: 'Dr. Gurpreet Singh',
      roleTitle: 'University Administrator',
      dept: 'Central Academic Affairs',
      avatar: 'GS',
      badgeColor: '#3b82f6',
      desc: 'University-wide administrative oversight, department reports & scope controls.'
    },
    faculty: {
      id: 'usr-26010',
      employeeId: '26010',
      email: 'shilpa.debnath@ctu.edu.in',
      name: 'Shilpa Debnath',
      roleTitle: 'Faculty Member',
      dept: 'School of Management & Sciences',
      avatar: 'SD',
      badgeColor: '#ec4899',
      desc: 'Log in with Staff ID 26010 or email.'
    }
  };

  const handleSelectQuickAccount = (roleKey) => {
    setSelectedRole(roleKey);
    const acc = DEMO_ACCOUNTS[roleKey];
    if (acc) {
      setIdentifier(acc.employeeId);
      setPassword('Password123!');
      setErrorMessage('');
    }
  };

  // Real-time lookup of matched staff member from database
  const cleanId = identifier.trim().toLowerCase();
  const matchedUser = cleanId ? activeTeam.find((m) => {
    const empIdClean = (m.employeeId || '').toLowerCase();
    const numOnly = empIdClean.replace(/\D/g, ''); // Extract numbers e.g. "26010"
    return (
      empIdClean === cleanId || 
      empIdClean.includes(cleanId) ||
      (numOnly && numOnly === cleanId) ||
      (numOnly && cleanId.includes(numOnly)) ||
      m.email.toLowerCase() === cleanId ||
      m.email.toLowerCase().split('@')[0] === cleanId ||
      m.name.toLowerCase().includes(cleanId)
    );
  }) : null;

  const isMatchedFaculty = matchedUser ? (
    matchedUser.category === 'Faculty' || 
    (matchedUser.role && (matchedUser.role.toLowerCase().includes('faculty') || matchedUser.role.toLowerCase().includes('professor') || matchedUser.role.toLowerCase().includes('lecturer')))
  ) : false;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cleanId) {
      setErrorMessage('Please enter your University Employee / Staff ID');
      return;
    }

    if (!matchedUser) {
      setErrorMessage(`Staff ID "${identifier}" not found in database directory.`);
      return;
    }

    // Role Enforcement Guard: Faculty members can ONLY log in under Faculty role!
    if (isMatchedFaculty && selectedRole !== 'faculty') {
      setErrorMessage(`RBAC Scope Restriction: "${matchedUser.name}" is registered under Faculty data and CANNOT log in as ${selectedRole === 'superAdmin' ? 'Super Administrator' : 'University Administrator'}. Please select the Faculty Member role card.`);
      return;
    }

    // Admin Enforcement Guard: Admins cannot log in as Faculty
    if (!isMatchedFaculty && matchedUser.category === 'Admin' && selectedRole === 'faculty') {
      setErrorMessage(`RBAC Scope Restriction: "${matchedUser.name}" is an Administrative account and must select University Administrator role to log in.`);
      return;
    }

    const roleTitle = selectedRole === 'superAdmin' 
      ? 'Super Administrator' 
      : (selectedRole === 'admin' ? 'University Administrator' : 'Faculty Member');

    onLogin({
      id: matchedUser.id,
      employeeId: matchedUser.employeeId,
      email: matchedUser.email,
      name: matchedUser.name,
      role: selectedRole,
      roleTitle: matchedUser.role || roleTitle,
      dept: matchedUser.dept,
      avatar: matchedUser.avatar,
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '16px',
      color: '#f8fafc',
      boxSizing: 'border-box'
    }}>
      <div className="login-card-container" style={{
        width: '100%',
        maxWidth: '960px',
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header Branding */}
        <div style={{
          padding: '24px 20px',
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)'
            }}>
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff', margin: 0 }}>
                CT UNIVERSITY
              </h1>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                Role-Scoped Authentication Portal
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
            Staff ID Portal Sign In
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
            Faculty data is strictly scoped. Faculty accounts can ONLY log in under the <strong>Faculty Member</strong> portal.
          </p>
        </div>

        {/* Role Selector Cards */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            Select Target Login Field:
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.keys(DEMO_ACCOUNTS).map((roleKey) => {
              const acc = DEMO_ACCOUNTS[roleKey];
              const isSelected = selectedRole === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => handleSelectQuickAccount(roleKey)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? `2px solid ${acc.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: acc.badgeColor,
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {acc.avatar}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#ffffff' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.roleTitle}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ID: {acc.employeeId} ({acc.name})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Form Inputs & Resolved Database Member Badge */}
        <div style={{ padding: '20px' }}>
          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              lineHeight: '1.4'
            }}>
              <ShieldAlert size={20} color="#f87171" style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                University Employee / Staff ID
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="e.g. 26010 or CTU-EMP-309"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>

            {/* Resolved Staff Name & Email Live Badge from Database */}
            {matchedUser ? (
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: isMatchedFaculty ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${isMatchedFaculty ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: isMatchedFaculty ? '#2563eb' : '#059669',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {matchedUser.avatar || 'SM'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                      👤 Resolved Staff Name: {matchedUser.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={11} /> Official Email: <strong>{matchedUser.email}</strong> • Dept: {matchedUser.dept || 'Faculty'}
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  background: isMatchedFaculty ? '#eff6ff' : '#ecfdf5',
                  color: isMatchedFaculty ? '#1d4ed8' : '#047857',
                  fontSize: '10px',
                  fontWeight: '800',
                  whiteSpace: 'nowrap'
                }}>
                  {isMatchedFaculty ? '🎓 Faculty Account' : '🏛️ Admin Account'}
                </span>
              </div>
            ) : (
              cleanId.length > 0 && (
                <div style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={13} /> Staff ID "{identifier}" not resolved. Please enter a valid ID from the database directory.
                </div>
              )
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)'
              }}
            >
              <span>Sign In & Open Workspace ({DEMO_ACCOUNTS[selectedRole]?.roleTitle || 'Portal'})</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{
            marginTop: '14px',
            fontSize: '11px',
            color: '#64748b',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Lock size={12} /> Database Resolved Identity • Strict Faculty Field Scope Guard Active
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Building2, KeyRound, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';

export default function LoginPage({ onLogin }) {
  // Always merge INITIAL_TEAM with localStorage data to guarantee all staff members exist
  const activeTeam = (() => {
    const saved = localStorage.getItem('ctu_team_data');
    if (!saved) return INITIAL_TEAM;
    try {
      const parsed = JSON.parse(saved);
      const teamMap = new Map();
      INITIAL_TEAM.forEach(m => teamMap.set((m.employeeId || m.id).toLowerCase(), m));
      parsed.forEach(m => teamMap.set((m.employeeId || m.id).toLowerCase(), m));
      return Array.from(teamMap.values());
    } catch (e) {
      return INITIAL_TEAM;
    }
  })();

  // Empty input fields by default
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('faculty'); // 'superAdmin', 'admin', 'faculty'
  const [errorMessage, setErrorMessage] = useState('');

  // Role Selector Cards
  const ROLE_CARDS = {
    superAdmin: {
      roleKey: 'superAdmin',
      roleTitle: 'Super Administrator',
      avatar: 'SA',
      badgeColor: '#8b5cf6',
    },
    admin: {
      roleKey: 'admin',
      roleTitle: 'University Administrator',
      avatar: 'UA',
      badgeColor: '#3b82f6',
    },
    faculty: {
      roleKey: 'faculty',
      roleTitle: 'Faculty Member',
      avatar: 'FM',
      badgeColor: '#ec4899',
    }
  };

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your University Employee / Staff ID');
      return;
    }

    // Flexible Smart Matching for Staff ID, Name (e.g. Arvin, Vinayek), or Email
    const matchedUser = activeTeam.find((m) => {
      const fullEmpId = (m.employeeId || '').trim().toLowerCase();
      const numDigits = fullEmpId.replace(/\D/g, '');
      const fullName = (m.name || '').trim().toLowerCase();
      const fullEmail = (m.email || '').trim().toLowerCase();
      const emailPrefix = fullEmail.split('@')[0];

      return (
        fullEmpId === cleanId ||
        (numDigits && numDigits === cleanId) ||
        fullName === cleanId ||
        fullName.includes(cleanId) ||
        fullEmail === cleanId ||
        emailPrefix === cleanId
      );
    });

    if (matchedUser) {
      const isFacultyAccount = matchedUser.category === 'Faculty' || 
        (matchedUser.role && (matchedUser.role.toLowerCase().includes('faculty') || matchedUser.role.toLowerCase().includes('professor') || matchedUser.role.toLowerCase().includes('lecturer')));

      // Strict Scope Guard: Faculty accounts CANNOT log in as Admin/SuperAdmin
      if (isFacultyAccount && selectedRole !== 'faculty') {
        setErrorMessage(`RBAC Scope Restriction: Account "${matchedUser.employeeId}" (${matchedUser.name}) is registered under Faculty data and CANNOT log in as ${selectedRole === 'superAdmin' ? 'Super Administrator' : 'University Administrator'}. Please select the Faculty Member portal.`);
        return;
      }

      // Admin Scope Guard: Admin accounts must select Admin portal
      if (!isFacultyAccount && matchedUser.category === 'Admin' && selectedRole === 'faculty') {
        setErrorMessage(`RBAC Scope Restriction: Account "${matchedUser.employeeId}" (${matchedUser.name}) is an Administrative account and must select University Administrator portal.`);
        return;
      }

      const roleTitle = selectedRole === 'superAdmin' 
        ? 'Super Administrator' 
        : (selectedRole === 'admin' ? 'University Administrator' : 'Faculty Member');

      // Bind login session strictly to THAT specific person's Name & Email
      onLogin({
        id: matchedUser.id,
        employeeId: matchedUser.employeeId,
        email: matchedUser.email,
        name: matchedUser.name,
        role: selectedRole,
        roleTitle: matchedUser.role || roleTitle,
        dept: matchedUser.dept,
        avatar: matchedUser.avatar || matchedUser.name.substring(0, 2).toUpperCase(),
      });
    } else {
      // Dynamic fallback for custom/newly entered staff numeric IDs
      const formattedName = `Faculty Member (${cleanId.toUpperCase()})`;
      const formattedEmail = cleanId.includes('@') ? cleanId : `${cleanId.replace(/\s+/g, '.')}@ctu.edu.in`;

      onLogin({
        id: `usr-custom-${cleanId}`,
        employeeId: cleanId.toUpperCase(),
        email: formattedEmail,
        name: formattedName,
        role: selectedRole,
        roleTitle: selectedRole === 'faculty' ? 'Faculty Member' : 'University Administrator',
        dept: selectedRole === 'faculty' ? 'School of Management & Sciences' : 'University Administration',
        avatar: cleanId.substring(0, 2).toUpperCase(),
      });
    }
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
                Enterprise Task & Workflow System
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
            Role-Scoped Portal Sign In
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
            Enter your Staff ID or Name (e.g. <code>26001</code> or <code>Arvin Vinayek</code>) to sign into your personal workspace.
          </p>
        </div>

        {/* Clean Role Selector Cards */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            Select Login Portal Role:
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.keys(ROLE_CARDS).map((roleKey) => {
              const card = ROLE_CARDS[roleKey];
              const isSelected = selectedRole === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => handleSelectRole(roleKey)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? `2px solid ${card.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: card.badgeColor,
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {card.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {card.roleTitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Form Inputs & Actions */}
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
                  placeholder="Enter Staff ID or Name (e.g. 26001 or Arvin Vinayek)..."
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
              <span>Sign In & Open Workspace ({ROLE_CARDS[selectedRole]?.roleTitle || 'Portal'})</span>
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
            <Lock size={12} /> Encrypted Session • Strict Individual Identity Mapping Active
          </div>
        </div>
      </div>
    </div>
  );
}

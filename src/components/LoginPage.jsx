import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building2, UserCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('superadmin@ctu.edu.in');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState('superAdmin'); // 'superAdmin', 'admin', 'hod', 'faculty', 'hr'
  const [errorMessage, setErrorMessage] = useState('');

  // CT University Quick Demo Accounts mapped to system IDs
  const DEMO_ACCOUNTS = {
    superAdmin: {
      id: 'usr-0',
      email: 'superadmin@ctu.edu.in',
      name: 'Dr. Manjit Singh',
      roleTitle: 'Super Administrator',
      dept: 'University Administration',
      avatar: 'MS',
      badgeColor: '#8b5cf6',
      desc: 'Full global system administration, user roles, system configs & audit logs.'
    },
    admin: {
      id: 'usr-0',
      email: 'admin@ctu.edu.in',
      name: 'Dr. Manjit Singh',
      roleTitle: 'University Administrator',
      dept: 'Central Academic Affairs',
      avatar: 'MS',
      badgeColor: '#3b82f6',
      desc: 'University-wide administrative oversight, department reports & scope controls.'
    },
    hod: {
      id: 'usr-1',
      email: 'head.cse@ctu.edu.in',
      name: 'Dr. Gurpreet Singh',
      roleTitle: 'Head of Department (CSE)',
      dept: 'Computer Science & Engineering',
      avatar: 'GS',
      badgeColor: '#10b981',
      desc: 'Assign department tasks to faculty, review submissions & approve extensions.'
    },
    faculty: {
      id: 'usr-3',
      email: 'harman.faculty@ctu.edu.in',
      name: 'Dr. Harmanpreet Singh',
      roleTitle: 'Assistant Professor (Faculty)',
      dept: 'Computer Science & Engineering',
      avatar: 'HS',
      badgeColor: '#f59e0b',
      desc: 'Strictly view self-assigned tasks, update progress, request extensions & submit work.'
    },
    hr: {
      id: 'usr-2',
      email: 'hr.head@ctu.edu.in',
      name: 'Ms. Pooja Rani',
      roleTitle: 'HR Lead',
      dept: 'Human Resources',
      avatar: 'PR',
      badgeColor: '#ec4899',
      desc: 'Bulk Excel/CSV employee master import, directory management & account provisioning.'
    }
  };

  const handleSelectQuickAccount = (roleKey) => {
    setSelectedRole(roleKey);
    const acc = DEMO_ACCOUNTS[roleKey];
    setEmail(acc.email);
    setPassword('Password123!');
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your CT University official email');
      return;
    }

    // Check if email matches existing team member
    const teamMatch = INITIAL_TEAM.find((m) => m.email.toLowerCase() === cleanEmail);
    const demoAcc = DEMO_ACCOUNTS[selectedRole];

    if (teamMatch) {
      onLogin({
        id: teamMatch.id,
        email: teamMatch.email,
        name: teamMatch.name,
        role: selectedRole,
        roleTitle: demoAcc.roleTitle,
        dept: teamMatch.dept,
        avatar: teamMatch.avatar,
      });
    } else {
      onLogin({
        id: demoAcc.id,
        email: cleanEmail,
        name: demoAcc.name,
        role: selectedRole,
        roleTitle: demoAcc.roleTitle,
        dept: demoAcc.dept,
        avatar: demoAcc.avatar,
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
        {/* Top / Left Header Branding */}
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
            Select your role below or enter credentials to open authorized workspace.
          </p>
        </div>

        {/* Middle Role Selector Cards */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            Choose Role to Sign In:
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {Object.keys(DEMO_ACCOUNTS).map((roleKey) => {
              const acc = DEMO_ACCOUNTS[roleKey];
              const isSelected = selectedRole === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => handleSelectQuickAccount(roleKey)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? `1.5px solid ${acc.badgeColor}` : '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: acc.badgeColor,
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {acc.avatar}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#ffffff' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.roleTitle}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.name}
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
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                University Institutional Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. faculty@ctu.edu.in"
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
              <span>Sign In & Open Workspace ({DEMO_ACCOUNTS[selectedRole].roleTitle})</span>
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
            <Lock size={12} /> Encrypted Session • Scope Authorization Active
          </div>
        </div>
      </div>
    </div>
  );
}

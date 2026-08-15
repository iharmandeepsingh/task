import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building2, UserCheck, KeyRound, AlertCircle, ArrowRight, User } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';

export default function LoginPage({ onLogin }) {
  const [identifier, setIdentifier] = useState('CTU-EMP-309'); // Employee ID or Email
  const [password, setPassword] = useState('Dr. Harmanpreet Singh'); // Password set as Name
  const [selectedRole, setSelectedRole] = useState('faculty'); // 'superAdmin', 'admin', 'faculty'
  const [errorMessage, setErrorMessage] = useState('');

  // CT University Quick Demo Accounts
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
      email: 'head.cse@ctu.edu.in',
      name: 'Dr. Gurpreet Singh',
      roleTitle: 'University Administrator (HOD)',
      dept: 'Computer Science & Engineering',
      avatar: 'GS',
      badgeColor: '#3b82f6',
      desc: 'University-wide administrative oversight, department reports & scope controls.'
    },
    faculty: {
      id: 'usr-3',
      employeeId: 'CTU-EMP-309',
      email: 'harman.faculty@ctu.edu.in',
      name: 'Dr. Harmanpreet Singh',
      roleTitle: 'Faculty Member (Staff)',
      dept: 'Computer Science & Engineering',
      avatar: 'HS',
      badgeColor: '#f59e0b',
      desc: 'Log in with Employee ID (e.g. CTU-EMP-309) & Password set as Name.'
    }
  };

  const handleSelectQuickAccount = (roleKey) => {
    setSelectedRole(roleKey);
    const acc = DEMO_ACCOUNTS[roleKey];
    if (acc) {
      setIdentifier(acc.employeeId);
      setPassword(acc.name);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your CT University Employee ID or Email address.');
      return;
    }

    // Look up staff record in Master Staff Directory by Employee ID or Email
    const staffMatch = INITIAL_TEAM.find((m) => 
      m.employeeId.toLowerCase() === cleanId || 
      m.email.toLowerCase() === cleanId ||
      m.name.toLowerCase().includes(cleanId)
    );

    const demoAcc = DEMO_ACCOUNTS[selectedRole] || DEMO_ACCOUNTS.faculty;

    if (staffMatch) {
      // Validate Password (Pass matches staff Name, first/last name, or standard fallback)
      const staffNameClean = staffMatch.name.toLowerCase();
      const isNamePasswordMatch = 
        cleanPass.length > 0 && 
        (staffNameClean.includes(cleanPass) || 
         cleanPass.includes(staffNameClean) || 
         cleanPass === 'password123!' || 
         cleanPass === 'password' ||
         cleanPass.split(' ').some(part => part.length > 2 && staffNameClean.includes(part)));

      if (!isNamePasswordMatch && cleanPass !== '') {
        setErrorMessage(`Invalid Password! Password for Staff ID ${staffMatch.employeeId} is set as your Name (e.g. "${staffMatch.name}").`);
        return;
      }

      const roleType = staffMatch.category === 'Admin' ? 'admin' : (selectedRole === 'superAdmin' ? 'superAdmin' : 'faculty');

      onLogin({
        id: staffMatch.id,
        employeeId: staffMatch.employeeId,
        email: staffMatch.email,
        name: staffMatch.name,
        role: roleType,
        roleTitle: staffMatch.role || demoAcc.roleTitle,
        dept: staffMatch.dept,
        avatar: staffMatch.avatar,
      });
    } else {
      // General or newly provisioned account
      onLogin({
        id: demoAcc.id,
        employeeId: cleanId.toUpperCase(),
        email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@ctu.edu.in`,
        name: password || demoAcc.name,
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
        {/* Top Header Branding */}
        <div style={{
          padding: '24px 20px',
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
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
                Staff & Faculty Task Portal Sign In
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
            Staff ID-Based Sign In Portal
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
            Staff members can log in directly using their <strong>Employee ID</strong> (e.g. <code>CTU-EMP-309</code>) and set password as their <strong>Name</strong>.
          </p>
        </div>

        {/* Middle Account Quick Selection Cards */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>
            Choose Authorized Account:
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
                    width: '34px',
                    height: '34px',
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
                      {acc.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ID: {acc.employeeId} • {acc.roleTitle}
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
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Staff Employee ID or Email
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. CTU-EMP-309 or harman.faculty@ctu.edu.in"
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
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Enter your official CTU Staff Employee ID (e.g. <code>CTU-EMP-309</code>)
              </span>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                Password (Set as Staff Name)
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Name (e.g. Dr. Harmanpreet Singh)"
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
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Rule: Password is set as your staff <strong>Name</strong> (e.g. <code>Dr. Harmanpreet Singh</code> or <code>Harmanpreet</code>)
              </span>
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
              <span>Sign In with Staff ID & Open Workspace</span>
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
            <Lock size={12} /> Staff ID Authentication • Name Password Verification Active
          </div>
        </div>
      </div>
    </div>
  );
}

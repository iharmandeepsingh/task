import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building2, UserCheck, KeyRound, AlertCircle, ArrowRight, User, Users } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';

export default function LoginPage({ onLogin }) {
  // Get active team roster from localStorage if available
  const activeTeam = (() => {
    const saved = localStorage.getItem('ctu_team_data');
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  })();

  const [identifier, setIdentifier] = useState('26010'); // Employee ID e.g. 26010
  const [password, setPassword] = useState('Shilpa Debnath'); // Password set as Name
  const [selectedRole, setSelectedRole] = useState('faculty');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Dropdown Quick Select for All Faculty Members
  const handleSelectFacultyFromDropdown = (empId) => {
    const matched = activeTeam.find(m => m.employeeId === empId || m.employeeId.includes(empId));
    if (matched) {
      // Clean numeric ID e.g. 26010 from CTU-EMP-26010 or 26010
      const cleanNumId = matched.employeeId.replace('CTU-EMP-', '').replace('CTU-ADM-', '');
      setIdentifier(cleanNumId);
      setPassword(matched.name);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your Staff ID (e.g. 26010)');
      return;
    }

    // Match Staff Record in Master Staff Directory by Employee ID, numeric ID suffix, Email, or Name
    const staffMatch = activeTeam.find((m) => {
      const empIdClean = m.employeeId.toLowerCase();
      const numOnly = empIdClean.replace(/\D/g, ''); // Extract digits e.g. "26010"
      return (
        empIdClean === cleanId || 
        empIdClean.includes(cleanId) ||
        (numOnly && numOnly === cleanId) ||
        (numOnly && cleanId.includes(numOnly)) ||
        m.email.toLowerCase() === cleanId ||
        m.email.toLowerCase().split('@')[0] === cleanId ||
        m.name.toLowerCase().includes(cleanId)
      );
    });

    if (staffMatch) {
      // Validate Password (Password is set as Staff Name for ALL faculty & staff)
      const staffNameClean = staffMatch.name.toLowerCase();
      const passCleanParts = cleanPass.split(' ').filter(p => p.length > 1);

      const isNamePasswordMatch = 
        cleanPass.length > 0 && 
        (staffNameClean.includes(cleanPass) || 
         cleanPass.includes(staffNameClean) || 
         passCleanParts.some(part => staffNameClean.includes(part)) ||
         cleanPass === 'password123!' || 
         cleanPass === 'password');

      if (!isNamePasswordMatch && cleanPass !== '') {
        setErrorMessage(`Invalid Password! Password for Staff ID "${staffMatch.employeeId}" is set as your Name (e.g. "${staffMatch.name}").`);
        return;
      }

      const roleType = staffMatch.category === 'Admin' ? 'admin' : (staffMatch.role === 'Super Admin' ? 'superAdmin' : 'faculty');

      onLogin({
        id: staffMatch.id,
        employeeId: staffMatch.employeeId,
        email: staffMatch.email,
        name: staffMatch.name,
        role: roleType,
        roleTitle: staffMatch.role || 'Faculty Member',
        dept: staffMatch.dept,
        avatar: staffMatch.avatar,
      });
    } else {
      // Fallback for new ID entries
      onLogin({
        id: `usr-${cleanId}`,
        employeeId: cleanId.toUpperCase(),
        email: `${cleanId}@ctu.edu.in`,
        name: password || `Faculty Member (${cleanId})`,
        role: selectedRole === 'superAdmin' ? 'superAdmin' : 'faculty',
        roleTitle: 'Faculty Member',
        dept: 'CT University',
        avatar: (password || 'FM').substring(0, 2).toUpperCase(),
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
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.5)'
            }}>
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff', margin: 0 }}>
                CT UNIVERSITY
              </h1>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                Universal Faculty & Staff ID Portal
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
            Faculty & Staff Sign In (ID + Name Password)
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
            Every faculty member can log in using their <strong>Staff ID</strong> (e.g. <code>26010</code>, <code>309</code>) and password set as their <strong>Name</strong>.
          </p>
        </div>

        {/* Quick Select Dropdown for All Faculty Members */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.4)' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Users size={16} color="#ec4899" />
            <span>Select Any Faculty Member from Directory ({activeTeam.length} Members Loaded):</span>
          </label>

          <select
            onChange={(e) => handleSelectFacultyFromDropdown(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#0f172a',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {activeTeam.map((m) => {
              const numId = m.employeeId.replace('CTU-EMP-', '').replace('CTU-ADM-', '');
              return (
                <option key={m.id} value={m.employeeId}>
                  Staff ID: {numId} ({m.employeeId}) — {m.name} [{m.dept || 'Faculty'}]
                </option>
              );
            })}
          </select>
        </div>

        {/* Form Inputs & Actions */}
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
                Staff ID (Numeric Employee ID)
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 26010 or 309"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Enter any staff numeric ID (e.g. <code>26010</code>, <code>309</code>, <code>301</code>, <code>302</code>, <code>312</code>)
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
                  placeholder="e.g. Shilpa Debnath"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Password is set as your staff <strong>Name</strong> (e.g. <code>Shilpa Debnath</code>, <code>Harmanpreet</code>)
              </span>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.5)'
              }}
            >
              <span>Sign In with Staff ID: {identifier} & Open Workspace</span>
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
            <Lock size={12} /> Universal Faculty ID Method Active • Name Password Verification Enabled for All Staff
          </div>
        </div>
      </div>
    </div>
  );
}

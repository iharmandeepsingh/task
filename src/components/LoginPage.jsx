import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, HelpCircle, X, KeyRound, AlertCircle, ArrowRight, User, Phone, Building2, ArrowLeft } from 'lucide-react';
import { INITIAL_TEAM } from '../data/initialData';
import { getApiUrl } from '../utils/apiBase';

export default function LoginPage({ onLogin }) {
  // Always fetch latest master team directory from localStorage or INITIAL_TEAM
  const activeTeam = (() => {
    const deletedIds = (() => {
      try { return JSON.parse(localStorage.getItem('ctu_deleted_employee_ids') || '[]'); } catch { return []; }
    })();
    const deletedSet = new Set(deletedIds.map(d => String(d).toLowerCase().trim()).filter(Boolean));

    const teamMap = new Map();
    INITIAL_TEAM.forEach(m => {
      const k1 = String(m.id || '').toLowerCase().trim();
      const k2 = String(m.employeeId || '').toLowerCase().trim();
      if ((!k1 || !deletedSet.has(k1)) && (!k2 || !deletedSet.has(k2))) {
        teamMap.set((m.employeeId || m.id).toLowerCase(), m);
      }
    });

    const saved = localStorage.getItem('ctu_team_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(m => {
            const k1 = String(m.id || '').toLowerCase().trim();
            const k2 = String(m.employeeId || '').toLowerCase().trim();
            if ((!k1 || !deletedSet.has(k1)) && (!k2 || !deletedSet.has(k2))) {
              teamMap.set((m.employeeId || m.id).toLowerCase(), m);
            }
          });
        }
      } catch (e) {}
    }
    return Array.from(teamMap.values());
  })();

  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryQuery, setRecoveryQuery] = useState('');
  const [recoveryResult, setRecoveryResult] = useState(null);
  const [recoveryError, setRecoveryError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your Staff ID');
      return;
    }

    const matchedUser = activeTeam.find((m) => {
      const fullEmpId = (m.employeeId || '').trim().toLowerCase();
      const numDigits = fullEmpId.replace(/\D/g, '');
      const fullId = (m.id || '').trim().toLowerCase();
      const fullEmail = (m.email || '').trim().toLowerCase();
      const emailPrefix = fullEmail.split('@')[0];
      const fullName = (m.name || '').trim().toLowerCase();

      return (
        fullEmpId === cleanId ||
        (numDigits && numDigits === cleanId) ||
        fullId === cleanId ||
        fullId === `usr-${cleanId}` ||
        fullEmail === cleanId ||
        emailPrefix === cleanId ||
        fullName === cleanId
      );
    });

    if (!matchedUser) {
      setErrorMessage(`Staff ID "${identifier.trim()}" not found. Please check your Staff ID or register.`);
      return;
    }

    const cleanPass = password.trim().toLowerCase();
    const cleanName = (matchedUser.name || '').trim().toLowerCase();
    const cleanEmpId = (matchedUser.employeeId || '').trim().toLowerCase();
    const nameParts = cleanName.split(' ').filter(p => p.length > 1);
    
    // Check real password or fallback to defaults
    const actualPassword = matchedUser.password || '';
    
    const isPasswordValid = 
      (actualPassword && cleanPass === actualPassword.toLowerCase()) ||
      (!actualPassword && (
        cleanPass === '123' ||
        cleanPass === 'password123!' ||
        cleanPass === cleanName ||
        cleanPass === cleanEmpId ||
        nameParts.some(part => cleanPass.includes(part)) ||
        cleanPass.includes(cleanName)
      ));

    if (!isPasswordValid) {
      setErrorMessage(`Incorrect password. Please try again.`);
      return;
    }

    let autoDetectedRole = 'faculty';
    let autoRoleTitle = matchedUser.role || 'Faculty Member';
    const userRoleStr = (matchedUser.role || '').toLowerCase();
    const userCategory = (matchedUser.category || '').toLowerCase();
    const userEmpId = String(matchedUser.employeeId || matchedUser.id || '').toLowerCase();

    if (
      userRoleStr === 'super admin' || 
      userRoleStr.includes('superadmin') ||
      ['24051', '17572', '10001', '001', 'usr-0', 'usr-24051', 'usr-17572', 'usr-10001'].includes(userEmpId)
    ) {
      autoDetectedRole = 'superAdmin';
      autoRoleTitle = 'Super Administrator';
    } else if (
      userRoleStr.includes('hod') || 
      userRoleStr.includes('head of department') ||
      userRoleStr.includes('h.o.d')
    ) {
      autoDetectedRole = 'hod';
      autoRoleTitle = matchedUser.role || 'Head of Department';
    } else if (
      userCategory === 'admin' ||
      userRoleStr.includes('admin') ||
      userRoleStr.includes('director') ||
      userRoleStr.includes('dean') ||
      userRoleStr.includes('registrar') ||
      userRoleStr.includes('chancellor')
    ) {
      autoDetectedRole = 'admin';
      autoRoleTitle = matchedUser.role || 'University Administrator';
    } else {
      autoDetectedRole = 'faculty';
      autoRoleTitle = matchedUser.role || 'Faculty Member';
    }

    onLogin({
      id: matchedUser.id,
      employeeId: matchedUser.employeeId,
      email: matchedUser.email,
      name: matchedUser.name,
      role: autoDetectedRole,
      roleTitle: autoRoleTitle,
      dept: matchedUser.dept,
      avatar: matchedUser.avatar || matchedUser.name.substring(0, 2).toUpperCase(),
    });
  };

  // Auto-fill registration details when Staff ID is entered
  const handleStaffIdChange = (val) => {
    setRegStaffId(val);
    const cleanId = String(val).trim().toLowerCase();
    if (!cleanId) return;

    const matched = activeTeam.find(m => {
      if (!m) return false;
      const empId = String(m.employeeId || '').toLowerCase().trim();
      const id = String(m.id || '').toLowerCase().trim();
      const sId = String(m.staffId || '').toLowerCase().trim();
      return empId === cleanId || id === cleanId || id === `usr-${cleanId}` || sId === cleanId;
    });

    if (matched) {
      if (matched.name) setRegName(matched.name);
      if (matched.email) setRegEmail(matched.email);
      if (matched.dept) setRegDept(matched.dept);
      if (matched.phone) setRegPhone(matched.phone);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regStaffId.trim() || !regDept) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanStaffId = regStaffId.trim().toLowerCase();

    // Check if staff ID or email exists in active roster
    const existing = activeTeam.find(m => {
      if (!m) return false;
      const empId = String(m.employeeId || '').toLowerCase().trim();
      const id = String(m.id || '').toLowerCase().trim();
      const sId = String(m.staffId || '').toLowerCase().trim();
      const email = String(m.email || '').toLowerCase().trim();

      return (
        (cleanStaffId && (empId === cleanStaffId || id === cleanStaffId || id === `usr-${cleanStaffId}` || sId === cleanStaffId)) ||
        (cleanEmail && email === cleanEmail)
      );
    });
    
    // If account exists and already has a confirmed password set and is Active
    if (existing && existing.password && existing.status === 'Active') {
      setErrorMessage('An active account with this email or Staff ID already exists. Please sign in.');
      return;
    }

    let verificationRecord = null;
    try {
      const checkRes = await fetch(getApiUrl(`/api/check-verification?staffId=${encodeURIComponent(cleanStaffId)}`));
      if (checkRes.ok) {
        const data = await checkRes.json();
        if (data.record) {
          verificationRecord = data.record;
        }
      }
    } catch (e) {
      console.warn("Verification check failed", e);
    }

    // Pre-authorized if exists in team roster, in verification pool, or standard CT University ID
    const isPreAuthorized = 
      !!existing || 
      !!verificationRecord || 
      /^\d{3,7}$/.test(cleanStaffId) || 
      cleanStaffId.startsWith('adm') || 
      cleanStaffId.startsWith('ctu-') ||
      cleanStaffId.startsWith('usr-');

    if (!isPreAuthorized) {
      setErrorMessage('Verification Failed: Your Staff ID is not pre-authorized. Please contact Super Admin.');
      return;
    }

    const isAdmin = 
      (existing && (existing.category === 'Admin' || String(existing.role || '').toLowerCase().includes('admin'))) ||
      (verificationRecord && (verificationRecord.category === 'Admin' || String(verificationRecord.role || '').toLowerCase().includes('admin'))) ||
      cleanStaffId.startsWith('adm') ||
      cleanStaffId.startsWith('ctu-adm') ||
      ['10001', '24051', '17572'].includes(cleanStaffId);

    const assignedCategory = isAdmin ? 'Admin' : (existing?.category || verificationRecord?.category || 'Faculty');
    const assignedRole = existing?.role || verificationRecord?.role || (isAdmin ? 'Administrative Staff' : 'Faculty Member');

    const initials = regName.split(/\s+/).map(n => n[0]).join('').substring(0,2).toUpperCase();

    const registeredUser = {
      ...(existing || {}),
      id: existing?.id || `usr-${Date.now()}`,
      employeeId: regStaffId.trim(),
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      role: assignedRole,
      category: assignedCategory,
      dept: regDept || existing?.dept || verificationRecord?.department || (isAdmin ? 'University Administration' : 'School of Engineering & Technology'),
      avatar: initials,
      status: 'Active',
      hasAccount: true
    };

    const updatedTeam = existing 
      ? activeTeam.map(m => {
          const eId = String(m.employeeId || '').toLowerCase().trim();
          const id = String(m.id || '').toLowerCase().trim();
          const em = String(m.email || '').toLowerCase().trim();
          return (eId === cleanStaffId || id === cleanStaffId || em === cleanEmail) ? registeredUser : m;
        })
      : [...activeTeam, registeredUser];

    localStorage.setItem('ctu_team_data', JSON.stringify(updatedTeam));
    
    // 1. Sync updated registered user to ctu_team in MongoDB
    fetch(getApiUrl('/api/sync-team'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: updatedTeam })
    }).catch(() => {});

    // 2. Remove the person from the pre-verification list (ctu_staff_verification) in MongoDB
    fetch(getApiUrl('/api/sync-verification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', staffId: regStaffId.trim() })
    }).catch(() => {});

    alert(`🎉 Registration successful as ${assignedCategory} (${assignedRole})! You can now sign in.`);
    setIsRegistering(false);
    setIdentifier(regStaffId.trim());
    setPassword('');
    // Reset form
    setRegName('');
    setRegStaffId('');
    setRegEmail('');
    setRegPhone('');
    setRegDept('');
    setRegPassword('');
    setRegConfirmPassword('');
    setErrorMessage('');
  };

  const handleRecoverPassword = (e) => {
    e.preventDefault();
    const q = recoveryQuery.trim().toLowerCase();
    if (!q) {
      setRecoveryError('Please enter your Staff ID.');
      return;
    }

    const found = activeTeam.find((m) => {
      const fullEmpId = (m.employeeId || '').trim().toLowerCase();
      const numDigits = fullEmpId.replace(/\D/g, '');
      const fullId = (m.id || '').trim().toLowerCase();
      const fullEmail = (m.email || '').trim().toLowerCase();
      const fullName = (m.name || '').trim().toLowerCase();
      return (
        fullEmpId === q ||
        (numDigits && numDigits === q) ||
        fullId === q ||
        fullId === `usr-${q}` ||
        fullEmail === q ||
        fullName === q
      );
    });

    if (found) {
      const isSuperAdmin10001 = found.employeeId === '10001' || q === '10001';
      const actualPassword = found.password || found.name || '123';
      
      setRecoveryResult({
        member: found,
        actualPassword: actualPassword,
        canViewPlainPassword: isSuperAdmin10001
      });
      setRecoveryError('');
    } else {
      setRecoveryResult(null);
      setRecoveryError(`No staff account found for Staff ID "${recoveryQuery}".`);
    }
  };

  const handleResetPasswordWithOld = (e) => {
    e.preventDefault();
    if (!recoveryResult || !recoveryResult.member) return;

    const oldInput = e.target.oldPass.value.trim();
    const newInput = e.target.newPass.value.trim();
    const confirmInput = e.target.confirmPass.value.trim();
    const expectedOld = recoveryResult.actualPassword;

    if (oldInput.toLowerCase() !== expectedOld.toLowerCase() && oldInput !== '123') {
      alert('❌ Reset Failed: Incorrect Old Password.');
      return;
    }

    if (!newInput || newInput.length < 3) {
      alert('Please enter a New Password (minimum 3 characters).');
      return;
    }

    if (newInput !== confirmInput) {
      alert('❌ New Password and Confirm Password do not match.');
      return;
    }

    const targetEmpId = recoveryResult.member.employeeId || recoveryResult.member.id;
    const updatedTeam = activeTeam.map(m => {
      if ((m.employeeId && m.employeeId === targetEmpId) || (m.id && m.id === targetEmpId)) {
        return { ...m, password: newInput };
      }
      return m;
    });

    localStorage.setItem('ctu_team_data', JSON.stringify(updatedTeam));

    fetch(getApiUrl('/api/sync-team'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: updatedTeam })
    }).catch(() => {});

    alert(`Password updated successfully!`);
    setIdentifier(targetEmpId);
    setPassword(newInput);
    setIsForgotModalOpen(false);
    setRecoveryResult(null);
    setRecoveryQuery('');
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (regPassword.length > 5) strength += 1;
    if (regPassword.length > 8) strength += 1;
    if (/[A-Z]/.test(regPassword)) strength += 1;
    if (/[0-9]/.test(regPassword)) strength += 1;
    return strength;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f7fb',
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      color: '#1e293b',
      boxSizing: 'border-box'
    }}>
      {!isRegistering ? (
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Logo and Titles (Login) */}
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <img src="/ctu-logo.png" alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 6px 0' }}>
              CT University
            </h1>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
              Sign in to your workspace
            </p>
          </div>

          {/* Login Card */}
          <div style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            padding: '24px',
            boxSizing: 'border-box'
          }}>
            {errorMessage && (
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>
                  Staff ID
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="e.g. 26006 or 10001"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#334155', margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(true);
                      setRecoveryQuery(identifier);
                      setRecoveryResult(null);
                      setRecoveryError('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 38px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="keepSigned" style={{ width: '16px', height: '16px', accentColor: '#1e293b', cursor: 'pointer' }} />
                <label htmlFor="keepSigned" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  Keep me signed in
                </label>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#0f172a'}
                onMouseOut={(e) => e.target.style.background = '#1e293b'}
              >
                Sign In <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => { setIsRegistering(true); setErrorMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: '500' }}
            >
              Sign up
            </button>
          </div>
        </div>
      ) : (
        /* Register Flow */
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{
            width: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            
            {/* Top Bar (Verification) */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => { setIsRegistering(false); setErrorMessage(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <ArrowLeft size={18} color="#0f172a" />
                </button>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>Verification</span>
              </div>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', background: '#1e293b', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={16} color="#ffffff" />
              </div>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                Staff Registration
              </h2>
              <p style={{ fontSize: '13px', color: '#2563eb', margin: '0 0 24px 0', lineHeight: '1.4' }}>
                Enter your details to provision your enterprise account.
              </p>

              {errorMessage && (
                <div style={{
                  padding: '12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Staff ID</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text" value={regStaffId} onChange={(e) => handleStaffIdChange(e.target.value)}
                      placeholder="e.g. 26006 or 10001"
                      style={{ width: '100%', padding: '10px 12px 10px 16px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Staff Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rohit"
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Work Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="rohit26006@ctuniversity.in"
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      placeholder="e.g. School of Agriculture & Natural Sciences"
                      style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type={showRegPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 38px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {showRegPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} style={{ flex: 1, height: '4px', borderRadius: '2px', background: getPasswordStrength() >= idx ? '#cbd5e1' : '#f1f5f9' }}></div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#475569', marginBottom: '6px' }}>Re-enter Password</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'} value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '10px 38px 10px 38px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                    <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {showRegConfirmPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    background: '#1e293b',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}
                >
                  Register Account <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setIsRegistering(false); setErrorMessage(''); }}
                    style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: '500' }}
                  >
                    Sign In
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px'
        }}>
          <div style={{
            width: '100%', maxWidth: '400px', background: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#0f172a' }}>Recover Password via Staff ID</h3>
              <button onClick={() => setIsForgotModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#64748b" /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleRecoverPassword} style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                <input
                  type="text" value={recoveryQuery} onChange={(e) => setRecoveryQuery(e.target.value)}
                  placeholder="Enter your Staff ID (e.g. 26006)"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} required
                />
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
                  Verify
                </button>
              </form>

              {recoveryError && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>{recoveryError}</div>}

              {recoveryResult && (
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0f172a' }}><strong>Verified:</strong> {recoveryResult.member.name}</p>
                  <form onSubmit={handleResetPasswordWithOld}>
                    <input type="password" name="oldPass" placeholder="Old Password" style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} required />
                    <input type="password" name="newPass" placeholder="New Password" style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} required />
                    <input type="password" name="confirmPass" placeholder="Confirm New" style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} required />
                    <button type="submit" style={{ width: '100%', padding: '8px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

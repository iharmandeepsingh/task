import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose, authUser, team = [], onPasswordChanged }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !authUser) return null;

  // Find user's member record in the team directory
  const currentMember = team.find(m => 
    (m.id && m.id === authUser.id) || 
    (m.employeeId && (m.employeeId === authUser.employeeId || m.employeeId === authUser.id))
  );

  // Existing password defaults to stored password, member name, or 123
  const expectedOldPassword = (currentMember?.password || currentMember?.name || '123').trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanOld) {
      setErrorMessage('Please enter your Old Password.');
      return;
    }

    // CRITERIA 1: Verify Old Password matches current password
    const isOldPassCorrect = 
      cleanOld === expectedOldPassword ||
      cleanOld.toLowerCase() === expectedOldPassword.toLowerCase() ||
      (cleanOld === '123' && expectedOldPassword === '123');

    if (!isOldPassCorrect) {
      setErrorMessage('❌ Verification Failed: The Old Password you entered is incorrect. You must provide your correct Old Password to change it.');
      return;
    }

    if (!cleanNew || cleanNew.length < 3) {
      setErrorMessage('Please enter a New Password (minimum 3 characters).');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      setErrorMessage('❌ Validation Error: New Password and Confirm Password do not match.');
      return;
    }

    if (cleanNew === cleanOld) {
      setErrorMessage('New Password must be different from your Old Password.');
      return;
    }

    // CRITERIA 2: Password Match verified & update database
    if (onPasswordChanged) {
      onPasswordChanged(authUser.employeeId || authUser.id, cleanNew);
    }

    setSuccessMessage('🎉 Password changed successfully! Your new password has been saved.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '16px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
        color: '#0f172a'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <KeyRound size={18} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Change Account Password
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                {authUser?.name} ({authUser?.employeeId || authUser?.id})
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#ffffff', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        {/* Content Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {errorMessage && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#059669', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Criteria Requirement Box */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '11px', color: '#1e40af' }}>
            🔒 <strong>Security Verification Requirement:</strong> You must enter your <strong>Old Password</strong> first to verify your identity before setting a new password.
          </div>

          {/* Old Password Input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              🔑 Current / Old Password *
            </label>
            <input
              type="password"
              placeholder="Enter your existing Old Password..."
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* New Password Input */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              ✨ New Password *
            </label>
            <input
              type="password"
              placeholder="Enter your New Password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
              🔁 Confirm New Password *
            </label>
            <input
              type="password"
              placeholder="Re-enter your New Password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <ShieldCheck size={16} />
            <span>Verify Old Password & Save New Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}

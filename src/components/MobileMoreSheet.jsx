import React from 'react';
import { X, BarChart3, Award, KeyRound, LogOut, Sun, Moon, Users, Shield, FileSpreadsheet, ChevronRight, Info, School } from 'lucide-react';

export default function MobileMoreSheet({
  isOpen,
  onClose,
  authUser,
  currentRole,
  onOpenAnalytics,
  onOpenReportCard,
  onOpenChangePassword,
  onOpenHRImport,
  setActiveView,
  onToggleTheme,
  theme,
  onLogout
}) {
  if (!isOpen) return null;

  const isFaculty = currentRole === 'faculty';
  const isSuperAdminOrAdmin = currentRole === 'superAdmin' || currentRole === 'admin';

  const roleTitleMap = {
    superAdmin: 'Super Administrator',
    admin: 'University Administrator',
    adminHead: 'Head of Department',
    hod: 'Head of Department',
    faculty: 'Faculty Member',
    hr: 'HR Executive'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1200
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: '#ffffff',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          padding: '20px 18px 30px',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.15)'
        }}
      >
        {/* Handle Bar */}
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#cbd5e1', margin: '0 auto 16px' }} />

        {/* User Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '15px', color: '#ffffff'
            }}>
              {authUser?.avatar || (authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'U')}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>{authUser?.name}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                {roleTitleMap[currentRole] || 'User'} • ID: {authUser?.employeeId || authUser?.id}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* 1. NAAC Analytics & Exporter (For Non-faculty) */}
          {!isFaculty && (
            <button
              onClick={() => { onClose(); onOpenAnalytics(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px', borderRadius: '12px', background: '#eff6ff',
                border: '1px solid #bfdbfe', color: '#1e40af', cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>NAAC Analytics & Exporter</div>
                  <div style={{ fontSize: '11.5px', color: '#3b82f6' }}>Compliance metrics & official Excel/PDF export</div>
                </div>
              </div>
              <ChevronRight size={18} color="#2563eb" />
            </button>
          )}

          {/* 2. Faculty Report Card (For Faculty or available to all) */}
          <button
            onClick={() => { onClose(); onOpenReportCard(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '12px', background: '#fffbeb',
              border: '1px solid #fde68a', color: '#92400e', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Award size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Performance Report Card</div>
                <div style={{ fontSize: '11.5px', color: '#b45309' }}>Review completed tasks & performance scorecard</div>
              </div>
            </div>
            <ChevronRight size={18} color="#d97706" />
          </button>

          {/* 3. Bulk HR Import (Non-Faculty) */}
          {!isFaculty && (
            <button
              onClick={() => { onClose(); onOpenHRImport(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px', borderRadius: '12px', background: '#f0fdf4',
                border: '1px solid #bbf7d0', color: '#166534', cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>Bulk HR Excel Import</div>
                  <div style={{ fontSize: '11.5px', color: '#15803d' }}>Upload Excel/CSV staff rosters with cascading depts</div>
                </div>
              </div>
              <ChevronRight size={18} color="#16a34a" />
            </button>
          )}

          {/* 4. Super Admin Pre-Authorized Records (Super Admin / Admin) */}
          {isSuperAdminOrAdmin && (
            <button
              onClick={() => { onClose(); setActiveView('staff'); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px', borderRadius: '12px', background: '#faf5ff',
                border: '1px solid #e9d5ff', color: '#6b21a8', cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>Staff & Admin Pre-Authorization</div>
                  <div style={{ fontSize: '11.5px', color: '#7e22ce' }}>Manage pre-authorized records, wipe or delete</div>
                </div>
              </div>
              <ChevronRight size={18} color="#9333ea" />
            </button>
          )}

          {/* 5. Change Password */}
          <button
            onClick={() => { onClose(); onOpenChangePassword(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '12px', background: '#f8fafc',
              border: '1px solid #cbd5e1', color: '#1e293b', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Change Account Password</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Update security credentials with old password check</div>
              </div>
            </div>
            <ChevronRight size={18} color="#64748b" />
          </button>

          {/* 6. Theme Toggle */}
          <button
            onClick={() => { onToggleTheme(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '12px', background: '#f8fafc',
              border: '1px solid #cbd5e1', color: '#1e293b', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#6366f1" />}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Appearance Theme</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>Currently: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong></div>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb' }}>Switch</span>
          </button>

          {/* 7. Sign Out */}
          <button
            onClick={() => { onClose(); onLogout(); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', borderRadius: '12px', background: '#fef2f2',
              border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', textAlign: 'left',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <LogOut size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>Sign Out</div>
                <div style={{ fontSize: '11.5px', color: '#ef4444' }}>Log out from CT University portal</div>
              </div>
            </div>
            <ChevronRight size={18} color="#dc2626" />
          </button>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          CT University Task Management System • v2.4 Mobile
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, UserCheck, Clock, Calendar, AlertCircle, Building2, Search, CheckCircle2, Shield, Layers, FileText, Send, RefreshCw, Users } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';
import { getApiUrl } from '../utils/apiBase';

export default function ForwardTaskModal({
  isOpen,
  onClose,
  task,
  team = [],
  verificationRecords = [],
  authUser,
  onForwardTask
}) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [forwardInstructions, setForwardInstructions] = useState('');
  const [customDueDate, setCustomDueDate] = useState('');
  const [customDueTime, setCustomDueTime] = useState('17:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [scopeTab, setScopeTab] = useState('ACTIVE'); // 'ACTIVE' or 'ALL'
  const [submitting, setSubmitting] = useState(false);

  const PROTECTED_ADMIN_IDS = ['24051', '17572', '10001', '001'];

  // Load and merge live faculty directory
  const loadFacultyDirectory = async () => {
    setLoading(true);
    try {
      const authEmpId = String(authUser?.employeeId || '').toLowerCase().trim();
      const authId = String(authUser?.id || '').toLowerCase().trim();

      // 1. Fetch live from MongoDB verification records
      let verRecords = [];
      try {
        const resVer = await fetch(getApiUrl('/api/sync-verification'));
        if (resVer.ok) {
          const d = await resVer.json();
          if (d && Array.isArray(d.records)) verRecords = d.records;
        }
      } catch (e) {}

      // Fallback to local storage if API is offline
      if (verRecords.length === 0) {
        try {
          const cached = JSON.parse(localStorage.getItem('ctu_staff_verification') || '[]');
          if (Array.isArray(cached)) verRecords = cached;
        } catch (e) {}
      }

      // 2. Fetch live team
      let teamRecords = team || [];
      try {
        const resTeam = await fetch(getApiUrl('/api/sync-team'));
        if (resTeam.ok) {
          const d = await resTeam.json();
          if (d && Array.isArray(d.team)) teamRecords = d.team;
        }
      } catch (e) {}

      const memberMap = new Map();

      // Merge team members (Active)
      teamRecords.forEach(m => {
        const empId = String(m.employeeId || m.id || '').trim();
        const lowerId = empId.toLowerCase();
        const isSelf = lowerId === authEmpId || lowerId === authId || String(m.id || '').toLowerCase() === authId;
        const isProtectedAdmin = PROTECTED_ADMIN_IDS.includes(empId);

        if (!isSelf && !isProtectedAdmin && (m.category !== 'Admin' || m.role?.toLowerCase().includes('faculty') || m.role?.toLowerCase().includes('professor') || m.role?.toLowerCase().includes('lecturer'))) {
          memberMap.set(lowerId, {
            id: m.id || `usr-${empId}`,
            employeeId: empId,
            name: m.name,
            dept: m.dept || m.department || 'School of Engineering & Technology',
            role: m.role || 'Faculty Member',
            status: m.status || 'Active',
            avatar: m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : 'FC'),
            email: m.email || '',
            category: m.category || 'Faculty'
          });
        }
      });

      // Merge verification records (Active + Pre-Authorized)
      verRecords.forEach(v => {
        const empId = String(v.staffId || v.employeeId || '').trim();
        const lowerId = empId.toLowerCase();
        const isSelf = lowerId === authEmpId || lowerId === authId;
        const isProtectedAdmin = PROTECTED_ADMIN_IDS.includes(empId);

        if (!isSelf && !isProtectedAdmin && (v.category !== 'Admin' || v.role?.toLowerCase().includes('faculty') || v.role?.toLowerCase().includes('professor') || v.role?.toLowerCase().includes('lecturer'))) {
          const existing = memberMap.get(lowerId);
          memberMap.set(lowerId, {
            id: existing?.id || `usr-${empId}`,
            employeeId: empId,
            name: v.name || existing?.name,
            dept: v.department || existing?.dept || 'School of Engineering & Technology',
            role: v.role || existing?.role || 'Faculty Member',
            status: existing?.status === 'Active' ? 'Active' : (v.status || 'Pre-Authorized'),
            avatar: existing?.avatar || (v.name ? v.name.substring(0, 2).toUpperCase() : 'FC'),
            email: v.email || existing?.email || '',
            category: v.category || 'Faculty'
          });
        }
      });

      const list = Array.from(memberMap.values());
      setFacultyList(list);

      // Default selected faculty
      if (list.length > 0) {
        const adminDept = (authUser?.dept || '').toLowerCase();
        const sameDept = list.find(m => (m.dept || '').toLowerCase().includes(adminDept) || adminDept.includes((m.dept || '').toLowerCase()));
        setSelectedFacultyId(sameDept ? (sameDept.id || sameDept.employeeId) : (list[0].id || list[0].employeeId));
      }
    } catch (err) {
      console.error('Error loading faculty for forward modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task && isOpen) {
      loadFacultyDirectory();
      setForwardInstructions('');
      setCustomDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setCustomDueTime(task.dueTime || (task.dueDate && task.dueDate.includes('T') ? task.dueDate.split('T')[1].substring(0, 5) : '17:00'));
      setSearchQuery('');
      setDeptFilter('ALL');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const filteredFaculty = facultyList.filter(m => {
    const q = searchQuery.trim().toLowerCase();
    const name = (m.name || '').toLowerCase();
    const empId = (m.employeeId || '').toLowerCase();
    const dept = (m.dept || '').toLowerCase();
    const role = (m.role || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || empId.includes(q) || dept.includes(q) || role.includes(q);
    const matchesDept = deptFilter === 'ALL' || dept.includes(deptFilter.toLowerCase());
    const matchesScope = scopeTab === 'ALL' || (scopeTab === 'ACTIVE' && (m.status === 'Active' || m.status === 'Verified'));

    return matchesSearch && matchesDept && matchesScope;
  });

  const selectedMember = facultyList.find(m => m.id === selectedFacultyId || m.employeeId === selectedFacultyId);

  const activeCount = facultyList.filter(m => m.status === 'Active' || m.status === 'Verified').length;
  const totalCount = facultyList.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('Please select a faculty member to forward this task to.');
      return;
    }

    setSubmitting(true);

    const forwardPayload = {
      taskId: task.id,
      newAssigneeId: selectedMember.id || `usr-${selectedMember.employeeId}`,
      newAssigneeEmpId: selectedMember.employeeId || selectedMember.id,
      newAssigneeName: selectedMember.name,
      newAssigneeDept: selectedMember.dept || 'CT University Faculty',
      delegatedById: authUser?.id || authUser?.employeeId || 'admin',
      delegatedByEmpId: authUser?.employeeId || '',
      delegatedByName: authUser?.name || 'University Administrator',
      delegatedByRole: authUser?.roleTitle || 'University Administrator',
      delegationNotes: forwardInstructions.trim(),
      updatedDueDate: customDueDate ? (customDueTime ? `${customDueDate}T${customDueTime}` : customDueDate) : task.dueDate,
      updatedDueTime: customDueTime || task.dueTime
    };

    onForwardTask(forwardPayload);
    setSubmitting(false);
    onClose();
  };

  const departments = Array.from(new Set(facultyList.map(m => m.dept).filter(Boolean)));

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px'
      }}
    >
      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Send size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Forward Task to Faculty
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Delegate task assigned by Super Admin down to teaching faculty with instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ffffff'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Task Info Summary Box */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Task to be Forwarded
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                {task.title}
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#475569' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Originally Created By: </span>
                  <strong style={{ color: '#0f172a' }}>👑 {task.creatorName || 'Super Admin'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Current Assignee: </span>
                  <strong style={{ color: '#2563eb' }}>{task.assigneeName}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Original Deadline: </span>
                  <strong>{formatDueDateWithDayTime(task.dueDate, task.dueTime)}</strong>
                </div>
              </div>
            </div>

            {/* Target Faculty Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={16} color="#2563eb" />
                  <span>Select Destination Faculty Member *</span>
                </label>

                {/* Scope Filter Tabs: Active vs All Directory */}
                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setScopeTab('ACTIVE')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: scopeTab === 'ACTIVE' ? '#16a34a' : 'transparent',
                      color: scopeTab === 'ACTIVE' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    🟢 Active Registered ({activeCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeTab('ALL')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: scopeTab === 'ALL' ? '#0f172a' : 'transparent',
                      color: scopeTab === 'ALL' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    📋 All Faculty ({totalCount})
                  </button>
                </div>
              </div>

              {/* Search Bar & Department Dropdown */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by faculty name, staff ID (e.g. 24166) or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
                {departments.length > 0 && (
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#f8fafc', fontWeight: '600', maxWidth: '200px' }}
                  >
                    <option value="ALL">All Departments ({departments.length})</option>
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Faculty Cards Grid */}
              <div style={{
                maxHeight: '210px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '8px',
                background: '#f8fafc'
              }}>
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#2563eb', fontSize: '13px', fontWeight: '700', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className="spin" /> Loading faculty directory...
                  </div>
                ) : filteredFaculty.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', gridColumn: '1 / -1' }}>
                    {scopeTab === 'ACTIVE' 
                      ? `No active registered faculty found matching "${searchQuery}". Click "📋 All Faculty" above to view pre-authorized teachers.` 
                      : `No faculty matching "${searchQuery}" found.`}
                  </div>
                ) : (
                  filteredFaculty.map(m => {
                    const isSelected = selectedFacultyId === m.id || selectedFacultyId === m.employeeId;
                    const isActive = m.status === 'Active' || m.status === 'Verified';

                    return (
                      <div
                        key={m.id || m.employeeId}
                        onClick={() => setSelectedFacultyId(m.id || m.employeeId)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.15s',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: isSelected ? '#2563eb' : (isActive ? '#dbeafe' : '#f1f5f9'),
                          color: isSelected ? '#ffffff' : (isActive ? '#1e40af' : '#475569'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '800', fontSize: '11.5px', flexShrink: 0
                        }}>
                          {m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : 'FC')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {m.name}
                            </span>
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: '800',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: isActive ? '#dcfce7' : '#fef3c7',
                              color: isActive ? '#15803d' : '#b45309',
                              flexShrink: 0
                            }}>
                              {isActive ? 'Active' : 'Pre-Auth'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.dept} • ID: <strong>{m.employeeId}</strong>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#2563eb" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Additional Admin Delegation Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                Additional Admin Instructions / Delegation Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please compile the Criterion 4 student feedback forms and submit the consolidated Excel by Wednesday 3 PM."
                value={forwardInstructions}
                onChange={(e) => setForwardInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Deadline Adjustment */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Target Faculty Deadline (Date)
                </label>
                <input
                  type="date"
                  value={customDueDate}
                  onChange={(e) => setCustomDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Time
                </label>
                <input
                  type="time"
                  value={customDueTime}
                  onChange={(e) => setCustomDueTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedMember}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                cursor: (submitting || !selectedMember) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Send size={15} />
              <span>{submitting ? 'Forwarding...' : `↗️ Forward Task to ${selectedMember ? selectedMember.name.split(' ')[0] : 'Faculty'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

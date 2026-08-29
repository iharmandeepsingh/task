import React from 'react';
import { Building2, ChevronDown, X } from 'lucide-react';

const CTU_DEPARTMENTS = [
  'School of Engineering & Technology',
  'School of Management Studies',
  'School of Legal Studies',
  'School of Hotel Management, Airlines and Tourism',
  'School of Design and Innovation',
  'School of Allied and Healthcare Sciences',
  'School of Pharmaceutical Sciences',
  'School of Humanities and Physical Education',
  'School of Agriculture and Natural Sciences',
];

const DEPT_SHORT = {
  'School of Engineering & Technology':               'School of Engineering & Technology',
  'School of Management Studies':                     'School of Management Studies',
  'School of Legal Studies':                          'School of Legal Studies',
  'School of Hotel Management, Airlines and Tourism': 'School of Hotel Management & Tourism',
  'School of Design and Innovation':                  'School of Design & Innovation',
  'School of Allied and Healthcare Sciences':         'School of Allied & Healthcare Sciences',
  'School of Pharmaceutical Sciences':                'School of Pharmaceutical Sciences',
  'School of Humanities and Physical Education':      'School of Humanities & Physical Ed',
  'School of Agriculture and Natural Sciences':       'School of Agriculture & Natural Sciences',
};

export default function TagFilterBar({
  tasks = [],
  filterDept = 'ALL',
  onSelectDept,
  currentRole,
  isMobile = false
}) {
  const isAdmin = ['superAdmin', 'admin'].includes(currentRole);
  const getDeptCount = (dept) => tasks.filter(t => (t.departmentName || '').toLowerCase().includes(dept.toLowerCase())).length;

  if (!isAdmin || !onSelectDept) return null;

  // 📱 MOBILE VIEW: Compact Single-Line School Dropdown
  if (isMobile) {
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: filterDept === 'ALL' ? '#ffffff' : '#eff6ff',
          borderRadius: '12px',
          border: `1.5px solid ${filterDept === 'ALL' ? '#cbd5e1' : '#3b82f6'}`,
          padding: '2px 8px 2px 10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease'
        }}>
          <Building2 size={15} color={filterDept === 'ALL' ? '#64748b' : '#2563eb'} style={{ flexShrink: 0, marginRight: '6px' }} />
          
          <select
            value={filterDept}
            onChange={(e) => onSelectDept(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 24px 8px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '12.5px',
              fontWeight: '700',
              color: filterDept === 'ALL' ? '#334155' : '#1d4ed8',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            <option value="ALL">All Schools & Departments ({tasks.length} tasks)</option>
            {CTU_DEPARTMENTS.map((dept) => {
              const count = getDeptCount(dept);
              return (
                <option key={dept} value={dept}>
                  {DEPT_SHORT[dept] || dept} ({count})
                </option>
              );
            })}
          </select>

          {filterDept !== 'ALL' ? (
            <button
              onClick={() => onSelectDept('ALL')}
              style={{
                position: 'absolute',
                right: '8px',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                cursor: 'pointer'
              }}
              title="Clear school filter"
            >
              <X size={12} />
            </button>
          ) : (
            <ChevronDown size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
          )}
        </div>
      </div>
    );
  }

  // 🖥️ DESKTOP VIEW: Clean School & Department Filter Bar
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--surface-bg, #ffffff)',
        borderRadius: '10px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#2563eb" />
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary, #0f172a)' }}>Filter by School / Faculty:</span>
        </div>

        <div style={{ position: 'relative', minWidth: '320px', flex: 1, maxWidth: '480px' }}>
          <select
            value={filterDept}
            onChange={(e) => onSelectDept(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 30px 7px 12px',
              borderRadius: '6px',
              border: `1px solid ${filterDept === 'ALL' ? 'var(--border-color, #cbd5e1)' : '#2563eb'}`,
              background: filterDept === 'ALL' ? 'var(--bg-color, #f8fafc)' : '#eff6ff',
              fontSize: '12.5px',
              fontWeight: '600',
              color: filterDept === 'ALL' ? 'var(--text-primary, #334155)' : '#1d4ed8',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            <option value="ALL">All Schools & Departments ({tasks.length} tasks)</option>
            {CTU_DEPARTMENTS.map((dept) => {
              const count = getDeptCount(dept);
              return (
                <option key={dept} value={dept}>
                  {DEPT_SHORT[dept] || dept} ({count} tasks)
                </option>
              );
            })}
          </select>
          <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {filterDept !== 'ALL' && (
          <button
            onClick={() => onSelectDept('ALL')}
            style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '11.5px',
              fontWeight: '700',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={12} /> Clear School Filter
          </button>
        )}
      </div>
    </div>
  );
}

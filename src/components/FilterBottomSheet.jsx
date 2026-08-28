import React from 'react';
import { X, Filter, Check, RotateCcw, Building2 } from 'lucide-react';

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
  'School of Engineering & Technology':               '⚙️ Engineering',
  'School of Management Studies':                     '📊 Management',
  'School of Legal Studies':                          '⚖️ Law',
  'School of Hotel Management, Airlines and Tourism': '🏨 Hotel & Tourism',
  'School of Design and Innovation':                  '🎨 Design',
  'School of Allied and Healthcare Sciences':         '🏥 Healthcare',
  'School of Pharmaceutical Sciences':                '💊 Pharma',
  'School of Humanities and Physical Education':      '📚 Humanities',
  'School of Agriculture and Natural Sciences':       '🌾 Agriculture',
};

export default function FilterBottomSheet({
  isOpen,
  onClose,
  filterPriority,
  setFilterPriority,
  selectedTag,
  setSelectedTag,
  filterDirection,
  setFilterDirection,
  filterDept = 'ALL',
  setFilterDept,
  availableTags = [],
  currentRole
}) {
  if (!isOpen) return null;

  const isAdmin = ['superAdmin', 'admin'].includes(currentRole);
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];
  const directions = [
    { key: 'ALL',      label: '👥 All Tasks' },
    { key: 'INCOMING', label: '📥 Assigned To Me' },
    { key: 'OUTGOING', label: '📤 Assigned By Me' }
  ];

  const handleReset = () => {
    setFilterPriority('All');
    setSelectedTag('ALL');
    setFilterDirection('ALL');
    if (setFilterDept) setFilterDept('ALL');
  };

  const pillStyle = (active) => ({
    padding: '6px 12px',
    borderRadius: '8px',
    border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
    background: active ? '#eff6ff' : '#f8fafc',
    color: active ? '#1d4ed8' : '#475569',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  });

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', zIndex: 1100
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', background: '#ffffff',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          padding: '20px', maxHeight: '85vh', overflowY: 'auto',
          boxSizing: 'border-box', boxShadow: '0 -10px 25px rgba(0,0,0,0.1)'
        }}
      >
        {/* Drag handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#cbd5e1', margin: '0 auto 16px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#2563eb" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Filter Tasks</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={12} /> Reset All
            </button>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} color="#64748b" />
            </button>
          </div>
        </div>

        {/* 🏛️ Department Filter — Admin & Super Admin only */}
        {isAdmin && setFilterDept && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Building2 size={15} color="#2563eb" />
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>School / Department</label>
              {filterDept !== 'ALL' && (
                <button onClick={() => setFilterDept('ALL')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setFilterDept('ALL')} style={{
                ...pillStyle(filterDept === 'ALL'),
                background: filterDept === 'ALL' ? '#0f172a' : '#f8fafc',
                color: filterDept === 'ALL' ? '#ffffff' : '#475569',
                border: filterDept === 'ALL' ? '2px solid #0f172a' : '1px solid #cbd5e1',
              }}>
                🏫 All Schools
              </button>
              {CTU_DEPARTMENTS.map(dept => {
                const isActive = filterDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setFilterDept(isActive ? 'ALL' : dept)}
                    style={{
                      ...pillStyle(isActive),
                      background: isActive ? '#6366f1' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#475569',
                      border: isActive ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    }}
                  >
                    {DEPT_SHORT[dept] || dept}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority Filter */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Priority</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {priorities.map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} style={pillStyle(filterPriority === p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* Direction Filter */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Assignment Direction</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {directions.map(d => (
              <button key={d.key} onClick={() => setFilterDirection(d.key)} style={pillStyle(filterDirection === d.key)}>{d.label}</button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>Category / Tags</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => setSelectedTag('ALL')} style={pillStyle(selectedTag === 'ALL')}>All Tags</button>
              {availableTags.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(tag)} style={pillStyle(selectedTag === tag)}>#{tag}</button>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1e293b', color: '#ffffff', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
        >
          ✓ Apply Filters
        </button>
      </div>
    </div>
  );
}

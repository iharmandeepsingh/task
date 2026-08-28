import React from 'react';
import { Tag, X, Inbox, Send, Layers, Building2, ChevronDown } from 'lucide-react';

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
  'School of Engineering & Technology':               '⚙️ School of Engineering & Technology',
  'School of Management Studies':                     '📊 School of Management Studies',
  'School of Legal Studies':                          '⚖️ School of Legal Studies',
  'School of Hotel Management, Airlines and Tourism': '🏨 School of Hotel Management, Airlines and Tourism',
  'School of Design and Innovation':                  '🎨 School of Design and Innovation',
  'School of Allied and Healthcare Sciences':         '🏥 School of Allied and Healthcare Sciences',
  'School of Pharmaceutical Sciences':                '💊 School of Pharmaceutical Sciences',
  'School of Humanities and Physical Education':      '📚 School of Humanities and Physical Education',
  'School of Agriculture and Natural Sciences':       '🌾 School of Agriculture and Natural Sciences',
};

export default function TagFilterBar({
  tasks = [],
  selectedTag,
  onSelectTag,
  filterDirection = 'ALL',
  onSelectDirection,
  filterDept = 'ALL',
  onSelectDept,
  authUser,
  currentRole,
  isMobile = false,
  onOpenFilterSheet
}) {
  const allTags = Array.from(
    new Set(tasks.flatMap((t) => (Array.isArray(t.tags) ? t.tags : ['Academic'])))
  ).filter(Boolean);

  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);
  const isAdmin  = ['superAdmin', 'admin'].includes(currentRole);

  const incomingCount = tasks.filter(t => authUser?.name === t.assigneeName || authUser?.id === t.assigneeId || authUser?.employeeId === t.assigneeId).length;
  const outgoingCount = tasks.filter(t => authUser?.name === t.creatorName  || authUser?.id === t.creatorId  || authUser?.employeeId === t.creatorId).length;
  const getDeptCount  = (dept) => tasks.filter(t => (t.departmentName || '').toLowerCase().includes(dept.toLowerCase())).length;

  // 📱 MOBILE VIEW: Compact Single-Line School Dropdown
  if (isMobile) {
    if (!isAdmin || !onSelectDept) return null;

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
            <option value="ALL">🏫 All Schools & Departments ({tasks.length} tasks)</option>
            {CTU_DEPARTMENTS.map((dept) => {
              const count = getDeptCount(dept);
              return (
                <option key={dept} value={dept}>
                  {DEPT_SHORT[dept] || dept} ({count})
                </option>
              );
            })}
          </select>

          {/* Right indicator or clear */}
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

  // 🖥️ DESKTOP VIEW: Sleek Dropdown + Direction + Tag Pills
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>

      {/* 🏛️ Desktop School Dropdown Bar */}
      {isAdmin && onSelectDept && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#2563eb" />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e293b' }}>Filter by School:</span>
          </div>

          <div style={{ position: 'relative', minWidth: '320px', flex: 1, maxWidth: '480px' }}>
            <select
              value={filterDept}
              onChange={(e) => onSelectDept(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 28px 7px 12px',
                borderRadius: '8px',
                border: `1.5px solid ${filterDept === 'ALL' ? '#cbd5e1' : '#3b82f6'}`,
                background: filterDept === 'ALL' ? '#f8fafc' : '#eff6ff',
                fontSize: '12.5px',
                fontWeight: '700',
                color: filterDept === 'ALL' ? '#334155' : '#1d4ed8',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            >
              <option value="ALL">🏫 All Schools & Departments ({tasks.length} tasks)</option>
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
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '11px',
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
      )}

      {/* 📥 / 📤 Directional Assignment Filter Bar for Admins & HODs */}
      {isLeader && onSelectDirection && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '14px', color: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <Layers size={16} color="#60a5fa" />
            <span>Task Direction:</span>
          </div>

          <button onClick={() => onSelectDirection('ALL')} style={{ padding: '6px 12px', borderRadius: '8px', background: filterDirection === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>👥 All Workspace Tasks</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>{tasks.length}</span>
          </button>

          <button onClick={() => onSelectDirection('INCOMING')} style={{ padding: '6px 12px', borderRadius: '8px', background: filterDirection === 'INCOMING' ? '#6366f1' : 'rgba(255,255,255,0.1)', color: '#ffffff', border: filterDirection === 'INCOMING' ? '1px solid #818cf8' : 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Inbox size={14} color="#a5b4fc" />
            <span>📥 Assigned TO Me (Incoming)</span>
            <span style={{ background: '#4f46e5', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' }}>{incomingCount}</span>
          </button>

          <button onClick={() => onSelectDirection('OUTGOING')} style={{ padding: '6px 12px', borderRadius: '8px', background: filterDirection === 'OUTGOING' ? '#10b981' : 'rgba(255,255,255,0.1)', color: '#ffffff', border: filterDirection === 'OUTGOING' ? '1px solid #34d399' : 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} color="#6ee7b7" />
            <span>📤 Assigned BY Me (Delegated)</span>
            <span style={{ background: '#059669', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' }}>{outgoingCount}</span>
          </button>
        </div>
      )}

      {/* 🏷️ Tag Pills Filter Bar */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#334155', marginRight: '4px' }}>
            <Tag size={15} color="#2563eb" />
            <span>Tag Filter:</span>
          </div>

          <button onClick={() => onSelectTag('ALL')} style={{ padding: '4px 10px', borderRadius: '16px', background: selectedTag === 'ALL' ? '#2563eb' : '#f1f5f9', color: selectedTag === 'ALL' ? '#ffffff' : '#475569', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}>
            All Tags ({tasks.length})
          </button>

          {allTags.map((t) => {
            const isSelected = selectedTag === t;
            const count = tasks.filter(task => Array.isArray(task.tags) && task.tags.includes(t)).length;
            return (
              <button key={t} onClick={() => onSelectTag(t)} style={{ padding: '4px 10px', borderRadius: '16px', background: isSelected ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#eff6ff', color: isSelected ? '#ffffff' : '#1d4ed8', border: `1px solid ${isSelected ? '#2563eb' : '#bfdbfe'}`, fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none' }}>
                <span>#{t}</span>
                <span style={{ fontSize: '9px', opacity: 0.85 }}>({count})</span>
              </button>
            );
          })}

          {selectedTag !== 'ALL' && (
            <button onClick={() => onSelectTag('ALL')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <X size={13} /><span>Clear Tag Filter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


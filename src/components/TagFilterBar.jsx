import React from 'react';
import { Tag, X, Inbox, Send, Layers } from 'lucide-react';

export default function TagFilterBar({ tasks = [], selectedTag, onSelectTag, filterDirection = 'ALL', onSelectDirection, authUser, currentRole }) {
  const allTags = Array.from(
    new Set(
      tasks.flatMap((t) => (Array.isArray(t.tags) ? t.tags : ['Academic']))
    )
  ).filter(Boolean);

  const isLeader = ['superAdmin', 'admin', 'hod', 'adminHead'].includes(currentRole);

  const incomingCount = tasks.filter(t => authUser?.name === t.assigneeName || authUser?.id === t.assigneeId || authUser?.employeeId === t.assigneeId).length;
  const outgoingCount = tasks.filter(t => authUser?.name === t.creatorName || authUser?.id === t.creatorId || authUser?.employeeId === t.creatorId).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
      {/* 📥 / 📤 Directional Assignment Filter Bar for Admins & HODs */}
      {isLeader && onSelectDirection && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '14px',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <Layers size={16} color="#60a5fa" />
            <span>Task Direction Filter:</span>
          </div>

          <button
            onClick={() => onSelectDirection('ALL')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: filterDirection === 'ALL' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>👥 All Workspace Tasks</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>{tasks.length}</span>
          </button>

          <button
            onClick={() => onSelectDirection('INCOMING')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: filterDirection === 'INCOMING' ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: filterDirection === 'INCOMING' ? '1px solid #818cf8' : 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Inbox size={14} color="#a5b4fc" />
            <span>📥 Assigned TO Me (Incoming)</span>
            <span style={{ background: '#4f46e5', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' }}>{incomingCount}</span>
          </button>

          <button
            onClick={() => onSelectDirection('OUTGOING')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: filterDirection === 'OUTGOING' ? '#10b981' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: filterDirection === 'OUTGOING' ? '1px solid #34d399' : 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} color="#6ee7b7" />
            <span>📤 Assigned BY Me (Delegated)</span>
            <span style={{ background: '#059669', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '900' }}>{outgoingCount}</span>
          </button>
        </div>
      )}

      {/* 🏷️ Tag Pills Filter Bar */}
      {allTags.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#334155', marginRight: '4px' }}>
            <Tag size={15} color="#2563eb" />
            <span>Tag Filter:</span>
          </div>

          <button
            onClick={() => onSelectTag('ALL')}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              background: selectedTag === 'ALL' ? '#2563eb' : '#f1f5f9',
              color: selectedTag === 'ALL' ? '#ffffff' : '#475569',
              border: 'none',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Tags ({tasks.length})
          </button>

          {allTags.map((t) => {
            const isSelected = selectedTag === t;
            const count = tasks.filter(task => Array.isArray(task.tags) && task.tags.includes(t)).length;

            return (
              <button
                key={t}
                onClick={() => onSelectTag(t)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: isSelected ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#eff6ff',
                  color: isSelected ? '#ffffff' : '#1d4ed8',
                  border: `1px solid ${isSelected ? '#2563eb' : '#bfdbfe'}`,
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: isSelected ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                <span>#{t}</span>
                <span style={{ fontSize: '9px', opacity: 0.85 }}>({count})</span>
              </button>
            );
          })}

          {selectedTag !== 'ALL' && (
            <button
              onClick={() => onSelectTag('ALL')}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <X size={13} />
              <span>Clear Tag Filter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

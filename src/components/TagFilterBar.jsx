import React from 'react';
import { Tag, X } from 'lucide-react';

export default function TagFilterBar({ tasks = [], selectedTag, onSelectTag }) {
  // Extract all unique tags across tasks
  const allTags = Array.from(
    new Set(
      tasks.flatMap((t) => (Array.isArray(t.tags) ? t.tags : ['Academic']))
    )
  ).filter(Boolean);

  if (allTags.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '14px',
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
        <span>Quick Tag Filter:</span>
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
  );
}

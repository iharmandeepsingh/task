import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, Layers } from 'lucide-react';

export default function StatsOverview({ tasks = [], currentRole, isMobile = false }) {
  const totalTasks = tasks.length;
  const greenTasks = tasks.filter(t => t.deadlineHealth === 'Green' || t.stage === 'Accepted').length;
  const yellowTasks = tasks.filter(t => t.deadlineHealth === 'Yellow').length;
  const orangeTasks = tasks.filter(t => t.deadlineHealth === 'Orange').length;
  const redTasks = tasks.filter(t => t.deadlineHealth === 'Red' || t.isIdle).length;
  const idleCount = tasks.filter(t => t.isIdle).length;

  // 📱 Mobile Compact Stats Bar (Preserve unchanged)
  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        padding: '2px 0 10px 0',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '6px 10px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '11px',
          fontWeight: '700',
          color: '#1e293b',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <Clock size={12} color="#3b82f6" />
          <span>Total: <strong>{totalTasks}</strong></span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          background: '#f0fdf4',
          borderRadius: '10px',
          border: '1px solid #bbf7d0',
          fontSize: '11px',
          fontWeight: '700',
          color: '#15803d',
          flexShrink: 0
        }}>
          <CheckCircle2 size={12} color="#16a34a" />
          <span>On Track: {greenTasks}</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px',
          background: '#fefce8',
          borderRadius: '10px',
          border: '1px solid #fef08a',
          fontSize: '11px',
          fontWeight: '700',
          color: '#a16207',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '10px' }}>🟡</span>
          <span>Near Due: {yellowTasks}</span>
        </div>

        {(orangeTasks + redTasks > 0) && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            background: '#fef2f2',
            borderRadius: '10px',
            border: '1px solid #fecaca',
            fontSize: '11px',
            fontWeight: '700',
            color: '#b91c1c',
            flexShrink: 0
          }}>
            <AlertTriangle size={12} color="#dc2626" />
            <span>Urgent: {orangeTasks + redTasks}</span>
          </div>
        )}

        {idleCount > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            background: '#fff1f2',
            borderRadius: '10px',
            border: '1px solid #fecdd3',
            fontSize: '11px',
            fontWeight: '700',
            color: '#e11d48',
            flexShrink: 0
          }}>
            <ShieldAlert size={12} color="#e11d48" />
            <span>Idle: {idleCount}</span>
          </div>
        )}
      </div>
    );
  }

  // 🖥️ Desktop Enterprise Metric Cards
  return (
    <div className="stats-overview-grid">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total Active Tasks</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={16} color="#2563eb" />
          </div>
        </div>
        <div className="stat-value">{totalTasks}</div>
        <p className="stat-desc">Scoped University Tasks</p>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">On Track (&gt;7 Days)</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#16a34a' }}>{greenTasks}</div>
        <p className="stat-desc">Healthy Progress / Completed</p>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Approaching Deadline</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={16} color="#d97706" />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#d97706' }}>{yellowTasks}</div>
        <p className="stat-desc">Due in 3 to 7 Days</p>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Critical / Overdue</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
        </div>
        <div className="stat-value" style={{ color: '#dc2626' }}>{orangeTasks + redTasks}</div>
        <p className="stat-desc">Immediate Follow-up Required</p>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Idle Tasks (3-5d)</span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={16} color="#e11d48" />
          </div>
        </div>
        <div className="stat-value" style={{ color: idleCount > 0 ? '#e11d48' : '#64748b' }}>{idleCount}</div>
        <p className="stat-desc">No activity in 3-5 days</p>
      </div>
    </div>
  );
}

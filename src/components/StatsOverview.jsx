import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function StatsOverview({ tasks = [], currentRole, isMobile = false }) {
  const totalTasks = tasks.length;
  const greenTasks = tasks.filter(t => t.deadlineHealth === 'Green' || t.stage === 'Accepted').length;
  const yellowTasks = tasks.filter(t => t.deadlineHealth === 'Yellow').length;
  const orangeTasks = tasks.filter(t => t.deadlineHealth === 'Orange').length;
  const redTasks = tasks.filter(t => t.deadlineHealth === 'Red' || t.isIdle).length;
  const idleCount = tasks.filter(t => t.isIdle).length;

  // 📱 Mobile Compact Stats Bar
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

  // 🖥️ Desktop Full Grid Cards
  return (
    <div className="stats-overview-grid">
      <div className="stat-card total">
        <div className="stat-header">
          <span className="stat-title">Total Tasks</span>
          <div className="stat-icon-badge blue">
            <Clock size={16} />
          </div>
        </div>
        <div className="stat-value">{totalTasks}</div>
        <p className="stat-desc">University System Tasks</p>
      </div>

      <div className="stat-card green">
        <div className="stat-header">
          <span className="stat-title">🟢 Green Status</span>
          <div className="stat-icon-badge green">
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="stat-value">{greenTasks}</div>
        <p className="stat-desc">Finished / On Track (&gt;7d)</p>
      </div>

      <div className="stat-card yellow">
        <div className="stat-header">
          <span className="stat-title">🟡 Yellow Status</span>
          <div className="stat-icon-badge yellow">
            <Clock size={16} />
          </div>
        </div>
        <div className="stat-value">{yellowTasks}</div>
        <p className="stat-desc">Near Deadline (3-7d)</p>
      </div>

      <div className="stat-card orange">
        <div className="stat-header">
          <span className="stat-title">🟠 Orange / 🔴 Red</span>
          <div className="stat-icon-badge orange">
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="stat-value">{orangeTasks + redTasks}</div>
        <p className="stat-desc">Almost at / Past Deadline</p>
      </div>

      <div className="stat-card idle">
        <div className="stat-header">
          <span className="stat-title">⚠️ Idle Flags (3-5d)</span>
          <div className="stat-icon-badge red">
            <ShieldAlert size={16} />
          </div>
        </div>
        <div className="stat-value">{idleCount}</div>
        <p className="stat-desc">No update for 3-5 days</p>
      </div>
    </div>
  );
}


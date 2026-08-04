import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';

export default function StatsOverview({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.stage === 'Done').length;
  const inProgress = tasks.filter(t => t.stage === 'In Progress').length;
  const urgent = tasks.filter(t => t.priority === 'Urgent').length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <h3>Total Workspace Tasks</h3>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
          <ListTodo size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <h3>In Progress</h3>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{inProgress}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <h3>Completed Tasks</h3>
          <div className="stat-value" style={{ color: '#10b981' }}>{done}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <CheckCircle2 size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <h3>Urgent Priority</h3>
          <div className="stat-value" style={{ color: '#ef4444' }}>{urgent}</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <h3>Completion Rate</h3>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{completionRate}%</div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
          <TrendingUp size={24} />
        </div>
      </div>
    </div>
  );
}

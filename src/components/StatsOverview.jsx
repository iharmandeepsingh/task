import React from 'react';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

export default function StatsOverview({ tasks, currentRole }) {
  const totalTasks = tasks.length;
  const greenTasks = tasks.filter(t => t.deadlineHealth === 'Green' || t.stage === 'Accepted').length;
  const yellowTasks = tasks.filter(t => t.deadlineHealth === 'Yellow').length;
  const orangeTasks = tasks.filter(t => t.deadlineHealth === 'Orange').length;
  const redTasks = tasks.filter(t => t.deadlineHealth === 'Red' || t.isIdle).length;
  const idleCount = tasks.filter(t => t.isIdle).length;

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

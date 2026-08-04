import React from 'react';
import { LayoutGrid, CheckSquare, Users, Plus, Search, Filter } from 'lucide-react';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Navbar({ 
  activeView, 
  setActiveView, 
  onNewTask, 
  searchQuery, 
  setSearchQuery, 
  filterPriority, 
  setFilterPriority,
  onOpenGitModal 
}) {
  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo">
          <CheckSquare size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="brand-title">TaskPulse</h1>
            <span className="brand-tag">v1.0</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Workspace: <strong>task assignment</strong>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search Input */}
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tasks, assignees, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Priority Filter */}
        <select 
          className="select-filter"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* View Switcher */}
        <div className="view-tabs">
          <button 
            className={`view-btn ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveView('kanban')}
          >
            <LayoutGrid size={15} /> Board
          </button>
          <button 
            className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            <CheckSquare size={15} /> List
          </button>
          <button 
            className={`view-btn ${activeView === 'team' ? 'active' : ''}`}
            onClick={() => setActiveView('team')}
          >
            <Users size={15} /> Team
          </button>
        </div>

        {/* Action Buttons */}
        <button className="btn-secondary" onClick={onOpenGitModal}>
          <GithubIcon size={16} /> iharmandeepsingh
        </button>

        <button className="btn-primary" onClick={onNewTask}>
          <Plus size={18} /> Create Task
        </button>
      </div>
    </header>
  );
}

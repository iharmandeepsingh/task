import React from 'react';
import { School, Shield, UserCheck, Users, PlusCircle, Search, Filter, FileSpreadsheet, LogOut, Lock, Award, BarChart3, KeyRound } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar({
  activeView,
  setActiveView,
  onNewTask,
  searchQuery,
  setSearchQuery,
  filterPriority,
  setFilterPriority,
  authUser,
  tasks = [],
  onLogout,
  onOpenHRImport,
  onOpenReportCard,
  onOpenAnalytics,
  onOpenChangePassword,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
}) {
  const roleTitleMap = {
    superAdmin: 'Super Admin (Global Scope)',
    admin: 'University Admin',
    adminHead: 'Head of Dept (CSE Scope)',
    hod: 'Head of Dept (CSE Scope)',
    faculty: 'Faculty (Self Tasks Only)',
    hr: 'HR Executive (Employee Scope)'
  };

  const badgeColorMap = {
    superAdmin: '#8b5cf6',
    admin: '#3b82f6',
    adminHead: '#10b981',
    hod: '#10b981',
    faculty: '#f59e0b',
    hr: '#ec4899'
  };

  const currentRole = authUser?.role || 'faculty';
  const roleBadgeColor = badgeColorMap[currentRole] || '#3b82f6';
  const isFaculty = currentRole === 'faculty';

  return (
    <header className="navbar-container">
      <div className="navbar-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <School size={22} color="#ffffff" />
          </div>
          <div>
            <h1 className="brand-title" style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>CT UNIVERSITY</h1>
            <p className="brand-subtitle" style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Task Assignment & Faculty Workflow System</p>
          </div>
        </div>

        {/* Authenticated User Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 14px',
          borderRadius: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: roleBadgeColor,
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {authUser?.avatar || 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {authUser?.name}
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '8px',
                background: roleBadgeColor + '20',
                color: roleBadgeColor,
                fontWeight: '700'
              }}>
                {roleTitleMap[currentRole]}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {authUser?.email}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
            <button
              onClick={onOpenChangePassword}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Change Account Password"
            >
              <KeyRound size={13} />
              <span>Change Pass</span>
            </button>

            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Sign out of CT University portal"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="navbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <NotificationBell
            tasks={tasks}
            authUser={authUser}
            onOpenChat={onOpenChat}
            onOpenExtensionModal={onOpenExtensionModal}
            onOpenReviewModal={onOpenReviewModal}
          />

          {(currentRole === 'adminHead' || currentRole === 'hod' || currentRole === 'admin' || currentRole === 'superAdmin') && (
            <button className="btn-primary" onClick={onNewTask}>
              <PlusCircle size={16} />
              <span>Assign New Task</span>
            </button>
          )}

          {!isFaculty && (
            <button 
              className="btn-secondary" 
              onClick={onOpenAnalytics}
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(30, 58, 138, 0.25)' }}
            >
              <BarChart3 size={16} />
              <span>NAAC Analytics & Exporter</span>
            </button>
          )}

          {isFaculty && (
            <button className="btn-primary" onClick={onOpenReportCard} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Award size={16} />
              <span>My Report Card</span>
            </button>
          )}
        </div>
      </div>

      <div className="navbar-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeView === 'kanban' ? 'active' : ''}`}
            onClick={() => setActiveView('kanban')}
          >
            Workflow Board
          </button>
          <button 
            className={`nav-tab ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            Task List & Filters
          </button>
          
          {/* Strictly Hidden for Faculty Members per Security Rules */}
          {!isFaculty && (
            <button 
              className={`nav-tab ${activeView === 'team' ? 'active' : ''}`}
              onClick={() => setActiveView('team')}
            >
              Faculty Directory & HR
            </button>
          )}
        </nav>

        <div className="search-filter-bar" style={{ display: 'flex', gap: '10px' }}>
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks, codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-dropdown-wrapper">
            <Filter size={14} className="filter-icon" />
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent Priority</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

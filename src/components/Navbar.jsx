import React, { useState } from 'react';
import { School, Shield, UserCheck, Users, PlusCircle, Search, Filter, FileSpreadsheet, LogOut, Lock, Award, BarChart3, KeyRound, Sun, Moon, SlidersHorizontal, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar({
  activeView,
  setActiveView,
  onNewTask,
  searchQuery,
  setSearchQuery,
  filterPriority = 'All',
  setFilterPriority,
  authUser,
  tasks = [],
  theme = 'light',
  onToggleTheme,
  onLogout,
  onOpenHRImport,
  onOpenReportCard,
  onOpenAnalytics,
  onOpenChangePassword,
  onOpenChat,
  onOpenExtensionModal,
  onOpenReviewModal,
  isMobile = false,
  onOpenFilterSheet,
  filterDept = 'ALL',
  selectedTag = 'ALL',
  filterDirection = 'ALL'
}) {
  const [showMobileProfileMenu, setShowMobileProfileMenu] = useState(false);
  const activeFiltersCount = (filterPriority && filterPriority !== 'All' ? 1 : 0) +
    (selectedTag && selectedTag !== 'ALL' ? 1 : 0) +
    (filterDirection && filterDirection !== 'ALL' ? 1 : 0) +
    (filterDept && filterDept !== 'ALL' ? 1 : 0);

  const roleTitleMap = {
    superAdmin: 'Super Admin',
    admin: 'University Admin',
    adminHead: 'Head of Dept',
    hod: 'Head of Dept',
    faculty: 'Faculty',
    hr: 'HR Executive'
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

  // Mobile Clean Layout
  if (isMobile) {
    return (
      <header style={{
        background: 'var(--bg-card, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        padding: '10px 14px',
        position: 'sticky',
        top: 0,
        zIndex: 800,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Top Mini Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/ctu-logo.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.1' }}>CT UNIVERSITY</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{roleTitleMap[currentRole]}</div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <NotificationBell
              tasks={tasks}
              authUser={authUser}
              onOpenChat={onOpenChat}
              onOpenExtensionModal={onOpenExtensionModal}
              onOpenReviewModal={onOpenReviewModal}
            />

            {/* Dark/Light toggle */}
            <button
              onClick={onToggleTheme}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: theme === 'dark' ? '#334155' : '#f1f5f9',
                border: '1px solid #cbd5e1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: theme === 'dark' ? '#f8fafc' : '#334155'
              }}
            >
              {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#6366f1" />}
            </button>

            {/* Profile Avatar Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMobileProfileMenu(!showMobileProfileMenu)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: roleBadgeColor, color: '#ffffff',
                  fontWeight: '800', fontSize: '11px', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {authUser?.avatar || (authUser?.name ? authUser.name.substring(0, 2).toUpperCase() : 'U')}
              </button>

              {/* Mobile Profile Dropdown */}
              {showMobileProfileMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '40px', width: '220px',
                  background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', padding: '12px', zIndex: 1200
                }}>
                  <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{authUser?.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{authUser?.email}</div>
                  </div>

                  <button
                    onClick={() => { setShowMobileProfileMenu(false); onOpenChangePassword(); }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#eff6ff', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '6px' }}
                  >
                    <KeyRound size={14} /> Change Password
                  </button>

                  <button
                    onClick={() => { setShowMobileProfileMenu(false); onLogout(); }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Mobile Search Bar + Filter Trigger */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search tasks, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px 8px 30px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none',
                background: '#f8fafc', boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={onOpenFilterSheet}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: activeFiltersCount > 0 ? '#eff6ff' : '#f1f5f9',
              border: `1px solid ${activeFiltersCount > 0 ? '#3b82f6' : '#cbd5e1'}`,
              color: activeFiltersCount > 0 ? '#1d4ed8' : '#334155',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0
            }}
          >
            <SlidersHorizontal size={13} color={activeFiltersCount > 0 ? '#2563eb' : 'currentColor'} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span style={{
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '10px',
                lineHeight: 1
              }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }

  // Desktop Full Layout
  return (
    <header className="navbar-container">
      <div className="navbar-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/ctu-logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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

        <div className="navbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(currentRole === 'adminHead' || currentRole === 'hod' || currentRole === 'admin' || currentRole === 'superAdmin') && (
            <button className="btn-primary" onClick={onNewTask}>
              <PlusCircle size={16} />
              <span>Assign New Task</span>
            </button>
          )}

          <NotificationBell
            tasks={tasks}
            authUser={authUser}
            onOpenChat={onOpenChat}
            onOpenExtensionModal={onOpenExtensionModal}
            onOpenReviewModal={onOpenReviewModal}
          />

          {/* 🌙 Dark Mode / ☀️ Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: theme === 'dark' ? '#334155' : '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: theme === 'dark' ? '#f8fafc' : '#334155',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

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
              className={`nav-tab ${(activeView === 'team' || activeView === 'staff' || activeView === 'verification') ? 'active' : ''}`}
              onClick={() => setActiveView('staff')}
            >
              🛡️ Staff & Admin Records
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

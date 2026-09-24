import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './AppShell.css';

export default function AppShell({ children, pageTitle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'OWNER';

  const roleDashboardMap = {
    OWNER: '/owner-dashboard',
    ADMIN: '/admin-dashboard',
    WORKER: '/worker-dashboard'
  };

  const navItemsByRole = {
    OWNER: [
      { label: 'Dashboard', path: '/owner-dashboard' },
      { label: 'Branches', path: '/branches' },
      { label: 'Admins', path: '/admins' },
      { label: 'Workers', path: '/owner-workers' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Attendance', path: '/attendance' },
      { label: 'Inventory', path: '/inventory' },
      { label: 'Billing', path: '/billing' },
      { label: 'Expenses', path: '/expenses' },
      { label: 'Sales', path: '/sales' },
      { label: 'Logistics', path: '/logistics' },
      { label: 'AI Insights', path: '/ai-insights' },
      { label: 'Reports', path: '/reports' },
      { label: 'Settings', path: '/settings' }
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/admin-dashboard' },
      { label: 'Workers', path: '/workers' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Attendance', path: '/attendance' },
      { label: 'Shifts', path: '/shifts' },
      { label: 'Inventory', path: '/inventory' },
      { label: 'Billing', path: '/billing' },
      { label: 'Expenses', path: '/expenses' },
      { label: 'Logistics', path: '/logistics' },
      { label: 'Sales', path: '/sales' },
      { label: 'AI Insights', path: '/ai-insights' },
      { label: 'Reports', path: '/reports' },
      { label: 'Settings', path: '/settings' }
    ],
    WORKER: [
      { label: 'Dashboard', path: '/worker-dashboard' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Attendance', path: '/attendance' },
      { label: 'Shifts', path: '/shifts' },
      { label: 'Inventory', path: '/inventory' },
      { label: 'Logistics', path: '/logistics' },
      { label: 'Notifications', path: '/notifications' },
      { label: 'Settings', path: '/settings' }
    ]
  };

  const navLinks = navItemsByRole[role] || navItemsByRole.OWNER;
  const currentPath = location.pathname;

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand-wrap">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>

          <Link to={roleDashboardMap[role] || '/'} className="brand-wordmark">
            SEMS<span className="brand-dot">•</span>
          </Link>

          <span className="header-divider" />
          <span className="header-context-title">
            {pageTitle || (role.charAt(0) + role.slice(1).toLowerCase() + ' Console')}
          </span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle display theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <div className="header-user-badge">
            <span className="user-name-text">{user?.name || user?.username || 'User'}</span>
            <span className="role-pill-badge">{role}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="app-body">
        {/* Mobile backdrop */}
        <div
          className={`mobile-backdrop ${mobileOpen ? 'mobile-open' : ''}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
          <ul className="sidebar-nav-list">
            {navLinks.map(item => {
              const isActive = currentPath === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="sidebar-footer">
            <div className="org-summary-box">
              <div className="org-summary-name">
                {user?.organizationName || user?.branchName || 'SEMS Enterprise'}
              </div>
              <div className="org-summary-meta">
                {role === 'OWNER' && 'Headquarters Unit'}
                {role === 'ADMIN' && (user?.branchCode ? `Branch ${user.branchCode}` : 'Branch Office')}
                {role === 'WORKER' && (user?.employeeId ? `ID: ${user.employeeId}` : 'Field Specialist')}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="app-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

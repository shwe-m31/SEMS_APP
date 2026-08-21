import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.branchId]);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard(user?.branchId);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">Admin Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/admin-dashboard" className="nav-item active">Dashboard</Link>
            <Link to="/workers" className="nav-item">Workers</Link>
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            <Link to="/shifts" className="nav-item">Shifts</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
            <Link to="/billing" className="nav-item">Billing</Link>
            <Link to="/expenses" className="nav-item">Expenses</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/sales" className="nav-item">Sales</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Branch Overview</h2>
            {dashboardData?.branch && (
              <p className="branch-name">{dashboardData.branch.name}</p>
            )}
            <button onClick={() => navigate('/workers')} className="btn btn-primary">Manage Workers</button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Workers</h3>
                <p className="kpi-value">{dashboardData?.workerCount || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Attendance Today</h3>
                <p className="kpi-value">{dashboardData?.attendanceToday || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Pending Tasks</h3>
                <p className="kpi-value">{dashboardData?.pendingTasks || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Current Stock</h3>
                <p className="kpi-value">{dashboardData?.currentStock || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Today's Sales</h3>
                <p className="kpi-value">₹{dashboardData?.todaySales || 0}</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              <button onClick={() => navigate('/workers')} className="action-card">
                <span>Add Worker</span>
              </button>
              <button onClick={() => navigate('/tasks')} className="action-card">
                <span>Create Task</span>
              </button>
              <button onClick={() => navigate('/inventory')} className="action-card">
                <span>Update Inventory</span>
              </button>
              <button onClick={() => navigate('/billing')} className="action-card">
                <span>Create Bill</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

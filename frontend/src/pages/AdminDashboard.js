import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [branchId, setBranchId] = useState(user?.branchId || 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [branchId]);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard(branchId);
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
            <a href="/admin-dashboard" className="nav-item active">Dashboard</a>
            <a href="/workers" className="nav-item">Workers</a>
            <a href="#" className="nav-item">Tasks</a>
            <a href="#" className="nav-item">Attendance</a>
            <a href="#" className="nav-item">Shifts</a>
            <a href="#" className="nav-item">Inventory</a>
            <a href="#" className="nav-item">Billing</a>
            <a href="#" className="nav-item">Expenses</a>
            <a href="#" className="nav-item">Logistics</a>
            <a href="#" className="nav-item">Sales</a>
            <a href="/ai-insights" className="nav-item">AI Insights</a>
            <a href="#" className="nav-item">Reports</a>
            <a href="#" className="nav-item">Settings</a>
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
              <div className="kpi-icon">👷</div>
              <div className="kpi-content">
                <h3>Workers</h3>
                <p className="kpi-value">{dashboardData?.workerCount || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">✅</div>
              <div className="kpi-content">
                <h3>Attendance Today</h3>
                <p className="kpi-value">{dashboardData?.attendanceToday || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">📋</div>
              <div className="kpi-content">
                <h3>Pending Tasks</h3>
                <p className="kpi-value">{dashboardData?.pendingTasks || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">📦</div>
              <div className="kpi-content">
                <h3>Current Stock</h3>
                <p className="kpi-value">{dashboardData?.currentStock || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">💰</div>
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
                <span className="action-icon">➕</span>
                <span>Add Worker</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📋</span>
                <span>Create Task</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📦</span>
                <span>Update Inventory</span>
              </button>
              <button className="action-card">
                <span className="action-icon">💳</span>
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

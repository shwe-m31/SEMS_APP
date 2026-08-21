import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getOwnerDashboard();
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
          <span className="user-role">Owner Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/owner-dashboard" className="nav-item active">Dashboard</Link>
            <Link to="/branches" className="nav-item">Branches</Link>
            <Link to="/admins" className="nav-item">Admins</Link>
            <Link to="/owner-workers" className="nav-item">Workers</Link>
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
            <Link to="/billing" className="nav-item">Billing</Link>
            <Link to="/expenses" className="nav-item">Expenses</Link>
            <Link to="/sales" className="nav-item">Sales</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Organization Overview</h2>
            {dashboardData?.organization && (
              <p className="organization-name">{dashboardData.organization.name}</p>
            )}
            <button onClick={() => navigate('/branches')} className="btn btn-primary">Manage Branches</button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Total Branches</h3>
                <p className="kpi-value">{dashboardData?.totalBranches || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Total Workers</h3>
                <p className="kpi-value">{dashboardData?.totalWorkers || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Today's Sales</h3>
                <p className="kpi-value">₹{dashboardData?.todaySales || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-content">
                <h3>Total Inventory</h3>
                <p className="kpi-value">{dashboardData?.totalInventory || 0}</p>
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
                <h3>Attendance Today</h3>
                <p className="kpi-value">{dashboardData?.attendanceToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Branch Performance</h3>
            <div className="branch-grid">
              {dashboardData?.branches?.map(branch => (
                <div key={branch.id} className="branch-card" onClick={() => navigate('/branches')} style={{cursor: 'pointer'}}>
                  <h4>{branch.name}</h4>
                  <p className="branch-location">{branch.location}</p>
                  <div className="branch-stats">
                    <span>Location: {branch.location}</span>
                    <span>Phone: {branch.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OwnerDashboard;

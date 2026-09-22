import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
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

  const branches = dashboardData?.branches || [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">Owner Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {dashboardData?.ownerName || user?.name}</span>
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
            <div>
              <h2>{dashboardData?.organization?.name || 'Organization Overview'}</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Owner: <strong>{dashboardData?.ownerName || user?.name}</strong> • Category: <strong>{dashboardData?.organization?.category || dashboardData?.organization?.industryType || 'N/A'}</strong>
              </p>
            </div>
            <div>
              <button onClick={() => navigate('/branches')} className="btn btn-primary">+ Manage Branches</button>
            </div>
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
                <h3>Total Admins</h3>
                <p className="kpi-value">{dashboardData?.totalAdmins || 0}</p>
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
          </div>

          {/* BRANCH CARDS & TABLE SECTION */}
          <div className="section" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Enterprise Branches & Assigned Admins</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{branches.length} Registered Units</span>
            </div>

            {branches.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No branches found.</p>
            ) : (
              <div className="table-container" style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Branch Code</th>
                      <th>Branch Name</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Organization Type</th>
                      <th>Assigned Admin</th>
                      <th>Admin Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map(branch => (
                      <tr key={branch.id}>
                        <td>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: '700',
                            color: '#1d4ed8',
                            background: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #bfdbfe'
                          }}>
                            {branch.branchCode || '—'}
                          </span>
                        </td>
                        <td><strong>{branch.name}</strong></td>
                        <td>
                          {branch.city ? `${branch.city}, ${branch.state} (${branch.pincode})` : (branch.location || '—')}
                        </td>
                        <td>{branch.category || '—'}</td>
                        <td>{branch.organizationType || '—'}</td>
                        <td>
                          {branch.admin ? (
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>
                              {branch.admin.name}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                        <td>{branch.admin?.email || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default OwnerDashboard;

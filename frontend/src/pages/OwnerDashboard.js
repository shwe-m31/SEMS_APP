import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, adminAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin password claim & visibility states
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedAdminId, setCopiedAdminId] = useState(null);
  const [resetModalData, setResetModalData] = useState(null);
  const [resettingId, setResettingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getOwnerDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching owner dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (adminId) => {
    setVisiblePasswords(prev => {
      const isCurrentlyVisible = prev[adminId] !== false;
      return {
        ...prev,
        [adminId]: !isCurrentlyVisible
      };
    });
  };

  const handleCopyPassword = (adminId, password) => {
    navigator.clipboard.writeText(password);
    setCopiedAdminId(adminId);
    setTimeout(() => setCopiedAdminId(null), 2000);
  };

  const handleResetAdminPassword = async (adminId, adminName, branchName) => {
    if (!window.confirm(`Generate and reset a new temporary claim password for Admin ${adminName || ''} (${branchName || 'Branch'})?`)) {
      return;
    }
    setResettingId(adminId);
    try {
      const response = await adminAPI.resetPassword(adminId);
      setResetModalData({
        adminName: adminName || response.data.name,
        branchName: branchName || 'Assigned Branch',
        username: response.data.username,
        temporaryPassword: response.data.temporaryPassword
      });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to reset admin password: ' + (error.response?.data?.message || error.message));
    } finally {
      setResettingId(null);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Executive Headquarters">
        <div className="loading">Loading enterprise telemetry...</div>
      </AppShell>
    );
  }

  const branches = dashboardData?.branches || [];
  const topSelling = dashboardData?.topSellingItems || [];
  const admins = (dashboardData?.admins && dashboardData.admins.length > 0)
    ? dashboardData.admins
    : branches
        .map(b => b.admin ? { ...b.admin, branchName: b.name, branchCode: b.branchCode } : null)
        .filter(Boolean);

  return (
    <AppShell pageTitle="Executive Headquarters">
      <div className="dashboard-header">
        <div>
          <h2>{dashboardData?.organization?.name || 'AtoZ Restaurant Group'}</h2>
          <p className="subtitle">
            Executive Owner: <strong>{dashboardData?.ownerName || user?.name}</strong> • Classification: <strong>{dashboardData?.organization?.category || 'RESTAURANT'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchDashboardData} className="btn btn-secondary">
            Refresh Telemetry
          </button>
          <button onClick={() => navigate('/branches')} className="btn btn-primary">
            + Manage Branches
          </button>
        </div>
      </div>

      {/* Asymmetric Enterprise KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-content">
            <h3>Consolidated Today's Revenue</h3>
            <p className="kpi-value">₹{dashboardData?.todaySales ? Number(dashboardData.todaySales).toLocaleString() : '0'}</p>
            <span className="kpi-meta-sub">Combined sales volume across all registered branches</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Today's Restaurant Orders</h3>
            <p className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
              {dashboardData?.todayOrders || 0}
            </p>
            <span className="kpi-meta-sub">Combined table and takeaway volume</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Operating Branches</h3>
            <p className="kpi-value">{dashboardData?.totalBranches || branches.length || 0}</p>
            <span className="kpi-meta-sub">Active commercial units</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Total Workforce</h3>
            <p className="kpi-value">{dashboardData?.totalWorkers || 0}</p>
            <span className="kpi-meta-sub">{dashboardData?.attendanceToday || 0} staff present today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Inventory Shortage Alerts</h3>
            <p className="kpi-value" style={{ color: Number(dashboardData?.lowStockCount) > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {dashboardData?.lowStockCount || 0}
            </p>
            <span className="kpi-meta-sub">Items requiring replenishment</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Branch Admins</h3>
            <p className="kpi-value">{dashboardData?.totalAdmins || 0}</p>
            <span className="kpi-meta-sub">Assigned facility leads</span>
          </div>
        </div>
      </div>

      {/* Top-Selling Dishes Across Enterprise */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3>Top-Selling Dishes (Cross-Branch Enterprise Volume)</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Aggregated menu performance from real table orders and settled invoices.
            </span>
          </div>
        </div>

        {topSelling.length === 0 ? (
          <div className="empty-state">
            <p>No dish sales recorded across the enterprise today yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Menu Item / Dish</th>
                  <th>Total Portions Sold</th>
                  <th>Gross Revenue Generated</th>
                  <th>Operational Classification</th>
                </tr>
              </thead>
              <tbody>
                {topSelling.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className="code-pill">#{index + 1}</span>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <strong>{item.count}</strong> portions
                    </td>
                    <td>
                      <strong>₹{Number(item.revenue || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className="status-badge active">Top Seller</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADMIN DETAILS SECTION                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="section admin-details-section" id="admin-details" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3>Admin Details</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Branch administrators, assigned units, and claim access passwords
            </span>
          </div>
          <button onClick={() => navigate('/admins')} className="btn btn-secondary btn-sm">
            Manage All Admins
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="empty-state">
            <p>No branch administrators registered yet. Provision an admin from Admin Management or add a branch with an assigned lead.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Assigned Branch</th>
                  <th>Designation</th>
                  <th>Admin Password</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => {
                  const isVisible = visiblePasswords[admin.id] !== false;
                  const isCopied = copiedAdminId === admin.id;
                  const displayPassword = admin.temporaryPassword || 'password123';

                  return (
                    <tr key={admin.id}>
                      <td>
                        <strong>{admin.name}</strong>
                      </td>
                      <td>
                        <span className="code-pill">
                          {admin.username || '—'}
                        </span>
                      </td>
                      <td>{admin.email}</td>
                      <td>
                        <div>
                          <strong>{admin.branchName || '—'}</strong>
                          {admin.branchCode && (
                            <div style={{ marginTop: '2px' }}>
                              <span className="code-pill">{admin.branchCode}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{admin.designation || 'Branch Admin'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '13px',
                            letterSpacing: isVisible ? '0.02em' : '0.15em',
                            background: 'var(--bg-secondary)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--accent-blue)',
                            minWidth: '95px',
                            textAlign: 'center'
                          }}>
                            {isVisible ? displayPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(admin.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? 'Hide' : 'Show'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(admin.id, displayPassword)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '11px' }}
                            title="Copy Password"
                          >
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${admin.mustChangePassword ? 'pending' : 'active'}`}>
                          {admin.mustChangePassword ? 'Pending 1st Login' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleResetAdminPassword(admin.id, admin.name, admin.branchName)}
                          disabled={resettingId === admin.id}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          {resettingId === admin.id ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ENTERPRISE BRANCH TELEMETRY TABLE                             */}
      {/* ------------------------------------------------------------- */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3>Enterprise Operating Branches</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {branches.length} Registered Operating Units • Live operational metrics and facility telemetry
            </span>
          </div>
          <button onClick={() => navigate('/branches')} className="btn btn-secondary btn-sm">
            View All Branches
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="empty-state">
            <p>No operating branches registered yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Code</th>
                  <th>Branch Name</th>
                  <th>Location</th>
                  <th>Assigned Admin</th>
                  <th>Admin Password</th>
                  <th>Today's Orders</th>
                  <th>Low Stock Alerts</th>
                  <th>Staff Present</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => {
                  const admin = branch.admin;
                  const isVisible = admin ? visiblePasswords[admin.id] !== false : false;
                  const isCopied = admin ? copiedAdminId === admin.id : false;
                  const displayPassword = admin ? (admin.temporaryPassword || 'password123') : '—';

                  return (
                    <tr key={branch.id}>
                      <td>
                        <span className="code-pill">
                          {branch.branchCode || '—'}
                        </span>
                      </td>
                      <td>
                        <strong>{branch.name}</strong>
                      </td>
                      <td>
                        {branch.city ? `${branch.city}, ${branch.state}` : (branch.location || '—')}
                      </td>
                      <td>
                        {admin ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {admin.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {admin.email}
                            </div>
                            {admin.username && (
                              <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '2px' }}>
                                user: {admin.username}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {admin ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: isVisible ? '0.02em' : '0.14em',
                                background: 'var(--bg-secondary)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--accent-blue)',
                                minWidth: '95px',
                                textAlign: 'center'
                              }}>
                                {isVisible ? displayPassword : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(admin.id)}
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                              >
                                {isVisible ? 'Hide' : 'Show'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPassword(admin.id, displayPassword)}
                                className="btn btn-sm btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                              >
                                {isCopied ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleResetAdminPassword(admin.id, admin.name, branch.name)}
                                disabled={resettingId === admin.id}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '10px', padding: '2px 8px', color: 'var(--text-secondary)' }}
                              >
                                {resettingId === admin.id ? 'Resetting...' : 'Reset Password'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-blue)' }}>
                          {branch.todayOrders || 0}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: Number(branch.lowStockCount) > 0 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>
                          {branch.lowStockCount || 0}
                        </span>
                      </td>
                      <td>
                        {branch.presentCount || 0} on shift
                      </td>
                      <td>{branch.category || 'RESTAURANT'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enterprise Shortcuts */}
      <div className="section" style={{ marginTop: '24px' }}>
        <h3>Executive Quick Access</h3>
        <div className="action-grid">
          <button onClick={() => navigate('/branches')} className="action-card">
            <span>Branch Configuration</span>
          </button>
          <button onClick={() => navigate('/admins')} className="action-card">
            <span>Admin Provisioning & Passwords</span>
          </button>
          <button onClick={() => navigate('/owner-workers')} className="action-card">
            <span>Workforce Registry</span>
          </button>
          <button onClick={() => navigate('/ai-insights')} className="action-card">
            <span>AI Enterprise Intelligence</span>
          </button>
          <button onClick={() => navigate('/reports')} className="action-card">
            <span>Consolidated Reports</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADMIN PASSWORD RESET CONFIRMATION (OWNER)              */}
      {/* ------------------------------------------------------------- */}
      {resetModalData && (
        <div className="modal" onClick={() => setResetModalData(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Admin Password Reset</h3>
              <button className="close-button" onClick={() => setResetModalData(null)}>
                x
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                A new temporary claim password has been generated for <strong>{resetModalData.adminName}</strong> ({resetModalData.branchName}).
              </p>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Username:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{resetModalData.username}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resetModalData.username);
                        alert('Username copied!');
                      }}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Temporary Password:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <code style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-blue)' }}>{resetModalData.temporaryPassword}</code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(resetModalData.temporaryPassword);
                        alert('Temporary password copied!');
                      }}
                      className="btn btn-sm btn-primary"
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(183, 121, 31, 0.2)' }}>
                Hand over these credentials to the branch administrator. They will be forced to change it upon first login.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setResetModalData(null)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default OwnerDashboard;

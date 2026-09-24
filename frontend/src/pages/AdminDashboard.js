import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.branchId]);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getAdminDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Branch Operations">
        <div className="loading">Loading branch operations telemetry...</div>
      </AppShell>
    );
  }

  const branch = dashboardData?.branch;
  const recentOrders = dashboardData?.recentOrders || [];
  const recentIssues = dashboardData?.recentIssues || [];

  return (
    <AppShell pageTitle="Branch Operations Console">
      <div className="dashboard-header">
        <div>
          <h2>Branch Command Center</h2>
          {branch ? (
            <p className="subtitle">
              Unit: <strong>{branch.name}</strong> • Code: <strong>{branch.branchCode || 'N/A'}</strong> • Region: <strong>{branch.city ? `${branch.city}, ${branch.state}` : (branch.location || 'N/A')}</strong>
            </p>
          ) : (
            <p className="subtitle">Operational Facility Lead</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchDashboardData} className="btn btn-secondary">
            Refresh Telemetry
          </button>
          <button onClick={() => navigate('/workers')} className="btn btn-primary">
            + Manage Workers
          </button>
        </div>
      </div>

      {/* Core Operational KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-content">
            <h3>Today's Branch Revenue</h3>
            <p className="kpi-value">₹{dashboardData?.todaySales ? Number(dashboardData.todaySales).toLocaleString() : '0'}</p>
            <span className="kpi-meta-sub">Direct register transactions today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Enrolled Workers</h3>
            <p className="kpi-value">{dashboardData?.workerCount || 0}</p>
            <span className="kpi-meta-sub">Active staff members</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Attendance Today</h3>
            <p className="kpi-value">
              {dashboardData?.attendanceToday || 0}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '6px' }}>
                / {dashboardData?.workerCount || 0} present
              </span>
            </p>
            <span className="kpi-meta-sub">
              {dashboardData?.workersAbsent || 0} staff absent
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Stock Health</h3>
            <p className="kpi-value">
              {dashboardData?.lowStockCount || 0}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--danger)', marginLeft: '6px' }}>
                low stock
              </span>
            </p>
            <span className="kpi-meta-sub">{dashboardData?.currentStock || 0} total tracked items</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <h3>Pending Tasks</h3>
            <p className="kpi-value">{dashboardData?.pendingTasks || 0}</p>
            <span className="kpi-meta-sub">Assigned duties unresolved</span>
          </div>
        </div>
      </div>

      {/* Restaurant Live Operations Pipeline Grid */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3>Live Restaurant Order Pipeline</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Real-time progression from table order creation to kitchen prep and cashier settlement.
            </span>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Today's Orders</h3>
              <p className="kpi-value" style={{ color: 'var(--accent-blue)' }}>
                {dashboardData?.todayOrders || 0}
              </p>
              <span className="kpi-meta-sub">Total orders generated today</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Pending Kitchen</h3>
              <p className="kpi-value" style={{ color: '#64748b' }}>
                {dashboardData?.pendingOrders || 0}
              </p>
              <span className="kpi-meta-sub">Awaiting chef acceptance</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <h3>In Preparation</h3>
              <p className="kpi-value" style={{ color: '#d97706' }}>
                {dashboardData?.preparingOrders || 0}
              </p>
              <span className="kpi-meta-sub">Actively cooking in kitchen</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Ready to Serve</h3>
              <p className="kpi-value" style={{ color: '#059669' }}>
                {dashboardData?.readyOrders || 0}
              </p>
              <span className="kpi-meta-sub">Prepared, awaiting waiter</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <h3>Completed & Billed</h3>
              <p className="kpi-value" style={{ color: 'var(--success)' }}>
                {dashboardData?.completedOrders || 0}
              </p>
              <span className="kpi-meta-sub">Paid & inventory deducted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident & Issue Alerts Section */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3>Staff Incident & Maintenance Reports</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Reported facility, stock shortage, or equipment issues from kitchen and dining floor staff.
            </span>
          </div>
          {dashboardData?.openIssues > 0 && (
            <span className="status-badge inactive">
              {dashboardData.openIssues} Open Incidents
            </span>
          )}
        </div>

        {recentIssues.length === 0 ? (
          <div className="empty-state">
            <p>No operational issues or equipment malfunctions reported for this branch.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Reported Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map(issue => (
                  <tr key={issue.id}>
                    <td>
                      <strong>{issue.worker?.user?.name || issue.worker?.employeeId || 'Staff Worker'}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {issue.worker?.designation || 'Specialist'}
                      </div>
                    </td>
                    <td>
                      <span className="code-pill">
                        {issue.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: '340px' }}>{issue.description}</td>
                    <td>
                      {issue.createdAt ? new Date(issue.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${issue.status === 'OPEN' ? 'pending' : 'completed'}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Live Orders Stream */}
      <div className="section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3>Recent Restaurant Orders Activity</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Latest transactions across dining tables and takeaway counters.
            </span>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <p>No restaurant orders recorded today yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Customer</th>
                  <th>Ordered Dishes</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td><span className="code-pill">{order.tableNumber}</span></td>
                    <td>{order.customerName || 'Walk-in'}</td>
                    <td>
                      {order.items?.map(it => `${it.quantity}x ${it.menuItemName}`).join(', ') || '—'}
                    </td>
                    <td><strong>₹{Number(order.totalAmount || 0).toLocaleString()}</strong></td>
                    <td>
                      <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'pending'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Modules */}
      <div className="section" style={{ marginTop: '24px' }}>
        <h3>Operational Dispatch & Quick Actions</h3>
        <div className="action-grid">
          <button onClick={() => navigate('/workers')} className="action-card">
            <span>Staff & Worker Management</span>
          </button>
          <button onClick={() => navigate('/inventory')} className="action-card">
            <span>Inventory Register</span>
          </button>
          <button onClick={() => navigate('/attendance')} className="action-card">
            <span>Attendance Log</span>
          </button>
          <button onClick={() => navigate('/tasks')} className="action-card">
            <span>Task Assignments</span>
          </button>
          <button onClick={() => navigate('/billing')} className="action-card">
            <span>POS Billing</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default AdminDashboard;

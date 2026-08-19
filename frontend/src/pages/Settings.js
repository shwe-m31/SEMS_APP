import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Dashboard.css';

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage('Password changed successfully');
      setMessageType('success');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Failed to change password. Please check your current password.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setMessage('Profile updated successfully');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const dashboardPath = user?.role === 'OWNER' ? '/owner-dashboard' : 
                        user?.role === 'ADMIN' ? '/admin-dashboard' : '/worker-dashboard';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">{user?.role} Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to={dashboardPath} className="nav-item">Dashboard</Link>
            {user?.role === 'OWNER' && <Link to="/branches" className="nav-item">Branches</Link>}
            {user?.role === 'OWNER' && <Link to="/admins" className="nav-item">Admins</Link>}
            {user?.role === 'OWNER' && <Link to="/owner-workers" className="nav-item">Workers</Link>}
            {user?.role === 'ADMIN' && <Link to="/workers" className="nav-item">Workers</Link>}
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            {user?.role !== 'WORKER' && <Link to="/shifts" className="nav-item">Shifts</Link>}
            <Link to="/inventory" className="nav-item">Inventory</Link>
            {user?.role !== 'WORKER' && <Link to="/billing" className="nav-item">Billing</Link>}
            {user?.role !== 'WORKER' && <Link to="/expenses" className="nav-item">Expenses</Link>}
            {user?.role !== 'WORKER' && <Link to="/sales" className="nav-item">Sales</Link>}
            <Link to="/logistics" className="nav-item">Logistics</Link>
            {user?.role !== 'WORKER' && <Link to="/ai-insights" className="nav-item">AI Insights</Link>}
            {user?.role !== 'WORKER' && <Link to="/reports" className="nav-item">Reports</Link>}
            <Link to="/settings" className="nav-item active">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Settings</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
            </div>
          </div>

          {message && (
            <div className={`alert alert-${messageType}`}>
              {message}
            </div>
          )}

          <div className="settings-container">
            <div className="settings-section">
              <h3>Profile Information</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>

            <div className="settings-section">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

            <div className="settings-section">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID:</label>
                  <span>{user?.id}</span>
                </div>
                {user?.branchId && (
                  <div className="info-item">
                    <label>Branch ID:</label>
                    <span>{user.branchId}</span>
                  </div>
                )}
                {user?.branchName && (
                  <div className="info-item">
                    <label>Branch Name:</label>
                    <span>{user.branchName}</span>
                  </div>
                )}
                {user?.adminId && (
                  <div className="info-item">
                    <label>Admin ID:</label>
                    <span>{user.adminId}</span>
                  </div>
                )}
                {user?.workerId && (
                  <div className="info-item">
                    <label>Worker ID:</label>
                    <span>{user.workerId}</span>
                  </div>
                )}
                {user?.employeeId && (
                  <div className="info-item">
                    <label>Employee ID:</label>
                    <span>{user.employeeId}</span>
                  </div>
                )}
                {user?.designation && (
                  <div className="info-item">
                    <label>Designation:</label>
                    <span>{user.designation}</span>
                  </div>
                )}
                {user?.organizationId && (
                  <div className="info-item">
                    <label>Organization ID:</label>
                    <span>{user.organizationId}</span>
                  </div>
                )}
                {user?.organizationName && (
                  <div className="info-item">
                    <label>Organization Name:</label>
                    <span>{user.organizationName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;

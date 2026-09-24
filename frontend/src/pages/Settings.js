import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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

  return (
    <AppShell pageTitle="System Settings">
      <div className="dashboard-header">
        <div>
          <h2>System Settings</h2>
          <p className="page-lead" style={{ margin: '4px 0 0 0' }}>Manage personal credentials, security keys, and enterprise profile attributes.</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: 20 }}>
          {message}
        </div>
      )}

      <div className="settings-container">
        <aside className="settings-nav-col">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setMessage(''); }}
          >
            Profile Information
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => { setActiveTab('security'); setMessage(''); }}
          >
            Security & Password
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => { setActiveTab('account'); setMessage(''); }}
          >
            Account Identifiers
          </button>
        </aside>

        <section className="settings-content-col">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>Profile Information</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Enterprise Role</label>
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
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
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h3>Account Identifiers</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID</label>
                  <span>{user?.id || '—'}</span>
                </div>
                {user?.branchId && (
                  <div className="info-item">
                    <label>Branch ID</label>
                    <span>{user.branchId}</span>
                  </div>
                )}
                {user?.branchName && (
                  <div className="info-item">
                    <label>Branch Name</label>
                    <span>{user.branchName}</span>
                  </div>
                )}
                {user?.adminId && (
                  <div className="info-item">
                    <label>Admin ID</label>
                    <span>{user.adminId}</span>
                  </div>
                )}
                {user?.workerId && (
                  <div className="info-item">
                    <label>Worker ID</label>
                    <span>{user.workerId}</span>
                  </div>
                )}
                {user?.employeeId && (
                  <div className="info-item">
                    <label>Employee ID</label>
                    <span>{user.employeeId}</span>
                  </div>
                )}
                {user?.designation && (
                  <div className="info-item">
                    <label>Designation</label>
                    <span>{user.designation}</span>
                  </div>
                )}
                {user?.organizationId && (
                  <div className="info-item">
                    <label>Organization ID</label>
                    <span>{user.organizationId}</span>
                  </div>
                )}
                {user?.organizationName && (
                  <div className="info-item">
                    <label>Organization Name</label>
                    <span>{user.organizationName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default Settings;

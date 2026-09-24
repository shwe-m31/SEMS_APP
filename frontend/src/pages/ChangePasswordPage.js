import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './LoginPage.css';

export default function ChangePasswordPage() {
  const { user, changePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setSuccess(true);
      setTimeout(() => {
        const roleDashboardMap = {
          OWNER: '/owner-dashboard',
          ADMIN: '/admin-dashboard',
          WORKER: '/worker-dashboard'
        };
        navigate(roleDashboardMap[user?.role] || '/');
      }, 1500);
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="auth-center-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="auth-brand-title">
            SEMS<span className="brand-dot">•</span>
          </Link>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="auth-form-header">
          <h2>Create Permanent Password</h2>
          <p>
            {user?.mustChangePassword
              ? 'Please change your temporary password before accessing the enterprise console.'
              : 'Update your account security credentials.'}
          </p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}
        {success && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success)',
              color: 'var(--success)',
              fontSize: '13px',
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Password changed successfully. Redirecting to dashboard...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field-group">
            <label htmlFor="current-password">Current / Temporary Password *</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-field-group">
            <label htmlFor="new-password">New Password *</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Min 6 characters"
              minLength="6"
              autoComplete="new-password"
            />
          </div>

          <div className="form-field-group">
            <label htmlFor="confirm-new-password">Confirm New Password *</label>
            <input
              type="password"
              id="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || success} style={{ width: '100%' }}>
            {loading ? 'Updating Credentials...' : 'Save New Password'}
          </button>
        </form>

        <div className="auth-form-footer">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            Sign out and return to Login
          </button>
        </div>
      </div>
    </div>
  );
}

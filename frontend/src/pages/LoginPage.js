import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Role: OWNER | ADMIN | WORKER
  const [role, setRole] = useState('OWNER');

  // Fields
  const [username, setUsername] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['OWNER', 'ADMIN', 'WORKER'].includes(roleParam.toUpperCase())) {
      setRole(roleParam.toUpperCase());
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let credentials = { role, password };

      if (role === 'OWNER') {
        if (!username.trim()) {
          setError('Username or email is required');
          setLoading(false);
          return;
        }
        credentials.username = username.trim();
        credentials.email = username.trim();
      } else if (role === 'ADMIN') {
        if (!branchCode.trim()) {
          setError('Branch Code is required');
          setLoading(false);
          return;
        }
        credentials.branchCode = branchCode.trim().toUpperCase();
      } else if (role === 'WORKER') {
        if (!branchCode.trim()) {
          setError('Branch Code is required');
          setLoading(false);
          return;
        }
        if (!employeeId.trim()) {
          setError('Employee ID is required');
          setLoading(false);
          return;
        }
        credentials.branchCode = branchCode.trim().toUpperCase();
        credentials.employeeId = employeeId.trim();
      }

      const response = await login(credentials);

      // Check if first-login password change is required
      if (response.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      // Redirect based on role
      const roleDashboardMap = {
        'OWNER': '/owner-dashboard',
        'ADMIN': '/admin-dashboard',
        'WORKER': '/worker-dashboard'
      };

      navigate(roleDashboardMap[response.role] || '/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Sign In</h1>
          <p>Access your SEMS enterprise portal</p>
        </div>

        {/* 3 Role Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${role === 'OWNER' ? 'active' : ''}`}
            onClick={() => {
              setRole('OWNER');
              setError('');
            }}
          >
            Owner
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => {
              setRole('ADMIN');
              setError('');
            }}
          >
            Admin
          </button>
          <button
            type="button"
            className={`role-tab-btn ${role === 'WORKER' ? 'active' : ''}`}
            onClick={() => {
              setRole('WORKER');
              setError('');
            }}
          >
            Worker
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* OWNER FORM */}
          {role === 'OWNER' && (
            <div className="form-group">
              <label htmlFor="owner-username">Username or Email</label>
              <input
                type="text"
                id="owner-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username or owner email"
                autoComplete="username"
              />
            </div>
          )}

          {/* ADMIN FORM */}
          {role === 'ADMIN' && (
            <div className="form-group">
              <label htmlFor="admin-branch-code">Branch Code</label>
              <input
                type="text"
                id="admin-branch-code"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                required
                placeholder="e.g. SEMS-CHN-001"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
            </div>
          )}

          {/* WORKER FORM */}
          {role === 'WORKER' && (
            <>
              <div className="form-group">
                <label htmlFor="worker-branch-code">Branch Code</label>
                <input
                  type="text"
                  id="worker-branch-code"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  required
                  placeholder="e.g. SEMS-CHN-001"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="worker-emp-id">Employee ID</label>
                <input
                  type="text"
                  id="worker-emp-id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  placeholder="e.g. FB-CH-001"
                />
              </div>
            </>
          )}

          {/* PASSWORD FIELD */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={role === 'ADMIN' ? 'Enter temporary or permanent password' : 'Enter password'}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Create Owner Account</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <h3>Quick Demo Sign-In</h3>
          <p><strong>Owner:</strong> freshbake_owner / password123</p>
          <p><strong>Admin:</strong> SEMS-CHN-001 / (generated temporary password)</p>
          <p><strong>Worker:</strong> SEMS-CHN-001 / FB-CH-001 / password123</p>
          <p style={{ marginTop: '0.4rem', fontSize: '10px', color: '#64748b' }}>
            * Existing email accounts (e.g. owner@freshbake.com) also supported under Owner.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

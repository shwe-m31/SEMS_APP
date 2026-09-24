import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './LoginPage.css';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

      if (response.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      const roleDashboardMap = {
        OWNER: '/owner-dashboard',
        ADMIN: '/admin-dashboard',
        WORKER: '/worker-dashboard'
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
    <div className="auth-page">
      <div className="auth-split-wrapper">
        {/* Left Hero Statement Panel */}
        <div className="auth-hero-panel">
          <div className="auth-brand-head">
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

          <div className="auth-hero-statement">
            <span className="auth-eyebrow">Enterprise Access</span>
            <h1 className="auth-hero-title">
              Enterprise clarity.<br />
              Continuous control.
            </h1>
            <p className="auth-hero-desc">
              Sign in to manage multi-location branch operations, workforce schedules,
              inventory pipelines, and financial tracking across your commercial enterprise.
            </p>
          </div>

          <div className="auth-hero-footer-meta">
            <span>SEMS Architecture v2.0</span>
            <span>Zero-Icon Minimalist UI</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-form-header">
              <h2>Console Sign In</h2>
              <p>Select your authorized credential tier below</p>
            </div>

            {/* Role Switcher */}
            <div className="role-segmented-switcher">
              <button
                type="button"
                className={`role-switcher-tab ${role === 'OWNER' ? 'active' : ''}`}
                onClick={() => {
                  setRole('OWNER');
                  setError('');
                }}
              >
                Owner
              </button>
              <button
                type="button"
                className={`role-switcher-tab ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => {
                  setRole('ADMIN');
                  setError('');
                }}
              >
                Admin
              </button>
              <button
                type="button"
                className={`role-switcher-tab ${role === 'WORKER' ? 'active' : ''}`}
                onClick={() => {
                  setRole('WORKER');
                  setError('');
                }}
              >
                Worker
              </button>
            </div>

            {error && <div className="auth-error-alert">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {role === 'OWNER' && (
                <div className="form-field-group">
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

              {role === 'ADMIN' && (
                <div className="form-field-group">
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

              {role === 'WORKER' && (
                <>
                  <div className="form-field-group">
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

                  <div className="form-field-group">
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

              <div className="form-field-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={role === 'ADMIN' ? 'Temporary or permanent password' : 'Enter account password'}
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Authenticating...' : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
              </button>
            </form>

            <div className="auth-form-footer">
              <p>
                Don't have an enterprise account? <Link to="/register">Register Business</Link>
              </p>
              <p>
                <Link to="/">Back to Homepage</Link>
              </p>
            </div>

            {/* Quick Demo Credentials */}
            <div className="demo-credentials-editorial">
              <span className="demo-credentials-title">Quick Demo Credentials</span>
              <div className="demo-credential-row">
                <span>Owner:</span>
                <span className="demo-credential-val">freshbake_owner / password123</span>
              </div>
              <div className="demo-credential-row">
                <span>Admin:</span>
                <span className="demo-credential-val">SEMS-CHN-001 / (temp password)</span>
              </div>
              <div className="demo-credential-row">
                <span>Worker:</span>
                <span className="demo-credential-val">SEMS-CHN-001 / FB-CH-001 / password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

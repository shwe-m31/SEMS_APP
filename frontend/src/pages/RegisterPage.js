import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

function RegisterPage() {
  const [userType, setUserType] = useState('OWNER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    // Owner specific
    organizationName: '',
    organizationType: 'MEDIUM',
    industryType: 'MANUFACTURING',
    hasBranches: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData = {
        ...formData,
        role: userType
      };
      
      await register(registrationData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join SEMS to manage your enterprise</p>
        </div>

        <div className="user-type-toggle">
          <button
            className={`toggle-btn ${userType === 'OWNER' ? 'active' : ''}`}
            onClick={() => setUserType('OWNER')}
          >
            Owner
          </button>
          <button
            className={`toggle-btn ${userType === 'WORKER' ? 'active' : ''}`}
            onClick={() => setUserType('WORKER')}
          >
            Worker
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {userType === 'OWNER' && (
            <>
              <div className="section-divider">
                <span>Organization Details</span>
              </div>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name *</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  placeholder="Enter organization name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="organizationType">Organization Size *</label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                  >
                    <option value="SMALL">Small (1-10 employees)</option>
                    <option value="MEDIUM">Medium (10-50 employees)</option>
                    <option value="LARGE">Large (50+ employees)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="industryType">Industry Type *</label>
                  <select
                    id="industryType"
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="FOOD_RETAIL">Food & Retail</option>
                    <option value="TEXTILE_FABRIC">Textile & Fabric</option>
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="WAREHOUSE_DISTRIBUTION">Warehouse & Distribution</option>
                    <option value="OTHER_MSME">Other MSME</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="hasBranches"
                    checked={formData.hasBranches}
                    onChange={handleChange}
                  />
                  <span>I have multiple branches/business units</span>
                </label>
              </div>

              {formData.hasBranches && (
                <div className="roles-info">
                  <p>✓ You can create Admin/Incharge accounts for branch management</p>
                  <p>✓ You can create Worker accounts through your management system</p>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p>
            <Link to="/">Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

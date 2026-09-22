import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BUSINESS_CATEGORIES, CATEGORY_LABELS } from '../constants/businessCategories';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { registerOwner } = useAuth();

  // Wizard state:
  // 1: Owner Question (Yes/No)
  // 'non_owner': Admin/Worker guidance
  // 2: Owner Credentials
  // 3: Owner Personal Details
  // 4: Organization Details
  // 5: Branch Details
  // 6: Admin Assignment
  // 7: Success Screen
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Form State
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [ownerDetails, setOwnerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE'
  });

  const [organization, setOrganization] = useState({
    name: '',
    size: 'MEDIUM',
    category: 'SHOPS',
    type: 'Bakery Shop',
    hasBranches: false,
    numberOfBranches: 1
  });

  const [branches, setBranches] = useState([
    {
      name: '',
      state: 'Tamil Nadu',
      city: 'Chennai',
      pincode: '',
      category: 'SHOPS',
      type: 'Bakery Shop',
      address: '',
      phone: ''
    }
  ]);

  const [admins, setAdmins] = useState([
    {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'FEMALE',
      branchIndex: 0
    }
  ]);

  const [createdSummary, setCreatedSummary] = useState(null);

  // Handlers
  const handleOrgCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const availableTypes = BUSINESS_CATEGORIES[selectedCategory] || [];
    const defaultType = availableTypes[0] || '';
    
    setOrganization(prev => ({
      ...prev,
      category: selectedCategory,
      type: defaultType
    }));

    // Update branches default category and type
    setBranches(prev => prev.map(b => ({
      ...b,
      category: selectedCategory,
      type: defaultType
    })));
  };

  const handleBranchCountChange = (count) => {
    const num = Math.max(1, Math.min(20, parseInt(count) || 1));
    setOrganization(prev => ({ ...prev, numberOfBranches: num }));

    setBranches(prev => {
      const nextBranches = [...prev];
      if (num > nextBranches.length) {
        for (let i = nextBranches.length; i < num; i++) {
          nextBranches.push({
            name: '',
            state: nextBranches[0]?.state || 'Tamil Nadu',
            city: '',
            pincode: '',
            category: organization.category,
            type: organization.type,
            address: '',
            phone: ''
          });
        }
      } else if (num < nextBranches.length) {
        nextBranches.splice(num);
      }
      return nextBranches;
    });

    setAdmins(prev => {
      const nextAdmins = [...prev];
      if (num > nextAdmins.length) {
        for (let i = nextAdmins.length; i < num; i++) {
          nextAdmins.push({
            name: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: 'MALE',
            branchIndex: i
          });
        }
      } else if (num < nextAdmins.length) {
        nextAdmins.splice(num);
      }
      return nextAdmins;
    });
  };

  const handleBranchChange = (index, field, value) => {
    setBranches(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === 'category') {
        const types = BUSINESS_CATEGORIES[value] || [];
        updated[index].type = types[0] || '';
      }
      return updated;
    });
  };

  const handleAdminChange = (index, field, value) => {
    setAdmins(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value, branchIndex: index };
      return updated;
    });
  };

  // Step Validations
  const validateStep2 = () => {
    if (!credentials.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (credentials.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!credentials.password) {
      setError('Password is required');
      return false;
    }
    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!ownerDetails.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!ownerDetails.email.trim()) {
      setError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerDetails.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!organization.name.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (organization.hasBranches && organization.numberOfBranches < 1) {
      setError('Please specify at least 1 branch');
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    for (let i = 0; i < branches.length; i++) {
      const b = branches[i];
      if (!b.name.trim()) {
        setError(`Branch ${i + 1} Name is required`);
        return false;
      }
      if (!b.state.trim()) {
        setError(`Branch ${i + 1} State is required`);
        return false;
      }
      if (!b.city.trim()) {
        setError(`Branch ${i + 1} City is required`);
        return false;
      }
      if (!b.pincode.trim()) {
        setError(`Branch ${i + 1} Pincode is required`);
        return false;
      }
    }
    return true;
  };

  const validateStep6 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < admins.length; i++) {
      const a = admins[i];
      const branchName = branches[i]?.name || `Branch ${i + 1}`;
      if (!a.name.trim()) {
        setError(`Admin Name for ${branchName} is required`);
        return false;
      }
      if (!a.email.trim()) {
        setError(`Admin Email for ${branchName} is required`);
        return false;
      }
      if (!emailRegex.test(a.email.trim())) {
        setError(`Invalid email address for Admin of ${branchName}`);
        return false;
      }
      if (a.email.trim().toLowerCase() === ownerDetails.email.trim().toLowerCase()) {
        setError(`Admin email for ${branchName} cannot be identical to Owner email`);
        return false;
      }
    }
    return true;
  };

  // Submit complete onboarding payload
  const handleSubmitOnboarding = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep6()) return;

    setLoading(true);
    try {
      const payload = {
        username: credentials.username.trim(),
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        owner: {
          name: ownerDetails.name.trim(),
          email: ownerDetails.email.trim(),
          phone: ownerDetails.phone.trim(),
          dateOfBirth: ownerDetails.dateOfBirth,
          gender: ownerDetails.gender
        },
        organization: {
          name: organization.name.trim(),
          size: organization.size,
          category: organization.category,
          type: organization.type,
          hasBranches: organization.hasBranches
        },
        branches: branches.map(b => ({
          name: b.name.trim(),
          state: b.state.trim(),
          city: b.city.trim(),
          pincode: b.pincode.trim(),
          category: b.category,
          type: b.type,
          address: b.address.trim(),
          phone: b.phone.trim()
        })),
        admins: admins.map((a, idx) => ({
          name: a.name.trim(),
          email: a.email.trim(),
          phone: a.phone.trim(),
          dateOfBirth: a.dateOfBirth,
          gender: a.gender,
          branchIndex: idx,
          branchName: branches[idx]?.name || ''
        }))
      };

      const response = await registerOwner(payload);
      setCreatedSummary(response);
      setCurrentStep(7);
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>SEMS Onboarding</h1>
          <p>Smart Enterprise Management System</p>
        </div>

        {/* Step Indicator (Only for steps 2 to 6) */}
        {typeof currentStep === 'number' && currentStep >= 2 && currentStep <= 6 && (
          <div className="step-indicator">
            {[
              { num: 2, label: 'Account' },
              { num: 3, label: 'Owner' },
              { num: 4, label: 'Organization' },
              { num: 5, label: 'Branches' },
              { num: 6, label: 'Admins' },
            ].map(step => (
              <div 
                key={step.num} 
                className={`step-pill ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
              >
                <div className="step-circle">{currentStep > step.num ? '✓' : step.num - 1}</div>
                <span className="step-title">{step.label}</span>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {/* STEP 1: Are you an Owner? */}
        {currentStep === 1 && (
          <div className="owner-question-card">
            <h2>Create New Account</h2>
            <p>Are you an owner of the organization?</p>
            <div className="choice-buttons-grid">
              <button
                type="button"
                className="choice-card-btn primary"
                onClick={() => {
                  setError('');
                  setCurrentStep(2);
                }}
              >
                <span>Yes, I am an Owner</span>
                <span className="btn-desc">Create enterprise organization & manage branches</span>
              </button>
              <button
                type="button"
                className="choice-card-btn"
                onClick={() => {
                  setError('');
                  setCurrentStep('non_owner');
                }}
              >
                <span>No</span>
                <span className="btn-desc">I am an Admin, Manager, or Worker</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 (NO): Admin/Worker Guidance */}
        {currentStep === 'non_owner' && (
          <div className="non-owner-card">
            <h3>Choose your role</h3>
            <p>
              Admin and Worker accounts are created by authorized users within the organization. 
              Public account self-registration is restricted to preserve organization access control.
            </p>
            <div className="role-signin-options">
              <div className="role-signin-box">
                <h4>Admin Account</h4>
                <p>Sign in using your assigned Branch Code and password</p>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate('/login?role=ADMIN')}
                >
                  Admin Sign In
                </button>
              </div>
              <div className="role-signin-box">
                <h4>Worker Account</h4>
                <p>Sign in using your Branch Code, Employee ID, and password</p>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => navigate('/login?role=WORKER')}
                >
                  Worker Sign In
                </button>
              </div>
            </div>
            <div className="form-actions-row" style={{ marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(1);
                }}
              >
                Back to Account Selection
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Owner Credentials */}
        {currentStep === 2 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (validateStep2()) setCurrentStep(3);
          }}>
            <div className="section-divider">
              <span>Step 1: Create Owner Account</span>
            </div>

            <div className="form-group">
              <label htmlFor="owner-username">Username *</label>
              <input
                type="text"
                id="owner-username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                placeholder="Choose a unique username"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="owner-password">Password *</label>
                <input
                  type="password"
                  id="owner-password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                  placeholder="Min 6 characters"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner-confirm-password">Confirm Password *</label>
                <input
                  type="password"
                  id="owner-confirm-password"
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(1);
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Next: Personal Details
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Owner Personal Details */}
        {currentStep === 3 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (validateStep3()) setCurrentStep(4);
          }}>
            <div className="section-divider">
              <span>Step 2: Owner Personal Details</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="owner-name">Full Name *</label>
                <input
                  type="text"
                  id="owner-name"
                  value={ownerDetails.name}
                  onChange={(e) => setOwnerDetails({ ...ownerDetails, name: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner-email">Email Address *</label>
                <input
                  type="email"
                  id="owner-email"
                  value={ownerDetails.email}
                  onChange={(e) => setOwnerDetails({ ...ownerDetails, email: e.target.value })}
                  required
                  placeholder="owner@company.com"
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="owner-phone">Phone Number</label>
                <input
                  type="tel"
                  id="owner-phone"
                  value={ownerDetails.phone}
                  onChange={(e) => setOwnerDetails({ ...ownerDetails, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner-dob">Date of Birth</label>
                <input
                  type="date"
                  id="owner-dob"
                  value={ownerDetails.dateOfBirth}
                  onChange={(e) => setOwnerDetails({ ...ownerDetails, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="owner-gender">Gender</label>
                <select
                  id="owner-gender"
                  value={ownerDetails.gender}
                  onChange={(e) => setOwnerDetails({ ...ownerDetails, gender: e.target.value })}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(2);
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Next: Organization Details
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Organization Details */}
        {currentStep === 4 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (validateStep4()) setCurrentStep(5);
          }}>
            <div className="section-divider">
              <span>Step 3: Organization Details</span>
            </div>

            <div className="form-group">
              <label htmlFor="org-name">Organization Name *</label>
              <input
                type="text"
                id="org-name"
                value={organization.name}
                onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                required
                placeholder="e.g. FreshBake Foods"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="org-size">Organization Size *</label>
                <select
                  id="org-size"
                  value={organization.size}
                  onChange={(e) => setOrganization({ ...organization, size: e.target.value })}
                  required
                >
                  <option value="SMALL">Small (1-10 employees)</option>
                  <option value="MEDIUM">Medium (10-50 employees)</option>
                  <option value="LARGE">Large (50+ employees)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="org-category">Business Category *</label>
                <select
                  id="org-category"
                  value={organization.category}
                  onChange={handleOrgCategoryChange}
                  required
                >
                  {Object.keys(BUSINESS_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="org-type">Organization Type / Subcategory *</label>
              <select
                id="org-type"
                value={organization.type}
                onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
                required
              >
                {(BUSINESS_CATEGORIES[organization.category] || []).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={organization.hasBranches}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setOrganization(prev => ({
                      ...prev,
                      hasBranches: checked,
                      numberOfBranches: checked ? Math.max(prev.numberOfBranches, 2) : 1
                    }));
                    handleBranchCountChange(checked ? Math.max(organization.numberOfBranches, 2) : 1);
                  }}
                />
                <span>Do you have multiple branches/business units?</span>
              </label>
            </div>

            {organization.hasBranches && (
              <div className="form-group" style={{ maxWidth: '240px' }}>
                <label htmlFor="num-branches">Number of Branches *</label>
                <input
                  type="number"
                  id="num-branches"
                  min="2"
                  max="20"
                  value={organization.numberOfBranches}
                  onChange={(e) => handleBranchCountChange(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(3);
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Next: Branch Details ({branches.length} {branches.length === 1 ? 'Branch' : 'Branches'})
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Branch Details */}
        {currentStep === 5 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (validateStep5()) setCurrentStep(6);
          }}>
            <div className="section-divider">
              <span>Step 4: Branch Details ({branches.length})</span>
            </div>

            {branches.map((branch, index) => (
              <div key={index} className="sub-form-card">
                <div className="sub-form-header">
                  <h4>Branch {index + 1}</h4>
                  <span className="sub-form-tag">Code auto-generated upon submit</span>
                </div>

                <div className="form-group">
                  <label>Branch Name *</label>
                  <input
                    type="text"
                    value={branch.name}
                    onChange={(e) => handleBranchChange(index, 'name', e.target.value)}
                    required
                    placeholder={`e.g. ${organization.name} - Branch ${index + 1}`}
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      value={branch.state}
                      onChange={(e) => handleBranchChange(index, 'state', e.target.value)}
                      required
                      placeholder="e.g. Tamil Nadu"
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={branch.city}
                      onChange={(e) => handleBranchChange(index, 'city', e.target.value)}
                      required
                      placeholder="e.g. Chennai"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      value={branch.pincode}
                      onChange={(e) => handleBranchChange(index, 'pincode', e.target.value)}
                      required
                      placeholder="e.g. 600001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={branch.category}
                      onChange={(e) => handleBranchChange(index, 'category', e.target.value)}
                      required
                    >
                      {Object.keys(BUSINESS_CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat] || cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Organization Type *</label>
                    <select
                      value={branch.type}
                      onChange={(e) => handleBranchChange(index, 'type', e.target.value)}
                      required
                    >
                      {(BUSINESS_CATEGORIES[branch.category] || []).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address (Optional)</label>
                    <input
                      type="text"
                      value={branch.address}
                      onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={branch.phone}
                      onChange={(e) => handleBranchChange(index, 'phone', e.target.value)}
                      placeholder="Branch phone"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(4);
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Next: Assign Admins
              </button>
            </div>
          </form>
        )}

        {/* STEP 6: Admin Assignment */}
        {currentStep === 6 && (
          <form onSubmit={handleSubmitOnboarding}>
            <div className="section-divider">
              <span>Step 5: Assign Admins to Branches</span>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '1rem' }}>
              Assign one Admin for each branch. Temporary passwords and Branch Codes will be automatically generated upon creation.
            </p>

            {admins.map((admin, index) => {
              const branchName = branches[index]?.name || `Branch ${index + 1}`;
              return (
                <div key={index} className="sub-form-card">
                  <div className="sub-form-header">
                    <h4>Admin for: {branchName}</h4>
                    <span className="sub-form-tag">Temporary Password will be generated</span>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Admin Name *</label>
                      <input
                        type="text"
                        value={admin.name}
                        onChange={(e) => handleAdminChange(index, 'name', e.target.value)}
                        required
                        placeholder="e.g. Priya Kumar"
                      />
                    </div>

                    <div className="form-group">
                      <label>Admin Email *</label>
                      <input
                        type="email"
                        value={admin.email}
                        onChange={(e) => handleAdminChange(index, 'email', e.target.value)}
                        required
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={admin.phone}
                        onChange={(e) => handleAdminChange(index, 'phone', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={admin.dateOfBirth}
                        onChange={(e) => handleAdminChange(index, 'dateOfBirth', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={admin.gender}
                        onChange={(e) => handleAdminChange(index, 'gender', e.target.value)}
                      >
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setError('');
                  setCurrentStep(5);
                }}
                disabled={loading}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Organization...' : 'Create Organization'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 7: Success Screen */}
        {currentStep === 7 && createdSummary && (
          <div>
            <div className="success-banner">
              <div className="success-icon">✓</div>
              <h2>Organization Created Successfully!</h2>
              <p>{createdSummary.organization?.name} has been set up with all branches and provisioned admins.</p>
            </div>

            <div className="credential-notice">
              <strong>Important:</strong> Please record these Branch Codes and Temporary Passwords. 
              Admins sign in using their assigned <strong>Branch Code</strong> and <strong>Temporary Password</strong>, 
              and will be prompted to set a permanent password upon first login.
            </div>

            <div className="created-branches-list">
              {(createdSummary.branches || []).map((b, idx) => (
                <div key={b.id || idx} className="created-branch-card">
                  <div className="created-branch-header">
                    <span className="created-branch-name">{b.name}</span>
                    <span className="branch-code-badge">{b.branchCode}</span>
                  </div>

                  <div className="credential-item-row">
                    <span className="credential-label">Location:</span>
                    <span className="credential-value">{b.city}, {b.state} ({b.pincode})</span>
                  </div>

                  <div className="credential-item-row">
                    <span className="credential-label">Assigned Admin:</span>
                    <span className="credential-value">{b.admin?.name} ({b.admin?.email})</span>
                  </div>

                  <div className="credential-item-row">
                    <span className="credential-label">Branch Code:</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="credential-value" style={{ fontFamily: 'monospace' }}>{b.branchCode}</span>
                      <button 
                        type="button" 
                        className="copy-btn"
                        onClick={() => handleCopy(b.branchCode, `code-${idx}`)}
                      >
                        {copiedIndex === `code-${idx}` ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  </div>

                  <div className="credential-item-row">
                    <span className="credential-label">Temporary Password:</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="temp-password-badge">{b.admin?.temporaryPassword}</span>
                      <button 
                        type="button" 
                        className="copy-btn"
                        onClick={() => handleCopy(b.admin?.temporaryPassword, `pwd-${idx}`)}
                      >
                        {copiedIndex === `pwd-${idx}` ? 'Copied!' : 'Copy Password'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/owner-dashboard')}
              >
                Go to Owner Dashboard →
              </button>
            </div>
          </div>
        )}

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

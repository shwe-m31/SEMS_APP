import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchAPI, adminAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function AdminManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (adminId) => {
    setVisiblePasswords(prev => {
      const isCurrentlyVisible = prev[adminId] !== false;
      return { ...prev, [adminId]: !isCurrentlyVisible };
    });
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branchId: '',
    designation: 'Branch Admin'
  });

  useEffect(() => {
    fetchAdmins();
    fetchBranches();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };


  const handleCreate = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      branchId: branches[0]?.id || '',
      designation: 'Branch Admin'
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.user?.name || '',
      email: admin.user?.email || '',
      phone: admin.user?.phone || '',
      branchId: admin.branch?.id || '',
      designation: admin.designation || 'Branch Admin'
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin account?')) {
      try {
        await adminAPI.delete(adminId);
        alert('Admin deleted successfully');
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Failed to delete admin');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const updateData = {
          designation: formData.designation,
          branchId: formData.branchId ? parseInt(formData.branchId) : null
        };
        await adminAPI.update(editingAdmin.id, updateData);
        alert('Admin updated successfully');
        setShowModal(false);
        fetchAdmins();
      } else {
        const createData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          branchId: parseInt(formData.branchId),
          designation: formData.designation.trim()
        };
        const response = await adminAPI.create(createData);
        setShowModal(false);
        fetchAdmins();
        // Display credentials modal
        setCreatedCredentials({
          name: createData.name,
          email: createData.email,
          branchCode: response.data?.branchCode || 'N/A',
          temporaryPassword: response.data?.temporaryPassword || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      alert('Failed to save admin: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResetPassword = async (admin) => {
    if (!window.confirm(`Generate and reset a new temporary claim password for Admin ${admin.user?.name} (${admin.branch?.name})?`)) {
      return;
    }
    try {
      const response = await adminAPI.resetPassword(admin.id);
      fetchAdmins();
      setCreatedCredentials({
        name: admin.user?.name,
        email: admin.user?.email,
        username: response.data?.username || admin.user?.username,
        branchCode: admin.branch?.branchCode || 'N/A',
        temporaryPassword: response.data?.temporaryPassword || 'N/A'
      });
    } catch (error) {
      alert('Failed to reset password: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <AppShell pageTitle="Admin Management">
        <div className="loading">Loading admins...</div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Admin Management">
      <div className="dashboard-header">
            <h2>Admin Management</h2>
            <div>
              <button onClick={() => navigate('/owner-dashboard')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Add New Admin</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Branch</th>
                  <th>Branch Code</th>
                  <th>Designation</th>
                  <th>Admin Password (Claim)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => {
                  const isVisible = visiblePasswords[admin.id] !== false;
                  const displayPassword = admin.temporaryPassword || 'password123';
                  return (
                    <tr key={admin.id}>
                      <td><strong>{admin.user?.name}</strong></td>
                      <td>{admin.user?.email}</td>
                      <td>
                        <span className="code-pill">
                          {admin.user?.username || '—'}
                        </span>
                      </td>
                      <td>{admin.branch?.name || '—'}</td>
                      <td>
                        <span className="code-pill">
                          {admin.branch?.branchCode || '—'}
                        </span>
                      </td>
                      <td>{admin.designation || 'Admin'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '12px',
                            letterSpacing: isVisible ? '0.02em' : '0.14em',
                            background: 'var(--bg-secondary)',
                            padding: '3px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            minWidth: '85px',
                            textAlign: 'center'
                          }}>
                            {isVisible ? displayPassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(admin.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                          >
                            {isVisible ? 'Hide' : 'Show'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(displayPassword, `pwd-${admin.id}`)}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                          >
                            {copiedField === `pwd-${admin.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${admin.user?.mustChangePassword ? 'pending' : 'active'}`}>
                          {admin.user?.mustChangePassword ? 'Pending 1st Login' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleEdit(admin)} className="btn btn-sm btn-secondary">Edit</button>
                          <button onClick={() => handleResetPassword(admin)} className="btn btn-sm btn-secondary" style={{ color: 'var(--accent-blue)' }}>Reset Pwd</button>
                          <button onClick={() => handleDelete(admin.id)} className="btn btn-sm btn-danger">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CREATE / EDIT ADMIN MODAL */}
          {showModal && (
            <div className="modal">
              <div className="modal-content" style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                  <h3>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  {!editingAdmin ? (
                    <>
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Priya Kumar"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem', background: 'var(--accent-blue-soft, #eff6ff)', borderRadius: '4px', fontSize: '12px', color: 'var(--accent-blue, #1e40af)' }}>
                        Note: A secure temporary password will be automatically generated by the server. The Admin will be prompted to set a permanent password upon first login.
                      </div>
                    </>
                  ) : (
                    <div style={{ marginBottom: '1rem', fontSize: '13px', color: '#475569' }}>
                      Editing account for: <strong>{formData.name}</strong> ({formData.email})
                    </div>
                  )}

                  <div className="form-group">
                    <label>Assigned Branch *</label>
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} ({branch.branchCode || 'No Code'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Designation *</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Branch Manager"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingAdmin ? 'Update Admin' : 'Provision Admin Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CREDENTIALS CONFIRMATION MODAL */}
          {createdCredentials && (
            <div className="modal">
              <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h3 style={{ color: 'var(--text-primary)' }}>Admin Account Credentials</h3>
                  <button onClick={() => setCreatedCredentials(null)} className="close-button">x</button>
                </div>

                <div style={{ padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Share these temporary login credentials with <strong>{createdCredentials.name}</strong>:
                  </p>

                  <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '1rem', marginBottom: '1.25rem' }}>
                    {createdCredentials.username && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Username:</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>{createdCredentials.username}</span>
                          <button 
                            type="button" 
                            onClick={() => handleCopy(createdCredentials.username, 'uname')}
                            style={{ marginLeft: '0.5rem', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                            className="btn btn-sm btn-secondary"
                          >
                            {copiedField === 'uname' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Branch Code:</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>{createdCredentials.branchCode}</span>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(createdCredentials.branchCode, 'code')}
                          style={{ marginLeft: '0.5rem', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                          className="btn btn-sm btn-secondary"
                        >
                          {copiedField === 'code' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Temporary Password:</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                          {createdCredentials.temporaryPassword}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(createdCredentials.temporaryPassword, 'pwd')}
                          style={{ marginLeft: '0.5rem', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          {copiedField === 'pwd' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--warning)' }}>
                    Note: The Admin must use these credentials to sign in under <strong>Admin Sign In</strong> and will be forced to create a permanent password upon first login.
                  </p>
                </div>

                <div className="form-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" onClick={() => setCreatedCredentials(null)} className="btn btn-primary" style={{ width: '100%' }}>
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          )}
    </AppShell>
  );
}

export default AdminManagement;

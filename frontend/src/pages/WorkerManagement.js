import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workerAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

const RESTAURANT_CATEGORIES = [
  { value: 'CHEF', label: 'Chef' },
  { value: 'KITCHEN_ASSISTANT', label: 'Kitchen Assistant' },
  { value: 'WAITER', label: 'Waiter' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'INVENTORY_WORKER', label: 'Inventory Worker' },
  { value: 'DELIVERY_WORKER', label: 'Delivery Worker' },
  { value: 'CLEANING_WORKER', label: 'Cleaning Worker' },
];

function WorkerManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [branchId, setBranchId] = useState(user?.branchId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    designation: 'CHEF',
    salary: '22000',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (user?.branchId) {
      setBranchId(user.branchId);
    }
    fetchWorkers();
  }, [branchId, user]);

  const fetchWorkers = async () => {
    try {
      const response = await workerAPI.getByBranch(branchId);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      designation: 'CHEF',
      salary: '22000',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.user?.name || '',
      email: worker.user?.email || '',
      phone: worker.user?.phone || '',
      dateOfBirth: worker.user?.dateOfBirth || '',
      gender: worker.user?.gender || 'MALE',
      designation: worker.designation || 'CHEF',
      salary: worker.salary || '22000',
      hireDate: worker.hireDate || '',
      status: worker.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to deactivate this worker?')) {
      try {
        await workerAPI.delete(workerId);
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  const handleResetPassword = async (worker) => {
    if (window.confirm(`Generate a new temporary password for ${worker.user?.name || worker.employeeId}?`)) {
      try {
        const res = await workerAPI.resetPassword(worker.id);
        if (res.data && res.data.temporaryPassword) {
          setCreatedCredentials({
            name: res.data.worker?.name || worker.user?.name,
            employeeId: res.data.worker?.employeeId || worker.employeeId,
            username: res.data.worker?.username || worker.user?.username,
            category: res.data.worker?.designationLabel || worker.designation,
            temporaryPassword: res.data.temporaryPassword
          });
        }
      } catch (err) {
        alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCopy = (text, fieldName) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        const workerData = {
          employeeId: editingWorker.employeeId,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate ? formData.hireDate : null,
          status: formData.status
        };
        await workerAPI.update(editingWorker.id, workerData);
        setShowModal(false);
      } else {
        const workerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate
        };
        const res = await workerAPI.create(workerData);
        setShowModal(false);
        if (res.data && res.data.temporaryPassword) {
          setCreatedCredentials({
            name: res.data.worker?.name || formData.name,
            employeeId: res.data.worker?.employeeId,
            username: res.data.worker?.username,
            category: res.data.worker?.designationLabel || formData.designation,
            temporaryPassword: res.data.temporaryPassword
          });
        }
      }
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert(error.response?.data?.message || 'Failed to save worker record');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <AppShell pageTitle="Worker Management">
        <div className="loading">Loading staff directory...</div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Worker Directory">
      <div className="dashboard-header">
        <div>
          <h2>Worker Directory</h2>
          <p className="page-lead" style={{ margin: '4px 0 0 0' }}>
            Branch Operational Staff • Category Assignment & Access Credentials
          </p>
        </div>
        <div>
          <button onClick={handleCreate} className="btn btn-primary">Add Worker</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Staff Member</th>
              <th>Category / Role</th>
              <th>Username</th>
              <th>Contact Phone</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                  No workers assigned to this branch yet. Click "Add Worker" to onboard staff.
                </td>
              </tr>
            ) : (
              workers.map(worker => (
                <tr key={worker.id}>
                  <td>
                    <span className="code-pill">{worker.employeeId || 'Pending'}</span>
                  </td>
                  <td>
                    <strong>{worker.user?.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {worker.user?.email}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {worker.designationLabel || worker.designation}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {worker.user?.username || '—'}
                    </span>
                  </td>
                  <td>{worker.user?.phone || '—'}</td>
                  <td>
                    <span className={`status-pill ${worker.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                      ● {worker.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleResetPassword(worker)}
                        className="btn btn-sm btn-secondary"
                        title="Generate new temporary password"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleEdit(worker)}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT WORKER MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>{editingWorker ? 'Edit Worker Profile' : 'Onboard New Worker'}</h3>
              <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Rahul Kumar"
                  />
                </div>

                <div className="form-group">
                  <label>Worker Category / Role *</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  >
                    {RESTAURANT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min="1000"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="optional (auto-generated if empty)"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                  />
                </div>

                {editingWorker && (
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                )}
              </div>

              {!editingWorker && (
                <div style={{ marginTop: '16px', padding: '10px 14px', background: 'var(--accent-blue-soft)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--accent-blue)' }}>
                  Note: Worker will be bound to your assigned branch automatically. Unique Employee ID, username, and temporary password will be generated upon creation.
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWorker ? 'Update Worker' : 'Create Worker & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS CONFIRMATION MODAL */}
      {createdCredentials && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--success)' }}>Worker Created Successfully</h3>
              <button onClick={() => setCreatedCredentials(null)} className="close-button">&times;</button>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Share these temporary login credentials with <strong>{createdCredentials.name}</strong>:
              </p>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Employee ID:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {createdCredentials.employeeId}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Worker Category:</span>
                  <span className="badge badge-info">{createdCredentials.category}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Username:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {createdCredentials.username}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopy(createdCredentials.username, 'uname')}
                    >
                      {copiedField === 'uname' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Temporary Password:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', padding: '2px 8px', borderRadius: '4px' }}>
                      {createdCredentials.temporaryPassword}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleCopy(createdCredentials.temporaryPassword, 'pwd')}
                    >
                      {copiedField === 'pwd' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--warning)' }}>
                Note: The worker must sign in with their Username and Temporary Password. They will be required to create a permanent password on first login before accessing their console.
              </p>
            </div>

            <div className="form-actions" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setCreatedCredentials(null)}
                className="btn btn-primary"
                style={{ width: '100%' }}
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

export default WorkerManagement;
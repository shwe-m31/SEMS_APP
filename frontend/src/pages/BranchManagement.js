import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchAPI, adminAPI } from '../services/api';
import { BUSINESS_CATEGORIES, CATEGORY_LABELS } from '../constants/businessCategories';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function BranchManagement() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    branchCode: '',
    state: 'Tamil Nadu',
    city: 'Chennai',
    pincode: '',
    category: 'SHOPS',
    organizationType: 'Bakery Shop',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [branchRes, adminRes] = await Promise.all([
        branchAPI.getAll(),
        adminAPI.getAll().catch(() => ({ data: [] }))
      ]);
      setBranches(branchRes.data);
      setAdmins(adminRes.data || []);
    } catch (error) {
      console.error('Error fetching branch data:', error);
      alert('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };


  const handleCreate = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      branchCode: '',
      state: 'Tamil Nadu',
      city: 'Chennai',
      pincode: '',
      category: 'SHOPS',
      organizationType: 'Bakery Shop',
      address: '',
      phone: ''
    });
    setShowModal(true);
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name || '',
      branchCode: branch.branchCode || '',
      state: branch.state || '',
      city: branch.city || branch.location || '',
      pincode: branch.pincode || '',
      category: branch.category || 'SHOPS',
      organizationType: branch.organizationType || 'Bakery Shop',
      address: branch.address || '',
      phone: branch.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch? All associated resources may be affected.')) {
      try {
        await branchAPI.delete(branchId);
        alert('Branch deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting branch:', error);
        alert('Failed to delete branch');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchAPI.update(editingBranch.id, formData);
        alert('Branch updated successfully');
      } else {
        await branchAPI.create(formData);
        alert('Branch created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('Failed to save branch: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'category') {
        const types = BUSINESS_CATEGORIES[value] || [];
        updated.organizationType = types[0] || '';
      }
      return updated;
    });
  };

  const getAdminForBranch = (branchId) => {
    return admins.find(a => a.branch?.id === branchId);
  };

  if (loading) {
    return (
      <AppShell pageTitle="Branch Management">
        <div className="loading">Loading branches...</div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Branch Management">
      <div className="dashboard-header">
            <h2>Branch Management</h2>
            <div>
              <button onClick={() => navigate('/owner-dashboard')} className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Add New Branch</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Code</th>
                  <th>Name</th>
                  <th>State</th>
                  <th>City</th>
                  <th>Pincode</th>
                  <th>Category</th>
                  <th>Organization Type</th>
                  <th>Assigned Admin</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(branch => {
                  const assignedAdmin = getAdminForBranch(branch.id);
                  return (
                    <tr key={branch.id}>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#1d4ed8',
                          background: '#eff6ff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bfdbfe'
                        }}>
                          {branch.branchCode || '—'}
                        </span>
                      </td>
                      <td><strong>{branch.name}</strong></td>
                      <td>{branch.state || '—'}</td>
                      <td>{branch.city || branch.location || '—'}</td>
                      <td>{branch.pincode || '—'}</td>
                      <td>{branch.category || '—'}</td>
                      <td>{branch.organizationType || '—'}</td>
                      <td>
                        {assignedAdmin ? (
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {assignedAdmin.user?.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{branch.phone || '—'}</td>
                      <td>
                        <button onClick={() => handleEdit(branch)} className="btn btn-sm btn-secondary" style={{ marginRight: '0.25rem' }}>Edit</button>
                        <button onClick={() => handleDelete(branch.id)} className="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="modal">
              <div className="modal-content" style={{ maxWidth: '580px' }}>
                <div className="modal-header">
                  <h3>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Branch Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Chennai Main Branch"
                    />
                  </div>

                  {editingBranch && (
                    <div className="form-group">
                      <label>Branch Code (Read-Only)</label>
                      <input
                        type="text"
                        name="branchCode"
                        value={formData.branchCode}
                        disabled
                        style={{ background: '#f8fafc', fontFamily: 'monospace', fontWeight: 600 }}
                      />
                    </div>
                  )}

                  {!editingBranch && (
                    <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'var(--accent-blue-soft, #eff6ff)', borderRadius: '4px', fontSize: '12px', color: 'var(--accent-blue, #1e40af)' }}>
                      Note: A unique Branch Code (e.g. SEMS-CHN-001) will be automatically generated upon creation.
                    </div>
                  )}

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Tamil Nadu"
                      />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Chennai"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. 600001"
                      />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        {Object.keys(BUSINESS_CATEGORIES).map(cat => (
                          <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Organization Type *</label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleInputChange}
                        required
                      >
                        {(BUSINESS_CATEGORIES[formData.category] || []).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Street address / locality"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Branch phone"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingBranch ? 'Update Branch' : 'Create Branch'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </AppShell>
  );
}

export default BranchManagement;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { branchAPI, adminAPI } from '../services/api';
import './Dashboard.css';

function AdminManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    branchId: '',
    designation: ''
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreate = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      branchId: '',
      designation: ''
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.user?.name || '',
      email: admin.user?.email || '',
      password: '',
      phone: admin.user?.phone || '',
      branchId: admin.branch?.id || '',
      designation: admin.designation || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
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
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          branchId: parseInt(formData.branchId),
          designation: formData.designation
        };
        await adminAPI.create(createData);
        alert('Admin created successfully');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error saving admin:', error);
      alert('Failed to save admin');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading admins...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">Owner Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/owner-dashboard" className="nav-item">Dashboard</Link>
            <Link to="/branches" className="nav-item">Branches</Link>
            <Link to="/admins" className="nav-item active">Admins</Link>
            <Link to="/owner-workers" className="nav-item">Workers</Link>
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
            <Link to="/billing" className="nav-item">Billing</Link>
            <Link to="/expenses" className="nav-item">Expenses</Link>
            <Link to="/sales" className="nav-item">Sales</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Admin Management</h2>
            <div>
              <button onClick={() => navigate('/owner-dashboard')} className="btn btn-secondary">Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Add New Admin</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{admin.user?.name}</td>
                    <td>{admin.user?.email}</td>
                    <td>{admin.user?.phone}</td>
                    <td>{admin.branch?.name}</td>
                    <td>{admin.designation}</td>
                    <td>
                      <button onClick={() => handleEdit(admin)} className="btn btn-sm btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(admin.id)} className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  {!editingAdmin && (
                    <>
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
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
                        />
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingAdmin}
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
                    </>
                  )}
                  <div className="form-group">
                    <label>Branch *</label>
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
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
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingAdmin ? 'Update Admin' : 'Create Admin'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminManagement;

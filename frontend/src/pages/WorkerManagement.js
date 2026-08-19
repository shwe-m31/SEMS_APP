import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workerAPI } from '../services/api';
import './Dashboard.css';

function WorkerManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [branchId, setBranchId] = useState(user?.branchId || 1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    designation: '',
    salary: '',
    hireDate: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    // Get branchId from user context if available
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
      alert('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreate = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      designation: '',
      salary: '',
      hireDate: '',
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
      employeeId: worker.employeeId || '',
      designation: worker.designation || '',
      salary: worker.salary || '',
      hireDate: worker.hireDate || '',
      status: worker.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await workerAPI.delete(workerId);
        alert('Worker deleted successfully');
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        const workerData = {
          employeeId: formData.employeeId,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate ? formData.hireDate : null,
          status: formData.status
        };
        await workerAPI.update(editingWorker.id, workerData);
        alert('Worker updated successfully');
      } else {
        const workerData = {
          employeeId: formData.employeeId,
          designation: formData.designation,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate ? formData.hireDate : null,
          email: formData.email,
          password: 'password123', // Default password for new workers
          name: formData.name,
          phone: formData.phone
        };
        await workerAPI.create(workerData);
        alert('Worker created successfully');
      }
      setShowModal(false);
      fetchWorkers();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert('Failed to save worker');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading workers...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">Admin Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/admin-dashboard" className="nav-item">Dashboard</Link>
            <Link to="/workers" className="nav-item active">Workers</Link>
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            <Link to="/shifts" className="nav-item">Shifts</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
            <Link to="/billing" className="nav-item">Billing</Link>
            <Link to="/expenses" className="nav-item">Expenses</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/sales" className="nav-item">Sales</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Worker Management</h2>
            <div>
              <button onClick={() => navigate('/admin-dashboard')} className="btn btn-secondary">Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Add New Worker</button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Designation</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.id}>
                    <td>{worker.id}</td>
                    <td>{worker.user?.name}</td>
                    <td>{worker.user?.email}</td>
                    <td>{worker.employeeId}</td>
                    <td>{worker.designation}</td>
                    <td>₹{worker.salary}</td>
                    <td>
                      <span className={`status-badge ${worker.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(worker)} className="btn btn-sm btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(worker.id)} className="btn btn-sm btn-danger">Delete</button>
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
                  <h3>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  {!editingWorker && (
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
                    <label>Employee ID *</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    />
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
                  <div className="form-group">
                    <label>Salary *</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleInputChange}
                    />
                  </div>
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
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingWorker ? 'Update Worker' : 'Create Worker'}
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

export default WorkerManagement;
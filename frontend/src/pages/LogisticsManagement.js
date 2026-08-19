import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logisticsAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function LogisticsManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logistics, setLogistics] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLogistics, setEditingLogistics] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    source: '',
    destination: '',
    quantity: '',
    unit: '',
    status: 'PENDING',
    expectedDate: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    fetchLogistics();
  }, [selectedBranch, selectedStatus, user]);

  const fetchLogistics = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      let response;
      
      if (selectedStatus) {
        response = await logisticsAPI.getByBranchAndStatus(branchId, selectedStatus);
      } else {
        response = await logisticsAPI.getByBranch(branchId);
      }
      
      setLogistics(response.data);
    } catch (error) {
      console.error('Error fetching logistics:', error);
      alert('Failed to fetch logistics');
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
    setEditingLogistics(null);
    setFormData({
      itemName: '',
      source: '',
      destination: '',
      quantity: '',
      unit: '',
      status: 'PENDING',
      expectedDate: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEdit = (logisticsItem) => {
    setEditingLogistics(logisticsItem);
    setFormData({
      itemName: logisticsItem.itemName,
      source: logisticsItem.source,
      destination: logisticsItem.destination,
      quantity: logisticsItem.quantity,
      unit: logisticsItem.unit,
      status: logisticsItem.status,
      expectedDate: logisticsItem.expectedDate || '',
      notes: logisticsItem.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (logisticsId) => {
    if (window.confirm('Are you sure you want to delete this logistics record?')) {
      try {
        await logisticsAPI.delete(logisticsId);
        alert('Logistics record deleted successfully');
        fetchLogistics();
      } catch (error) {
        console.error('Error deleting logistics:', error);
        alert('Failed to delete logistics');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const logisticsData = {
        itemName: formData.itemName,
        source: formData.source,
        destination: formData.destination,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        status: formData.status,
        expectedDate: formData.expectedDate || null,
        notes: formData.notes,
        branchId: parseInt(selectedBranch || user?.branchId || 1)
      };

      if (editingLogistics) {
        await logisticsAPI.update(editingLogistics.id, logisticsData);
        alert('Logistics updated successfully');
      } else {
        await logisticsAPI.create(logisticsData);
        alert('Logistics created successfully');
      }
      setShowModal(false);
      fetchLogistics();
    } catch (error) {
      console.error('Error saving logistics:', error);
      alert('Failed to save logistics');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'IN_TRANSIT': return 'in-transit';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED': return 'cancelled';
      case 'DELAYED': return 'delayed';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading logistics...</div>;
  }

  const dashboardPath = user?.role === 'OWNER' ? '/owner-dashboard' : 
                        user?.role === 'ADMIN' ? '/admin-dashboard' : '/worker-dashboard';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">{user?.role} Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to={dashboardPath} className="nav-item">Dashboard</Link>
            {user?.role === 'OWNER' && <Link to="/branches" className="nav-item">Branches</Link>}
            {user?.role === 'OWNER' && <Link to="/admins" className="nav-item">Admins</Link>}
            {user?.role === 'OWNER' && <Link to="/owner-workers" className="nav-item">Workers</Link>}
            {user?.role === 'ADMIN' && <Link to="/workers" className="nav-item">Workers</Link>}
            <Link to="/tasks" className="nav-item">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
            {user?.role !== 'WORKER' && <Link to="/shifts" className="nav-item">Shifts</Link>}
            <Link to="/inventory" className="nav-item">Inventory</Link>
            {user?.role !== 'WORKER' && <Link to="/billing" className="nav-item">Billing</Link>}
            {user?.role !== 'WORKER' && <Link to="/expenses" className="nav-item">Expenses</Link>}
            {user?.role !== 'WORKER' && <Link to="/sales" className="nav-item">Sales</Link>}
            <Link to="/logistics" className="nav-item active">Logistics</Link>
            {user?.role !== 'WORKER' && <Link to="/ai-insights" className="nav-item">AI Insights</Link>}
            {user?.role !== 'WORKER' && <Link to="/reports" className="nav-item">Reports</Link>}
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Logistics Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                <button onClick={handleCreate} className="btn btn-primary">+ Add Logistics</button>
              )}
            </div>
          </div>

          <div className="filter-section">
            {user?.role === 'OWNER' && (
              <div className="filter-group">
                <label>Branch:</label>
                <select value={selectedBranch} onChange={handleBranchChange}>
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="filter-group">
              <label>Status:</label>
              <select value={selectedStatus} onChange={handleStatusChange}>
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Expected Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logistics.map(log => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.itemName}</td>
                    <td>{log.source}</td>
                    <td>{log.destination}</td>
                    <td>{log.quantity} {log.unit}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.expectedDate ? new Date(log.expectedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                        <>
                          <button onClick={() => handleEdit(log)} className="btn btn-sm btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(log.id)} className="btn btn-sm btn-danger">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logistics.length === 0 && (
            <div className="empty-state">
              <p>No logistics records found.</p>
            </div>
          )}

          {showModal && (user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingLogistics ? 'Edit Logistics' : 'Add Logistics'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Source *</label>
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Destination *</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit *</label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., kg, units"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expected Date</label>
                    <input
                      type="date"
                      name="expectedDate"
                      value={formData.expectedDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingLogistics ? 'Update Logistics' : 'Add Logistics'}
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

export default LogisticsManagement;

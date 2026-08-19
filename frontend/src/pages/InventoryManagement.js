import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function InventoryManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'PRODUCT',
    quantity: '',
    unit: '',
    minimumStockLevel: '',
    supplier: ''
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    fetchInventory();
  }, [selectedBranch, user]);

  const fetchInventory = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      const response = await inventoryAPI.getByBranch(branchId);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Failed to fetch inventory');
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
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'PRODUCT',
      quantity: '',
      unit: '',
      minimumStockLevel: '',
      supplier: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minimumStockLevel: item.minimumStockLevel,
      supplier: item.supplier
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryAPI.delete(itemId);
        alert('Inventory item deleted successfully');
        fetchInventory();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        alert('Failed to delete inventory item');
      }
    }
  };

  const handleStockUpdate = async (itemId, quantityChange) => {
    try {
      await inventoryAPI.updateStock(itemId, { quantityChange });
      alert('Stock updated successfully');
      fetchInventory();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const inventoryData = {
        name: formData.name,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        minimumStockLevel: parseFloat(formData.minimumStockLevel),
        supplier: formData.supplier,
        branchId: parseInt(selectedBranch || user?.branchId || 1)
      };

      if (editingItem) {
        await inventoryAPI.update(editingItem.id, inventoryData);
        alert('Inventory item updated successfully');
      } else {
        await inventoryAPI.create(inventoryData);
        alert('Inventory item created successfully');
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item');
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

  const getStockStatus = (item) => {
    const quantity = parseFloat(item.quantity);
    const minimum = parseFloat(item.minimumStockLevel);
    
    if (quantity === 0) return { status: 'CRITICAL', color: 'critical' };
    if (quantity <= minimum) return { status: 'LOW STOCK', color: 'low-stock' };
    return { status: 'NORMAL', color: 'normal' };
  };

  if (loading) {
    return <div className="loading">Loading inventory...</div>;
  }

  const dashboardPath = user?.role === 'OWNER' ? '/owner-dashboard' : '/admin-dashboard';

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
            <Link to="/inventory" className="nav-item active">Inventory</Link>
            {user?.role !== 'WORKER' && <Link to="/billing" className="nav-item">Billing</Link>}
            {user?.role !== 'WORKER' && <Link to="/expenses" className="nav-item">Expenses</Link>}
            {user?.role !== 'WORKER' && <Link to="/sales" className="nav-item">Sales</Link>}
            <Link to="/logistics" className="nav-item">Logistics</Link>
            {user?.role !== 'WORKER' && <Link to="/ai-insights" className="nav-item">AI Insights</Link>}
            {user?.role !== 'WORKER' && <Link to="/reports" className="nav-item">Reports</Link>}
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Inventory Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                <button onClick={handleCreate} className="btn btn-primary">+ Add Inventory Item</button>
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
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Min Stock</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{item.minimumStockLevel}</td>
                      <td>{item.supplier || '-'}</td>
                      <td>
                        <span className={`status-badge ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td>
                        {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                          <>
                            <button 
                              onClick={() => handleStockUpdate(item.id, 10)}
                              className="btn btn-sm btn-success"
                              title="Add Stock"
                            >
                              +10
                            </button>
                            <button 
                              onClick={() => handleStockUpdate(item.id, -10)}
                              className="btn btn-sm btn-warning"
                              title="Remove Stock"
                            >
                              -10
                            </button>
                            <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {inventory.length === 0 && (
            <div className="empty-state">
              <p>No inventory items found.</p>
            </div>
          )}

          {showModal && (user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
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
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="PRODUCT">Product</option>
                      <option value="RAW_MATERIAL">Raw Material</option>
                      <option value="FINISHED_GOOD">Finished Good</option>
                      <option value="SUPPLY">Supply</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      step="0.01"
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
                      placeholder="e.g., kg, liters, units"
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Stock Level *</label>
                    <input
                      type="number"
                      name="minimumStockLevel"
                      value={formData.minimumStockLevel}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? 'Update Item' : 'Create Item'}
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

export default InventoryManagement;

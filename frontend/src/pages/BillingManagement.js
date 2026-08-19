import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billingAPI, inventoryAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function BillingManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    discount: '0',
    tax: '0',
    paymentMethod: 'CASH',
    items: []
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    fetchBills();
    fetchInventory();
  }, [selectedBranch, user]);

  const fetchBills = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      const response = await billingAPI.getByBranch(branchId);
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      const response = await inventoryAPI.getByBranch(branchId);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
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
    setFormData({
      customerName: '',
      discount: '0',
      tax: '0',
      paymentMethod: 'CASH',
      items: []
    });
    setShowModal(true);
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billingAPI.delete(billId);
        alert('Bill deleted successfully');
        fetchBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Failed to delete bill');
      }
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', quantity: '1', price: '0', inventoryId: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSelectInventoryItem = (index, inventoryItem) => {
    const newItems = [...formData.items];
    newItems[index].productName = inventoryItem.name;
    newItems[index].inventoryId = inventoryItem.id;
    newItems[index].price = inventoryItem.quantity; // Using quantity as price for demo
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.price)), 0
    );
    const discount = parseFloat(formData.discount) || 0;
    const tax = parseFloat(formData.tax) || 0;
    return subtotal - discount + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const billData = {
        customerName: formData.customerName,
        discount: parseFloat(formData.discount),
        tax: parseFloat(formData.tax),
        paymentMethod: formData.paymentMethod,
        branchId: parseInt(selectedBranch || user?.branchId || 1),
        items: formData.items.filter(item => item.productName && item.quantity > 0)
      };

      if (billData.items.length === 0) {
        alert('Please add at least one item to the bill');
        return;
      }

      await billingAPI.create(billData);
      alert('Bill created successfully');
      setShowModal(false);
      fetchBills();
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill');
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

  if (loading) {
    return <div className="loading">Loading bills...</div>;
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
            <Link to="/shifts" className="nav-item">Shifts</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
            <Link to="/billing" className="nav-item active">Billing</Link>
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
            <h2>Billing Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Create Bill</button>
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
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment Method</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>{bill.customerName}</td>
                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td>₹{bill.totalAmount}</td>
                    <td>{bill.paymentMethod}</td>
                    <td>{bill.items?.length || 0}</td>
                    <td>
                      <button onClick={() => handleDelete(bill.id)} className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bills.length === 0 && (
            <div className="empty-state">
              <p>No bills found.</p>
            </div>
          )}

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Create New Bill</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Discount (₹)</label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax (₹)</label>
                      <input
                        type="number"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="bill-items-section">
                    <h4>Bill Items</h4>
                    {formData.items.map((item, index) => (
                      <div key={index} className="bill-item-row">
                        <div className="form-group">
                          <label>Product Name</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                            list="inventory-list"
                            required
                          />
                          <datalist id="inventory-list">
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.name} onClick={() => handleSelectInventoryItem(index, inv)}>
                                {inv.name} - {inv.quantity} {inv.unit}
                              </option>
                            ))}
                          </datalist>
                        </div>
                        <div className="form-group">
                          <label>Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Price (₹)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
                      + Add Item
                    </button>
                  </div>

                  <div className="bill-total">
                    <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Bill</button>
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

export default BillingManagement;

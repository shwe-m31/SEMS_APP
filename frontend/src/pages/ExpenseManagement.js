import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function ExpenseManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: 'OPERATIONAL',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    fetchExpenses();
  }, [selectedBranch, user]);

  const fetchExpenses = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      const response = await expenseAPI.getByBranch(branchId);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Failed to fetch expenses');
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
    setEditingExpense(null);
    setFormData({
      category: 'OPERATIONAL',
      amount: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate
    });
    setShowModal(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(expenseId);
        alert('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        expenseDate: formData.expenseDate,
        branchId: parseInt(selectedBranch || user?.branchId || 1)
      };

      if (editingExpense) {
        await expenseAPI.update(editingExpense.id, expenseData);
        alert('Expense updated successfully');
      } else {
        await expenseAPI.create(expenseData);
        alert('Expense created successfully');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'OPERATIONAL': return 'operational';
      case 'SALARY': return 'salary';
      case 'MAINTENANCE': return 'maintenance';
      case 'UTILITIES': return 'utilities';
      case 'RENT': return 'rent';
      case 'OTHER': return 'other';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
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
            <Link to="/billing" className="nav-item">Billing</Link>
            <Link to="/expenses" className="nav-item active">Expenses</Link>
            <Link to="/sales" className="nav-item">Sales</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Expense Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              <button onClick={handleCreate} className="btn btn-primary">+ Add Expense</button>
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
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{expense.id}</td>
                    <td>
                      <span className={`category-badge ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td>₹{expense.amount.toFixed(2)}</td>
                    <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    <td>{expense.description || '-'}</td>
                    <td>
                      <button onClick={() => handleEdit(expense)} className="btn btn-sm btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(expense.id)} className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expenses.length === 0 && (
            <div className="empty-state">
              <p>No expenses found.</p>
            </div>
          )}

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="OPERATIONAL">Operational</option>
                      <option value="SALARY">Salary</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="UTILITIES">Utilities</option>
                      <option value="RENT">Rent</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={formData.expenseDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingExpense ? 'Update Expense' : 'Add Expense'}
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

export default ExpenseManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { salesAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function SalesManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    fetchSales();
  }, [selectedBranch, startDate, endDate, user]);

  const fetchSales = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      let response;
      
      if (startDate && endDate) {
        response = await salesAPI.getByBranchAndDateRange(branchId, startDate, endDate);
      } else {
        response = await salesAPI.getByBranch(branchId);
      }
      
      setSales(response.data);

      // Fetch total sales
      if (startDate && endDate) {
        const totalResponse = await salesAPI.getTotalSalesByBranch(branchId, startDate, endDate);
        setTotalSales(totalResponse.data.totalSales || 0);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Failed to fetch sales');
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

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleDateChange = (e) => {
    if (e.target.name === 'startDate') {
      setStartDate(e.target.value);
    } else {
      setEndDate(e.target.value);
    }
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
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
            <Link to="/expenses" className="nav-item">Expenses</Link>
            <Link to="/sales" className="nav-item active">Sales</Link>
            <Link to="/logistics" className="nav-item">Logistics</Link>
            <Link to="/ai-insights" className="nav-item">AI Insights</Link>
            <Link to="/reports" className="nav-item">Reports</Link>
            <Link to="/settings" className="nav-item">Settings</Link>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h2>Sales Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
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
              <label>Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>

          <div className="sales-summary">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p className="summary-value">₹{totalSales.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Transactions</h3>
              <p className="summary-value">{sales.length}</p>
            </div>
            <div className="summary-card">
              <h3>Average per Transaction</h3>
              <p className="summary-value">
                ₹{sales.length > 0 ? (totalSales / sales.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Bill ID</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.id}</td>
                    <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td>₹{sale.amount.toFixed(2)}</td>
                    <td>{sale.bill?.id || '-'}</td>
                    <td>{sale.branch?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sales.length === 0 && (
            <div className="empty-state">
              <p>No sales records found for the selected period.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SalesManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { branchAPI } from '../services/api';
import './Dashboard.css';

function OwnerWorkers() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
    fetchWorkers();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchWorkers = async () => {
    try {
      let url = 'http://localhost:8080/api/workers';
      if (selectedBranch) {
        url = `http://localhost:8080/api/workers/branch/${selectedBranch}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setWorkers(data);
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

  const handleBranchFilter = (e) => {
    setSelectedBranch(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading workers...</div>;
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
            <Link to="/admins" className="nav-item">Admins</Link>
            <Link to="/owner-workers" className="nav-item active">Workers</Link>
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
            <h2>Worker Management</h2>
            <div>
              <button onClick={() => navigate('/owner-dashboard')} className="btn btn-secondary">Back to Dashboard</button>
            </div>
          </div>

          <div className="filter-section">
            <label>Filter by Branch:</label>
            <select value={selectedBranch} onChange={handleBranchFilter}>
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
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
                  <th>Branch</th>
                  <th>Salary</th>
                  <th>Status</th>
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
                    <td>{worker.branch?.name}</td>
                    <td>₹{worker.salary}</td>
                    <td>
                      <span className={`status-badge ${worker.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {worker.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {workers.length === 0 && (
            <div className="empty-state">
              <p>No workers found.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default OwnerWorkers;

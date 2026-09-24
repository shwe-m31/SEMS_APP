import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchAPI, workerAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function OwnerWorkers() {
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
      let response;
      if (selectedBranch) {
        response = await workerAPI.getByBranch(selectedBranch);
        setWorkers(response.data);
      } else {
        // Get all branches and their workers
        const branchesResponse = await branchAPI.getAll();
        const allWorkers = [];
        for (const branch of branchesResponse.data) {
          const workersResponse = await workerAPI.getByBranch(branch.id);
          allWorkers.push(...workersResponse.data);
        }
        setWorkers(allWorkers);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      alert('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };


  const handleBranchFilter = (e) => {
    setSelectedBranch(e.target.value);
  };

  if (loading) {
    return (
      <AppShell pageTitle="Workforce Directory">
        <div className="loading">Loading workers...</div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Workforce Directory">
      <div className="dashboard-header">
            <h2>Worker Management</h2>
            <div>
              <button onClick={() => navigate('/owner-dashboard')} className="btn btn-secondary">Back to Dashboard</button>
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <label>Filter by Branch:</label>
              <select value={selectedBranch} onChange={handleBranchFilter}>
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
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
    </AppShell>
  );
}

export default OwnerWorkers;

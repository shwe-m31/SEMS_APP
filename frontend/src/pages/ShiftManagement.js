import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { shiftAPI, workerAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function ShiftManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [workerShifts, setWorkerShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: '',
    branchId: user?.branchId || ''
  });
  const [assignmentData, setAssignmentData] = useState({
    workerId: '',
    shiftId: '',
    date: ''
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
      fetchWorkers();
    }
    fetchShifts();
    fetchWorkerShifts();
  }, [user]);

  const fetchShifts = async () => {
    try {
      const branchId = user?.branchId || 1;
      const response = await shiftAPI.getByBranch(branchId);
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const branchId = user?.branchId || 1;
      const response = await workerAPI.getByBranch(branchId);
      setWorkers(response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
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

  const fetchWorkerShifts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/worker-shifts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setWorkerShifts(data);
    } catch (error) {
      console.error('Error fetching worker shifts:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateShift = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      description: '',
      branchId: user?.branchId || ''
    });
    setShowShiftModal(true);
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description,
      branchId: shift.branch?.id || user?.branchId || ''
    });
    setShowShiftModal(true);
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await shiftAPI.delete(shiftId);
        alert('Shift deleted successfully');
        fetchShifts();
      } catch (error) {
        console.error('Error deleting shift:', error);
        alert('Failed to delete shift');
      }
    }
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      const shiftData = {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        branchId: parseInt(formData.branchId)
      };

      if (editingShift) {
        await shiftAPI.update(editingShift.id, shiftData);
        alert('Shift updated successfully');
      } else {
        await shiftAPI.create(shiftData);
        alert('Shift created successfully');
      }
      setShowShiftModal(false);
      fetchShifts();
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Failed to save shift');
    }
  };

  const handleAssignShift = () => {
    setAssignmentData({
      workerId: '',
      shiftId: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const assignData = {
        workerId: parseInt(assignmentData.workerId),
        shiftId: parseInt(assignmentData.shiftId),
        date: assignmentData.date
      };

      await fetch('http://localhost:8080/api/worker-shifts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignData)
      });

      alert('Shift assigned successfully');
      setShowAssignmentModal(false);
      fetchWorkerShifts();
    } catch (error) {
      console.error('Error assigning shift:', error);
      alert('Failed to assign shift');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this shift assignment?')) {
      try {
        await fetch(`http://localhost:8080/api/worker-shifts/${assignmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('Shift assignment removed successfully');
        fetchWorkerShifts();
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment');
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAssignmentChange = (e) => {
    setAssignmentData({
      ...assignmentData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Loading shifts...</div>;
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
            <Link to="/shifts" className="nav-item active">Shifts</Link>
            <Link to="/inventory" className="nav-item">Inventory</Link>
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
            <h2>Shift Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                <>
                  <button onClick={handleCreateShift} className="btn btn-primary">+ Create Shift</button>
                  <button onClick={handleAssignShift} className="btn btn-primary">+ Assign Shift</button>
                </>
              )}
            </div>
          </div>

          <div className="section">
            <h3>Defined Shifts</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(shift => (
                    <tr key={shift.id}>
                      <td>{shift.id}</td>
                      <td>{shift.name}</td>
                      <td>{shift.startTime}</td>
                      <td>{shift.endTime}</td>
                      <td>{shift.description || '-'}</td>
                      <td>
                        {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                          <>
                            <button onClick={() => handleEditShift(shift)} className="btn btn-sm btn-secondary">Edit</button>
                            <button onClick={() => handleDeleteShift(shift.id)} className="btn btn-sm btn-danger">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Worker Shift Assignments</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Worker</th>
                    <th>Shift</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workerShifts.map(ws => (
                    <tr key={ws.id}>
                      <td>{ws.id}</td>
                      <td>{ws.worker?.user?.name}</td>
                      <td>{ws.shift?.name} ({ws.shift?.startTime} - {ws.shift?.endTime})</td>
                      <td>{ws.date}</td>
                      <td>
                        {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                          <button onClick={() => handleDeleteAssignment(ws.id)} className="btn btn-sm btn-danger">Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showShiftModal && (user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingShift ? 'Edit Shift' : 'Create Shift'}</h3>
                  <button onClick={() => setShowShiftModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleShiftSubmit}>
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
                    <label>Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
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
                  {user?.role === 'OWNER' && (
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
                  )}
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowShiftModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingShift ? 'Update Shift' : 'Create Shift'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAssignmentModal && (user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Assign Shift to Worker</h3>
                  <button onClick={() => setShowAssignmentModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleAssignmentSubmit}>
                  <div className="form-group">
                    <label>Worker *</label>
                    <select
                      name="workerId"
                      value={assignmentData.workerId}
                      onChange={handleAssignmentChange}
                      required
                    >
                      <option value="">Select Worker</option>
                      {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.user?.name} - {worker.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shift *</label>
                    <select
                      name="shiftId"
                      value={assignmentData.shiftId}
                      onChange={handleAssignmentChange}
                      required
                    >
                      <option value="">Select Shift</option>
                      {shifts.map(shift => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={assignmentData.date}
                      onChange={handleAssignmentChange}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAssignmentModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Assign Shift</button>
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

export default ShiftManagement;

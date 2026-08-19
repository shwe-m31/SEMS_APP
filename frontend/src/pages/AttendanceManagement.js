import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, workerAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function AttendanceManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
      fetchWorkers();
    }
    fetchAttendance();
  }, [selectedBranch, selectedDate, user]);

  const fetchAttendance = async () => {
    try {
      let response;
      if (user?.role === 'WORKER') {
        response = await attendanceAPI.getByWorker(user.workerId);
      } else if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
        if (selectedBranch) {
          response = await attendanceAPI.getByBranchAndDate(selectedBranch, selectedDate);
        } else {
          response = await attendanceAPI.getByBranchAndDate(user?.branchId || 1, selectedDate);
        }
      }
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const branchId = selectedBranch || user?.branchId || 1;
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAttendance = async (workerId) => {
    setMarkingAttendance(true);
    try {
      const branchId = selectedBranch || user?.branchId || 1;
      await attendanceAPI.mark({
        workerId,
        branchId,
        checkInTime: new Date().toTimeString().split(' ')[0],
        status: 'PRESENT'
      });
      alert('Attendance marked successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleStatusUpdate = async (attendanceId, newStatus) => {
    try {
      await attendanceAPI.update(attendanceId, { status: newStatus });
      alert('Attendance status updated successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    fetchWorkers();
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'present';
      case 'ABSENT': return 'absent';
      case 'LATE': return 'late';
      case 'HALF_DAY': return 'half-day';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading attendance...</div>;
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
            <Link to="/attendance" className="nav-item active">Attendance</Link>
            {user?.role !== 'WORKER' && <Link to="/shifts" className="nav-item">Shifts</Link>}
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
            <h2>Attendance Management</h2>
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
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          </div>

          {user?.role === 'WORKER' ? (
            <div className="worker-attendance-section">
              <div className="attendance-card">
                <h3>My Attendance</h3>
                {attendance.length > 0 ? (
                  <div className="attendance-details">
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>{attendance[0].date}</span>
                    </div>
                    <div className="detail-row">
                      <span>Check In:</span>
                      <span>{attendance[0].checkInTime || 'Not checked in'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Check Out:</span>
                      <span>{attendance[0].checkOutTime || 'Not checked out'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={`status-badge ${getStatusColor(attendance[0].status)}`}>
                        {attendance[0].status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p>No attendance record for this date.</p>
                )}
                <button
                  onClick={() => handleMarkAttendance(user.workerId)}
                  disabled={markingAttendance}
                  className="btn btn-primary"
                >
                  {markingAttendance ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Worker</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.worker?.user?.name}</td>
                      <td>{record.date}</td>
                      <td>{record.checkInTime || '-'}</td>
                      <td>{record.checkOutTime || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusUpdate(record.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="HALF_DAY">Half Day</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {attendance.length === 0 && user?.role !== 'WORKER' && (
            <div className="empty-state">
              <p>No attendance records found for the selected date.</p>
            </div>
          )}

          {user?.role !== 'WORKER' && (
            <div className="bulk-actions">
              <h3>Bulk Mark Attendance</h3>
              <div className="worker-grid">
                {workers.map(worker => (
                  <div key={worker.id} className="worker-card">
                    <span>{worker.user?.name}</span>
                    <button
                      onClick={() => handleMarkAttendance(worker.id)}
                      disabled={markingAttendance}
                      className="btn btn-sm btn-primary"
                    >
                      Mark Present
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AttendanceManagement;

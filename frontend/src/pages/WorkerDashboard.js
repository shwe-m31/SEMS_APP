import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, attendanceAPI } from '../services/api';
import './Dashboard.css';

function WorkerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getWorkerDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAttendance = async () => {
    setMarkingAttendance(true);
    try {
      await attendanceAPI.mark({
        workerId: dashboardData?.worker?.id,
        branchId: dashboardData?.worker?.branch?.id,
        checkInTime: new Date().toTimeString().split(' ')[0],
        status: 'PRESENT'
      });
      alert('Attendance marked successfully!');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard worker-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SEMS</h1>
          <span className="user-role">Worker Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <main className="main-content worker-main">
          <div className="dashboard-header">
            <h2>My Dashboard</h2>
            {dashboardData?.worker && (
              <p className="worker-info">
                {dashboardData.worker.employeeId} | {dashboardData.worker.designation}
              </p>
            )}
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📋</div>
              <div className="kpi-content">
                <h3>Assigned Tasks</h3>
                <p className="kpi-value">{dashboardData?.assignedTasks || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">⏳</div>
              <div className="kpi-content">
                <h3>Pending Tasks</h3>
                <p className="kpi-value">{dashboardData?.pendingTasks || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">✅</div>
              <div className="kpi-content">
                <h3>Completed Tasks</h3>
                <p className="kpi-value">{dashboardData?.completedTasks || 0}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">📅</div>
              <div className="kpi-content">
                <h3>Attendance Status</h3>
                <p className="kpi-value">
                  {dashboardData?.todayAttendance ? 
                    dashboardData.todayAttendance.status : 'Not Marked'}
                </p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Quick Actions</h3>
            <div className="action-grid">
              <button 
                className="action-card"
                onClick={handleMarkAttendance}
                disabled={markingAttendance || dashboardData?.todayAttendance}
              >
                <span className="action-icon">✅</span>
                <span>{markingAttendance ? 'Marking...' : 'Mark Attendance'}</span>
              </button>
              <button className="action-card" onClick={() => navigate('/tasks')}>
                <span className="action-icon">📋</span>
                <span>View Tasks</span>
              </button>
              <button className="action-card" onClick={() => navigate('/shifts')}>
                <span className="action-icon">📅</span>
                <span>View Schedule</span>
              </button>
              <button className="action-card" onClick={() => navigate('/notifications')}>
                <span className="action-icon">🔔</span>
                <span>Notifications</span>
              </button>
            </div>
          </div>

          <div className="section">
            <h3>Today's Status</h3>
            <div className="status-card">
              <div className="status-item">
                <span className="status-label">Shift:</span>
                <span className="status-value">Morning Shift (06:00 - 14:00)</span>
              </div>
              <div className="status-item">
                <span className="status-label">Branch:</span>
                <span className="status-value">{dashboardData?.worker?.branch?.name}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Attendance:</span>
                <span className={`status-value ${dashboardData?.todayAttendance ? 'present' : 'absent'}`}>
                  {dashboardData?.todayAttendance ? 'Present' : 'Not Marked'}
                </span>
              </div>
            </div>
          </div>

          <div className="demo-notice">
            <p>⚠️ Demo Mode: This is a prototype with sample data for demonstration purposes.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default WorkerDashboard;

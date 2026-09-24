import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { salesAPI, expenseAPI, attendanceAPI, taskAPI, branchAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId ? String(user.branchId) : '');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    if (user?.role === 'OWNER') {
      fetchBranches();
    }
  }, [user]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [selectedBranch, selectedReport, startDate, endDate]);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const branchId = selectedBranch || user?.branchId;
      let data = null;

      switch (selectedReport) {
        case 'sales':
          const salesResponse = await salesAPI.getByBranchAndDateRange(branchId, startDate, endDate);
          const totalSalesResponse = await salesAPI.getTotalSalesByBranch(branchId, startDate, endDate);
          data = {
            type: 'sales',
            records: salesResponse.data,
            total: totalSalesResponse.data.totalSales || 0,
            count: salesResponse.data.length
          };
          break;
        case 'expenses':
          const expenseResponse = await expenseAPI.getByBranch(branchId);
          const filteredExpenses = expenseResponse.data.filter(
            exp => exp.expenseDate >= startDate && exp.expenseDate <= endDate
          );
          const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
          data = {
            type: 'expenses',
            records: filteredExpenses,
            total: totalExpenses,
            count: filteredExpenses.length
          };
          break;
        case 'attendance':
          const attendanceResponse = await attendanceAPI.getByBranchAndDate(branchId, startDate);
          data = {
            type: 'attendance',
            records: attendanceResponse.data,
            count: attendanceResponse.data.length
          };
          break;
        case 'tasks':
          const taskResponse = await taskAPI.getByBranch(branchId);
          data = {
            type: 'tasks',
            records: taskResponse.data,
            completed: taskResponse.data.filter(t => t.status === 'COMPLETED').length,
            pending: taskResponse.data.filter(t => t.status === 'PENDING').length,
            count: taskResponse.data.length
          };
          break;
        default:
          data = null;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
  };

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };

  const handleDateChange = (e) => {
    if (e.target.name === 'startDate') {
      setStartDate(e.target.value);
    } else {
      setEndDate(e.target.value);
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Operational Audits">
        <div className="loading">Generating report telemetry...</div>
      </AppShell>
    );
  }

  const dashboardPath = user?.role === 'OWNER' ? '/owner-dashboard' : '/admin-dashboard';

  return (
    <AppShell pageTitle="Operational Audits">
      <div className="dashboard-header">
            <h2>Reports</h2>
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
              <label>Report Type:</label>
              <select value={selectedReport} onChange={handleReportChange}>
                <option value="sales">Sales Report</option>
                <option value="expenses">Expense Report</option>
                <option value="attendance">Attendance Report</option>
                <option value="tasks">Task Report</option>
              </select>
            </div>
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
            <button onClick={fetchReportData} className="btn btn-primary">Generate Report</button>
          </div>

          {loading ? (
            <div className="loading">Loading report...</div>
          ) : reportData ? (
            <div className="report-container">
              <div className="report-summary">
                <h3>Report Summary</h3>
                <div className="summary-cards">
                  {selectedReport === 'sales' && (
                    <>
                      <div className="summary-card">
                        <h4>Total Sales</h4>
                        <p className="summary-value">₹{reportData.total.toFixed(2)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Transactions</h4>
                        <p className="summary-value">{reportData.count}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Average</h4>
                        <p className="summary-value">
                          ₹{reportData.count > 0 ? (reportData.total / reportData.count).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedReport === 'expenses' && (
                    <>
                      <div className="summary-card">
                        <h4>Total Expenses</h4>
                        <p className="summary-value">₹{reportData.total.toFixed(2)}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Expense Count</h4>
                        <p className="summary-value">{reportData.count}</p>
                      </div>
                    </>
                  )}
                  {selectedReport === 'attendance' && (
                    <>
                      <div className="summary-card">
                        <h4>Attendance Records</h4>
                        <p className="summary-value">{reportData.count}</p>
                      </div>
                    </>
                  )}
                  {selectedReport === 'tasks' && (
                    <>
                      <div className="summary-card">
                        <h4>Total Tasks</h4>
                        <p className="summary-value">{reportData.count}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Completed</h4>
                        <p className="summary-value">{reportData.completed}</p>
                      </div>
                      <div className="summary-card">
                        <h4>Pending</h4>
                        <p className="summary-value">{reportData.pending}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="report-details">
                <h3>Detailed Records</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      {selectedReport === 'sales' && (
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Bill ID</th>
                        </tr>
                      )}
                      {selectedReport === 'expenses' && (
                        <tr>
                          <th>ID</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Description</th>
                        </tr>
                      )}
                      {selectedReport === 'attendance' && (
                        <tr>
                          <th>ID</th>
                          <th>Worker</th>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Status</th>
                        </tr>
                      )}
                      {selectedReport === 'tasks' && (
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {reportData.records.map(record => (
                        <tr key={record.id}>
                          {selectedReport === 'sales' && (
                            <>
                              <td>{record.id}</td>
                              <td>{new Date(record.saleDate).toLocaleDateString()}</td>
                              <td>₹{record.amount.toFixed(2)}</td>
                              <td>{record.bill?.id || '-'}</td>
                            </>
                          )}
                          {selectedReport === 'expenses' && (
                            <>
                              <td>{record.id}</td>
                              <td>{record.category}</td>
                              <td>₹{record.amount.toFixed(2)}</td>
                              <td>{new Date(record.expenseDate).toLocaleDateString()}</td>
                              <td>{record.description || '-'}</td>
                            </>
                          )}
                          {selectedReport === 'attendance' && (
                            <>
                              <td>{record.id}</td>
                              <td>{record.worker?.user?.name}</td>
                              <td>{record.date}</td>
                              <td>{record.checkInTime || '-'}</td>
                              <td>{record.status}</td>
                            </>
                          )}
                          {selectedReport === 'tasks' && (
                            <>
                              <td>{record.id}</td>
                              <td>{record.title}</td>
                              <td>{record.priority}</td>
                              <td>{record.status}</td>
                              <td>{record.assignedTo?.user?.name || 'Unassigned'}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No report data available. Select a report type and date range to generate a report.</p>
            </div>
          )}
    </AppShell>
  );
}

export default Reports;

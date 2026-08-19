import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI, workerAPI, branchAPI } from '../services/api';
import './Dashboard.css';

function TaskManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '',
    assignedToId: '',
    branchId: user?.branchId || ''
  });

  useEffect(() => {
    if (user?.role === 'OWNER') {
      fetchBranches();
    }
    if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
      fetchWorkers();
    }
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      let response;
      if (user?.role === 'WORKER') {
        response = await taskAPI.getByWorker(user.workerId);
      } else if (user?.role === 'ADMIN') {
        response = await taskAPI.getByBranch(user.branchId);
      } else {
        response = await taskAPI.getByBranch(user.branchId || 1);
      }
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await workerAPI.getByBranch(user?.branchId || 1);
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

  const handleCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      assignedToId: '',
      branchId: user?.branchId || ''
    });
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || '',
      assignedToId: task.assignedTo?.id || '',
      branchId: task.branch?.id || user?.branchId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        alert('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await taskAPI.update(taskId, { ...task, status: newStatus });
      alert('Task status updated successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        branchId: parseInt(formData.branchId),
        assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : null,
        assignedById: user?.adminId || user?.id
      };

      if (editingTask) {
        await taskAPI.update(editingTask.id, taskData);
        alert('Task updated successfully');
      } else {
        await taskAPI.create(taskData);
        alert('Task created successfully');
      }
      setShowModal(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'urgent';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'completed';
      case 'IN_PROGRESS': return 'in-progress';
      case 'OVERDUE': return 'overdue';
      case 'PENDING': return 'pending';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
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
            <Link to="/tasks" className="nav-item active">Tasks</Link>
            <Link to="/attendance" className="nav-item">Attendance</Link>
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
            <h2>Task Management</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                <button onClick={handleCreate} className="btn btn-primary">+ Create Task</button>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.description?.substring(0, 50)}...</td>
                    <td>
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{task.assignedTo ? task.assignedTo.user?.name : 'Unassigned'}</td>
                    <td>{task.dueDate || 'No due date'}</td>
                    <td>
                      {user?.role === 'WORKER' ? (
                        <select 
                          value={task.status}
                          onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(task)} className="btn btn-sm btn-secondary">Edit</button>
                          <button onClick={() => handleDelete(task.id)} className="btn btn-sm btn-danger">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks found.</p>
            </div>
          )}

          {showModal && (user?.role === 'ADMIN' || user?.role === 'OWNER') && (
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
                  <button onClick={() => setShowModal(false)} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
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
                  <div className="form-group">
                    <label>Priority *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
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
                  <div className="form-group">
                    <label>Assign To Worker</label>
                    <select
                      name="assignedToId"
                      value={formData.assignedToId}
                      onChange={handleInputChange}
                    >
                      <option value="">Unassigned</option>
                      {workers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.user?.name} - {worker.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">
                      {editingTask ? 'Update Task' : 'Create Task'}
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

export default TaskManagement;

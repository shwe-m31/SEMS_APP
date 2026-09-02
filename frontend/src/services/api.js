import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Dashboard API
export const dashboardAPI = {
  getOwnerDashboard: () => api.get('/dashboard/owner'),
  getAdminDashboard: (branchId) => api.get(`/dashboard/admin/${branchId}`),
  getWorkerDashboard: () => api.get('/dashboard/worker'),
};

// Branch API
export const branchAPI = {
  getAll: () => api.get('/branches'),
  getById: (id) => api.get(`/branches/${id}`),
  create: (branch) => api.post('/branches', branch),
  update: (id, branch) => api.put(`/branches/${id}`, branch),
  delete: (id) => api.delete(`/branches/${id}`),
};

// Worker API
export const workerAPI = {
  getByBranch: (branchId) => api.get(`/workers/branch/${branchId}`),
  getById: (id) => api.get(`/workers/${id}`),
  create: (workerData) => api.post('/workers', workerData),
  update: (id, worker) => api.put(`/workers/${id}`, worker),
  delete: (id) => api.delete(`/workers/${id}`),
};

// Admin API
export const adminAPI = {
  getAll: () => api.get('/admins'),
  getById: (id) => api.get(`/admins/${id}`),
  create: (adminData) => api.post('/admins', adminData),
  update: (id, admin) => api.put(`/admins/${id}`, admin),
  delete: (id) => api.delete(`/admins/${id}`),
};

// Task API
export const taskAPI = {
  getByBranch: (branchId) => api.get(`/tasks/branch/${branchId}`),
  getByWorker: (workerId) => api.get(`/tasks/worker/${workerId}`),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Attendance API
export const attendanceAPI = {
  getByWorker: (workerId) => api.get(`/attendance/worker/${workerId}`),
  getByBranchAndDate: (branchId, date) => api.get(`/attendance/branch/${branchId}/${date}`),
  mark: (attendanceData) => api.post('/attendance', attendanceData),
  update: (id, attendanceData) => api.put(`/attendance/${id}`, attendanceData),
};

// Shift API
export const shiftAPI = {
  getByBranch: (branchId) => api.get(`/shifts/branch/${branchId}`),
  getById: (id) => api.get(`/shifts/${id}`),
  create: (shiftData) => api.post('/shifts', shiftData),
  update: (id, shift) => api.put(`/shifts/${id}`, shift),
  delete: (id) => api.delete(`/shifts/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getByBranch: (branchId) => api.get(`/inventory/branch/${branchId}`),
  getLowStock: (branchId) => api.get(`/inventory/low-stock/${branchId}`),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (inventoryData) => api.post('/inventory', inventoryData),
  update: (id, inventory) => api.put(`/inventory/${id}`, inventory),
  updateStock: (id, stockData) => api.patch(`/inventory/${id}/stock`, stockData),
  delete: (id) => api.delete(`/inventory/${id}`),
};

// Billing API
export const billingAPI = {
  getByBranch: (branchId) => api.get(`/billing/branch/${branchId}`),
  getById: (id) => api.get(`/billing/${id}`),
  create: (billData) => api.post('/billing', billData),
  delete: (id) => api.delete(`/billing/${id}`),
};

// Expense API
export const expenseAPI = {
  getByBranch: (branchId) => api.get(`/expenses/branch/${branchId}`),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (expenseData) => api.post('/expenses', expenseData),
  update: (id, expense) => api.put(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Logistics API
export const logisticsAPI = {
  getByBranch: (branchId) => api.get(`/logistics/branch/${branchId}`),
  getById: (id) => api.get(`/logistics/${id}`),
  create: (logisticsData) => api.post('/logistics', logisticsData),
  update: (id, logistics) => api.put(`/logistics/${id}`, logistics),
  delete: (id) => api.delete(`/logistics/${id}`),
};

// Sales API
export const salesAPI = {
  getByBranch: (branchId) => api.get(`/sales/branch/${branchId}`),
  getByBranchAndDateRange: (branchId, startDate, endDate) => 
    api.get(`/sales/branch/${branchId}/range`, { params: { startDate, endDate } }),
  getTotalByBranch: (branchId, startDate, endDate) => 
    api.get(`/sales/total/branch/${branchId}`, { params: { startDate, endDate } }),
};

// AI Analytics API
export const aiAPI = {
  forecastInventory: (branchId, itemName) => api.get(`/ai/forecast/inventory/${branchId}/${itemName}`),
  predictSales: (branchId) => api.get(`/ai/predict/sales/${branchId}`),
  analyzeProductivity: (branchId) => api.get(`/ai/analyze/productivity/${branchId}`),
  detectAnomalies: (branchId) => api.get(`/ai/detect/anomalies/${branchId}`),
  getPredictions: (branchId) => api.get(`/ai/predictions/${branchId}`),
  getAnomalies: (branchId) => api.get(`/ai/anomalies/${branchId}`),
  updateAnomalyStatus: (id, status) => api.put(`/ai/anomalies/${id}/status`, { status }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Worker Shift API
export const workerShiftAPI = {
  getAll: () => api.get('/worker-shifts'),
  create: (assignmentData) => api.post('/worker-shifts', assignmentData),
  delete: (id) => api.delete(`/worker-shifts/${id}`),
};

export default api;

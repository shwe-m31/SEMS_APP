import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AiInsights from './pages/AiInsights';
import BranchManagement from './pages/BranchManagement';
import WorkerManagement from './pages/WorkerManagement';
import AdminManagement from './pages/AdminManagement';
import OwnerWorkers from './pages/OwnerWorkers';
import TaskManagement from './pages/TaskManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import ShiftManagement from './pages/ShiftManagement';
import InventoryManagement from './pages/InventoryManagement';
import BillingManagement from './pages/BillingManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import SalesManagement from './pages/SalesManagement';
import LogisticsManagement from './pages/LogisticsManagement';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/owner-dashboard" 
            element={
              <ProtectedRoute roles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/branches" 
            element={
              <ProtectedRoute roles={['OWNER']}>
                <BranchManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workers" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <WorkerManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker-dashboard" 
            element={
              <ProtectedRoute roles={['WORKER']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-insights" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <AiInsights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admins" 
            element={
              <ProtectedRoute roles={['OWNER']}>
                <AdminManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner-workers" 
            element={
              <ProtectedRoute roles={['OWNER']}>
                <OwnerWorkers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <TaskManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/attendance" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <AttendanceManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shifts" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <ShiftManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <InventoryManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <BillingManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <ExpenseManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <SalesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/logistics" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <LogisticsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN', 'WORKER']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

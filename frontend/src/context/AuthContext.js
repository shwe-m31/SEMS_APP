import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractUserData = (data) => ({
    id: data.id,
    username: data.username,
    email: data.email,
    name: data.name,
    role: data.role,
    branchId: data.branchId,
    branchCode: data.branchCode,
    branchName: data.branchName,
    adminId: data.adminId,
    workerId: data.workerId,
    organizationId: data.organizationId,
    organizationName: data.organizationName,
    employeeId: data.employeeId,
    designation: data.designation,
    mustChangePassword: Boolean(data.mustChangePassword)
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser(extractUserData(response.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    const userData = extractUserData(response.data);
    setUser(userData);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const registerOwner = async (ownerData) => {
    const response = await authAPI.registerOwner(ownerData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.owner) {
        setUser({
          id: response.data.owner.id,
          username: response.data.owner.username,
          name: response.data.owner.name,
          email: response.data.owner.email,
          role: response.data.owner.role || 'OWNER',
          organizationId: response.data.organization?.id,
          organizationName: response.data.organization?.name,
          mustChangePassword: false
        });
      }
    }
    return response.data;
  };

  const changePassword = async (passwordData) => {
    const response = await authAPI.changePassword(passwordData);
    setUser(prev => prev ? { ...prev, mustChangePassword: false } : prev);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    register,
    registerOwner,
    changePassword,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

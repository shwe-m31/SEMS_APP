import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import AppShell from '../components/AppShell';
import './Dashboard.css';

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };


  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationType = (type) => {
    switch (type) {
      case 'TASK': return 'task';
      case 'ATTENDANCE': return 'attendance';
      case 'SHIFT': return 'shift';
      case 'INVENTORY': return 'inventory';
      case 'BILLING': return 'billing';
      case 'LOGISTICS': return 'logistics';
      case 'SYSTEM': return 'system';
      default: return '';
    }
  };

  if (loading) {
    return (
      <AppShell pageTitle="Operational Alerts">
        <div className="loading">Loading notifications...</div>
      </AppShell>
    );
  }

  const dashboardPath = user?.role === 'OWNER' ? '/owner-dashboard' : 
                        user?.role === 'ADMIN' ? '/admin-dashboard' : '/worker-dashboard';

  return (
    <AppShell pageTitle="Operational Alerts">
      <div className="dashboard-header">
            <h2>Notifications</h2>
            <div>
              <button onClick={() => navigate(dashboardPath)} className="btn btn-secondary">Back to Dashboard</button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="btn btn-primary">
                  Mark All as Read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications.</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-card ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-header">
                    <span className={`notification-type ${getNotificationType(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn btn-sm btn-secondary"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
    </AppShell>
  );
}

export default Notifications;

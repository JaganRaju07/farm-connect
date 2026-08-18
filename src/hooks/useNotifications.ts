// frontend/src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  reference_id?: number;
  reference_type?: string;
}

/**
 * Custom hook for Pull-based Notifications
 * 
 * WHY POLLING?
 * Real-time notifications typically require WebSockets or Server-Sent Events,
 * which introduce stateful connections, load balancing overhead, and higher complexity.
 * For an MVP or demo scale, standard HTTP polling every 30 seconds is highly efficient,
 * simple to implement, and requires no special backend gateway configuration.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data.notifications || []);
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (error) {
      // Silently fail — notifications are non-critical and shouldn't crash the UI
    }
  }, [API_BASE]);

  const markAllRead = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE}/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    fetchNotifications,
    markAllRead
  };
}

// Simple React hook for localStorage-based notifications
import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '@/lib/notification-service';

export function useSimpleNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    try {
      const loadedNotifications = notificationService.getNotifications();
      setNotifications(loadedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Add a new notification
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      const newNotification = await notificationService.addNotification(notification);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add notification');
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    try {
      notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        (prev || []).map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    try {
      notificationService.markAllAsRead();
      setNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((notificationId: string) => {
    try {
      notificationService.deleteNotification(notificationId);
      setNotifications(prev => {
        const notification = (prev || []).find(n => n.id === notificationId);
        const filtered = (prev || []).filter(n => n.id !== notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return filtered;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    try {
      notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear notifications');
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      loadNotifications();
    } finally {
      setIsLoading(false);
    }
  }, [loadNotifications]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      return await notificationService.requestPermission();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permission');
      return false;
    }
  }, []);

  // Check if notifications are supported
  const isSupported = notificationService.isSupported();

  // Get permission status
  const permission = notificationService.getPermissionStatus();

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    requestPermission,
    isSupported,
    permission,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLogin } from '../components/login-context';

export interface Notification {
    id: string;
    type: 'deposit' | 'withdrawal' | 'lock_funds' | 'unlock_funds' | 'referral' | 'system' | 'reward';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: any;
}

interface NotificationsResponse {
    success: boolean;
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface UnreadCountResponse {
    success: boolean;
    unreadCount: number;
}

export function useNotifications() {
    const { isLoggedIn } = useLogin();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Fetch notifications
    const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
        if (!isLoggedIn) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
            const data: NotificationsResponse = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
                setPagination(data.pagination);
            } else {
                setError('Failed to fetch notifications');
            }
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    // Fetch unread count only
    const fetchUnreadCount = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            const response = await fetch('/api/notifications/unread-count');
            const data: UnreadCountResponse = await response.json();

            if (data.success) {
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, [isLoggedIn]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        if (!isLoggedIn) return;

        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }, [isLoggedIn]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PUT'
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, read: true }))
                );
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    }, [isLoggedIn]);

    // Load more notifications (for pagination)
    const loadMore = useCallback(async () => {
        if (pagination.page >= pagination.totalPages) return;

        const nextPage = pagination.page + 1;
        setLoading(true);

        try {
            const response = await fetch(`/api/notifications?page=${nextPage}&limit=${pagination.limit}`);
            const data: NotificationsResponse = await response.json();

            if (data.success) {
                setNotifications(prev => [...prev, ...data.notifications]);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error('Error loading more notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.totalPages, pagination.limit]);

    // Format time ago
    const formatTimeAgo = useCallback((dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }, []);

    // Initialize
    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn, fetchNotifications]);

    // Poll for unread count every 30 seconds
    useEffect(() => {
        if (!isLoggedIn) return;

        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isLoggedIn, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        pagination,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        loadMore,
        formatTimeAgo,
        hasMore: pagination.page < pagination.totalPages
    };
}
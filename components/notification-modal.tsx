'use client';

import { X, Bell, DollarSign, Users, TrendingUp, Clock, Loader2 } from "lucide-react";
import { useNotifications, Notification as NotificationType } from "../hooks/useNotifications";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'deposit':
        case 'withdrawal':
            return <DollarSign className="w-5 h-5 text-green-500" />;
        case 'referral':
            return <Users className="w-5 h-5 text-blue-500" />;
        case 'lock_funds':
        case 'unlock_funds':
            return <TrendingUp className="w-5 h-5 text-purple-500" />;
        case 'system':
        case 'reward':
            return <Bell className="w-5 h-5 text-orange-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

const getNotificationTitle = (notification: NotificationType) => {
    switch (notification.type) {
        case 'deposit':
            return 'Deposit Received';
        case 'withdrawal':
            return 'Withdrawal Processed';
        case 'lock_funds':
            return 'Funds Locked';
        case 'unlock_funds':
            return 'Funds Unlocked';
        case 'referral':
            return 'New Friend Joined';
        case 'system':
            return 'System Notification';
        case 'reward':
            return 'Reward Earned';
        default:
            return notification.title || 'Notification';
    }
};

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        formatTimeAgo
    } = useNotifications();

    if (!isOpen) return null;

    const handleNotificationClick = async (notification: NotificationType) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-t-xl w-full max-w-md h-[70vh] transform transition-transform duration-300 flex flex-col relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <Bell className="w-6 h-6 text-[#004B49]" />
                        <h3 className="text-lg font-bold text-[#004B49]">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-[#004B49]" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${
                                                notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                                            }`}>
                                                {getNotificationTitle(notification)}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Bell className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-center">No notifications yet</p>
                            <p className="text-sm text-center mt-1">We'll notify you when something important happens</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {unreadCount > 0 && (
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <button
                            onClick={handleMarkAllRead}
                            className="w-full bg-[#004B49] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                        >
                            Mark All as Read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

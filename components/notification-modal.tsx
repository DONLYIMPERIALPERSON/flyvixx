'use client';

import { X, Bell, DollarSign, Users, TrendingUp, Clock } from "lucide-react";

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Notification {
    id: number;
    type: 'payment' | 'referral' | 'system' | 'reward';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'payment',
        title: 'Payment Received',
        message: 'You have received $50.00 from your daily flight earnings',
        time: '2 minutes ago',
        read: false
    },
    {
        id: 2,
        type: 'referral',
        title: 'New Referral Joined',
        message: 'John Doe has joined using your referral link',
        time: '15 minutes ago',
        read: false
    },
    {
        id: 3,
        type: 'reward',
        title: 'Level Up Bonus',
        message: 'Congratulations! You reached Level 3 and earned $25 bonus',
        time: '1 hour ago',
        read: false
    },
    {
        id: 4,
        type: 'system',
        title: 'Daily Flight Available',
        message: 'Your daily flight power has been reset. Start earning now!',
        time: '2 hours ago',
        read: true
    },
    {
        id: 5,
        type: 'payment',
        title: 'Weekly Bonus',
        message: 'You earned $15.50 from your weekly referral bonus',
        time: '1 day ago',
        read: true
    },
    {
        id: 6,
        type: 'referral',
        title: 'Referral Milestone',
        message: 'You now have 5 active referrals. Keep growing your network!',
        time: '2 days ago',
        read: true
    }
];

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'payment':
            return <DollarSign className="w-5 h-5 text-green-500" />;
        case 'referral':
            return <Users className="w-5 h-5 text-blue-500" />;
        case 'reward':
            return <TrendingUp className="w-5 h-5 text-purple-500" />;
        case 'system':
            return <Bell className="w-5 h-5 text-orange-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
    if (!isOpen) return null;

    const unreadCount = mockNotifications.filter(n => !n.read).length;

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
                    <div className="divide-y divide-gray-100">
                        {mockNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${
                                            notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                                        }`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {notification.time}
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

                    {mockNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Bell className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-center">No notifications yet</p>
                            <p className="text-sm text-center mt-1">We'll notify you when something important happens</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <button className="w-full bg-[#004B49] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors">
                        Mark All as Read
                    </button>
                </div>
            </div>
        </div>
    );
}
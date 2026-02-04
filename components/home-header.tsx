'use client';

import { useState } from "react";
import { Search, Bell, User } from "lucide-react";
import NotificationModal from "./notification-modal";
import SearchModal from "./search-modal";
import ProfileModal from "./profile-modal";

// Mock notification data for unread count
const mockNotifications = [
    { id: 1, read: false },
    { id: 2, read: false },
    { id: 3, read: false },
    { id: 4, read: true },
    { id: 5, read: true },
    { id: 6, read: true }
];

interface HomeHeaderProps {
    isLoggedIn: boolean;
}

export default function HomeHeader({ isLoggedIn }: HomeHeaderProps) {
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const unreadCount = mockNotifications.filter(n => !n.read).length;

    return (
        <>
            <header className="flex items-center justify-between p-4">
                <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
                {isLoggedIn && (
                    <div className="flex space-x-4">
                        <div
                            className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => setShowSearchModal(true)}
                        >
                            <Search size={20} color="#ffd700" />
                        </div>
                        <div
                            className="relative w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => setShowNotificationModal(true)}
                        >
                            <Bell size={20} color="#ffd700" />
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </div>
                        <div
                            className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                            onClick={() => setShowProfileModal(true)}
                        >
                            <User size={20} color="#ffd700" />
                        </div>
                    </div>
                )}
            </header>

            <SearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
            />

            <NotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
            />

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </>
    );
}

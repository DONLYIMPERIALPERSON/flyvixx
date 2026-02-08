'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
    Home,
    CreditCard,
    ArrowDownCircle,
    TrendingUp,
    LogOut
} from 'lucide-react';

interface AdminNavProps {
    onLogout?: () => void;
}

export default function AdminNav({ onLogout }: AdminNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Home',
            path: '/admin/dashboard',
            icon: Home,
            active: pathname === '/admin/dashboard'
        },
        {
            label: 'Deposits',
            path: '/admin/deposits',
            icon: CreditCard,
            active: pathname === '/admin/deposits'
        },
        {
            label: 'Withdrawals',
            path: '/admin/withdrawals',
            icon: ArrowDownCircle,
            active: pathname === '/admin/withdrawals'
        },
        {
            label: 'Profits',
            path: '/admin/profits',
            icon: TrendingUp,
            active: pathname === '/admin/profits'
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminAuthenticated');
        router.push('/admin/login');
        if (onLogout) onLogout();
    };

    return (
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} className="text-[#004B49]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                            <p className="text-white/60 text-sm">FLYVIXX Management</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        item.active
                                            ? 'bg-[#FFD700] text-[#004B49]'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    TrendingUp,
    CreditCard,
    Clock,
    CheckCircle,
    ArrowDownCircle,
    MinusCircle,
    PlusCircle,
    Wallet,
    BarChart3,
    UserPlus,
    Lock
} from 'lucide-react';
import AdminNav from '@/components/admin-nav';
import AdminGuard from '@/components/admin-guard';

interface DashboardMetric {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

export default function AdminDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
    const [totalLockedFunds, setTotalLockedFunds] = useState('0.00');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                // Transform API data into dashboard metrics
                const dashboardMetrics: DashboardMetric[] = [
                    {
                        title: 'Total Users (All Time)',
                        value: data.data.totalUsers.toLocaleString(),
                        icon: <Users size={24} />,
                        color: 'text-blue-400',
                        bgColor: 'bg-blue-500/20'
                    },
                    {
                        title: 'Today Invited Users',
                        value: data.data.todayInvitedUsers.toLocaleString(),
                        icon: <UserPlus size={24} />,
                        color: 'text-cyan-400',
                        bgColor: 'bg-cyan-500/20'
                    },
                    {
                        title: 'Total Auto Payout (All Time)',
                        value: `$${data.data.totalAutoPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <DollarSign size={24} />,
                        color: 'text-green-400',
                        bgColor: 'bg-green-500/20'
                    },
                    {
                        title: 'Total Auto Payout (Today)',
                        value: `$${data.data.totalAutoPayoutToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <TrendingUp size={24} />,
                        color: 'text-green-400',
                        bgColor: 'bg-green-500/20'
                    },
                    {
                        title: 'Total Deposit (All Time)',
                        value: `$${data.data.totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <CreditCard size={24} />,
                        color: 'text-purple-400',
                        bgColor: 'bg-purple-500/20'
                    },
                    {
                        title: 'Total Deposit (Today)',
                        value: `$${data.data.totalDepositToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <CreditCard size={24} />,
                        color: 'text-purple-400',
                        bgColor: 'bg-purple-500/20'
                    },
                    {
                        title: 'Pending Payout',
                        value: `$${data.data.pendingPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <Clock size={24} />,
                        color: 'text-yellow-400',
                        bgColor: 'bg-yellow-500/20'
                    },
                    {
                        title: 'Total Admin Approved Payout',
                        value: `$${data.data.totalAdminApprovedPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <CheckCircle size={24} />,
                        color: 'text-green-400',
                        bgColor: 'bg-green-500/20'
                    },
                    {
                        title: 'Total Admin Withdrawal',
                        value: `$${data.data.totalAdminWithdrawal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <ArrowDownCircle size={24} />,
                        color: 'text-red-400',
                        bgColor: 'bg-red-500/20'
                    },
                    {
                        title: 'All Time Debit',
                        value: `$${data.data.allTimeDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <MinusCircle size={24} />,
                        color: 'text-red-400',
                        bgColor: 'bg-red-500/20'
                    },
                    {
                        title: 'Total Cash Balance (Users)',
                        value: `$${data.data.totalUserCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <Wallet size={24} />,
                        color: 'text-emerald-400',
                        bgColor: 'bg-emerald-500/20'
                    },
                    {
                        title: 'Available Balance',
                        value: `$${data.data.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        icon: <Wallet size={24} />,
                        color: 'text-blue-400',
                        bgColor: 'bg-blue-500/20'
                    }
                ];

                setMetrics(dashboardMetrics);
                setTotalLockedFunds(data.data.totalLockedFunds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            } else {
                console.error('Failed to fetch dashboard data:', data.error?.message || data.error);
                // Set fallback data
                setMetrics([
                    {
                        title: 'Error Loading Data',
                        value: 'N/A',
                        icon: <BarChart3 size={24} />,
                        color: 'text-red-400',
                        bgColor: 'bg-red-500/20'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set fallback data
            setMetrics([
                {
                    title: 'Error Loading Data',
                    value: 'N/A',
                    icon: <BarChart3 size={24} />,
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/20'
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
                    <p className="text-white/70">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
                {/* Admin Navigation */}
                <AdminNav />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Overview Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {metrics.map((metric, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                                            <div className={metric.color}>
                                                {metric.icon}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-sm font-medium mb-1">
                                            {metric.title}
                                        </p>
                                        <p className="text-white text-2xl font-bold">
                                            {metric.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Locked Funds Section */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                        {/* Header */}
                        <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <Lock size={20} className="text-orange-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Total Locked Funds</h3>
                                    <p className="text-white/60 text-sm">Funds currently locked in user accounts</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Main Locked Funds Display */}
                                <div className="bg-orange-500/10 rounded-lg p-6 border border-orange-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                                <Lock size={24} className="text-orange-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white">Total Locked</h4>
                                                <p className="text-white/60 text-sm">Across all users</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-orange-400">
                                        ${totalLockedFunds}
                                    </div>
                                </div>

                                {/* Locked Funds Breakdown */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white mb-4">Fund Breakdown</h4>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <Users size={16} className="text-blue-400" />
                                                </div>
                                                <span className="text-white/80">Active Bets</span>
                                            </div>
                                            <span className="text-white font-medium">Primary Source</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                    <TrendingUp size={16} className="text-green-400" />
                                                </div>
                                                <span className="text-white/80">Portfolio Investments</span>
                                            </div>
                                            <span className="text-white font-medium">Secondary Source</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                    <Clock size={16} className="text-purple-400" />
                                                </div>
                                                <span className="text-white/80">Pending Actions</span>
                                            </div>
                                            <span className="text-white font-medium">Temporary Holds</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Lock size={16} className="text-orange-400" />
                                    </div>
                                    <div>
                                        <h5 className="text-white font-medium mb-1">About Locked Funds</h5>
                                        <p className="text-white/70 text-sm">
                                            Locked funds represent money temporarily held in user accounts for active bets,
                                            portfolio investments, and other platform activities. These funds are not available
                                            for immediate withdrawal until the associated actions are completed or resolved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
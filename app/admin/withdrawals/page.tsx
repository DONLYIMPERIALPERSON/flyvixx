'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    CheckCircle,
    Clock,
    ArrowDownCircle,
    DollarSign,
    User,
    Calendar,
    TrendingUp,
    Users,
    CreditCard,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import AdminNav from '@/components/admin-nav';
import AdminGuard from '@/components/admin-guard';

interface Withdrawal {
    id: string;
    email: string;
    amount: number;
    totalDeposit: number;
    totalWithdrawal: number;
    totalReferral: number;
    type: 'auto' | 'admin';
    state: 'processed_automatically' | 'waiting_for_admin_approval' | 'approved_by_admin';
    payoutDetails: string;
    dateTime: string;
}

export default function AdminWithdrawalsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const itemsPerPage = 10;

    // Mock data - in a real app, this would come from API calls
    const mockWithdrawals: Withdrawal[] = [
        {
            id: '1',
            email: 'john.doe@example.com',
            amount: 150.00,
            totalDeposit: 500.00,
            totalWithdrawal: 200.00,
            totalReferral: 50.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Bank Transfer - Account: ****1234',
            dateTime: '2026-02-08 14:30:25'
        },
        {
            id: '2',
            email: 'jane.smith@example.com',
            amount: 300.00,
            totalDeposit: 800.00,
            totalWithdrawal: 400.00,
            totalReferral: 75.00,
            type: 'admin',
            state: 'waiting_for_admin_approval',
            payoutDetails: 'PayPal - jane.smith@email.com',
            dateTime: '2026-02-08 13:15:10'
        },
        {
            id: '3',
            email: 'mike.johnson@example.com',
            amount: 75.25,
            totalDeposit: 200.00,
            totalWithdrawal: 100.00,
            totalReferral: 25.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Crypto Wallet - 0x1234...abcd',
            dateTime: '2026-02-08 12:45:33'
        },
        {
            id: '4',
            email: 'sarah.wilson@example.com',
            amount: 500.00,
            totalDeposit: 1500.00,
            totalWithdrawal: 600.00,
            totalReferral: 100.00,
            type: 'admin',
            state: 'approved_by_admin',
            payoutDetails: 'Bank Transfer - Account: ****5678',
            dateTime: '2026-02-08 11:20:15'
        },
        {
            id: '5',
            email: 'david.brown@example.com',
            amount: 200.00,
            totalDeposit: 600.00,
            totalWithdrawal: 300.00,
            totalReferral: 40.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'PayPal - david.brown@email.com',
            dateTime: '2026-02-08 10:55:42'
        },
        {
            id: '6',
            email: 'lisa.davis@example.com',
            amount: 125.50,
            totalDeposit: 400.00,
            totalWithdrawal: 150.00,
            totalReferral: 30.00,
            type: 'admin',
            state: 'waiting_for_admin_approval',
            payoutDetails: 'Bank Transfer - Account: ****9012',
            dateTime: '2026-02-08 09:30:18'
        },
        {
            id: '7',
            email: 'chris.miller@example.com',
            amount: 180.75,
            totalDeposit: 550.00,
            totalWithdrawal: 250.00,
            totalReferral: 45.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Crypto Wallet - 0xabcd...1234',
            dateTime: '2026-02-07 16:45:22'
        },
        {
            id: '8',
            email: 'amy.taylor@example.com',
            amount: 350.00,
            totalDeposit: 1000.00,
            totalWithdrawal: 450.00,
            totalReferral: 80.00,
            type: 'admin',
            state: 'approved_by_admin',
            payoutDetails: 'PayPal - amy.taylor@email.com',
            dateTime: '2026-02-07 15:20:35'
        },
        {
            id: '9',
            email: 'robert.jones@example.com',
            amount: 275.00,
            totalDeposit: 750.00,
            totalWithdrawal: 350.00,
            totalReferral: 60.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Bank Transfer - Account: ****3456',
            dateTime: '2026-02-07 14:20:15'
        },
        {
            id: '10',
            email: 'emily.white@example.com',
            amount: 425.50,
            totalDeposit: 1200.00,
            totalWithdrawal: 500.00,
            totalReferral: 90.00,
            type: 'admin',
            state: 'waiting_for_admin_approval',
            payoutDetails: 'PayPal - emily.white@email.com',
            dateTime: '2026-02-07 13:10:45'
        },
        {
            id: '11',
            email: 'michael.brown@example.com',
            amount: 190.25,
            totalDeposit: 650.00,
            totalWithdrawal: 280.00,
            totalReferral: 55.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Crypto Wallet - 0x5678...cdef',
            dateTime: '2026-02-07 12:05:30'
        },
        {
            id: '12',
            email: 'samantha.green@example.com',
            amount: 320.00,
            totalDeposit: 950.00,
            totalWithdrawal: 420.00,
            totalReferral: 70.00,
            type: 'admin',
            state: 'approved_by_admin',
            payoutDetails: 'Bank Transfer - Account: ****7890',
            dateTime: '2026-02-07 11:15:20'
        },
        {
            id: '13',
            email: 'daniel.lee@example.com',
            amount: 145.75,
            totalDeposit: 480.00,
            totalWithdrawal: 190.00,
            totalReferral: 35.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'PayPal - daniel.lee@email.com',
            dateTime: '2026-02-07 10:25:10'
        },
        {
            id: '14',
            email: 'olivia.martin@example.com',
            amount: 280.00,
            totalDeposit: 820.00,
            totalWithdrawal: 380.00,
            totalReferral: 65.00,
            type: 'admin',
            state: 'waiting_for_admin_approval',
            payoutDetails: 'Bank Transfer - Account: ****1357',
            dateTime: '2026-02-06 16:40:55'
        },
        {
            id: '15',
            email: 'james.wilson@example.com',
            amount: 395.50,
            totalDeposit: 1100.00,
            totalWithdrawal: 480.00,
            totalReferral: 85.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Crypto Wallet - 0x9abc...f012',
            dateTime: '2026-02-06 15:30:40'
        },
        {
            id: '16',
            email: 'isabella.garcia@example.com',
            amount: 225.25,
            totalDeposit: 700.00,
            totalWithdrawal: 320.00,
            totalReferral: 45.00,
            type: 'admin',
            state: 'approved_by_admin',
            payoutDetails: 'PayPal - isabella.garcia@email.com',
            dateTime: '2026-02-06 14:20:15'
        },
        {
            id: '17',
            email: 'william.davis@example.com',
            amount: 175.00,
            totalDeposit: 580.00,
            totalWithdrawal: 240.00,
            totalReferral: 40.00,
            type: 'auto',
            state: 'processed_automatically',
            payoutDetails: 'Bank Transfer - Account: ****2468',
            dateTime: '2026-02-06 13:45:25'
        },
        {
            id: '18',
            email: 'sofia.rodriguez@example.com',
            amount: 360.75,
            totalDeposit: 1050.00,
            totalWithdrawal: 460.00,
            totalReferral: 75.00,
            type: 'admin',
            state: 'waiting_for_admin_approval',
            payoutDetails: 'Bank Transfer - Account: ****8642',
            dateTime: '2026-02-06 12:35:50'
        }
    ];

    useEffect(() => {
        fetchWithdrawals();
    }, [currentPage, searchEmail]);

    const fetchWithdrawals = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (searchEmail.trim()) {
                params.append('email', searchEmail.trim());
            }

            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setWithdrawals(data.data.withdrawals);
                setTotalCount(data.data.totalCount);
                setTotalPages(data.data.totalPages);
                setPendingCount(data.data.pendingCount);
            } else {
                console.error('Failed to fetch withdrawals:', data.error);
                setWithdrawals([]);
                setTotalCount(0);
                setTotalPages(0);
                setPendingCount(0);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            setWithdrawals([]);
            setTotalCount(0);
            setTotalPages(0);
            setPendingCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Use withdrawals directly since API handles filtering and pagination
    const currentWithdrawals = withdrawals;

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleApprove = async (withdrawalId: string) => {
        setApprovingId(withdrawalId);

        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    transactionId: withdrawalId
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update the withdrawal state in the UI
                setWithdrawals(prev =>
                    prev.map(w =>
                        w.id === withdrawalId
                            ? { ...w, state: 'approved_by_admin' as const }
                            : w
                    )
                );
                // Refresh the data to get updated counts
                fetchWithdrawals();
            } else {
                console.error('Failed to approve withdrawal:', data.error?.message || data.error);
                alert('Failed to approve withdrawal: ' + (data.error?.message || data.error));
            }
        } catch (error) {
            console.error('Error approving withdrawal:', error);
            alert('Error approving withdrawal. Please try again.');
        } finally {
            setApprovingId(null);
        }
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'processed_automatically':
                return 'text-green-400 bg-green-500/20';
            case 'waiting_for_admin_approval':
                return 'text-yellow-400 bg-yellow-500/20';
            case 'approved_by_admin':
                return 'text-blue-400 bg-blue-500/20';
            default:
                return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getStateText = (state: string) => {
        switch (state) {
            case 'processed_automatically':
                return 'Auto Processed';
            case 'waiting_for_admin_approval':
                return 'Waiting Approval';
            case 'approved_by_admin':
                return 'Admin Approved';
            default:
                return state;
        }
    };

    const getTypeColor = (type: string) => {
        return type === 'auto' ? 'text-cyan-400 bg-cyan-500/20' : 'text-purple-400 bg-purple-500/20';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
                    <p className="text-white/70">Loading withdrawals...</p>
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
                {/* Pending Requests Badge */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-yellow-400" />
                                <span className="text-yellow-400 font-medium">
                                    {pendingCount} Pending Requests
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchEmail}
                                onChange={(e) => {
                                    setSearchEmail(e.target.value);
                                    setCurrentPage(1); // Reset to first page when searching
                                }}
                                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Withdrawals List */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                        <div className="grid grid-cols-10 gap-3 text-xs">
                            <div className="flex items-center space-x-1 col-span-2">
                                <User size={14} className="text-white/70" />
                                <span className="text-white/70 font-medium">Email</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <DollarSign size={14} className="text-white/70" />
                                <span className="text-white/70 font-medium">Amount</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <CreditCard size={14} className="text-white/70" />
                                <span className="text-white/70 font-medium">Total Dep.</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <ArrowDownCircle size={14} className="text-white/70" />
                                <span className="text-white/70 font-medium">Total W/D</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Users size={14} className="text-white/70" />
                                <span className="text-white/70 font-medium">Referral</span>
                            </div>
                            <div className="text-white/70 font-medium">Type</div>
                            <div className="text-white/70 font-medium">State</div>
                            <div className="text-white/70 font-medium">Action</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-white/10">
                        {currentWithdrawals.length > 0 ? (
                            currentWithdrawals.map((withdrawal) => (
                                <div key={withdrawal.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                                    <div className="grid grid-cols-10 gap-3 items-center text-sm">
                                        <div className="text-white font-medium col-span-2">{withdrawal.email}</div>
                                        <div className="text-[#FFD700] font-bold">${withdrawal.amount.toFixed(2)}</div>
                                        <div className="text-white/70">${withdrawal.totalDeposit.toFixed(2)}</div>
                                        <div className="text-white/70">${withdrawal.totalWithdrawal.toFixed(2)}</div>
                                        <div className="text-white/70">${withdrawal.totalReferral.toFixed(2)}</div>
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(withdrawal.type)}`}>
                                                {withdrawal.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(withdrawal.state)}`}>
                                                {getStateText(withdrawal.state)}
                                            </span>
                                        </div>
                                        <div>
                                            {withdrawal.state === 'waiting_for_admin_approval' && (
                                                <button
                                                    onClick={() => handleApprove(withdrawal.id)}
                                                    disabled={approvingId === withdrawal.id}
                                                    className="bg-[#FFD700] text-[#004B49] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                                >
                                                    {approvingId === withdrawal.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-3 w-3 border border-[#004B49]/20 border-t-[#004B49]"></div>
                                                            <span>Approving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={12} />
                                                            <span>Approve</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-white/60">No withdrawals found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalCount > itemsPerPage && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} withdrawals
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={16} />
                                <span>Previous</span>
                            </button>
                            <span className="text-white/70 px-3 py-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <span>Next</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    </AdminGuard>
    );
}

'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    DollarSign,
    User,
    CheckCircle,
    XCircle,
    Coins
} from 'lucide-react';
import AdminNav from '@/components/admin-nav';
import AdminGuard from '@/components/admin-guard';

interface Deposit {
    id: string;
    userEmail: string;
    amount: number;
    dateTime: string;
    status: 'completed' | 'pending' | 'failed';
    depositType?: 'btc' | 'usdt' | 'bank';
    cryptoAmount?: number;
    walletAddress?: string;
}

export default function AdminDepositsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchDeposits();
    }, [currentPage, searchEmail]);

    const fetchDeposits = async () => {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/deposits?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setDeposits(data.data.deposits);
                setTotalCount(data.data.totalCount);
                setTotalPages(data.data.totalPages);
            } else {
                console.error('Failed to fetch deposits:', data.error);
                setDeposits([]);
                setTotalCount(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching deposits:', error);
            setDeposits([]);
            setTotalCount(0);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (email: string) => {
        setSearchEmail(email);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Use deposits directly since API handles filtering and pagination
    const currentDeposits = deposits;

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-400 bg-green-500/20';
            case 'pending':
                return 'text-yellow-400 bg-yellow-500/20';
            case 'failed':
                return 'text-red-400 bg-red-500/20';
            default:
                return 'text-gray-400 bg-gray-500/20';
        }
    };

    const handleApproveDeposit = async (depositId: string) => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/deposits/${depositId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                // Refresh deposits list
                fetchDeposits();
                alert('Deposit approved successfully!');
            } else {
                alert('Failed to approve deposit: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error approving deposit:', error);
            alert('Failed to approve deposit. Please try again.');
        }
    };

    const handleDeclineDeposit = async (depositId: string) => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/deposits/${depositId}/decline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                // Refresh deposits list
                fetchDeposits();
                alert('Deposit declined successfully!');
            } else {
                alert('Failed to decline deposit: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error declining deposit:', error);
            alert('Failed to decline deposit. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
                    <p className="text-white/70">Loading deposits...</p>
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

                    {/* Deposits List */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                        {/* Table Header */}
                        <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                            <div className="grid grid-cols-6 gap-4">
                                <div className="flex items-center space-x-2">
                                    <User size={16} className="text-white/70" />
                                    <span className="text-white/70 font-medium">User</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DollarSign size={16} className="text-white/70" />
                                    <span className="text-white/70 font-medium">Amount</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Coins size={16} className="text-white/70" />
                                    <span className="text-white/70 font-medium">Type</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} className="text-white/70" />
                                    <span className="text-white/70 font-medium">Date & Time</span>
                                </div>
                                <div className="text-white/70 font-medium">Status</div>
                                <div className="text-white/70 font-medium">Actions</div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/10">
                            {currentDeposits.length > 0 ? (
                                currentDeposits.map((deposit) => (
                                    <div key={deposit.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                                        <div className="grid grid-cols-6 gap-4 items-center">
                                            <div className="text-white font-medium">{deposit.userEmail}</div>
                                            <div className="text-[#FFD700] font-bold">
                                                ${deposit.amount.toFixed(2)}
                                                {deposit.cryptoAmount && (
                                                    <div className="text-xs text-white/60">
                                                        {deposit.cryptoAmount.toFixed(deposit.depositType === 'btc' ? 8 : 2)} {deposit.depositType?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {deposit.depositType && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        deposit.depositType === 'btc'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : deposit.depositType === 'usdt'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                        {deposit.depositType.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-white/70 text-sm">{deposit.dateTime}</div>
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                                                    {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {deposit.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveDeposit(deposit.id)}
                                                            className="p-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 hover:text-green-300 transition-colors"
                                                            title="Approve deposit"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineDeposit(deposit.id)}
                                                            className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 hover:text-red-300 transition-colors"
                                                            title="Decline deposit"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center">
                                    <p className="text-white/60">No deposits found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalCount > itemsPerPage && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-white/60 text-sm">
                                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} deposits
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
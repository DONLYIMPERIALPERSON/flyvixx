'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    Wallet,
    CheckCircle,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    History
} from 'lucide-react';
import AdminNav from '@/components/admin-nav';
import AdminGuard from '@/components/admin-guard';

export default function AdminProfitsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [cashoutAmount, setCashoutAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [totalProfits, setTotalProfits] = useState(0);
    const [lastCashout, setLastCashout] = useState<{ amount: number; date: string } | undefined>();
    const [cashoutHistory, setCashoutHistory] = useState<any[]>([]);
    const [totalHistoryPages, setTotalHistoryPages] = useState(0);
    const itemsPerPage = 5;

    // Calculate pagination for history
    const startHistoryIndex = (historyPage - 1) * itemsPerPage;
    const endHistoryIndex = startHistoryIndex + itemsPerPage;
    const currentHistoryItems = cashoutHistory.slice(startHistoryIndex, endHistoryIndex);

    const handleHistoryPrevious = () => {
        if (historyPage > 1) {
            setHistoryPage(historyPage - 1);
        }
    };

    const handleHistoryNext = () => {
        if (historyPage < totalHistoryPages) {
            setHistoryPage(historyPage + 1);
        }
    };

    useEffect(() => {
        loadBalanceAndHistory();
    }, []);

    const loadBalanceAndHistory = async () => {
        try {
            setIsLoading(true);

            // Load balance
            const adminToken = localStorage.getItem('adminToken');
            const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profits/balance`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const balanceData = await balanceResponse.json();
            if (balanceData.success) {
                setAvailableBalance(balanceData.data.availableBalance);
                setTotalProfits(balanceData.data.totalProfits);
                setLastCashout(balanceData.data.lastCashout);
            }

            // Load history
            const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profits/history?page=1&limit=5`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
            });

            const historyData = await historyResponse.json();
            if (historyData.success) {
                setCashoutHistory(historyData.data.cashouts);
                setTotalHistoryPages(historyData.data.totalPages);
            }

        } catch (error) {
            console.error('Error loading profits data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCashout = async () => {
        const amount = parseFloat(cashoutAmount);

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (amount > availableBalance) {
            alert('Amount exceeds available balance');
            return;
        }

        setIsProcessing(true);

        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profits/cashout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    amount: amount
                }),
            });

            const data = await response.json();

            if (data.success) {
                setShowSuccess(true);
                setCashoutAmount('');
                // Refresh balance and history
                loadBalanceAndHistory();

                // Hide success message after 3 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                }, 3000);
            } else {
                alert('Cashout failed: ' + (data.error?.message || data.error));
            }
        } catch (error) {
            console.error('Error processing cashout:', error);
            alert('Error processing cashout. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const getSplitAmounts = () => {
        const amount = parseFloat(cashoutAmount) || 0;
        // Fixed 50/50 split
        return {
            admin1: amount * 0.5,
            admin2: amount * 0.5
        };
    };

    const splitAmounts = getSplitAmounts();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700]/20 border-t-[#FFD700] mx-auto mb-4"></div>
                    <p className="text-white/70">Loading profits...</p>
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
                {/* Available Balance Display */}
                <div className="mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center">
                                    <Wallet size={24} className="text-[#004B49]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Available Balance</h3>
                                    <p className="text-white/60 text-sm">Current platform balance</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-[#FFD700]">
                                    ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="text-white/60 text-sm">USD</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Cashout Section */}
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                                <TrendingUp size={20} className="text-[#004B49]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Admin Cashout</h3>
                                <p className="text-white/60 text-sm">Withdraw profits from platform balance</p>
                            </div>
                        </div>
                    </div>

                    {/* Cashout Form */}
                    <div className="p-6 space-y-6">
                        {/* Amount Input */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                Cashout Amount
                            </label>
                            <div className="relative">
                                <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                                <input
                                    type="number"
                                    value={cashoutAmount}
                                    onChange={(e) => setCashoutAmount(e.target.value)}
                                    placeholder="Enter amount..."
                                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <p className="text-white/60 text-sm mt-1">
                                Maximum: ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Distribution Preview - Fixed 50/50 Split */}
                        {parseFloat(cashoutAmount) > 0 && (
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <h4 className="text-white font-medium mb-3">Distribution Preview (50/50 Split)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-white/70 text-sm">Admin 1</div>
                                        <div className="text-[#FFD700] font-bold text-lg">
                                            ${splitAmounts.admin1.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white/70 text-sm">Admin 2</div>
                                        <div className="text-[#FFD700] font-bold text-lg">
                                            ${splitAmounts.admin2.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3">
                                <CheckCircle size={20} className="text-green-400" />
                                <div>
                                    <div className="text-green-400 font-medium">Cashout Successful</div>
                                    <div className="text-green-300/80 text-sm">
                                        ${parseFloat(cashoutAmount).toFixed(2)} has been distributed according to the selected split.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Proceed Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleCashout}
                                disabled={isProcessing || !cashoutAmount || parseFloat(cashoutAmount) <= 0}
                                className="w-full bg-[#FFD700] text-[#004B49] py-3 px-6 rounded-lg font-bold hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#004B49]/20 border-t-[#004B49]"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp size={20} />
                                        <span>Proceed with Cashout</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cashout History */}
                <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                    {/* Header */}
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                                <History size={20} className="text-[#004B49]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Admin Cashout History</h3>
                                <p className="text-white/60 text-sm">Previous profit withdrawals and distributions</p>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Admin 1 (50%)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Admin 2 (50%)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {currentHistoryItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFD700] font-bold">
                                            ${item.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            ${item.admin1Amount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                                            ${item.admin2Amount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* History Pagination */}
                    {cashoutHistory.length > itemsPerPage && (
                        <div className="bg-white/5 px-6 py-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-white/60 text-sm">
                                    Showing {startHistoryIndex + 1}-{Math.min(endHistoryIndex, cashoutHistory.length)} of {cashoutHistory.length} cashouts
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleHistoryPrevious}
                                        disabled={historyPage === 1}
                                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Previous</span>
                                    </button>
                                    <span className="text-white/70 px-3 py-2">
                                        Page {historyPage} of {totalHistoryPages}
                                    </span>
                                    <button
                                        onClick={handleHistoryNext}
                                        disabled={historyPage === totalHistoryPages}
                                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <span>Next</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="flex items-start space-x-3">
                        <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
                        <div>
                            <h4 className="text-white font-medium mb-2">Cashout Information</h4>
                            <ul className="text-white/70 text-sm space-y-1">
                                <li>• Cashouts are processed immediately to admin wallets</li>
                                <li>• Split distribution is final and cannot be reversed</li>
                                <li>• All transactions are recorded in the system logs</li>
                                <li>• Minimum cashout amount: $1.00</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </AdminGuard>
    );
}

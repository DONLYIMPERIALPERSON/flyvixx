'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@descope/react-sdk";
import TransactionHeader from "../../components/transaction-header";
import LoginGuard from "../../components/login-guard";

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    createdAt: string;
    metadata?: any;
}

export default function TransactionsPage() {
    const router = useRouter();
    const { sessionToken } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const handleBack = () => {
        router.push('/');
    };

    const fetchTransactions = async (pageNum: number = 1) => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/transactions?page=${pageNum}&limit=20`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (pageNum === 1) {
                        setTransactions(data.transactions);
                    } else {
                        setTransactions(prev => [...prev, ...data.transactions]);
                    }
                    setHasMore(data.transactions.length === 20);
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTransactions(nextPage);
    };

    const formatDateTime = (dateString: string) => {
        // Parse the date as UTC and convert to local time
        const date = new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));

        // Format as: 10:20AM 1/2/2026 (in local timezone)
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const day = date.getDate();
        const year = date.getFullYear();

        return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm} ${month}/${day}/${year}`;
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'deposit': return 'Deposit';
            case 'withdrawal': return 'Withdrawal';
            case 'bet_placed': return 'Bet Placed';
            case 'cash_out': return 'Cash Out';
            case 'transfer': return 'Transfer';
            default: return type;
        }
    };

    const getMethodLabel = (transaction: Transaction) => {
        if (transaction.metadata?.method) {
            return transaction.metadata.method.toUpperCase();
        }
        return 'N/A';
    };

    return (
        <LoginGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <TransactionHeader onBack={handleBack} />

            <main className="p-4">
                <div className="max-w-md mx-auto">
                    {/* Transaction List */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                        <h2 className="text-white text-lg font-bold mb-4">Transaction History</h2>

                        {isLoading && transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                <p className="text-white/70">Loading transactions...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-white/70">No transactions found</p>
                                <p className="text-white/50 text-sm mt-2">Your transaction history will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">
                                                    {getTransactionTypeLabel(transaction.type)}
                                                </p>
                                                <p className="text-white/70 text-sm">
                                                    {getMethodLabel(transaction)} • {formatDateTime(transaction.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${
                                                    transaction.type === 'withdrawal' ||
                                                    transaction.type === 'bet_placed' ||
                                                    transaction.type === 'lock_funds' ||
                                                    (transaction.type === 'transfer' && transaction.metadata?.direction === 'out')
                                                        ? 'text-red-400'
                                                        : 'text-green-400'
                                                }`}>
                                                    {transaction.type === 'withdrawal' ||
                                                     transaction.type === 'bet_placed' ||
                                                     transaction.type === 'lock_funds' ||
                                                     (transaction.type === 'transfer' && transaction.metadata?.direction === 'out')
                                                         ? '-' : '+'}
                                                    ${Math.abs(transaction.amount).toFixed(2)}
                                                </p>
                                                <p className="text-white/70 text-xs capitalize">{transaction.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={isLoading}
                                            className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
        </LoginGuard>
    );
}

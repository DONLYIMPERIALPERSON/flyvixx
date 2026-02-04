'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionHeader from "../../components/transaction-header";
import LoginGuard from "../../components/login-guard";

export default function TransactionsPage() {
    const router = useRouter();

    const handleBack = () => {
        router.push('/');
    };

    return (
        <LoginGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <TransactionHeader onBack={handleBack} />

            <main className="p-4">
                <div className="max-w-md mx-auto">
                    {/* Transaction List Placeholder */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                        <h2 className="text-white text-lg font-bold mb-4">Recent Transactions</h2>

                        {/* Last 10 Transaction Items */}
                        <div className="space-y-3">
                            {[
                                { type: 'Deposit', method: 'BTC', time: '2 hours ago', amount: '+$150.00', status: 'Completed' },
                                { type: 'Withdrawal', method: 'USDT', time: '5 hours ago', amount: '-$200.00', status: 'Completed' },
                                { type: 'Transfer', method: 'Internal', time: '1 day ago', amount: '-$50.00', status: 'Completed' },
                                { type: 'Deposit', method: 'ETH', time: '2 days ago', amount: '+$300.00', status: 'Completed' },
                                { type: 'Withdrawal', method: 'BTC', time: '3 days ago', amount: '-$100.00', status: 'Completed' },
                                { type: 'Deposit', method: 'USDT', time: '4 days ago', amount: '+$250.00', status: 'Completed' },
                                { type: 'Transfer', method: 'Internal', time: '5 days ago', amount: '+$75.00', status: 'Completed' },
                                { type: 'Withdrawal', method: 'ETH', time: '1 week ago', amount: '-$180.00', status: 'Completed' },
                                { type: 'Deposit', method: 'BTC', time: '1 week ago', amount: '+$400.00', status: 'Completed' },
                                { type: 'Transfer', method: 'Internal', time: '2 weeks ago', amount: '-$25.00', status: 'Completed' }
                            ].map((transaction, index) => (
                                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-medium">{transaction.type}</p>
                                            <p className="text-white/70 text-sm">{transaction.method} • {transaction.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${transaction.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.amount}
                                            </p>
                                            <p className="text-white/70 text-xs">{transaction.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </LoginGuard>
    );
}

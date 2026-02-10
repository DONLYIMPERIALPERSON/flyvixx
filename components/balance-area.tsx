'use client';

import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@descope/react-sdk";
import DepositModal from "./deposit-modal";
import WithdrawalModal from "./withdrawal-modal";
import TransferModal from "./transfer-modal";

interface BalanceAreaProps {
    isLoggedIn: boolean;
}

interface Balance {
    cash: number;
    portfolio: number;
    lockedFunds: number;
    lockedUntil: Date | null;
    total: number;
}

export default function BalanceArea({ isLoggedIn }: BalanceAreaProps) {
    const { sessionToken } = useSession();
    const [visible, setVisible] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [balance, setBalance] = useState<Balance>({ cash: 0, portfolio: 0, lockedFunds: 0, lockedUntil: null, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch balance data when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchBalance();
        }
    }, [isLoggedIn]);

    const fetchBalance = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/transactions/balance`, {
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
                    setBalance(data.balance);
                }
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh balance after transactions
    const refreshBalance = () => {
        fetchBalance();
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mx-2 md:mx-12 lg:mx-20 xl:mx-28 shadow-lg">
                <div className="text-left">
                    <h3 className="text-xl font-bold text-[#004B49] mb-4">Daily Flys for dynamic reward</h3>
                    <p className="text-gray-600">
                        Experience a new era of gaming excitement. Turn your time into tangible rewards through a system designed for daily engagement. Secure your position, take flights, and be rewarded for every second you're in the air.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mx-2 md:mx-12 lg:mx-20 xl:mx-28 shadow-lg">
            <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6 items-center">
                    <div className="text-left">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Total Wealth</p>
                        <p className="text-base font-bold text-gray-900">
                            {isLoading ? '...' : visible ? `$${balance.total.toFixed(2)}` : '****'}
                        </p>
                    </div>
                    <div className="flex justify-center">
                        {visible ? (
                            <Eye size={24} className="text-gray-600 cursor-pointer hover:text-gray-800" onClick={() => setVisible(false)} />
                        ) : (
                            <EyeOff size={24} className="text-gray-600 cursor-pointer hover:text-gray-800" onClick={() => setVisible(true)} />
                        )}
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide">Cash Wallet</p>
                        <p className="text-base font-bold text-gray-900">
                            {isLoading ? '...' : visible ? `$${balance.cash.toFixed(2)}` : '****'}
                        </p>
                    </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none"
                        style={{ verticalAlign: 'baseline' }}
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => setShowWithdrawalModal(true)}
                        className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none"
                        style={{ verticalAlign: 'baseline' }}
                    >
                        Withdraw
                    </button>
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="bg-[#DCEFEE]/30 text-[#004B49] px-6 py-2 rounded-lg text-xs hover:bg-[#DCEFEE]/50 transition border border-gray-300 leading-none"
                        style={{ verticalAlign: 'baseline' }}
                    >
                        Transfer
                    </button>
                </div>
            </div>

            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                onDepositSuccess={refreshBalance}
            />

            <WithdrawalModal
                isOpen={showWithdrawalModal}
                onClose={() => setShowWithdrawalModal(false)}
            />

            <TransferModal
                isOpen={showTransferModal}
                onClose={() => setShowTransferModal(false)}
            />
        </div>
    );
}

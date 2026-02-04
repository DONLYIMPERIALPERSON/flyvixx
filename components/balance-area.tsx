'use client';

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import DepositModal from "./deposit-modal";
import WithdrawalModal from "./withdrawal-modal";
import TransferModal from "./transfer-modal";

interface BalanceAreaProps {
    isLoggedIn: boolean;
}

export default function BalanceArea({ isLoggedIn }: BalanceAreaProps) {
    const [visible, setVisible] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

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
                        <p className="text-base font-bold text-gray-900">{visible ? '$12,345.67' : '****'}</p>
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
                        <p className="text-base font-bold text-gray-900">{visible ? '$1,234.56' : '****'}</p>
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

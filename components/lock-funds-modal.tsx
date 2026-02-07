'use client';

import { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface LockFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLockSuccess: () => void;
}

export default function LockFundsModal({ isOpen, onClose, onLockSuccess }: LockFundsModalProps) {
    const { sessionToken } = useSession();
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLockFunds = async () => {
        const lockAmount = parseFloat(amount);

        if (!lockAmount || lockAmount < 10) {
            setError('Minimum lock amount is $10');
            return;
        }

        if (lockAmount > 10000) {
            setError('Maximum lock amount is $10,000');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                setError('API URL not configured');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/transactions/lock-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ amount: lockAmount })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onClose();
                setTimeout(() => {
                    onLockSuccess();
                    setAmount('');
                }, 100);
            } else {
                setError(data.error || 'Failed to lock funds');
            }
        } catch (error) {
            console.error('Lock funds error:', error);
            setError('Failed to lock funds. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className="bg-white rounded-t-xl w-full max-w-md h-[85vh] transform transition-transform duration-300 flex flex-col relative translate-y-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Lock Funds in Portfolio</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Info Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3">
                            <Lock size={20} className="text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-800 mb-1">Portfolio Locking</h4>
                                <p className="text-sm text-blue-700">
                                    Lock your funds for 30 days to access exclusive portfolio features and earn higher rewards.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">Benefits:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>• Access to portfolio Fly mode</li>
                            <li>• Daily free flys</li>
                            <li>• No Risk Fly</li>
                        </ul>
                    </div>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Lock (USD)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-black"
                                placeholder="10.00"
                                min="10"
                                max="10000"
                                step="0.01"
                                inputMode="decimal"
                                autoComplete="off"
                                autoCapitalize="off"
                                style={{ fontSize: '16px' }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Minimum: $10 • Maximum: $10,000
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <AlertCircle size={16} className="text-red-600" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Important Terms:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Funds will be locked for exactly 30 days</li>
                            <li>• Cannot unlock early or withdraw locked funds</li>
                            <li>• Profits made during the lock period can be withdrawan instaly</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLockFunds}
                            disabled={isLoading || !amount}
                            className="flex-1 bg-[#FFD700] text-[#004B49] py-3 px-4 rounded-lg font-semibold hover:bg-[#E6C200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#004B49] border-t-transparent rounded-full animate-spin"></div>
                                    <span>Locking...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    <span>Lock Funds</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
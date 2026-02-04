'use client';

import { useState } from "react";
import { X, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const withdrawalMethods = {
    btc: {
        label: 'BTC',
        minAmount: 100,
        charge: '$5.00',
        isSet: true,
        type: 'crypto',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    usdt: {
        label: 'USDT',
        minAmount: 10,
        charge: '$2.00',
        isSet: true,
        type: 'crypto',
        address: 'TJ1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    bank: {
        label: 'Bank Transfer',
        minAmount: 50,
        charge: '$1.00',
        isSet: false,
        type: 'bank',
        accountName: 'John Doe',
        accountNumber: '****1234',
        bankName: 'First National Bank'
    }
};

export default function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('btc');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showOtpVerification, setShowOtpVerification] = useState(false);

    const currentMethod = withdrawalMethods[activeTab];

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawalAmount);
        if (!amount || amount < currentMethod.minAmount) {
            alert(`Minimum withdrawal amount is $${currentMethod.minAmount}`);
            return;
        }
        if (!currentMethod.isSet) {
            alert('Please set up this withdrawal method first');
            return;
        }
        setShowOtpVerification(true);
    };

    const handleOtpVerify = () => {
        if (otpCode === '123456') { // Mock OTP verification
            alert(`Withdrawal of $${withdrawalAmount} via ${currentMethod.label} initiated successfully!`);
            setShowOtpVerification(false);
            setWithdrawalAmount('');
            setOtpCode('');
            onClose();
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleCancel = () => {
        setShowOtpVerification(false);
        setOtpCode('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Withdraw Funds</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                    {Object.entries(withdrawalMethods).map(([key, method]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as 'btc' | 'usdt' | 'bank')}
                            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                activeTab === key
                                    ? 'text-[#004B49] border-b-2 border-[#004B49] bg-[#004B49]/5'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {showOtpVerification ? (
                        /* OTP Verification */
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Verify Withdrawal</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter the 6-digit code sent to your email to confirm withdrawal of ${withdrawalAmount}
                                </p>
                            </div>

                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                style={{ fontSize: '16px' }}
                                maxLength={6}
                            />

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOtpVerify}
                                    className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                                >
                                    Confirm Withdrawal
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                Didn't receive code? <button className="text-[#004B49] underline">Resend</button>
                            </p>
                        </div>
                    ) : (
                        /* Withdrawal Form */
                        <div className="space-y-4">
                            {/* Method Status */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Method Status:</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    currentMethod.isSet ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {currentMethod.isSet ? 'METHOD SET' : 'METHOD NOT SET'}
                                </span>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Withdrawal Amount ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder={`Min. $${currentMethod.minAmount}`}
                                    value={withdrawalAmount}
                                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min={currentMethod.minAmount}
                                    disabled={!currentMethod.isSet}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum withdrawal: ${currentMethod.minAmount}
                                </p>
                            </div>

                            {/* Charge Display */}
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800">Withdrawal Charge:</span>
                                    <span className="text-sm font-bold text-blue-800">{currentMethod.charge}</span>
                                </div>
                            </div>

                            {/* Method Details */}
                            {currentMethod.isSet && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Withdrawal Details:</h5>
                                    {currentMethod.type === 'crypto' && 'address' in currentMethod && (
                                        <p className="text-sm font-mono text-black break-all">{currentMethod.address}</p>
                                    )}
                                    {currentMethod.type === 'bank' && 'accountName' in currentMethod && (
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium">Account:</span> {currentMethod.accountName}</p>
                                            <p><span className="font-medium">Number:</span> {currentMethod.accountNumber}</p>
                                            <p><span className="font-medium">Bank:</span> {currentMethod.bankName}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Withdraw Button */}
                            <button
                                onClick={handleWithdraw}
                                disabled={!currentMethod.isSet || !withdrawalAmount || parseFloat(withdrawalAmount) < currentMethod.minAmount}
                                className="w-full bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Withdraw Funds
                            </button>

                            {/* Warning */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Important:</p>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            You must withdraw via the method you deposited with. Contact support if you need to change your withdrawal method.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
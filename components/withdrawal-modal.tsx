'use client';

import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PayoutDetails {
    btc?: { btcAddress?: string };
    usdt?: { usdtAddress?: string };
    bank?: { accountName?: string; accountNumber?: string; bankName?: string };
}

const withdrawalMethodsConfig = {
    bank: {
        label: 'Bank Transfer',
        minAmount: 10,
        charge: 1.00,
        type: 'bank' as const
    },
    btc: {
        label: 'BTC',
        minAmount: 10,
        charge: 5.00,
        type: 'crypto' as const
    },
    usdt: {
        label: 'USDT',
        minAmount: 10,
        charge: 2.00,
        type: 'crypto' as const
    }
};

export default function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
    const { sessionToken } = useSession();
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('bank');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [payoutDetails, setPayoutDetails] = useState<PayoutDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch payout details when modal opens
    useEffect(() => {
        if (isOpen && !payoutDetails) {
            fetchPayoutDetails();
        }
    }, [isOpen, payoutDetails]);

    const fetchPayoutDetails = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
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
                    setPayoutDetails(data.user.payoutDetails);
                }
            }
        } catch (error) {
            console.error('Failed to fetch payout details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isMethodSet = (method: 'btc' | 'usdt' | 'bank'): boolean => {
        if (!payoutDetails) return false;

        switch (method) {
            case 'btc':
                return !!(payoutDetails.btc?.btcAddress);
            case 'usdt':
                return !!(payoutDetails.usdt?.usdtAddress);
            case 'bank':
                return !!(payoutDetails.bank?.accountName && payoutDetails.bank?.accountNumber && payoutDetails.bank?.bankName);
            default:
                return false;
        }
    };

    const handleTabChange = (method: 'btc' | 'usdt' | 'bank') => {
        setActiveTab(method);
        setWithdrawalAmount(''); // Reset amount when changing tabs
        setErrorMessage(null); // Clear any previous error messages
    };

    const currentMethod = {
        ...withdrawalMethodsConfig[activeTab],
        isSet: isMethodSet(activeTab)
    };

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
        // Send OTP first, then show verification screen
        sendOTP();
    };

    const sendOTP = async () => {
        try {
            setIsSendingOtp(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/otp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setShowOtpVerification(true);
            } else {
                alert(data.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('OTP send error:', error);
            alert('Failed to send OTP. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const processWithdrawal = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            console.log('🔄 Starting withdrawal process...');
            console.log('📡 API Base URL:', apiBaseUrl);
            console.log('💰 Withdrawal amount:', withdrawalAmount);
            console.log('🏦 Withdrawal method:', activeTab);

            // Prepare request body - backend now handles fresh name enquiry automatically
            const requestBody = {
                amount: parseFloat(withdrawalAmount),
                method: activeTab
            };

            console.log('📦 Request body:', requestBody);
            console.log('🌐 Full API URL:', `${apiBaseUrl}/api/safehaven/transfer`);

            const response = await fetch(`${apiBaseUrl}/api/safehaven/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            console.log('📨 Response status:', response.status);
            console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('📨 Response data:', data);

            if (data.success) {
                console.log('✅ Withdrawal successful!');
                alert(`Withdrawal of $${withdrawalAmount} via ${currentMethod.label} initiated successfully!`);
                return true;
            } else {
                console.error('❌ Withdrawal failed with error:', data.error);
                alert(data.error || 'Withdrawal failed');
                return false;
            }
        } catch (error) {
            console.error('💥 Withdrawal network error:', error);
            console.error('💥 Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            alert('Failed to process withdrawal. Please try again.');
            return false;
        }
    };

    const handleOtpVerify = async () => {
        try {
            setIsVerifyingOtp(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ code: otpCode })
            });

            const data = await response.json();

            if (data.success) {
                // OTP verified, proceed with withdrawal
                const success = await processWithdrawal();
                if (success) {
                    setShowOtpVerification(false);
                    setWithdrawalAmount('');
                    setOtpCode('');
                    onClose();
                }
            } else {
                alert(data.error || 'Invalid OTP code');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            alert('Failed to verify OTP. Please try again.');
        } finally {
            setIsVerifyingOtp(false);
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

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
                        <div className="flex items-start space-x-2">
                            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                    {Object.entries(withdrawalMethodsConfig).map(([key, method]) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key as 'btc' | 'usdt' | 'bank')}
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
                                    disabled={isVerifyingOtp}
                                    className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isVerifyingOtp ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Withdrawal'
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                Didn't receive code? <button className="text-[#004B49] underline">Resend</button>
                            </p>
                        </div>
                    ) : activeTab === 'btc' || activeTab === 'usdt' ? (
                        /* Crypto Withdrawals Not Available */
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${activeTab === 'btc' ? 'bg-orange-500' : 'bg-green-500'}`}>
                                    <span className="text-2xl font-bold text-white">
                                        {activeTab === 'btc' ? '₿' : '₮'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{currentMethod.label} Withdrawals</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Currently not available
                                </p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-sm text-gray-700">
                                    {currentMethod.label} withdrawals are temporarily unavailable. Please use Bank Transfer for withdrawals at this time.
                                </p>
                            </div>
                        </div>
                    ) : !currentMethod.isSet ? (
                        /* Method Not Set Warning */
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <AlertCircle size={64} className="text-gray-400" />
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{currentMethod.label} Not Configured</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    You need to add your {currentMethod.label.toLowerCase()} details in your profile before you can withdraw using this method.
                                </p>
                                <button
                                    onClick={() => {
                                        // Could navigate to profile/payout details, but for now just show message
                                        alert('Please go to Profile > Payout Details to add your withdrawal methods.');
                                    }}
                                    className="bg-[#004B49] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                                >
                                    Go to Payout Details
                                </button>
                            </div>
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
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum withdrawal: ${currentMethod.minAmount}
                                </p>
                            </div>

                            {/* Charge Display */}
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-800">Withdrawal Charge:</span>
                                    <span className="text-sm font-bold text-blue-800">${currentMethod.charge}</span>
                                </div>
                            </div>

                            {/* Method Details */}
                            {currentMethod.isSet && payoutDetails && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Withdrawal Details:</h5>
                                    {activeTab === 'btc' && (payoutDetails as any).btc?.btcAddress && (
                                        <p className="text-sm font-mono text-black break-all">{(payoutDetails as any).btc.btcAddress}</p>
                                    )}
                                    {activeTab === 'usdt' && (payoutDetails as any).usdt?.usdtAddress && (
                                        <p className="text-sm font-mono text-black break-all">{(payoutDetails as any).usdt.usdtAddress}</p>
                                    )}
                                    {activeTab === 'bank' && (payoutDetails as any).bank && (
                                        <div className="space-y-1 text-sm text-black">
                                            <p><span className="font-medium">Account:</span> {(payoutDetails as any).bank.accountName}</p>
                                            <p><span className="font-medium">Number:</span> {(payoutDetails as any).bank.accountNumber}</p>
                                            <p><span className="font-medium">Bank:</span> {(payoutDetails as any).bank.bankName}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Withdraw Button */}
                            <button
                                onClick={handleWithdraw}
                                disabled={!withdrawalAmount || parseFloat(withdrawalAmount) < currentMethod.minAmount || isSendingOtp}
                                className="w-full bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Withdraw Funds'
                                )}
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
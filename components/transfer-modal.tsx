'use client';

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
    const { sessionToken } = useSession();
    const [transferAmount, setTransferAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleTransfer = async () => {
        const amount = parseFloat(transferAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid transfer amount');
            return;
        }
        if (amount < 1) {
            alert('Minimum transfer amount is $1');
            return;
        }
        if (!recipientEmail || !recipientEmail.includes('@')) {
            alert('Please enter a valid recipient email');
            return;
        }

        try {
            setIsSendingOtp(true);
            setErrorMessage(null);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            // Send OTP first
            const otpResponse = await fetch(`${apiBaseUrl}/api/otp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            const otpData = await otpResponse.json();

            if (otpData.success) {
                setShowOtpVerification(true);
            } else {
                alert(otpData.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('OTP send error:', error);
            alert('Failed to send OTP. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpVerify = async () => {
        try {
            setIsProcessing(true);
            setErrorMessage(null);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            // Verify OTP
            const verifyResponse = await fetch(`${apiBaseUrl}/api/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ code: otpCode })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
                // OTP verified, proceed with transfer
                const transferResponse = await fetch(`${apiBaseUrl}/api/transactions/transfer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        amount: parseFloat(transferAmount),
                        recipientEmail: recipientEmail
                    })
                });

                const transferData = await transferResponse.json();

                if (transferData.success) {
                    alert(`Transfer of $${transferAmount} to ${recipientEmail} completed successfully!`);
                    setShowOtpVerification(false);
                    setTransferAmount('');
                    setRecipientEmail('');
                    setOtpCode('');
                    onClose();
                } else {
                    setErrorMessage(transferData.error || 'Transfer failed');
                }
            } else {
                setErrorMessage(verifyData.error || 'Invalid OTP code');
            }
        } catch (error) {
            console.error('Transfer error:', error);
            setErrorMessage('Failed to process transfer. Please try again.');
        } finally {
            setIsProcessing(false);
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
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[70vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Transfer Funds</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {showOtpVerification ? (
                        /* OTP Verification */
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Verify Transfer</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter the 6-digit code sent to your email to confirm transfer of ${transferAmount} to {recipientEmail}
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
                                    disabled={isProcessing}
                                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleOtpVerify}
                                    disabled={isProcessing}
                                    className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Transfer'
                                    )}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                Didn't receive code? <button className="text-[#004B49] underline">Resend</button>
                            </p>
                        </div>
                    ) : (
                        /* Transfer Form */
                        <div className="space-y-4">
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Transfer to User</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Send funds directly to another user's account
                                </p>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transfer Amount ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min="1"
                                />
                            </div>

                            {/* Recipient Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter recipient's email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>

                            {/* Transfer Button */}
                            <button
                                onClick={handleTransfer}
                                disabled={!transferAmount || !recipientEmail || isSendingOtp}
                                className="w-full bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Transfer Funds'
                                )}
                            </button>

                            {/* Warning */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Ensure the recipient email is correct</li>
                                            <li>• Transfers are irreversible</li>
                                            <li>• Both users will receive email notifications</li>
                                        </ul>
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
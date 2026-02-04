'use client';

import { useState } from "react";
import { X, Edit2, Save, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface PayoutDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PayoutMethod {
    type: 'btc' | 'usdt' | 'bank';
    label: string;
    btcAddress?: string;
    usdtAddress?: string;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
}

const initialPayoutMethods: PayoutMethod[] = [
    {
        type: 'btc',
        label: 'BTC',
        btcAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
        type: 'usdt',
        label: 'USDT (TRC20)',
        usdtAddress: 'TJ1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
        type: 'bank',
        label: 'Bank Transfer',
        accountName: 'John Doe',
        accountNumber: '****1234',
        bankName: 'First National Bank'
    }
];

export default function PayoutDetailsModal({ isOpen, onClose }: PayoutDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('btc');
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(initialPayoutMethods);
    const [editedMethod, setEditedMethod] = useState<PayoutMethod | null>(null);

    const currentMethod = payoutMethods.find(method => method.type === activeTab) || payoutMethods[0];

    const handleEdit = () => {
        setIsEditing(true);
        setEditedMethod({ ...currentMethod });
    };

    const handleSave = () => {
        setShowOtpVerification(true);
    };

    const handleOtpVerify = () => {
        if (otpCode === '123456') { // Mock OTP verification
            if (editedMethod) {
                setPayoutMethods(prev =>
                    prev.map(method =>
                        method.type === activeTab ? editedMethod : method
                    )
                );
            }
            setIsEditing(false);
            setShowOtpVerification(false);
            setEditedMethod(null);
            setOtpCode('');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedMethod(null);
        setShowOtpVerification(false);
        setOtpCode('');
    };

    const updateField = (field: keyof PayoutMethod, value: string) => {
        if (editedMethod) {
            setEditedMethod(prev => ({ ...prev, [field]: value } as PayoutMethod));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Payout Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                    {payoutMethods.map((method) => (
                        <button
                            key={method.type}
                            onClick={() => {
                                setActiveTab(method.type);
                                setIsEditing(false);
                                setShowOtpVerification(false);
                                setEditedMethod(null);
                            }}
                            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                activeTab === method.type
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Verify Changes</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter the 6-digit code sent to your email to confirm changes
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
                                    Verify & Save
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center">
                                Didn't receive code? <button className="text-[#004B49] underline">Resend</button>
                            </p>
                        </div>
                    ) : (
                        /* Payout Method Details */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">{currentMethod.label} Details</h4>
                                {!isEditing && (
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center space-x-2 text-[#004B49] hover:text-[#00695C] transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                )}
                            </div>

                            {currentMethod.type === 'btc' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            BTC Wallet Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedMethod?.btcAddress || ''}
                                                onChange={(e) => updateField('btcAddress', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                style={{ fontSize: '16px' }}
                                                placeholder="Enter BTC wallet address"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-mono text-sm text-black break-all">{currentMethod.btcAddress}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentMethod.type === 'usdt' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            USDT (TRC20) Wallet Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedMethod?.usdtAddress || ''}
                                                onChange={(e) => updateField('usdtAddress', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                style={{ fontSize: '16px' }}
                                                placeholder="Enter USDT wallet address"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-mono text-sm text-black break-all">{currentMethod.usdtAddress}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-800">
                                            <AlertCircle size={14} className="inline mr-1" />
                                            Only TRC20 network addresses are supported
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentMethod.type === 'bank' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedMethod?.accountName || ''}
                                                onChange={(e) => updateField('accountName', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                style={{ fontSize: '16px' }}
                                                placeholder="Enter account name"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black">{currentMethod.accountName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedMethod?.accountNumber || ''}
                                                onChange={(e) => updateField('accountNumber', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                style={{ fontSize: '16px' }}
                                                placeholder="Enter account number"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black font-mono">{currentMethod.accountNumber}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedMethod?.bankName || ''}
                                                onChange={(e) => updateField('bankName', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                style={{ fontSize: '16px' }}
                                                placeholder="Enter bank name"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black">{currentMethod.bankName}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isEditing && !showOtpVerification && (
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
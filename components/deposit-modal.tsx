'use client';

import { useState } from "react";
import { X, Copy, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const depositAddresses = {
    btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    usdt: 'TJ1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
};

const bankDetails = {
    accountName: 'FlyVixx Gaming Ltd',
    accountNumber: '1234567890',
    bankName: 'First Bank of Nigeria',
    expiresIn: 30 // minutes
};

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('btc');
    const [depositAmount, setDepositAmount] = useState('');
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleTopUp = () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        setShowBankDetails(true);
    };

    const resetBankDeposit = () => {
        setDepositAmount('');
        setShowBankDetails(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[85vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Deposit Funds</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 flex-shrink-0">
                    {[
                        { key: 'btc', label: 'BTC' },
                        { key: 'usdt', label: 'USDT' },
                        { key: 'bank', label: 'Bank Transfer' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key as 'btc' | 'usdt' | 'bank');
                                resetBankDeposit();
                            }}
                            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'text-[#004B49] border-b-2 border-[#004B49] bg-[#004B49]/5'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'btc' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₿</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Deposit BTC</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Send BTC to the address below. Deposits usually reflect within 10 minutes.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    BTC Deposit Address
                                </label>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 font-mono text-sm bg-white p-3 rounded border break-all text-black">
                                        {depositAddresses.btc}
                                    </code>
                                    <button
                                        onClick={() => handleCopyAddress(depositAddresses.btc)}
                                        className="p-3 bg-[#004B49] text-white rounded-lg hover:bg-[#00695C] transition-colors"
                                    >
                                        {copiedAddress === depositAddresses.btc ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>
                                {copiedAddress === depositAddresses.btc && (
                                    <p className="text-xs text-green-600 mt-2">Address copied to clipboard!</p>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Send only BTC to this address</li>
                                            <li>• Minimum deposit: 0.0001 BTC</li>
                                            <li>• Deposits below minimum may be lost</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usdt' && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₮</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Deposit USDT</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Send USDT (TRC20) to the address below. Deposits usually reflect within 5 minutes.
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    USDT (TRC20) Deposit Address
                                </label>
                                <div className="flex items-center space-x-2">
                                    <code className="flex-1 font-mono text-sm bg-white p-3 rounded border break-all text-black">
                                        {depositAddresses.usdt}
                                    </code>
                                    <button
                                        onClick={() => handleCopyAddress(depositAddresses.usdt)}
                                        className="p-3 bg-[#004B49] text-white rounded-lg hover:bg-[#00695C] transition-colors"
                                    >
                                        {copiedAddress === depositAddresses.usdt ? (
                                            <CheckCircle size={16} />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>
                                {copiedAddress === depositAddresses.usdt && (
                                    <p className="text-xs text-green-600 mt-2">Address copied to clipboard!</p>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Send only USDT (TRC20) to this address</li>
                                            <li>• Minimum deposit: 10 USDT</li>
                                            <li>• Use TRC20 network only</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bank' && !showBankDetails && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-[#004B49] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl text-white">₦</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Bank Transfer</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Deposit directly from your bank account. Fast and secure.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Deposit ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount (min. $1)"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min="1"
                                />
                            </div>

                            <button
                                onClick={handleTopUp}
                                className="w-full bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                            >
                                Top Up Now
                            </button>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Enter the amount in USD and click "Top Up Now"</li>
                                            <li>• You will get a temporary NGN account (expires in 30 mins)</li>
                                            <li>• Transfer the exact NGN amount shown</li>
                                            <li>• Deposits reflect within 10 minutes</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'bank' && showBankDetails && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Transfer Details</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Transfer exactly <span className="font-bold text-[#004B49]">₦{(parseFloat(depositAmount) * 1450).toLocaleString()}</span> to the account below
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Name
                                    </label>
                                    <p className="text-black font-medium">{bankDetails.accountName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Number
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-black font-mono font-medium">{bankDetails.accountNumber}</p>
                                        <button
                                            onClick={() => handleCopyAddress(bankDetails.accountNumber)}
                                            className="p-2 bg-[#004B49] text-white rounded hover:bg-[#00695C] transition-colors"
                                        >
                                            {copiedAddress === bankDetails.accountNumber ? (
                                                <CheckCircle size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bank Name
                                    </label>
                                    <p className="text-black font-medium">{bankDetails.bankName}</p>
                                </div>

                                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                                    <Clock size={16} className="text-orange-500" />
                                    <p className="text-sm text-orange-700">
                                        Expires in {bankDetails.expiresIn} minutes
                                    </p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Important:</p>
                                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                            <li>• Transfer the exact amount: ₦{(parseFloat(depositAmount) * 1450).toLocaleString()}</li>
                                            <li>• Use the account details above only</li>
                                            <li>• Account expires in 30 minutes</li>
                                            <li>• Contact support if payment doesn't reflect</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={resetBankDeposit}
                                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Change Amount
                                </button>
                                <button
                                    onClick={() => {
                                        resetBankDeposit();
                                        onClose();
                                    }}
                                    className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
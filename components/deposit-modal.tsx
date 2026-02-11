'use client';

import { useState, useEffect } from "react";
import { X, Copy, CheckCircle, AlertCircle, Clock, Loader2, QrCode } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDepositSuccess?: () => void;
}



const bankDetails = {
    accountName: 'FlyVixx Gaming Ltd',
    accountNumber: '1234567890',
    bankName: 'First Bank of Nigeria',
    expiresIn: 30 // minutes
};

// Exchange rate: 1500 NGN per USD (our system rate)
const EXCHANGE_RATE = 1500;

interface VirtualAccount {
    accountNumber: string;
    accountName: string;
    bankCode: string;
    expiryDate: string;
}

interface CryptoRate {
    symbol: string;
    price: number;
    timestamp: number;
}

interface CryptoDepositDetails {
    walletAddress: string;
    cryptoAmount: number;
    usdAmount: number;
    expirationTime: Date;
    qrCodeUrl: string;
}

export default function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
    const { sessionToken } = useSession();
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('bank');
    const [depositAmount, setDepositAmount] = useState('');
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);

    // Crypto deposit states
    const [btcRate, setBtcRate] = useState<CryptoRate | null>(null);
    const [cryptoDepositDetails, setCryptoDepositDetails] = useState<CryptoDepositDetails | null>(null);
    const [cryptoDepositSubmitted, setCryptoDepositSubmitted] = useState(false);
    const [isCalculatingRate, setIsCalculatingRate] = useState(false);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleTopUp = async () => {
        const amount = parseFloat(depositAmount);
        if (!amount || amount < 5) {
            alert('Minimum deposit amount is $5');
            return;
        }

        try {
            setIsProcessing(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/safehaven/virtual-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ amount })
            });

            const data = await response.json();

            if (data.success && data.data) {
                setVirtualAccount({
                    accountNumber: data.data.accountNumber,
                    accountName: data.data.accountName,
                    bankCode: data.data.bankCode,
                    expiryDate: data.data.expiryDate
                });
                setShowBankDetails(true);
            } else {
                alert('Failed to create virtual account: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Virtual account creation error:', error);
            alert('Failed to create virtual account. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetBankDeposit = () => {
        setDepositAmount('');
        setShowBankDetails(false);
        setVirtualAccount(null);
    };

    // Fetch BTC rate on mount
    useEffect(() => {
        if (isOpen && (activeTab === 'btc' || activeTab === 'usdt')) {
            fetchBtcRate();
        }
    }, [isOpen, activeTab]);

    const fetchBtcRate = async () => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/api/crypto/rate?symbol=BTCUSDT`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setBtcRate(data.rate);
                }
            }
        } catch (error) {
            console.error('Failed to fetch BTC rate:', error);
        }
    };

    const calculateCryptoDeposit = async () => {
        const usdAmount = parseFloat(depositAmount);
        if (isNaN(usdAmount) || usdAmount <= 0) return;

        setIsCalculatingRate(true);

        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/api/crypto/deposit-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    usdAmount,
                    cryptoType: activeTab
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to get deposit details');
            }

            setCryptoDepositDetails({
                walletAddress: data.data.walletAddress,
                cryptoAmount: data.data.cryptoAmount,
                usdAmount: data.data.usdAmount,
                expirationTime: new Date(data.data.expirationTime),
                qrCodeUrl: data.data.qrCodeUrl
            });
        } catch (error) {
            console.error('Error calculating crypto deposit:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Unable to get deposit details: ${errorMessage}. Please try again.`);
        } finally {
            setIsCalculatingRate(false);
        }
    };

    const handleCryptoDepositSubmit = async () => {
        if (!cryptoDepositDetails) return;

        setIsProcessing(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/api/transactions/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    type: activeTab.toLowerCase(),
                    usdAmount: cryptoDepositDetails.usdAmount,
                    cryptoAmount: cryptoDepositDetails.cryptoAmount,
                    walletAddress: cryptoDepositDetails.walletAddress
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCryptoDepositSubmitted(true);
                    onDepositSuccess?.();
                }
            }
        } catch (error) {
            console.error('Failed to submit crypto deposit:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetCryptoDeposit = () => {
        setDepositAmount('');
        setCryptoDepositDetails(null);
        setCryptoDepositSubmitted(false);
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
                        { key: 'bank', label: 'Bank Transfer' },
                        { key: 'btc', label: 'BTC' },
                        { key: 'usdt', label: 'USDT' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveTab(tab.key as 'btc' | 'usdt' | 'bank');
                                resetBankDeposit();
                                resetCryptoDeposit();
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
                    {activeTab === 'btc' && !cryptoDepositDetails && !cryptoDepositSubmitted && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₿</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">BTC Deposit</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Deposit Bitcoin directly to your account. Fast and secure.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Deposit ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount (min. $10)"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min="10"
                                />
                                {btcRate && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        1 BTC = ${btcRate.price.toFixed(2)}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={calculateCryptoDeposit}
                                disabled={!depositAmount || parseFloat(depositAmount) < 10 || isCalculatingRate}
                                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isCalculatingRate ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    'Proceed'
                                )}
                            </button>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Enter the amount in USD and click "Proceed"</li>
                                            <li>• You will get BTC amount and wallet address</li>
                                            <li>• Send the exact BTC amount to the address shown</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'btc' && cryptoDepositDetails && !cryptoDepositSubmitted && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₿</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">BTC Payment Details</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Send exactly <span className="font-bold text-black">{cryptoDepositDetails.cryptoAmount.toFixed(8)} BTC</span> to the address below
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-black">USD Amount:</span>
                                    <span className="font-bold text-lg text-black">${cryptoDepositDetails.usdAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-black">BTC Amount:</span>
                                    <span className="font-bold text-lg text-black">{cryptoDepositDetails.cryptoAmount.toFixed(8)} BTC</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                    <img
                                        src={cryptoDepositDetails.qrCodeUrl}
                                        alt="BTC Payment QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-600">Scan QR code to pay</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={cryptoDepositDetails.walletAddress}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => handleCopyAddress(cryptoDepositDetails.walletAddress)}
                                        className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                                    >
                                        {copiedAddress === cryptoDepositDetails.walletAddress ? (
                                            <CheckCircle size={14} />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-orange-600">
                                <Clock size={16} />
                                <span>Expires in 3 hours</span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCryptoDepositSubmit}
                                    disabled={isProcessing}
                                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            <span>I Have Paid</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setCryptoDepositDetails(null)}
                                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'btc' && cryptoDepositSubmitted && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">BTC Deposit Submitted!</h3>
                                <p className="text-gray-600">
                                    Your BTC deposit request has been submitted for review.
                                    You will receive an email confirmation once it's processed.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    resetCryptoDeposit();
                                    onClose();
                                }}
                                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {activeTab === 'usdt' && !cryptoDepositDetails && !cryptoDepositSubmitted && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₮</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">USDT Deposit</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Deposit Tether directly to your account. Fast and secure.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount to Deposit ($)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter amount (min. $10)"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min="10"
                                />
                                <div className="mt-2 text-sm text-gray-600">
                                    1 USDT = $1.00 (Fixed rate)
                                </div>
                            </div>

                            <button
                                onClick={calculateCryptoDeposit}
                                disabled={!depositAmount || parseFloat(depositAmount) < 10 || isCalculatingRate}
                                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isCalculatingRate ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    'Proceed'
                                )}
                            </button>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-black font-medium">Important:</p>
                                        <ul className="text-sm text-black mt-1 space-y-1">
                                            <li>• Enter the amount in USD and click "Proceed"</li>
                                            <li>• You will get USDT amount and wallet address</li>
                                            <li>• Send the exact USDT amount to the address shown</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usdt' && cryptoDepositDetails && !cryptoDepositSubmitted && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl font-bold text-white">₮</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">USDT Payment Details</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Send exactly <span className="font-bold text-black">{cryptoDepositDetails.cryptoAmount.toFixed(2)} USDT</span> to the address below
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-black">USD Amount:</span>
                                    <span className="font-bold text-lg text-black">${cryptoDepositDetails.usdAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-black">USDT Amount:</span>
                                    <span className="font-bold text-lg text-black">{cryptoDepositDetails.cryptoAmount.toFixed(2)} USDT</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                    <img
                                        src={cryptoDepositDetails.qrCodeUrl}
                                        alt="USDT Payment QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-600">Scan QR code to pay</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={cryptoDepositDetails.walletAddress}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => handleCopyAddress(cryptoDepositDetails.walletAddress)}
                                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        {copiedAddress === cryptoDepositDetails.walletAddress ? (
                                            <CheckCircle size={14} />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-orange-600">
                                <Clock size={16} />
                                <span>Expires in 3 hours</span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCryptoDepositSubmit}
                                    disabled={isProcessing}
                                    className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            <span>I Have Paid</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setCryptoDepositDetails(null)}
                                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'usdt' && cryptoDepositSubmitted && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">USDT Deposit Submitted!</h3>
                                <p className="text-gray-600">
                                    Your USDT deposit request has been submitted for review.
                                    You will receive an email confirmation once it's processed.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    resetCryptoDeposit();
                                    onClose();
                                }}
                                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors"
                            >
                                Done
                            </button>
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
                                    placeholder="Enter amount (min. $5)"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                    min="5"
                                />
                            </div>

                            <button
                                onClick={handleTopUp}
                                disabled={isProcessing}
                                className="w-full bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Top Up Now'
                                )}
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

                    {activeTab === 'bank' && showBankDetails && virtualAccount && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Transfer Details</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Transfer exactly <span className="font-bold text-[#004B49]">₦{(parseFloat(depositAmount) * EXCHANGE_RATE).toLocaleString()}</span> to the account below
                                </p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Name
                                    </label>
                                    <p className="text-black font-medium">{virtualAccount.accountName}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Number
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-black font-mono font-medium">{virtualAccount.accountNumber}</p>
                                        <button
                                            onClick={() => handleCopyAddress(virtualAccount.accountNumber)}
                                            className="p-2 bg-[#004B49] text-white rounded hover:bg-[#00695C] transition-colors"
                                        >
                                            {copiedAddress === virtualAccount.accountNumber ? (
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
                                    <p className="text-black font-medium">SAFE HAVEN MICROFINANCE BANK</p>
                                </div>

                                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                                    <Clock size={16} className="text-orange-500" />
                                    <p className="text-sm text-orange-700">
                                        Expires: {new Date(virtualAccount.expiryDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Important:</p>
                                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                                            <li>• Transfer the exact amount: ₦{(parseFloat(depositAmount) * EXCHANGE_RATE).toLocaleString()}</li>
                                            <li>• Use the account details above only</li>
                                            <li>• Account expires at the time shown above</li>
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
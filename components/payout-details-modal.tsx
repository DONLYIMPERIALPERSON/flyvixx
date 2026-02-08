'use client';

import { useState, useEffect } from "react";
import { X, Edit2, Save, CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@descope/react-sdk";
import { useAuth } from "./login-modal";
import { sortedBanks, Bank } from "../data/banks";
import { useToast } from "./toast-notification";

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
    nameEnquiryReference?: string;
}

const emptyPayoutMethods: PayoutMethod[] = [
    {
        type: 'bank',
        label: 'Bank Transfer',
        accountName: '',
        accountNumber: '',
        bankName: ''
    },
    {
        type: 'btc',
        label: 'BTC',
        btcAddress: ''
    },
    {
        type: 'usdt',
        label: 'USDT (TRC20)',
        usdtAddress: ''
    }
];

export default function PayoutDetailsModal({ isOpen, onClose }: PayoutDetailsModalProps) {
    const { sessionToken } = useSession();
    const { isAuthenticated } = useAuth();
    const { showSuccess, showError, showWarning, showInfo, ToastManager } = useToast();
    const [activeTab, setActiveTab] = useState<'btc' | 'usdt' | 'bank'>('bank');
    const [isEditing, setIsEditing] = useState(false);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>(emptyPayoutMethods);
    const [editedMethod, setEditedMethod] = useState<PayoutMethod | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [isEnquiringName, setIsEnquiringName] = useState(false);
    const [bankSearchTerm, setBankSearchTerm] = useState('');
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
    const [nameEnquiryError, setNameEnquiryError] = useState('');
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);

    const currentMethod = payoutMethods.find(method => method.type === activeTab) || payoutMethods[0];

    // Check if current method is configured
    const isMethodConfigured = (method: PayoutMethod): boolean => {
        switch (method.type) {
            case 'btc':
                return !!(method.btcAddress && method.btcAddress.trim() !== '');
            case 'usdt':
                return !!(method.usdtAddress && method.usdtAddress.trim() !== '');
            case 'bank':
                return !!(method.accountName && method.accountNumber && method.bankName &&
                         method.accountName.trim() !== '' && method.accountNumber.trim() !== '' && method.bankName.trim() !== '');
            default:
                return false;
        }
    };

    const currentMethodConfigured = isMethodConfigured(currentMethod);

    // Load payout details from backend
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadPayoutDetails();
        }
    }, [isOpen, isAuthenticated]);

    const loadPayoutDetails = async () => {
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
                if (data.success && data.user.payoutDetails) {
                    // Convert backend format to frontend format
                    const payoutDetails = data.user.payoutDetails;
                    const methods: PayoutMethod[] = [
                        {
                            type: 'bank',
                            label: 'Bank Transfer',
                            accountName: payoutDetails.bank?.accountName || '',
                            accountNumber: payoutDetails.bank?.accountNumber || '',
                            bankName: payoutDetails.bank?.bankName || '',
                            nameEnquiryReference: payoutDetails.bank?.nameEnquiryReference || ''
                        },
                        {
                            type: 'btc',
                            label: 'BTC',
                            btcAddress: payoutDetails.btc?.btcAddress || ''
                        },
                        {
                            type: 'usdt',
                            label: 'USDT (TRC20)',
                            usdtAddress: payoutDetails.usdt?.usdtAddress || ''
                        }
                    ];
                    setPayoutMethods(methods);

                    // Set selectedBank if bank details exist
                    if (payoutDetails.bank?.bankName) {
                        const bank = sortedBanks.find(b => b.name === payoutDetails.bank.bankName);
                        if (bank) {
                            setSelectedBank(bank);
                            setBankSearchTerm(bank.name);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load payout details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const savePayoutDetails = async (methodsToUse?: PayoutMethod[]) => {
        try {
            setIsSaving(true);

            // Get current payout methods
            const methods = methodsToUse || payoutMethods;
            const btcMethod = methods.find(m => m.type === 'btc');
            const usdtMethod = methods.find(m => m.type === 'usdt');
            const bankMethod = methods.find(m => m.type === 'bank');

            // Convert frontend format to backend format - only include if fields are not empty
            const payoutDetails: any = {};

            if (btcMethod?.btcAddress && btcMethod.btcAddress.trim() !== '') {
                payoutDetails.btc = { btcAddress: btcMethod.btcAddress };
            }

            if (usdtMethod?.usdtAddress && usdtMethod.usdtAddress.trim() !== '') {
                payoutDetails.usdt = { usdtAddress: usdtMethod.usdtAddress };
            }

            if (bankMethod?.accountName && bankMethod.accountName.trim() !== '' &&
                bankMethod?.accountNumber && bankMethod.accountNumber.trim() !== '' &&
                bankMethod?.bankName && bankMethod.bankName.trim() !== '') {
                payoutDetails.bank = {
                    accountName: bankMethod.accountName,
                    accountNumber: bankMethod.accountNumber,
                    bankName: bankMethod.bankName
                };
                // Include nameEnquiryReference if available
                if (bankMethod.nameEnquiryReference) {
                    payoutDetails.bank.nameEnquiryReference = bankMethod.nameEnquiryReference;
                }
            }

            console.log('Saving payout details:', JSON.stringify(payoutDetails, null, 2));

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ payoutDetails })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Payout details saved successfully');
                    return true;
                }
            }
            console.error('Failed to save payout details - response not ok');
            return false;
        } catch (error) {
            console.error('Failed to save payout details:', error);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdd = () => {
        setIsEditing(true);
        setEditedMethod({ ...currentMethod });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedMethod({ ...currentMethod });
    };

    const handleRemove = async () => {
        // Remove the payout method without OTP verification
        const confirmRemove = window.confirm(`Are you sure you want to remove your ${currentMethod.label} payout method?`);
        if (!confirmRemove) return;

        // Clear the method data
        const clearedMethod = { ...currentMethod };
        switch (currentMethod.type) {
            case 'btc':
                clearedMethod.btcAddress = '';
                break;
            case 'usdt':
                clearedMethod.usdtAddress = '';
                break;
            case 'bank':
                clearedMethod.accountName = '';
                clearedMethod.accountNumber = '';
                clearedMethod.bankName = '';
                break;
        }

        // Calculate new payout methods
        const newPayoutMethods = payoutMethods.map(method =>
            method.type === activeTab ? clearedMethod : method
        );

        // Update local state
        setPayoutMethods(newPayoutMethods);

        // Save to backend with the new data
        const success = await savePayoutDetails(newPayoutMethods);
        if (success) {
            showSuccess(`${currentMethod.label} payout method removed successfully!`);
        } else {
            showError('Failed to remove payout method. Please try again.');
            // Revert local changes
            loadPayoutDetails();
        }
    };

    const handleSave = async () => {
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
                showError(data.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('OTP send error:', error);
            showError('Failed to send OTP. Please try again.');
        } finally {
            setIsSendingOtp(false);
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
                if (editedMethod) {
                    // Create updated methods array
                    const updatedMethods = payoutMethods.map(method =>
                        method.type === activeTab ? editedMethod : method
                    );

                    // Update local state first
                    setPayoutMethods(updatedMethods);

                    // Save to backend with the updated methods
                    const success = await savePayoutDetails(updatedMethods);
                    if (success) {
                        setIsEditing(false);
                        setShowOtpVerification(false);
                        setEditedMethod(null);
                        setOtpCode('');
                        // Reload payout details to reflect changes
                        loadPayoutDetails();
                        showSuccess('Payout details saved successfully!');
                    } else {
                        showError('Failed to save payout details. Please try again.');
                        // Revert local changes
                        loadPayoutDetails();
                    }
                }
            } else {
                showError(data.error || 'Invalid OTP code');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            showError('Failed to verify OTP. Please try again.');
        } finally {
            setIsVerifyingOtp(false);
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

    // Get OAuth2 access token from SafeHaven (now handled server-side)
    const getAccessToken = async (): Promise<string | null> => {
        try {
            // Use server-side API to get access token
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            const response = await fetch(`${apiBaseUrl}/api/safehaven/token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success && data.access_token) {
                // Set token expiry (assuming 40 minutes if not provided)
                const expiresIn = data.expires_in || (40 * 60); // Default to 40 minutes
                setAccessToken(data.access_token);
                setTokenExpiry(Date.now() + (expiresIn * 1000));
                return data.access_token;
            } else {
                console.error('Failed to get access token:', data);
                return null;
            }
        } catch (error) {
            console.error('OAuth2 token request failed:', error);
            return null;
        }
    };

    // Handle bank selection
    const handleBankSelect = (bank: Bank) => {
        setSelectedBank(bank);
        setBankSearchTerm(bank.name); // Set search term to selected bank name
        setIsBankDropdownOpen(false); // Close dropdown after selection
        if (editedMethod) {
            setEditedMethod(prev => ({ ...prev, bankName: bank.name } as PayoutMethod));
        }
    };

    // Handle account number change and trigger name enquiry
    const handleAccountNumberChange = async (value: string) => {
        console.log('Account number change:', value, 'selectedBank:', selectedBank, 'editedMethod:', !!editedMethod);
        updateField('accountNumber', value);
        setNameEnquiryError(''); // Clear any previous errors

        // Auto-enquire name if we have a valid account number and selected bank
        if (value.length >= 10 && selectedBank && editedMethod) {
            console.log('Triggering account verification for:', value, 'bank:', selectedBank.name);
            setIsEnquiringName(true);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

                // Use backend API instead of calling SafeHaven directly
                const response = await fetch(`${apiBaseUrl}/api/safehaven/verify-bank`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        bankCode: selectedBank.bankCode,
                        accountNumber: value
                    })
                });

                const data = await response.json();
                console.log('Verification response:', data);

                if (data.success && data.data?.data?.accountName) {
                    console.log('Account verified successfully:', data.data.data.accountName, 'sessionId:', data.data.sessionId);
                    // Auto-fill account name and save nameEnquiryReference
                    setEditedMethod(prev => ({
                        ...prev,
                        accountName: data.data.data.accountName,
                        nameEnquiryReference: data.data.sessionId // Save the sessionId for later use in transfers
                    } as PayoutMethod));
                    setNameEnquiryError(''); // Clear any errors
                } else {
                    // Show error message to user
                    const errorMessage = data.error || 'Account verification failed. Please check the account number and try again.';
                    setNameEnquiryError(errorMessage);
                    console.warn('Name enquiry failed:', data);
                }
            } catch (error) {
                // Show network error to user
                const errorMessage = 'Network error. Please check your connection and try again.';
                setNameEnquiryError(errorMessage);
                console.error('Name enquiry error:', error);
            } finally {
                setIsEnquiringName(false);
            }
        } else {
            console.log('Verification not triggered. Conditions:', {
                length: value.length >= 10,
                selectedBank: !!selectedBank,
                editedMethod: !!editedMethod
            });
        }
    };

    if (!isOpen) return null;

    return (
        <>
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
                                    disabled={isVerifyingOtp}
                                    className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isVerifyingOtp ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Save'
                                    )}
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
                                    currentMethodConfigured ? (
                                        <button
                                            onClick={handleRemove}
                                            disabled={isSaving}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X size={14} className="mr-1" />
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAdd}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-[#004B49] bg-[#004B49]/10 border border-[#004B49]/20 rounded-md hover:bg-[#004B49]/20 hover:border-[#004B49]/30 transition-colors"
                                        >
                                            <CreditCard size={14} className="mr-1" />
                                            Add
                                        </button>
                                    )
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
                                    {/* Bank Name - First */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Bank Name
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search for your bank..."
                                                    value={bankSearchTerm}
                                                    onChange={(e) => {
                                                        setBankSearchTerm(e.target.value);
                                                        setIsBankDropdownOpen(true); // Open dropdown when typing
                                                    }}
                                                    onFocus={() => setIsBankDropdownOpen(true)} // Open dropdown on focus
                                                    onBlur={() => {
                                                        // Close dropdown after a short delay to allow clicks on options
                                                        setTimeout(() => setIsBankDropdownOpen(false), 200);
                                                    }}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                                    style={{ fontSize: '16px' }}
                                                />
                                                {isBankDropdownOpen && bankSearchTerm && (
                                                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10 shadow-lg">
                                                        {sortedBanks
                                                            .filter(bank =>
                                                                bank.name.toLowerCase().includes(bankSearchTerm.toLowerCase())
                                                            )
                                                            .map((bank) => (
                                                                <button
                                                                    key={bank.bankCode}
                                                                    onClick={() => {
                                                                        handleBankSelect(bank);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-black"
                                                                >
                                                                    {bank.name}
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black">{currentMethod.bankName}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account Number - Second */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Number
                                        </label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={editedMethod?.accountNumber || ''}
                                                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black pr-10"
                                                    style={{ fontSize: '16px' }}
                                                    placeholder="Enter account number"
                                                    maxLength={10}
                                                />
                                                {isEnquiringName && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <Loader2 size={16} className="animate-spin text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black font-mono">{currentMethod.accountNumber}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account Name - Third (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Name
                                        </label>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={editedMethod?.accountName || ''}
                                                        readOnly
                                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                                        style={{ fontSize: '16px' }}
                                                        placeholder="Account Name"
                                                    />
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <CheckCircle size={16} />
                                                    </div>
                                                </div>
                                                {nameEnquiryError && (
                                                    <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded-lg">
                                                        <AlertCircle size={14} className="text-red-500 mr-2 flex-shrink-0" />
                                                        <p className="text-xs text-red-700">{nameEnquiryError}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-black">{currentMethod.accountName}</p>
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
                                disabled={isSendingOtp}
                                className="flex-1 bg-[#004B49] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <ToastManager />
    </>
    );
}




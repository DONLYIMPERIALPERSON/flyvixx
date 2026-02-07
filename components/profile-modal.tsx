'use client';

import { useState, useEffect } from "react";
import { X, Mail, CreditCard, AlertCircle, LogOut } from "lucide-react";
import { useSession } from "@descope/react-sdk";
import PayoutDetailsModal from "./payout-details-modal";
import { useAuth } from "./login-modal";

interface ProfileModalProps {
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

interface UserProfile {
    email: string;
    payoutMethods: PayoutMethod[];
    avatar?: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { isAuthenticated, logout } = useAuth();
    const { sessionToken } = useSession();
    const [profile, setProfile] = useState<UserProfile>({ email: '', payoutMethods: [] });
    const [showPayoutDetails, setShowPayoutDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load profile from backend
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadProfile();
        }
    }, [isOpen, isAuthenticated]);

    const loadProfile = async () => {
        try {
            console.log('🔄 Loading profile data...');
            setIsLoading(true);

            // Use the API URL from environment variables
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
                if (data.success && data.user) {
                    // Convert payoutDetails to payoutMethods format for frontend
                    const payoutMethods: PayoutMethod[] = [];
                    if (data.user.payoutDetails) {
                        const payoutDetails = data.user.payoutDetails;
                        if (payoutDetails.btc?.btcAddress) {
                            payoutMethods.push({
                                type: 'btc',
                                label: 'BTC',
                                btcAddress: payoutDetails.btc.btcAddress
                            });
                        }
                        if (payoutDetails.usdt?.usdtAddress) {
                            payoutMethods.push({
                                type: 'usdt',
                                label: 'USDT (TRC20)',
                                usdtAddress: payoutDetails.usdt.usdtAddress
                            });
                        }
                        if (payoutDetails.bank?.accountName && payoutDetails.bank?.accountNumber && payoutDetails.bank?.bankName) {
                            payoutMethods.push({
                                type: 'bank',
                                label: 'Bank Transfer',
                                accountName: payoutDetails.bank.accountName,
                                accountNumber: payoutDetails.bank.accountNumber,
                                bankName: payoutDetails.bank.bankName
                            });
                        }
                    }

                    const profileData: UserProfile = {
                        email: data.user.email || '',
                        payoutMethods: payoutMethods
                    };
                    setProfile(profileData);
                }
            }
        } catch (error) {
            console.error('💥 Failed to load profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[60vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Profile</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004B49] mb-4"></div>
                            <p className="text-gray-600 text-sm">Loading profile...</p>
                        </div>
                    ) : !profile.email ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <AlertCircle size={48} className="text-gray-400 mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Profile Data</h4>
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Unable to load your profile information. Please try refreshing the page.
                            </p>
                            <button
                                onClick={loadProfile}
                                className="bg-[#004B49] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors mb-4"
                            >
                                Retry
                            </button>

                            {/* Logout Button - Always visible */}
                            <button
                                onClick={async () => {
                                    onClose(); // Close modal first
                                    await logout(); // This will reload the page
                                }}
                                className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            >
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Mail size={16} className="text-gray-400 mr-2" />
                                        <span className="text-gray-900">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payout Details
                                </label>
                                <button
                                    onClick={() => setShowPayoutDetails(true)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <CreditCard size={16} className="text-gray-400 mr-2" />
                                        <span className="text-gray-900">Manage Payout Methods</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            profile.payoutMethods.some(method =>
                                                (method.type === 'btc' && method.btcAddress) ||
                                                (method.type === 'usdt' && method.usdtAddress) ||
                                                (method.type === 'bank' && method.accountName)
                                            ) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {profile.payoutMethods.some(method =>
                                                (method.type === 'btc' && method.btcAddress) ||
                                                (method.type === 'usdt' && method.usdtAddress) ||
                                                (method.type === 'bank' && method.accountName)
                                            ) ? 'SET' : 'NOT SET'}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div>

                            {/* Logout Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={async () => {
                                        onClose(); // Close modal first
                                        await logout(); // This will reload the page
                                    }}
                                    className="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PayoutDetailsModal
                isOpen={showPayoutDetails}
                onClose={() => setShowPayoutDetails(false)}
            />
        </div>
    );
}

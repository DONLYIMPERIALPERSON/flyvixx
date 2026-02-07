'use client';

import { useState, useEffect } from "react";
import { X, Copy, CheckCircle, Users, AlertTriangle, Crown } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ReferralData {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    activeReferrals: number;
    level: number;
    referredUsers: Array<{
        id: string;
        email: string;
        isActive: boolean;
        joinedAt: string;
    }>;
}

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
    const { sessionToken } = useSession();
    const [copiedLink, setCopiedLink] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch referral data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchReferralData();
        }
    }, [isOpen]);

    const fetchReferralData = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            const response = await fetch(`${apiBaseUrl}/api/referral/info`, {
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
                    setReferralData(data.referral);
                }
            }
        } catch (error) {
            console.error('Failed to fetch referral data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (!referralData?.referralLink) return;

        try {
            await navigator.clipboard.writeText(referralData.referralLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Conceal email function
    const concealEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length <= 2) return `${localPart}***@${domain}`;
        return `${localPart.substring(0, 2)}***@${domain}`;
    };

    const activeReferrals = referralData?.activeReferrals || 0;
    const totalReferrals = referralData?.totalReferrals || 0;
    const currentLevel = referralData?.level || 1;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Referral Program</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-6">
                        {/* Current Level */}
                        <div className="bg-gradient-to-r from-[#004B49] to-[#00695C] p-4 rounded-lg text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Crown size={20} className="text-[#FFD700]" />
                                    <div>
                                        <p className="text-sm opacity-80">Your Level</p>
                                        <p className="text-2xl font-bold">Level {currentLevel}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs opacity-80">Next Level</p>
                                    <p className="text-sm">{Math.ceil((currentLevel) * 5)} active referrals needed</p>
                                </div>
                            </div>
                        </div>

                        {/* Referral Link */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Referral Link</h4>
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 font-mono text-sm bg-white p-3 rounded border break-all text-black">
                                    {referralData?.referralLink || 'Loading...'}
                                </code>
                                <button
                                    onClick={handleCopyLink}
                                    disabled={!referralData?.referralLink}
                                    className="p-3 bg-[#004B49] text-white rounded-lg hover:bg-[#00695C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {copiedLink ? (
                                        <CheckCircle size={16} />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </button>
                            </div>
                            {copiedLink && (
                                <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>
                            )}
                        </div>

                        {/* Referral Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-800">{activeReferrals}</p>
                                <p className="text-sm text-green-700">Active Referrals</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800">{totalReferrals}</p>
                                <p className="text-sm text-gray-700">Total Referrals</p>
                            </div>
                        </div>

                        {/* Referrals List */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Your Referrals</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {isLoading ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Loading referrals...</p>
                                    </div>
                                ) : referralData?.referredUsers && referralData.referredUsers.length > 0 ? (
                                    referralData.referredUsers.map((referral, index) => (
                                        <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Users size={16} className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{concealEmail(referral.email)}</p>
                                                    <p className="text-xs text-gray-500">Joined {new Date(referral.joinedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                referral.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {referral.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No referrals yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Share your referral link to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-yellow-800 font-medium">Important:</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Only active referrals count towards your rewards. Active referrals are users who have locked deposits in their accounts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
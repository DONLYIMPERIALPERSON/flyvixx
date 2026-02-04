'use client';

import { useState } from "react";
import { X, Copy, CheckCircle, Users, AlertTriangle } from "lucide-react";

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const referralLink = 'https://flyvixx.com/ref/johndoe123';

const referrals = [
    { name: 'John S***', status: 'active', joinedDate: '2024-01-15' },
    { name: 'Sarah M***', status: 'active', joinedDate: '2024-01-20' },
    { name: 'Mike R***', status: 'inactive', joinedDate: '2024-01-10' },
    { name: 'Emma L***', status: 'active', joinedDate: '2024-01-25' },
    { name: 'David K***', status: 'inactive', joinedDate: '2024-01-05' },
    { name: 'Lisa P***', status: 'active', joinedDate: '2024-01-30' },
    { name: 'Tom W***', status: 'inactive', joinedDate: '2024-01-08' },
    { name: 'Anna G***', status: 'active', joinedDate: '2024-02-01' },
];

export default function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
    const [copiedLink, setCopiedLink] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const activeReferrals = referrals.filter(ref => ref.status === 'active').length;
    const totalReferrals = referrals.length;

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
                        {/* Referral Link */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Referral Link</h4>
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 font-mono text-sm bg-white p-3 rounded border break-all text-black">
                                    {referralLink}
                                </code>
                                <button
                                    onClick={handleCopyLink}
                                    className="p-3 bg-[#004B49] text-white rounded-lg hover:bg-[#00695C] transition-colors"
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
                                {referrals.map((referral, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Users size={16} className="text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                                                <p className="text-xs text-gray-500">Joined {referral.joinedDate}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            referral.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {referral.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
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
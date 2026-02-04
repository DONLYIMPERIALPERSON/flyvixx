'use client';

import { useState } from "react";
import { X, Edit2, Save, Phone, Mail, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import PayoutDetailsModal from "./payout-details-modal";

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
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    payoutMethods: PayoutMethod[];
    avatar?: string;
}

const mockProfile: UserProfile = {
    username: 'john_doe_gamer',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    payoutMethods: [
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
    ],
    avatar: undefined // Will show placeholder
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [profile, setProfile] = useState<UserProfile>(mockProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);
    const [showPayoutDetails, setShowPayoutDetails] = useState(false);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const handleEdit = () => {
        setIsEditing(true);
        setEditedProfile({ ...profile });
    };

    const handleSave = () => {
        setShowOtpVerification(true);
    };

    const handleOtpVerify = () => {
        if (otpCode === '123456') { // Mock OTP verification
            setProfile({ ...editedProfile });
            setIsEditing(false);
            setShowOtpVerification(false);
            setOtpCode('');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedProfile({ ...profile });
        setShowOtpVerification(false);
        setOtpCode('');
    };

    const updateField = (field: keyof UserProfile, value: string) => {
        setEditedProfile(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Profile</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Profile Fields */}
                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.username}
                                    onChange={(e) => updateField('username', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                />
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-900">{profile.username}</span>
                                    <button
                                        onClick={handleEdit}
                                        className="text-[#004B49] hover:text-[#00695C]"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                />
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-900">{profile.firstName}</span>
                                    <button
                                        onClick={handleEdit}
                                        className="text-[#004B49] hover:text-[#00695C]"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004B49] focus:border-transparent text-black"
                                    style={{ fontSize: '16px' }}
                                />
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-900">{profile.lastName}</span>
                                    <button
                                        onClick={handleEdit}
                                        className="text-[#004B49] hover:text-[#00695C]"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <Phone size={16} className="text-gray-400 mr-2" />
                                    <span className="text-gray-900">{profile.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Locked</span>
                                </div>
                            </div>
                        </div>

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
                                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Locked</span>
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
                    </div>
                </div>

                {/* Footer */}
                {showOtpVerification ? (
                    /* OTP Verification */
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="space-y-4">
                            <div className="text-center">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Verify Profile Changes</h4>
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
                    </div>
                ) : isEditing && (
                    <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-[#004B49] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#00695C] transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <PayoutDetailsModal
                isOpen={showPayoutDetails}
                onClose={() => setShowPayoutDetails(false)}
            />
        </div>
    );
}

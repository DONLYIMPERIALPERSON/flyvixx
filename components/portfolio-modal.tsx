'use client';

import { useState } from "react";
import { X, TrendingUp, Calendar, Plane, Share2 } from "lucide-react";

interface PortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PortfolioModal({ isOpen, onClose }: PortfolioModalProps) {
    const [shareMessage, setShareMessage] = useState('');

    // Mock data
    const daysLeft = 15; // out of 30
    const totalDays = 30;
    const profitMade = 245.67;
    const todaysFlights = 8;
    const aircraftName = 'Aircraft-1234567890';
    const currentLevel = 4;
    const lockedAmount = 120.00; // Amount currently locked in portfolio

    const progressPercentage = ((totalDays - daysLeft) / totalDays) * 100;

    const handleShare = () => {
        setShareMessage('Portfolio shared successfully!');
        setTimeout(() => setShareMessage(''), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[#004B49]">Portfolio Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Trading Card Style Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-gradient-to-br from-[#004B49] to-[#00695C] rounded-xl p-6 text-white shadow-2xl">
                        {/* Logo and Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <img
                                    src="/logo-mark.svg"
                                    alt="FlyVixx Logo"
                                    className="w-10 h-10"
                                />
                                <div>
                                    <h4 className="text-lg font-bold">FlyVixx</h4>
                                    <p className="text-xs opacity-80">Gaming Portfolio</p>
                                </div>
                            </div>
                            <button
                                onClick={handleShare}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <Share2 size={16} />
                            </button>
                        </div>

                        {/* Aircraft Info */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm opacity-80">Aircraft</span>
                                <span className="text-xs bg-[#FFD700] text-[#004B49] px-2 py-1 rounded-full font-medium">
                                    Level {currentLevel}
                                </span>
                            </div>
                            <h5 className="text-xl font-bold">{aircraftName}</h5>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm opacity-80">Locked Amount</span>
                                <span className="text-lg font-bold text-[#FFD700]">${lockedAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Progress Bar - Days Left */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm opacity-80 flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    Days Left
                                </span>
                                <span className="text-sm font-bold">{daysLeft} days</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3">
                                <div
                                    className="bg-[#FFD700] h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs opacity-70 mt-1">
                                <span>0</span>
                                <span>{totalDays} days</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <TrendingUp size={16} className="text-[#FFD700]" />
                                </div>
                                <p className="text-2xl font-bold text-[#FFD700]">${profitMade.toFixed(2)}</p>
                                <p className="text-xs opacity-80">Profit Made</p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center mb-2">
                                    <Plane size={16} className="text-[#FFD700]" />
                                </div>
                                <p className="text-2xl font-bold text-[#FFD700]">{todaysFlights}</p>
                                <p className="text-xs opacity-80">Today's Flights</p>
                            </div>
                        </div>

                        {/* Performance Indicator */}
                        <div className="text-center">
                            <div className="inline-flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full">
                                <TrendingUp size={14} className="text-green-400" />
                                <span className="text-sm font-medium text-green-400">IN PROFIT</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-white/20">
                            <p className="text-xs opacity-60 text-center">
                                FlyVixx Gaming • Real-time Portfolio
                            </p>
                        </div>
                    </div>

                    {/* Share Success Message */}
                    {shareMessage && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 text-center">{shareMessage}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                            Screenshot this card to share your gaming portfolio success!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
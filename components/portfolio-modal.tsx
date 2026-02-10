'use client';

import { useState, useEffect, useRef, memo } from "react";
import { X, TrendingUp, Calendar, Plane, Share2, Gift } from "lucide-react";
import { useSession } from "@descope/react-sdk";

interface PortfolioInfo {
    hasLockedFunds: boolean;
    lockedFunds: number;
    lockedUntil: string | null;
    daysLeft: number;
    portfolioBalance: number;
    canLockFunds: boolean;
    level?: number;
    activeReferrals?: number;
}

interface GiftInfo {
    dailyGifts: number;
    giftsLastReset: string | null;
    nextResetTime: string;
    hoursUntilReset: number;
    minutesUntilReset: number;
    secondsUntilReset: number;
    giftsGivenToday: boolean;
}

interface PortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    portfolioInfo?: PortfolioInfo | null;
    userData?: {
        totalFlies?: number;
        totalPortfolioProfit?: number;
        dailyGifts?: number;
    } | null;
    onDataRefresh?: () => void;
}

function PortfolioModal({ isOpen, onClose, portfolioInfo: initialPortfolioInfo, userData: initialUserData, onDataRefresh }: PortfolioModalProps) {
    const { sessionToken } = useSession();
    const [shareMessage, setShareMessage] = useState('');
    const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfo | null>(initialPortfolioInfo || null);
    const [userData, setUserData] = useState(initialUserData || null);
    const [isLoading, setIsLoading] = useState(false);
    const [giftInfo, setGiftInfo] = useState<GiftInfo | null>(null);
    const timerStartedRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch fresh portfolio data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPortfolioInfo();
        }
    }, [isOpen]);

    // Update local state when props change
    useEffect(() => {
        if (initialPortfolioInfo) {
            setPortfolioInfo(initialPortfolioInfo);
        }
        if (initialUserData) {
            setUserData(initialUserData);
        }
    }, [initialPortfolioInfo, initialUserData]);

    // Start timer when data becomes available (only once per modal session)
    useEffect(() => {
        if (isOpen && userData?.dailyGifts !== undefined && !timerStartedRef.current) {
            console.log('🎯 Starting live countdown timer');
            timerStartedRef.current = true;

            // Start countdown immediately
            calculateGiftTimer();

            // Update every second
            intervalRef.current = setInterval(() => {
                calculateGiftTimer();
            }, 1000);
        }
    }, [isOpen, userData?.dailyGifts]); // Start when data becomes available

    // Reset timer flag when modal closes
    useEffect(() => {
        if (!isOpen) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log('🛑 Stopping live countdown timer');
            }
            timerStartedRef.current = false;
        }
    }, [isOpen]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                console.log('🛑 Stopping live countdown timer on unmount');
            }
        };
    }, []);

    const fetchPortfolioInfo = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            console.log('Fetching portfolio info...');

            // Fetch both portfolio info and user profile data
            const [portfolioResponse, userResponse] = await Promise.all([
                fetch(`${apiBaseUrl}/api/transactions/portfolio`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    credentials: 'include'
                }),
                fetch(`${apiBaseUrl}/api/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    },
                    credentials: 'include'
                })
            ]);

            if (portfolioResponse.ok) {
                const data = await portfolioResponse.json();
                console.log('Portfolio API response:', data);
                if (data.success) {
                    console.log('Setting portfolio info:', data.portfolio);
                    setPortfolioInfo(data.portfolio);
                } else {
                    console.log('API returned success=false');
                }
            } else {
                console.log('Portfolio API response not ok:', portfolioResponse.status);
            }

            if (userResponse.ok) {
                const userDataResponse = await userResponse.json();
                if (userDataResponse.success && userDataResponse.user) {
                    // Update local userData state with fresh data
                    setUserData({
                        totalFlies: userDataResponse.user.totalFlies || 0,
                        totalPortfolioProfit: Number(userDataResponse.user.totalPortfolioProfit || 0),
                        dailyGifts: userDataResponse.user.dailyGifts || 0
                    });

                    // Call the parent refresh callback to update the data
                    if (onDataRefresh) {
                        onDataRefresh();
                    }
                    console.log('User data updated locally and parent refreshed:', {
                        totalFlies: userDataResponse.user.totalFlies,
                        totalPortfolioProfit: userDataResponse.user.totalPortfolioProfit,
                        dailyGifts: userDataResponse.user.dailyGifts
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch portfolio info in modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Use real data or defaults
    const daysLeft = portfolioInfo?.daysLeft || 0;
    const totalDays = 30;
    const profitMade = userData?.totalPortfolioProfit || 0; // Real portfolio profit
    const todaysFlights = userData?.totalFlies || 0; // Real total flies
    const aircraftName = `Aircraft-${Date.now().toString().slice(-10)}`;
    const currentLevel = portfolioInfo?.level || 1;
    const lockedAmount = portfolioInfo?.lockedFunds || 0;

    // Calculate days passed correctly (cap daysLeft to max 30 for display)
    const effectiveDaysLeft = Math.min(daysLeft, totalDays);
    const daysPassed = totalDays - effectiveDaysLeft;
    const progressPercentage = (daysPassed / totalDays) * 100;

    // Removed excessive debug logging to prevent console spam and improve performance



    const calculateGiftTimer = () => {
        if (!userData?.dailyGifts) return;

        const now = new Date();
        // Calculate next midnight (when gifts reset)
        const nextMidnight = new Date(now);
        nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight

        const timeUntilReset = nextMidnight.getTime() - now.getTime();
        const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
        const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
        const secondsUntilReset = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

        // Check if gifts were given today (within last 24 hours)
        const giftsGivenToday = userData.dailyGifts > 0;

        console.log('🎁 Gift timer calculated:', {
            now: now.toISOString(),
            nextMidnight: nextMidnight.toISOString(),
            timeUntilReset,
            countdown: `${hoursUntilReset}:${minutesUntilReset}:${secondsUntilReset}`,
            dailyGifts: userData.dailyGifts
        });

        setGiftInfo({
            dailyGifts: userData.dailyGifts,
            giftsLastReset: null, // We don't have this from the API yet
            nextResetTime: nextMidnight.toISOString(),
            hoursUntilReset,
            minutesUntilReset,
            secondsUntilReset,
            giftsGivenToday
        });
    };

    const handleShare = () => {
        setShareMessage('Portfolio shared successfully!');
        setTimeout(() => setShareMessage(''), 3000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`bg-white rounded-t-xl w-full max-w-md h-[85vh] transform transition-transform duration-300 flex flex-col relative ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
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

                        {/* Days Counter */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm opacity-80 flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    Lock Period
                                </span>
                                <span className="text-lg font-bold text-[#FFD700]">
                                    {portfolioInfo?.hasLockedFunds ? `${daysPassed}/${totalDays}` : '0/30'}
                                </span>
                            </div>
                            {/* Progress Bar */}
                            {portfolioInfo?.hasLockedFunds && (
                                <div className="mb-2">
                                    <div className="w-full bg-white/20 rounded-full h-2">
                                        <div
                                            className="bg-[#FFD700] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            <div className="text-center">
                                <p className="text-xs opacity-70">
                                    {effectiveDaysLeft > 0 ? `${effectiveDaysLeft} days remaining` : 'Lock period completed'}
                                </p>
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
                                <p className="text-xs opacity-80">Total Flights</p>
                            </div>
                        </div>

                        {/* Gift Timer - Only show if user has locked funds */}
                        {portfolioInfo?.hasLockedFunds && giftInfo && (
                            <div className="mb-6">
                                <div className="bg-white/10 rounded-lg p-4">
                                    {/* Available Gifts with Icons */}
                                    <div className="mb-4">
                                        <div className="text-sm opacity-80 mb-2">Available Gifts</div>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.from({ length: giftInfo.dailyGifts }, (_, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-green-500 hover:bg-green-600 border border-white/20 rounded-md py-1 px-2 text-white text-xs font-medium transition-colors flex items-center space-x-1"
                                                >
                                                    <Gift size={12} />
                                                    <span>{index + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next Gift Time */}
                                    <div>
                                        <div className="text-sm opacity-80 mb-2">Next Gift Time</div>
                                        <div className="text-lg font-bold text-[#FFD700] font-mono">
                                            {String(giftInfo.hoursUntilReset).padStart(2, '0')}:
                                            {String(giftInfo.minutesUntilReset).padStart(2, '0')}:
                                            {String(giftInfo.secondsUntilReset).padStart(2, '0')}
                                        </div>
                                        <div className="text-xs opacity-60 mt-1">
                                            Daily reset at midnight
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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

export default memo(PortfolioModal);

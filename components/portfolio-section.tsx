'use client';

import { useState, useEffect } from "react";
import { Plane, Lock, Plus } from "lucide-react";
import { useSession } from "@descope/react-sdk";
import PortfolioModal from "./portfolio-modal";
import LockFundsModal from "./lock-funds-modal";

interface PortfolioSectionProps {
    isLoggedIn: boolean;
}

interface PortfolioInfo {
    hasLockedFunds: boolean;
    lockedFunds: number;
    lockedUntil: string | null;
    daysLeft: number;
    portfolioBalance: number;
    canLockFunds: boolean;
    level: number;
    activeReferrals: number;
}

export default function PortfolioSection({ isLoggedIn }: PortfolioSectionProps) {
    const { sessionToken } = useSession();
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [showLockFundsModal, setShowLockFundsModal] = useState(false);
    const [portfolioInfo, setPortfolioInfo] = useState<PortfolioInfo | null>(null);
    const [userData, setUserData] = useState<{ totalFlies?: number; totalPortfolioProfit?: number; dailyGifts?: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch portfolio information when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchPortfolioInfo();
        }
    }, [isLoggedIn]);

    const fetchPortfolioInfo = async () => {
        try {
            setIsLoading(true);
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiBaseUrl) {
                console.error('API URL not configured');
                return;
            }

            // Fetch portfolio info
            const portfolioResponse = await fetch(`${apiBaseUrl}/api/transactions/portfolio`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();
                if (portfolioData.success) {
                    setPortfolioInfo(portfolioData.portfolio);
                }
            }

            // Fetch user profile for portfolio stats
            const userResponse = await fetch(`${apiBaseUrl}/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionToken}`
                },
                credentials: 'include'
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.success && userData.user) {
                    setUserData({
                        totalFlies: userData.user.totalFlies || 0,
                        totalPortfolioProfit: Number(userData.user.totalPortfolioProfit || 0),
                        dailyGifts: userData.user.dailyGifts || 0
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch portfolio info:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPortfolio = () => {
        fetchPortfolioInfo();
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">PORTFOLIO</h2>
            </div>

            {portfolioInfo?.hasLockedFunds ? (
                // Show locked portfolio
                <div
                    className="bg-[#DCEFEE] border border-gray-200 rounded-lg p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#DCEFEE]/80 transition-colors"
                    onClick={() => setShowPortfolioModal(true)}
                >
                    <div className="flex items-center space-x-4">
                        <Plane size={24} className="text-gray-600" />
                        <div className="flex flex-col">
                            <span className="text-base font-semibold text-[#004B49]">Aircraft-{Date.now().toString().slice(-10)}</span>
                            <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-600">Locked:</span>
                                <span className="font-bold text-[#004B49]">${portfolioInfo.lockedFunds.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Lock size={12} />
                                <span>{Math.min(portfolioInfo.daysLeft, 30)} days left</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 text-[#004B49] text-xs px-2 py-1 rounded">
                        Level {portfolioInfo.level}
                    </div>
                </div>
            ) : (
                // Show no locked funds state
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <Plane size={32} className="text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Locked Funds</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Lock your funds in portfolio for 30 days to earn higher rewards and access exclusive features.
                            </p>
                            <button
                                onClick={() => setShowLockFundsModal(true)}
                                className="bg-[#FFD700] text-[#004B49] px-6 py-2 rounded-lg font-semibold hover:bg-[#E6C200] transition-colors flex items-center space-x-2 mx-auto"
                            >
                                <Plus size={16} />
                                <span>Lock Funds</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PortfolioModal
                isOpen={showPortfolioModal}
                onClose={() => setShowPortfolioModal(false)}
                portfolioInfo={portfolioInfo}
                userData={userData}
                onDataRefresh={fetchPortfolioInfo}
            />

            <LockFundsModal
                isOpen={showLockFundsModal}
                onClose={() => setShowLockFundsModal(false)}
                onLockSuccess={refreshPortfolio}
            />
        </section>
    );
}

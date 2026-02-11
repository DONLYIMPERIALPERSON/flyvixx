'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plane, Wallet, Briefcase, Gift } from "lucide-react";
import { useSession } from "@descope/react-sdk";
import FlyHeader from "../../components/fly-header";
import FlyHistoryModal from "../../components/fly-history-modal";
import GameCanvas from "../../components/game-canvas";
import LoginGuard from "../../components/login-guard";
import { gameStateManager } from "../../components/game-state-manager";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useToast } from "../../components/toast-notification";
import { useBalance } from "../../components/balance-context";

// Import BetType dynamically to avoid SSR issues
let BetType: any = { CASH: 'cash', PORTFOLIO: 'portfolio' };
if (typeof window !== 'undefined') {
  try {
    // Use the correct enum values that match the server
    BetType = { CASH: 'cash', PORTFOLIO: 'portfolio' };
  } catch (e) {
    // Fallback if import fails
  }
}

export default function FlyPage() {
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState<'cash' | 'portfolio'>('cash');
    const [flightAmount, setFlightAmount] = useState('10');
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [safeFlyActive, setSafeFlyActive] = useState(false);
    const [safePlayEnabled, setSafePlayEnabled] = useState(false);
    const [selectedGift, setSelectedGift] = useState<number | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [flightHistory, setFlightHistory] = useState<any[]>([]);
    const flightCount = flightHistory.length;

    // New betting states
    const [hasActiveBet, setHasActiveBet] = useState(false);
    const [betAmount, setBetAmount] = useState(0);
    const [betWallet, setBetWallet] = useState<'cash' | 'portfolio'>('cash');
    const [showWinAnimation, setShowWinAnimation] = useState(false);
    const [winAmount, setWinAmount] = useState(0);
    const [roundCountdown, setRoundCountdown] = useState<number | null>(null);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const [isPlacingBet, setIsPlacingBet] = useState(false);
    const [justCashedOut, setJustCashedOut] = useState(false);

    // User session and profile
    const { sessionToken } = useSession();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Use balance context for real-time balance updates
    const { balance: contextBalance, setupSocketListener, updateBalance } = useBalance();

    // Local balance state for optimistic updates
    const [localCashBalance, setLocalCashBalance] = useState<number | null>(null);
    const [localPortfolioBalance, setLocalPortfolioBalance] = useState<number | null>(null);

    // Sync local state with context
    useEffect(() => {
        setLocalCashBalance(contextBalance.cash);
        setLocalPortfolioBalance(contextBalance.portfolio);
    }, [contextBalance.cash, contextBalance.portfolio]);

    // Use local state for display, fallback to context
    const cashBalance = localCashBalance !== null ? localCashBalance : contextBalance.cash;
    const portfolioBalance = localPortfolioBalance !== null ? localPortfolioBalance : contextBalance.portfolio;
    const portfolioFlightAmount = portfolioBalance ? (portfolioBalance * 0.01).toFixed(2) : '0.00'; // 1% of portfolio

    // Portfolio data
    const [userLevel, setUserLevel] = useState<number>(1);
    const [availableGifts, setAvailableGifts] = useState<number>(0);
    const [totalFlies, setTotalFlies] = useState<number>(0);
    const [totalPortfolioProfit, setTotalPortfolioProfit] = useState<number>(0);

    // Load user profile on mount
    useEffect(() => {
        if (sessionToken) {
            loadUserProfile();
        }
    }, [sessionToken]);

    // Function to refresh user profile (used after bet placement)
    const refreshUserProfile = () => {
        console.log('🔄 Refreshing user profile...');
        if (sessionToken) {
            loadUserProfile();
        }
    };

    const loadUserProfile = async () => {
        try {
            console.log('📡 Loading user profile...');
            setIsLoadingProfile(true);
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
                console.log('📊 Profile API response:', data);
                if (data.success && data.user) {
                    console.log('🎁 Updating available gifts:', data.user.dailyGifts);
                    console.log('💰 Raw balance data:', {
                        cash: data.user.balance.cash,
                        portfolio: data.user.balance.portfolio,
                        cashType: typeof data.user.balance.cash,
                        portfolioType: typeof data.user.balance.portfolio
                    });

                    // Parse balance strings that may have incorrect formatting
                    const parseBalance = (balanceStr: any): number => {
                        if (typeof balanceStr === 'number') return balanceStr;
                        if (typeof balanceStr !== 'string') return 0;

                        try {
                            // Handle malformed strings like '946.171972.42'
                            // Take only the first and last parts: '946' + '.' + '42' = '946.42'
                            const parts = balanceStr.split('.');
                            if (parts.length >= 2) {
                                const dollars = parts[0];
                                const cents = parts[parts.length - 1];
                                const result = parseFloat(`${dollars}.${cents}`);
                                return isNaN(result) ? 0 : result;
                            }

                            // Fallback: try to parse as regular number
                            const result = parseFloat(balanceStr.replace(/[^\d.-]/g, ''));
                            return isNaN(result) ? 0 : result;
                        } catch (error) {
                            console.error('Error parsing balance:', balanceStr, error);
                            return 0;
                        }
                    };

                    setUserId(data.user.id);

                    // Load portfolio data
                    setUserLevel(data.user.level || 1);
                    setAvailableGifts(data.user.dailyGifts || 0);
                    setTotalFlies(data.user.totalFlies || 0);
                    setTotalPortfolioProfit(Number(data.user.totalPortfolioProfit || 0));
                } else {
                    console.log('❌ Profile API returned success=false or no user data');
                }
            } else {
                console.error('❌ Profile API response not ok:', response.status);
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Socket connection for real-time game synchronization
    const { socket, isConnecting, placeBet, cashOut, onMultiplierUpdate, onBalanceUpdate, onCrash, onRoundStart, onRoundEnd } = useGameSocket(sessionToken, userId || undefined);

    // Toast notifications
    const { showError, showSuccess, showWarning, showInfo, ToastManager } = useToast();

    // Subscribe to game state changes
    const [gamePhase, setGamePhase] = useState<'preparing' | 'flying' | 'crashed' | 'cashed_out'>('preparing');
    useEffect(() => {
        const unsubscribe = gameStateManager.subscribe((state) => {
            const previousPhase = gamePhase;
            setGamePhase(state.phase);
            setCurrentMultiplier(state.multiplier);

            // Reset justCashedOut when new round starts
            if (state.phase === 'preparing' && previousPhase !== 'preparing') {
                setJustCashedOut(false);
            }

            // Start countdown when preparing phase begins
            if (state.phase === 'preparing') {
                setRoundCountdown(8); // 8 seconds for preparing phase
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                }
                const interval = setInterval(() => {
                    setRoundCountdown(prev => {
                        if (prev === null || prev <= 1) {
                            clearInterval(interval);
                            setCountdownInterval(null);
                            return null;
                        }
                        return prev - 1;
                    });
                }, 1000);
                setCountdownInterval(interval);
            } else {
                // Clear countdown for other phases
                setRoundCountdown(null);
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    setCountdownInterval(null);
                }
            }
        });
        return unsubscribe;
    }, [gamePhase]);

    // Set up socket listener for real-time balance updates
    useEffect(() => {
        if (setupSocketListener) {
            const cleanup = setupSocketListener((data) => {
                console.log('💰 Fly page received balance update via context:', data);
            });
            return cleanup;
        }
    }, [setupSocketListener]);

    // Listen for cashout events (including auto-cashouts)
    useEffect(() => {
        if (socket) {
            const handleCashedOut = (data: { payout: number; multiplier: number }) => {
                console.log('💸 Cashout event received:', data);

                // Use the exact data from server
                const payout = data.payout;
                const multiplier = data.multiplier;

                // Optimistic UI update: immediately add payout to displayed balance
                if (betWallet === 'cash') {
                    setLocalCashBalance(prev => prev !== null ? prev + payout : null);
                } else if (betWallet === 'portfolio') {
                    setLocalPortfolioBalance(prev => prev !== null ? prev + payout : null);
                }

                // Show win animation
                setWinAmount(payout);
                setShowWinAnimation(true);
                setTimeout(() => setShowWinAnimation(false), 2000);

                // Record flight history with correct data
                const flightRecord = {
                    id: Date.now().toString(),
                    amount: betAmount,
                    multiplier: multiplier,
                    payout: payout,
                    flightType: betWallet,
                    safePlay: betWallet === 'portfolio' && safePlayEnabled,
                    timestamp: new Date(),
                    result: 'win'
                };
                setFlightHistory(prev => [flightRecord, ...prev.slice(0, 9)]); // Keep only last 10 flights

                // Set cashout flag and reset bet state
                setJustCashedOut(true);
                setHasActiveBet(false);
                setBetAmount(0);

                console.log('✅ Cashout processed with optimistic balance update:', { payout, multiplier });
            };

            socket.on('cashed_out', handleCashedOut);

            return () => {
                socket.off('cashed_out', handleCashedOut);
            };
        }
    }, [socket, betAmount, betWallet, safePlayEnabled]);

    const handleBack = () => {
        router.push('/');
    };

    const handleAmountSuggestion = (amount: number) => {
        setFlightAmount(amount.toString());
    };

    const handleSafeFly = async () => {
        if (selectedGift === null) return;

        const amount = parseFloat(flightAmount);
        if (amount <= 0) return;

        // Set loading state immediately
        setIsPlacingBet(true);

        try {
            console.log('🎯 Attempting safe fly bet:', { amount, selectedWallet: 'portfolio', gamePhase, userId, sessionToken: !!sessionToken });

            // Check if user has enough balance
            if (portfolioBalance !== null && amount > portfolioBalance) {
                showError('Insufficient portfolio balance!');
                return;
            }

            // Can't place bet if round is already flying
            if (gamePhase === 'flying') {
                console.log('❌ CLIENT CHECK: Round already flying - bet blocked on client side');
                showWarning('Please wait for the next round to start before placing a bet.');
                return;
            }

            // Can't place bet if round crashed (waiting for next round)
            if (gamePhase === 'crashed') {
                console.log('❌ CLIENT CHECK: Round crashed - bet blocked on client side');
                showWarning('Please wait for the next round to start.');
                return;
            }

            console.log('✅ CLIENT CHECKS PASSED: Proceeding with safe fly bet placement');

            // Check if socket is connected
            if (!isConnecting && !socket) {
                console.error('❌ No socket connection available');
                showError('Connection lost. Please refresh the page.');
                return;
            }

            // Place the portfolio bet via socket
            console.log('📡 Sending safe fly bet to server...');
            const betType = BetType.PORTFOLIO;
            const result = await placeBet({ amount, betType, safePlay: true });

            console.log('📡 Safe fly bet result:', result);

            if (result) {
                // Bet placed successfully
                setHasActiveBet(true);
                setBetAmount(amount);
                setBetWallet(selectedWallet);

                // Optimistic UI update: immediately deduct from displayed balance
                if (selectedWallet === 'cash') {
                    setLocalCashBalance(prev => prev !== null ? prev - amount : null);
                } else if (selectedWallet === 'portfolio') {
                    setLocalPortfolioBalance(prev => prev !== null ? prev - amount : null);
                }

                // Reset selected gift for portfolio flights (server handles consumption)
                if (selectedWallet === 'portfolio' && selectedGift !== null) {
                    setSelectedGift(null);
                }

                // Refresh user profile to update available gifts for portfolio bets
                if (selectedWallet === 'portfolio') {
                    refreshUserProfile();
                }

                console.log('✅ Bet placed successfully with optimistic balance update:', amount, selectedWallet);
            } else {
                console.error('❌ Safe fly bet placement failed');
                showError('Failed to place safe fly bet. Please check console for details.');
            }
        } finally {
            // Always clear loading state
            setIsPlacingBet(false);
        }
    };

    const handlePlaceBet = async () => {
        const amount = parseFloat(flightAmount);
        if (amount <= 0) return;

        // Set loading state immediately
        setIsPlacingBet(true);

        try {
            console.log('🎯 Attempting to place bet:', { amount, selectedWallet, gamePhase, userId, sessionToken: !!sessionToken });

            // Check if user has enough balance
            if (selectedWallet === 'cash' && cashBalance !== null && amount > cashBalance) {
                showError('Insufficient cash balance!');
                return;
            }
            if (selectedWallet === 'portfolio' && portfolioBalance !== null && amount > portfolioBalance) {
                showError('Insufficient portfolio balance!');
                return;
            }

            // Can't place bet if round is already flying
            if (gamePhase === 'flying') {
                console.log('❌ CLIENT CHECK: Round already flying - bet blocked on client side');
                showWarning('Please wait for the next round to start before placing a bet.');
                return;
            }

            // Can't place bet if round crashed (waiting for next round)
            if (gamePhase === 'crashed') {
                console.log('❌ CLIENT CHECK: Round crashed - bet blocked on client side');
                showWarning('Please wait for the next round to start.');
                return;
            }

            console.log('✅ CLIENT CHECKS PASSED: Proceeding with bet placement');

            // Place the bet via socket
            console.log('📡 Sending bet to server...');
            const betType = selectedWallet === 'cash' ? BetType.CASH : BetType.PORTFOLIO;
            const safePlay = selectedWallet === 'portfolio' && safePlayEnabled;
            const result = await placeBet({ amount, betType, safePlay });

            console.log('📡 Bet result:', result);

            if (result) {
                // Bet placed successfully
                setHasActiveBet(true);
                setBetAmount(amount);
                setBetWallet(selectedWallet);

                // Optimistic UI update: immediately deduct from displayed balance
                if (selectedWallet === 'cash') {
                    setLocalCashBalance(prev => prev !== null ? prev - amount : null);
                } else if (selectedWallet === 'portfolio') {
                    setLocalPortfolioBalance(prev => prev !== null ? prev - amount : null);
                }

                // Reset selected gift for portfolio flights (server handles consumption)
                if (selectedWallet === 'portfolio' && selectedGift !== null) {
                    setSelectedGift(null);
                }

                // Refresh user profile to update available gifts for portfolio bets
                if (selectedWallet === 'portfolio') {
                    refreshUserProfile();
                }

                console.log('✅ Bet placed successfully with optimistic balance update:', amount, selectedWallet);
            } else {
                console.error('❌ Bet placement failed');
                showError('Failed to place bet. Please check console for details.');
            }
        } finally {
            // Always clear loading state
            setIsPlacingBet(false);
        }
    };

    const handleCashOut = async () => {
        if (!hasActiveBet) return;

        // Cash out via socket - the event listener will handle UI updates
        const result = await cashOut();

        if (!result || result.payout === undefined || result.multiplier === undefined) {
            showError('Failed to cash out. Please try again.');
        }
    };

    // Handle crash (loss) - but not for safe play bets
    useEffect(() => {
        if (gamePhase === 'crashed' && hasActiveBet) {
            // Safe play bets auto-cashout on crash, so don't record as loss
            if (!(betWallet === 'portfolio' && safePlayEnabled)) {
                // Record loss only for non-safe-play bets
                const flightRecord = {
                    id: Date.now().toString(),
                    amount: betAmount,
                    multiplier: currentMultiplier,
                    payout: 0,
                    flightType: betWallet,
                    safePlay: false,
                    timestamp: new Date(),
                    result: 'loss'
                };
                setFlightHistory(prev => [flightRecord, ...prev.slice(0, 9)]); // Keep only last 10 flights

                // Reset bet state
                setHasActiveBet(false);
                setBetAmount(0);

                console.log('Crashed - bet lost');
            } else {
                // Safe play bet - server will handle auto-cashout, just reset state
                setHasActiveBet(false);
                setBetAmount(0);
                console.log('Crashed - safe play bet auto-cashed out by server');
            }
        }
    }, [gamePhase, hasActiveBet, betAmount, betWallet, safePlayEnabled, currentMultiplier, setFlightHistory]);

    return (
        <LoginGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            {/* Fixed Header - Stays on screen while scrolling */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
                <FlyHeader onBack={handleBack} onHistory={() => setShowHistoryModal(true)} flightCount={flightCount} />
            </div>

            {/* Fixed Game Display - Stays on screen while scrolling */}
            <div className="fixed top-16 left-0 right-0 z-10 bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B] border-b border-white/10">
                <div className="max-w-md mx-auto p-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden" style={{ height: '300px' }}>
                        <GameCanvas
                            isConnecting={isConnecting}
                            hasActiveBet={hasActiveBet}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content Below */}
            <div className="pt-96"> {/* Add more top padding to account for fixed header + game area */}
                <main className="p-4 pb-24">
                    <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium">Flight Type</span>
                            <div className="flex bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => {
                                        setSelectedWallet('cash');
                                        setFlightAmount('10'); // Reset to default when switching
                                    }}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedWallet === 'cash'
                                            ? 'bg-[#FFD700] text-[#004B49]'
                                            : 'text-white/70 hover:text-white'
                                    }`}
                                >
                                    <Wallet size={16} />
                                    <span>Cash</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedWallet('portfolio');
                                        setFlightAmount(portfolioFlightAmount); // Set to 1% of portfolio
                                    }}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedWallet === 'portfolio'
                                            ? 'bg-[#FFD700] text-[#004B49]'
                                            : 'text-white/70 hover:text-white'
                                    }`}
                                >
                                    <Briefcase size={16} />
                                    <span>Portfolio</span>
                                </button>
                            </div>
                        </div>
                        {/* Cash Balance Display or Safe Play Toggle */}
                        {selectedWallet === 'cash' ? (
                            <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Cash Balance</span>
                                    {isLoadingProfile ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFD700]/20 border-t-[#FFD700]"></div>
                                            <span className="text-white/60 text-sm">Loading...</span>
                                        </div>
                                    ) : cashBalance !== null ? (
                                        <span className="text-[#FFD700] font-bold">${cashBalance.toFixed(2)}</span>
                                    ) : (
                                        <span className="text-red-400 text-sm">Failed to load</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70 text-sm">Safe Play</span>
                                    <button
                                        onClick={() => setSafePlayEnabled(!safePlayEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            safePlayEnabled ? 'bg-[#FFD700]' : 'bg-white/20'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                safePlayEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Control Panel */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-6">
                        {/* Amount Container */}
                        <div className="text-center">
                            <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Flight Amount</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">$</span>
                                <input
                                    type="number"
                                    value={flightAmount}
                                    onChange={(e) => setFlightAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-8 py-3 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                                    placeholder="0"
                                    min="1"
                                    disabled={hasActiveBet || selectedWallet === 'portfolio'}
                                    readOnly={selectedWallet === 'portfolio'}
                                />
                            </div>
                        </div>

                        {/* Amount Suggestions */}
                        {selectedWallet === 'cash' ? (
                            <div className="grid grid-cols-5 gap-2">
                                {[1, 3, 5, 10, 50].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => handleAmountSuggestion(amount)}
                                        disabled={hasActiveBet}
                                        className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-5 gap-2">
                                {Array.from({ length: availableGifts }, (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedGift(index);
                                        }}
                                        disabled={hasActiveBet}
                                        className={`border border-white/20 rounded-lg py-3 px-4 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center space-y-1 ${
                                            selectedGift === index
                                                ? 'bg-[#FFD700] text-[#004B49] border-[#FFD700]'
                                                : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                    >
                                        <Gift size={20} />
                                        <span className="text-xs">Gift {index + 1}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Control Buttons */}
                        <div className="space-y-3">
                            {/* Betting Button */}
                            {hasActiveBet && gamePhase === 'flying' ? (
                                // Different button for safe play vs regular bets
                                betWallet === 'portfolio' && safePlayEnabled ? (
                                    // Safe Play - Auto cashout at 1.0x, show disabled button
                                    <button
                                        disabled
                                        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <span>🤖 Auto Cash Out - $0.50</span>
                                    </button>
                                ) : (
                                    // Regular Cash Out Button - Show during flying with active bet
                                    <button
                                        onClick={handleCashOut}
                                        className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <span>Cash Out - ${(betAmount * currentMultiplier).toFixed(2)}</span>
                                    </button>
                                )
                            ) : justCashedOut && gamePhase === 'flying' ? (
                                // Just cashed out but flight still going - disable button to prevent confusion
                                <button
                                    disabled
                                    className="w-full bg-gray-500/50 text-gray-300 py-3 px-6 rounded-lg font-bold cursor-not-allowed border border-gray-400/30 flex items-center justify-center space-x-2 opacity-60"
                                >
                                    <span>✈️ Round In Progress - Next Round Soon</span>
                                </button>
                            ) : hasActiveBet && gamePhase === 'preparing' ? (
                                // Processing Button - Bet placed, waiting for flight
                                <button
                                    disabled
                                    className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>Processing Bet...</span>
                                </button>
                            ) : gamePhase === 'flying' ? (
                                // Can't bet during flying - show current multiplier
                                <button
                                    disabled
                                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>✈️ Flying - {currentMultiplier.toFixed(2)}x</span>
                                </button>
                            ) : gamePhase === 'crashed' ? (
                                // Round crashed - show crash state
                                <button
                                    disabled
                                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>💥 Round Crashed</span>
                                </button>
                            ) : (
                                // Place Bet Button - Normal state (green when ready)
                                <button
                                    onClick={() => {
                                        if (selectedWallet === 'portfolio' && safePlayEnabled) {
                                            // Safe Play mode - requires gift selection
                                            handleSafeFly();
                                        } else {
                                            // Normal mode
                                            handlePlaceBet();
                                        }
                                    }}
                                    disabled={
                                        isLoadingProfile ||
                                        isPlacingBet ||
                                        (selectedWallet === 'portfolio' && selectedGift === null)
                                    }
                                    className={`w-full py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                                        selectedWallet === 'portfolio' && safePlayEnabled
                                            ? 'bg-[#FFD700] text-[#004B49] hover:bg-[#E6C200] disabled:opacity-50 disabled:cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {isLoadingProfile ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                            <span>Loading...</span>
                                        </>
                                    ) : isPlacingBet ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                            <span>Placing Bet...</span>
                                        </>
                                    ) : (
                                        <span>
                                            {selectedWallet === 'portfolio' && safePlayEnabled
                                                ? `Safe Fly - $${flightAmount}`
                                                : `Place Bet - $${flightAmount}`
                                            }
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Win Animation */}
                        {showWinAnimation && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                                <div className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-2xl animate-bounce">
                                    🎉 WIN! +${winAmount.toFixed(2)} 🎉
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                </main>
            </div>

            {/* History Modal */}
            <FlyHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={flightHistory}
            />

            {/* Toast Notifications */}
            <ToastManager />
        </div>
        </LoginGuard>
    );
}

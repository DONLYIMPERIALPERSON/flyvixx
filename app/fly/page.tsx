'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plane, Wallet, Briefcase, Gift } from "lucide-react";
import FlyHeader from "../../components/fly-header";
import FlyHistoryModal from "../../components/fly-history-modal";
import GameCanvas from "../../components/game-canvas";
import LoginGuard from "../../components/login-guard";
import { gameStateManager } from "../../components/game-state-manager";
import { useGameSocket } from "../../hooks/useGameSocket";

export default function FlyPage() {
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState<'cash' | 'portfolio'>('cash');
    const [flightAmount, setFlightAmount] = useState('10');
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [safeFlyActive, setSafeFlyActive] = useState(false);
    const [safePlayEnabled, setSafePlayEnabled] = useState(false);
    const [selectedGift, setSelectedGift] = useState<number | null>(null);
    const [availableGifts, setAvailableGifts] = useState([0, 1, 2, 3, 4]); // 5 gifts initially
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [flightHistory, setFlightHistory] = useState<any[]>([]);

    // New betting states
    const [hasActiveBet, setHasActiveBet] = useState(false);
    const [betAmount, setBetAmount] = useState(0);
    const [betWallet, setBetWallet] = useState<'cash' | 'portfolio'>('cash');
    const [showWinAnimation, setShowWinAnimation] = useState(false);
    const [winAmount, setWinAmount] = useState(0);

    // Balances with state management
    const [cashBalance, setCashBalance] = useState(150.75);
    const [portfolioBalance, setPortfolioBalance] = useState(2500.00);
    const portfolioFlightAmount = (portfolioBalance * 0.01).toFixed(2); // 1% of portfolio

    // Socket connection for real-time game synchronization
    const { isConnecting, placeBet, cashOut, onMultiplierUpdate, onCrash, onRoundStart, onRoundEnd } = useGameSocket();

    // Subscribe to game state changes
    const [gamePhase, setGamePhase] = useState<'preparing' | 'flying' | 'crashed' | 'cashed_out'>('preparing');
    useEffect(() => {
        const unsubscribe = gameStateManager.subscribe((state) => {
            setGamePhase(state.phase);
            setCurrentMultiplier(state.multiplier);
        });
        return unsubscribe;
    }, []);





    const handleBack = () => {
        router.push('/');
    };

    const handleAmountSuggestion = (amount: number) => {
        setFlightAmount(amount.toString());
    };

    const handleSafeFly = () => {
        if (selectedGift !== null) {
            // Safe fly logic - auto cash out at 2x
            setSafeFlyActive(true);
            // Remove the selected gift (crash it)
            setAvailableGifts(prev => prev.filter(id => id !== selectedGift));
            // Reset selection
            setSelectedGift(null);
            console.log('Safe fly activated with gift:', selectedGift);
        }
    };

    const handlePlaceBet = () => {
        const amount = parseFloat(flightAmount);
        if (amount <= 0) return;

        // Check if user has enough balance
        if (selectedWallet === 'cash' && amount > cashBalance) {
            alert('Insufficient cash balance!');
            return;
        }
        if (selectedWallet === 'portfolio' && amount > portfolioBalance) {
            alert('Insufficient portfolio balance!');
            return;
        }

        // Can't place bet if round is already flying
        if (gamePhase === 'flying') {
            console.log('Round already flying - bet will be placed for next round');
            return;
        }

        // Place the bet
        setHasActiveBet(true);
        setBetAmount(amount);
        setBetWallet(selectedWallet);

        // Deduct from balance immediately
        if (selectedWallet === 'cash') {
            setCashBalance(prev => prev - amount);
        } else {
            setPortfolioBalance(prev => prev - amount);
        }

        // Consume selected gift for portfolio flights
        if (selectedWallet === 'portfolio' && selectedGift !== null) {
            setAvailableGifts(prev => prev.filter(id => id !== selectedGift));
            setSelectedGift(null);
        }

        console.log('Bet placed:', amount, selectedWallet);
    };

    const handleCashOut = () => {
        if (!hasActiveBet) return;

        const payout = betAmount * currentMultiplier;

        // Add winnings to balance
        if (betWallet === 'cash') {
            setCashBalance(prev => prev + payout);
        } else {
            setPortfolioBalance(prev => prev + payout);
        }

        // Show win animation
        setWinAmount(payout);
        setShowWinAnimation(true);
        setTimeout(() => setShowWinAnimation(false), 2000);

        // Record flight history
        const flightRecord = {
            id: Date.now().toString(),
            amount: betAmount,
            multiplier: currentMultiplier,
            payout: payout,
            flightType: betWallet,
            safePlay: betWallet === 'portfolio' && safePlayEnabled,
            timestamp: new Date(),
            result: 'win'
        };
        setFlightHistory(prev => [flightRecord, ...prev]);

        // Reset bet state
        setHasActiveBet(false);
        setBetAmount(0);

        // Cash out via socket (this will trigger the next round)
        cashOut();

        console.log('Cashed out:', payout);
    };

    // Handle crash (loss)
    useEffect(() => {
        if (gamePhase === 'crashed' && hasActiveBet) {
            // Record loss
            const flightRecord = {
                id: Date.now().toString(),
                amount: betAmount,
                multiplier: currentMultiplier,
                payout: 0,
                flightType: betWallet,
                safePlay: betWallet === 'portfolio' && safePlayEnabled,
                timestamp: new Date(),
                result: 'loss'
            };
            setFlightHistory(prev => [flightRecord, ...prev]);

            // Reset bet state
            setHasActiveBet(false);
            setBetAmount(0);

            console.log('Crashed - bet lost');
        }
    }, [gamePhase, hasActiveBet, betAmount, betWallet, safePlayEnabled, currentMultiplier, setFlightHistory]);

    return (
        <LoginGuard>
            <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            {/* Fixed Header - Stays on screen while scrolling */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
                <FlyHeader onBack={handleBack} onHistory={() => setShowHistoryModal(true)} />
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
                                    <span className="text-[#FFD700] font-bold">${cashBalance.toFixed(2)}</span>
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
                                {availableGifts.map((giftId) => {
                                    const amounts = [1, 3, 5, 10, 50];
                                    const amount = amounts[giftId] || 1;
                                    return (
                                        <button
                                            key={giftId}
                                            onClick={() => {
                                                setSelectedGift(giftId);
                                                setFlightAmount(amount.toString());
                                            }}
                                            disabled={hasActiveBet}
                                            className={`border border-white/20 rounded-lg py-2 px-3 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                                                selectedGift === giftId
                                                    ? 'bg-[#FFD700] text-[#004B49] border-[#FFD700]'
                                                    : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                        >
                                            <Gift size={16} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Control Buttons */}
                        <div className="space-y-3">
                            {/* Betting Button */}
                            {hasActiveBet && gamePhase === 'flying' ? (
                                // Cash Out Button - Show during flying with active bet
                                <button
                                    onClick={handleCashOut}
                                    className="w-full bg-red-500 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Cash Out - ${(betAmount * currentMultiplier).toFixed(2)}</span>
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
                                // Can't bet during flying
                                <button
                                    disabled
                                    className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>Round in Progress</span>
                                </button>
                            ) : (
                                // Place Bet Button - Normal state
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
                                        selectedWallet === 'portfolio' && safePlayEnabled && selectedGift === null
                                    }
                                    className={`w-full py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2 ${
                                        selectedWallet === 'portfolio' && safePlayEnabled
                                            ? 'bg-[#FFD700] text-[#004B49] hover:bg-[#E6C200] disabled:opacity-50 disabled:cursor-not-allowed'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    <span>
                                        {selectedWallet === 'portfolio' && safePlayEnabled
                                            ? `Safe Fly - $${flightAmount}`
                                            : `Place Bet - $${flightAmount}`
                                        }
                                    </span>
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
        </div>
        </LoginGuard>
    );
}

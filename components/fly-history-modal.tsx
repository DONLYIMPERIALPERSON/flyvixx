'use client';

import { X, Trophy, Target, TrendingUp } from "lucide-react";

interface FlightHistory {
    id: string;
    amount: number;
    multiplier: number;
    payout: number;
    flightType: 'cash' | 'portfolio';
    safePlay: boolean;
    timestamp: Date;
}

interface FlyHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: FlightHistory[];
}

export default function FlyHistoryModal({ isOpen, onClose, history }: FlyHistoryModalProps) {
    if (!isOpen) return null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#004B49] to-[#00695C] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                            <Trophy size={20} color="#FFD700" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Flight History</h3>
                            <p className="text-white/60 text-sm">{history.length} rounds played</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <X size={16} color="#FFD700" />
                    </button>
                </div>

                {/* History List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="p-6 text-center">
                            <Target size={48} className="text-white/30 mx-auto mb-4" />
                            <p className="text-white/60">No flights played yet</p>
                            <p className="text-white/40 text-sm mt-1">Start your first flight to see history</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {history.map((flight) => (
                                <div
                                    key={flight.id}
                                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-white/60 text-xs uppercase tracking-wide">
                                                {formatDate(flight.timestamp)}
                                            </span>
                                            <span className="text-white/40 text-xs">
                                                {formatTime(flight.timestamp)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {flight.safePlay && (
                                                <div className="w-2 h-2 bg-[#FFD700] rounded-full" title="Safe Play"></div>
                                            )}
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                flight.flightType === 'cash'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-purple-500/20 text-purple-300'
                                            }`}>
                                                {flight.flightType}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <p className="text-white/60 text-sm">Bet</p>
                                                <p className="text-white font-bold">${flight.amount}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/60 text-sm">Multiplier</p>
                                                <p className="text-[#FFD700] font-bold">{flight.multiplier.toFixed(2)}x</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/60 text-sm">Payout</p>
                                            <p className={`font-bold ${
                                                flight.payout > flight.amount
                                                    ? 'text-green-400'
                                                    : flight.payout === flight.amount
                                                        ? 'text-yellow-400'
                                                        : 'text-red-400'
                                            }`}>
                                                ${flight.payout.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {flight.safePlay && (
                                        <div className="mt-2 flex items-center space-x-1">
                                            <TrendingUp size={12} color="#FFD700" />
                                            <span className="text-[#FFD700] text-xs">Safe Play</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
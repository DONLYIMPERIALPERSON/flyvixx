'use client';

import { useState } from "react";
import { X } from "lucide-react";
import { features } from "@/data/features";
import { faqs } from "@/data/faqs";

export default function LearnSection() {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const items = [
        { text: "How It Works", image: "/learn/how-it-works.png", id: "how-it-works" },
        { text: "FAQ", image: "/learn/faq.png", id: "faq" },
        { text: "About", image: "/learn/about.png", id: "about" },
        { text: "How to Start", image: "/learn/how-to-start.png", id: "how-to-start" },
    ];

    const closeModal = () => setActiveModal(null);

    return (
        <>
            <section className="mx-2 md:mx-12 lg:mx-20 xl:mx-28 py-4">
                <h2 className="text-lg font-bold text-left mb-4">LEARN</h2>
                <div className="grid grid-cols-4 gap-2">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#DCEFEE] border border-gray-200 rounded-lg p-2 text-center shadow-lg cursor-pointer hover:bg-[#C5E1DD] transition-colors"
                            onClick={() => setActiveModal(item.id)}
                        >
                            <img src={item.image} alt={item.text} className="w-full h-16 object-cover mb-2 rounded" />
                            <p className="text-xs font-semibold text-[#004B49]">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Modal */}
            {activeModal === 'how-it-works' && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="bg-white rounded-t-xl p-6 w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative z-10">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-[#004B49]">How It Works</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-semibold text-[#004B49] mb-2">How Flight Power Works</h4>
                                <p className="text-sm text-gray-600">
                                    Lock funds in your portfolio for 30 days to receive daily "flight power" (1% of your locked amount). This gives you risk-free access to play the Aviator game without touching your principal investment.
                                </p>
                            </div>

                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-semibold text-[#004B49] mb-2">Daily Gift System</h4>
                                <p className="text-sm text-gray-600">
                                    Each day you receive "gifts" based on your level (Level 1 = 2 gifts, Level 2 = 4 gifts, etc.). Each gift allows you to place one portfolio bet using your flight power. Gifts reset daily and are consumed when you play.
                                </p>
                            </div>

                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-semibold text-[#004B49] mb-2">Safe Play Protection</h4>
                                <p className="text-sm text-gray-600">
                                    Portfolio bets can be set to "Safe Play" mode, which automatically cashes out at 1.0x multiplier. This guarantees you get your flight power back plus any gains, with zero risk of loss.
                                </p>
                            </div>

                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-semibold text-[#004B49] mb-2">Level Progression</h4>
                                <p className="text-sm text-gray-600">
                                    Build your referral network to increase your level. Higher levels unlock more daily gifts (more betting opportunities) and enhanced features. Your level determines your earning potential.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-[#004B49] mb-2">Capital Preservation</h4>
                                <p className="text-sm text-gray-600">
                                    Your locked funds have NO RISK at all. The 1% daily flight power is a reward given to you, not deducted from your locked funds. After 30 days, you get 100% of your principal back, plus all your winnings.
                                </p>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {activeModal === 'faq' && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="bg-white rounded-t-xl p-6 w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative z-10">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-[#004B49]">Frequently Asked Questions</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-4">
                                        <h4 className="font-semibold text-[#004B49] mb-2">{faq.question}</h4>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* About Modal */}
            {activeModal === 'about' && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="bg-white rounded-t-xl p-6 w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative z-10">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-[#004B49]">About FLYVIXX</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">What is FLYVIXX?</h4>
                                    <p className="text-sm text-gray-600">
                                        FLYVIXX is a strategic gaming ecosystem where your capital powers your daily play. By maintaining a 30-day locked position, you gain access to daily "Risk-Free" Aviator flights. Your original funds are never touched and are returned to you in full after the 30-day cycle.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#004B49] mb-2">Our Mission</h4>
                                    <p className="text-sm text-gray-600">
                                        To provide a safe, strategic, and rewarding gaming experience that combines the excitement of aviation-themed games with the security of capital preservation and the power of network growth.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* How to Start Modal */}
            {activeModal === 'how-to-start' && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
                    <div className="bg-white rounded-t-xl p-6 w-full max-w-md h-[80vh] transform transition-transform duration-300 flex flex-col relative z-10">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h3 className="text-xl font-bold text-[#004B49]">How to Get Started</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 1: Create Your Account</h4>
                                    <p className="text-sm text-gray-600">
                                        Sign up for a FLYVIXX account and complete the verification process to ensure account security.
                                    </p>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 2: Make Your Initial Deposit</h4>
                                    <p className="text-sm text-gray-600">
                                        Deposit funds that will be locked for a 30-day cycle. This capital will power your daily flight opportunities.
                                    </p>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 3: Start Earning Daily Flight Power</h4>
                                    <p className="text-sm text-gray-600">
                                        Receive 1% of your locked funds as daily betting power to play the Aviator game without risking your principal.
                                    </p>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 4: Play and Win</h4>
                                    <p className="text-sm text-gray-600">
                                        Use your flight power to play the Aviator game. All winnings from successful flights are yours to keep.
                                    </p>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 5: Build Your Network</h4>
                                    <p className="text-sm text-gray-600">
                                        Invite friends and build your referral network to increase your level and unlock more daily flight opportunities.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#004B49] mb-2">Step 6: Continue or Withdraw</h4>
                                    <p className="text-sm text-gray-600">
                                        After 30 days, withdraw your principal or continue the cycle for more earning opportunities.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

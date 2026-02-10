import { Metadata } from "next";
import { DollarSign, TrendingUp, Shield, Users, Gift, Plane, Lock, Clock, Target, Zap } from "lucide-react";
import NewPageHeader from "@/components/newpageheader";
import SimpleFooter from "@/components/simplefooter";

export const metadata: Metadata = {
    title: "How FLYVIXX Works - Strategic Gaming Platform Guide | Lock Funds, Earn Daily Rewards",
    description: "Learn how FLYVIXX works: Lock funds for 30 days to earn daily flight power, play Aviator game risk-free, build your referral network, and maximize earnings. Complete step-by-step guide with examples.",
    keywords: "how FLYVIXX works, strategic gaming guide, lock funds earn rewards, daily flight power, Aviator game tutorial, portfolio gaming explained, referral system, risk-free gaming, FLYVIXX gameplay, earn daily rewards",
    authors: [{ name: "FLYVIXX Team" }],
    creator: "FLYVIXX",
    publisher: "FLYVIXX",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL('https://flyvixx.com'),
    alternates: {
        canonical: '/how-it-works',
    },
    openGraph: {
        title: "How FLYVIXX Works - Strategic Gaming Platform Guide",
        description: "Complete guide to FLYVIXX: Lock funds for 30 days, earn daily flight power, play Aviator game risk-free, and build your referral network for maximum earnings.",
        url: 'https://flyvixx.com/how-it-works',
        siteName: 'FLYVIXX',
        images: [
            {
                url: '/hero-section-image.png',
                width: 1200,
                height: 630,
                alt: 'How FLYVIXX Works - Gaming Platform Guide',
            },
        ],
        locale: 'en_US',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: "How FLYVIXX Works - Strategic Gaming Guide",
        description: "Learn how to lock funds, earn daily rewards, and play risk-free with FLYVIXX's innovative gaming platform.",
        images: ['/hero-section-image.png'],
        creator: '@flyvixx',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    category: 'gaming tutorial',
    classification: 'Online Gaming Guide',
};

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <NewPageHeader />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="relative mb-16">
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-20 left-20 w-40 h-40 bg-[#FFD700]/8 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-green-500/6 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative text-center py-20 px-4">
                        {/* Main Headline */}
                        <div className="mb-10">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                                How
                                <span className="block bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] bg-clip-text text-transparent">
                                    FLYVIXX
                                </span>
                                Works
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-5xl mx-auto leading-relaxed">
                                Discover the revolutionary gaming platform that combines capital preservation with strategic gameplay.
                                Lock your funds for 30 days and earn daily rewards while playing risk-free.
                            </p>
                        </div>

                        {/* Key Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 max-w-6xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Lock className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Lock & Earn</h3>
                                <p className="text-white/80 text-lg leading-relaxed">Lock funds for 30 days and earn 1% daily flight power as your betting allowance</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <Plane className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Risk-Free Play</h3>
                                <p className="text-white/80 text-lg leading-relaxed">Use flight power to play Aviator without risking your principal capital</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <TrendingUp className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Build Wealth</h3>
                                <p className="text-white/80 text-lg leading-relaxed">Keep all winnings while your locked funds stay completely safe</p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                            <a
                                href="/"
                                className="bg-gradient-to-r from-[#FFD700] to-yellow-400 text-[#004B49] px-12 py-5 rounded-2xl font-bold text-xl hover:from-yellow-400 hover:to-[#FFD700] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                            >
                                Start Your Journey
                            </a>
                            <a
                                href="#core-concept"
                                className="bg-white/10 backdrop-blur-lg text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
                            >
                                Learn More
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="flex flex-wrap justify-center items-center gap-10 text-white/70">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span className="text-lg font-medium">100% Capital Safe</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Daily Rewards</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Unlimited Upside</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Strategic Gaming</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Concept */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Zap className="w-8 h-8 text-[#FFD700] mr-3" />
                            The Core Concept: Flight Power
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">What is Flight Power?</h3>
                                <p className="text-white/90 mb-4">
                                    Flight Power is your daily betting allowance earned from locked funds. Every day you receive 1% of your locked amount as "flight power" that you can use to play the Aviator game.
                                </p>
                                <div className="bg-[#FFD700]/20 rounded-lg p-4 mb-4">
                                    <p className="text-[#004B49] font-semibold">Example:</p>
                                    <p className="text-[#004B49]">
                                        Lock $1,000 → Get $10 flight power daily → Play Aviator game → Keep all winnings
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Why Risk-Free?</h3>
                                <p className="text-white/90 mb-4">
                                    Your original $1,000 stays completely safe. The $10 flight power is a reward given to you - not deducted from your locked funds. After 30 days, you get your full $1,000 back plus all your winnings.
                                </p>
                                <div className="bg-green-500/20 rounded-lg p-4">
                                    <p className="text-green-400 font-semibold">Key Benefit:</p>
                                    <p className="text-green-400">
                                        100% capital preservation + unlimited upside potential
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step-by-Step Guide */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Target className="w-8 h-8 text-[#FFD700] mr-3" />
                            Step-by-Step Guide: Getting Started
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Create Your Account</h3>
                                    <p className="text-white/90 mb-2">
                                        Sign up for a FLYVIXX account and complete the verification process. This ensures account security and allows you to participate in our gaming ecosystem.
                                    </p>
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <p className="text-white/80 text-sm">Time: 5 minutes | Requirements: Valid email and phone number</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Make Your Initial Deposit</h3>
                                    <p className="text-white/90 mb-2">
                                        Deposit funds that will be locked for a 30-day cycle. This capital will power your daily flight opportunities and determine your earning potential.
                                    </p>
                                    <div className="bg-white/5 rounded-lg p-3 mb-2">
                                        <p className="text-white/80 text-sm">Minimum: $50 | Maximum: Unlimited | Lock Period: 30 days</p>
                                    </div>
                                    <div className="bg-blue-500/20 rounded-lg p-3">
                                        <p className="text-blue-300 text-sm font-semibold">💡 Pro Tip:</p>
                                        <p className="text-blue-300 text-sm">Start with an amount you're comfortable with. You can always add more funds later.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Start Earning Daily Flight Power</h3>
                                    <p className="text-white/90 mb-2">
                                        Immediately begin receiving 1% of your locked funds as daily flight power. This happens automatically every day at midnight.
                                    </p>
                                    <div className="bg-green-500/20 rounded-lg p-3">
                                        <p className="text-green-400 font-semibold">Example Calculation:</p>
                                        <p className="text-green-400">$500 locked = $5 flight power daily</p>
                                        <p className="text-green-400">$1,000 locked = $10 flight power daily</p>
                                        <p className="text-green-400">$5,000 locked = $50 flight power daily</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Play and Win with Daily Gifts</h3>
                                    <p className="text-white/90 mb-2">
                                        Receive daily "gifts" based on your level (Level 1 = 2 gifts, Level 2 = 4 gifts, etc.). Each gift allows you to place one portfolio bet using your flight power.
                                    </p>
                                    <div className="bg-purple-500/20 rounded-lg p-3 mb-2">
                                        <p className="text-purple-300 font-semibold">Gift System:</p>
                                        <p className="text-purple-300">• Level 1: 2 gifts daily (2 betting opportunities)</p>
                                        <p className="text-purple-300">• Level 2: 4 gifts daily (4 betting opportunities)</p>
                                        <p className="text-purple-300">• Level 3: 6 gifts daily (6 betting opportunities)</p>
                                    </div>
                                    <div className="bg-yellow-500/20 rounded-lg p-3">
                                        <p className="text-yellow-300 text-sm">🎯 Each gift = 1 Aviator game bet using your flight power</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Build Your Referral Network</h3>
                                    <p className="text-white/90 mb-2">
                                        Invite friends and build your referral network to increase your level and unlock more daily gifts. Higher levels = more betting opportunities = more earning potential.
                                    </p>
                                    <div className="bg-indigo-500/20 rounded-lg p-3">
                                        <p className="text-indigo-300 font-semibold">Level Progression:</p>
                                        <p className="text-indigo-300">• 0-4 referrals = Level 1 (2 gifts)</p>
                                        <p className="text-indigo-300">• 5+ referrals = Level 2 (4 gifts)</p>
                                        <p className="text-indigo-300">• 10+ referrals = Level 3 (6 gifts)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#FFD700] text-[#004B49] rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Continue or Withdraw</h3>
                                    <p className="text-white/90 mb-2">
                                        After 30 days, withdraw your principal or continue the cycle for more earning opportunities. Your choice determines your growth trajectory.
                                    </p>
                                    <div className="bg-orange-500/20 rounded-lg p-3">
                                        <p className="text-orange-300 font-semibold">End of 30-Day Cycle:</p>
                                        <p className="text-orange-300">• Get 100% of locked funds back</p>
                                        <p className="text-orange-300">• Keep all winnings from flight power bets</p>
                                        <p className="text-orange-300">• Choose to continue or withdraw</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Real Examples */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <DollarSign className="w-8 h-8 text-[#FFD700] mr-3" />
                            Real-World Examples
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Example 1: Conservative Player</h3>
                                <div className="space-y-3 text-white/90">
                                    <p><strong>Investment:</strong> $500 locked for 30 days</p>
                                    <p><strong>Daily Flight Power:</strong> $5 (1% of $500)</p>
                                    <p><strong>Daily Gifts:</strong> 2 (Level 1)</p>
                                    <p><strong>Monthly Flight Power:</strong> $150 total</p>
                                    <p><strong>Risk:</strong> $0 (capital preserved)</p>
                                    <p><strong>Potential:</strong> Unlimited upside from Aviator wins</p>
                                </div>
                                <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                                    <p className="text-green-400 text-sm font-semibold">30-Day Outcome:</p>
                                    <p className="text-green-400 text-sm">$500 principal returned + all Aviator winnings</p>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Example 2: Active Player</h3>
                                <div className="space-y-3 text-white/90">
                                    <p><strong>Investment:</strong> $2,000 locked for 30 days</p>
                                    <p><strong>Daily Flight Power:</strong> $20 (1% of $2,000)</p>
                                    <p><strong>Daily Gifts:</strong> 4 (Level 2 with 5+ referrals)</p>
                                    <p><strong>Monthly Flight Power:</strong> $600 total</p>
                                    <p><strong>Betting Opportunities:</strong> 120 games/month</p>
                                    <p><strong>Network Bonus:</strong> Higher level = more gifts</p>
                                </div>
                                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                                    <p className="text-blue-400 text-sm font-semibold">Strategic Advantage:</p>
                                    <p className="text-blue-400 text-sm">More bets + referral network = maximum earning potential</p>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Example 3: Network Builder</h3>
                                <div className="space-y-3 text-white/90">
                                    <p><strong>Investment:</strong> $1,000 locked</p>
                                    <p><strong>Referral Network:</strong> 15 active referrals</p>
                                    <p><strong>Level Achieved:</strong> 3 (6 daily gifts)</p>
                                    <p><strong>Daily Flight Power:</strong> $10</p>
                                    <p><strong>Daily Betting:</strong> 6 opportunities</p>
                                    <p><strong>Monthly Potential:</strong> 180 games</p>
                                </div>
                                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                                    <p className="text-purple-400 text-sm font-semibold">Network Power:</p>
                                    <p className="text-purple-400 text-sm">Referrals create passive income through higher levels</p>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Example 4: Long-Term Growth</h3>
                                <div className="space-y-3 text-white/90">
                                    <p><strong>Strategy:</strong> Reinvest winnings</p>
                                    <p><strong>Initial Lock:</strong> $500</p>
                                    <p><strong>Month 1 Winnings:</strong> $200 from Aviator</p>
                                    <p><strong>Month 2 Lock:</strong> $700 (original + winnings)</p>
                                    <p><strong>Month 2 Flight Power:</strong> $7 daily</p>
                                    <p><strong>Compounding Effect:</strong> Growing capital base</p>
                                </div>
                                <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-400 text-sm font-semibold">Growth Strategy:</p>
                                    <p className="text-yellow-400 text-sm">Reinvest profits to increase future flight power</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Risk-Free Gaming */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Shield className="w-8 h-8 text-[#FFD700] mr-3" />
                            Understanding Risk-Free Gaming
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">How Does It Work?</h3>
                                <p className="text-white/90 mb-4">
                                    When you play with flight power, you're using the daily reward given to you - not your locked principal. This creates a unique risk-free gaming experience where you can participate in the excitement of Aviator without any capital risk.
                                </p>
                                <div className="bg-green-500/20 rounded-lg p-4 mb-4">
                                    <p className="text-green-400 font-semibold">Safe Play Mode:</p>
                                    <p className="text-green-400">Automatically cash out at 1.0x multiplier for guaranteed returns</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">The Psychology of Risk-Free</h3>
                                <p className="text-white/90 mb-4">
                                    Traditional gaming involves risk vs. reward. FLYVIXX changes this equation by removing the risk entirely. You can play strategically, learn the game, and build confidence without financial pressure.
                                </p>
                                <div className="bg-blue-500/20 rounded-lg p-4">
                                    <p className="text-blue-400 font-semibold">Learning Advantage:</p>
                                    <p className="text-blue-400">Practice strategies and game patterns without financial risk</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Capital Preservation Guarantee</h3>
                            <div className="bg-white/10 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Shield className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h4 className="text-white font-semibold mb-2">100% Safe</h4>
                                        <p className="text-white/80 text-sm">Your locked funds are never touched</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Gift className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h4 className="text-white font-semibold mb-2">Free Rewards</h4>
                                        <p className="text-white/80 text-sm">Flight power is given to you daily</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <h4 className="text-white font-semibold mb-2">Unlimited Upside</h4>
                                        <p className="text-white/80 text-sm">Keep 100% of all Aviator winnings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Referral System */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Users className="w-8 h-8 text-[#FFD700] mr-3" />
                            The Power of Referral Network
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Why Referrals Matter</h3>
                                <p className="text-white/90 mb-4">
                                    Your referral network directly impacts your level, which determines how many daily gifts (betting opportunities) you receive. More referrals = higher level = more chances to win.
                                </p>
                                <div className="bg-indigo-500/20 rounded-lg p-4">
                                    <p className="text-indigo-300 font-semibold">Level Benefits:</p>
                                    <p className="text-indigo-300">• Level 1: 2 gifts/day (basic)</p>
                                    <p className="text-indigo-300">• Level 2: 4 gifts/day (double opportunities)</p>
                                    <p className="text-indigo-300">• Level 3+: 6+ gifts/day (maximum potential)</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Building Your Network</h3>
                                <p className="text-white/90 mb-4">
                                    Share your unique referral link with friends, family, and social networks. When they sign up and lock funds, they become part of your network and help you level up.
                                </p>
                                <div className="bg-green-500/20 rounded-lg p-4">
                                    <p className="text-green-400 font-semibold">Network Growth Tips:</p>
                                    <p className="text-green-400">• Share on social media</p>
                                    <p className="text-green-400">• Tell friends about risk-free gaming</p>
                                    <p className="text-green-400">• Explain the capital preservation benefits</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Referral Success Stories</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-white font-semibold mb-3">From Level 1 to Level 3</h4>
                                    <p className="text-white/80 text-sm mb-3">
                                        "I started with 2 daily gifts. After referring 12 friends, I now get 6 gifts daily. That's triple the betting opportunities!"
                                    </p>
                                    <p className="text-[#FFD700] font-semibold">- Sarah, Level 3 Player</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-white font-semibold mb-3">Network Building Strategy</h4>
                                    <p className="text-white/80 text-sm mb-3">
                                        "I focused on quality referrals. My network of 8 active players helped me reach Level 2 and doubled my daily earnings potential."
                                    </p>
                                    <p className="text-[#FFD700] font-semibold">- Mike, Strategic Player</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Can I withdraw my locked funds early?</h3>
                                <p className="text-white/90">
                                    No, funds must remain locked for the full 30-day cycle to maintain the risk-free guarantee. This ensures capital preservation for all participants.
                                </p>
                            </div>
                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">What happens to my flight power if I don't use it?</h3>
                                <p className="text-white/90">
                                    Unused flight power expires daily. It's designed to encourage active participation and strategic gameplay.
                                </p>
                            </div>
                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Is there a maximum amount I can lock?</h3>
                                <p className="text-white/90">
                                    No maximum limits exist. However, we recommend starting with amounts you're comfortable with and can monitor actively.
                                </p>
                            </div>
                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">How does Safe Play mode work?</h3>
                                <p className="text-white/90">
                                    Safe Play automatically cashes out your bet at 1.0x multiplier, guaranteeing you get your flight power back plus a small profit, with zero risk of loss.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[#004B49] mb-4">Ready to Start Your Flight Journey?</h2>
                        <p className="text-[#004B49]/80 mb-6 text-lg">
                            Join thousands of players who have discovered the power of strategic, risk-free gaming with FLYVIXX.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="bg-[#004B49] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#00695C] transition-colors"
                            >
                                Start Playing Now
                            </a>
                            <a
                                href="#referral-system"
                                className="bg-white/20 text-[#004B49] px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                            >
                                Learn About Referrals
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SimpleFooter />
        </div>
    );
}
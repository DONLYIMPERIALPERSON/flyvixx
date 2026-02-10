import { Metadata } from "next";
import { Users, TrendingUp, Gift, Award, Share2, DollarSign, Target, Zap, CheckCircle, Star } from "lucide-react";
import NewPageHeader from "@/components/newpageheader";
import SimpleFooter from "@/components/simplefooter";

export const metadata: Metadata = {
    title: "FLYVIXX Referral Program - Earn More with Network Growth | Level Up & Get Rewards",
    description: "Join FLYVIXX referral program and level up your earnings. Build your network, unlock more daily gifts, and earn rewards. Level 1-3 progression with increasing benefits.",
    keywords: "FLYVIXX referral program, earn with referrals, level up gaming rewards, network growth, daily gifts system, referral bonuses, FLYVIXX levels, passive income gaming",
    authors: [{ name: "FLYVIXX Team" }],
    creator: "FLYVIXX",
    publisher: "FLYVIXX",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL('https://flyvixx.com'),
    alternates: {
        canonical: '/referrals',
    },
    openGraph: {
        title: "FLYVIXX Referral Program - Level Up Your Earnings",
        description: "Build your referral network, unlock higher levels, and earn more daily gifts. Join the most rewarding referral program in gaming.",
        url: 'https://flyvixx.com/referrals',
        siteName: 'FLYVIXX',
        images: [
            {
                url: '/hero-section-image.png',
                width: 1200,
                height: 630,
                alt: 'FLYVIXX Referral Program - Level Up Your Earnings',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FLYVIXX Referral Program - Level Up & Earn More",
        description: "Build your network, unlock levels, and get more daily gifts. The smartest way to grow your gaming rewards.",
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
    category: 'referral program',
    classification: 'Gaming Referral System',
};

export default function ReferralsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <NewPageHeader />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="relative mb-16">
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative text-center py-16 px-4">
                        {/* Main Headline */}
                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Turn Your Network Into
                                <span className="block bg-gradient-to-r from-[#FFD700] to-yellow-400 bg-clip-text text-transparent">
                                    Wealth
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                                Build your referral network and unlock higher levels with more daily gifts.
                                Every friend you bring increases your earning potential exponentially.
                            </p>
                        </div>

                        {/* Key Stats/Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Build Network</h3>
                                <p className="text-white/80">Share your unique referral link and grow your community</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Level Up</h3>
                                <p className="text-white/80">Unlock higher levels with more daily gifts and opportunities</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Earn More</h3>
                                <p className="text-white/80">Get more betting opportunities and maximize your earnings</p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <a
                                href="/"
                                className="bg-gradient-to-r from-[#FFD700] to-yellow-400 text-[#004B49] px-10 py-4 rounded-2xl font-bold text-lg hover:from-yellow-400 hover:to-[#FFD700] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Start Referring Now
                            </a>
                            <div className="text-white/60 text-sm">
                                Join thousands of successful network builders
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">100% Risk-Free</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">Capital Preserved</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">Unlimited Potential</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Level System */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Award className="w-8 h-8 text-yellow-400 mr-3" />
                            Level System & Benefits
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Level 1 */}
                            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                                <div className="flex items-center mb-4">
                                    <div className="bg-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">1</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Level 1</h3>
                                        <p className="text-white/80 text-sm">Starter Level</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-white/90">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">0-4 active referrals</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Gift className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">2 daily gifts</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Target className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">2 betting opportunities/day</span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-gray-500/20 rounded-lg">
                                    <p className="text-gray-300 text-xs">Perfect for getting started</p>
                                </div>
                            </div>

                            {/* Level 2 */}
                            <div className="bg-white/10 rounded-lg p-6 border border-blue-500/30 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                        POPULAR
                                    </div>
                                </div>
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">2</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Level 2</h3>
                                        <p className="text-white/80 text-sm">Network Builder</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-white/90">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">5+ active referrals</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Gift className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">4 daily gifts</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Target className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">4 betting opportunities/day</span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
                                    <p className="text-blue-300 text-xs">Double the opportunities!</p>
                                </div>
                            </div>

                            {/* Level 3 */}
                            <div className="bg-white/10 rounded-lg p-6 border border-yellow-500/30 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-yellow-500 text-[#004B49] px-3 py-1 rounded-full text-xs font-bold">
                                        ELITE
                                    </div>
                                </div>
                                <div className="flex items-center mb-4">
                                    <div className="bg-yellow-500 text-[#004B49] rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">3</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Level 3</h3>
                                        <p className="text-white/80 text-sm">Elite Player</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center text-white/90">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">10+ active referrals</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Gift className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">6 daily gifts</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <Target className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                                        <span className="text-sm">6 betting opportunities/day</span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                                    <p className="text-yellow-300 text-xs">Maximum earning potential!</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-indigo-500/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-indigo-300 mb-3">How Levels Work</h3>
                            <p className="text-white/90 mb-4">
                                Your level is determined by the number of active referrals in your network. Active referrals are friends who have locked funds and are actively playing.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">0-4</div>
                                    <div className="text-sm text-indigo-300">Active Referrals</div>
                                    <div className="text-xs text-indigo-400">Level 1</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">5+</div>
                                    <div className="text-sm text-indigo-300">Active Referrals</div>
                                    <div className="text-xs text-indigo-400">Level 2</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">10+</div>
                                    <div className="text-sm text-indigo-300">Active Referrals</div>
                                    <div className="text-xs text-indigo-400">Level 3</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How Referrals Work */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Share2 className="w-8 h-8 text-green-400 mr-3" />
                            How Referrals Work
                        </h2>

                        <div className="space-y-8">
                            <div className="bg-green-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-300 mb-3">Step-by-Step Referral Process</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="text-white font-semibold">Get Your Referral Link</p>
                                            <p className="text-white/80 text-sm">Your unique referral link is automatically generated when you sign up</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="text-white font-semibold">Share with Friends</p>
                                            <p className="text-white/80 text-sm">Send your link via social media, messaging apps, or email</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="text-white font-semibold">Friends Sign Up & Lock Funds</p>
                                            <p className="text-white/80 text-sm">They create accounts and lock funds to become active referrals</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                                        <div>
                                            <p className="text-white font-semibold">Level Up Automatically</p>
                                            <p className="text-white/80 text-sm">Your level increases based on active referrals in your network</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                                        <div>
                                            <p className="text-white font-semibold">Earn More Daily Gifts</p>
                                            <p className="text-white/80 text-sm">Higher levels unlock more daily betting opportunities</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">What Makes a Referral "Active"?</h4>
                                    <ul className="text-white/90 space-y-2">
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                            Must have locked funds
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                            Account must be active
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                            Within the 30-day lock period
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Referral Benefits</h4>
                                    <ul className="text-white/90 space-y-2">
                                        <li className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                                            Higher daily gift limits
                                        </li>
                                        <li className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                                            More betting opportunities
                                        </li>
                                        <li className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                                            Increased earning potential
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Success Stories */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Zap className="w-8 h-8 text-orange-400 mr-3" />
                            Success Stories
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/10 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        A
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-white font-semibold">Alex Chen</h4>
                                        <p className="text-white/80 text-sm">Level 3 Player</p>
                                    </div>
                                </div>
                                <p className="text-white/90 mb-3">
                                    "Started with Level 1 and 2 daily gifts. Built my network to 15 active referrals and now get 6 gifts daily. That's triple the betting opportunities!"
                                </p>
                                <div className="flex items-center text-blue-400">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-semibold">300% increase in daily opportunities</span>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        S
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-white font-semibold">Sarah Johnson</h4>
                                        <p className="text-white/80 text-sm">Level 2 Player</p>
                                    </div>
                                </div>
                                <p className="text-white/90 mb-3">
                                    "Referred 8 friends from my social circle. Went from Level 1 to Level 2 and doubled my daily earnings. The referral system really works!"
                                </p>
                                <div className="flex items-center text-green-400">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-semibold">100% increase in daily earnings</span>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        M
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-white font-semibold">Marcus Rodriguez</h4>
                                        <p className="text-white/80 text-sm">Level 3 Player</p>
                                    </div>
                                </div>
                                <p className="text-white/90 mb-3">
                                    "Built a network of 12 active players. Now I get 6 daily gifts instead of 2. The compounding effect is incredible!"
                                </p>
                                <div className="flex items-center text-purple-400">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-semibold">12 active referrals</span>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        L
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-white font-semibold">Lisa Wang</h4>
                                        <p className="text-white/80 text-sm">Level 2 Player</p>
                                    </div>
                                </div>
                                <p className="text-white/90 mb-3">
                                    "Started sharing on social media and gaming forums. Now have 7 active referrals and Level 2 status. My daily rewards increased significantly!"
                                </p>
                                <div className="flex items-center text-yellow-400">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-semibold">Social media strategy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Getting Started */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Target className="w-8 h-8 text-red-400 mr-3" />
                            Getting Started with Referrals
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Where to Find Your Referral Link</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span>Available in your account dashboard</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span>Located in the referrals section</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span>Unique link generated for each user</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Sharing Strategies</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                        <span>Social media platforms</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                        <span>Gaming communities and forums</span>
                                    </div>
                                    <div className="flex items-center text-white/90">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                        <span>Personal messaging and emails</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-orange-500/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-orange-300 mb-3">Pro Tips for Success</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Quality Over Quantity</h4>
                                    <p className="text-white/80 text-sm">Focus on friends who are genuinely interested in strategic gaming</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Explain the Benefits</h4>
                                    <p className="text-white/80 text-sm">Share how capital preservation and daily rewards work</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Be Patient</h4>
                                    <p className="text-white/80 text-sm">Referrals need time to lock funds and become active</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Stay Active</h4>
                                    <p className="text-white/80 text-sm">Regular engagement keeps your network growing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[#004B49] mb-4">Start Building Your Network Today</h2>
                        <p className="text-[#004B49]/80 mb-6 text-lg">
                            Every friend you bring increases your level and multiplies your daily rewards. Join the ranks of successful network builders.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="bg-[#004B49] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#00695C] transition-colors"
                            >
                                Get Your Referral Link
                            </a>
                            <a
                                href="/how-it-works"
                                className="bg-white/20 text-[#004B49] px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                            >
                                Learn How It Works
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SimpleFooter />
        </div>
    );
}
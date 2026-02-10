import { Metadata } from "next";
import { Users, Target, Shield, TrendingUp, Award, Heart, Lightbulb, Globe } from "lucide-react";
import NewPageHeader from "@/components/newpageheader";
import SimpleFooter from "@/components/simplefooter";

export const metadata: Metadata = {
    title: "About FLYVIXX - Strategic Gaming Platform | Our Mission & Vision",
    description: "Learn about FLYVIXX's mission to revolutionize strategic gaming. Discover our commitment to capital preservation, risk-free gaming, and building a community of successful players.",
    keywords: "about FLYVIXX, gaming platform mission, strategic gaming company, capital preservation, risk-free gaming, FLYVIXX story, gaming innovation, player community",
    authors: [{ name: "FLYVIXX Team" }],
    creator: "FLYVIXX",
    publisher: "FLYVIXX",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL('https://flyvixx.com'),
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: "About FLYVIXX - Strategic Gaming Platform",
        description: "Discover FLYVIXX's mission to create a revolutionary gaming ecosystem focused on capital preservation and strategic gameplay.",
        url: 'https://flyvixx.com/about',
        siteName: 'FLYVIXX',
        images: [
            {
                url: '/hero-section-image.png',
                width: 1200,
                height: 630,
                alt: 'About FLYVIXX - Gaming Platform Mission',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "About FLYVIXX - Strategic Gaming Platform",
        description: "Learn about our mission to revolutionize gaming with capital preservation and strategic gameplay.",
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
    category: 'company',
    classification: 'Gaming Company',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#004B49] via-[#00695C] to-[#00796B]">
            <NewPageHeader />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="relative mb-16">
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-[#FFD700]/8 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative text-center py-20 px-4">
                        {/* Main Headline */}
                        <div className="mb-10">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                                Welcome to the
                                <span className="block bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] bg-clip-text text-transparent">
                                    Future of Gaming
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-5xl mx-auto leading-relaxed">
                                FLYVIXX is not just another gaming platform. We're pioneering a revolutionary approach that combines
                                the excitement of strategic gaming with the security of capital preservation.
                            </p>
                        </div>

                        {/* Key Values */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14 max-w-7xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">100% Safe</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Capital Preservation Guarantee</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Strategic</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Smart Gaming Approach</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Community</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Player Network & Support</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Rewarding</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Daily Benefits & Growth</p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                            <a
                                href="/how-it-works"
                                className="bg-gradient-to-r from-[#FFD700] to-yellow-400 text-[#004B49] px-12 py-5 rounded-2xl font-bold text-xl hover:from-yellow-400 hover:to-[#FFD700] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                            >
                                Learn How It Works
                            </a>
                            <a
                                href="/"
                                className="bg-white/10 backdrop-blur-lg text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
                            >
                                Start Your Journey
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Revolutionary Platform</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Capital Preservation</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Community Driven</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Strategic Gaming</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Story */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Heart className="w-8 h-8 text-red-400 mr-3" />
                            Our Story
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">The Problem with Traditional Gaming</h3>
                                <p className="text-white/90 mb-4">
                                    Traditional online gaming platforms often create a false dichotomy: high-risk, high-reward gameplay where players can lose their entire stake in moments. This creates unnecessary stress and financial pressure that detracts from the enjoyment of gaming.
                                </p>
                                <div className="bg-red-500/20 rounded-lg p-4">
                                    <p className="text-red-300 font-semibold">Traditional Gaming Issues:</p>
                                    <ul className="text-red-300 text-sm mt-2 space-y-1">
                                        <li>• High financial risk with potential total loss</li>
                                        <li>• Emotional stress from unpredictable outcomes</li>
                                        <li>• Limited strategic depth in gameplay</li>
                                        <li>• Lack of long-term player benefits</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">The FLYVIXX Solution</h3>
                                <p className="text-white/90 mb-4">
                                    We recognized that gaming should be both exciting and sustainable. Our innovative approach eliminates financial risk while maintaining the thrill of strategic gameplay. By requiring players to lock funds for 30 days, we create a system where everyone wins.
                                </p>
                                <div className="bg-green-500/20 rounded-lg p-4">
                                    <p className="text-green-300 font-semibold">FLYVIXX Advantages:</p>
                                    <ul className="text-green-300 text-sm mt-2 space-y-1">
                                        <li>• 100% capital preservation guarantee</li>
                                        <li>• Daily flight power rewards</li>
                                        <li>• Strategic gameplay with calculated risks</li>
                                        <li>• Community-driven growth through referrals</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Mission */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Target className="w-8 h-8 text-blue-400 mr-3" />
                            Our Mission
                        </h2>
                        <div className="text-center mb-8">
                            <p className="text-xl text-white/90 mb-6">
                                To create a gaming ecosystem where strategy, skill, and community building are rewarded, while ensuring every player's capital remains completely safe.
                            </p>
                            <div className="bg-[#FFD700]/20 rounded-lg p-6 max-w-4xl mx-auto">
                                <p className="text-[#004B49] text-lg font-semibold">
                                    "We believe gaming should be a positive force in people's lives - combining excitement with financial security and community growth."
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Capital Preservation</h3>
                                <p className="text-white/90 text-sm">
                                    Your locked funds are never at risk. We use innovative financial structures to ensure 100% safety of principal investments.
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Strategic Gaming</h3>
                                <p className="text-white/90 text-sm">
                                    Every game requires thought and planning. Success comes from understanding patterns and making calculated decisions.
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Community Focus</h3>
                                <p className="text-white/90 text-sm">
                                    We build a supportive community where experienced players help newcomers succeed through our referral system.
                                </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Innovation</h3>
                                <p className="text-white/90 text-sm">
                                    Constantly evolving our platform with new features, better rewards, and enhanced user experiences.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Makes Us Different */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Lightbulb className="w-8 h-8 text-yellow-400 mr-3" />
                            What Makes FLYVIXX Different
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Traditional Gaming Platforms</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-red-300">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span className="text-sm">High risk of total loss</span>
                                    </div>
                                    <div className="flex items-center text-red-300">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span className="text-sm">Pure luck-based outcomes</span>
                                    </div>
                                    <div className="flex items-center text-red-300">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span className="text-sm">No long-term benefits</span>
                                    </div>
                                    <div className="flex items-center text-red-300">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span className="text-sm">Individual player experience</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">FLYVIXX Gaming Platform</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        <span className="text-sm">100% capital preservation</span>
                                    </div>
                                    <div className="flex items-center text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        <span className="text-sm">Strategy-driven gameplay</span>
                                    </div>
                                    <div className="flex items-center text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        <span className="text-sm">Daily rewards and benefits</span>
                                    </div>
                                    <div className="flex items-center text-green-300">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                        <span className="text-sm">Community and referral growth</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 bg-indigo-500/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-indigo-300 mb-3">The Flight Power Revolution</h3>
                            <p className="text-white/90 mb-4">
                                Our unique "Flight Power" system turns locked capital into a daily betting allowance. This creates a sustainable gaming model where players earn rewards simply by participating, while maintaining full control over their risk levels.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">1%</div>
                                    <div className="text-sm text-indigo-300">Daily Flight Power</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">30</div>
                                    <div className="text-sm text-indigo-300">Day Lock Period</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-300 mb-1">100%</div>
                                    <div className="text-sm text-indigo-300">Capital Returned</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Values */}
                <section className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Award className="w-8 h-8 text-purple-400 mr-3" />
                            Our Core Values
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/10 rounded-lg p-6 text-center">
                                <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Safety First</h3>
                                <p className="text-white/80 text-sm">
                                    Every player's capital is completely protected through our innovative financial structures.
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6 text-center">
                                <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                                <p className="text-white/80 text-sm">
                                    We foster a supportive community where success is shared and growth is collective.
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6 text-center">
                                <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
                                <p className="text-white/80 text-sm">
                                    Constantly pushing boundaries to create better gaming experiences for our community.
                                </p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-6 text-center">
                                <Globe className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
                                <p className="text-white/80 text-sm">
                                    Open about our systems, rewards, and how we ensure fair play for everyone.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Join Our Community */}
                <section className="text-center">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[#004B49] mb-4">Join the FLYVIXX Revolution</h2>
                        <p className="text-[#004B49]/80 mb-6 text-lg">
                            Be part of a gaming community that values strategy, safety, and shared success. Start your journey today and discover the future of gaming.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/how-it-works"
                                className="bg-[#004B49] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#00695C] transition-colors"
                            >
                                Learn How It Works
                            </a>
                            <a
                                href="/"
                                className="bg-white/20 text-[#004B49] px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                            >
                                Start Your Journey
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SimpleFooter />
        </div>
    );
}
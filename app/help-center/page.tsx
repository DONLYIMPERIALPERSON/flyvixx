import { Metadata } from "next";
import { MessageCircle, Mail, CreditCard, ArrowUpCircle, ArrowDownCircle, Lock, HelpCircle, Clock, CheckCircle, AlertTriangle, Info } from "lucide-react";
import NewPageHeader from "@/components/newpageheader";
import SimpleFooter from "@/components/simplefooter";

export const metadata: Metadata = {
    title: "FLYVIXX Help Center - Support, Guides & FAQ | Deposit, Withdraw, Play",
    description: "Get help with FLYVIXX: Learn how to deposit funds, withdraw winnings, play Aviator game, lock funds for rewards, and get customer support. Complete user guides and troubleshooting.",
    keywords: "FLYVIXX help center, customer support, how to deposit, how to withdraw, Aviator game guide, lock funds help, FLYVIXX support, gaming tutorials, withdrawal guide, deposit guide",
    authors: [{ name: "FLYVIXX Team" }],
    creator: "FLYVIXX",
    publisher: "FLYVIXX",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL('https://flyvixx.com'),
    alternates: {
        canonical: '/help-center',
    },
    openGraph: {
        title: "FLYVIXX Help Center - Support & Guides",
        description: "Complete help center with guides for deposits, withdrawals, gameplay, and customer support for FLYVIXX users.",
        url: 'https://flyvixx.com/help-center',
        siteName: 'FLYVIXX',
        images: [
            {
                url: '/hero-section-image.png',
                width: 1200,
                height: 630,
                alt: 'FLYVIXX Help Center - Support & Guides',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FLYVIXX Help Center - Support & Guides",
        description: "Get help with deposits, withdrawals, gameplay, and support for FLYVIXX.",
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
    category: 'help center',
    classification: 'Customer Support',
};

export default function HelpCenterPage() {
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
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative text-center py-20 px-4">
                        {/* Main Headline */}
                        <div className="mb-10">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                                Get Help &
                                <span className="block bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] bg-clip-text text-transparent">
                                    Support
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-5xl mx-auto leading-relaxed">
                                Find answers to your questions, learn how to use FLYVIXX effectively, and get the support you need.
                                Our comprehensive help center has everything you need to succeed.
                            </p>
                        </div>

                        {/* Quick Access Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 max-w-6xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Get instant help from our support team available 24/7</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <HelpCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Help Guides</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Step-by-step guides for deposits, withdrawals, and gameplay</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
                                <p className="text-white/80 text-sm leading-relaxed">Send detailed questions and get responses within 24 hours</p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                            <a
                                href="#contact-support"
                                className="bg-gradient-to-r from-[#FFD700] to-yellow-400 text-[#004B49] px-12 py-5 rounded-2xl font-bold text-xl hover:from-yellow-400 hover:to-[#FFD700] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                            >
                                Contact Support
                            </a>
                            <a
                                href="#quick-help"
                                className="bg-white/10 backdrop-blur-lg text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
                            >
                                Browse Guides
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span className="text-lg font-medium">24/7 Support</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Expert Help</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Quick Resolution</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span className="text-lg font-medium">Comprehensive Guides</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Support Section */}
                <section id="contact-support" className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <MessageCircle className="w-8 h-8 text-[#FFD700] mr-3" />
                            Contact Support
                        </h2>
                        <p className="text-white/90 mb-6">
                            Need immediate help? Our support team is here to assist you. Choose your preferred contact method below.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Live Chat */}
                            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                                <div className="flex items-center mb-4">
                                    <div className="bg-green-500/20 p-3 rounded-lg mr-4">
                                        <MessageCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Live Chat Support</h3>
                                        <p className="text-white/80 text-sm">Get instant help from our team</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-blue-500/20 rounded-lg p-3">
                                        <p className="text-blue-300 text-sm font-semibold">How to access live chat:</p>
                                        <ol className="text-blue-300 text-sm mt-2 space-y-1 list-decimal list-inside">
                                            <li>Lock some funds in your portfolio</li>
                                            <li>Click on your portfolio to open it</li>
                                            <li>Click the "Support" tab</li>
                                            <li>Start a live chat conversation</li>
                                        </ol>
                                    </div>
                                    <div className="bg-green-500/20 rounded-lg p-3">
                                        <p className="text-green-400 text-sm">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Available 24/7
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email Support */}
                            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                                        <Mail className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Email Support</h3>
                                        <p className="text-white/80 text-sm">Send us a detailed message</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-yellow-500/20 rounded-lg p-3">
                                        <p className="text-yellow-300 text-sm font-semibold">Email us at:</p>
                                        <a
                                            href="mailto:help@flyvixx.com"
                                            className="text-yellow-300 text-lg font-bold hover:text-yellow-200 transition-colors"
                                        >
                                            help@flyvixx.com
                                        </a>
                                    </div>
                                    <div className="bg-purple-500/20 rounded-lg p-3">
                                        <p className="text-purple-300 text-sm">
                                            <Info className="w-4 h-4 inline mr-1" />
                                            We typically respond within 24 hours
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-orange-300 font-semibold">Before contacting support:</p>
                                    <p className="text-orange-300 text-sm mt-1">
                                        Please check our guides below first. Most questions are answered in our comprehensive help sections.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Help Topics */}
                <section id="quick-help" className="mb-12">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <HelpCircle className="w-8 h-8 text-[#FFD700] mr-3" />
                            Quick Help Topics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <a href="#deposits" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <CreditCard className="w-8 h-8 text-green-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">How to Deposit</h3>
                                <p className="text-white/80 text-sm">Learn how to add funds to your account</p>
                            </a>

                            <a href="#withdrawals" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <ArrowUpCircle className="w-8 h-8 text-blue-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">How to Withdraw</h3>
                                <p className="text-white/80 text-sm">Get your winnings safely</p>
                            </a>

                            <a href="#gameplay" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <Lock className="w-8 h-8 text-purple-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">Gameplay Guide</h3>
                                <p className="text-white/80 text-sm">Master the Aviator game</p>
                            </a>

                            <a href="#portfolio" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <ArrowDownCircle className="w-8 h-8 text-yellow-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">Portfolio Management</h3>
                                <p className="text-white/80 text-sm">Lock funds and earn rewards</p>
                            </a>

                            <a href="#referrals" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <CheckCircle className="w-8 h-8 text-indigo-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">Referral System</h3>
                                <p className="text-white/80 text-sm">Build your network and level up</p>
                            </a>

                            <a href="#troubleshooting" className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors border border-white/20">
                                <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
                                <h3 className="text-lg font-semibold text-white mb-2">Troubleshooting</h3>
                                <p className="text-white/80 text-sm">Common issues and solutions</p>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Detailed Guides */}
                <section className="space-y-8">
                    {/* How to Deposit */}
                    <div id="deposits" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <CreditCard className="w-8 h-8 text-green-400 mr-3" />
                            How to Deposit Funds
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-green-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-300 mb-3">Step-by-Step Deposit Guide</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="text-white font-semibold">Log into your account</p>
                                            <p className="text-white/80 text-sm">Make sure you're signed in to access deposit features</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="text-white font-semibold">Go to Transactions</p>
                                            <p className="text-white/80 text-sm">Navigate to the transactions page from the main menu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="text-white font-semibold">Click "Deposit"</p>
                                            <p className="text-white/80 text-sm">Select the deposit option from the transactions menu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                                        <div>
                                            <p className="text-white font-semibold">Choose payment method</p>
                                            <p className="text-white/80 text-sm">Select from available payment options (bank transfer, crypto, etc.)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                                        <div>
                                            <p className="text-white font-semibold">Enter amount and confirm</p>
                                            <p className="text-white/80 text-sm">Enter the amount you want to deposit and complete the transaction</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Minimum Deposit</h4>
                                    <p className="text-white/90">$50 USD</p>
                                    <p className="text-white/60 text-sm">Required to start playing</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Processing Time</h4>
                                    <p className="text-white/90">Instant to 24 hours</p>
                                    <p className="text-white/60 text-sm">Depending on payment method</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Withdraw */}
                    <div id="withdrawals" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <ArrowUpCircle className="w-8 h-8 text-blue-400 mr-3" />
                            How to Withdraw Funds
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-300 mb-3">Step-by-Step Withdrawal Guide</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="text-white font-semibold">Ensure funds are available</p>
                                            <p className="text-white/80 text-sm">Check that you have sufficient balance for withdrawal</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="text-white font-semibold">Go to Transactions page</p>
                                            <p className="text-white/80 text-sm">Navigate to transactions from the main menu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="text-white font-semibold">Click "Withdraw"</p>
                                            <p className="text-white/80 text-sm">Select the withdrawal option</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                                        <div>
                                            <p className="text-white font-semibold">Enter withdrawal details</p>
                                            <p className="text-white/80 text-sm">Provide amount and payment method details</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                                        <div>
                                            <p className="text-white font-semibold">Complete verification</p>
                                            <p className="text-white/80 text-sm">Submit required documents if needed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">6</div>
                                        <div>
                                            <p className="text-white font-semibold">Wait for processing</p>
                                            <p className="text-white/80 text-sm">Withdrawals are processed within 24-48 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Minimum Withdrawal</h4>
                                    <p className="text-white/90">$25 USD</p>
                                    <p className="text-white/60 text-sm">Per withdrawal request</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Processing Time</h4>
                                    <p className="text-white/90">24-48 hours</p>
                                    <p className="text-white/60 text-sm">After approval</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Fees</h4>
                                    <p className="text-white/90">$5 USD</p>
                                    <p className="text-white/60 text-sm">Processing fee</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gameplay Guide */}
                    <div id="gameplay" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Lock className="w-8 h-8 text-purple-400 mr-3" />
                            Aviator Game Guide
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-purple-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-purple-300 mb-3">How the Aviator Game Works</h3>
                                <p className="text-white/90 mb-4">
                                    Aviator is a multiplier game where you bet on a plane that takes off and flies higher, increasing the multiplier. Cash out before the plane flies away to win!
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-2">Game Flow:</h4>
                                        <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                                            <li>Place your bet using flight power</li>
                                            <li>Watch the plane take off</li>
                                            <li>Multiplier increases as plane flies</li>
                                            <li>Cash out anytime before plane leaves</li>
                                            <li>Keep your winnings!</li>
                                        </ol>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-2">Safe Play Mode:</h4>
                                        <p className="text-white/80 text-sm">
                                            Automatically cash out at 1.0x multiplier. You get your flight power back plus a small profit, guaranteed!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Strategy Tips</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">Conservative Play:</h4>
                                        <p className="text-white/80 text-sm">Cash out between 1.5x - 3.0x for steady wins</p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">High Risk/High Reward:</h4>
                                        <p className="text-white/80 text-sm">Wait for 5.0x+ multipliers, but risk losing everything</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Management */}
                    <div id="portfolio" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <ArrowDownCircle className="w-8 h-8 text-yellow-400 mr-3" />
                            Portfolio Management Guide
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-yellow-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-yellow-300 mb-3">Locking Funds for Rewards</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                        <div>
                                            <p className="text-white font-semibold">Deposit funds</p>
                                            <p className="text-white/80 text-sm">Add money to your account first</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                        <div>
                                            <p className="text-white font-semibold">Go to Portfolio</p>
                                            <p className="text-white/80 text-sm">Click on your portfolio section</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                        <div>
                                            <p className="text-white font-semibold">Click "Lock Funds"</p>
                                            <p className="text-white/80 text-sm">Choose amount and duration (30 days)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                                        <div>
                                            <p className="text-white font-semibold">Start earning flight power</p>
                                            <p className="text-white/80 text-sm">Receive 1% daily as betting allowance</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-green-300 mb-3">Flight Power Benefits</h3>
                                <ul className="text-white/90 space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        Risk-free betting allowance
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        Daily gifts for more betting opportunities
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        100% capital preservation guarantee
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                        Unlimited upside potential from Aviator wins
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Referral System */}
                    <div id="referrals" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <CheckCircle className="w-8 h-8 text-indigo-400 mr-3" />
                            Referral System Guide
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-indigo-500/20 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-indigo-300 mb-3">How Referrals Work</h3>
                                <p className="text-white/90 mb-4">
                                    Build your referral network to increase your level and unlock more daily gifts. Higher levels = more betting opportunities = more earning potential.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-2">Level Progression:</h4>
                                        <ul className="text-white/80 text-sm space-y-1">
                                            <li>• 0-4 referrals = Level 1 (2 gifts)</li>
                                            <li>• 5+ referrals = Level 2 (4 gifts)</li>
                                            <li>• 10+ referrals = Level 3 (6 gifts)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-2">How to Refer:</h4>
                                        <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
                                            <li>Share your referral link</li>
                                            <li>Friends sign up and lock funds</li>
                                            <li>You automatically level up</li>
                                            <li>Get more daily gifts</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    <div id="troubleshooting" className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <AlertTriangle className="w-8 h-8 text-red-400 mr-3" />
                            Troubleshooting
                        </h2>

                        <div className="space-y-4">
                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Deposit not showing up?</h3>
                                <p className="text-white/90 mb-2">
                                    Deposits typically appear instantly, but some payment methods may take up to 24 hours. Contact support if it's been longer than 24 hours.
                                </p>
                                <p className="text-blue-300 text-sm">💡 Check your transaction history for status updates</p>
                            </div>

                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Can't place bets?</h3>
                                <p className="text-white/90 mb-2">
                                    Make sure you have locked funds and available flight power. You need at least some flight power to place bets.
                                </p>
                                <p className="text-blue-300 text-sm">💡 Lock funds in your portfolio to earn daily flight power</p>
                            </div>

                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Game not loading?</h3>
                                <p className="text-white/90 mb-2">
                                    Try refreshing the page or clearing your browser cache. If the issue persists, contact support.
                                </p>
                                <p className="text-blue-300 text-sm">💡 Make sure you have a stable internet connection</p>
                            </div>

                            <div className="border-b border-white/20 pb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Withdrawal taking too long?</h3>
                                <p className="text-white/90 mb-2">
                                    Standard processing time is 24-48 hours. Large withdrawals may require additional verification.
                                </p>
                                <p className="text-blue-300 text-sm">💡 Check your email for any verification requests</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Account verification issues?</h3>
                                <p className="text-white/90 mb-2">
                                    Make sure all documents are clear and readable. Contact support if your verification is rejected.
                                </p>
                                <p className="text-blue-300 text-sm">💡 Use a well-lit photo with good resolution</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="text-center mt-12">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#E6C200] rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-[#004B49] mb-4">Still Need Help?</h2>
                        <p className="text-[#004B49]/80 mb-6 text-lg">
                            Our support team is ready to help you succeed with FLYVIXX.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/"
                                className="bg-[#004B49] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#00695C] transition-colors"
                            >
                                Start Playing Now
                            </a>
                            <a
                                href="mailto:help@flyvixx.com"
                                className="bg-white/20 text-[#004B49] px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors"
                            >
                                Email Support
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SimpleFooter />
        </div>
    );
}
import Link from 'next/link';
import { Mail, MessageCircle, Shield, Users, TrendingUp } from 'lucide-react';

export default function SimpleFooter() {
    return (
        <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
                            <img
                                src="/logo.svg"
                                alt="FLYVIXX Logo"
                                className="h-8 w-auto"
                            />
                            <span className="text-white font-bold text-xl">FLYVIXX</span>
                        </Link>
                        <p className="text-white/70 text-sm mb-6 max-w-md">
                            Revolutionizing strategic gaming with capital preservation and community-driven growth.
                            Join thousands of players building wealth through smart gaming.
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-white/60">
                                <Shield className="w-4 h-4 text-green-400" />
                                <span className="text-xs">100% Safe</span>
                            </div>
                            <div className="flex items-center space-x-2 text-white/60">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span className="text-xs">Community First</span>
                            </div>
                            <div className="flex items-center space-x-2 text-white/60">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-xs">Growing Network</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-white/70 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/how-it-works" className="text-white/70 hover:text-white transition-colors text-sm">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/referrals" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Referral Program
                                </Link>
                            </li>
                            <li>
                                <Link href="/help-center" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:help@flyvixx.com"
                                    className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-sm"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>help@flyvixx.com</span>
                                </a>
                            </li>
                            <li>
                                <div className="flex items-center space-x-2 text-white/70 text-sm">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>24/7 Live Chat</span>
                                </div>
                            </li>
                            <li>
                                <Link href="/support" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Support Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/transactions" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Transactions
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-white/60 text-sm mb-4 md:mb-0">
                            © {new Date().getFullYear()} FLYVIXX. All rights reserved.
                        </div>
                        <div className="flex items-center space-x-6 text-white/60 text-sm">
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/support" className="hover:text-white transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-white/40 text-xs">
                            Risk-free gaming through innovative capital preservation technology.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
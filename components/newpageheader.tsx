'use client';

import { useState } from 'react';
import { Menu, X, Home } from 'lucide-react';
import Link from 'next/link';

export default function NewPageHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const navItems = [
        { href: '/about', label: 'About' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/referrals', label: 'Referrals' },
        { href: '/help-center', label: 'Help Center' },
    ];

    return (
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo - Left */}
                    <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.svg"
                            alt="FLYVIXX Logo"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-white/90 hover:text-white transition-colors font-medium relative group"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFD700] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Home Button - Right */}
                    <div className="hidden md:flex">
                        <Link
                            href="/"
                            className="bg-[#FFD700] text-[#004B49] px-6 py-2 rounded-lg font-semibold hover:bg-[#E6C200] transition-colors"
                        >
                            Home
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMenu}
                                    className="text-white/90 hover:text-white transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white/10"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="pt-2 border-t border-white/20">
                                <Link
                                    href="/"
                                    onClick={closeMenu}
                                    className="bg-[#FFD700] text-[#004B49] px-6 py-3 rounded-lg font-semibold hover:bg-[#E6C200] transition-colors flex items-center justify-center w-full"
                                >
                                    Home
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
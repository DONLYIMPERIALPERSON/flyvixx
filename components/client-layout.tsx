'use client';

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import LenisScroll from "@/components/lenis";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import LoginModal from "@/components/login-modal";
import { useAuth } from "@/components/login-modal";
import PWARegister from "@/components/pwa-register";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    const { isAuthenticated } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <PWARegister />
            {pathname !== '/' && pathname !== '/transactions' && pathname !== '/support' && pathname !== '/fly' && <Navbar />}
            <LenisScroll />
            {children}
            <BottomNav
                isLoggedIn={isAuthenticated}
                onOpenLogin={() => setShowLoginModal(true)}
                onLogin={() => {}} // Handled by Descope session
            />
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={() => setShowLoginModal(false)} // Handled by Descope session
            />
            {pathname !== '/' && pathname !== '/transactions' && pathname !== '/support' && pathname !== '/fly' && <Footer />}
        </>
    );
}

'use client';

import { useState } from "react";
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

    const isAdminPage = pathname.startsWith('/admin');
    // Show bottom-nav for main pages (fly page needs it for navigation)
    const showBottomNav = pathname === '/' || pathname === '/transactions' || pathname === '/support' || pathname === '/fly';

    return (
        <>
            <PWARegister />
            <LenisScroll />
            {children}
            {showBottomNav && !isAdminPage && (
                <BottomNav
                    isLoggedIn={isAuthenticated}
                    onOpenLogin={() => setShowLoginModal(true)}
                    onLogin={() => {}} // Handled by Descope session
                />
            )}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={() => setShowLoginModal(false)} // Handled by Descope session
            />
        </>
    );
}

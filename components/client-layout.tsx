'use client';

import { useState, useEffect } from "react";
import LenisScroll from "@/components/lenis";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import LoginModal from "@/components/login-modal";
import { useAuth } from "@/components/login-modal";
import PWARegister from "@/components/pwa-register";
import DesktopError from "@/components/desktop-error";

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

    // Check if this is a mobile-only page that should show desktop error
    const isMobileOnlyPage = pathname === '/' || pathname === '/fly' || pathname === '/transactions' || pathname === '/support';

    // For mobile-only pages, check if user is on desktop
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        if (!isMobileOnlyPage) return;

        const checkDevice = () => {
            const isDesktopScreen = window.innerWidth > 768;
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            setIsDesktop(isDesktopScreen && !isMobileUA);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, [isMobileOnlyPage]);

    return (
        <>
            <PWARegister />
            <LenisScroll />
            {isMobileOnlyPage && isDesktop ? (
                <DesktopError />
            ) : (
                children
            )}
            {/* Show bottom nav only for mobile users on mobile-only pages */}
            {showBottomNav && !isAdminPage && (!isMobileOnlyPage || !isDesktop) && (
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
